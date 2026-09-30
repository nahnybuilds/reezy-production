import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** "md" = 52px (sheets, main actions), "sm" = 40px (toolbars). Hit area never below 44px. */
  size?: "md" | "sm";
  /** Full width inside sheets (DESIGN.md §9.5). */
  block?: boolean;
  /** On pink surfaces quiet text must be ink, not ink-muted (AA contrast, DESIGN.md §9.9). */
  onPink?: boolean;
};

const base =
  "inline-flex items-center justify-center rounded-full font-ui transition-colors disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary: "bg-plum text-paper text-body-strong px-7 disabled:bg-rule disabled:text-ink-muted",
  secondary: "border-[1.5px] border-plum text-plum text-body-strong px-7 disabled:opacity-50",
  quiet: "text-ink-muted text-body px-3",
  danger: "text-danger text-body-strong px-3",
};

/** Figma: Button / Primary · Secondary · Quiet (01 — Foundations). One primary per screen. */
export function Button({ variant = "primary", size = "md", block, onPink, className = "", ...rest }: Props) {
  const height = size === "md" ? "h-13" : "h-10 min-h-11";
  const tone = variant === "quiet" && onPink ? "!text-ink" : "";
  return <button className={`${base} ${variants[variant]} ${height} ${block ? "w-full" : ""} ${tone} ${className}`} {...rest} />;
}
