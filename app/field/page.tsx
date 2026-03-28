'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, Loader2, Delete } from 'lucide-react';

const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function FieldLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function pressKey(key: string) {
    if (loading) return;
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      setError('');
      return;
    }
    if (pin.length >= 6) return;
    const next = pin + key;
    setPin(next);
    setError('');
    if (next.length >= 4) {
      submit(next);
    }
  }

  async function submit(p: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/field/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: p }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fieldEmployee', JSON.stringify(data.employee));
        router.push('/field/log');
      } else {
        setError(data.message || 'Invalid PIN');
        setPin('');
      }
    } catch {
      setError('Connection error. Try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-3">
          <Bug className="w-9 h-9 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Absolute Pest</h1>
        <p className="text-slate-400 text-sm mt-1">Technician Portal</p>
      </div>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-colors ${
              i < pin.length
                ? 'bg-green-400 border-green-400'
                : 'bg-transparent border-slate-500'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
      )}

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {PAD.map((key, i) => (
          key === '' ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => pressKey(key)}
              disabled={loading}
              className={`
                h-16 rounded-2xl text-white text-xl font-semibold
                flex items-center justify-center
                transition-all active:scale-95
                ${key === '⌫'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-slate-800 hover:bg-slate-700'
                }
                disabled:opacity-50
              `}
            >
              {loading && key !== '⌫' ? (
                i === 9 ? <Loader2 className="w-5 h-5 animate-spin" /> : key
              ) : key}
            </button>
          )
        ))}
      </div>

      <p className="text-slate-500 text-xs mt-8">Enter your 4-digit PIN</p>
    </div>
  );
}
