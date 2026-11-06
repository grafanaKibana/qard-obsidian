import { describe, expect, it } from 'vitest';
import { probeMapPrompt, reviseMapPrompt } from '../src/learn/learn-prompts';
import type { Lesson, LessonMap, LessonStep } from '../src/learn/learn-types';
import type { Mastery, Objective } from '../src/learn/mastery';
import type { AnswerState, Question } from '../src/tests/test-types';

const question: Question = {
  id: 'copy-check',
  type: 'long',
  prompt:
    'Explain why assigning a reference leaves both variables identifying the original object.',
  marks: 2,
  rubric: [
    { point: 'Assignment copies the reference.', marks: 1 },
    { point: 'Both variables identify the original object.', marks: 1 },
  ],
  model: 'The reference is copied, so both variables identify the original object.',
  source: { path: 'Notes/Copying.md', heading: 'References' },
  objective: 'reference-copy',
  goal: 'explain',
};
const answer: AnswerState = {
  text: 'Both variables still identify the original object.',
  confidence: 'unsure',
};
const step: LessonStep = {
  title: 'Reference assignment',
  explain: 'Reference assignment copies a reference, not the referenced object.',
  connect: 'Use the copied reference to trace later changes.',
  checkFirst: false,
  check: question,
  misconceptions: [
    { signs: 'The object is duplicated.', reteach: 'Only the reference is copied.' },
  ],
};
const map: LessonMap = {
  title: 'Trace assignment',
  plan: 'Distinguish a variable from its object, then trace a copied reference.',
  mermaid: 'graph TD; A["Variable"] --> B["Shared object"]',
  objective: 'reference-copy',
  steps: [
    { title: 'Reference assignment', why: 'Identify the copied value before tracing mutations.' },
    { title: 'Trace the whole example', why: 'Apply the distinction to the complete example.' },
  ],
};
const lesson: Lesson = {
  version: 1,
  createdAt: 0,
  topic: 'Trace assignment and mutation',
  notes: ['Notes/Copying.md'],
  objective: 'reference-copy',
  map,
  steps: [step],
  state: [{ answer, asks: [] }],
  current: 0,
  probe: {
    questions: [{ ...question, id: 'probe-copy' }],
    answers: { 'probe-copy': answer },
    findings: 'The object identity is understood; copying needs explanation.',
  },
};
const objective: Objective = {
  id: 'reference-copy',
  title: 'Trace copied references',
  state: 'shaky',
  notes: ['Notes/Copying.md'],
  needs: [],
  evidence: ['check 1/2 unsure'],
  cells: {},
};
const mastery: Mastery = {
  path: 'Courses/Programming.md',
  course: 'Programming',
  objectives: [objective],
};

describe('Learn prompt contracts', () => {
  it('uses capability, prerequisite and final-application rules for initial and revised maps', () => {
    const change = 'Keep the comparison and use one worked example.';
    const prompts = [probeMapPrompt(lesson, mastery, objective), reviseMapPrompt(lesson, change)];

    for (const prompt of prompts) {
      expect(prompt).toContain('Each step develops one assessable capability');
      expect(prompt).toContain('A comparison is one capability');
      expect(prompt).toMatch(/first.*not.*demonstrated/i);
      expect(prompt).toContain('The final step exercises the requested goal');
      expect(prompt).toContain('identify unfinished scope explicitly');
    }
    expect(prompts[0]).toContain(lesson.topic);
    expect(prompts[0]).toContain(question.prompt);
    expect(prompts[0]).toContain(answer.text);
    expect(prompts[1]).toContain(`<change>\n${change}\n</change>`);
    expect(prompts[1]).toContain(JSON.stringify(map, null, 2));
    expect(prompts[1]).toContain("Apply the student's change first");
  });
});
