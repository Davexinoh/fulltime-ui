import { Link } from "react-router-dom";
import type { MarketAccount } from "../lib/anchor";
import { fixtureName, fixtureStage } from "../lib/fixtures";
import { stateName, timeLeft } from "../lib/format";
import PitchBar from "./PitchBar";

export default function MarketCard({ m, index }: { m: MarketAccount; index: number }) {
  const state = stateName(m.state);
  return (
    <Link
      to={`/market/${m.publicKey.toBase58()}`}
      className="card fade-in"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <span className="fixture">
        {fixtureStage(m.fixtureId.toString())} · {fixtureName(m.fixtureId.toString())}
      </span>
      <span className="question">{m.question}</span>
      <PitchBar yes={m.yesPool} no={m.noPool} />
      <div className="meta">
        <span className={`status ${state}`}>
          {state === "settled" ? (m.outcomeYes ? "settled · yes" : "settled · no") : state}
        </span>
        <span>{state === "open" ? timeLeft(m.closeTs.toNumber()) : ""}</span>
      </div>
    </Link>
  );
}
