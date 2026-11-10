// @vitest-environment jsdom
import { act } from 'preact/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Component } from 'obsidian';
import { DrawButton, FigureView } from '../src/components/learn/FigureView';
import { readSettings } from '../src/settings/settings';
import type { QardServices } from '../src/views/services';
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let host: HTMLElement, root: Root, services: QardServices;
const figure = { path: 'network.svg', caption: 'Transport protocols.', brief: 'A network.' };
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const snapshot = { settings: readSettings({}) };
  snapshot.settings.agents.roles.illustrator.provider = 'claude-code';
  snapshot.settings.agents.roles.illustrator.model = '';
  snapshot.settings.showAgent = true;
  services = {
    host,
    owner: new Component(),
    app: {},
    reviews: { subscribe: () => () => {}, getSnapshot: () => snapshot },
    jobs: { estimate: () => 240_000 },
  } as unknown as QardServices;
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
const click = async (label: string) => {
  await act(async () => {
    [...host.querySelectorAll('button')]
      .find(
        (button) => button.textContent === label || button.getAttribute('aria-label') === label,
      )!
      .click();
  });
};
const type = async (value: string) => {
  await act(async () => {
    const input = host.querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

it('keeps redraw input editable, submits its request, resets after submit and cancels without drawing', async () => {
  const draw = vi.fn();
  await act(async () => {
    root.render(
      <FigureView
        services={services}
        path="Networks.md"
        figure={figure}
        job={undefined}
        draw={draw}
        cancel={vi.fn()}
        dismiss={vi.fn()}
      />,
    );
  });
  await click('Redraw…');
  await type('Label the router');
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(draw).toHaveBeenCalledExactlyOnceWith('Label the router');
  expect(host.querySelector('form')).toBeNull();
  await click('Redraw…');
  expect(host.querySelector('input')!.value).toBe('');
  await type('Leave this unchanged');
  await click('Cancel');
  expect(host.querySelector('form')).toBeNull();
  expect(draw).toHaveBeenCalledTimes(1);
});

it('shows compact illustrator metadata and timing while preserving job cancellation', async () => {
  const cancel = vi.fn();
  await act(async () => {
    root.render(
      <FigureView
        services={services}
        path="Networks.md"
        figure={figure}
        job={{ kind: 'figure', startedAt: Date.now() - 60_000 }}
        draw={vi.fn()}
        cancel={cancel}
        dismiss={vi.fn()}
      />,
    );
  });
  expect(host.querySelector('.qard-figure-meta .qard-jobs-role')?.textContent).toBe('Illustrator');
  expect(host.querySelector('.qard-agent')).toBeNull();
  expect(host.querySelector('.qard-agent-info')?.getAttribute('title')).toBe(
    'Claude Code · default model',
  );
  expect(host.querySelector('.qard-jobs-time')?.textContent).toContain(
    '1:00 elapsed · about 3 min left',
  );
  expect(host.textContent).toContain('Redrawing the figure…');
  const stop = host.querySelector('.qard-figure-status button')!;
  expect(stop.getAttribute('aria-label')).toBe('Cancel');
  expect(stop.getAttribute('title')).toBe('Cancel');
  expect(stop.textContent).toBe('');
  expect(stop.querySelector('svg')).not.toBeNull();
  await click('Cancel');
  expect(cancel).toHaveBeenCalledOnce();
});

it('shows drawing progress, the figure with its caption, and redraws with a note', async () => {
  const draw = vi.fn(),
    cancel = vi.fn();
  const figure = { path: 'assets/statistics/beta.svg', caption: 'Beta(2,5).', brief: 'b' };
  const show = (f?: typeof figure, job?: { kind: string; startedAt?: number; error?: string }) =>
    act(async () => {
      root.render(
        <>
          <FigureView
            services={services}
            path="L.md"
            figure={f}
            job={job}
            draw={draw}
            cancel={cancel}
            dismiss={() => {}}
          />
          <DrawButton figure={f} job={job} draw={() => draw()} />
        </>,
      );
      await new Promise((r) => setTimeout(r, 0));
    });
  await show();
  expect(host.textContent).toBe(' Draw this');
  await show(undefined, { kind: 'figure', startedAt: Date.now() });
  expect(host.textContent).toContain('Drawing a figure…');
  expect(host.querySelector('.qard-jobs-role')?.textContent).toBe('Illustrator');
  await act(async () => {
    host.querySelector<HTMLButtonElement>('[aria-label="Cancel"]')!.click();
  });
  expect(cancel).toHaveBeenCalled();
  await show(figure);
  expect(host.querySelector('.qard-figure')!.textContent).toContain(
    '![[assets/statistics/beta.svg|700]]',
  );
  expect(host.querySelector('.qard-figure')!.textContent).toContain('*Figure: Beta(2,5).*');
  expect(host.textContent).not.toContain('Draw this');
  await act(async () => {
    [...host.querySelectorAll('button')].find((b) => b.textContent === 'Redraw…')!.click();
  });
  await act(async () => {
    const input = host.querySelector('input')!;
    input.value = 'label the mode';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => {
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(draw).toHaveBeenCalledWith('label the mode');
  await show(undefined, { kind: 'figure', error: 'Python 3 was not found.' });
  expect(host.textContent).toContain('Python 3 was not found.Try again');
});

it('keeps overdue figure guidance and cancellation with the compact stop icon', async () => {
  const cancel = vi.fn();
  await act(async () =>
    root.render(
      <FigureView
        services={services}
        path="Networks.md"
        figure={figure}
        job={{ kind: 'figure', startedAt: Date.now() - 20 * 60_000 }}
        draw={vi.fn()}
        cancel={cancel}
        dismiss={vi.fn()}
      />,
    ),
  );
  expect(host.querySelector('.qard-figure-status .is-stuck')?.textContent).toContain(
    'much longer than usual',
  );
  await click('Cancel');
  expect(cancel).toHaveBeenCalledOnce();
});
