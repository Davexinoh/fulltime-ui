import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { BN, SystemProgram, marketPda, vaultPda, writeProgram } from "../lib/anchor";
import { FIXTURES, STAT_KEYS, type FixtureInfo } from "../lib/fixtures";
import { loadFixtures } from "../lib/api";

export default function CreateMarket() {
  const wallet = useAnchorWallet();
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState<Record<string, FixtureInfo>>(FIXTURES);
  const [fixtureId, setFixtureId] = useState("");
  const [statKey, setStatKey] = useState(1);
  const [threshold, setThreshold] = useState(0);
  const [comparison, setComparison] = useState(0);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Pull live fixtures from the backend; keep static map as fallback.
  useEffect(() => {
    loadFixtures().then((live) => {
      if (!live) return;
      const merged: Record<string, FixtureInfo> = { ...FIXTURES };
      for (const f of live) merged[f.fixtureId] = { name: f.name, stage: f.stage, kickoff: f.kickoff };
      setFixtures(merged);
    });
  }, []);

  const upcoming = useMemo(
    () =>
      Object.entries(fixtures)
        .filter(([, f]) => new Date(f.kickoff).getTime() > Date.now())
        .sort(([, a], [, b]) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()),
    [fixtures]
  );

  useEffect(() => {
    if (!fixtureId && upcoming.length > 0) setFixtureId(upcoming[0][0]);
  }, [upcoming, fixtureId]);

  async function create() {
    if (!wallet) return;
    setBusy(true);
    setNotice(null);
    try {
      if (!question.trim() || question.length > 128)
        throw new Error("Question required, up to 128 characters.");
      const kickoff = fixtures[fixtureId]?.kickoff;
      if (!kickoff) throw new Error("Pick a fixture.");
      const closeTs = Math.floor(new Date(kickoff).getTime() / 1000);
      if (closeTs <= Date.now() / 1000)
        throw new Error("That fixture has already kicked off. Pick an upcoming one.");

      const program = writeProgram(wallet);
      const market = marketPda(wallet.publicKey, BigInt(fixtureId), statKey);
      await program.methods
        .createMarket(new BN(fixtureId), statKey, threshold, comparison, new BN(closeTs), question.trim())
        .accounts({
          market,
          vault: vaultPda(market),
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      navigate(`/market/${market.toBase58()}`);
    } catch (e: unknown) {
      setNotice({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <div className="form fade-in">
        <h1 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", fontSize: 40 }}>
          Open a market
        </h1>
        <p style={{ color: "var(--chalk-60)", fontSize: 15 }}>
          Pick a fixture and a stat predicate. Betting closes at kickoff. Settlement comes from
          TxODDS' finalised match data — you never decide the outcome.
        </p>

        {upcoming.length === 0 ? (
          <div className="notice">
            No upcoming fixtures available right now. If the ingestion backend is offline, set
            VITE_INGESTION_URL or refresh closer to the next kickoff.
          </div>
        ) : (
          <>
            <label>
              Fixture
              <select value={fixtureId} onChange={(e) => setFixtureId(e.target.value)}>
                {upcoming.map(([id, f]) => (
                  <option key={id} value={id}>
                    {f.stage} — {f.name} ({new Date(f.kickoff).toUTCString().slice(0, 22)})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Stat
              <select value={statKey} onChange={(e) => setStatKey(Number(e.target.value))}>
                {Object.entries(STAT_KEYS).map(([k, name]) => (
                  <option key={k} value={k}>{name}</option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <label>
                Condition
                <select value={comparison} onChange={(e) => setComparison(Number(e.target.value))}>
                  <option value={0}>Greater than</option>
                  <option value={1}>Less than</option>
                </select>
              </label>
              <label>
                Threshold
                <input type="number" min={0} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
              </label>
            </div>

            <label>
              Question shown to bettors
              <input
                type="text"
                maxLength={128}
                placeholder="e.g. Final: 2+ goals for the winner?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </label>

            <button className="cta" onClick={create} disabled={busy || !wallet}>
              {wallet ? (busy ? "Creating…" : "Create market") : "Connect wallet to create"}
            </button>
          </>
        )}

        {notice && <div className={`notice ${notice.kind}`}>{notice.text}</div>}
      </div>
    </main>
  );
}
