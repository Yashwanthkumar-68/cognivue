import { z } from 'zod';

export const ConceptStatusEnum = z.enum([
  'not_started',
  'diagnosing',
  'learning',
  'weak',
  'mastered'
]);

export type ConceptStatus = z.infer<typeof ConceptStatusEnum>;

export const SourceReferenceSchema = z.object({
  sourceId: z.string(),
  sourceTitle: z.string(),
  sourceType: z.string(),
  excerptOrRegion: z.string(),
  pageOrSlide: z.union([z.string(), z.number()]).optional(),
  confidence: z.number().min(0).max(1).default(0.9)
});

export type SourceReference = z.infer<typeof SourceReferenceSchema>;

export const ConceptNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortSummary: z.string(),
  fullExplanation: z.string(),
  category: z.string(),
  complexity: z.number().min(1).max(5).default(3),
  examWeight: z.number().min(0).max(1).default(0.5),
  learningStatus: ConceptStatusEnum.default('not_started'),
  confidence: z.number().min(0).max(1).default(0.85),
  masteryScore: z.number().min(0).max(1).default(0.0),
  prerequisites: z.array(z.string()).default([]),
  examples: z.array(z.string()).default([]),
  sourceReferences: z.array(SourceReferenceSchema).default([]),
  hasConflict: z.boolean().default(false),
  visualAnchorUrl: z.string().optional()
});

export type ConceptNode = z.infer<typeof ConceptNodeSchema>;

export const RelationshipTypeEnum = z.enum([
  'prerequisite',
  'part_of',
  'leads_to',
  'contradicts',
  'related_to'
]);

export const ConceptEdgeSchema = z.object({
  id: z.string(),
  source: z.string(), // source concept id
  target: z.string(), // target concept id
  type: RelationshipTypeEnum,
  label: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.9)
});

export type ConceptEdge = z.infer<typeof ConceptEdgeSchema>;

export const KnowledgeGraphSchema = z.object({
  spaceId: z.string(),
  spaceTitle: z.string(),
  nodes: z.array(ConceptNodeSchema),
  edges: z.array(ConceptEdgeSchema),
  generatedAt: z.string(),
  reasoningModel: z.string().default('deepseek-ai/DeepSeek-R1')
});

export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
