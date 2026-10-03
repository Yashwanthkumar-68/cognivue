import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  StructuredLessonPlanSchema,
  SemanticEvaluationSchema,
  LearningGapMapSchema,
  SourceConflictSchema
} from '../dist/index.js';

test('StructuredLessonPlanSchema validates frame-accurate integer timeline', () => {
  const validPlan = {
    id: 'lesson_test',
    spaceId: 'space_1',
    conceptId: 'c_3nf',
    lessonTitle: 'Test Lesson on 3NF',
    durationSeconds: 45,
    fps: 30,
    totalFrames: 1350,
    summary: 'A test visual lesson plan.',
    steps: [
      {
        id: 'step_1',
        type: 'show_source',
        title: 'Step 1',
        startFrame: 0,
        durationFrames: 150,
        captionText: 'Starting derivation.'
      }
    ],
    tracks: [
      {
        id: 'track_1',
        name: 'Sources',
        kind: 'source',
        clipIds: ['step_1']
      }
    ],
    pedagogicalRationale: 'Anchored on student notes.',
    version: 1,
    createdAt: new Date().toISOString()
  };

  const parsed = StructuredLessonPlanSchema.parse(validPlan);
  assert.equal(parsed.fps, 30);
  assert.equal(parsed.totalFrames, 1350);
});

test('SemanticEvaluationSchema validates Misconception breakdown', () => {
  const evalData = {
    questionId: 'q1',
    conceptId: 'c_3nf',
    conceptName: '3NF',
    studentAnswer: 'Partial dependency causes 3NF violations.',
    understood: ['Functional dependency'],
    partiallyUnderstood: ['Candidate keys'],
    misconceptions: ['Confusing partial dependency with transitive dependency'],
    hasMisconception: true,
    semanticAnalysisRationale: 'Student conflated 2NF and 3NF conditions.',
    correctiveInsight: '2NF applies to composite keys, 3NF to transitive chains.',
    masteryScoreDelta: -0.15,
    newMasteryScore: 0.45,
    recommendedNextLesson: {
      conceptId: 'c_3nf',
      lessonFocus: 'Visualizing Transitive Chains',
      recommendedDurationSeconds: 45
    }
  };

  const parsed = SemanticEvaluationSchema.parse(evalData);
  assert.equal(parsed.hasMisconception, true);
  assert.equal(parsed.misconceptions.length, 1);
});
