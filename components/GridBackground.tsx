/**
 * GridBackground — global fixed backdrop: a masked dot/line grid plus two soft
 * accent glows (emerald + amber, matching the Strata palette). Purely
 * decorative, sits behind all content (-z-10). Mounted once in the root layout.
 */
export function GridBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0b0d]">
      {/* Masked grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%)",
        }}
      />
      {/* Emerald glow (top-left) */}
      <div className="absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full blur-[120px] bg-emerald-400/20" />
      {/* Amber glow (bottom-right) */}
      <div className="absolute bottom-[-80px] right-[-60px] w-[380px] h-[380px] rounded-full blur-[120px] bg-amber-500/10" />
    </div>
  );
}
