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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #0a1f0a 0%, #0f1a14 40%, #1a2332 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo — flotando sobre el fondo, sin contenedor */}
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="CryptoStrategy Consulting"
            className="w-52 h-52 mx-auto mb-5 rounded-full"
            style={{
              boxShadow: '0 0 60px rgba(0,0,0,0.7), 0 0 30px rgba(10,31,10,0.8), 0 8px 32px rgba(0,0,0,0.6)',
            }}
          />
          <h1
            className="text-2xl font-bold tracking-widest uppercase mb-1"
            style={{ color: '#c8d8c0', letterSpacing: '0.18em' }}
          >
            CryptoStrategy
          </h1>
          <p
            className="text-sm tracking-[0.35em] uppercase font-light"
            style={{ color: '#7a9a7a' }}
          >
            Consulting
          </p>
        </div>

        {/* Form card — semitransparente para integrarse con el fondo */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(10, 20, 14, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(100, 140, 100, 0.18)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          <h2
            className="font-semibold text-base mb-6 text-center tracking-wider uppercase"
            style={{ color: '#8aaa8a' }}
          >
            Acceso al Dashboard
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: '#6a8a6a' }}
              >
                Usuario
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a7a5a' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="csc"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(100,140,100,0.25)',
                    color: '#d0e8d0',
                  }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-1.5"
                style={{ color: '#6a8a6a' }}
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5a7a5a' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(100,140,100,0.25)',
                    color: '#d0e8d0',
                  }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div
                className="text-sm px-3 py-2 rounded-lg text-center"
                style={{ background: 'rgba(139,0,0,0.3)', color: '#ffaaaa', border: '1px solid rgba(139,0,0,0.4)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm tracking-widest uppercase transition-all disabled:opacity-50 mt-2"
              style={{
                background: 'linear-gradient(135deg, #1a3a1a 0%, #1e3a2e 100%)',
                color: '#a0c8a0',
                border: '1px solid rgba(100,160,100,0.3)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <p
            className="text-center text-xs mt-5 tracking-wider"
            style={{ color: '#3a5a3a' }}
          >
            Acceso restringido — solo uso interno CSC
          </p>
        </div>
      </div>
    </div>
  );
}
