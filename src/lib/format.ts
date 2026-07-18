import { BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function sol(lamports: BN | number): string {
  const n = typeof lamports === "number" ? lamports : lamports.toNumber();
  return (n / LAMPORTS_PER_SOL).toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export function impliedYesPct(yes: BN, no: BN): number | null {
  const y = yes.toNumber(), n = no.toNumber();
  if (y + n === 0) return null;
  return (y / (y + n)) * 100;
}

export function hexHash(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function stateName(state: number): "open" | "settled" | "voided" {
  return state === 1 ? "settled" : state === 2 ? "voided" : "open";
}

export function timeLeft(closeTs: number): string {
  const ms = closeTs * 1000 - Date.now();
  if (ms <= 0) return "closed";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 48) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}
