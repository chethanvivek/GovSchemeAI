import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isColdStart, setIsColdStart] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialOrNum = /[0-9]|[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    setIsColdStart(false);

    if (!hasMinLength || !hasUppercase || !hasSpecialOrNum) {
      setError('Password must satisfy all security requirements: minimum 8 characters, 1 uppercase letter, and 1 number or special character.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
      navigate('/profile'); // Direct user to complete their demographic profile first
    } catch (err) {
      console.error('Registration error:', err);
      const status = err.response?.status;
      const is502 = status === 502;
      const isColdStartStatus = status === 502 || status === 503 || status === 504;
      const isTimeout =
        err.code === 'ECONNABORTED' ||
        (err.message && err.message.toLowerCase().includes('timeout')) ||
        (err.message && err.message.toLowerCase().includes('network error')) ||
        (!err.response && Boolean(err.request));

      if (is502 || isColdStartStatus || isTimeout) {
        setIsColdStart(true);
        setError('Server is waking up. Connecting...');
      } else {
        setIsColdStart(false);
        const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed. Please try again.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Free Citizen Account
          </h2>
          <p className="text-xs text-slate-500">
            Discover all schemes you qualify for with zero spam and end-to-end data isolation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 shadow-xs border ${
            isColdStart ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isColdStart ? 'text-amber-600' : 'text-rose-500'}`} />
            <div className="flex-1 space-y-2">
              <p className="font-medium leading-relaxed">{error}</p>
              {isColdStart ? (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-rose-600">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold underline hover:text-rose-800 transition-colors">
                    Click here to Sign In
                  </Link>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
              At least 8 characters
            </div>
            <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
              At least 1 uppercase letter
            </div>
            <div className={`flex items-center gap-1.5 ${hasSpecialOrNum ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${hasSpecialOrNum ? 'text-emerald-600' : 'text-slate-300'}`} />
              At least 1 number or special character
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Secure Account...
              </>
            ) : (
              <>
                Create Account & Set Profile <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-2 text-xs text-slate-600 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
