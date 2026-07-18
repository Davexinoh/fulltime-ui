import { useEffect, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import Navbar from "./components/Navbar";
import Ticker from "./components/Ticker";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import CreateMarket from "./pages/CreateMarket";
import { RPC_URL, PROGRAM_ID, CLUSTER } from "./lib/anchor";
import { loadFixtures } from "./lib/api";

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  // Warm the fixture-name cache from the backend once per session.
  useEffect(() => {
    loadFixtures();
  }, []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Ticker />
          <Navbar />
          <Routes>
            <Route path="/" element={<Markets />} />
            <Route path="/market/:pubkey" element={<MarketDetail />} />
            <Route path="/create" element={<CreateMarket />} />
          </Routes>
          <footer className="site">
            <span>Fulltime · settled by TxODDS onchain oracle · no admin decides</span>
            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=${CLUSTER}`}
              target="_blank"
              rel="noreferrer"
            >
              program {PROGRAM_ID.toBase58().slice(0, 8)}… ↗
            </a>
          </footer>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
