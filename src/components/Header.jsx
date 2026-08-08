import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Flame,
  Users,
  MessageSquare,
  History as HistoryIcon,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useUser } from "../context/UserContext.jsx";

const NAV = [
  { to: "/", label: "Today", icon: Flame, color: "orange" },
  { to: "/community", label: "Community", icon: Users, color: "blue" },
  { to: "/suggest", label: "Suggest", icon: MessageSquare, color: "green" },
  { to: "/history", label: "History", icon: HistoryIcon, color: "gold" },
];

export default function Header() {
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <Link to="/" className="brand site-title">
        <span className="brand-mark">
          <Sparkles size={15} />
        </span>
        Mount Rushmore
      </Link>

      <nav className="site-nav">
        {NAV.map(({ to, label, icon: Icon, color }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`nav-pill${active ? ` nav-pill-active nav-pill-${color}` : ""}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="header-user">
        {user ? (
          <>
            <span>
              {user.avatar && <img src={user.avatar} alt="" />}
              {user.username}
            </span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              Log out
            </a>
          </>
        ) : (
          <span>Not signed in</span>
        )}
      </div>

      <button
        type="button"
        className="nav-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div
        className={`nav-backdrop${menuOpen ? " nav-backdrop-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <nav
        id="mobile-nav"
        className={`site-nav-mobile${menuOpen ? " site-nav-mobile-open" : ""}`}
      >
        {NAV.map(({ to, label, icon: Icon, color }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`nav-pill${active ? ` nav-pill-active nav-pill-${color}` : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}

        <div className="header-user header-user-mobile">
          {user ? (
            <>
              <span>
                {user.avatar && <img src={user.avatar} alt="" />}
                {user.username}
              </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  setMenuOpen(false);
                }}
              >
                Log out
              </a>
            </>
          ) : (
            <span>Not signed in</span>
          )}
        </div>
      </nav>
    </header>
  );
}
