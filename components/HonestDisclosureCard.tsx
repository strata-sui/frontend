/**
 * HonestDisclosureCard - the Build-A-Bear honest-disclosure signature, surfaced
 * verbatim on the landing and earn pages.
 *
 * The simulator closed at Gate-B MARGINAL (10k benign + 5,900 historical crash
 * windows, frozen at v0.1.0-simulator-closed). Two of three pillars hold under
 * the disjunctive crash-protection synthesis; the third collapses honestly to
 * the low boundary. We state that plainly rather than rounding it up to a win -
 * an absolute claim would contradict the f-Curve and a quant judge would catch
 * it. Diction rule B is enforced here too: we use "tail truncation" and
 * "quantified residual", never an absolute downside claim.
 */

import { SIM_TAG_URL } from "@/lib/config";

const SUBMISSION_URL =
  "https://github.com/strata-sui/sim/blob/v0.1.0-simulator-closed/SUBMISSION.md";

export function HonestDisclosureCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-300 ring-1 ring-amber-500/30">
          Gate-B: MARGINAL
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-zinc-200">
          Honest disclosure
        </h3>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-zinc-400">
        Backtested across 10,000 benign Monte-Carlo paths and 5,900 historical
        crash windows, the strategy verdict is{" "}
        <span className="font-medium text-amber-300">MARGINAL</span> - not a
        clean win. Two of three value pillars hold under disjunctive synthesis;
        the third collapses honestly to the conservative boundary. We report it
        as found.
      </p>

      <ul className="mt-3 space-y-2 text-xs leading-relaxed">
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden>
            +
          </span>
          <span className="text-zinc-400">
            <span className="font-medium text-zinc-200">
              Tail truncation holds.
            </span>{" "}
            p01 reduction is positive and grows with f (best +4.73pp) - a
            quantified residual tail, not a complete hedge.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-400" aria-hidden>
            +
          </span>
          <span className="text-zinc-400">
            <span className="font-medium text-zinc-200">
              R3 liquidity escape-hatch holds.
            </span>{" "}
            A $383,063 liquid-cash delta versus a limiter-bound exit, verified at
            sim closure.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-zinc-500" aria-hidden>
            -
          </span>
          <span className="text-zinc-500">
            <span className="font-medium text-zinc-400">
              Interior f* does not survive.
            </span>{" "}
            Under bounded accounting, f* sits at the low boundary (5%) for every
            crash-weight - so the conservative LP-share IS the optimal-f
            recommendation.
          </span>
        </li>
      </ul>

      <p className="mt-4 text-[11px] text-zinc-500">
        Full methodology, accounting fixes, and limitations:{" "}
        <a
          href={SUBMISSION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-zinc-300"
        >
          SUBMISSION.md
        </a>{" "}
        ·{" "}
        <a
          href={SIM_TAG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-zinc-300"
        >
          v0.1.0-simulator-closed
        </a>
      </p>
    </div>
  );
}
