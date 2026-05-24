import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight " +
  "transition-all duration-[150ms] ease-smooth select-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "active:scale-[0.97] active:duration-[80ms]";

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-lg px-3 text-xs gap-1.5",
  md: "h-10 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-xl px-6 text-base gap-2.5"
};

const variants: Record<ButtonVariant, string> = {
  primary: [
    "bg-brand-blue text-white",
    "shadow-glow",
    "hover:bg-brand-blue-dark hover:shadow-glow-lg",
    "focus-visible:outline-brand-blue"
  ].join(" "),

  secondary: [
    "border border-white/[0.10] bg-white/[0.05] text-slate-200",
    "shadow-inner-highlight",
    "hover:bg-white/[0.09] hover:border-white/[0.16] hover:text-white",
    "focus-visible:outline-brand-blue"
  ].join(" "),

  ghost: [
    "text-slate-400",
    "hover:bg-white/[0.06] hover:text-slate-100",
    "focus-visible:outline-brand-blue"
  ].join(" "),

  danger: [
    "border border-red-500/30 bg-red-500/10 text-red-300",
    "hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-200",
    "focus-visible:outline-red-500"
  ].join(" ")
};

const Spinner = () => (
  <span className="flex h-4 w-4 items-center justify-center">
    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" />
  </span>
);

export function Button({
  children,
  className,
  href,
  icon,
  iconRight,
  loading = false,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(base, sizes[size], variants[variant], className);

  const content = (
    <>
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
      {!loading && iconRight}
    </>
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={loading || props.disabled} type="button" {...props}>
      {content}
    </button>
  );
}
