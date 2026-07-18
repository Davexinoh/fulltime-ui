import { useEffect, useState } from "react";
import { loadTicker, type TickerItem } from "../lib/api";

/**
 * Live StablePrice strip. Renders ONLY when the ingestion backend returns
 * real odds. No backend -> no ticker. Nothing simulated.
 */
export default function Ticker() {
  const [items, setItems] = useState<TickerItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    const pull = () => loadTicker().then((t) => alive && setItems(t));
    pull();
    const id = setInterval(pull, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!items) return null;
  const doubled = [...items, ...items]; // seamless loop

  return (
    <div className="ticker" aria-label="Live StablePrice odds from TxODDS">
      <div className="ticker-track">
        {doubled.map((t, i) => (
          <span className="ticker-item" key={i}>
            <span className="live-dot" aria-hidden />
            {t.label} <b>{t.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
