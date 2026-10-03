import {
  GemmaMultimodalExtraction,
  KnowledgeGraph,
  DiagnosticQuestion,
  SemanticEvaluation,
  LearningGapMap,
  SourceConflict,
  StructuredLessonPlan,
  StructuredEditPlan
} from '@learnlens/schemas';
import { AIProvider } from '../types.js';
import { DemoProvider } from './demo.js';

export interface OpenWeightConfig {
  apiBase?: string; // e.g. http://localhost:11434/v1 or https://openrouter.ai/api/v1
  apiKey?: string;
  model?: string;   // e.g. 'deepseek-ai/DeepSeek-R1', 'Qwen/Qwen2.5-Coder-32B-Instruct', 'google/gemma-4-31B-it'
}

export class OpenWeightProvider implements AIProvider {
  name = 'Open-Source AI Reasoning Layer';
  category = 'open_weight_reasoning' as const;
  modelId: string;
  private apiBase: string;
  private apiKey: string;
  private fallbackDemo: DemoProvider;

  constructor(config: OpenWeightConfig = {}) {
    this.apiBase = config.apiBase || process.env.OPEN_SOURCE_API_BASE || 'http://localhost:11434/v1';
    this.apiKey = config.apiKey || process.env.OPEN_SOURCE_API_KEY || 'ollama';
    this.modelId = config.model || process.env.OPEN_SOURCE_MODEL || 'deepseek-ai/DeepSeek-R1';
    this.fallbackDemo = new DemoProvider();
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiBase}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(1500)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async callOpenWeightChat(systemPrompt: string, userPrompt: string): Promise<string | null> {
    try {
      const res = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!res.ok) return null;
      const data = await res.json() as any;
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  }

  async extractMultimodalContent(source: {
    id: string;
    title: string;
    type: string;
    text?: string;
    mediaUrl?: string;
  }): Promise<GemmaMultimodalExtraction> {
    // Delegated to Gemma 4 provider in full pipeline
    return this.fallbackDemo.extractMultimodalContent(source);
  }

  async synthesizeKnowledgeGraph(sources: any[], spaceTitle: string): Promise<KnowledgeGraph> {
    const raw = await this.callOpenWeightChat(
      'You are the Open-Source AI Reasoning Layer of LearnLens. Synthesize a connected knowledge graph from multimodal concepts. Return valid JSON matching the KnowledgeGraph schema.',
      JSON.stringify({ spaceTitle, sourcesSummary: sources.map((s: any) => ({ id: s.id, title: s.title, type: s.type })) })
    );

    if (raw) {
      try {
        const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '');
        if (json.nodes && json.edges) return json;
      } catch {}
    }

    return this.fallbackDemo.synthesizeKnowledgeGraph(sources, spaceTitle);
  }

  async detectSourceConflicts(sources: any[], concepts: any[]): Promise<SourceConflict[]> {
    return this.fallbackDemo.detectSourceConflicts(sources, concepts);
  }

  async analyzeLearningGaps(concepts: any[], sources: any[], examSyllabus?: string): Promise<LearningGapMap> {
    return this.fallbackDemo.analyzeLearningGaps(concepts, sources, examSyllabus);
  }

  async generateDiagnosticQuestions(conceptId: string, conceptName: string, difficulty?: string): Promise<DiagnosticQuestion[]> {
    return this.fallbackDemo.generateDiagnosticQuestions(conceptId, conceptName, difficulty);
  }

  async evaluateDiagnosticAnswer(question: DiagnosticQuestion, studentAnswer: string, currentMastery?: number): Promise<SemanticEvaluation> {
    const raw = await this.callOpenWeightChat(
      'You are an expert pedagogical semantic reasoning engine. Evaluate the student response for misconceptions. Return JSON with understood, partiallyUnderstood, misconceptions, hasMisconception, semanticAnalysisRationale, correctiveInsight, masteryScoreDelta, newMasteryScore.',
      JSON.stringify({ question, studentAnswer, currentMastery })
    );

    if (raw) {
      try {
        const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || '');
        if (json.understood && json.misconceptions) return json;
      } catch {}
    }

    return this.fallbackDemo.evaluateDiagnosticAnswer(question, studentAnswer, currentMastery);
  }

  async generateVisualLessonPlan(conceptId: string, conceptName: string, targetMisconception?: string, targetDuration?: number): Promise<StructuredLessonPlan> {
    return this.fallbackDemo.generateVisualLessonPlan(conceptId, conceptName, targetMisconception, targetDuration);
  }

  async interpretNaturalLanguageEdit(currentLesson: StructuredLessonPlan, editRequest: string): Promise<StructuredEditPlan> {
    return this.fallbackDemo.interpretNaturalLanguageEdit(currentLesson, editRequest);
  }
}
