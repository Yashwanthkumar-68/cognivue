import { z } from 'zod';
import { VisualRegionSchema } from './source.js';

export const GemmaDiagramEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['entity', 'attribute', 'relationship', 'process', 'state', 'component', 'table']),
  attributes: z.array(z.string()).default([]),
  cardinality: z.string().optional(),
  connectedTo: z.array(z.string()).default([])
});

export const GemmaDiagramAnalysisSchema = z.object({
  diagramType: z.enum(['er_diagram', 'architecture', 'flowchart', 'schema', 'state_machine', 'handwritten_sketch', 'plot']),
  title: z.string(),
  entities: z.array(GemmaDiagramEntitySchema),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  suspiciousOrAmbiguousSteps: z.array(z.string()).default([])
});

export const GemmaEquationAnalysisSchema = z.object({
  latex: z.string(),
  explanation: z.string(),
  derivationSteps: z.array(z.object({
    stepIndex: z.number(),
    formula: z.string(),
    description: z.string(),
    isQuestionable: z.boolean().default(false),
    errorAnnotation: z.string().optional()
  })),
  confidence: z.number().min(0).max(1)
});

export const GemmaCodeAnalysisSchema = z.object({
  language: z.string(),
  codeSnippet: z.string(),
  conceptsDemonstrated: z.array(z.string()),
  explanation: z.string(),
  potentialBugsOrPitfalls: z.array(z.string()).default([])
});

export const GemmaMultimodalExtractionSchema = z.object({
  sourceId: z.string(),
  sourceTitle: z.string(),
  concepts: z.array(z.object({
    name: z.string(),
    definition: z.string(),
    confidence: z.number().min(0).max(1),
    prerequisites: z.array(z.string()).default([]),
    evidenceQuotesOrRegions: z.array(z.string()).default([])
  })),
  visualRegions: z.array(VisualRegionSchema).default([]),
  diagrams: z.array(GemmaDiagramAnalysisSchema).default([]),
  equations: z.array(GemmaEquationAnalysisSchema).default([]),
  codeSnippets: z.array(GemmaCodeAnalysisSchema).default([]),
  questionPatterns: z.array(z.object({
    patternTitle: z.string(),
    frequency: z.enum(['high', 'medium', 'low']),
    typicalMarks: z.number().optional(),
    associatedConcepts: z.array(z.string())
  })).default([]),
  summary: z.string(),
  model: z.string().default('google/gemma-4-31B-it')
});

export type GemmaMultimodalExtraction = z.infer<typeof GemmaMultimodalExtractionSchema>;
