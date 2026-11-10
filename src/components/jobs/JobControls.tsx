import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { QardServices } from '../../views/services';
import { overdue, roleOf } from '../../jobs/job-clock';
import { useTick } from './RunningJobs';
import { TutorHint } from '../learn/learning-status';

/**
 * Under a waiting screen: Cancel while the job runs, a warning once it's well past its usual time, and a way to
 * start again when nothing is running at all (the job was lost, say to a reload before it saved anything).
 */
export function JobControls({
  services,
  job,
  cancel,
  start,
  hint,
  compact = false,
}: {
  services: QardServices;
  job?: { kind: string; startedAt?: number; error?: string };
  cancel?: () => void;
  start?: () => void;
  hint?: ReactNode;
  compact?: boolean;
}) {
  const now = useTick(!!job && !job.error);
  const help =
    hint ?? (job && roleOf(job.kind) === 'tutor' ? <TutorHint services={services} /> : undefined);
  if (!job) {
    return start ? (
      <div className="qard-job-controls is-stuck" role="status">
        {help}
        <span>Nothing is working on this right now.</span>
        <button type="button" className="qard-primary" onClick={start}>
          Start again
        </button>
      </div>
    ) : null;
  }
  if (job.error || !cancel) {
    return null;
  }
  const stuck = overdue(services.jobs?.estimate(job.kind), job.startedAt, now);
  const minutes = job.startedAt ? Math.floor((now - job.startedAt) / 60_000) : 0;
  return (
    <div
      className={`qard-job-controls${stuck ? ' is-stuck' : ''}${compact ? ' is-compact' : ''}`}
      role={stuck ? 'status' : undefined}
    >
      {help}
      {stuck && (
        <span>
          This has taken {minutes} min, much longer than usual, so it may be stuck. Cancel it and
          try again.
        </span>
      )}
      <button
        type="button"
        className={compact ? 'qard-icon-button' : stuck ? 'qard-primary' : 'qard-text-button'}
        aria-label={compact ? 'Cancel' : undefined}
        title={compact ? 'Cancel' : undefined}
        onClick={cancel}
      >
        {compact ? <X size={16} aria-hidden="true" /> : 'Cancel'}
      </button>
    </div>
  );
}
