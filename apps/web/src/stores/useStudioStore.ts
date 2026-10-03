import { create } from 'zustand';
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
import * as api from '../services/api.js';

export type StudioScreen =
  | 'landing'
  | 'spaces'
  | 'import'
  | 'gemma_analysis'
  | 'knowledge_graph'
  | 'learning_twin'
  | 'misconception_center'
  | 'gap_map'
  | 'conflict_viewer'
  | 'lesson_editor'
  | 'exam_mode'
  | 'settings';

interface StudioState {
  currentScreen: StudioScreen;
  activeSpaceId: string;
  spaceTitle: string;
  spaceGoal: string;
  sources: SourceDocument[];
  extractions: Record<string, any>;
  knowledgeGraph: KnowledgeGraph | null;
  conflicts: SourceConflict[];
  gaps: LearningGapMap | null;
  diagnostics: DiagnosticQuestion[];
  assessments: SemanticEvaluation[];
  lessonPlan: StructuredLessonPlan | null;
  proposedEdit: StructuredEditPlan | null;
  canUndo: boolean;
  twin: LearningTwin | null;

  // Player state
  currentFrame: number;
  isPlaying: boolean;

  // Selected details
  selectedConceptId: string | null;
  selectedSourceId: string | null;
  selectedConflictId: string | null;

  // Loaders & AI Provider
  isLoading: boolean;
  statusMessage: string;
  providerMode: 'demo' | 'gemma' | 'openweight' | 'hybrid';

  // Actions
  setScreen: (screen: StudioScreen) => void;
  setFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedConcept: (id: string | null) => void;
  setSelectedSource: (id: string | null) => void;
  setSelectedConflict: (id: string | null) => void;
  setProviderMode: (mode: 'demo' | 'gemma' | 'openweight' | 'hybrid') => void;

  // Async workflows
  loadDemoBenchmark: () => Promise<void>;
  submitDiagnosticAnswer: (questionId: string, answer: string) => Promise<SemanticEvaluation | null>;
  generateLessonForConcept: (conceptId: string, conceptName: string, misconception?: string) => Promise<void>;
  requestLessonEdit: (prompt: string) => Promise<void>;
  commitEditAction: (action: 'keep' | 'discard' | 'undo') => Promise<void>;
  createNewSpace: (title: string, goal: string) => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  currentScreen: 'landing',
  activeSpaceId: 'space_dbms_demo',
  spaceTitle: 'DBMS — Final Exam Preparation',
  spaceGoal: 'Master Relational Normalization, eliminate 3NF misconceptions, and ace the exam.',
  sources: [],
  extractions: {},
  knowledgeGraph: null,
  conflicts: [],
  gaps: null,
  diagnostics: [],
  assessments: [],
  lessonPlan: null,
  proposedEdit: null,
  canUndo: false,
  twin: null,

  currentFrame: 0,
  isPlaying: false,

  selectedConceptId: 'c_3nf',
  selectedSourceId: 'src_notes',
  selectedConflictId: 'conflict_3nf_bcnf_priority',

  isLoading: false,
  statusMessage: '',
  providerMode: 'hybrid',

  setScreen: (screen) => set({ currentScreen: screen }),
  setFrame: (frame) => set({ currentFrame: frame }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSelectedConcept: (id) => set({ selectedConceptId: id }),
  setSelectedSource: (id) => set({ selectedSourceId: id }),
  setSelectedConflict: (id) => set({ selectedConflictId: id }),
  setProviderMode: (mode) => set({ providerMode: mode }),

  loadDemoBenchmark: async () => {
    set({ isLoading: true, statusMessage: 'Synthesizing DBMS multimodal learning materials via Gemma 4 & DeepSeek-R1...' });
    try {
      const data = await api.bootstrapDbmsDemo();
      if (data.success) {
        set({
          activeSpaceId: data.space.id,
          spaceTitle: data.space.title,
          spaceGoal: data.space.learningGoal,
          sources: data.sources || [],
          extractions: data.extractions || {},
          knowledgeGraph: data.knowledgeGraph || null,
          conflicts: data.conflicts || [],
          gaps: data.gaps || null,
          diagnostics: data.diagnostics || [],
          lessonPlan: data.lessonPlan || null,
          twin: data.twin || null,
          currentFrame: 0,
          currentScreen: 'knowledge_graph',
          isLoading: false,
          statusMessage: 'Knowledge Graph, Learning Twin, and elah Visual Lesson Ready!'
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false, statusMessage: 'Failed to connect to backend, running in local preview mode.' });
    }
  },

  submitDiagnosticAnswer: async (questionId: string, answer: string) => {
    const { activeSpaceId } = get();
    set({ isLoading: true, statusMessage: 'Open-Source AI Reasoning Layer analyzing semantic nuance & diagnosing misconceptions...' });
    try {
      const res = await api.assessDiagnosticAnswer(activeSpaceId, questionId, answer);
      if (res && res.evaluation) {
        set(state => ({
          assessments: [...state.assessments, res.evaluation],
          twin: res.twin || state.twin,
          isLoading: false,
          statusMessage: res.evaluation.hasMisconception
            ? 'Misconception Detected! Learning Twin updated with corrective remediation.'
            : 'Diagnostic response verified. Knowledge Graph updated.'
        }));
        return res.evaluation;
      }
    } catch (err) {
      console.error(err);
    }
    set({ isLoading: false, statusMessage: '' });
    return null;
  },

  generateLessonForConcept: async (conceptId: string, conceptName: string, misconception?: string) => {
    const { activeSpaceId } = get();
    set({ isLoading: true, statusMessage: 'Open-Weight AI synthesizing structured visual lesson plan & integer frames...' });
    try {
      const res = await api.generateLessonPlan(activeSpaceId, conceptId, conceptName, misconception);
      if (res && res.lessonPlan) {
        set({
          lessonPlan: res.lessonPlan,
          currentFrame: 0,
          isPlaying: false,
          proposedEdit: null,
          canUndo: false,
          currentScreen: 'lesson_editor',
          isLoading: false,
          statusMessage: 'Structured visual lesson generated and validated for elah timeline!'
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  requestLessonEdit: async (prompt: string) => {
    const { activeSpaceId } = get();
    set({ isLoading: true, statusMessage: `AI interpreting natural language edit: "${prompt}"...` });
    try {
      const res = await api.requestNaturalLanguageEdit(activeSpaceId, prompt);
      if (res && res.editPlan) {
        set({
          proposedEdit: res.editPlan,
          isLoading: false,
          statusMessage: 'Structured Edit Plan generated! Inspect the proposed diff preview before applying.'
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false, statusMessage: 'Failed to generate edit plan.' });
    }
  },

  commitEditAction: async (action: 'keep' | 'discard' | 'undo') => {
    const { activeSpaceId } = get();
    set({ isLoading: true, statusMessage: `Applying action: ${action.toUpperCase()}...` });
    try {
      const res = await api.applyLessonAction(activeSpaceId, action);
      if (res && res.success) {
        set({
          lessonPlan: res.lessonPlan || get().lessonPlan,
          proposedEdit: null,
          canUndo: Boolean(res.canUndo),
          currentFrame: 0,
          isPlaying: false,
          isLoading: false,
          statusMessage: action === 'keep'
            ? 'Edit plan applied to elah timeline! History snapshot created.'
            : action === 'undo'
            ? 'One-Step UNDO executed: previous lesson plan restored!'
            : 'Proposed edit discarded.'
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  createNewSpace: async (title: string, goal: string) => {
    set({ isLoading: true, statusMessage: 'Initializing new Learning Space...' });
    try {
      const res = await api.createSpace(title, '', goal);
      if (res && res.space) {
        set({
          activeSpaceId: res.space.id,
          spaceTitle: res.space.title,
          spaceGoal: res.space.learningGoal,
          sources: [],
          knowledgeGraph: null,
          conflicts: [],
          gaps: null,
          diagnostics: [],
          lessonPlan: null,
          currentScreen: 'import',
          isLoading: false,
          statusMessage: `Learning Space "${title}" created. Add your multimodal sources now.`
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  }
}));
