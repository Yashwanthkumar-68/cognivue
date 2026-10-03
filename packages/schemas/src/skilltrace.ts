import { z } from 'zod';

export const SkillTraceStatusEnum = z.enum([
  'PASS',
  'INTERVENTION_NEEDED',
  'CRITICAL_STUCK'
]);

export type SkillTraceStatus = z.infer<typeof SkillTraceStatusEnum>;

export const SkillTraceDiagnosticSchema = z.object({
  breakpoint_target: z.string(), // e.g. "Line 12" or "Step 3" or "[ymin, xmin, ymax, xmax]"
  misconception_type: z.string(),
  severity: z.enum(['low', 'medium', 'high'])
});

export const ElahTimelineActionSchema = z.object({
  action_type: z.enum(['HIGHLIGHT_REGION', 'SHOW_SOURCE', 'CAPTION']),
  target_id: z.string(),
  frame_start: z.number().int().nonnegative(),
  frame_end: z.number().int().positive()
});

export const SkillTraceScaffoldingSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  guided_question: z.string(),
  elah_timeline_action: ElahTimelineActionSchema
});

export const SkillTraceOutputSchema = z.object({
  status: SkillTraceStatusEnum,
  diagnostic: SkillTraceDiagnosticSchema,
  scaffolding: SkillTraceScaffoldingSchema
});

export type SkillTraceOutput = z.infer<typeof SkillTraceOutputSchema>;

export const SkillTraceInputPayloadSchema = z.object({
  task_objective: z.string(),
  execution_logs: z.union([z.string(), z.array(z.string())]),
  current_state: z.string(),
  attempt_count: z.number().int().positive().default(1),
  source_id: z.string().optional(),
  media_type: z.enum(['code', 'sql', 'math', 'image', 'video', 'document']).default('code'),
  media_url: z.string().optional()
});

export type SkillTraceInputPayload = z.infer<typeof SkillTraceInputPayloadSchema>;
