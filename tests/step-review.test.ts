import { describe, expect, it, vi } from 'vitest';
import type { AgentTask } from '../src/agents/runner';
import { stepSchema } from '../src/learn/learn-schema';
import { stepReviewSchema, writeReviewedStep } from '../src/learn/step-review';
import type { LessonStep } from '../src/learn/learn-types';

const step: LessonStep = {
  title: 'Trace two outputs',
  explain: 'Use the current reference to find the object being read.',
  connect: 'Apply the reference distinction.',
  checkFirst: false,
  check: {
    id: 'k1',
    type: 'short',
    prompt: 'Give the two output values in order.',
    marks: 2,
    rubric: [
      { point: 'The first output is 1.', marks: 1 },
      { point: 'The second output is 2.', marks: 1 },
    ],
    model: '1, 2.',
  },
  misconceptions: [],
};
const task: AgentTask = { prompt: 'Write the next reference step.', schema: stepSchema };
const runner = (reply: (task: AgentTask) => unknown) => ({
  name: 'scripted',
  run: vi.fn(async (input: AgentTask) => reply(input)),
});

describe('reviewing lesson steps', () => {
  it('returns an approved step and supplies its context and source to the marker', async () => {
    const writer = runner(() => step);
    const reviewer = runner(() => ({ issues: [] }));
    const controller = new AbortController();

    expect(
      await writeReviewedStep(writer, reviewer, { ...task, signal: controller.signal }, 'Notes.'),
    ).toEqual(step);
    expect(writer.run).toHaveBeenCalledTimes(1);
    expect(reviewer.run).toHaveBeenCalledTimes(1);
    expect(reviewer.run.mock.calls[0]![0]).toMatchObject({
      schema: stepReviewSchema,
      signal: controller.signal,
      effort: 'high',
      vault: false,
    });
    const prompt = reviewer.run.mock.calls[0]![0].prompt;
    expect(prompt).toContain(task.prompt);
    expect(prompt).toContain(step.explain);
    expect(prompt).toContain(step.check.prompt);
    expect(prompt).toContain('Notes.');
    expect(prompt).toContain('the second output is 15 and the update reads 5');
    expect(prompt).toContain('intermediate values 8 and 7');
    expect(prompt).toContain('Changing only names, literal values or wording is not a new case');
  });

  it('rewrites a rejected candidate with its actual issues before returning it', async () => {
    const first = { ...step, title: 'Rejected candidate' };
    const repaired = { ...step, title: 'Repaired candidate' };
    let writes = 0,
      reviews = 0;
    const writer = runner(() => (++writes === 1 ? first : repaired));
    const reviewer = runner(() => ({
      issues: ++reviews === 1 ? ['Split the two requested outputs into separate points.'] : [],
    }));

    expect(await writeReviewedStep(writer, reviewer, task)).toEqual(repaired);
    expect(writer.run).toHaveBeenCalledTimes(2);
    const repair = writer.run.mock.calls[1]![0].prompt;
    expect(repair).toContain(task.prompt);
    expect(repair).toContain('Split the two requested outputs into separate points.');
    expect(repair).toContain('Rejected candidate');
    expect(reviewer.run.mock.calls[1]![0].prompt).toContain('Repaired candidate');
  });

  it('stops after two repairs instead of returning a rejected check', async () => {
    const writer = runner(() => step);
    const reviewer = runner(() => ({ issues: ['The check repeats the worked example.'] }));

    await expect(writeReviewedStep(writer, reviewer, task)).rejects.toThrow(
      'still needs correction after three attempts: The check repeats the worked example.',
    );
    expect(writer.run).toHaveBeenCalledTimes(3);
    expect(reviewer.run).toHaveBeenCalledTimes(3);
  });

  it.each([
    { marks: 5, points: [2, 3] },
    { marks: 0, points: [0] },
    { marks: 2.5, points: [1, 1.5] },
    { marks: 2, points: [0.5, 1.5] },
    { marks: 2, points: [-1, 3] },
  ])('rejects invalid mark allocation before semantic review: %j', async ({ marks, points }) => {
    let writes = 0;
    const invalid = {
      ...step,
      check: {
        ...step.check,
        marks,
        rubric: points.map((value) => ({ point: 'A claim.', marks: value })),
      },
    };
    const writer = runner(() => (++writes === 1 ? invalid : step));
    const reviewer = runner(() => ({ issues: [] }));

    expect(await writeReviewedStep(writer, reviewer, task)).toEqual(step);
    expect(writer.run).toHaveBeenCalledTimes(2);
    expect(reviewer.run).toHaveBeenCalledTimes(1);
    expect(writer.run.mock.calls[1]![0].prompt).toContain('Your previous reply was rejected');
  });

  it.each([{ issues: 'none' }, { issues: [' '] }])(
    'does not approve malformed review output: %j',
    async (invalid) => {
      const writer = runner(() => step);
      const reviewer = runner(() => invalid);

      await expect(writeReviewedStep(writer, reviewer, task)).rejects.toThrow();
      expect(writer.run).toHaveBeenCalledTimes(1);
      expect(reviewer.run).toHaveBeenCalledTimes(2);
    },
  );

  it('retains the existing read-only note access when sources are not inlined', async () => {
    const writer = runner(() => step);
    const reviewer = runner(() => ({ issues: [] }));

    await writeReviewedStep(writer, reviewer, task);
    expect(reviewer.run.mock.calls[0]![0].vault).toBeUndefined();
    await writeReviewedStep(writer, reviewer, { ...task, vault: false });
    expect(reviewer.run.mock.calls[1]![0].vault).toBe(false);
  });

  it.each(['before writing', 'after writing', 'after review'])(
    'does not return a step cancelled %s',
    async (when) => {
      const controller = new AbortController();
      const writer = runner(() => {
        if (when === 'after writing') controller.abort();
        return step;
      });
      const reviewer = runner(() => {
        if (when === 'after review') controller.abort();
        return { issues: [] };
      });
      if (when === 'before writing') controller.abort();

      await expect(
        writeReviewedStep(writer, reviewer, { ...task, signal: controller.signal }),
      ).rejects.toThrow('Cancelled.');
      if (when === 'before writing') expect(writer.run).not.toHaveBeenCalled();
      if (when !== 'after review') expect(reviewer.run).not.toHaveBeenCalled();
    },
  );
});
