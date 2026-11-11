import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck, Shield } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.user.role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (res.user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError(err || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back to SmartHire
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access personalized job recommendations and manage applications
          </p>
        </div>

        {/* 1-Click Demo Accounts Card */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Instant Demo Logins (For Presentation / Viva Evaluation)</span>
          </div>
          <p className="text-[11px] text-indigo-700/80 mb-3">
            Click any role below to prefill testing credentials:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('candidate@smarthire.dev', 'candidate')}
              className="px-2.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-sm flex flex-col items-center gap-1"
            >
              <UserCheck className="w-4 h-4 text-current" />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('recruiter@smarthire.dev', 'recruiter')}
              className="px-2.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-sm flex flex-col items-center gap-1"
            >
              <Briefcase className="w-4 h-4 text-current" />
              <span>Recruiter</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@smarthire.dev', 'admin')}
              className="px-2.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-800 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition shadow-sm flex flex-col items-center gap-1"
            >
              <Shield className="w-4 h-4 text-current" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
