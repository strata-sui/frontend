/**
 * FlowDiagram — the Strata capital path: supply -> hedge ladder -> R3.
 * Pure inline SVG, no external asset. Connectors animate via a dashed
 * stroke-dashoffset loop (.strata-flow-line in globals.css). Decorative;
 * labels carry the substance.
 */
export function FlowDiagram({ className = "" }: { className?: string }) {
  const nodes = [
    { x: 70, label: "Supply", sub: "dUSDC -> PLP", accent: "#34d399" },
    { x: 250, label: "Hedge ladder", sub: "DN binaries", accent: "#34d399" },
    { x: 430, label: "R3 exit", sub: "limiter bypass", accent: "#f59e0b" },
  ];
  return (
    <svg
      viewBox="0 0 500 120"
      className={className}
      role="img"
      aria-label="Capital flow: supply to hedge ladder to R3 escape-hatch"
    >
      {/* connectors */}
      <line
        x1="120"
        y1="60"
        x2="200"
        y2="60"
        stroke="#34d399"
        strokeWidth="2"
        className="strata-flow-line"
      />
      <line
        x1="300"
        y1="60"
        x2="380"
        y2="60"
        stroke="#f59e0b"
        strokeWidth="2"
        className="strata-flow-line"
      />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle
            cx={n.x}
            cy="60"
            r="26"
            fill="rgba(255,255,255,0.04)"
            stroke={n.accent}
            strokeWidth="1.5"
          />
          <text
            x={n.x}
            y="100"
            textAnchor="middle"
            fill="#fff"
            fontSize="13"
            fontWeight="500"
          >
            {n.label}
          </text>
          <text
            x={n.x}
            y="116"
            textAnchor="middle"
            fill="rgba(255,255,255,0.45)"
            fontSize="10"
          >
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}
