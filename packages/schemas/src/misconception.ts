import { z } from 'zod';

export const DiagnosticQuestionSchema = z.object({
  id: z.string(),
  conceptId: z.string(),
  conceptName: z.string(),
  questionText: z.string(),
  contextSnippet: z.string().optional(),
  questionType: z.enum(['conceptual_distinction', 'application', 'visual_interpretation', 'exam_scenario']),
  expectedRubric: z.string(),
  commonMisconceptions: z.array(z.string()).default([]),
  suggestedAnswerPlaceholder: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium')
});

export type DiagnosticQuestion = z.infer<typeof DiagnosticQuestionSchema>;

export const SemanticEvaluationSchema = z.object({
  questionId: z.string(),
  conceptId: z.string(),
  conceptName: z.string(),
  studentAnswer: z.string(),
  understood: z.array(z.string()),
  partiallyUnderstood: z.array(z.string()),
  misconceptions: z.array(z.string()),
  hasMisconception: z.boolean(),
  semanticAnalysisRationale: z.string(),
  correctiveInsight: z.string(),
  masteryScoreDelta: z.number().min(-1).max(1), // e.g. -0.2 if severe misconception, +0.35 if fully understood
  newMasteryScore: z.number().min(0).max(1),
  recommendedNextLesson: z.object({
    conceptId: z.string(),
    lessonFocus: z.string(),
    recommendedDurationSeconds: z.number().default(45)
  })
});

export type SemanticEvaluation = z.infer<typeof SemanticEvaluationSchema>;
