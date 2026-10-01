import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  BrainCircuit, 
  GraduationCap,
  Globe,
  Share2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  KeyRound,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from '../types';
import { registerUser, loginUser } from '../services/auth';

interface AuthPageProps {
  onNavigateHome: () => void;
  onNavigateFeatures?: () => void;
  onLoginSuccess?: (userSession: UserSession) => void;
  initialMode?: 'signin' | 'signup';
  initialNotification?: { message: string; type?: 'success' | 'info' | 'error' } | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigateHome,
  onNavigateFeatures,
  onLoginSuccess,
  initialMode = 'signin',
  initialNotification = null,
}) => {
  // Initialize directly to requested mode (e.g. signup when clicking "Get Started", signin when clicking "Sign In")
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(() => initialMode === 'signup');

  useEffect(() => {
    setIsSignUpMode(initialMode === 'signup');
  }, [initialMode]);

  // Display any redirect notifications (e.g. from Dashboard protection or Logout)
  useEffect(() => {
    if (initialNotification?.message) {
      setNotification({
        message: initialNotification.message,
        type: initialNotification.type || 'info'
      });
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [initialNotification]);

  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '', rememberMe: true });
  const [signUpData, setSignUpData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  
  // Interactive UI states
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [notFoundEmail, setNotFoundEmail] = useState<string | null>(null);
  
  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // SSO is not implemented — buttons show 'Coming Soon'

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = signUpData.password;
    if (!pwd) return { score: 0, label: 'None', color: 'bg-white/10' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Strong', color: 'bg-emerald-400' };
      case 4:
        return { score: 100, label: 'Scholar Shield', color: 'bg-[#d4af37]' };
      default:
        return { score: 10, label: 'Too short', color: 'bg-red-400' };
    }
  }, [signUpData.password]);

  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundEmail(null);
    const trimmedEmail = signInData.email.trim();
    const password = signInData.password;

    if (!trimmedEmail || !password) {
      triggerNotification('Please enter both your email and password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(trimmedEmail, password, signInData.rememberMe);
      setIsLoading(false);

      if (!result.success) {
        if (result.code === 'USER_NOT_FOUND') {
          setNotFoundEmail(trimmedEmail);
          triggerNotification('No account found with this email. Please create an account first.', 'error');
        } else if (result.code === 'NETWORK_ERROR') {
          triggerNotification(result.message, 'error');
        } else {
          triggerNotification(result.message, 'error');
        }
        return;
      }

      triggerNotification('Login successful!', 'success');
      setTimeout(() => {
        if (result.user) {
          onLoginSuccess?.(result.user);
        }
      }, 350);
    } catch (err) {
      setIsLoading(false);
      triggerNotification('An unexpected error occurred during sign in.', 'error');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = signUpData.fullName.trim();
    const trimmedEmail = signUpData.email.trim();
    const password = signUpData.password;
    const confirmPassword = signUpData.confirmPassword;

    // Validate all required fields
    if (!trimmedName) {
      triggerNotification('Please enter your full name.', 'error');
      return;
    }

    if (!trimmedEmail) {
      triggerNotification('Please enter a valid email address.', 'error');
      return;
    }

    if (!password || password.length < 6) {
      triggerNotification('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      triggerNotification('Password and Confirm Password do not match.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(trimmedName, trimmedEmail, password, confirmPassword);
      setIsLoading(false);

      if (!result.success) {
        triggerNotification(result.message, 'error');
        return;
      }

      triggerNotification('Account created successfully! Welcome to ScholarHub.', 'success');

      // Clear sign-up form
      setSignUpData({ fullName: '', email: '', password: '', confirmPassword: '' });
      setNotFoundEmail(null);

      // Transition user immediately to dashboard or sign-in state
      if (result.user && onLoginSuccess) {
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 500);
      } else {
        setSignInData(prev => ({
          ...prev,
          email: trimmedEmail,
          password: ''
        }));
        setTimeout(() => {
          setIsSignUpMode(false);
        }, 300);
      }
    } catch (err) {
      setIsLoading(false);
      triggerNotification('Failed to create account. Please try again.', 'error');
    }
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSent(false);
      setResetEmail('');
      triggerNotification('Password reset is not available yet. Please contact support.', 'info');
    }, 1200);
  };

  const handleSSOClick = (provider: string) => {
    triggerNotification(`${provider} sign-in is coming soon. Please use email/password for now.`, 'info');
  };

  return (
    <div className="relative min-h-screen w-full font-sans-display overflow-hidden bg-[#0a0a0a] text-[#f5f5f5] selection:bg-[#d4af37]/20 selection:text-[#d4af37]">
      
      {/* Background Ambient Glow & Fine Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Floating Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 rounded-full bg-[#d4af37]/5 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full bg-amber-600/5 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Top Floating ScholarHub Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-6 md:px-10 py-3 sm:py-4 pointer-events-none">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="pointer-events-auto flex items-center space-x-1.5 sm:space-x-2 text-left cursor-pointer group shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8c6d17] p-[1px] shadow-[0_0_14px_rgba(212,175,55,0.4)]">
            <div className="w-full h-full bg-[#0a0a0a] rounded-[7px] flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
            </div>
          </div>
          <span className="font-sans-display text-xs sm:text-sm tracking-tight font-medium text-white group-hover:text-[#d4af37] transition-colors">
            ScholarHub<span className="text-[#d4af37]">.</span>
          </span>
        </button>

        {/* Header Action Buttons */}
        <div className="pointer-events-auto flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {onNavigateFeatures && (
            <button
              onClick={onNavigateFeatures}
              className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Sign In / Sign Up Mode Switcher */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md">
            <button
              type="button"
              id="header-switch-signin"
              onClick={() => setIsSignUpMode(false)}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200 cursor-pointer ${
                !isSignUpMode
                  ? 'bg-[#d4af37] text-black font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="header-switch-signup"
              onClick={() => setIsSignUpMode(true)}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200 cursor-pointer ${
                isSignUpMode
                  ? 'bg-[#d4af37] text-black font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <button
            id="auth-back-home-btn"
            onClick={onNavigateHome}
            className="group flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#d4af37]/40 text-white/90 shadow-sm backdrop-blur-md transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#d4af37] transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="inline sm:hidden">Home</span>
          </button>
        </div>
      </header>

      {/* Floating Interactive Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-2xl text-white text-xs sm:text-sm font-medium shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.25)] backdrop-blur-xl border ${
              notification.type === 'error' 
                ? 'bg-red-950/90 border-red-500/50' 
                : 'bg-[#141416]/95 border-[#d4af37]/40'
            }`}
          >
            {notification.type === 'error' ? (
              <X className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sliding Form Container with Dark Theme */}
      <div className={`auth-container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
        
        {/* Forms Container */}
        <div className="forms-container">
          <div className="signin-signup">
            
            {/* SIGN IN FORM */}
            <form id="sign-in-form" onSubmit={handleSignIn} className="sign-in-form">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-[1px] bg-[#d4af37]" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37]">Scholar Access</span>
                <span className="w-6 h-[1px] bg-[#d4af37]" />
              </div>

              <h2 className="title text-white">Sign In</h2>
              <p className="text-xs text-white/50 mb-4 font-light">
                Access your personalized AI study workspace
              </p>

              {/* Email Input Field */}
              <div className="input-field">
                <i className="flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </i>
                <input 
                  id="signin-email-input"
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  value={signInData.email}
                  onChange={(e) => {
                    setSignInData({ ...signInData, email: e.target.value });
                    if (notFoundEmail) setNotFoundEmail(null);
                  }}
                  autoComplete="email"
                  required 
                />
              </div>

              {/* Password Input Field with Eye Reveal */}
              <div className="input-field pr-3">
                <i className="flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </i>
                <input 
                  id="signin-password-input"
                  type={showSignInPassword ? 'text' : 'password'} 
                  name="password"
                  placeholder="Password" 
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  autoComplete="current-password"
                  required 
                />
                <button
                  type="button"
                  id="signin-toggle-password-btn"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="text-white/40 hover:text-[#d4af37] transition-colors p-1 cursor-pointer flex items-center justify-center"
                  title={showSignInPassword ? "Hide password" : "Show password"}
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* No Account Found helper banner with direct Create Account button */}
              {notFoundEmail && (
                <div className="w-full max-w-[380px] p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs my-1 flex flex-col gap-2 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">No account found with this email. Please create an account first.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSignUpData(prev => ({ ...prev, email: notFoundEmail }));
                      setIsSignUpMode(true);
                      setNotFoundEmail(null);
                    }}
                    className="self-start px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e6ca65] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Create Account</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="w-full max-w-[380px] flex items-center justify-between text-xs my-1 px-1">
                <label className="flex items-center space-x-2 text-white/60 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={signInData.rememberMe}
                    onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-[#d4af37] text-black cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#d4af37]/90 hover:text-[#e6ca65] underline-offset-2 hover:underline transition-colors cursor-pointer text-xs"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                id="signin-submit-btn"
                disabled={isLoading}
                className="btn solid flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <p className="social-text">Or Sign in with connected services</p>
              
              <div className="social-media">
                <button
                  type="button"
                  onClick={() => handleSSOClick('Google')}
                  className="social-icon group"
                  title="Sign in with Google"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOClick('University SSO')}
                  className="social-icon group"
                  title="University SSO"
                >
                  <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOClick('GitHub')}
                  className="social-icon group"
                  title="Sign in with GitHub"
                >
                  <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOClick('LinkedIn')}
                  className="social-icon group"
                  title="Sign in with LinkedIn"
                >
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="mt-4 text-center">
                <span className="text-xs text-white/50">New to ScholarHub?</span>{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className="text-xs text-[#d4af37] hover:text-[#f3da82] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Sign Up Free
                </button>
              </div>
            </form>

            {/* SIGN UP FORM */}
            <form id="sign-up-form" onSubmit={handleSignUp} className="sign-up-form">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-6 h-[1px] bg-[#d4af37]" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37]">Join ScholarHub</span>
                <span className="w-6 h-[1px] bg-[#d4af37]" />
              </div>

              <h2 className="title text-white">Create Account</h2>
              <p className="text-xs text-white/50 mb-3 font-light">
                Start mastering subjects 10x faster with AI
              </p>

              {/* Full Name */}
              <div className="input-field">
                <i className="flex items-center justify-center">
                  <User className="w-4 h-4" />
                </i>
                <input 
                  id="signup-fullname-input"
                  type="text" 
                  name="fullName"
                  placeholder="Full Name" 
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                  autoComplete="name"
                  required 
                />
              </div>

              {/* Academic Email Address */}
              <div className="input-field">
                <i className="flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </i>
                <input 
                  id="signup-email-input"
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  autoComplete="email"
                  required 
                />
              </div>

              {/* Password with Eye Reveal */}
              <div className="input-field pr-3">
                <i className="flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </i>
                <input 
                  id="signup-password-input"
                  type={showSignUpPassword ? 'text' : 'password'} 
                  name="password"
                  placeholder="Password (min 6 characters)" 
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  autoComplete="new-password"
                  required 
                />
                <button
                  type="button"
                  id="signup-toggle-password-btn"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="text-white/40 hover:text-[#d4af37] transition-colors p-1 cursor-pointer flex items-center justify-center"
                  title={showSignUpPassword ? "Hide password" : "Show password"}
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password with Eye Reveal */}
              <div className="input-field pr-3">
                <i className="flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </i>
                <input 
                  id="signup-confirm-password-input"
                  type={showSignUpConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  placeholder="Confirm Password" 
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  required 
                />
                <button
                  type="button"
                  id="signup-toggle-confirm-password-btn"
                  onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                  className="text-white/40 hover:text-[#d4af37] transition-colors p-1 cursor-pointer flex items-center justify-center"
                  title={showSignUpConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {signUpData.password && (
                <div className="w-full max-w-[380px] -mt-1 mb-2 px-1">
                  <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                    <span className="flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-[#d4af37]" /> Security: {passwordStrength.label}
                    </span>
                    <span className="font-mono">{passwordStrength.score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                id="create-account-submit-btn"
                disabled={isLoading}
                className="btn flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <p className="social-text">Or Sign up with connected services</p>
              
              <div className="social-media">
                <button
                  type="button"
                  onClick={() => handleSSOClick('Google')}
                  className="social-icon group"
                  title="Sign up with Google"
                >
                  <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOClick('University SSO')}
                  className="social-icon group"
                  title="University SSO"
                >
                  <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOClick('GitHub')}
                  className="social-icon group"
                  title="Sign up with GitHub"
                >
                  <BrainCircuit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSSOClick('LinkedIn')}
                  className="social-icon group"
                  title="Sign up with LinkedIn"
                >
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="mt-4 text-center">
                <span className="text-xs text-white/50">Already have an account?</span>{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className="text-xs text-[#d4af37] hover:text-[#f3da82] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Sign In
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Panels Container */}
        <div 
          className="panels-container"
          style={{ fontFamily: '"Courier New", Courier, monospace' }}
        >
          
          {/* LEFT PANEL (Visible in Sign-In Mode) */}
          <div className="panel left-panel">
            <div className="content">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-mono tracking-wider uppercase mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>New to ScholarHub ?</span>
              </div>
              <h3 className="text-white font-light text-2xl sm:text-3xl tracking-tight">
                Master Any Subject Fast
              </h3>
              <p className="text-white/80 font-light text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                Transform your lecture notes into interactive flashcards, quizzes, and mind maps powered by cutting-edge AI.
              </p>
              <button 
                type="button"
                className="btn transparent mt-3 cursor-pointer" 
                id="sign-up-btn"
                onClick={() => setIsSignUpMode(true)}
                style={{
                  width: '120px',
                  height: '40px',
                  fontSize: '15.2px',
                  lineHeight: '15.8px',
                }}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* RIGHT PANEL (Visible in Sign-Up Mode) */}
          <div className="panel right-panel">
            <div className="content">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-mono tracking-wider uppercase mb-3 backdrop-blur-md">
                <GraduationCap className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Returning Scholar</span>
              </div>
              <h3 className="text-white font-light text-2xl sm:text-3xl tracking-tight">
                One of Us ?
              </h3>
              <p className="text-white/80 font-light text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                Log in to continue where you left off with your AI summaries, saved quizzes, and personal flashcard decks.
              </p>
              <button 
                type="button"
                className="btn transparent mt-3 cursor-pointer" 
                id="sign-in-btn"
                onClick={() => setIsSignUpMode(false)}
                style={{
                  width: '140px',
                  height: '40px',
                  fontSize: '15.2px',
                  lineHeight: '15.8px',
                }}
              >
                Sign In
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md p-6 rounded-3xl bg-[#141416] border border-[#d4af37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.2)] text-white"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] mb-4">
                <KeyRound className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-medium text-white mb-1">Reset Your Password</h3>
              <p className="text-xs text-white/60 mb-4 font-light">
                Enter your academic or registered email address and we will send a secure one-time password reset token.
              </p>

              <form onSubmit={handleSendReset} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#d4af37] focus:bg-white/[0.08] text-white text-sm outline-none transition-all placeholder:text-white/30"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSent}
                    className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-[#d4af37] hover:bg-[#e6ca65] text-black shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {resetSent ? (
                      <>
                        <Check className="w-4 h-4 text-black" />
                        <span>Link Sent!</span>
                      </>
                    ) : (
                      <span>Send Link</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};


