import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@orion.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker p-4">
      <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-darker rounded-full flex items-center justify-center border border-gray-700 shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-4">
            <Shield className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest">ORION</h1>
          <p className="text-gray-400 text-sm mt-2 text-center uppercase tracking-wider">Organizational Risk Intelligence</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded flex items-center gap-2 mb-6">
            <ShieldAlert size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Secure Link / Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Access Key / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark/50 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full btn-primary py-3 mt-4 flex items-center justify-center"
          >
            {loading ? 'Authenticating...' : 'INITIALIZE SYSTEM'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          System v1.0.0. Classified Access Only.
        </div>
      </div>
    </div>
  );
}
