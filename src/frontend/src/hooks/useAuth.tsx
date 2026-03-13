import { type ReactNode, createContext, useContext } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear } = useInternetIdentity();
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!identity,
        login,
        logout: clear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
