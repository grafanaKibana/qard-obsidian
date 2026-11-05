import { locationComment, readCardLocation, type CardLocation } from './card-location';
import { renamedDeck } from '../decks/deck-index';
import type { QardCard } from './card-types';
import { parseCards, sameContent, sourceLines, topicSections } from './parser';
import { siblingGroup } from './siblings';
import { readCardFormat } from './card-format';

/** Persist legacy group identities before an edit or ID assignment can change their content. */
export function ensureSiblingGroupsInSource(source: string, path: string): string {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  for (const card of parseCards(source, path).cards.reverse()) {
    const group = siblingGroup(card);
    if (group && !card.siblingGroup) {
      source =
        source.slice(0, card.sourcePosition.start) +
        `<!-- qard-siblings: ${group} -->${eol}` +
        source.slice(card.sourcePosition.start);
    }
  }
  return source;
}
export function locateCard(
  source: string,
  card: QardCard,
  parsed = parseCards(source, card.sourceFile).cards,
): QardCard {
  const matches = card.stable
    ? parsed.filter((c) => c.stable && c.id === card.id)
    : parsed.filter((c) => !c.stable && sameContent(c, card));
  if (matches.length !== 1) {
    throw new Error(
      'The card moved, was changed, or has an ambiguous ID. Reopen it from the library before editing.',
    );
  }
  const match = matches[0]!;
  if (!sameContent(match, card) || match.reverseId !== card.reverseId) {
    throw new Error('This card changed in your note. Reopen it to avoid overwriting your edits.');
  }
  return match;
}
export function ensureIdInSource(
  source: string,
  card: QardCard,
  id: string,
): { source: string; card: QardCard } {
  const current = locateCard(source, card);
  if (current.stable) {
    return { source, card: current };
  }
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const updated =
    source.slice(0, current.sourcePosition.calloutStart) +
    `<!-- qard-id: ${id} -->${eol}` +
    source.slice(current.sourcePosition.calloutStart);
  const found = parseCards(updated, card.sourceFile).cards.find((c) => c.id === id);
  if (!found) {
    throw new Error('Could not safely assign a card ID.');
  }
  return { source: updated, card: found };
}
export function serializeCard(
  id: string,
  front: string,
  back: string,
  eol = '\n',
  group?: string,
  location?: CardLocation,
  reverseId?: string,
): string {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error('Invalid card ID.');
  }
  front = front.replace(/\r\n?/g, '\n').trim();
  back = back.replace(/\r\n?/g, '\n').trim();
  if (!front || !back) {
    throw new Error('Both the question and answer are required.');
  }
  const [first, ...rest] = front.split('\n');
  const lines = [`<!-- qard-id: ${id} -->`, `> [!qard]- ${first}`];
  if (group) {
    if (!/^[A-Za-z0-9_-]+$/.test(group)) {
      throw new Error('Invalid sibling group.');
    }
    lines.unshift(`<!-- qard-siblings: ${group} -->`);
  }
  if (location) {
    lines.unshift(locationComment(location));
  }
  if (reverseId) {
    if (
      !/^[A-Za-z0-9_-]+$/.test(reverseId) ||
      reverseId === id ||
      readCardFormat(front).kind !== 'basic'
    ) {
      throw new Error('Reverse pairs need distinct IDs and basic question/answer content.');
    }
    lines.unshift(`<!-- qard-reverse: ${reverseId} -->`);
  }
  const content = rest.length
    ? [...rest, '<!-- qard-answer -->', ...back.split('\n')]
    : back.split('\n');
  lines.push(...content.map((line) => (line ? `> ${line}` : '>')));
  const serialized = lines.join(eol) + eol;
  const parsed = parseCards(serialized, 'validation.md');
  if (
    parsed.cards.length !== 1 ||
    parsed.cards[0]?.frontMarkdown !== front ||
    parsed.cards[0]?.backMarkdown !== back
  ) {
    throw new Error(
      'This content includes a reserved Qard boundary or malformed Markdown fence. Put literal Qard syntax inside a fenced code block.',
    );
  }
  return serialized;
}
export function replaceCardInSource(
  source: string,
  original: QardCard,
  front: string,
  back: string,
  id: string,
): string {
  source = ensureSiblingGroupsInSource(source, original.sourceFile);
  const current = locateCard(source, original);
  if (current.reverseId) {
    const partner = parseCards(source, original.sourceFile).cards.filter(
      (card) => card.id === current.reverseId,
    );
    if (
      partner.length !== 1 ||
      partner[0]!.reverseId !== current.id ||
      partner[0]!.frontMarkdown !== current.backMarkdown ||
      partner[0]!.backMarkdown !== current.frontMarkdown
    ) {
      throw new Error(
        'This reverse pair changed in the note. Restore matching opposite content and links before editing.',
      );
    }
    if (readCardFormat(front).kind !== 'basic' || readCardFormat(back).kind !== 'basic') {
      throw new Error('Linked reverse pairs must remain basic cards.');
    }
    for (const entry of [
      { card: current, front, back, id },
      { card: partner[0]!, front: back, back: front, id: partner[0]!.id },
    ].sort((a, b) => b.card.sourcePosition.start - a.card.sourcePosition.start)) {
      source = replaceSingleCard(source, entry.card, entry.front, entry.back, entry.id);
    }
    return source;
  }
  return replaceSingleCard(source, current, front, back, id);
}
function replaceSingleCard(
  source: string,
  current: QardCard,
  front: string,
  back: string,
  id: string,
) {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  let replacement = serializeCard(
    id,
    front,
    back,
    eol,
    current.siblingGroup,
    current.location,
    current.reverseId,
  );
  if (!/[\r\n]$/.test(current.sourceText)) {
    replacement = replacement.slice(0, -eol.length);
  }
  return (
    source.slice(0, current.sourcePosition.start) +
    replacement +
    source.slice(current.sourcePosition.end)
  );
}
export function deleteCardInSource(source: string, original: QardCard): string {
  const current = locateCard(source, original);
  const next =
    source.slice(0, current.sourcePosition.start) + source.slice(current.sourcePosition.end);
  return unlinkRemovedReverse(next, original.sourceFile, new Set([current.id]));
}
function unlinkRemovedReverse(source: string, path: string, removed: Set<string>) {
  for (const card of parseCards(source, path).cards.sort(
    (a, b) => b.sourcePosition.start - a.sourcePosition.start,
  )) {
    if (card.reverseId && removed.has(card.reverseId)) {
      const prefix = source
        .slice(card.sourcePosition.start, card.sourcePosition.calloutStart)
        .replace(/^\s*<!-- qard-reverse: [A-Za-z0-9_-]+ -->[\r\n]*/m, '');
      source =
        source.slice(0, card.sourcePosition.start) +
        prefix +
        source.slice(card.sourcePosition.calloutStart);
    }
  }
  return source;
}

/** Remove a deck/topic's current callouts by range; preserve all other note content. */
export function deleteGroupInSource(
  source: string,
  path: string,
  deck: string,
  topic?: string,
): string {
  const cards = parseCards(source, path).cards.filter(
    (c) => c.deck === deck && (topic === undefined || c.topic === topic),
  );
  for (const card of cards.sort((a, b) => b.sourcePosition.start - a.sourcePosition.start)) {
    source = source.slice(0, card.sourcePosition.start) + source.slice(card.sourcePosition.end);
  }
  return unlinkRemovedReverse(source, path, new Set(cards.map((card) => card.id)));
}

/** Only placement metadata changes; the callout, note prose and attachment paths stay byte-for-byte intact. */
export function placeCardInSource(
  source: string,
  card: QardCard,
  location: CardLocation,
  parsed?: QardCard[],
): string {
  return placeParsedCard(source, locateCard(source, card, parsed), location);
}
/** `current` must come from parsing this exact source. */
function placeParsedCard(source: string, current: QardCard, location: CardLocation): string {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const prefix = source
    .slice(current.sourcePosition.start, current.sourcePosition.calloutStart)
    .split(/\r\n|\n|\r/)
    .filter((line) => !/^\s*<!-- qard-location: /.test(line))
    .join(eol);
  return (
    source.slice(0, current.sourcePosition.start) +
    locationComment(location) +
    eol +
    prefix +
    source.slice(current.sourcePosition.calloutStart)
  );
}

/** Insert at `at` with one blank line on each side, so a callout never runs into nearby text. */
function insertBlock(source: string, at: number, block: string, eol: string) {
  let before = source.slice(0, at);
  const after = source.slice(at);
  if (before && !/[\r\n]$/.test(before)) {
    before += eol;
  }
  if (before && !/(?:\r\n|\n|\r){2}$/.test(before) && before !== eol) {
    before += eol;
  }
  return before + block + (after && !/^[\r\n]/.test(after) ? eol : '') + after;
}
/**
 * Put new card markup where a card of `deck`/`topic` belongs in this note: after the topic's last
 * card, else at the end of its last heading section, else under a new heading at the end. Location
 * overrides are inherited when the only cards of the topic were moved here from another deck.
 */
export function insertIntoTopic(
  source: string,
  path: string,
  deck: string,
  topic: string,
  content: (eol: string, location?: CardLocation) => string,
): string {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const note = topicSections(source, path);
  if (!note) {
    throw new Error('This note has invalid frontmatter. Fix it or choose another note.');
  }
  const matching = parseCards(source, path).cards.filter(
    (card) => card.deck === deck && card.topic === topic,
  );
  const anchor = matching.filter((card) => !card.location).at(-1) ?? matching.at(-1);
  if (anchor) {
    return insertBlock(source, anchor.sourcePosition.end, content(eol, anchor.location), eol);
  }
  if (note.fixedTopic && note.fixedTopic !== topic) {
    throw new Error(
      `This note fixes its topic to “${note.fixedTopic}”. Choose that topic or create the card in a new note.`,
    );
  }
  if (note.deck !== deck) {
    throw new Error('This note changed or belongs to another deck. Choose another note.');
  }
  const section = [...note.sections].reverse().find((entry) => entry.topic === topic);
  if (section) {
    const lines = sourceLines(source);
    let last = section.end - 1;
    while (last >= section.line && !lines[last]?.text.trim()) {
      last--;
    }
    const at = lines[last]?.end ?? 0;
    return insertBlock(source, at, content(eol), eol);
  }
  return (
    source +
    (!source || source.endsWith(eol + eol) ? '' : source.endsWith(eol) ? eol : eol + eol) +
    `# ${topic}${eol}${eol}` +
    content(eol)
  );
}

export interface SourceEdit {
  at: number;
  text: string;
}
/** Apply insertions given as offsets into the original source. */
export function applyEdits(source: string, edits: SourceEdit[]): string {
  for (const edit of [...edits].sort((a, b) => b.at - a.at)) {
    source = source.slice(0, edit.at) + edit.text + source.slice(edit.at);
  }
  return source;
}
export function canReverse(card: QardCard): boolean {
  return (
    !card.reverseId &&
    !card.duplicateId &&
    readCardFormat(card.frontMarkdown).kind === 'basic' &&
    readCardFormat(card.backMarkdown).kind === 'basic'
  );
}
/**
 * Link a basic card to a new opposite card placed right after it. Only comment lines are added
 * above the card; its callout stays byte-for-byte intact. `id` names a card that has no ID yet.
 */
export function reversePairEdits(
  source: string,
  card: QardCard,
  ids: { reverseId: string; group: string; id?: string },
): SourceEdit[] {
  const current = locateCard(source, card);
  if (!canReverse(current)) {
    throw new Error('Only basic cards without a reverse can get one.');
  }
  const id = current.stable ? current.id : ids.id;
  if (!id) {
    throw new Error('Assign a card ID before adding a reverse.');
  }
  const group = current.siblingGroup ?? ids.group;
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const partner = serializeCard(
    ids.reverseId,
    current.backMarkdown,
    current.frontMarkdown,
    eol,
    group,
    current.location,
    id,
  );
  const comments = [
    `<!-- qard-reverse: ${ids.reverseId} -->`,
    ...(current.siblingGroup ? [] : [`<!-- qard-siblings: ${group} -->`]),
    ...(current.stable ? [] : [`<!-- qard-id: ${id} -->`]),
  ];
  const end = current.sourcePosition.end;
  const after = source.slice(end);
  return [
    { at: current.sourcePosition.start, text: comments.map((line) => line + eol).join('') },
    {
      at: end,
      text:
        (/[\r\n]$/.test(current.sourceText) ? '' : eol) +
        eol +
        partner +
        (after && !/^[\r\n]/.test(after) ? eol : ''),
    },
  ];
}
export function addReverseInSource(
  source: string,
  card: QardCard,
  ids: { reverseId: string; group: string; id?: string },
): string {
  const next = applyEdits(source, reversePairEdits(source, card, ids));
  const id = card.stable ? card.id : ids.id;
  const parsed = parseCards(next, card.sourceFile).cards;
  const original = parsed.filter((c) => c.id === id);
  const partner = parsed.filter((c) => c.id === ids.reverseId);
  if (
    original.length !== 1 ||
    partner.length !== 1 ||
    original[0]!.reverseId !== ids.reverseId ||
    partner[0]!.reverseId !== id ||
    partner[0]!.frontMarkdown !== original[0]!.backMarkdown ||
    partner[0]!.backMarkdown !== original[0]!.frontMarkdown ||
    partner[0]!.deck !== original[0]!.deck ||
    partner[0]!.topic !== original[0]!.topic
  ) {
    throw new Error('The reverse card could not be added safely to this note.');
  }
  return next;
}
/** Delete the opposite card of a pair and unlink the one that stays. */
export function removeReverseInSource(source: string, card: QardCard): string {
  const current = locateCard(source, card);
  const partner = parseCards(source, card.sourceFile).cards.filter(
    (c) => c.id === current.reverseId,
  );
  if (!current.reverseId || partner.length !== 1 || partner[0]!.reverseId !== current.id) {
    throw new Error('This reverse pair changed in the note. Reopen the card before removing it.');
  }
  return deleteCardInSource(source, partner[0]!);
}
/** The card whose markup, including its comment lines, covers this line. */
export function cardAtLine(source: string, cards: QardCard[], line: number): QardCard | undefined {
  const at = sourceLines(source)[line]?.start;
  return at === undefined
    ? undefined
    : cards.find((card) => card.sourcePosition.start <= at && at < card.sourcePosition.end);
}

/** The line holding a top-level frontmatter key, with the frontmatter's closing line. */
function frontmatterEntry(source: string, key: string) {
  const lines = sourceLines(source);
  if (lines[0]?.text.replace(/^\uFEFF/, '') !== '---') {
    return undefined;
  }
  const end = lines.findIndex((line, i) => i > 0 && /^(---|\.\.\.)\s*$/.test(line.text));
  if (end < 0) {
    return undefined;
  }
  const at = lines.findIndex(
    (line, i) =>
      i > 0 && i < end && line.text.startsWith(key) && /^\s*:/.test(line.text.slice(key.length)),
  );
  return { lines, end, at };
}
/** Set one frontmatter string, adding frontmatter when the note has none. Other lines stay as written. */
export function setFrontmatterValue(source: string, key: string, value: string): string {
  const eol = source.includes('\r\n') ? '\r\n' : '\n',
    entry = `${key}: ${JSON.stringify(value)}`;
  const found = frontmatterEntry(source, key);
  if (!found) {
    const bom = source.startsWith('\uFEFF') ? '\uFEFF' : '';
    return `${bom}---${eol}${entry}${eol}---${eol}` + source.slice(bom.length);
  }
  const { lines, end, at } = found;
  if (at < 0) {
    return source.slice(0, lines[end]!.start) + entry + eol + source.slice(lines[end]!.start);
  }
  // An indented continuation belongs to the old value.
  let last = at;
  while (last + 1 < end && /^[ \t]/.test(lines[last + 1]!.text)) {
    last++;
  }
  return source.slice(0, lines[at]!.start) + entry + eol + source.slice(lines[last]!.end);
}

export type GroupRename = { deck: string; topic?: string; to: string };
/** Where a card belongs after the rename, or undefined when the rename leaves it alone. */
export function renamedLocation(card: QardCard, rename: GroupRename): CardLocation | undefined {
  if (rename.topic === undefined) {
    const deck = renamedDeck(card.deck, rename.deck, rename.to);
    return deck === undefined ? undefined : { deck, topic: card.topic };
  }
  return card.deck === rename.deck && card.topic === rename.topic
    ? { deck: card.deck, topic: rename.to }
    : undefined;
}
/**
 * Rename a deck (with its subdecks) or one topic of a deck within one note. Where the name comes
 * from the note itself, that is what changes: `qard-deck` or `qard-topic` in frontmatter, or the
 * topic's heading. Cards whose placement can't be renamed that way, such as cards with their own
 * `qard-location` or cards before the first heading, get a location comment. Callouts and IDs stay
 * byte-for-byte intact, and the result is verified against the original cards.
 */
export function renameGroupInSource(source: string, path: string, rename: GroupRename): string {
  const to = readCardLocation(
    rename.topic === undefined
      ? { deck: rename.to, topic: 'General' }
      : { deck: rename.deck, topic: rename.to },
  );
  rename = { ...rename, to: rename.topic === undefined ? to.deck : to.topic };
  const before = parseCards(source, path).cards,
    expected = before.map((card) => renamedLocation(card, rename) ?? card);
  if (!before.some((card) => renamedLocation(card, rename))) {
    return source;
  }
  const finish = (start: string) => {
    let next = start;
    const parsed = parseCards(next, path).cards;
    if (
      parsed.length !== before.length ||
      parsed.some((card, i) => card.id !== before[i]!.id || !sameContent(card, before[i]!))
    ) {
      throw new Error('The note changed shape while renaming.');
    }
    for (let i = parsed.length - 1; i >= 0; i--) {
      const card = parsed[i]!,
        want = expected[i]!;
      if (card.deck !== want.deck || card.topic !== want.topic) {
        next = placeParsedCard(next, card, { deck: want.deck, topic: want.topic });
      }
    }
    const saved = parseCards(next, path).cards;
    if (
      saved.length !== before.length ||
      saved.some(
        (card, i) =>
          card.id !== before[i]!.id ||
          !sameContent(card, before[i]!) ||
          card.deck !== expected[i]!.deck ||
          card.topic !== expected[i]!.topic,
      )
    ) {
      throw new Error('The cards in this note could not be renamed safely.');
    }
    return next;
  };
  try {
    return finish(renameNoteNames(source, path, rename, before));
  } catch {
    // The note's own names could not be changed cleanly; give each card its own location instead.
    return finish(source);
  }
}
/** Change the names the note itself defines, when every card that uses them is being renamed. */
function renameNoteNames(source: string, path: string, rename: GroupRename, cards: QardCard[]) {
  const note = topicSections(source, path);
  if (!note) {
    return source;
  }
  const natural = cards.filter((card) => !card.location);
  if (rename.topic === undefined) {
    const deck = renamedDeck(note.deck, rename.deck, rename.to);
    const named = (frontmatterEntry(source, 'qard-deck')?.at ?? -1) >= 0;
    return deck !== undefined && (natural.length || named)
      ? setFrontmatterValue(source, 'qard-deck', deck)
      : source;
  }
  if (note.deck !== rename.deck) {
    return source;
  }
  if (note.fixedTopic !== undefined) {
    return note.fixedTopic === rename.topic
      ? setFrontmatterValue(source, 'qard-topic', rename.to)
      : source;
  }
  // The first section is the note body before any heading; it has no heading to rename.
  const lines = sourceLines(source);
  const headings = note.sections
    .slice(1)
    .filter(
      (section) =>
        section.topic === rename.topic &&
        natural.some(
          (card) =>
            card.sourcePosition.line >= section.line && card.sourcePosition.line < section.end,
        ),
    )
    .sort((a, b) => b.line - a.line);
  for (const section of headings) {
    const line = lines[section.line]!,
      atx = line.text.match(/^( {0,3}#{1,6}[ \t]+)(.+?)((?:[ \t]+#+)?[ \t]*)$/),
      setext = line.text.match(/^(\s*)(.*?)(\s*)$/)!;
    const text = atx ? atx[1]! + rename.to + atx[3]! : setext[1]! + rename.to + setext[3]!;
    source = source.slice(0, line.start) + text + source.slice(line.start + line.text.length);
  }
  return source;
}
