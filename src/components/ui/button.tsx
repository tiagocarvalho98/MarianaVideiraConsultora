import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-stone-900 disabled:bg-stone-300",
    secondary:
      "border border-border bg-surface text-foreground hover:border-primary hover:text-primary disabled:text-stone-400",
    ghost: "text-stone-700 hover:bg-stone-100 disabled:text-stone-400",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-accent disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
