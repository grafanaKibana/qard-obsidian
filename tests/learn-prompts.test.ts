import { describe, expect, it } from 'vitest';
import { probeMapPrompt, reviseMapPrompt, stepPrompt } from '../src/learn/learn-prompts';
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

  it('keeps the step scope and evidence while requiring a worked example for unfamiliar mechanisms', () => {
    const prompt = stepPrompt(lesson, map, 0);

    expect(prompt).toContain(lesson.topic);
    expect(prompt).toContain(lesson.notes[0]);
    expect(prompt).toContain(lesson.probe!.findings);
    expect(prompt).toContain(map.steps[0]!.why);
    expect(prompt).toContain('compact worked example');
    expect(prompt).toContain('conditions under which a rule holds');
    expect(prompt).not.toContain('unconditional truths');
  });

  it('shares the whole parallel plan without treating planned steps as demonstrated knowledge', () => {
    const first = stepPrompt(lesson, map, 0);
    const second = stepPrompt(lesson, map, 1);

    for (const prompt of [first, second]) {
      expect(prompt).toContain(
        '1. Reference assignment: Identify the copied value before tracing mutations.',
      );
      expect(prompt).toContain(
        '2. Trace the whole example: Apply the distinction to the complete example.',
      );
      expect(prompt).toContain('(this step)');
      expect(prompt).not.toContain('Steps already taught:');
      expect(prompt).not.toContain('(taught before this step)');
      expect(prompt).toMatch(/written at the same time/i);
      expect(prompt).toContain("without facts introduced by this step's explanation");
      expect(prompt).toContain('recalling a known foundation in a sentence');
    }
    expect(second).toMatch(/earlier planned/i);
    expect(first).toContain('Write step 1 of 2: "Reference assignment"');
    expect(second).toContain('Write step 2 of 2: "Trace the whole example"');
  });
});
