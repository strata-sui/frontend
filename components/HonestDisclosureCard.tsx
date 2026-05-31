/**
 * HonestDisclosureCard - the Build-A-Bear honest-disclosure signature.
 *
 * Compact by default: a Gate-B MARGINAL badge + one-line summary. The
 * quantitative evidence (p01 reduction, R3 delta, the collapsed interior-f*
 * pillar) sits behind a "Show evidence" disclosure so the honesty is always
 * visible but never crowds the page.
 *
 * Diction rule B is enforced: we use "tail truncation" and "quantified
 * residual", never an absolute downside claim.
 */

import { SIM_TAG_URL } from "@/lib/config";
import { glassStatic } from "@/lib/ui";

const SUBMISSION_URL =
  "https://github.com/strata-sui/sim/blob/v0.1.0-simulator-closed/SUBMISSION.md";

function Marker({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={ok ? "text-emerald-400" : "text-rose-400"}
    >
      {ok ? "+" : "−"}
    </span>
  );
}

export function HonestDisclosureCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <details className={`${glassStatic} group p-5 ${className}`}>
      <summary className="flex items-center gap-3 cursor-pointer list-none">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-300 ring-1 ring-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Gate-B: MARGINAL
        </span>
        <span className="text-sm text-white/70">
          2 of 3 pillars hold &mdash; reported as found
        </span>
        <span className="ml-auto text-xs text-white/40 group-open:hidden">
          Show evidence
        </span>
        <span className="ml-auto text-xs text-white/40 hidden group-open:inline">
          Hide
        </span>
      </summary>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-xs leading-relaxed text-white/50">
          Backtested across 10,000 benign Monte-Carlo paths and 5,900 historical
          crash windows, the verdict is{" "}
          <span className="font-medium text-amber-300">MARGINAL</span> &mdash; not
          a clean win. Two of three value pillars hold under disjunctive
          synthesis; the third collapses to the conservative boundary.
        </p>

        <ul className="mt-3 space-y-2 text-xs leading-relaxed">
          <li className="flex gap-2">
            <Marker ok />
            <span className="text-white/55">
              <span className="font-medium text-white/80">
                Tail truncation holds.
              </span>{" "}
              p01 reduction is positive and grows with f (best +4.73pp) &mdash; a
              quantified residual tail, not a complete hedge.
            </span>
          </li>
          <li className="flex gap-2">
            <Marker ok />
            <span className="text-white/55">
              <span className="font-medium text-white/80">
                R3 liquidity escape-hatch holds.
              </span>{" "}
              A $383,063 liquid-cash delta versus a limiter-bound exit, verified
              at sim closure.
            </span>
          </li>
          <li className="flex gap-2">
            <Marker ok={false} />
            <span className="text-white/45">
              <span className="font-medium text-white/60">
                Interior f* collapses.
              </span>{" "}
              Under bounded accounting, f* sits at the low boundary (5%) for every
              crash-weight &mdash; so the conservative LP-share IS the optimal-f
              recommendation.
            </span>
          </li>
        </ul>

        <p className="mt-4 text-[11px] text-white/40">
          Full methodology + limitations:{" "}
          <a
            href={SUBMISSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70"
          >
            SUBMISSION.md
          </a>{" "}
          &middot;{" "}
          <a
            href={SIM_TAG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/70"
          >
            v0.1.0-simulator-closed
          </a>
        </p>
      </div>
    </details>
  );
}
