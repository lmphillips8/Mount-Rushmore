import { Link, useLocation } from "react-router-dom";
import {
  Flame,
  Users,
  MessageSquare,
  History as HistoryIcon,
  Sparkles,
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

  return (
    <header className="site-header">
      <Link to="/" className="brand">
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
    </header>
  );
}
