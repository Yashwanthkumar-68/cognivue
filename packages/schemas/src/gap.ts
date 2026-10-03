import { z } from 'zod';

export const GapStatusEnum = z.enum([
  'covered',
  'weak',
  'missing'
]);

export type GapStatus = z.infer<typeof GapStatusEnum>;

export const LearningGapItemSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  conceptName: z.string(),
  status: GapStatusEnum,
  prerequisiteImportance: z.number().min(1).max(10), // 1-10 scale
  examRelevance: z.number().min(1).max(10), // 1-10 scale
  studentWeaknessScore: z.number().min(0).max(1), // 1 = highest weakness
  sourceCoverageScore: z.number().min(0).max(1), // 1 = fully available in uploaded sources, 0 = missing from notes
  priorityScore: z.number().min(0).max(100), // Calculated composite priority
  primaryEvidence: z.string(),
  sourceReferences: z.array(z.string()).default([]),
  actionRecommendation: z.string()
});

export type LearningGapItem = z.infer<typeof LearningGapItemSchema>;

export const LearningGapMapSchema = z.object({
  spaceId: z.string(),
  totalConceptsAnalyzed: z.number(),
  coveredCount: z.number(),
  weakCount: z.number(),
  missingCount: z.number(),
  gaps: z.array(LearningGapItemSchema),
  topPriorityGapId: z.string().optional(),
  generatedAt: z.string()
});

export type LearningGapMap = z.infer<typeof LearningGapMapSchema>;
