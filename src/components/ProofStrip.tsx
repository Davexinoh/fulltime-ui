import { hexHash } from "../lib/format";
import { CLUSTER } from "../lib/anchor";

export default function ProofStrip({
  proofHash,
  settledValue,
  statKey,
  marketKey,
}: {
  proofHash: number[];
  settledValue: number;
  statKey: number;
  marketKey: string;
}) {
  const hex = hexHash(proofHash);
  const explorer = `https://explorer.solana.com/address/${marketKey}?cluster=${CLUSTER}`;
  return (
    <div className="proof">
      <span className="title">Settlement proven by TxODDS onchain oracle</span>
      <span className="hash">sha256(proof bundle): {hex}</span>
      <div className="kv">
        <span className="k">Observed statKey {statKey}</span>
        <span className="v">{settledValue}</span>
      </div>
      <div className="links">
        <a href={explorer} target="_blank" rel="noreferrer">View market account ↗</a>
      </div>
    </div>
  );
}
