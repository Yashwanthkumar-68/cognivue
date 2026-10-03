import { z } from 'zod';

export const ConceptTwinStateSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  mastery: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  misconceptions: z.array(z.string()).default([]),
  evidence: z.array(z.string()).default([]),
  lastAssessedAt: z.string().optional(),
  recommendedNext: z.string().optional()
});

export type ConceptTwinState = z.infer<typeof ConceptTwinStateSchema>;

export const ActiveMisconceptionItemSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  conceptName: z.string(),
  misconceptionDescription: z.string(),
  detectedAt: z.string(),
  status: z.enum(['active', 'addressing', 'resolved']).default('active'),
  resolvedViaLessonId: z.string().optional()
});

export type ActiveMisconceptionItem = z.infer<typeof ActiveMisconceptionItemSchema>;

export const LearningTwinSchema = z.object({
  studentId: z.string().default('student-local'),
  spaceId: z.string(),
  overallMastery: z.number().min(0).max(1),
  overallConfidence: z.number().min(0).max(1),
  conceptsMasteredCount: z.number().int().nonnegative(),
  conceptsWeakCount: z.number().int().nonnegative(),
  activeMisconceptionsCount: z.number().int().nonnegative(),
  conceptStates: z.record(ConceptTwinStateSchema),
  activeMisconceptions: z.array(ActiveMisconceptionItemSchema).default([]),
  recentAssessments: z.array(z.object({
    id: z.string(),
    conceptName: z.string(),
    scoreDelta: z.number(),
    timestamp: z.string()
  })).default([]),
  recommendedNextStep: z.object({
    conceptId: z.string(),
    conceptName: z.string(),
    actionType: z.enum(['visual_lesson', 'diagnostic_quiz', 'resolve_conflict', 'review_weakness']),
    headline: z.string(),
    reason: z.string()
  }),
  lastUpdatedAt: z.string()
});

export type LearningTwin = z.infer<typeof LearningTwinSchema>;
