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

export interface GemmaConfig {
  apiKey?: string;
  model?: string; // e.g. 'google/gemma-4-31B-it', 'gemma-4-26b-it', 'gemma-4-e4b-it'
  apiEndpoint?: string;
}

export class GemmaProvider implements AIProvider {
  name = 'Google Gemma 4 Multimodal Provider';
  category = 'multimodal_gemma' as const;
  modelId: string;
  private apiKey: string | undefined;
  private fallbackDemo: DemoProvider;

  constructor(config: GemmaConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.modelId = config.model || process.env.GEMMA_MODEL || 'google/gemma-4-31B-it';
    this.fallbackDemo = new DemoProvider();
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async extractMultimodalContent(source: {
    id: string;
    title: string;
    type: string;
    text?: string;
    mediaUrl?: string;
  }): Promise<GemmaMultimodalExtraction> {
    if (!this.apiKey) {
      // Graceful fallback to deterministic benchmark if no API key is provided
      return this.fallbackDemo.extractMultimodalContent(source);
    }

    try {
      // Dynamic import to support both environments
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: this.apiKey });

      const prompt = `You are Gemma 4, Google DeepMind's premier multimodal open-weights model specializing in educational visual extraction.
Analyze the following educational learning source:
Title: "${source.title}"
Type: "${source.type}"
Content / Excerpt: "${source.text || 'Visual diagram or handwritten note'}"

Return a strict JSON object with:
- concepts: array of { name, definition, confidence (0-1), prerequisites, evidenceQuotesOrRegions }
- visualRegions: array of { id, box2d: [ymin, xmin, ymax, xmax], label, confidence, interpretation }
- diagrams: array of { diagramType, title, entities, confidence, explanation, suspiciousOrAmbiguousSteps }
- equations: array of { latex, explanation, derivationSteps, confidence }
- codeSnippets: array of { language, codeSnippet, conceptsDemonstrated, explanation, potentialBugsOrPitfalls }
- questionPatterns: array of { patternTitle, frequency, typicalMarks, associatedConcepts }
- summary: string`;

      const response = await ai.models.generateContent({
        model: this.modelId,
        contents: prompt
      });

      const responseText = response.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sourceId: source.id,
          sourceTitle: source.title,
          concepts: parsed.concepts || [],
          visualRegions: parsed.visualRegions || [],
          diagrams: parsed.diagrams || [],
          equations: parsed.equations || [],
          codeSnippets: parsed.codeSnippets || [],
          questionPatterns: parsed.questionPatterns || [],
          summary: parsed.summary || 'Extracted via Gemma 4 multimodal understanding.',
          model: this.modelId
        };
      }
    } catch (err) {
      console.warn('[GemmaProvider] API call failed or timed out, using fallback parser:', err);
    }

    return this.fallbackDemo.extractMultimodalContent(source);
  }

  async synthesizeKnowledgeGraph(sources: any[], spaceTitle: string): Promise<KnowledgeGraph> {
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
    return this.fallbackDemo.evaluateDiagnosticAnswer(question, studentAnswer, currentMastery);
  }

  async generateVisualLessonPlan(conceptId: string, conceptName: string, targetMisconception?: string, targetDuration?: number): Promise<StructuredLessonPlan> {
    return this.fallbackDemo.generateVisualLessonPlan(conceptId, conceptName, targetMisconception, targetDuration);
  }

  async interpretNaturalLanguageEdit(currentLesson: StructuredLessonPlan, editRequest: string): Promise<StructuredEditPlan> {
    return this.fallbackDemo.interpretNaturalLanguageEdit(currentLesson, editRequest);
  }
}
