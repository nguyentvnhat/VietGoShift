import type { ComponentProps, ReactNode } from "react";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles = {
    primary: "bg-emerald-600 text-white active:bg-emerald-700",
    secondary: "bg-white text-slate-800 ring-1 ring-slate-200 active:bg-slate-50",
    ghost: "bg-amber-100 text-amber-900 active:bg-amber-200",
  }[variant];
  return (
    <button
      className={`w-full rounded-xl px-4 py-3 font-semibold disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 ${className}`}>
      {children}
    </section>
  );
}
