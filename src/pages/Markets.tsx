import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllMarkets, type MarketAccount } from "../lib/anchor";
import { sol } from "../lib/format";
import { BN } from "@coral-xyz/anchor";
import MarketCard from "../components/MarketCard";

export default function Markets() {
  const [markets, setMarkets] = useState<MarketAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllMarkets()
      .then((m) =>
        setMarkets(m.sort((a, b) => a.state - b.state || b.closeTs.toNumber() - a.closeTs.toNumber()))
      )
      .catch((e) => setError(e?.message ?? String(e)));
  }, []);

  const open = markets?.filter((m) => m.state === 0) ?? [];
  const done = markets?.filter((m) => m.state !== 0) ?? [];
  const totalPool = (markets ?? []).reduce(
    (acc, m) => acc.add(m.yesPool).add(m.noPool),
    new BN(0)
  );
  const proven = (markets ?? []).filter((m) => m.state === 1).length;

  return (
    <>
      <header className="hero">
        <p className="kicker">World Cup 2026 · settled by TxODDS onchain oracle</p>
        <h1>
          The referee is <span className="accent">cryptographic</span>
        </h1>
        <p>
          Prediction markets on live World Cup fixtures. Every settlement is proven against
          TxODDS' onchain Merkle roots. No admin decides. The data provider is the referee.
        </p>
        {markets && (
          <div className="hero-stats">
            <div className="stat">
              <div className="n">{markets.length}</div>
              <div className="l">Markets onchain</div>
            </div>
            <div className="stat">
              <div className="n">{sol(totalPool)} SOL</div>
              <div className="l">Pooled</div>
            </div>
            <div className="stat">
              <div className="n">{proven}</div>
              <div className="l">Settlements proven</div>
            </div>
          </div>
        )}
        <svg className="circle" width="440" height="440" viewBox="0 0 440 440" aria-hidden>
          <circle cx="220" cy="220" r="188" />
          <circle cx="220" cy="220" r="6" />
          <line x1="220" y1="12" x2="220" y2="428" />
        </svg>
      </header>

      <main className="container">
        {error && (
          <div className="notice err" style={{ marginTop: 24 }}>
            Could not load markets: {error}. Check the RPC and refresh.
          </div>
        )}

        {!markets && !error && (
          <>
            <div className="section-head">
              <h2>Open markets</h2>
              <span className="count">reading the chain…</span>
            </div>
            <div className="grid">
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          </>
        )}

        {markets && (
          <>
            <div className="section-head">
              <h2>Open markets</h2>
              <span className="count">{open.length} live</span>
            </div>
            {open.length === 0 ? (
              <div className="empty fade-in">
                <span className="big">No open markets</span>
                <span>The final kicks off July 19 — the biggest fixture on earth.</span>
                <Link to="/create" className="cta ghost" style={{ marginTop: 8, padding: "12px 22px" }}>
                  Open a market on the final
                </Link>
              </div>
            ) : (
              <div className="grid">
                {open.map((m, i) => (
                  <MarketCard key={m.publicKey.toBase58()} m={m} index={i} />
                ))}
              </div>
            )}

            <div className="section-head">
              <h2>Settled</h2>
              <span className="count">{done.length} proven onchain</span>
            </div>
            {done.length === 0 ? (
              <div className="empty">
                <span className="big">No settled markets yet</span>
              </div>
            ) : (
              <div className="grid">
                {done.map((m, i) => (
                  <MarketCard key={m.publicKey.toBase58()} m={m} index={i} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
