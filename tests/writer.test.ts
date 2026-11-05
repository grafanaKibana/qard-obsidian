import { expect, it } from 'vitest';
import { TFile, type App } from 'obsidian';
import { CardWriter } from '../src/cards/card-writer';
import { CardIndex } from '../src/cards/card-index';
import type { VaultIndexer } from '../src/cards/indexer';
import { parseCards } from '../src/cards/parser';
import { serializeCard } from '../src/cards/source-patch';
import { clozeFront, FORMAT_BACK } from '../src/cards/card-format';
import { locationComment } from '../src/cards/card-location';
function setup(source: string, cachedDeck = 'Networks') {
  const file = new (TFile as unknown as new (path: string) => TFile)('a.md');
  let text = source;
  const index = new CardIndex();
  index.update(file.path, source);
  const app = {
    vault: {
      getAbstractFileByPath: () => file,
      read: async () => text,
      process: async (_file: unknown, transform: (s: string) => string) => {
        text = transform(text);
      },
    },
    metadataCache: { getFileCache: () => ({ frontmatter: { 'qard-deck': cachedDeck } }) },
  } as unknown as App;
  Object.assign(index, { refresh: async () => index.update(file.path, text) });
  return { writer: new CardWriter(app, index as VaultIndexer), read: () => text };
}
const draft = {
  deck: 'Networks',
  topic: 'Transport',
  front: 'TCP?',
  back: '**Reliable**',
  sourceFile: 'a.md',
  folder: 'Qard',
};
it('appends through an atomic vault operation while preserving the original note', async () => {
  const source = '---\nqard-deck: Networks\n---\n\nOriginal prose.\n';
  const { writer, read } = setup(source);
  const card = await writer.create(draft);
  expect(read().startsWith(source)).toBe(true);
  expect(card.stable).toBe(true);
  expect(card.backMarkdown).toBe('**Reliable**');
});
it('does not mutate a note with an unfinished fenced block', async () => {
  const source = '---\nqard-deck: Networks\n---\n```md\nunfinished';
  const { writer, read } = setup(source);
  await expect(writer.create(draft)).rejects.toThrow('unfinished');
  expect(read()).toBe(source);
});
it('does not write to a different deck when cached metadata is stale', async () => {
  const source = '---\nqard-deck: Changed\n---\n';
  const { writer, read } = setup(source);
  await expect(writer.create(draft)).rejects.toThrow('changed');
  expect(read()).toBe(source);
});
it('does not mutate a fixed-topic note when cached metadata omits its new topic', async () => {
  const source = '---\nqard-deck: Networks\nqard-topic: Changed\n---\n\nOriginal prose.\n';
  const { writer, read } = setup(source);
  await expect(writer.create(draft)).rejects.toThrow(/fixes its topic/);
  expect(read()).toBe(source);
});

it('assigns IDs and persists legacy sibling groups before a variant is edited', async () => {
  const text = '{{c1::TCP}} provides {{c2::reliability}}.';
  const source =
    'Prose.\n\n' +
    [1, 2]
      .map((target) =>
        serializeCard(`c${target}`, clozeFront(text, target), FORMAT_BACK).replace(
          /<!-- qard-id: .+ -->\n/,
          '',
        ),
      )
      .join('\n');
  const { writer, read } = setup(source);
  const stable = await writer.ensureStable(parseCards(source, 'a.md').cards);
  expect(stable.every((c) => c.stable && c.siblingGroup)).toBe(true);
  expect(stable[0]?.siblingGroup).toBe(stable[1]?.siblingGroup);
  const edited = await writer.edit(
    stable[0]!,
    clozeFront('{{c1::TCP}} is a transport protocol.', 1),
    'Explanation',
  );
  expect(edited.id).toBe(stable[0]?.id);
  expect(edited.siblingGroup).toBe(stable[1]?.siblingGroup);
  expect(read().startsWith('Prose.\n\n')).toBe(true);
});

it('creates a linked basic pair atomically and editing either direction updates both identities', async () => {
  const original = '---\r\nqard-deck: Networks\r\n---\r\n\r\nOriginal prose.\r\n';
  const { writer, read } = setup(original);
  const forward = await writer.create({ ...draft, reverse: true });
  const pair = parseCards(read(), 'a.md').cards;
  expect(pair).toHaveLength(2);
  const reverse = pair.find((card) => card.id === forward.reverseId)!;
  expect(reverse.reverseId).toBe(forward.id);
  expect(reverse.siblingGroup).toBe(forward.siblingGroup);
  expect(reverse.frontMarkdown).toBe(forward.backMarkdown);
  expect(reverse.backMarkdown).toBe(forward.frontMarkdown);
  expect(read().startsWith(original)).toBe(true);
  expect(read().replace(/\r\n/g, '')).not.toContain('\n');
  await writer.edit(reverse, 'Reliable delivery', 'TCP transport');
  const changed = parseCards(read(), 'a.md').cards;
  expect(changed.map((card) => card.id)).toEqual(pair.map((card) => card.id));
  expect(changed[0]).toMatchObject({
    frontMarkdown: 'TCP transport',
    backMarkdown: 'Reliable delivery',
    reverseId: reverse.id,
  });
  expect(changed[1]).toMatchObject({
    frontMarkdown: 'Reliable delivery',
    backMarkdown: 'TCP transport',
    reverseId: forward.id,
  });
  await expect(writer.edit(forward, 'Stale', 'Answer')).rejects.toThrow(/changed/);
});

it('does not write half a reverse pair when the opposite content cannot be safely serialized', async () => {
  const source = '---\nqard-deck: Networks\n---\nProse.\n';
  const { writer, read } = setup(source);
  await expect(
    writer.create({ ...draft, reverse: true, back: '```md\nUnfinished fence' }),
  ).rejects.toThrow();
  expect(read()).toBe(source);
});

function vault(initial: Record<string, string> = {}) {
  const texts: Record<string, string> = { ...initial };
  const files = new Map<string, TFile | object>();
  const makeFile = (path: string) => new (TFile as unknown as new (path: string) => TFile)(path);
  for (const path of Object.keys(texts)) files.set(path, makeFile(path));
  const index = new CardIndex();
  for (const [path, text] of Object.entries(texts)) index.update(path, text);
  Object.assign(index, {
    refresh: async (file: TFile) => index.update(file.path, texts[file.path]!),
  });
  const app = {
    vault: {
      getAbstractFileByPath: (p: string) => files.get(p),
      getMarkdownFiles: () => [...files.values()].filter((f): f is TFile => f instanceof TFile),
      createFolder: async (p: string) => void files.set(p, {}),
      create: async (path: string, text: string) => {
        const file = makeFile(path);
        files.set(path, file);
        texts[path] = text;
        return file;
      },
      read: async (f: TFile) => texts[f.path],
      process: async (f: TFile, patch: (s: string) => string) => {
        texts[f.path] = patch(texts[f.path]!);
      },
    },
    metadataCache: {
      getFileCache: (f: TFile) => {
        const deck = texts[f.path]?.match(/^---\nqard-deck: "?([^"\n]+)"?\n/)?.[1];
        const topic = texts[f.path]?.match(/^qard-topic: "?([^"\n]*)"?$/m)?.[1];
        return deck ? { frontmatter: { 'qard-deck': deck, 'qard-topic': topic } } : null;
      },
    },
  } as unknown as App;
  return { writer: new CardWriter(app, index as VaultIndexer), texts, index };
}
const fresh = { deck: 'Bio', topic: 'Cells', front: 'Q?', back: 'A', folder: 'Qard' };

it('uses a compatible sibling when the explicit source fixes another topic', async () => {
  const notes = {
    'Notes/Fixed.md': '---\nqard-deck: Bio\nqard-topic: Genes\n---\n\nOriginal prose.\n',
    'Notes/Cells.md': '---\nqard-deck: Bio\nqard-topic: Cells\n---\n\nSibling prose.\n',
    'Qard/Bio.md': '---\nqard-deck: Bio\n---\n# Cells\n\n' + serializeCard('old', 'Old?', 'Old'),
  };
  const { writer, texts } = vault(notes);
  const card = await writer.create({ ...fresh, sourceFile: 'Notes/Fixed.md' });
  expect(card).toMatchObject({ sourceFile: 'Notes/Cells.md', deck: 'Bio', topic: 'Cells' });
  expect(texts['Notes/Fixed.md']).toBe(notes['Notes/Fixed.md']);
  expect(texts['Qard/Bio.md']).toBe(notes['Qard/Bio.md']);
  expect(Object.keys(texts)).toEqual(Object.keys(notes));
});
it('creates a sibling deck note when an incompatible explicit source has no compatible sibling', async () => {
  const notes = {
    'Notes/Fixed.md': '---\nqard-deck: Bio\nqard-topic: Genes\n---\n\nOriginal prose.\n',
    'Qard/Bio.md': '---\nqard-deck: Bio\n---\n# Cells\n\n' + serializeCard('old', 'Old?', 'Old'),
  };
  const { writer, texts } = vault(notes);
  const card = await writer.create({ ...fresh, sourceFile: 'Notes/Fixed.md' });
  expect(card).toMatchObject({ sourceFile: 'Notes/Bio.md', deck: 'Bio', topic: 'Cells' });
  expect(texts['Notes/Fixed.md']).toBe(notes['Notes/Fixed.md']);
  expect(texts['Qard/Bio.md']).toBe(notes['Qard/Bio.md']);
  expect(parseCards(texts['Notes/Bio.md']!, 'Notes/Bio.md').cards).toHaveLength(1);
});
it.each([false, true])(
  'adds to a matching fixed-topic note with existing cards: %s',
  async (hasCard) => {
    const source =
      '---\nqard-deck: Bio\nqard-topic: " Cells "\n---\n\nOriginal prose.\n\n' +
      (hasCard ? serializeCard('old', 'Old?', 'Old') : '');
    const { writer, texts } = vault({ 'Notes/Fixed.md': source });
    const card = await writer.create({ ...fresh, sourceFile: 'Notes/Fixed.md' });
    expect(card).toMatchObject({ sourceFile: 'Notes/Fixed.md', deck: 'Bio', topic: 'Cells' });
    expect(texts['Notes/Fixed.md']!.startsWith(source)).toBe(true);
    expect(Object.keys(texts)).toEqual(['Notes/Fixed.md']);
    if (hasCard) {
      expect(parseCards(texts['Notes/Fixed.md']!, 'Notes/Fixed.md').cards[0]).toMatchObject({
        id: 'old',
        frontMarkdown: 'Old?',
        backMarkdown: 'Old',
      });
    }
  },
);
it('inherits a matching moved-card topic inside a note fixed to another topic', async () => {
  const source =
    '---\nqard-deck: Bio\nqard-topic: Genes\n---\n\nOriginal prose.\n\n' +
    locationComment({ deck: 'Bio', topic: 'Cells' }) +
    '\n' +
    serializeCard('moved', 'Old?', 'Old');
  const { writer, texts } = vault({ 'Notes/Fixed.md': source });
  const card = await writer.create({ ...fresh, sourceFile: 'Notes/Fixed.md' });
  expect(card).toMatchObject({
    sourceFile: 'Notes/Fixed.md',
    deck: 'Bio',
    topic: 'Cells',
    location: { deck: 'Bio', topic: 'Cells' },
  });
  expect(texts['Notes/Fixed.md']!.startsWith(source)).toBe(true);
  expect(Object.keys(texts)).toEqual(['Notes/Fixed.md']);
  expect(parseCards(texts['Notes/Fixed.md']!, 'Notes/Fixed.md').cards[0]).toMatchObject({
    id: 'moved',
    frontMarkdown: 'Old?',
    backMarkdown: 'Old',
    location: { deck: 'Bio', topic: 'Cells' },
  });
});

it('keeps adding dashboard cards to one deck note, under the existing topic heading', async () => {
  const { writer, texts } = vault();
  await writer.create(fresh);
  await writer.create({ ...fresh, front: 'Q2?' });
  await writer.create({ ...fresh, topic: 'Genes', front: 'Q3?', reverse: true });
  await writer.create({ ...fresh, front: 'Q4?' });
  expect(Object.keys(texts)).toEqual(['Qard/Bio.md']);
  const text = texts['Qard/Bio.md']!;
  expect(text.match(/^# /gm)).toHaveLength(2);
  expect(text.match(/^qard-deck/gm)).toHaveLength(1);
  expect(parseCards(text, 'Qard/Bio.md').cards.map((c) => `${c.topic}:${c.frontMarkdown}`)).toEqual(
    ['Cells:Q?', 'Cells:Q2?', 'Cells:Q4?', 'Genes:Q3?', 'Genes:A'],
  );
});
it('adds to the note that already holds the topic and leaves other decks alone', async () => {
  const notes = {
    'Notes/Biology.md': '---\nqard-deck: Bio\n---\n# Cells\n\n' + serializeCard('x', 'Old?', 'Old'),
    'Qard/Chem.md': '---\nqard-deck: Chem\n---\n',
  };
  const { writer, texts } = vault(notes);
  await writer.create(fresh);
  expect(Object.keys(texts).sort()).toEqual(['Notes/Biology.md', 'Qard/Chem.md']);
  expect(parseCards(texts['Notes/Biology.md']!, 'n.md').cards).toHaveLength(2);
  await writer.create({ ...fresh, deck: 'Physics' });
  expect(texts['Qard/Physics.md']).toContain('# Cells');
});
it('puts editor cloze batches into the deck note instead of a new note each time', async () => {
  const { writer, texts } = vault();
  await writer.create(fresh);
  for (const batch of ['one', 'two']) {
    const { path } = writer.targetFor('Bio', 'Cells', 'Qard');
    const target = {
      deck: 'Bio',
      topic: 'Cells',
      folder: 'Qard',
      batchId: batch,
      label: 'cloze' as const,
      path,
    };
    await writer.createBatch({ ...target, siblingGroup: batch }, [
      { id: `${batch}-1`, front: clozeFront('{{c1::A}} {{c2::B}}', 1), back: FORMAT_BACK },
      { id: `${batch}-2`, front: clozeFront('{{c1::A}} {{c2::B}}', 2), back: FORMAT_BACK },
    ]);
    // A retry after a failed refresh must not duplicate.
    await writer.createBatch({ ...target, siblingGroup: batch }, [
      { id: `${batch}-1`, front: clozeFront('{{c1::A}} {{c2::B}}', 1), back: FORMAT_BACK },
    ]);
  }
  expect(Object.keys(texts)).toEqual(['Qard/Bio.md']);
  const cards = parseCards(texts['Qard/Bio.md']!, 'Qard/Bio.md').cards;
  expect(cards.map((c) => c.siblingGroup ?? '-')).toEqual(['-', 'one', 'one', 'two', 'two']);
  expect(texts['Qard/Bio.md']!.match(/^# /gm)).toHaveLength(1);
});
it('adds and removes reverses on existing cards', async () => {
  const { writer, texts, index } = vault();
  const basic = await writer.create(fresh);
  const { added, skipped } = await writer.addReverses([basic]);
  expect(skipped).toBe(0);
  expect(added[0]!.reverseId).toBeTruthy();
  expect(index.getSnapshot().cards).toHaveLength(2);
  const left = await writer.removeReverse(added[0]!);
  expect(left.reverseId).toBeUndefined();
  expect(parseCards(texts['Qard/Bio.md']!, 'Qard/Bio.md').cards).toHaveLength(1);
  const again = await writer.addReverses([left, left]);
  expect(again).toMatchObject({ added: [{ id: left.id }], skipped: 1 });
});
