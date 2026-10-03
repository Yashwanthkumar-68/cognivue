import { z } from 'zod';

export const ConflictTypeEnum = z.enum([
  'terminology', // Different words used for the same concept
  'context',     // Different assumptions/domain scopes
  'contradiction'// Genuine factual discrepancy
]);

export type ConflictType = z.infer<typeof ConflictTypeEnum>;

export const SourceExcerptSchema = z.object({
  sourceId: z.string(),
  sourceTitle: z.string(),
  sourceType: z.string(),
  pageOrSlide: z.union([z.string(), z.number()]).optional(),
  quote: z.string(),
  claim: z.string()
});

export const SourceConflictSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  conceptName: z.string(),
  conflictType: ConflictTypeEnum,
  severity: z.enum(['low', 'medium', 'high']),
  title: z.string(),
  sourceA: SourceExcerptSchema,
  sourceB: SourceExcerptSchema,
  whyDifferent: z.string(),
  terminologyVsContradictionAnalysis: z.string(),
  aiResolutionGuidance: z.string(),
  examTip: z.string().optional()
});

export type SourceConflict = z.infer<typeof SourceConflictSchema>;
