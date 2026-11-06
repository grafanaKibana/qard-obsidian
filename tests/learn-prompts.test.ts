import { describe, expect, it } from 'vitest';
import {
  checkPrompt,
  markCheckPrompt,
  probeMapPrompt,
  reviseMapPrompt,
  stepPrompt,
  tutorMarkPrompt,
} from '../src/learn/learn-prompts';
import type {
  CheckRecord,
  Lesson,
  LessonMap,
  LessonStep,
  StepState,
} from '../src/learn/learn-types';
import type { Mastery, Objective } from '../src/learn/mastery';
import { MARKING, markPrompt } from '../src/tests/test-prompts';
import type { AnswerState, Attempt, PracticeTest, Question } from '../src/tests/test-types';

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

const check: CheckRecord = {
  version: 1,
  createdAt: 0,
  mastery: mastery.path,
  course: mastery.course,
  objective: objective.id,
  title: 'Trace copied references',
  goal: 'explain',
  questions: [question, { ...question, id: 'other-check', prompt: 'Unselected question.' }],
  answers: { [question.id]: answer },
  marks: {},
  status: 'ready',
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

  it('aligns requested rubric claims in lesson and delayed-check generation', () => {
    const prompts = [stepPrompt(lesson, map, 0), checkPrompt(mastery, objective, 'apply', [check])];

    for (const prompt of prompts) {
      expect(prompt).toContain('Every scored requirement must follow from what the question asks');
      expect(prompt).toContain(
        'Ask explicitly for any intermediate value or calculation that earns marks',
      );
      expect(prompt).toContain('one independently checkable claim');
      expect(prompt).toContain('Otherwise accept technically valid alternatives');
      expect(prompt).toContain(objective.id);
    }
    expect(prompts[1]).toContain('Goal: apply');
    expect(prompts[1]).toContain('Use fresh wording and new cases');
    expect(prompts[1]).toContain(question.prompt);
  });

  it('keeps the lesson check to one coherent task with stated premises and answer form', () => {
    const prompt = stepPrompt(lesson, map, 0);

    expect(prompt).toMatch(/one coherent task|one thing/);
    expect(prompt).toMatch(/every (?:fact|premise|condition)/i);
    expect(prompt).toMatch(/(?:answer|response) form/i);
    expect(prompt).toMatch(/other steps|later steps/i);
  });

  it('preserves credit when only one of several requested outputs is correct', () => {
    for (const prompt of [
      stepPrompt(lesson, map, 0),
      checkPrompt(mastery, objective, 'apply', []),
    ]) {
      expect(prompt).toContain('give each output, decision or label its own rubric point');
      expect(prompt).toContain('even when the correct values happen to be the same');
      expect(prompt).toContain('one output correct and another wrong');
      expect(prompt).toContain('reduce the task rather than bundle claims');
    }
  });

  it('requires a new reasoning case rather than another copy of a worked example', () => {
    const prompt = stepPrompt(lesson, map, 1);

    expect(prompt).toContain('not already solved in the notes or this explanation');
    expect(prompt).toContain('Renaming variables, changing literal values or paraphrasing');
    expect(prompt).toContain('affects the reasoning or result');
    expect(prompt).toContain("Keep the new case within this step's scope");
  });

  it('requests minimum sufficient model answers without turning optional detail into required credit', () => {
    for (const prompt of [
      stepPrompt(lesson, map, 0),
      checkPrompt(mastery, objective, 'apply', [check]),
    ]) {
      expect(prompt).toContain('shortest model answer that earns full credit');
      expect(prompt).toContain('preserving the essential mechanism and conditions');
      expect(prompt).toContain('Optional detail must never become an unstated grading requirement');
      expect(prompt).toContain(objective.id);
    }
  });

  it.each([
    ['lesson answer', () => tutorMarkPrompt(lesson, step, answer)],
    ['standalone check', () => markCheckPrompt(check, [question.id])],
    [
      'typed prerequisite probe',
      () => probeMapPrompt(lesson, mastery, objective, '# Copying\nSource text.'),
    ],
  ] as const)(
    'uses Learn marking without the conflicting missing-comment rule for a %s',
    (_, makePrompt) => {
      const prompt = makePrompt();

      expect(prompt).toContain('Assess each rubric claim independently');
      expect(prompt).toContain(
        'Do not describe the same omission as multiple independent mistakes',
      );
      expect(prompt).not.toContain('For every rubric point not awarded');
      expect(prompt).toContain(question.prompt);
      expect(prompt).toContain('1. (1) Assignment copies the reference.');
      expect(prompt).toContain(`<model_answer>${question.model}</model_answer>`);
      expect(prompt).toContain(
        `<student_answer confidence="unsure">${answer.text}</student_answer>`,
      );
      expect(prompt).toContain('Notes/Copying.md');
    },
  );

  it('keeps the reasonable-reading exception local to live lesson marking', () => {
    const live = tutorMarkPrompt(lesson, step, answer);

    expect(live).toContain('A point stated in other words is clearly made');
    expect(live).toContain('another reasonable reading');
    expect(live).toContain('question was ambiguous');
    expect(markCheckPrompt(check, [question.id])).not.toContain('One exception to strict marking');
    expect(probeMapPrompt(lesson, mastery, objective)).not.toContain(
      'One exception to strict marking',
    );
  });

  it('frames a first pre-explanation answer as a prediction but excludes retries', () => {
    const predictionStep = { ...step, checkFirst: true };
    const firstState: StepState = {
      answer,
      mark: {
        score: 1,
        awarded: [true, false],
        annotations: [],
        mistake: 'incomplete',
        feedback: 'Explain the shared object.',
      },
      reply: 'Which object does the copied reference identify?',
      asks: [],
    };
    const framing = 'asked before the explanation, as a prediction';

    expect(tutorMarkPrompt(lesson, predictionStep, answer)).toContain(framing);
    expect(tutorMarkPrompt(lesson, step, answer)).not.toContain(framing);
    const retry = tutorMarkPrompt(lesson, predictionStep, answer, firstState);
    expect(retry).toContain('This is a second attempt.');
    expect(retry).not.toContain(framing);
  });

  it('still filters selected check questions and typed probe marks', () => {
    expect(markCheckPrompt(check, [question.id])).not.toContain('Unselected question.');
    const mcq: Question = {
      ...question,
      id: 'probe-choice',
      type: 'mcq',
      options: ['A', 'B'],
      answer: 0,
    };
    const prompt = probeMapPrompt({
      ...lesson,
      probe: {
        questions: [mcq, { ...question, id: 'probe-copy' }],
        answers: { 'probe-choice': { choice: 0 }, 'probe-copy': answer },
      },
    });

    expect(prompt).toContain('Return marks only for: probe-copy.');
    expect(prompt).not.toContain('Return marks only for: probe-choice');
  });

  it('leaves practice-test marking on its existing policy', () => {
    const test: PracticeTest = {
      version: 1,
      createdAt: 0,
      title: 'Practice copying',
      sections: [{ id: 'copying', title: 'Copying', questions: [question] }],
    };
    const attempt: Attempt = {
      version: 1,
      startedAt: 0,
      answers: { [question.id]: answer },
      marks: {},
      review: {},
      sections: {},
    };
    const prompt = markPrompt(test, attempt, [question.id]);

    expect(prompt).toContain(MARKING);
    expect(prompt).toContain('For every rubric point not awarded');
    expect(prompt).not.toContain('Assess each rubric claim independently');
    expect(prompt).toContain(`<model_answer>${question.model}</model_answer>`);
    expect(prompt).toContain(answer.text);
  });
});
