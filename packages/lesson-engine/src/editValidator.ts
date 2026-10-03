import {
  StructuredLessonPlan,
  StructuredEditPlan,
  EditPlanValidationReport,
  LessonStep
} from '@learnlens/schemas';

export class EditValidator {
  static validateLessonPlan(plan: StructuredLessonPlan): EditPlanValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];
    let frameCollision = false;

    if (!plan.lessonTitle || plan.lessonTitle.trim().length === 0) {
      errors.push('Lesson title must not be empty.');
    }

    if (plan.durationSeconds <= 0) {
      errors.push('Lesson duration must be greater than zero.');
    }

    if (plan.fps <= 0) {
      errors.push('Timeline FPS must be positive integer.');
    }

    if (plan.totalFrames <= 0) {
      errors.push('Total frames must be greater than zero.');
    }

    if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
      errors.push('Lesson plan must have at least one visual step.');
    }

    // Step-by-step checks
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      if (!Number.isInteger(step.startFrame) || step.startFrame < 0) {
        errors.push(`Step ${i + 1} ("${step.title}") has invalid startFrame: ${step.startFrame}. Must be non-negative integer.`);
      }

      if (!Number.isInteger(step.durationFrames) || step.durationFrames <= 0) {
        errors.push(`Step ${i + 1} ("${step.title}") has invalid durationFrames: ${step.durationFrames}. Must be positive integer.`);
      }

      const endFrame = step.startFrame + step.durationFrames;
      if (endFrame > plan.totalFrames + 30) {
        warnings.push(`Step ${i + 1} exceeds total lesson bounds (${endFrame} > ${plan.totalFrames}).`);
      }

      // Check collision with other steps of identical type on the same primary track
      for (let j = i + 1; j < plan.steps.length; j++) {
        const other = plan.steps[j];
        if (step.type === other.type && step.type === 'show_source') {
          const overlap = Math.max(0, Math.min(step.startFrame + step.durationFrames, other.startFrame + other.durationFrames) - Math.max(step.startFrame, other.startFrame));
          if (overlap > 15) { // more than half-second collision
            frameCollision = true;
            warnings.push(`Potential visual collision on source track between "${step.title}" and "${other.title}" (${overlap} frames).`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      frameCollisionDetected: frameCollision,
      checkedTotalFrames: plan.totalFrames
    };
  }

  static validateEditPlan(editPlan: StructuredEditPlan): boolean {
    const report = this.validateLessonPlan(editPlan.proposedLessonPlan);
    return report.isValid;
  }
}
