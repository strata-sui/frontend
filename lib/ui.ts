// Shared visual tokens for the Strata redesign (Part C).
// Keep these in one place so every surface uses the same glass treatment.

/** Glass card: translucent fill, blur, hairline border, subtle hover lift. */
export const glass =
  "bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl " +
  "transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20";

/** Glass card without the hover lift (for dense data panels). */
export const glassStatic =
  "bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl";

/** Heading font helper (Space Grotesk via --font-heading). */
export const headingFont = { fontFamily: "var(--font-heading)" } as const;
