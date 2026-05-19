import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-panel", props.className)}
    />
  );
}
