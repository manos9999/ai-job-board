export default function MatchScore({ score, size = 'md' }) {
  const numScore = Number(score) || 0;

  let colorClass, bgClass, ringColor;
  if (numScore >= 70) {
    colorClass = 'text-green-700';
    bgClass = 'bg-green-100';
    ringColor = 'stroke-green-500';
  } else if (numScore >= 40) {
    colorClass = 'text-yellow-700';
    bgClass = 'bg-yellow-100';
    ringColor = 'stroke-yellow-500';
  } else {
    colorClass = 'text-red-700';
    bgClass = 'bg-red-100';
    ringColor = 'stroke-red-500';
  }

  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-xs', strokeWidth: 3, r: 16 },
    md: { container: 'w-16 h-16', text: 'text-sm font-semibold', strokeWidth: 3, r: 26 },
    lg: { container: 'w-24 h-24', text: 'text-xl font-bold', strokeWidth: 4, r: 40 },
  };

  const s = sizes[size] || sizes.md;
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (numScore / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${s.container} ${bgClass} rounded-full`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox={`0 0 ${(s.r + s.strokeWidth) * 2} ${(s.r + s.strokeWidth) * 2}`}>
        <circle
          cx={s.r + s.strokeWidth}
          cy={s.r + s.strokeWidth}
          r={s.r}
          fill="none"
          stroke="currentColor"
          strokeWidth={s.strokeWidth}
          className="text-gray-200"
        />
        <circle
          cx={s.r + s.strokeWidth}
          cy={s.r + s.strokeWidth}
          r={s.r}
          fill="none"
          strokeWidth={s.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={ringColor}
        />
      </svg>
      <span className={`relative ${s.text} ${colorClass}`}>{numScore}%</span>
    </div>
  );
}
