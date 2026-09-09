import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent homepage section wrapper (container + vertical rhythm). */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("py-10 lg:py-14", className)}>
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </section>
  );
}
