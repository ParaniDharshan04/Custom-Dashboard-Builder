import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        {/* Register Card */}
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl bg-gray-800 shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#404040]"
        >
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#404040] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                id="register-name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#404040] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                id="register-email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#404040] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                id="register-password"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#404040] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                id="register-confirm-password"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-emerald-500 shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#404040] hover:bg-emerald-600 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
            id="register-submit"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>

          {/* Login link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
