import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800 shadow-[6px_6px_12px_#1a1a1a,-6px_-6px_12px_#404040] mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Dashboard Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl bg-gray-800 shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#404040]"
        >
          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#404040] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                id="login-email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#404040] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                id="login-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-emerald-500 shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#404040] hover:bg-emerald-600 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            id="login-submit"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>

          {/* Register link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
