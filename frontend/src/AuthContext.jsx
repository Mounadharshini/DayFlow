import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('dayflow_auth');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const login = (token, user) => {
    const value = { token, user };
    localStorage.setItem('dayflow_auth', JSON.stringify(value));
    setAuth(value);
  };

  const logout = () => {
    localStorage.removeItem('dayflow_auth');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ 
      auth, 
      token: auth?.token, 
      user: auth?.user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
