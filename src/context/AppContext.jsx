import { createContext, useContext, useState } from 'react';
import { investors as initialInvestors, PRICES } from '../data/investors';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [investors, setInvestors] = useState(initialInvestors);
  const [prices] = useState(PRICES);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function updateInvestor(id, updates) {
    setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  }

  return (
    <AppContext.Provider value={{ investors, prices, updateInvestor, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
