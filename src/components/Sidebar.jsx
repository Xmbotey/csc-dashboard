import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Droplets, Zap, Building2,
  TrendingUp, DollarSign, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/inversores', icon: Users, label: 'Inversores' },
  { path: '/posiciones-v3', icon: Droplets, label: 'Posiciones V3' },
  { path: '/deltas', icon: Zap, label: 'Deltas' },
  { path: '/colaterales', icon: Building2, label: 'Colaterales & Deuda' },
  { path: '/proyecciones', icon: TrendingUp, label: 'Proyecciones' },
  { path: '/totales-csc', icon: DollarSign, label: 'Totales CSC' },
];

export default function Sidebar() {
  const { setIsLoggedIn, prices } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-white text-[#1E2A6E] shadow-sm'
        : 'text-blue-100 hover:bg-[#2E4A9E] hover:text-white'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#2E4A9E]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-[#1E2A6E] font-bold text-sm">CSC</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CryptoStrategy</p>
            <p className="text-blue-200 text-xs">Consulting</p>
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="px-4 py-3 border-b border-[#2E4A9E] bg-[#162060]">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-blue-300">ETH</span>
            <span className="text-white font-medium">${prices.ETH.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-blue-300">BNB</span>
            <span className="text-white font-medium">${prices.BNB.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-blue-300">XRP</span>
            <span className="text-white font-medium">${prices.XRP.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-blue-400 text-xs mt-2">
          {new Date(prices.lastUpdated).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} end={path === '/'} className={linkClass} onClick={() => setMobileOpen(false)}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#2E4A9E]">
        <button
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-200 hover:bg-[#2E4A9E] hover:text-white w-full transition-all"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#1E2A6E] fixed top-0 left-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1E2A6E] flex items-center justify-between px-4 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#1E2A6E] font-bold text-xs">CSC</span>
          </div>
          <span className="text-white font-bold text-sm">CryptoStrategy</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 left-0 w-56 h-full bg-[#1E2A6E] z-50">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
