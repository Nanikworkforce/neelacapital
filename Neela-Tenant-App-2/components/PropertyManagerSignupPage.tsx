import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import NeelaLogo from './NeelaLogo';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft, User, Phone, CheckCircle } from 'lucide-react';
import { SEO_PAGES, usePageMeta } from '../utils/seo';

const PropertyManagerSignupPage: React.FC = () => {
  const navigate = useNavigate();
  usePageMeta(SEO_PAGES.managerLogin);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await api.signupPropertyManager({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-cyan-900 text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80')] opacity-20 bg-cover bg-center" aria-hidden />
      <div className="relative z-10 w-full max-w-lg">
        <Link to="/manager/login" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-500/10 border border-slate-200/60 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-b from-emerald-50/90 to-white">
            <div className="flex flex-col items-center text-center gap-3 max-w-sm mx-auto">
              <NeelaLogo variant="full" size="lg" showGlow={false} />
              <div className="space-y-1 w-full">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Create Manager Account
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Sign up to request property manager access. An admin will review your request.
                </p>
              </div>
            </div>
          </div>

          {done ? (
            <div className="p-6 sm:p-8 space-y-4 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Request submitted</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your account is <strong>pending approval</strong>. You can sign in now to see your status.
                Once approved, you’ll get an email and access to your assigned properties.
              </p>
              <button
                type="button"
                onClick={() => navigate('/manager/login', { replace: true })}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">First name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last name</label>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Middle name <span className="text-slate-400 font-normal">(optional)</span></label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" autoComplete="tel" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-11 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</label>
                <input type={showPassword ? 'text' : 'password'} required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none" autoComplete="new-password" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating…</> : 'Create Account'}
              </button>
              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/manager/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyManagerSignupPage;
