import { useEffect, useRef, useState } from "react";
import { ChevronDown, Sun, Moon, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext.jsx";
import { useTheme } from "../context/useTheme.js";

export default function UserMenu() {
  const { user, logout } = useUser();
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="user-menu" ref={wrapperRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        {user?.avatar && <img src={user.avatar} alt="" />}
        <span>{user ? user.username : "Not signed in"}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-section-label">Theme</div>
          <div className="theme-toggle">
            <button
              type="button"
              className={`theme-toggle-btn${theme === "light" ? " theme-toggle-btn-active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <Sun size={14} />
              Light
            </button>
            <button
              type="button"
              className={`theme-toggle-btn${theme === "dark" ? " theme-toggle-btn-active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <Moon size={14} />
              Dark
            </button>
          </div>

          {user && (
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut size={14} />
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
