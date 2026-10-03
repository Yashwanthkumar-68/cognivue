import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  SourceDocument,
  KnowledgeGraph,
  LearningGapMap,
  SourceConflict,
  DiagnosticQuestion,
  SemanticEvaluation,
  StructuredLessonPlan,
  StructuredEditPlan,
  LearningTwin
} from '@learnlens/schemas';
import { DemoProvider, GemmaProvider, OpenWeightProvider } from '@learnlens/ai-core';
import { EditValidator, LessonHistoryManager } from '@learnlens/lesson-engine';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 4000;

// Initialize providers
const demoProvider = new DemoProvider();
const gemmaProvider = new GemmaProvider({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMMA_MODEL || 'google/gemma-4-31B-it'
});
const openWeightProvider = new OpenWeightProvider({
  apiBase: process.env.OPEN_SOURCE_API_BASE || 'http://localhost:11434/v1',
  apiKey: process.env.OPEN_SOURCE_API_KEY || 'ollama',
  model: process.env.OPEN_SOURCE_MODEL || 'deepseek-ai/DeepSeek-R1'
});

let currentProviderMode: 'demo' | 'gemma' | 'openweight' | 'hybrid' =
  (process.env.AI_PROVIDER as any) || 'hybrid';

function getActiveReasoningProvider() {
  if (currentProviderMode === 'hybrid' || currentProviderMode === 'openweight') {
    return openWeightProvider;
  }
  if (currentProviderMode === 'gemma') return gemmaProvider;
  return demoProvider;
}

function getActiveMultimodalProvider() {
  if (currentProviderMode === 'hybrid' || currentProviderMode === 'gemma') {
    return gemmaProvider;
  }
  return demoProvider;
}

// In-Memory store for spaces and learning twins
interface SpaceState {
  space: {
    id: string;
    title: string;
    description: string;
    learningGoal: string;
    createdAt: string;
  };
  sources: SourceDocument[];
  extractions: Record<string, any>;
  knowledgeGraph?: KnowledgeGraph;
  conflicts: SourceConflict[];
  gaps?: LearningGapMap;
  diagnostics: DiagnosticQuestion[];
  assessments: SemanticEvaluation[];
  lessonPlan?: StructuredLessonPlan;
  proposedEdit?: StructuredEditPlan;
  historyManager: LessonHistoryManager;
  twin: LearningTwin;
}

const spacesStore = new Map<string, SpaceState>();

// Bootstrap the benchmark demo space
function initDemoSpace(): SpaceState {
  const spaceId = 'space_dbms_demo';

  const demoSources: SourceDocument[] = [
    {
      id: 'src_tb',
      spaceId,
      title: 'DBMS Textbook Chapter 8 (Silberschatz & Korth)',
      type: 'pdf',
      originalFilename: 'Silberschatz_DBMS_Ch8_Normalization.pdf',
      summary: 'Foundations of relational database design, Boyce-Codd Normal Form, and lossless-join decompositions.',
      pageOrSlideCount: 38,
      extractedAt: new Date().toISOString(),
      metadata: { author: 'Silberschatz, Korth, Sudarshan', edition: '7th Edition' },
      visualRegions: [
        {
          id: 'vr_tb_1',
          box2d: [100, 50, 450, 950],
          label: 'Anomalies Table: Insert, Update, Delete',
          confidence: 0.94,
          interpretation: 'Comparison matrix showing how un-normalized relations create data inconsistencies.'
        }
      ]
    },
    {
      id: 'src_slides',
      spaceId,
      title: 'Prof. Vance Lecture 14 Slides (Relational Normalization)',
      type: 'pptx',
      originalFilename: 'CS4400_Lecture14_Normalization_Vance.pptx',
      summary: 'Classroom slide deck detailing 1NF, 2NF, 3NF, and trade-offs of dependency preservation vs BCNF.',
      pageOrSlideCount: 42,
      extractedAt: new Date().toISOString(),
      metadata: { course: 'CS4400 Database Systems', term: 'Spring 2026' },
      visualRegions: [
        {
          id: 'vr_slide_14',
          box2d: [150, 80, 820, 920],
          label: 'Slide 14: Partial vs Full Functional Dependency',
          confidence: 0.96,
          interpretation: 'Visual diagram contrasting composite key subset dependencies with full key dependencies.'
        },
        {
          id: 'vr_slide_22',
          box2d: [100, 60, 900, 940],
          label: 'Slide 22: 3NF Dependency Preservation Theorem',
          confidence: 0.93,
          interpretation: 'Emphasizes that 3NF preserves all functional dependencies without cross-table SQL assertions.'
        }
      ]
    },
    {
      id: 'src_notes',
      spaceId,
      title: 'Handwritten Relational Derivation Notes',
      type: 'handwritten',
      originalFilename: 'Student_Notes_Normalization_Derivations.png',
      summary: 'Handwritten working of relational decomposition algorithm. Student circled Transitive Dependency with a question mark.',
      extractedAt: new Date().toISOString(),
      metadata: { student: 'Alex M.', subject: 'DBMS' },
      visualRegions: [
        {
          id: 'vr_hw_1',
          box2d: [120, 80, 480, 920],
          label: 'Handwritten Derivation: 2NF vs 3NF',
          confidence: 0.96,
          interpretation: 'Step-by-step notes comparing relational decomposition algorithms. Student has circled Transitive Dependency with a question mark.'
        },
        {
          id: 'vr_hw_2',
          box2d: [510, 100, 880, 900],
          label: 'Questionable Deductive Step',
          confidence: 0.89,
          interpretation: 'Student incorrectly wrote "If A->B is partial, B->C is transitive, therefore partial implies transitive". Detected cognitive conflation.'
        }
      ]
    },
    {
      id: 'src_er',
      spaceId,
      title: 'E-Commerce Core Schema ER Diagram',
      type: 'diagram',
      originalFilename: 'ecommerce_schema_er_model.png',
      summary: 'Visual ER diagram showing Customer, Orders, OrderItems, Products and cardinality constraints.',
      extractedAt: new Date().toISOString(),
      metadata: { schema: 'Production Online Store' },
      visualRegions: [
        {
          id: 'vr_er_1',
          box2d: [50, 60, 420, 450],
          label: 'Entity: Customer [CustomerID (PK), Name, Email]',
          confidence: 0.99,
          interpretation: 'Strong entity representing customer account records.'
        },
        {
          id: 'vr_er_2',
          box2d: [50, 550, 420, 940],
          label: 'Entity: Orders [OrderID (PK), OrderDate, Total]',
          confidence: 0.98,
          interpretation: 'Order entity with 1:N participation from Customer.'
        }
      ]
    },
    {
      id: 'src_exam',
      spaceId,
      title: '2024 University End-Sem DBMS Exam Paper',
      type: 'question_paper',
      originalFilename: 'DBMS_Final_Exam_2024.pdf',
      summary: 'University exam questions featuring 10-mark decomposition problem to 3NF/BCNF and lossless join proofs.',
      pageOrSlideCount: 6,
      extractedAt: new Date().toISOString(),
      metadata: { university: 'Computer Science Department', marks: 100 },
      visualRegions: []
    },
    {
      id: 'src_sql',
      spaceId,
      title: 'Production SQL Duplicate Anomaly Snippet',
      type: 'code',
      originalFilename: 'anomalous_orders_report.sql',
      summary: 'SQL script illustrating redundant data rows and update inconsistencies caused by an un-normalized schema.',
      extractedAt: new Date().toISOString(),
      metadata: { dialect: 'PostgreSQL 16' },
      visualRegions: []
    }
  ];

  const twin: LearningTwin = {
    studentId: 'student_alex',
    spaceId,
    overallMastery: 0.62,
    overallConfidence: 0.58,
    conceptsMasteredCount: 4,
    conceptsWeakCount: 2,
    activeMisconceptionsCount: 1,
    conceptStates: {
      c_dbms_root: {
        conceptId: 'c_dbms_root',
        conceptName: 'Database Management Systems',
        mastery: 0.95,
        confidence: 0.98,
        misconceptions: [],
        evidence: ['src_tb'],
        recommendedNext: 'c_er_model'
      },
      c_er_model: {
        conceptId: 'c_er_model',
        conceptName: 'ER Model',
        mastery: 0.90,
        confidence: 0.95,
        misconceptions: [],
        evidence: ['src_er'],
        recommendedNext: 'c_rel_model'
      },
      c_rel_model: {
        conceptId: 'c_rel_model',
        conceptName: 'Relational Model',
        mastery: 0.88,
        confidence: 0.92,
        misconceptions: [],
        evidence: ['src_tb'],
        recommendedNext: 'c_fd'
      },
      c_fd: {
        conceptId: 'c_fd',
        conceptName: 'Functional Dependency',
        mastery: 0.82,
        confidence: 0.85,
        misconceptions: [],
        evidence: ['src_tb'],
        recommendedNext: 'c_2nf'
      },
      c_1nf: {
        conceptId: 'c_1nf',
        conceptName: '1NF (First Normal Form)',
        mastery: 0.92,
        confidence: 0.95,
        misconceptions: [],
        evidence: ['src_slides'],
        recommendedNext: 'c_2nf'
      },
      c_2nf: {
        conceptId: 'c_2nf',
        conceptName: '2NF (Second Normal Form)',
        mastery: 0.58,
        confidence: 0.55,
        misconceptions: ['Partial key dependency confusion'],
        evidence: ['src_notes', 'src_slides'],
        recommendedNext: 'c_3nf'
      },
      c_3nf: {
        conceptId: 'c_3nf',
        conceptName: '3NF (Third Normal Form)',
        mastery: 0.52,
        confidence: 0.50,
        misconceptions: ['Confusing partial dependency with transitive dependency'],
        evidence: ['src_notes', 'src_slides', 'src_tb'],
        recommendedNext: 'Transitive dependency decomposition visual lesson'
      },
      c_bcnf: {
        conceptId: 'c_bcnf',
        conceptName: 'BCNF (Boyce-Codd Normal Form)',
        mastery: 0.15,
        confidence: 0.20,
        misconceptions: [],
        evidence: ['src_tb'],
        recommendedNext: 'Superkey condition review'
      },
      c_lossless: {
        conceptId: 'c_lossless',
        conceptName: 'Lossless Decomposition',
        mastery: 0.10,
        confidence: 0.15,
        misconceptions: [],
        evidence: ['src_exam'],
        recommendedNext: 'Intersection closure theorem'
      }
    },
    activeMisconceptions: [
      {
        id: 'misc_transitive_vs_partial',
        conceptId: 'c_3nf',
        conceptName: '3NF (Third Normal Form)',
        misconceptionDescription: 'Confusing 2NF partial key dependency with 3NF transitive dependency in single-attribute candidate key schemas.',
        detectedAt: new Date().toISOString(),
        status: 'active'
      }
    ],
    recentAssessments: [
      {
        id: 'ass_init_1',
        conceptName: '3NF (Third Normal Form)',
        scoreDelta: -0.15,
        timestamp: new Date().toISOString()
      }
    ],
    recommendedNextStep: {
      conceptId: 'c_3nf',
      conceptName: '3NF (Third Normal Form)',
      actionType: 'visual_lesson',
      headline: 'Watch Targeted 45-Second Visual Lesson: Transitive vs Partial Dependency',
      reason: 'Your diagnostic answer revealed you are confusing 2NF partial key dependencies with 3NF transitive dependencies. This 45s lesson uses your own handwritten notes to show the visual divergence.'
    },
    lastUpdatedAt: new Date().toISOString()
  };

  const state: SpaceState = {
    space: {
      id: spaceId,
      title: 'DBMS — Final Exam Preparation',
      description: 'Comprehensive exam preparation studio integrating textbook theory, lecture slides, student handwritten derivations, ER diagrams, and university past papers.',
      learningGoal: 'Master Relational Normalization, eliminate misconceptions around 3NF/BCNF, and achieve 90%+ in the Final Exam.',
      createdAt: new Date().toISOString()
    },
    sources: demoSources,
    extractions: {},
    conflicts: [],
    diagnostics: [],
    assessments: [],
    historyManager: new LessonHistoryManager(),
    twin
  };

  spacesStore.set(spaceId, state);
  return state;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    currentProviderMode,
    models: {
      gemma: 'google/gemma-4-31B-it',
      openWeight: process.env.OPEN_SOURCE_MODEL || 'deepseek-ai/DeepSeek-R1',
      elahEditorSdk: '@elah/editor 0.6.0'
    }
  });
});

// Provider toggle
app.post('/api/provider/switch', (req: Request, res: Response) => {
  const { mode } = req.body;
  if (mode === 'demo' || mode === 'gemma' || mode === 'openweight' || mode === 'hybrid') {
    currentProviderMode = mode;
    return res.json({ success: true, activeProvider: mode });
  }
  res.status(400).json({ error: 'Invalid provider mode. Choose demo, gemma, openweight, or hybrid.' });
});

// 1-Click Bootstrap for DBMS Hackathon Benchmark
app.get('/api/demo/dbms', async (req: Request, res: Response) => {
  try {
    let state = spacesStore.get('space_dbms_demo');
    if (!state) {
      state = initDemoSpace();
    }

    // Synthesize knowledge graph, conflicts, gaps, diagnostics, and lesson plan
    const reasoning = getActiveReasoningProvider();
    const multimodal = getActiveMultimodalProvider();

    // 1. Multimodal extractions
    for (const src of state.sources) {
      if (!state.extractions[src.id]) {
        state.extractions[src.id] = await multimodal.extractMultimodalContent(src);
      }
    }

    // 2. Knowledge Graph
    if (!state.knowledgeGraph) {
      state.knowledgeGraph = await reasoning.synthesizeKnowledgeGraph(state.sources, state.space.title);
    }

    // 3. Source Conflict Detection
    if (state.conflicts.length === 0) {
      state.conflicts = await reasoning.detectSourceConflicts(state.sources, state.knowledgeGraph.nodes);
    }

    // 4. Learning Gap Map
    if (!state.gaps) {
      state.gaps = await reasoning.analyzeLearningGaps(state.knowledgeGraph.nodes, state.sources);
    }

    // 5. Diagnostics
    if (state.diagnostics.length === 0) {
      state.diagnostics = await reasoning.generateDiagnosticQuestions('c_3nf', '3NF (Third Normal Form)');
    }

    // 6. Lesson Plan
    if (!state.lessonPlan) {
      const plan = await reasoning.generateVisualLessonPlan('c_3nf', '3NF (Third Normal Form)');
      state.lessonPlan = plan;
      state.historyManager = new LessonHistoryManager(plan);
    }

    res.json({
      success: true,
      space: state.space,
      sources: state.sources,
      extractions: state.extractions,
      knowledgeGraph: state.knowledgeGraph,
      conflicts: state.conflicts,
      gaps: state.gaps,
      diagnostics: state.diagnostics,
      lessonPlan: state.lessonPlan,
      twin: state.twin
    });
  } catch (err: any) {
    console.error('Error bootstrapping DBMS demo:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize demo' });
  }
});

// Spaces List & Create
app.get('/api/spaces', (req: Request, res: Response) => {
  const spaces = Array.from(spacesStore.values()).map(s => ({
    ...s.space,
    sourceCount: s.sources.length,
    conceptCount: s.knowledgeGraph?.nodes.length || 0,
    overallMastery: s.twin.overallMastery
  }));
  res.json({ spaces });
});

app.post('/api/spaces', (req: Request, res: Response) => {
  const { title, description, learningGoal } = req.body;
  const spaceId = 'space_' + Date.now();
  const newState: SpaceState = {
    space: {
      id: spaceId,
      title: title || 'New Learning Space',
      description: description || '',
      learningGoal: learningGoal || 'Master uploaded topics',
      createdAt: new Date().toISOString()
    },
    sources: [],
    extractions: {},
    conflicts: [],
    diagnostics: [],
    assessments: [],
    historyManager: new LessonHistoryManager(),
    twin: {
      studentId: 'student_current',
      spaceId,
      overallMastery: 0.1,
      overallConfidence: 0.2,
      conceptsMasteredCount: 0,
      conceptsWeakCount: 0,
      activeMisconceptionsCount: 0,
      conceptStates: {},
      activeMisconceptions: [],
      recentAssessments: [],
      recommendedNextStep: {
        conceptId: '',
        conceptName: '',
        actionType: 'diagnostic_quiz',
        headline: 'Upload sources and run multimodal analysis',
        reason: 'Start by providing learning materials.'
      },
      lastUpdatedAt: new Date().toISOString()
    }
  };
  spacesStore.set(spaceId, newState);
  res.json({ space: newState.space });
});

app.get('/api/spaces/:id', (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });
  res.json({
    space: state.space,
    sources: state.sources,
    extractions: state.extractions,
    knowledgeGraph: state.knowledgeGraph,
    conflicts: state.conflicts,
    gaps: state.gaps,
    diagnostics: state.diagnostics,
    lessonPlan: state.lessonPlan,
    twin: state.twin
  });
});

// Sources: Add source
app.post('/api/spaces/:id/sources', async (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });

  const { title, type, originalFilename, rawText, url } = req.body;
  const newSource: SourceDocument = {
    id: 'src_' + Date.now(),
    spaceId: state.space.id,
    title: title || 'Untitled Source',
    type: type || 'plaintext',
    originalFilename: originalFilename || 'source.txt',
    rawText: rawText || '',
    url,
    visualRegions: [],
    extractedAt: new Date().toISOString(),
    metadata: {}
  };

  state.sources.push(newSource);
  res.json({ source: newSource });
});

// Gemma 4 Multimodal Analysis endpoint
app.post('/api/spaces/:id/analyze', async (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });

  try {
    const multimodal = getActiveMultimodalProvider();
    for (const src of state.sources) {
      state.extractions[src.id] = await multimodal.extractMultimodalContent(src);
    }
    res.json({ success: true, extractions: state.extractions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Synthesize Knowledge Graph via Open-Source AI Reasoning Layer
app.post('/api/spaces/:id/synthesize-knowledge', async (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });

  try {
    const reasoning = getActiveReasoningProvider();
    state.knowledgeGraph = await reasoning.synthesizeKnowledgeGraph(state.sources, state.space.title);
    state.conflicts = await reasoning.detectSourceConflicts(state.sources, state.knowledgeGraph.nodes);
    state.gaps = await reasoning.analyzeLearningGaps(state.knowledgeGraph.nodes, state.sources);
    state.diagnostics = await reasoning.generateDiagnosticQuestions(
      state.knowledgeGraph.nodes[0]?.id || 'c_root',
      state.knowledgeGraph.nodes[0]?.name || 'Core Concept'
    );

    res.json({
      success: true,
      knowledgeGraph: state.knowledgeGraph,
      conflicts: state.conflicts,
      gaps: state.gaps,
      diagnostics: state.diagnostics
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Misconception Engine: Semantic Answer Assessment
app.post('/api/spaces/:id/assess', async (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });

  const { questionId, studentAnswer } = req.body;
  const question = state.diagnostics.find(q => q.id === questionId) || state.diagnostics[0];

  if (!question) {
    return res.status(400).json({ error: 'Question not found' });
  }

  try {
    const reasoning = getActiveReasoningProvider();
    const currentConceptState = state.twin.conceptStates[question.conceptId];
    const currentMastery = currentConceptState?.mastery ?? 0.5;

    const evaluation = await reasoning.evaluateDiagnosticAnswer(question, studentAnswer, currentMastery);
    state.assessments.push(evaluation);

    // Update Student Learning Twin
    if (evaluation.hasMisconception) {
      for (const misc of evaluation.misconceptions) {
        if (!state.twin.activeMisconceptions.some(m => m.misconceptionDescription === misc)) {
          state.twin.activeMisconceptions.push({
            id: 'misc_' + Date.now(),
            conceptId: question.conceptId,
            conceptName: question.conceptName,
            misconceptionDescription: misc,
            detectedAt: new Date().toISOString(),
            status: 'active'
          });
        }
      }
    }

    if (state.twin.conceptStates[question.conceptId]) {
      state.twin.conceptStates[question.conceptId].mastery = evaluation.newMasteryScore;
      state.twin.conceptStates[question.conceptId].lastAssessedAt = new Date().toISOString();
      if (evaluation.hasMisconception) {
        state.twin.conceptStates[question.conceptId].misconceptions = evaluation.misconceptions;
      }
    }

    // Update overall twin metrics
    const scores = Object.values(state.twin.conceptStates).map(s => s.mastery);
    state.twin.overallMastery = Number((scores.reduce((a, b) => a + b, 0) / (scores.length || 1)).toFixed(2));
    state.twin.activeMisconceptionsCount = state.twin.activeMisconceptions.filter(m => m.status === 'active').length;
    state.twin.recommendedNextStep = {
      conceptId: evaluation.recommendedNextLesson.conceptId,
      conceptName: question.conceptName,
      actionType: 'visual_lesson',
      headline: `Targeted Visual Lesson: ${evaluation.recommendedNextLesson.lessonFocus}`,
      reason: evaluation.correctiveInsight
    };
    state.twin.lastUpdatedAt = new Date().toISOString();

    res.json({ evaluation, twin: state.twin });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Visual Lesson Generation via elah engine
app.post('/api/spaces/:id/lessons/generate', async (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });

  const { conceptId, conceptName, targetMisconception, duration } = req.body;
  try {
    const reasoning = getActiveReasoningProvider();
    const lessonPlan = await reasoning.generateVisualLessonPlan(
      conceptId || 'c_3nf',
      conceptName || '3NF (Third Normal Form)',
      targetMisconception,
      duration || 45
    );

    const validation = EditValidator.validateLessonPlan(lessonPlan);
    if (!validation.isValid) {
      return res.status(422).json({ error: 'Generated lesson plan failed validation', details: validation });
    }

    state.lessonPlan = lessonPlan;
    state.historyManager = new LessonHistoryManager(lessonPlan);

    res.json({ lessonPlan, validation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Natural Language Lesson Edit (Interpretation & Preview)
app.post('/api/spaces/:id/lessons/edit', async (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state || !state.lessonPlan) {
    return res.status(404).json({ error: 'Active lesson not found' });
  }

  const { editRequest } = req.body;
  if (!editRequest || editRequest.trim().length === 0) {
    return res.status(400).json({ error: 'Edit request prompt is required' });
  }

  try {
    const reasoning = getActiveReasoningProvider();
    const editPlan = await reasoning.interpretNaturalLanguageEdit(state.lessonPlan, editRequest);

    // Validate the proposed plan before allowing preview
    const validation = EditValidator.validateLessonPlan(editPlan.proposedLessonPlan);
    editPlan.validation = validation;

    state.proposedEdit = editPlan;

    res.json({
      editPlan,
      validation,
      previewDiff: editPlan.previewDiffSummary
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commit or Revert (Keep / Discard / Undo)
app.post('/api/spaces/:id/lessons/apply', (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });

  const { action } = req.body; // 'keep' | 'discard' | 'undo'

  if (action === 'keep') {
    if (!state.proposedEdit) {
      return res.status(400).json({ error: 'No proposed edit available to keep.' });
    }
    const newPlan = state.proposedEdit.proposedLessonPlan;
    state.lessonPlan = newPlan;
    state.historyManager.pushVersion(newPlan, state.proposedEdit.aiInterpretation);
    state.proposedEdit = undefined;
    return res.json({
      success: true,
      action: 'kept',
      lessonPlan: state.lessonPlan,
      canUndo: state.historyManager.canUndo()
    });
  }

  if (action === 'discard') {
    state.proposedEdit = undefined;
    return res.json({
      success: true,
      action: 'discarded',
      lessonPlan: state.lessonPlan,
      canUndo: state.historyManager.canUndo()
    });
  }

  if (action === 'undo') {
    const previous = state.historyManager.undo();
    if (!previous) {
      return res.status(400).json({ error: 'Nothing to undo.' });
    }
    state.lessonPlan = previous;
    state.proposedEdit = undefined;
    return res.json({
      success: true,
      action: 'undone',
      lessonPlan: state.lessonPlan,
      canUndo: state.historyManager.canUndo()
    });
  }

  res.status(400).json({ error: 'Invalid action. Choose keep, discard, or undo.' });
});

// Retrieve Student Learning Twin
app.get('/api/spaces/:id/twin', (req: Request, res: Response) => {
  const state = spacesStore.get(String(req.params.id));
  if (!state) return res.status(404).json({ error: 'Space not found' });
  res.json({ twin: state.twin });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`[LearnLens API] Server running on http://localhost:${PORT}`);
  console.log(`[LearnLens API] Default AI Provider: ${currentProviderMode}`);
  initDemoSpace();
});

export default app;
