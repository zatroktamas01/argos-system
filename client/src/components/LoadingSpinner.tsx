function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />
    </div>
  );
}

export default LoadingSpinner;