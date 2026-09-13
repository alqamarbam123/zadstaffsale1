import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, X, ArrowRight, RotateCcw, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { 
  getStoredAdminPassword, 
  saveStoredAdminAuth, 
  resetStoredAdminPassword, 
  DEFAULT_ADMIN_PASSWORD,
  saveStoredAdminAutoOpen,
  saveStoredActiveView
} from '../utils/storage';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [alwaysStayLoggedIn, setAlwaysStayLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showResetCard, setShowResetCard] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSavedPassword = getStoredAdminPassword();

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const entered = password.trim();
    if (!entered) {
      setError('Please enter the Admin security password or PIN.');
      triggerShake();
      return;
    }

    // Also accept default password as emergency override
    if (entered === currentSavedPassword || entered === DEFAULT_ADMIN_PASSWORD) {
      saveStoredAdminAuth(true, rememberMe);
      saveStoredAdminAutoOpen(alwaysStayLoggedIn);
      saveStoredActiveView('admin');
      setError(null);
      setPassword('');
      onSuccess();
    } else {
      setError(`Incorrect admin password. If you forgot your password, click "Forgot Password? Reset to Default" below.`);
      triggerShake();
    }
  };

  const handleResetToDefault = () => {
    resetStoredAdminPassword();
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setError(null);
    setResetSuccessMessage(`Password successfully reset to default: "${DEFAULT_ADMIN_PASSWORD}". You can now click Unlock!`);
    setTimeout(() => {
      setResetSuccessMessage(null);
      setShowResetCard(false);
    }, 4000);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        className={`bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-transform ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-slate-100 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white/15 text-slate-200 rounded-full uppercase tracking-wider">
                  Admin Authorization
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Staff Sales Admin Hub
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Authorized ZAD logistics, dispatch & pricing personnel only.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-4 text-xs">
          {/* Reset Success Banner */}
          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-semibold">
                Admin Passcode / Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetCard(!showResetCard)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                {showResetCard ? 'Hide reset options' : 'Forgot Password?'}
              </button>
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter admin security password"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-rose-700 font-medium">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Quick Password Reset Box */}
          {showResetCard && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Reset Admin Password</span>
              </div>
              <p className="text-[11px] text-slate-600">
                The default built-in password for the portal is <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-blue-200">{DEFAULT_ADMIN_PASSWORD}</strong>.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to Default ({DEFAULT_ADMIN_PASSWORD}) & Auto-Fill
                </button>
              </div>
            </div>
          )}

          {/* Persistent Login Settings */}
          <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 accent-slate-900"
              />
              <div className="text-[11px] text-slate-700 font-semibold leading-tight">
                Keep admin session active on this browser
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                  You will stay logged in even if the tab or browser is closed.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer pt-1 border-t border-slate-200/80">
              <input
                type="checkbox"
                checked={alwaysStayLoggedIn}
                onChange={(e) => setAlwaysStayLoggedIn(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 accent-slate-900"
              />
              <div className="text-[11px] text-slate-700 font-semibold leading-tight">
                Always open in Admin Hub
                <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                  Directly load the Admin Fulfillment Hub when opening this website.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              Unlock Admin Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
