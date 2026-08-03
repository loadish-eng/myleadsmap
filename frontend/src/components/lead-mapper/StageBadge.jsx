import { STAGES } from '@/lib/leadConfig';

export default function StageBadge({ stage }) {
  const config = STAGES[stage];
  if (!config) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border border-border bg-secondary">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}