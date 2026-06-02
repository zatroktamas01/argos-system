type BadgeProps = {
  text: string;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default";
};

function Badge({
  text,
  variant = "default",
}: BadgeProps) {
  const styles = {
    success:
      "bg-green-500/20 text-green-400",
    warning:
      "bg-yellow-500/20 text-yellow-400",
    danger:
      "bg-red-500/20 text-red-400",
    info:
      "bg-violet-500/20 text-violet-400",
    default:
      "bg-slate-700 text-slate-300",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {text}
    </span>
  );
}

export default Badge;