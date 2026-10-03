import { LearningGapItem, LearningGapMap, ConceptNode } from '@learnlens/schemas';

export class GapDetector {
  static computeGapPriority(
    prerequisiteImportance: number, // 1-10
    examRelevance: number,          // 1-10
    studentWeakness: number,        // 0-1
    sourceCoverage: number          // 0-1
  ): number {
    // Composite scoring formula
    const pNorm = (prerequisiteImportance / 10) * 35;
    const eNorm = (examRelevance / 10) * 35;
    const wNorm = studentWeakness * 20;
    const sNorm = (1 - sourceCoverage) * 10; // Extra urgency if material is missing from student notes

    return Math.round(pNorm + eNorm + wNorm + sNorm);
  }

  static rankGaps(gaps: LearningGapItem[]): LearningGapItem[] {
    return [...gaps].sort((a, b) => b.priorityScore - a.priorityScore);
  }
}
