import { useId, useRef, useState } from 'react';
import type { Deck } from '../cards/card-types';
import { DECK_SEPARATOR, deckPath } from '../decks/deck-index';

/**
 * Whether a topic's name starts with the subdeck name as a whole word, so typing `ASD` picks
 * `ASD 02 — Agile` and `ASD: Scrum` but not `ASDF`.
 */
export function topicMatchesPrefix(topic: string, prefix: string) {
  const want = prefix.trim().toLocaleLowerCase(),
    name = topic.trim().toLocaleLowerCase();
  if (!want || !name.startsWith(want)) {
    return false;
  }
  const next = name.slice(want.length, want.length + 1);
  return !next || !/[\p{L}\p{N}]/u.test(next);
}

/**
 * Group some of a deck's topics into a subdeck, new or existing. Cards keep their topic names; only
 * their deck changes to `Deck::Subdeck`.
 */
export function NewSubdeck({
  deck,
  subdecks,
  move,
  close,
  busy,
  setBusy,
  report,
}: {
  deck: Deck;
  /** Labels of the subdecks directly beneath this deck. */
  subdecks: string[];
  move: (topics: string[], to: string) => Promise<void>;
  close: () => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  report: (message: string, error?: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState('');
  // Until a topic is ticked by hand, the selection follows the name typed.
  const [picked, setPicked] = useState<string[]>();
  const [error, setError] = useState('');
  const locked = useRef(false);
  const chosen =
    picked ?? deck.topics.map((t) => t.name).filter((topic) => topicMatchesPrefix(topic, name));
  const label = deckPath(name).join(DECK_SEPARATOR);
  const cards = deck.topics
    .filter((topic) => chosen.includes(topic.name))
    .reduce((count, topic) => count + topic.cards.length, 0);
  const toggle = (topic: string) =>
    setPicked(chosen.includes(topic) ? chosen.filter((t) => t !== topic) : [...chosen, topic]);
  async function submit() {
    if (locked.current) {
      return;
    }
    if (!label) {
      setError('Name the subdeck.');
      return;
    }
    if (!chosen.length) {
      setError('Choose at least one topic to move into it.');
      return;
    }
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await move(chosen, `${deck.name}${DECK_SEPARATOR}${label}`);
      report(`Moved ${chosen.length} ${chosen.length === 1 ? 'topic' : 'topics'} into ${label}.`);
      close();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <form
      className="qard-new-subdeck"
      aria-label="New subdeck"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div>
        <h2>New subdeck</h2>
        <p className="qard-muted">
          Group topics of {deck.name} into a subdeck. Cards keep their topic, review history and
          source notes. Type a name to pick the topics that start with it.
        </p>
      </div>
      <label>
        Subdeck name
        <input
          autoFocus
          list={`${id}-subdecks`}
          value={name}
          disabled={busy}
          placeholder="e.g. Part 1"
          onChange={(event) => {
            setName(event.target.value);
            setError('');
          }}
        />
        <datalist id={`${id}-subdecks`}>
          {subdecks.map((subdeck) => (
            <option key={subdeck} value={subdeck} />
          ))}
        </datalist>
      </label>
      <fieldset disabled={busy}>
        <legend>
          Topics to move · {chosen.length} of {deck.topics.length}
        </legend>
        <div className="qard-new-subdeck-topics">
          {deck.topics.map((topic) => (
            <label key={topic.name}>
              <input
                type="checkbox"
                checked={chosen.includes(topic.name)}
                onChange={() => toggle(topic.name)}
              />
              <span>{topic.name}</span>
              <small>{topic.cards.length}</small>
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p className="qard-error" role="alert">
          {error}
        </p>
      )}
      <div className="qard-actions">
        <button type="submit" className="qard-primary" disabled={busy}>
          {chosen.length
            ? `Move ${chosen.length} ${chosen.length === 1 ? 'topic' : 'topics'} (${cards} ${cards === 1 ? 'card' : 'cards'})`
            : 'Move topics'}
        </button>
        <button type="button" disabled={busy} onClick={close}>
          Cancel
        </button>
      </div>
    </form>
  );
}
