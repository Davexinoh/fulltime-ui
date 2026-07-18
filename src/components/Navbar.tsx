import { NavLink } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Navbar() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-brand">
        <span className="dot" aria-hidden />
        Fulltime
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Markets
        </NavLink>
        <NavLink to="/create" className={({ isActive }) => (isActive ? "active" : "")}>
          Create
        </NavLink>
        <WalletMultiButton />
      </div>
    </nav>
  );
}
