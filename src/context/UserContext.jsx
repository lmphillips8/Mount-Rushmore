import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "../api.js";

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined);

  const refreshUser = useCallback(() => {
    return api.me().then((r) => {
      setUser(r.user);
      return r.user;
    });
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const loginAsGuest = useCallback(
    async (name) => {
      await api.anonLogin(name);
      return refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, refreshUser, loginAsGuest, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// Usage: const { user, loginAsGuest, logout } = useUser();
export function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error("useUser must be called within a <UserProvider>");
  }
  return ctx;
}
