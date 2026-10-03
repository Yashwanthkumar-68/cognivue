import { z } from 'zod';

export const SourceTypeEnum = z.enum([
  'pdf',
  'pptx',
  'docx',
  'image',
  'screenshot',
  'handwritten',
  'diagram',
  'chart',
  'code',
  'markdown',
  'plaintext',
  'question_paper',
  'assignment',
  'lecture_notes',
  'audio_transcript',
  'video_lecture',
  'web_content'
]);

export type SourceType = z.infer<typeof SourceTypeEnum>;

export const VisualRegionSchema = z.object({
  id: z.string(),
  box2d: z.tuple([z.number(), z.number(), z.number(), z.number()]), // [ymin, xmin, ymax, xmax] normalized 0-1000 or 0-1
  label: z.string(),
  confidence: z.number().min(0).max(1),
  interpretation: z.string(),
  relatedConceptId: z.string().optional()
});

export type VisualRegion = z.infer<typeof VisualRegionSchema>;

export const SourceDocumentSchema = z.object({
  id: z.string(),
  spaceId: z.string(),
  title: z.string(),
  type: SourceTypeEnum,
  originalFilename: z.string(),
  url: z.string().optional(),
  rawText: z.string().optional(),
  summary: z.string().optional(),
  visualRegions: z.array(VisualRegionSchema).default([]),
  pageOrSlideCount: z.number().int().positive().optional(),
  extractedAt: z.string(),
  metadata: z.record(z.any()).default({})
});

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
