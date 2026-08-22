'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Login gagal, periksa kembali username dan password.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
            RUMAH <span style={{ color: 'var(--text-primary)' }}>NAINI</span>
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Silakan login untuk mengakses sistem POS
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
              required
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
              required
              placeholder="Masukkan password"
            />
          </div>

          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--cyan))' }}
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
