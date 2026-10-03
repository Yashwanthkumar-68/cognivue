import { StructuredLessonPlan, LessonStep } from '@learnlens/schemas';

export interface ActiveFrameState {
  currentFrame: number;
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  progressPercent: number;
  activeSteps: LessonStep[];
  primarySourceStep?: LessonStep;
  activeHighlightStep?: LessonStep;
  activeCaptionStep?: LessonStep;
  activeCheckpointStep?: LessonStep;
}

export class ElahMapper {
  static resolveFrame(plan: StructuredLessonPlan, currentFrame: number): ActiveFrameState {
    const clampedFrame = Math.max(0, Math.min(plan.totalFrames, currentFrame));
    const currentTimeSeconds = clampedFrame / plan.fps;
    const progressPercent = (clampedFrame / plan.totalFrames) * 100;

    const activeSteps = plan.steps.filter(step => {
      const end = step.startFrame + step.durationFrames;
      return clampedFrame >= step.startFrame && clampedFrame < end;
    });

    const primarySourceStep = activeSteps.find(s => s.type === 'show_source') ||
      plan.steps.find(s => s.type === 'show_source' && s.startFrame <= clampedFrame);

    const activeHighlightStep = activeSteps.find(s => s.type === 'highlight_region' || s.type === 'diagram_callout');
    const activeCaptionStep = activeSteps.find(s => s.type === 'caption' || s.type === 'equation_step') || activeHighlightStep;
    const activeCheckpointStep = activeSteps.find(s => s.type === 'quiz_checkpoint');

    return {
      currentFrame: clampedFrame,
      currentTimeSeconds,
      totalDurationSeconds: plan.durationSeconds,
      progressPercent,
      activeSteps,
      primarySourceStep,
      activeHighlightStep,
      activeCaptionStep,
      activeCheckpointStep
    };
  }

  static framesToTimecode(frame: number, fps = 30): string {
    const totalSecs = Math.floor(frame / fps);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const remFrames = frame % fps;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${remFrames.toString().padStart(2, '0')}`;
  }
}
