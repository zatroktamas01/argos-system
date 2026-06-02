type EmptyStateProps = {
  title: string;
  description: string;
};

function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center">
      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default EmptyState;