import { BN } from "@coral-xyz/anchor";
import { impliedYesPct, sol } from "../lib/format";
import CountUp from "./CountUp";

/**
 * Signature element: the YES/NO pool drawn as a football pitch, midfield line
 * at the implied YES probability. Midline position is clamped so the centre
 * circle stays inside the field even at 0%/100% pools; labels show true values.
 */
export default function PitchBar({ yes, no }: { yes: BN; no: BN }) {
  const pct = impliedYesPct(yes, no);
  const yesW = pct ?? 50;
  const midline = Math.min(Math.max(yesW, 4), 96);
  return (
    <div className="pitchbar">
      <div
        className="field"
        role="img"
        aria-label={pct === null ? "No bets yet" : `YES implied ${yesW.toFixed(0)} percent`}
      >
        <div className="half-yes" style={{ width: `${yesW}%` }} />
        <div className="half-no" style={{ width: `${100 - yesW}%` }} />
        <div className="midline" style={{ left: `calc(${midline}% - 1px)` }} />
      </div>
      <div className="labels">
        <span className="yes">
          YES {sol(yes)} SOL{pct !== null && <> · <CountUp value={yesW} suffix="%" /></>}
        </span>
        <span className="no">
          {pct !== null && <><CountUp value={100 - yesW} suffix="%" /> · </>}{sol(no)} SOL NO
        </span>
      </div>
    </div>
  );
}
