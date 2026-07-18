import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  BN,
  SystemProgram,
  fetchMarket,
  positionPda,
  vaultPda,
  writeProgram,
  type MarketAccount,
} from "../lib/anchor";
import { fixtureName, fixtureStage, STAT_KEYS } from "../lib/fixtures";
import { sol, stateName, timeLeft } from "../lib/format";
import PitchBar from "../components/PitchBar";
import ProofStrip from "../components/ProofStrip";

export default function MarketDetail() {
  const { pubkey } = useParams<{ pubkey: string }>();
  const wallet = useAnchorWallet();
  const [m, setM] = useState<MarketAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sideYes, setSideYes] = useState(true);
  const [amount, setAmount] = useState("0.1");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(() => {
    if (!pubkey) return;
    fetchMarket(new PublicKey(pubkey))
      .then(setM)
      .catch((e) => setError(e?.message ?? String(e)));
  }, [pubkey]);

  useEffect(load, [load]);

  if (error)
    return (
      <main className="container">
        <div className="notice err" style={{ marginTop: 40 }}>Market not found: {error}</div>
      </main>
    );
  if (!m)
    return (
      <main className="container">
        <div className="grid" style={{ paddingTop: 48 }}>
          <div className="skeleton" style={{ gridColumn: "1 / -1", height: 300 }} />
        </div>
      </main>
    );

  const state = stateName(m.state);
  const closed = Date.now() / 1000 >= m.closeTs.toNumber();
  const marketKey = m.publicKey.toBase58();
  const predicate = `statKey ${m.statKey} ${m.comparison === 0 ? ">" : "<"} ${m.threshold}`;

  async function placeBet() {
    if (!wallet || !m) return;
    setBusy(true);
    setNotice(null);
    try {
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);
      if (!Number.isFinite(lamports) || lamports <= 0) throw new Error("Enter an amount above 0.");
      const program = writeProgram(wallet);
      await program.methods
        .placeBet(sideYes, new BN(lamports))
        .accounts({
          market: m.publicKey,
          vault: vaultPda(m.publicKey),
          position: positionPda(m.publicKey, wallet.publicKey),
          bettor: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setNotice({ kind: "ok", text: `Bet placed: ${amount} SOL on ${sideYes ? "YES" : "NO"}.` });
      load();
    } catch (e: unknown) {
      setNotice({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    if (!wallet || !m) return;
    setBusy(true);
    setNotice(null);
    try {
      const program = writeProgram(wallet);
      await program.methods
        .claim()
        .accounts({
          market: m.publicKey,
          vault: vaultPda(m.publicKey),
          position: positionPda(m.publicKey, wallet.publicKey),
          owner: wallet.publicKey,
        })
        .rpc();
      setNotice({ kind: "ok", text: "Claimed. Check your wallet balance." });
      load();
    } catch (e: unknown) {
      setNotice({ kind: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <div className="detail">
        <section className="fade-in">
          <p className="sub">
            {fixtureStage(m.fixtureId.toString())} · {fixtureName(m.fixtureId.toString())} ·{" "}
            {STAT_KEYS[m.statKey] ?? `statKey ${m.statKey}`}
          </p>
          <h1>{m.question}</h1>

          <div style={{ margin: "26px 0 30px" }}>
            <PitchBar yes={m.yesPool} no={m.noPool} />
          </div>

          <div className="panel" style={{ gap: 12 }}>
            <div className="kv">
              <span className="k">Status</span>
              <span className="v">
                {state === "settled" ? `settled · ${m.outcomeYes ? "YES" : "NO"} wins` : state}
              </span>
            </div>
            <div className="kv"><span className="k">Predicate</span><span className="v">{predicate}</span></div>
            <div className="kv"><span className="k">Pool</span><span className="v">{sol(m.yesPool.add(m.noPool))} SOL</span></div>
            <div className="kv"><span className="k">Betting</span><span className="v">{closed ? "closed" : timeLeft(m.closeTs.toNumber())}</span></div>
            <div className="kv"><span className="k">Market</span><span className="v">{marketKey.slice(0, 8)}…</span></div>
          </div>

          {state === "settled" && (
            <div style={{ marginTop: 22 }}>
              <ProofStrip
                proofHash={m.proofHash}
                settledValue={m.settledValue}
                statKey={m.statKey}
                marketKey={marketKey}
              />
            </div>
          )}
        </section>

        <aside className="panel fade-in" style={{ animationDelay: "120ms" }}>
          {state === "open" && !closed && (
            <>
              <h3>Place a bet</h3>
              <div className="side-toggle">
                <button className={`side-btn yes ${sideYes ? "on" : ""}`} onClick={() => setSideYes(true)}>
                  Yes
                </button>
                <button className={`side-btn no ${!sideYes ? "on" : ""}`} onClick={() => setSideYes(false)}>
                  No
                </button>
              </div>
              <input
                className="amount"
                type="number"
                min="0.001"
                step="0.05"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Amount in SOL"
              />
              <button className="cta" onClick={placeBet} disabled={busy || !wallet}>
                {wallet ? (busy ? "Placing…" : `Bet ${amount} SOL on ${sideYes ? "yes" : "no"}`) : "Connect wallet to bet"}
              </button>
              <p style={{ fontSize: 13, color: "var(--chalk-60)" }}>
                One side per wallet. Betting closes at kickoff. Parimutuel payout: stake + pro-rata
                share of the losing pool.
              </p>
            </>
          )}

          {state === "open" && closed && (
            <>
              <h3>Betting closed</h3>
              <p style={{ fontSize: 14, color: "var(--chalk-60)" }}>
                Match underway or awaiting settlement. Settlement runs against TxODDS' finalised
                data the moment the fixture ends.
              </p>
            </>
          )}

          {state === "settled" && (
            <>
              <h3>{m.outcomeYes ? "YES wins" : "NO wins"}</h3>
              <p style={{ fontSize: 14, color: "var(--chalk-60)" }}>
                Winning positions claim stake plus a pro-rata share of the losing pool.
              </p>
              <button className="cta" onClick={claim} disabled={busy || !wallet}>
                {wallet ? (busy ? "Claiming…" : "Claim winnings") : "Connect wallet to claim"}
              </button>
            </>
          )}

          {state === "voided" && (
            <>
              <h3>Market voided</h3>
              <p style={{ fontSize: 14, color: "var(--chalk-60)" }}>
                Fixture cancelled or abandoned. Every position refunds in full.
              </p>
              <button className="cta ghost" onClick={claim} disabled={busy || !wallet}>
                {busy ? "Refunding…" : "Claim refund"}
              </button>
            </>
          )}

          {notice && <div className={`notice ${notice.kind}`}>{notice.text}</div>}
        </aside>
      </div>
    </main>
  );
}
