import { BRAND_ASSETS } from "@/lib/brand";

type Props = {
  /** Rendered height in px; width follows the asset's aspect ratio (placeholder uses 3:1). */
  height?: number;
  /** "paper" for light backgrounds, "plum" for the Welcome / finish brand moments. */
  on?: "paper" | "plum";
  className?: string;
};

/** The Reezy logo / wordmark. Shows a labelled placeholder until the final asset is set in lib/brand.ts. */
export function LogoSlot({ height = 24, on = "paper", className = "" }: Props) {
  if (BRAND_ASSETS.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={BRAND_ASSETS.logo} alt="Reezy" style={{ height }} className={className} />;
  }
  const tone = on === "plum" ? "border-lime text-lime" : "border-plum text-plum";
  return (
    <span
      role="img"
      aria-label="Reezy"
      data-placeholder="logo"
      style={{ height, width: height * 3 }}
      className={`inline-flex items-center justify-center rounded-md border-[1.5px] border-dashed ${tone} text-[10px] font-semibold ${className}`}
    >
      logo
    </span>
  );
}
