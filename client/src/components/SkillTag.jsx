export default function SkillTag({ label, variant = 'default', onRemove }) {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    matched: 'bg-green-100 text-green-800',
    missing: 'bg-red-100 text-red-800',
  };

  const classes = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${classes}`}>
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 hover:opacity-70 font-bold"
        >
          x
        </button>
      )}
    </span>
  );
}
