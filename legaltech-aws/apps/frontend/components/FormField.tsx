import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";

import { cn } from "@/lib/cn";

type FormFieldProps = {
  children: ReactNode;
  error?: string;
  hint?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
};

const controlBase =
  "w-full rounded-lg border bg-white/[0.04] text-sm text-slate-200 outline-none transition " +
  "placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-55 " +
  "focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]";

function controlClass(invalid?: boolean, className?: string): string {
  return cn(
    controlBase,
    invalid
      ? "border-red-400/40 focus:border-red-300/60"
      : "border-white/[0.08] focus:border-brand-blue/40",
    className
  );
}

export function FormField({
  children,
  error,
  hint,
  htmlFor,
  label,
  required = false
}: FormFieldProps) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {label}
        {required && <span className="text-red-300">*</span>}
      </span>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-red-300">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>
      ) : null}
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function TextInput({ className, invalid, ...props }: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={controlClass(invalid, cn("h-10 px-3", className))}
      {...props}
    />
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function TextArea({ className, invalid, ...props }: TextAreaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlClass(invalid, cn("min-h-24 resize-y px-3 py-2", className))}
      {...props}
    />
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function SelectInput({ className, invalid, ...props }: SelectInputProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={controlClass(invalid, cn("h-10 px-3 [&_option]:bg-surface-800", className))}
      {...props}
    />
  );
}
