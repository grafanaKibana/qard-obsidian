// @vitest-environment jsdom
import { act } from 'preact/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StatisticsView } from '../src/components/statistics/StatisticsView';
import { QardApp } from '../src/views/QardApp';
import { ReviewStore } from '../src/review/review-store';
import { CardIndex } from '../src/cards/card-index';
import { addDays, isoDay } from '../src/learn/mastery';
import type { QardServices } from '../src/views/services';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLElement, root: Root, services: QardServices;
const back = vi.fn(),
  study = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 2, 12));
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  const index = new CardIndex();
  index.setLoading(false);
  index.update(
    'cards.md',
    '---\nqard-deck: Networks\n---\n<!-- qard-id: a -->\n> [!qard]- TCP\n> Reliable delivery\n',
  );
  services = {
    reviews: new ReviewStore(async () => {}),
    index,
    host,
    setFocus: vi.fn(),
    isActive: () => true,
    app: { workspace: { on: vi.fn(), offref: vi.fn() } },
  } as unknown as QardServices;
  back.mockClear();
  study.mockClear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
});
const click = async (el: Element | null) => {
  await act(async () => (el as HTMLElement).click());
};
const button = (label: string) =>
  [...host.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)!;

it('shows honest empty states and offers studying without fabricating performance', async () => {
  await act(async () =>
    root.render(<StatisticsView services={services} back={back} study={study} />),
  );
  expect(host.textContent).toContain(
    'No reviews yet. Rate a card to start recording your progress.',
  );
  expect(host.querySelectorAll('.qard-stats-cell')).toHaveLength(365);
  expect(host.querySelectorAll('.qard-stats-cell:not([disabled])')).toHaveLength(275);
  expect(host.querySelector('.qard-stats-metrics dd')?.textContent).toBe('0');
  expect(host.querySelector('.qard-stats-rating-stack')?.getAttribute('aria-label')).toBe(
    'No ratings in this period',
  );
  expect(host.textContent).not.toContain('NaN');
  await click(button('Study cards'));
  expect(study).toHaveBeenCalledWith();
  await click(button('Back to decks'));
  expect(back).toHaveBeenCalledOnce();
});

it('updates after a review, filters periods, navigates years and supports keyboard day inspection', async () => {
  const today = isoDay(Date.now());
  await services.reviews.review('a', 1, new Date(`${addDays(today, -20)}T12:00:00`).getTime());
  await services.reviews.review('a', 4, Date.now());
  await services.reviews.review('a', 3, new Date(2025, 11, 31, 12).getTime());
  await act(async () =>
    root.render(<StatisticsView services={services} back={back} study={study} />),
  );
  expect(host.querySelector('.qard-stats-metrics')?.textContent).toContain('50%');
  await click(button('7 days'));
  expect(host.querySelector('.qard-stats-metrics')?.textContent).toContain('100%');
  expect(host.querySelector('.qard-stats-rating-stack')?.getAttribute('aria-label')).toContain(
    'Again: 0 reviews',
  );
  expect(host.querySelector('.qard-stats-deck')?.textContent).toContain('67%');
  await click(button('All time'));
  expect(host.querySelector('.qard-stats-metrics dd')?.textContent).toBe('3');
  await act(async () => {
    await services.reviews.review('a', 2, Date.now());
  });
  expect(host.querySelector('.qard-stats-metrics dd')?.textContent).toBe('4');
  const cell = host.querySelector<HTMLButtonElement>(`[data-day="${today}"]`)!;
  await act(async () => {
    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  });
  expect(document.activeElement?.getAttribute('data-day')).toBe(addDays(today, -7));
  expect(host.querySelectorAll('.qard-stats-cell[tabindex="0"]')).toHaveLength(1);
  await click(host.querySelector('[aria-label="Previous year"]'));
  expect((host.querySelector('[aria-label="Activity year"]') as HTMLSelectElement).value).toBe(
    '2025',
  );
  expect(host.querySelectorAll('.qard-stats-cell[disabled]')).toHaveLength(0);
  await click(host.querySelector('[aria-label="Study Networks"]'));
  expect(study).toHaveBeenCalledWith({ decks: ['Networks'], topics: [], cards: [] });
});

function appServices() {
  const snapshot = { revision: 0, jobs: {} };
  Object.assign(services, {
    tests: {
      getSnapshot: () => snapshot,
      subscribe: () => () => {},
      list: async () => [],
      todayList: async () => ({ checks: [], lessons: [], cards: 0 }),
      get: () => undefined,
    },
    learn: {
      getSnapshot: () => snapshot,
      subscribe: () => () => {},
      list: async () => [],
      todayList: async () => ({ checks: [], lessons: [], cards: 0 }),
    },
  });
}
it('opens from the workspace header and a command request, and returns to the deck study builder', async () => {
  appServices();
  await act(async () =>
    root.render(<QardApp services={services} request={{ serial: 1, kind: 'statistics' }} />),
  );
  expect(host.querySelector('h1')?.textContent).toBe('Statistics');
  expect(host.querySelector('[aria-label="Study statistics"]')?.getAttribute('aria-current')).toBe(
    'page',
  );
  await click(host.querySelector('[aria-label="Study Networks"]'));
  expect(host.querySelector('h1')?.textContent).toBe('Study');
  await click(host.querySelector('[aria-label="Study statistics"]'));
  expect(host.querySelector('h1')?.textContent).toBe('Statistics');
});

it('shows real FSRS memory estimates and explains incomplete migrated history', async () => {
  await services.reviews.review('a', 4, Date.now());
  await act(async () =>
    root.render(<StatisticsView services={services} back={back} study={study} />),
  );
  const panel = host.querySelector('[aria-label="FSRS memory estimates"]')!;
  expect(panel.hasAttribute('open')).toBe(false);
  await click(panel.querySelector('summary'));
  expect(panel.hasAttribute('open')).toBe(true);
  expect(panel.textContent).toContain('90% target retention');
  expect(panel.textContent).toContain('Predicted recall now100%');
  expect(panel.textContent).toContain('Median stability');
  expect(panel.textContent).not.toContain('incomplete history');
  await act(async () => {
    vi.setSystemTime(Date.now() + 7 * 86400000);
    vi.advanceTimersByTime(60_000);
  });
  expect(panel.textContent).not.toContain('Predicted recall now100%');
  await act(async () =>
    services.reviews.saveSettings({
      ...services.reviews.getSnapshot().settings,
      scheduler: 'simple',
    }),
  );
  expect(host.querySelector('[aria-label="FSRS memory estimates"]')).toBeNull();
  expect(host.textContent).not.toContain('Memory estimates');
});

it('keeps postponed cards in the forecast, excludes paused cards and explains disabled scheduling', async () => {
  const now = Date.now();
  await services.reviews.review('a', 3, now);
  const snapshot = services.reviews.getSnapshot();
  services.reviews.load({
    ...snapshot,
    states: {
      ...snapshot.states,
      a: { ...snapshot.states.a, due: now - 86400000, buriedUntil: now + 86400000 },
    },
  });
  await act(async () =>
    root.render(<StatisticsView services={services} back={back} study={study} />),
  );
  const forecast = () =>
    [...host.querySelectorAll('.qard-stats-forecast strong')].map((el) => el.textContent);
  expect(forecast()).toEqual(['0', '1', '0', '0', '0', '0', '0']);
  expect(host.querySelector('.qard-stats-deck-value.has-due')).toBeNull();
  await act(async () => services.reviews.setPaused('a', true));
  expect(forecast()).toEqual(['0', '0', '0', '0', '0', '0', '0']);
  await act(async () => services.reviews.saveSettings({ ...snapshot.settings, scheduling: false }));
  expect(host.querySelector('.qard-stats-forecast')).toBeNull();
  expect(host.querySelector('[aria-label="Upcoming reviews"]')?.textContent).toContain(
    'Scheduling is off',
  );
});

const card = (id: string, front: string) =>
  `<!-- qard-id: ${id} -->\n> [!qard]- ${front}\n> Answer\n`;
function course() {
  services.index.update(
    'asd.md',
    `---\nqard-deck: "AP::ASD"\n---\n# Agile\n${card('asd1', 'Q1')}\n# Scrum\n${card('asd2', 'Q2')}`,
  );
  services.index.update('fp.md', `---\nqard-deck: "AP::FP"\n---\n# Haskell\n${card('fp1', 'Q3')}`);
  services.index.update('ap.md', `---\nqard-deck: AP\n---\n# Admin\n${card('ap1', 'Q4')}`);
}
const rows = () =>
  [...host.querySelectorAll('.qard-stats-deck h3')].map((h) => h.textContent?.trim());
const metric = () => host.querySelector('.qard-stats-metrics dd')?.textContent;

it('limits statistics to a deck and its subdecks, with a row per subdeck and topic', async () => {
  course();
  await services.reviews.review('asd1', 1, Date.now());
  await services.reviews.review('asd2', 3, Date.now());
  await services.reviews.review('fp1', 3, Date.now());
  await services.reviews.review('a', 3, Date.now());
  const openStatistics = vi.fn(),
    openDeck = vi.fn();
  const render = (deck?: string) =>
    act(async () =>
      root.render(
        <StatisticsView
          key={deck}
          services={services}
          back={back}
          study={study}
          deck={deck}
          openStatistics={openStatistics}
          openDeck={openDeck}
        />,
      ),
    );
  await render('AP');
  expect(host.querySelector('h1')?.textContent).toBe('AP');
  expect(host.textContent).toContain('4 cards · 2 subdecks · 1 topic');
  // Networks' review is not part of this deck.
  expect(metric()).toBe('3');
  expect(host.querySelector('.qard-stats-metrics')?.textContent).toContain('67%');
  expect(host.querySelector('h2:not(.qard-stats-section-heading h2)')).toBeNull();
  expect(rows()).toEqual(['ASD', 'FP', 'Admin']);
  const asd = [...host.querySelectorAll('.qard-stats-deck')][0]!;
  expect(asd.textContent).toContain('2 of 2 cards studied');
  expect(asd.textContent).toContain('50%');
  await click(host.querySelector('[aria-label="Study ASD"]'));
  expect(study).toHaveBeenLastCalledWith({ decks: ['AP::ASD'], topics: [], cards: [] });
  await click(host.querySelector('[aria-label="Study Admin"]'));
  expect(study).toHaveBeenLastCalledWith({ decks: [], topics: ['["AP","Admin"]'], cards: [] });
  await click(button('Study cards'));
  expect(study.mock.lastCall![0].decks.sort()).toEqual(['AP', 'AP::ASD', 'AP::FP']);
  await click(host.querySelector('[aria-label="Statistics for FP"]'));
  expect(openStatistics).toHaveBeenLastCalledWith('AP::FP');
  await click(button('Open deck'));
  expect(openDeck).toHaveBeenCalledWith('AP');
  await click(button('All statistics'));
  expect(openStatistics).toHaveBeenLastCalledWith();

  await render('AP::ASD');
  expect(host.querySelector('h1')?.textContent).toBe('ASD');
  expect(rows()).toEqual(['Agile', 'Scrum']);
  expect(metric()).toBe('2');
  expect(host.querySelector('.qard-stats-deck-link')).toBeNull();
});

it('opens a deck’s statistics from its page in the app', async () => {
  course();
  appServices();
  await act(async () => root.render(<QardApp services={services} />));
  const deckRow = [...host.querySelectorAll<HTMLButtonElement>('button.qard-deck')].find(
    (b) => b.querySelector('strong')?.textContent === 'AP',
  )!;
  await click(deckRow);
  await click(host.querySelector('[aria-label="Deck statistics"]'));
  expect(host.querySelector('h1')?.textContent).toBe('AP');
  expect(rows()).toEqual(['ASD', 'FP', 'Admin']);
  await click(host.querySelector('[aria-label="Statistics for ASD"]'));
  expect(host.querySelector('h1')?.textContent).toBe('ASD');
  await click(button('All statistics'));
  expect(host.querySelector('h1')?.textContent).toBe('Statistics');
});
