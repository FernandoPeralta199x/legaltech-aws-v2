import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
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
  md: "h-10 rounded-lg px-4 text-sm",
  lg: "h-12 rounded-lg px-6 text-base gap-2.5"
};

const variants: Record<ButtonVariant, string> = {
  primary: [
    "bg-brand-teal text-white",
    "shadow-glow-teal",
    "hover:bg-brand-teal-dark hover:shadow-glow-teal-lg",
    "focus-visible:outline-brand-teal"
  ].join(" "),

  secondary: [
    "border border-slate-200 bg-white text-slate-700",
    "shadow-inner-highlight",
    "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800",
    "focus-visible:outline-brand-teal"
  ].join(" "),

  ghost: [
    "text-slate-600",
    "hover:bg-slate-100 hover:text-slate-950",
    "focus-visible:outline-brand-teal"
  ].join(" "),

  danger: [
    "border border-red-200 bg-red-50 text-red-700",
    "hover:bg-red-100 hover:border-red-300 hover:text-red-800",
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
  disabled,
  fullWidth = false,
  href,
  icon,
  iconRight,
  loading = false,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(base, sizes[size], variants[variant], fullWidth && "w-full", className);
  const isDisabled = loading || disabled;

  const content = (
    <>
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
      {!loading && iconRight}
    </>
  );

  if (href) {
    return (
      <Link aria-disabled={isDisabled || undefined} className={classes} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      aria-busy={loading || undefined}
      className={classes}
      disabled={isDisabled}
      type="button"
      {...props}
    >
      {content}
    </button>
  );
}
