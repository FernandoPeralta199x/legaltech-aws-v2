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
  "w-full rounded-lg border bg-white text-sm text-slate-900 outline-none transition " +
  "placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-55 " +
  "dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 " +
  "focus:bg-white focus:shadow-[0_0_0_4px_rgba(5,150,105,0.12)] dark:focus:bg-slate-950";

function controlClass(invalid?: boolean, className?: string): string {
  return cn(
    controlBase,
    invalid
      ? "border-red-300 focus:border-red-500 dark:border-red-900/70"
      : "border-slate-200 focus:border-brand-teal dark:border-slate-700",
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
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="text-red-700">*</span>}
      </span>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-red-700 dark:text-red-300">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
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
      className={controlClass(invalid, cn("h-10 px-3 [&_option]:bg-white dark:[&_option]:bg-slate-950", className))}
      {...props}
    />
  );
}
