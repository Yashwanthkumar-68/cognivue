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

export interface AIProvider {
  name: string;
  category: 'multimodal_gemma' | 'open_weight_reasoning' | 'demo_benchmark';
  modelId: string;
  isAvailable(): Promise<boolean>;

  // Track 2: Gemma 4 Multimodal Understanding
  extractMultimodalContent(source: {
    id: string;
    title: string;
    type: string;
    text?: string;
    mediaUrl?: string;
  }): Promise<GemmaMultimodalExtraction>;

  // Track 1: Open-Source AI Reasoning Layer
  synthesizeKnowledgeGraph(sources: any[], spaceTitle: string): Promise<KnowledgeGraph>;
  detectSourceConflicts(sources: any[], concepts: any[]): Promise<SourceConflict[]>;
  analyzeLearningGaps(concepts: any[], sources: any[], examSyllabus?: string): Promise<LearningGapMap>;
  generateDiagnosticQuestions(conceptId: string, conceptName: string, difficulty?: string): Promise<DiagnosticQuestion[]>;
  evaluateDiagnosticAnswer(question: DiagnosticQuestion, studentAnswer: string, currentMastery?: number): Promise<SemanticEvaluation>;
  generateVisualLessonPlan(conceptId: string, conceptName: string, targetMisconception?: string, targetDuration?: number): Promise<StructuredLessonPlan>;
  interpretNaturalLanguageEdit(currentLesson: StructuredLessonPlan, editRequest: string): Promise<StructuredEditPlan>;
}
