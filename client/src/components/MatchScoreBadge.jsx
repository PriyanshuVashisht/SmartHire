import React from 'react';
import { Sparkles } from 'lucide-react';

export const MatchScoreBadge = ({ score, showLabel = true, size = 'md' }) => {
  const numericScore = Math.round(Number(score) || 0);

  let colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  let label = 'Low Match';

  if (numericScore >= 80) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200';
    label = 'Strong Match';
  } else if (numericScore >= 65) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    label = 'Good Match';
  } else if (numericScore >= 45) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Moderate Match';
  }

  const sizeClasses =
    size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : size === 'sm'
      ? 'px-2 py-0.5 text-xs font-medium'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-current shrink-0" />
      <span>{numericScore}%</span>
      {showLabel && <span className="opacity-90 font-normal">({label})</span>}
    </span>
  );
};
