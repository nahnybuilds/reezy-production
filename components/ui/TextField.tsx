import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  /** Accessible label. Visually hidden by default (the Figma fields use placeholder copy). */
  label: string;
  showLabel?: boolean;
};

/** Figma: Input / Text — 52px, surface, 1px rule border, 16px radius, 2px plum focus ring. */
export function TextField({ label, showLabel = false, className = "", id, ...rest }: Props) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label htmlFor={inputId} className="block">
      <span className={showLabel ? "text-label text-ink-muted mb-1.5 block" : "sr-only"}>{label}</span>
      <input
        id={inputId}
        className={`h-13 w-full rounded-block border border-rule bg-surface px-5 text-body text-ink placeholder:text-ink-muted focus:border-plum focus:outline-none focus:ring-2 focus:ring-plum ${className}`}
        {...rest}
      />
    </label>
  );
}
