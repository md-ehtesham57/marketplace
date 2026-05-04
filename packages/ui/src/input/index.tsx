import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  fullWidth = false,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          "block rounded-md border px-3 py-2 text-sm text-slate-900 placeholder-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400",
          "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
          "transition-colors duration-150",
          error ? "border-red-400" : "border-slate-300",
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}