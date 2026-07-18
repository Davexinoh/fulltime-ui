import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../idl/wc_markets.json";

export const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID ?? "BTJDBnNJU9L3ZfoBeGW84kDN2zD7XLoeAutqFBrjafHd"
);
export const RPC_URL: string = import.meta.env.VITE_RPC_URL ?? "https://api.devnet.solana.com";
export const CLUSTER: string = import.meta.env.VITE_CLUSTER ?? "devnet";

export const connection = new Connection(RPC_URL, "confirmed");

export type MarketAccount = {
  publicKey: PublicKey;
  creator: PublicKey;
  settler: PublicKey;
  fixtureId: BN;
  statKey: number;
  threshold: number;
  comparison: number;
  closeTs: BN;
  yesPool: BN;
  noPool: BN;
  state: number;
  outcomeYes: boolean;
  settledValue: number;
  proofHash: number[];
  settlementMode: number;
  question: string;
};

const readonlyProvider = new AnchorProvider(
  connection,
  {
    publicKey: PublicKey.default,
    signTransaction: async (t: any) => t,
    signAllTransactions: async (t: any) => t,
  } as any,
  { commitment: "confirmed" }
);
export const readProgram: any = new Program(idl as any, PROGRAM_ID, readonlyProvider as any);

export function writeProgram(wallet: AnchorWallet): any {
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  return new Program(idl as any, PROGRAM_ID, provider);
}

export async function fetchAllMarkets(): Promise<MarketAccount[]> {
  const rows: Array<{ publicKey: PublicKey; account: any }> = await readProgram.account.market.all();
  return rows.map((r) => ({ publicKey: r.publicKey, ...r.account }));
}

export async function fetchMarket(pubkey: PublicKey): Promise<MarketAccount> {
  const account: any = await readProgram.account.market.fetch(pubkey);
  return { publicKey: pubkey, ...account };
}

export function vaultPda(market: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("vault"), market.toBuffer()], PROGRAM_ID)[0];
}
export function positionPda(market: PublicKey, owner: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), market.toBuffer(), owner.toBuffer()],
    PROGRAM_ID
  )[0];
}
export function marketPda(creator: PublicKey, fixtureId: bigint, statKey: number): PublicKey {
  const f = Buffer.alloc(8);
  f.writeBigUInt64LE(fixtureId);
  const s = Buffer.alloc(4);
  s.writeUInt32LE(statKey);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), creator.toBuffer(), f, s],
    PROGRAM_ID
  )[0];
}

export { BN, SystemProgram };
