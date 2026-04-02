import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User } from 'lucide-react';

const CREDENTIALS = { username: 'csc', password: 'csc2024' };

export default function Login() {
  const { setIsLoggedIn } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
        setIsLoggedIn(true);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#1E2A6E] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="CryptoStrategy Consulting"
            className="w-44 h-44 mx-auto mb-4 drop-shadow-2xl rounded-full"
          />
          <h1 className="text-white text-2xl font-bold tracking-wide">CryptoStrategy Consulting</h1>
          <p className="text-blue-300 text-sm mt-1">Portfolio Management Dashboard</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-[#1E2A6E] font-bold text-lg mb-6 text-center">Acceso al Dashboard</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Usuario</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="csc"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E2A6E] focus:ring-1 focus:ring-[#1E2A6E]"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1E2A6E] focus:ring-1 focus:ring-[#1E2A6E]"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-[#FFE8E8] text-[#8B0000] text-sm px-3 py-2 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E2A6E] text-white rounded-lg font-semibold hover:bg-[#2E4A9E] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Acceso restringido — solo uso interno CSC
          </p>
        </div>
      </div>
    </div>
  );
}
