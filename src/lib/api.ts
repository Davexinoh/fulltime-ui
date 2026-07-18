// Ingestion backend client. Everything here degrades gracefully:
// no backend configured or reachable -> null, UI falls back to static data.
// No fabricated values, ever.
import { fixtureCache, type FixtureInfo } from "./fixtures";

const BASE: string = (import.meta.env.VITE_INGESTION_URL ?? "").replace(/\/$/, "");

export type UiFixture = FixtureInfo & { fixtureId: string };
export type TickerItem = { label: string; value: string };

async function get(path: string): Promise<any | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Upcoming fixtures with resolved names. Merges into fixtureCache for the whole app. */
export async function loadFixtures(): Promise<UiFixture[] | null> {
  const data = await get("/ui/fixtures");
  if (!Array.isArray(data)) return null;
  const out: UiFixture[] = [];
  for (const f of data) {
    if (!f?.fixtureId) continue;
    const info: FixtureInfo = {
      name: String(f.name ?? `Fixture #${f.fixtureId}`),
      stage: String(f.stage ?? "World Cup 2026"),
      kickoff: String(f.kickoff ?? ""),
    };
    fixtureCache[String(f.fixtureId)] = info;
    out.push({ fixtureId: String(f.fixtureId), ...info });
  }
  return out;
}

/** Live StablePrice ticker items for the next fixture. Null when unavailable. */
export async function loadTicker(): Promise<TickerItem[] | null> {
  const data = await get("/ui/ticker");
  if (!Array.isArray(data) || data.length === 0) return null;
  return data
    .filter((t) => t?.label && t?.value)
    .map((t) => ({ label: String(t.label), value: String(t.value) }));
}
