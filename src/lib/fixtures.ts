// Static fallback names for known TxLINE IDs. The live source is the ingestion
// backend (lib/api.ts); this map keeps the UI honest when the backend is absent.
export type FixtureInfo = { name: string; stage: string; kickoff: string };

export const FIXTURES: Record<string, FixtureInfo> = {
  "18257865": { name: "France vs England", stage: "Third place", kickoff: "2026-07-18T21:00:00Z" },
  "18257739": { name: "Spain vs Argentina", stage: "Final", kickoff: "2026-07-19T19:00:00Z" },
};

// Merged at runtime with backend fixtures (backend wins).
export const fixtureCache: Record<string, FixtureInfo> = { ...FIXTURES };

export function fixtureName(id: string | number): string {
  return fixtureCache[String(id)]?.name ?? `Fixture #${id}`;
}
export function fixtureStage(id: string | number): string {
  return fixtureCache[String(id)]?.stage ?? "World Cup 2026";
}

export const STAT_KEYS: Record<number, string> = {
  1: "P1 goals (full game)", 2: "P2 goals (full game)",
  3: "P1 yellow cards", 4: "P2 yellow cards",
  5: "P1 red cards", 6: "P2 red cards",
  7: "P1 corners", 8: "P2 corners",
  1001: "P1 goals (1st half)", 1002: "P2 goals (1st half)",
  1007: "P1 corners (1st half)", 1008: "P2 corners (1st half)",
  3001: "P1 goals (2nd half)", 3002: "P2 goals (2nd half)",
  3007: "P1 corners (2nd half)", 3008: "P2 corners (2nd half)",
};