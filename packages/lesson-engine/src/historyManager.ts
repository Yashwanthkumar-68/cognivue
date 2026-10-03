import { StructuredLessonPlan } from '@learnlens/schemas';

export interface HistorySnapshot {
  version: number;
  description: string;
  lessonPlan: StructuredLessonPlan;
  timestamp: string;
}

export class LessonHistoryManager {
  private history: HistorySnapshot[] = [];
  private currentIndex = -1;

  constructor(initialPlan?: StructuredLessonPlan) {
    if (initialPlan) {
      this.pushVersion(initialPlan, 'Initial AI-generated lesson plan');
    }
  }

  pushVersion(plan: StructuredLessonPlan, description: string): void {
    // Truncate any future redo branch if pushing a new edit
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push({
      version: plan.version,
      description,
      lessonPlan: JSON.parse(JSON.stringify(plan)),
      timestamp: new Date().toISOString()
    });

    this.currentIndex = this.history.length - 1;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  undo(): StructuredLessonPlan | null {
    if (!this.canUndo()) return null;
    this.currentIndex -= 1;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex].lessonPlan));
  }

  redo(): StructuredLessonPlan | null {
    if (!this.canRedo()) return null;
    this.currentIndex += 1;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex].lessonPlan));
  }

  getCurrent(): StructuredLessonPlan | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) return null;
    return JSON.parse(JSON.stringify(this.history[this.currentIndex].lessonPlan));
  }

  getSnapshots(): HistorySnapshot[] {
    return [...this.history];
  }
}
