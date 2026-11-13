// @vitest-environment jsdom
import { act } from 'preact/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { useState, useSyncExternalStore } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { TopicBrowser } from '../src/components/TopicBrowser';
import { buildDeckTree, findDeckNode } from '../src/decks/deck-index';
import { serializeCard } from '../src/cards/source-patch';
import { transferFixture } from './transfer-fixture';
import { CardWriter } from '../src/cards/card-writer';
import type { VaultIndexer } from '../src/cards/indexer';

let host: HTMLDivElement, root: Root;
afterEach(async () => {
  if (root) {
    await act(async () => root.unmount());
    host.remove();
  }
});
const buttons = () => Array.from(host.querySelectorAll<HTMLButtonElement>('button'));
const click = async (button: HTMLButtonElement | undefined) => {
  expect(button).toBeTruthy();
  await act(async () => {
    button!.click();
    await new Promise((resolve) => setTimeout(resolve, 5));
  });
};
const byText = (text: string) => buttons().find((b) => b.textContent?.trim() === text);
const type = async (element: HTMLInputElement, value: string) => {
  await act(async () => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
};
const topicNames = () =>
  Array.from(host.querySelectorAll('.qard-topic-heading strong')).map((el) => el.textContent);
const checked = () =>
  Array.from(host.querySelectorAll<HTMLInputElement>('.qard-new-subdeck-topics input'))
    .filter((input) => input.checked)
    .map((input) => input.closest('label')!.querySelector('span')!.textContent);

async function render() {
  const f = transferFixture();
  Object.assign(f.app.vault, {
    process: async (file: { path: string }, transform: (text: string) => string) => {
      f.texts[file.path] = transform(f.texts[file.path]!);
    },
  });
  const topics = ['ASD 03 — Agile', 'ASD 04 — Scrum', 'FP 01 — Haskell', 'TOA 01 — Introduction'];
  await f.refresh(
    await f.create(
      'ap.md',
      '---\nqard-deck: Advanced Programming\n---\n' +
        topics
          .map((topic, i) => `# ${topic}\n${serializeCard(`card-${i}`, `Q${i}?`, `A${i}.`)}`)
          .join('\n'),
    ),
  );
  const writer = new CardWriter(f.app, f.index as VaultIndexer);
  const studyDecks = vi.fn();
  // The same wiring as the app's deck screen.
  function Harness() {
    const snapshot = useSyncExternalStore(f.index.subscribe, f.index.getSnapshot);
    const [name, setName] = useState('Advanced Programming');
    const node = findDeckNode(buildDeckTree(snapshot.decks), name);
    const deck =
      snapshot.decks.find((d) => d.name === name) ??
      (node?.children.length ? { name, topics: [], cards: [], files: [] } : undefined);
    return deck ? (
      <TopicBrowser
        key={deck.name}
        deck={deck}
        title={node?.label}
        subdecks={node?.children}
        openDeck={setName}
        studyDecks={studyDecks}
        moveTopics={async (moving, to) => {
          await writer.moveTopics(deck.name, moving, to);
        }}
        select={() => {}}
        create={() => {}}
        study={() => {}}
      />
    ) : (
      <p>No cards</p>
    );
  }
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(<Harness />));
  return { ...f, studyDecks };
}

it('groups topics picked by name into a subdeck and lists it above the remaining topics', async () => {
  const f = await render();
  await click(byText('New subdeck'));
  const name = host.querySelector<HTMLInputElement>('.qard-new-subdeck input:not([type])')!;
  await type(name, 'ASD');
  expect(checked()).toEqual(['ASD 03 — Agile', 'ASD 04 — Scrum']);
  // Ticking by hand takes over from the name.
  const toa = Array.from(
    host.querySelectorAll<HTMLInputElement>('.qard-new-subdeck-topics input'),
  )[3]!;
  await act(async () => toa.click());
  expect(checked()).toEqual(['ASD 03 — Agile', 'ASD 04 — Scrum', 'TOA 01 — Introduction']);
  await act(async () => toa.click());
  await click(byText('Move 2 topics (2 cards)'));

  expect(f.texts['ap.md']).toContain('<!-- qard-location: {"deck":"Advanced Programming::ASD"');
  expect(host.textContent).toContain('Moved 2 topics into ASD.');
  expect(host.querySelector('.qard-new-subdeck')).toBeNull();
  expect(topicNames()).toEqual(['FP 01 — Haskell', 'TOA 01 — Introduction']);
  const row = host.querySelector('.qard-subdeck')!;
  expect(row.textContent).toContain('ASD');
  expect(row.textContent).toContain('2 cards · 2 topics');
  expect(host.querySelector('h1')?.textContent).toBe('Advanced Programming');
  expect(host.textContent).toContain('2 cards · 2 topics · 1 subdeck (2 cards)');

  await click(host.querySelector<HTMLButtonElement>('button[aria-label="Study ASD"]')!);
  expect(f.studyDecks).toHaveBeenCalledWith(['Advanced Programming::ASD']);
  await click(host.querySelector<HTMLButtonElement>('.qard-subdeck-open')!);
  expect(host.querySelector('h1')?.textContent).toBe('ASD');
  expect(topicNames()).toEqual(['ASD 03 — Agile', 'ASD 04 — Scrum']);
});

it('keeps the parent page once every topic has moved into subdecks', async () => {
  const f = await render();
  for (const [prefix, count] of [
    ['FP', 1],
    ['TOA', 1],
    ['ASD', 2],
  ] as const) {
    await click(byText('New subdeck'));
    await type(
      host.querySelector<HTMLInputElement>('.qard-new-subdeck input:not([type])')!,
      prefix,
    );
    await click(
      byText(
        `Move ${count} ${count === 1 ? 'topic' : 'topics'} (${count} ${count === 1 ? 'card' : 'cards'})`,
      ),
    );
  }
  // The last move took every card still named by the note, so the note's own deck name changed.
  expect(f.texts['ap.md']).toContain('qard-deck: "Advanced Programming::ASD"');
  expect(f.texts['ap.md']!.match(/qard-location/g)).toHaveLength(2);
  expect(f.texts['ap.md']).toContain('"deck":"Advanced Programming::FP"');
  expect(host.querySelector('h1')?.textContent).toBe('Advanced Programming');
  expect(topicNames()).toEqual([]);
  expect(
    Array.from(host.querySelectorAll('.qard-subdeck strong')).map((s) => s.textContent),
  ).toEqual(['ASD', 'FP', 'TOA']);
  expect(host.textContent).toContain('4 cards · 3 subdecks');
  expect(host.textContent).not.toContain('No topics in this deck.');
  expect(byText('New subdeck')).toBeUndefined();
});

it('reports when no topic is chosen and leaves the notes alone', async () => {
  const f = await render();
  const before = f.texts['ap.md'];
  await click(byText('New subdeck'));
  await type(
    host.querySelector<HTMLInputElement>('.qard-new-subdeck input:not([type])')!,
    'Nothing',
  );
  await click(byText('Move topics'));
  expect(host.querySelector('[role=alert]')?.textContent).toBe(
    'Choose at least one topic to move into it.',
  );
  expect(f.texts['ap.md']).toBe(before);
});
