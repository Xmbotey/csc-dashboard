import { createContext, useContext, useState } from 'react';
import { investors as initialInvestors, PRICES } from '../data/investors';
import { SIM_DEFAULTS } from '../utils/simulation';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [investors, setInvestors] = useState(initialInvestors);
  const [prices] = useState(PRICES);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [simParams, setSimParams] = useState(SIM_DEFAULTS);

  function updateInvestor(id, updates) {
    setInvestors(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  }

  return (
    <AppContext.Provider value={{ investors, prices, updateInvestor, isLoggedIn, setIsLoggedIn, simParams, setSimParams }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
