import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-registry text-white hover:bg-teal-800 focus-visible:outline-registry",
  secondary:
    "border border-slate-200 bg-white text-ink hover:border-registry hover:text-registry focus-visible:outline-registry",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:outline-registry"
};

export function Button({
  children,
  className,
  href,
  icon,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button className={classes} type="button" {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
