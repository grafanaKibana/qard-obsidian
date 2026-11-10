// @vitest-environment jsdom
import { act } from 'preact/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Component } from 'obsidian';
import { LearnBrowser } from '../src/components/learn/LearnBrowser';
import type { QardServices } from '../src/views/services';
import type { LearnNav, TestNav } from '../src/views/navigation';

let host: HTMLElement, root: Root, available: number, titleWidth: number;
let resize: () => void;
const observers: { disconnect: ReturnType<typeof vi.fn>; observed: Element[] }[] = [];
const lesson = {
  path: 'Lesson.json',
  title: 'Flow control',
  created: 1,
  finished: false,
  course: 'Networks',
};
const nav = { lesson: vi.fn() } as unknown as LearnNav;

beforeEach(() => {
  available = 320;
  titleWidth = 100;
  observers.length = 0;
  nav.lesson = vi.fn();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const width = this.classList.contains('qard-resume-copy')
      ? available
      : this.parentElement?.classList.contains('qard-resume-title')
        ? Math.min(titleWidth, available)
        : this.parentElement?.classList.contains('qard-resume-context')
          ? 80
          : this.parentElement?.classList.contains('qard-resume-label')
            ? 90
            : 0;
    return { width } as DOMRect;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.parentElement?.classList.contains('qard-resume-title') ? titleWidth : 0;
  });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observed: Element[] = [];
      disconnect = vi.fn();
      constructor(callback: () => void) {
        resize = callback;
        observers.push(this);
      }
      observe(target: Element) {
        this.observed.push(target);
      }
    },
  );
});

afterEach(() => {
  act(() => root.unmount());
  expect(observers.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render() {
  const snapshot = { revision: 0, jobs: {} };
  const services = {
    owner: new Component(),
    learn: {
      subscribe: () => () => {},
      getSnapshot: () => snapshot,
      courses: async () => [],
      listLessons: async () => [lesson],
      pending: async () => ({ mapping: [], failed: [], proposals: [], updates: [] }),
    },
  } as unknown as QardServices;
  await act(async () => {
    root.render(<LearnBrowser services={services} nav={nav} testNav={{} as TestNav} />);
    await Promise.resolve();
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return host.querySelector<HTMLElement>('.qard-resume-copy')!;
}

it('uses actual title and course widths to center context only when both fit', async () => {
  const copy = await render();
  copy.style.columnGap = '8px';
  await act(() => resize());
  expect(copy.classList.contains('is-inline')).toBe(true);
  expect(observers[0]!.observed).toHaveLength(4);
  expect(copy.querySelector('.qard-resume-context')?.textContent).toBe('Networks');
  act(() => copy.closest('button')!.click());
  expect(nav.lesson).toHaveBeenCalledExactlyOnceWith('Lesson.json');

  // Growing rendered text (including font or Markdown changes) restores the full-width title.
  titleWidth = 300;
  await act(() => resize());
  expect(copy.classList.contains('is-inline')).toBe(false);
  titleWidth = 100;
  await act(() => resize());
  expect(copy.classList.contains('is-inline')).toBe(true);
});

it('measures clipped content and recalculates when the pane changes', async () => {
  titleWidth = 450;
  const copy = await render();
  copy.style.columnGap = '8px';
  await act(() => resize());
  expect(copy.classList.contains('is-inline')).toBe(false);
  available = 600;
  await act(() => resize());
  expect(copy.classList.contains('is-inline')).toBe(true);
  available = 180;
  await act(() => resize());
  expect(copy.classList.contains('is-inline')).toBe(false);
});
