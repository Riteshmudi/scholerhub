/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Info, Sparkles } from 'lucide-react';
import { FeaturesSection } from './components/FeaturesSection';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { PageView, UserSession } from './types';
import { authService, isAuthenticated, logoutUser } from './services/auth';

// Standard smooth page transitions
const heroPageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(6px)',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const loginPortalVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(6px)',
    transition: {
      duration: 0.25,
      ease: 'easeIn',
    },
  },
};

const featuresPageVariants = {
  initial: {
    opacity: 0,
    x: 40,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const dashboardVariants = {
  initial: {
    opacity: 0,
    scale: 0.985,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function App() {
  const [showDetails, setShowDetails] = useState(false);
  
  // Persistent session support across reloads via centralized auth service
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return authService.getCurrentUser();
  });

  const [activeNav, setActiveNav] = useState<PageView>(() => {
    const user = authService.getCurrentUser();
    if (user?.isLoggedIn && authService.isAuthenticated()) {
      return 'dashboard';
    }
    return 'home';
  });

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authSessionKey, setAuthSessionKey] = useState<number>(0);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [isTransitioningAuth, setIsTransitioningAuth] = useState<'signin' | 'signup' | null>(null);

  // Check URL path or hash for direct navigation (e.g. /dashboard.html, /signup.html, /signin.html)
  React.useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path.includes('dashboard') || hash.includes('dashboard')) {
      if (!authService.isAuthenticated()) {
        setActiveNav('login');
        setAuthMode('signin');
        setAuthRedirectMessage({
          message: 'Please sign in to access your dashboard.',
          type: 'error'
        });
        setAuthSessionKey(prev => prev + 1);
        try {
          window.history.replaceState(null, '', window.location.pathname.replace('dashboard.html', 'signin.html'));
        } catch {
          // ignore
        }
      } else {
        setActiveNav('dashboard');
      }
    } else if (path.includes('signup') || hash.includes('signup')) {
      if (authService.isAuthenticated()) {
        setActiveNav('dashboard');
      } else {
        setActiveNav('login');
        setAuthMode('signup');
      }
    } else if (path.includes('signin') || hash.includes('signin') || path.includes('login') || hash.includes('login')) {
      if (authService.isAuthenticated()) {
        setActiveNav('dashboard');
      } else {
        setActiveNav('login');
        setAuthMode('signin');
      }
    }
  }, []);

  // Strict route protection: Prevent unauthenticated access to dashboard
  React.useEffect(() => {
    if (activeNav === 'dashboard' && (!currentUser?.isLoggedIn || !authService.isAuthenticated())) {
      setActiveNav('login');
      setAuthMode('signin');
      setAuthRedirectMessage({
        message: 'Please sign in to access your dashboard.',
        type: 'error'
      });
      setAuthSessionKey(prev => prev + 1);
    }
  }, [activeNav, currentUser]);

  // Lock body scroll strictly while on the fixed hero page
  React.useEffect(() => {
    if (activeNav === 'home') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeNav]);

  const handleNavigateToLogin = (mode: 'signin' | 'signup' = 'signin') => {
    if (currentUser?.isLoggedIn && authService.isAuthenticated()) {
      setActiveNav('dashboard');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    setAuthMode(mode);
    setAuthRedirectMessage(null);
    setIsTransitioningAuth(mode);

    // Dynamic golden portal transition sweep from hero to auth page
    setTimeout(() => {
      setAuthSessionKey((prev) => prev + 1);
      setActiveNav('login');
      setTimeout(() => {
        setIsTransitioningAuth(null);
      }, 400);
    }, 240);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAuthMode('signin');
    setAuthRedirectMessage({
      message: 'You have been logged out.',
      type: 'info'
    });
    setAuthSessionKey((prev) => prev + 1);
    setActiveNav('login');

    // Prevent browser back button from re-entering dashboard
    try {
      window.history.replaceState(null, '', window.location.pathname.replace(/dashboard(\.html)?/, 'signin.html'));
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-[#f5f5f5] relative overflow-x-hidden selection:bg-[#d4af37]/20 selection:text-[#d4af37]">
      {/* Golden Portal Transition Sweep between Hero and Login */}
      <AnimatePresence>
        {isTransitioningAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-xs"
          >
            {/* Shimmering Golden Sweep Beam */}
            <motion.div
              initial={{ x: isTransitioningAuth === 'signup' ? '-100%' : '100%', opacity: 0.8 }}
              animate={{ x: '0%', opacity: 1 }}
              exit={{ x: isTransitioningAuth === 'signup' ? '100%' : '-100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent pointer-events-none"
            />
            {/* Elegant Status Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full bg-[#141416]/95 border border-[#d4af37]/50 shadow-[0_0_25px_rgba(212,175,55,0.35)] text-white text-xs font-mono tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-spin" />
              <span>{isTransitioningAuth === 'signup' ? 'Preparing Sign Up...' : 'Accessing Sign In...'}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {activeNav === 'home' ? (
          <motion.div
            key="home-view"
            variants={heroPageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform, opacity, filter' }}
            id="hero-root-container"
            className="fixed inset-0 w-screen h-screen h-[100dvh] max-h-[100dvh] bg-[#0a0a0a] text-[#f5f5f5] font-sans-display overflow-hidden flex flex-col selection:bg-[#d4af37]/20 selection:text-[#d4af37]"
          >
            {/* Background Video Layer - Responsive across Desktop, Tablet, and Mobile */}
            <div 
              aria-hidden="true" 
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0a0a0a]"
            >
              {/* Subtle ambient blurred video backdrop filling entire canvas */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-25 blur-2xl scale-105 pointer-events-none"
                src="https://res.cloudinary.com/ugpykeqo/video/upload/v1788298176/Firefly_Keep_the_original_composition_robotic_hand_and_holographic_brain_unchanged._The_glowing_ho_1.mp4"
              />

              {/* Desktop & Wide Screens (md+): Crisp 16:9 right-aligned composition */}
              <div className="hidden md:flex relative w-full h-full items-center justify-end max-w-[1920px] max-h-[100dvh]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain object-right aspect-video opacity-95 brightness-[0.88] contrast-[1.05]"
                  src="https://res.cloudinary.com/ugpykeqo/video/upload/v1788298176/Firefly_Keep_the_original_composition_robotic_hand_and_holographic_brain_unchanged._The_glowing_ho_1.mp4"
                />
                {/* Desktop left-to-right fade for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/75 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              </div>

              {/* Mobile & Tablet (< md): Full-bleed atmospheric video layer with seamless radial & vertical vignette */}
              <div className="md:hidden absolute inset-0 w-full h-full overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-[72%_38%] opacity-45 brightness-[0.80] contrast-[1.12]"
                  src="https://res.cloudinary.com/ugpykeqo/video/upload/v1788298176/Firefly_Keep_the_original_composition_robotic_hand_and_holographic_brain_unchanged._The_glowing_ho_1.mp4"
                />
                {/* Vertical ambient fade to eliminate any horizontal letterbox seams */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-[#0a0a0a]/95 pointer-events-none" />
                {/* Text backdrop contrast gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/65 to-transparent pointer-events-none" />
                {/* Soft radial vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0a0a0a_90%)] pointer-events-none" />
              </div>

              {/* Sophisticated geometric orbital lines */}
              <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-[15%] right-[-10%] w-[500px] h-[500px] border border-white/5 rounded-full" />
                <div className="absolute top-[8%] right-[-20%] w-[750px] h-[750px] border border-white/5 rounded-full" />
              </div>
            </div>

            {/* Top minimal control bar (Sophisticated Dark aesthetic) */}
            <header className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 pt-3 sm:pt-4 pb-1.5 flex items-center justify-between gap-2 sm:gap-4 shrink-0">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center space-x-2 sm:space-x-3 text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white/50 font-medium shrink-0"
              >
                <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                <span className="text-white/80 font-bold tracking-[0.25em] sm:tracking-[0.35em] text-xs sm:text-sm">ScholarHub</span>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                className="flex items-center space-x-1.5 sm:space-x-3 shrink-0"
              >
                {/* Navigation links */}
                <nav className="flex items-center bg-white/[0.04] border border-white/10 rounded-full p-0.5 sm:p-1 text-[11px] sm:text-xs text-white/60 backdrop-blur-md">
                  <button
                    id="nav-home-btn"
                    onClick={() => setActiveNav('home')}
                    className={`px-2.5 sm:px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                      activeNav === 'home' ? 'bg-white/15 text-[#f5f5f5] font-medium shadow-xs' : 'hover:text-white/90 text-white/60'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    id="nav-features-btn"
                    onClick={() => setActiveNav('features')}
                    className={`px-2.5 sm:px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                      activeNav === 'features' ? 'bg-white/15 text-[#f5f5f5] font-medium shadow-xs' : 'hover:text-white/90 text-white/60'
                    }`}
                  >
                    Features
                  </button>
                  {currentUser?.isLoggedIn && (
                    <button
                      id="nav-dashboard-btn"
                      onClick={() => setActiveNav('dashboard')}
                      className={`px-2.5 sm:px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                        activeNav === 'dashboard' ? 'bg-indigo-600 text-white font-medium shadow-xs' : 'hover:text-white/90 text-indigo-300'
                      }`}
                    >
                      Dashboard
                    </button>
                  )}
                </nav>

                <button
                  id="header-get-started-btn"
                  onClick={() => currentUser?.isLoggedIn ? setActiveNav('dashboard') : handleNavigateToLogin('signup')}
                  className="group flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-black bg-[#d4af37] hover:bg-[#e6ca65] shadow-xs hover:shadow-[0_0_16px_rgba(212,175,55,0.4)] transition-all duration-200 cursor-pointer shrink-0 active:scale-95"
                >
                  <span>{currentUser?.isLoggedIn ? 'Dashboard' : 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

                <button
                  id="info-toggle-btn"
                  onClick={() => setShowDetails(!showDetails)}
                  className="hidden xs:flex p-1.5 sm:p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer shrink-0"
                  title="Layout Specifications"
                >
                  <Info className="w-4 h-4" />
                </button>
              </motion.div>
            </header>

            {/* Floating Info specs drawer if requested */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-16 right-4 sm:right-12 z-30 p-4 rounded-xl bg-black/85 border border-white/15 backdrop-blur-xl text-xs text-white/80 max-w-sm shadow-2xl"
              >
                <div className="flex justify-between items-center mb-2.5 font-medium text-white">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">Theme: Sophisticated Dark</span>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="text-white/40 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <p className="mb-1.5"><strong className="text-white">Palette:</strong> #0A0A0A (Obsidian Dark Canvas), #D4AF37 (Warm Metallic Gold), #F5F5F5 (Crisp Platinum Off-White).</p>
                <p className="mb-1.5"><strong className="text-white">Headlines:</strong> Light tracking sans + Playfair Serif Italic cyan accent.</p>
                <p><strong className="text-white">Ratio:</strong> Fixed 100vh viewport with zero page scroll.</p>
              </motion.div>
            )}

            {/* Main Hero Stage - Fixed Viewport Ratio, Responsive Padding */}
            <main 
              id="hero-content-section"
              className="relative z-10 flex-1 min-h-0 flex flex-col justify-center px-5 sm:px-8 md:px-12 lg:px-20 xl:px-24 py-3 sm:py-4 w-full max-w-7xl mx-auto overflow-y-auto no-scrollbar"
            >
              <div className="w-full max-w-5xl my-auto py-2 flex flex-col justify-center">
                
                {/* Hero Feature Pill Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="mb-2.5 sm:mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-[#d4af37]/35 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.12)] select-none hover:border-[#d4af37]/60 transition-colors w-fit"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-white/90 whitespace-nowrap inline-flex items-center gap-1.5">
                    <span className="text-[#d4af37] font-semibold uppercase tracking-wider text-[10px]">ScholarHub</span>
                    <span className="text-[#d4af37]/60 text-[9px]">&bull;</span>
                    <span className="text-white/80 font-normal">Smart Learning Assistant</span>
                  </span>
                </motion.div>

                {/* Main Headline Block */}
                <div className="space-y-0.5 select-text">
                  {/* Line 1: "Study Smarter with" */}
                  <motion.h1
                    id="hero-headline-line1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-light tracking-tight leading-[1.12] text-ghost-glow-dark"
                  >
                    Study Smarter with
                  </motion.h1>

                  {/* Line 2: "AI Assistant" */}
                  <motion.div
                    id="hero-headline-line2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap items-baseline gap-x-2 sm:gap-x-3 md:gap-x-3.5 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] leading-[1.12] tracking-tight"
                  >
                    <span className="font-light tracking-tight text-white/95">
                      AI
                    </span>
                    <span 
                      className="font-serif-italic font-normal tracking-normal text-[#67E8F9] hover:brightness-110 transition-all duration-300"
                      style={{ color: '#67E8F9' }}
                    >
                      Assistant
                    </span>
                  </motion.div>
                </div>

                {/* Subheading / Description Block */}
                <motion.div
                  id="hero-subheading-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-2.5 sm:mt-3 md:mt-4 max-w-lg lg:max-w-xl"
                >
                  <p className="font-light leading-relaxed text-white/75 text-crisp-dark tracking-normal text-xs sm:text-sm">
                    Upload your notes, ask questions, generate quizzes, and plan your study schedule &mdash; all powered by cutting-edge AI.
                  </p>
                </motion.div>

                {/* Direct Action Buttons on Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3.5 sm:mt-4 md:mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3 font-sans-display"
                >
                  <button
                    id="hero-explore-features-btn"
                    onClick={() => setActiveNav('features')}
                    className="group flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-white/90 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#d4af37]/40 backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Explore All Features</span>
                  </button>
                </motion.div>

                {/* Secondary Statement */}
                <div className="mt-3.5 sm:mt-4 md:mt-5 max-w-4xl pb-1 sm:pb-2">
                  <motion.div
                    id="hero-statement-block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md border-l-2 border-[#d4af37]/40 pl-3 py-1 bg-white/[0.02] sm:bg-transparent rounded-r-md"
                  >
                    <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#d4af37] mb-0.5 font-semibold text-crisp-dark">Core Thesis</div>
                    <p className="font-light leading-snug text-white/60 text-crisp-dark text-[11px] sm:text-xs">
                      Imagination sparks possibility. AI turns those sparks into reality. Together, they shape the future of creation.
                    </p>
                  </motion.div>
                </div>

              </div>
            </main>
          </motion.div>
        ) : activeNav === 'features' ? (
          <motion.div
            key="features-view"
            variants={featuresPageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            <FeaturesSection 
              onNavigateHome={() => setActiveNav('home')} 
              onNavigateLogin={() => handleNavigateToLogin('signup')}
            />
          </motion.div>
        ) : activeNav === 'dashboard' && currentUser?.isLoggedIn && authService.isAuthenticated() ? (
          <motion.div
            key="dashboard-view"
            variants={dashboardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            <Dashboard 
              user={currentUser}
              onLogout={handleLogout}
              onNavigateHome={() => setActiveNav('home')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="login-view"
            variants={loginPortalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform, opacity, filter' }}
            className="w-full min-h-screen bg-[#0a0a0a] overflow-x-hidden"
          >
            <AuthPage 
              key={authSessionKey}
              onNavigateHome={() => setActiveNav('home')}
              onNavigateFeatures={() => setActiveNav('features')}
              initialMode={authMode}
              initialNotification={authRedirectMessage}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setAuthRedirectMessage(null);
                setActiveNav('dashboard');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

