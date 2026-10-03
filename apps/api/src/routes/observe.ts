/**
 * Multimodal Observe & Diagnostic Endpoint
 * Handles Universal Input System routing and SkillTrace Engine evaluations.
 */
import { Router, Request, Response } from 'express';
import { InputRouter, NormalizedEvidence } from '../services/inputRouter.js';
import { SkillTraceEngine } from '../services/skillTrace.js';
import { SkillTraceInputPayload } from '@learnlens/schemas';
import { GemmaService } from '../services/ai/gemma.js';

export const observeRouter = Router();

observeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      message,
      task_objective,
      execution_logs,
      current_state,
      attempt_count,
      attachments = [] // Array of { name, type, content, metadata }
    } = req.body;

    // 1. Process all attached inputs through the Universal Input Router
    const normalizedEvidenceList: NormalizedEvidence[] = attachments.map((att: any) =>
      InputRouter.normalizeInput({
        name: att.name,
        type: att.type,
        content: att.content || '',
        metadata: att.metadata
      })
    );

    // If message contains code, SQL, or URLs, extract inline evidence
    if (message && (!current_state || current_state.length === 0)) {
      if (message.includes('SELECT ') || message.includes('CREATE TABLE') || message.includes('def ') || message.includes('function ')) {
        normalizedEvidenceList.push(
          InputRouter.normalizeInput({
            name: 'Pasted Snippet in Chat',
            type: 'code',
            content: message
          })
        );
      }
    }

    // 2. Multimodal Routing:
    // Route visual media (images, diagrams, video frames) to Gemma 4
    for (const evidence of normalizedEvidenceList) {
      if (evidence.type === 'image' || evidence.type === 'video') {
        try {
          const gemmaResult = await GemmaService.analyzeMultimodalSource({
            id: evidence.sourceId,
            title: evidence.name,
            type: evidence.type,
            text: evidence.originalPayload
          });

          // Enrich evidence with Gemma 4 visual regions & coordinate anchors
          if (gemmaResult.visualRegions && gemmaResult.visualRegions.length > 0) {
            evidence.metadata.regions = gemmaResult.visualRegions.map(vr => ({
              id: vr.id,
              box2d: vr.box2d,
              label: vr.label
            }));
            evidence.evidenceReferences.push(...gemmaResult.visualRegions.map(vr => `${vr.label} [${vr.box2d.join(',')}]`));
          }
        } catch (gemmaErr) {
          console.warn('[ObserveRoute] Gemma 4 visual routing warning:', gemmaErr);
        }
      }
    }

    // 3. Assemble SkillTrace Input Payload
    const resolvedState = current_state ||
      normalizedEvidenceList.find(e => e.type === 'code')?.originalPayload ||
      message ||
      'No state provided';

    const skillTracePayload: SkillTraceInputPayload = {
      task_objective: task_objective || 'Relational Schema Normalization and Anomaly Elimination',
      execution_logs: execution_logs || 'Compile check completed with semantic warnings.',
      current_state: resolvedState,
      attempt_count: attempt_count || 1,
      media_type: normalizedEvidenceList.some(e => e.type === 'image') ? 'image' : 'code'
    };

    // 4. Run SkillTrace Diagnostic Supervisor
    const skillTraceOutput = await SkillTraceEngine.evaluateAttempt(skillTracePayload, normalizedEvidenceList);

    // 5. Construct Chat-First Concise Response (Never outputting final solution)
    let chatResponse = '';
    if (skillTraceOutput.status === 'PASS') {
      chatResponse = `Great work! Your current attempt satisfies the task objective without any detected dependency violations.`;
    } else {
      const breakpoint = skillTraceOutput.diagnostic.breakpoint_target;
      const question = skillTraceOutput.scaffolding.guided_question;
      chatResponse = `I noticed a potential issue at **${breakpoint}** (${skillTraceOutput.diagnostic.misconception_type}).\n\n${question}`;
    }

    // 6. Right Context Panel Metadata (Coordinates for images, line numbers for code)
    const contextPanel = {
      activeType: normalizedEvidenceList[0]?.type || 'code',
      breakpointTarget: skillTraceOutput.diagnostic.breakpoint_target,
      highlightRegions: normalizedEvidenceList.find(e => e.type === 'image')?.metadata.regions || [],
      evidenceCitations: normalizedEvidenceList.flatMap(e => e.evidenceReferences),
      scaffoldingLevel: skillTraceOutput.scaffolding.level
    };

    return res.json({
      success: true,
      chatResponse,
      skilltrace: skillTraceOutput,
      evidence: normalizedEvidenceList,
      contextPanel
    });
  } catch (err: any) {
    console.error('[ObserveRoute] Error processing multimodal attempt:', err);
    return res.status(500).json({ error: err.message || 'Observation failed' });
  }
});
