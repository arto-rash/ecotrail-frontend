import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string };

/** Native select with a chevron that sits right next to the text instead of the far edge. */
export function Select({ className, wrapperClassName, children, ...props }: Props) {
  return (
    <span className={cn("relative inline-flex", wrapperClassName)}>
      <select {...props} className={cn("w-full cursor-pointer appearance-none pr-8", className)}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-60" />
    </span>
  );
}
