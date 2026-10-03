import { z } from 'zod';

export const LessonStepTypeEnum = z.enum([
  'show_source',
  'highlight_region',
  'diagram_callout',
  'equation_step',
  'caption',
  'quiz_checkpoint'
]);

export type LessonStepType = z.infer<typeof LessonStepTypeEnum>;

export const NormalizedRegionSchema = z.object({
  x: z.number().min(0).max(100),       // percentage 0-100
  y: z.number().min(0).max(100),       // percentage 0-100
  width: z.number().min(0).max(100),   // percentage 0-100
  height: z.number().min(0).max(100)   // percentage 0-100
});

export type NormalizedRegion = z.infer<typeof NormalizedRegionSchema>;

export const LessonStepSchema = z.object({
  id: z.string(),
  type: LessonStepTypeEnum,
  title: z.string(),
  startFrame: z.number().int().nonnegative(),
  durationFrames: z.number().int().positive(),
  sourceId: z.string().optional(),
  sourceTitle: z.string().optional(),
  region: NormalizedRegionSchema.optional(),
  captionText: z.string().optional(),
  calloutLabel: z.string().optional(),
  latexFormula: z.string().optional(),
  voiceoverScript: z.string().optional(),
  sourceExcerpt: z.string().optional(),
  styleVariant: z.enum(['default', 'highlight_cyan', 'highlight_violet', 'warning_amber', 'danger_rose']).default('default')
});

export type LessonStep = z.infer<typeof LessonStepSchema>;

export const TimelineTrackKindEnum = z.enum([
  'source',      // Background visual source (slide, diagram, notes)
  'overlay',     // Visual highlights, bounding boxes, arrows
  'text',        // Dynamic synced captions and callouts
  'checkpoint'   // Active recall quiz interactive pause
]);

export type TimelineTrackKind = z.infer<typeof TimelineTrackKindEnum>;

export const TimelineTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: TimelineTrackKindEnum,
  clipIds: z.array(z.string()).default([])
});

export type TimelineTrack = z.infer<typeof TimelineTrackSchema>;

export const StructuredLessonPlanSchema = z.object({
  id: z.string(),
  spaceId: z.string(),
  conceptId: z.string(),
  lessonTitle: z.string(),
  targetMisconception: z.string().optional(),
  durationSeconds: z.number().positive(),
  fps: z.number().int().positive().default(30),
  totalFrames: z.number().int().positive(),
  summary: z.string(),
  steps: z.array(LessonStepSchema),
  tracks: z.array(TimelineTrackSchema),
  pedagogicalRationale: z.string(),
  traceableSourceIds: z.array(z.string()).default([]),
  version: z.number().int().default(1),
  createdAt: z.string()
});

export type StructuredLessonPlan = z.infer<typeof StructuredLessonPlanSchema>;

export const EditOperationTypeEnum = z.enum([
  'reorder_steps',
  'adjust_timing',
  'rescale_total_duration',
  'insert_step',
  'remove_step',
  'highlight_emphasis',
  'simplify_vocabulary',
  'exam_focus_filter'
]);

export type EditOperationType = z.infer<typeof EditOperationTypeEnum>;

export const EditPlanOperationSchema = z.object({
  op: EditOperationTypeEnum,
  description: z.string(),
  targetStepId: z.string().optional(),
  parameters: z.record(z.any()).default({})
});

export type EditPlanOperation = z.infer<typeof EditPlanOperationSchema>;

export const EditPlanValidationReportSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  frameCollisionDetected: z.boolean().default(false),
  checkedTotalFrames: z.number().int().nonnegative()
});

export type EditPlanValidationReport = z.infer<typeof EditPlanValidationReportSchema>;

export const StructuredEditPlanSchema = z.object({
  editPlanId: z.string(),
  lessonId: z.string(),
  naturalLanguageRequest: z.string(),
  aiInterpretation: z.string(),
  operations: z.array(EditPlanOperationSchema),
  proposedLessonPlan: StructuredLessonPlanSchema,
  validation: EditPlanValidationReportSchema,
  previewDiffSummary: z.array(z.string()),
  createdAt: z.string()
});

export type StructuredEditPlan = z.infer<typeof StructuredEditPlanSchema>;

export const LessonVersionHistorySchema = z.object({
  lessonId: z.string(),
  currentVersionIndex: z.number().int(),
  history: z.array(z.object({
    version: z.number().int(),
    description: z.string(),
    lessonPlan: StructuredLessonPlanSchema,
    timestamp: z.string()
  }))
});

export type LessonVersionHistory = z.infer<typeof LessonVersionHistorySchema>;
