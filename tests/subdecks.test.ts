import { expect, it } from 'vitest';
import { parseCards } from '../src/cards/parser';
import { moveTopicsInSource } from '../src/cards/source-patch';
import { buildDeckTree, buildDecks, findDeckNode, topicKey } from '../src/decks/deck-index';
import { topicMatchesPrefix } from '../src/components/NewSubdeck';
import { ReviewStore } from '../src/review/review-store';

const card = (id: string, front: string, back: string) =>
  `<!-- qard-id: ${id} -->\n> [!qard]- ${front}\n> ${back}\n`;
const placement = (source: string, path: string) =>
  parseCards(source, path).cards.map((c) => [c.id, c.deck, c.topic]);
const callouts = (source: string, path: string) =>
  parseCards(source, path).cards.map((c) =>
    source.slice(c.sourcePosition.calloutStart, c.sourcePosition.end),
  );

it('moves a note whose topics all go into the subdeck by changing its qard-deck', () => {
  const source =
    `---\nqard-deck: Advanced Programming\n---\n# ASD 03 — Agile\n${card('a', 'Q1', 'A1')}\n` +
    `# ASD 04 — Scrum\n${card('b', 'Q2', 'A2')}`;
  const next = moveTopicsInSource(source, 'asd.md', {
    deck: 'Advanced Programming',
    topics: ['ASD 03 — Agile', 'ASD 04 — Scrum'],
    to: 'Advanced Programming::ASD',
  });
  expect(next).toBe(
    source.replace('qard-deck: Advanced Programming', 'qard-deck: "Advanced Programming::ASD"'),
  );
  expect(placement(next, 'asd.md')).toEqual([
    ['a', 'Advanced Programming::ASD', 'ASD 03 — Agile'],
    ['b', 'Advanced Programming::ASD', 'ASD 04 — Scrum'],
  ]);
});

it('gives only the moving cards a location when the note mixes sections', () => {
  const source =
    `---\nqard-deck: AP\n---\n# FP 01 — Haskell\n${card('a', 'Q1', 'A1')}\n` +
    `# TOA 02 — Efficiency\n${card('b', 'Q2', 'A2')}\n` +
    `<!-- qard-location: {"deck":"Other","topic":"FP 01 — Haskell"} -->\n${card('c', 'Q3', 'A3')}`;
  const next = moveTopicsInSource(source, 'mixed.md', {
    deck: 'AP',
    topics: ['FP 01 — Haskell'],
    to: 'AP::FP',
  });
  expect(next).toContain('qard-deck: AP\n');
  expect(placement(next, 'mixed.md')).toEqual([
    ['a', 'AP::FP', 'FP 01 — Haskell'],
    ['b', 'AP', 'TOA 02 — Efficiency'],
    ['c', 'Other', 'FP 01 — Haskell'],
  ]);
  expect(callouts(next, 'mixed.md')).toEqual(callouts(source, 'mixed.md'));
  expect(
    moveTopicsInSource(source, 'mixed.md', { deck: 'AP', topics: ['Missing'], to: 'AP::X' }),
  ).toBe(source);
});

it('moves cards that already have their own location', () => {
  const source =
    `# Intro\n${card('a', 'Q1', 'A1')}\n` +
    `<!-- qard-location: {"deck":"AP","topic":"ASD 12 — Antipatterns"} -->\n${card('b', 'Q2', 'A2')}`;
  const next = moveTopicsInSource(source, 'n.md', {
    deck: 'AP',
    topics: ['ASD 12 — Antipatterns'],
    to: 'AP::ASD',
  });
  expect(placement(next, 'n.md')).toEqual([
    ['a', 'n', 'Intro'],
    ['b', 'AP::ASD', 'ASD 12 — Antipatterns'],
  ]);
  expect(next.match(/qard-location/g)).toHaveLength(1);
});

it('picks topics that start with the subdeck name as a whole word', () => {
  expect(topicMatchesPrefix('ASD 02 — Software Engineering Methods', 'asd')).toBe(true);
  expect(topicMatchesPrefix('ASD: Scrum', 'ASD')).toBe(true);
  expect(topicMatchesPrefix('ASDF basics', 'ASD')).toBe(false);
  expect(topicMatchesPrefix('TOA 01', '')).toBe(false);
  expect(topicMatchesPrefix('FP', ' fp ')).toBe(true);
});

it('finds parents that only group subdecks', () => {
  const cards = parseCards(`---\nqard-deck: "AP::FP"\n---\n${card('a', 'Q', 'A')}`, 'fp.md').cards;
  const tree = buildDeckTree(buildDecks(cards));
  expect(findDeckNode(tree, 'AP')?.children.map((n) => n.label)).toEqual(['FP']);
  expect(findDeckNode(tree, 'AP::FP')?.deck?.cards).toHaveLength(1);
  expect(findDeckNode(tree, 'Missing')).toBeUndefined();
});

it('keeps exam plans covering topics that move into a subdeck', async () => {
  const store = new ReviewStore(async () => {});
  const plan = (id: string, decks: string[], topics: string[]) =>
    store.saveExam({
      id,
      name: id,
      date: '2030-01-10',
      selection: { decks, topics, cards: [] },
      weekdays: [1],
      dailyLimit: 10,
      createdAt: 1,
    });
  await plan('whole', ['AP'], []);
  await plan('one', [], [topicKey('AP', 'FP 01'), topicKey('AP', 'TOA 01')]);
  await plan('other', ['Networks'], []);
  await store.moveTopics({ deck: 'AP', topics: ['FP 01', 'FP 02'], to: 'AP::FP' });
  const selection = (id: string) => store.getSnapshot().exams.find((p) => p.id === id)!.selection;
  expect(selection('whole')).toEqual({
    decks: ['AP'],
    topics: [topicKey('AP::FP', 'FP 01'), topicKey('AP::FP', 'FP 02')],
    cards: [],
  });
  expect(selection('one').topics).toEqual([topicKey('AP', 'TOA 01'), topicKey('AP::FP', 'FP 01')]);
  expect(selection('other')).toEqual({ decks: ['Networks'], topics: [], cards: [] });
});
