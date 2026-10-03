import { SourceConflict, SourceDocument } from '@learnlens/schemas';

export class ConflictDetector {
  static formatConflictSummary(conflict: SourceConflict): string {
    return `[${conflict.conflictType.toUpperCase()}] ${conflict.title}\nSource A (${conflict.sourceA.sourceTitle}): "${conflict.sourceA.claim}"\nSource B (${conflict.sourceB.sourceTitle}): "${conflict.sourceB.claim}"\nAnalysis: ${conflict.whyDifferent}`;
  }
}
