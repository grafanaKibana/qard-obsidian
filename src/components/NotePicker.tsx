import { useState } from 'react';
import { Link2 } from 'lucide-react';
import type { TFile } from 'obsidian';
import { isPdf } from '../vault-access';

/** A button that opens a note search: recent notes first, filtered as you type. */
export function NotePicker({
  label,
  disabled,
  busy,
  notes,
  choose,
  caveat,
}: {
  label: string;
  disabled?: boolean;
  busy: boolean;
  /** Notes that can be chosen, before filtering. Only read while the search is open. */
  notes: () => TFile[];
  /** Resolves true when the search should close. */
  choose: (path: string) => Promise<boolean>;
  caveat?: string;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();
  const matches = open
    ? notes()
        .filter((f) => !q || f.path.toLowerCase().includes(q))
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(0, 6)
    : [];
  async function pick(path: string) {
    if (await choose(path)) {
      setOpen(false);
      setQuery('');
    }
  }
  return (
    <div className="qard-source-search">
      <button
        className="qard-source-add"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setQuery('');
        }}
      >
        <Link2 size={14} />
        {label}
      </button>
      {open && (
        <div className="qard-popover">
          <input
            type="search"
            autoFocus
            aria-label="Find a note to link"
            placeholder="Find a note…"
            value={query}
            disabled={busy}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                setOpen(false);
              } else if (e.key === 'Enter' && matches[0] && !busy) {
                void pick(matches[0].path);
              }
            }}
          />
          {matches.map((f) => (
            <button
              key={f.path}
              className="qard-popover-item"
              title={f.path}
              disabled={busy}
              onClick={() => void pick(f.path)}
            >
              <span>{isPdf(f.path) ? f.path.split('/').pop() : f.basename}</span>
              <small>{f.parent?.path === '/' ? '' : f.parent?.path}</small>
            </button>
          ))}
          {!matches.length && <p className="qard-muted">No matching notes.</p>}
          {caveat && <p className="qard-muted qard-source-caveat">{caveat}</p>}
        </div>
      )}
    </div>
  );
}
