export function Monogram({ name, className = "size-14 text-lg" }: { name: string; className?: string }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-forest-600 to-forest-900 font-display-tight font-extrabold text-sand-50 ${className}`}>
      {initials}
    </span>
  );
}
