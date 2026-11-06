import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodexRunner, type Child, type NodeHost } from '../src/agents/cli-runner';
import type { AgentTask } from '../src/agents/runner';

function codexHost() {
  const files = new Map<string, string>();
  const removed: string[] = [];
  const processes: {
    output: string;
    finish(answer: string): void;
    kill: ReturnType<typeof vi.fn>;
  }[] = [];
  const host: NodeHost = {
    env: { PATH: '/bin' },
    home: '/home/me',
    windows: true,
    exists: (path) => path === '/bin/codex' || files.has(path),
    readFile: (path) => files.get(path)!,
    remove: (path) => {
      removed.push(path);
      files.delete(path);
    },
    tempFile: (name) => `/tmp/${name}`,
    spawn: (_, args) => {
      const output = args[args.indexOf('--output-last-message') + 1]!;
      let onClose: ((code: number | null) => void) | undefined;
      let onOutput: ((chunk: { toString(): string }) => void) | undefined;
      const kill = vi.fn(() => true);
      const child: Child = {
        stdout: {
          on: (_, listener) => {
            onOutput = listener;
          },
        },
        stderr: { on: () => {} },
        stdin: {
          on: () => {},
          end: () => {
            processes.push({
              output,
              kill,
              finish: (answer) => {
                onOutput?.({
                  toString: () =>
                    JSON.stringify({
                      type: 'item.completed',
                      item: { type: 'agent_message', text: JSON.stringify({ answer }) },
                    }),
                });
                onClose?.(0);
              },
            });
          },
        },
        on: (event, listener) => {
          if (event === 'close') onClose = listener as (code: number | null) => void;
        },
        kill,
      };
      return child;
    },
  };
  return { host, files, removed, processes };
}

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  vi.spyOn(Date, 'now').mockReturnValue(1_800_000_000_000);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const task: AgentTask = {
  prompt: 'Mark this answer.',
  schema: {
    type: 'object',
    properties: { answer: { type: 'string' } },
    required: ['answer'],
    additionalProperties: false,
  },
  vault: false,
};

describe('Codex result isolation', () => {
  it('keeps same-millisecond runs from consuming each other’s final answer', async () => {
    const t = codexHost();
    const first = new CodexRunner(t.host, '/vault', '/bin/codex', 'gpt-test').run(task);
    const second = new CodexRunner(t.host, '/vault', '/bin/codex', 'gpt-test').run(task);
    await vi.waitFor(() => expect(t.processes).toHaveLength(2));
    const [a, b] = t.processes;
    t.files.set(a!.output, JSON.stringify({ answer: 'first' }));
    t.files.set(b!.output, JSON.stringify({ answer: 'second' }));
    a!.finish('first');
    b!.finish('second');

    await expect(Promise.all([first, second])).resolves.toEqual([
      { answer: 'first' },
      { answer: 'second' },
    ]);
    expect(a!.output).not.toBe(b!.output);
    expect(new Set(t.removed).size).toBe(2);
    expect(t.files.size).toBe(0);
  });

  it('cancels and cleans one run without deleting another run’s answer', async () => {
    const t = codexHost();
    const controller = new AbortController();
    const first = new CodexRunner(t.host, '/vault', '/bin/codex', 'gpt-test').run({
      ...task,
      signal: controller.signal,
    });
    const rejected = expect(first).rejects.toThrow('Cancelled.');
    const second = new CodexRunner(t.host, '/vault', '/bin/codex', 'gpt-test').run(task);
    await vi.waitFor(() => expect(t.processes).toHaveLength(2));
    const [a, b] = t.processes;
    t.files.set(a!.output, JSON.stringify({ answer: 'cancelled' }));
    t.files.set(b!.output, JSON.stringify({ answer: 'second' }));
    controller.abort();
    await rejected;
    const otherAnswerPreserved = t.files.has(b!.output);
    b!.finish('second');

    expect(await second).toEqual({ answer: 'second' });
    expect(otherAnswerPreserved).toBe(true);
    expect(a!.kill).toHaveBeenCalledOnce();
    expect(t.files.size).toBe(0);
  });
});
