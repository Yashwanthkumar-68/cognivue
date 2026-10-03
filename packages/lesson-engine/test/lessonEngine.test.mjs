import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EditValidator,
  LessonHistoryManager,
  ElahMapper
} from '../dist/index.js';

test('ElahMapper resolves frame timecodes and active steps correctly', () => {
  const dummyPlan = {
    id: 'plan_1',
    spaceId: 'space_1',
    conceptId: 'c_3nf',
    lessonTitle: 'Test 3NF Lesson',
    durationSeconds: 45,
    fps: 30,
    totalFrames: 1350,
    summary: 'Testing frame resolution.',
    steps: [
      {
        id: 'step_1',
        type: 'show_source',
        title: 'Step 1 Intro',
        startFrame: 0,
        durationFrames: 150,
        captionText: 'Welcome to 3NF.'
      },
      {
        id: 'step_2',
        type: 'highlight_region',
        title: 'Step 2 Highlight',
        startFrame: 150,
        durationFrames: 300,
        calloutLabel: 'Key Violation'
      }
    ],
    tracks: [
      { id: 't1', name: 'Sources', kind: 'source', clipIds: ['step_1'] }
    ],
    pedagogicalRationale: 'Pedagogy test',
    version: 1,
    createdAt: new Date().toISOString()
  };

  const stateAtFrame75 = ElahMapper.resolveFrame(dummyPlan, 75);
  assert.equal(stateAtFrame75.currentFrame, 75);
  assert.equal(stateAtFrame75.currentTimeSeconds, 2.5);
  assert.equal(stateAtFrame75.activeSteps.length, 1);
  assert.equal(stateAtFrame75.activeSteps[0].id, 'step_1');

  const tc = ElahMapper.framesToTimecode(1350, 30);
  assert.equal(tc, '00:45.00');
});

test('LessonHistoryManager supports pushing versions and one-step undo', () => {
  const v1Plan = {
    id: 'plan_1',
    spaceId: 'space_1',
    conceptId: 'c_3nf',
    lessonTitle: 'V1 Plan',
    durationSeconds: 45,
    fps: 30,
    totalFrames: 1350,
    summary: 'V1',
    steps: [],
    tracks: [],
    pedagogicalRationale: 'V1',
    version: 1,
    createdAt: new Date().toISOString()
  };

  const manager = new LessonHistoryManager(v1Plan);
  assert.equal(manager.canUndo(), false);

  const v2Plan = { ...v1Plan, version: 2, lessonTitle: 'V2 Plan with Reordered Diagram' };
  manager.pushVersion(v2Plan, 'Reordered diagram before formula');

  assert.equal(manager.canUndo(), true);
  assert.equal(manager.getCurrent().version, 2);

  const restored = manager.undo();
  assert.equal(restored.version, 1);
  assert.equal(restored.lessonTitle, 'V1 Plan');
  assert.equal(manager.canUndo(), false);
});

test('EditValidator rejects invalid frame numbers', () => {
  const badPlan = {
    id: 'bad',
    spaceId: 'space_1',
    conceptId: 'c_1',
    lessonTitle: 'Invalid Plan',
    durationSeconds: 30,
    fps: 30,
    totalFrames: 900,
    summary: 'Bad',
    steps: [
      {
        id: 's1',
        type: 'show_source',
        title: 'Negative Frame Step',
        startFrame: -10, // Invalid!
        durationFrames: 50
      }
    ],
    tracks: [],
    pedagogicalRationale: 'Test',
    version: 1,
    createdAt: new Date().toISOString()
  };

  const report = EditValidator.validateLessonPlan(badPlan);
  assert.equal(report.isValid, false);
  assert.ok(report.errors.some(e => e.includes('invalid startFrame')));
});
