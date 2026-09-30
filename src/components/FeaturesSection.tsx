import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, BookOpen, Bot, FileText, CheckSquare, Target, 
  BarChart3, Lightbulb, Search, ArrowRight, ArrowLeft, 
  Sparkles, Check, Play, Pause, Grid, Layers, Home, ChevronRight, 
  Bookmark, RotateCcw, X, UploadCloud, CheckCircle2, Zap
} from 'lucide-react';
import { FEATURES } from '../data/featuresData';
import { FeatureMockup } from './FeatureMockup';
import { ThreeDBookShowcase } from './ThreeDBookShowcase';

interface FeaturesSectionProps {
  onNavigateHome: () => void;
  onNavigateLogin?: () => void;
}

interface PipelineStage {
  step: number;
  title: string;
  badge: string;
  color: string;
  dotColor: string;
  activeBorder: string;
  featureIndex: number;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { step: 1, title: 'Document Ingestion', badge: 'UPLOAD', color: '#3b82f6', dotColor: 'bg-blue-500', activeBorder: 'border-blue-500/40 text-blue-400 bg-blue-500/15', featureIndex: 1 },
  { step: 2, title: 'AI Extraction', badge: 'ANALYZE', color: '#a855f7', dotColor: 'bg-purple-500', activeBorder: 'border-purple-500/40 text-purple-400 bg-purple-500/15', featureIndex: 3 },
  { step: 3, title: 'Study Generation', badge: 'GENERATE', color: '#f59e0b', dotColor: 'bg-amber-500', activeBorder: 'border-amber-500/40 text-amber-400 bg-amber-500/15', featureIndex: 4 },
  { step: 4, title: 'Spaced Recall', badge: 'READY', color: '#10b981', dotColor: 'bg-emerald-500', activeBorder: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/15', featureIndex: 7 },
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  onNavigateHome,
  onNavigateLogin 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'slide' | 'book' | 'pipeline' | 'grid'>('slide');
  const [isPlaying, setIsPlaying] = useState(false);

  // Dedicated AI Pipeline Simulator State
  const [simStep, setSimStep] = useState<number>(1);
  const [simPlaying, setSimPlaying] = useState<boolean>(true);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [simChecklist, setSimChecklist] = useState<boolean[]>([true, true, true, true]);
  const [simActiveModal, setSimActiveModal] = useState<'flashcards' | 'quiz' | 'tutor' | 'tracking' | null>(null);

  const categories = ['All', 'Foundation', 'AI Intelligence', 'Assessment & Growth'];

  const filteredFeatures = selectedCategory === 'All'
    ? FEATURES
    : FEATURES.filter(f => f.category === selectedCategory);

  const currentFeature = filteredFeatures[currentIndex] || filteredFeatures[0];

  // Map current feature to the 4 video pipeline stages
  const getCurrentStage = (featIndex: number): PipelineStage => {
    if (featIndex <= 1) return PIPELINE_STAGES[0]; // Profile, Upload
    if (featIndex <= 3 || featIndex === 8) return PIPELINE_STAGES[1]; // Chatbot, Summarizer, RAG
    if (featIndex <= 5) return PIPELINE_STAGES[2]; // Quiz, Planner
    return PIPELINE_STAGES[3]; // Performance, Recommendations
  };

  const currentStage = getCurrentStage(currentIndex);

  // Auto-play slide/book effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % filteredFeatures.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, filteredFeatures.length]);

  // Autonomous Pipeline Simulator timer (for pipeline mode)
  useEffect(() => {
    if (viewMode !== 'pipeline' || !simPlaying) return;

    let timer: NodeJS.Timeout;
    if (simStep === 1) {
      setSimProgress(0);
      const interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            timer = setTimeout(() => setSimStep(2), 600);
            return 100;
          }
          return prev + 10;
        });
      }, 120);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else if (simStep === 2) {
      setSimChecklist([false, false, false, false]);
      const t1 = setTimeout(() => setSimChecklist([true, false, false, false]), 300);
      const t2 = setTimeout(() => setSimChecklist([true, true, false, false]), 600);
      const t3 = setTimeout(() => setSimChecklist([true, true, true, false]), 900);
      const t4 = setTimeout(() => setSimChecklist([true, true, true, true]), 1200);
      timer = setTimeout(() => setSimStep(3), 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(timer);
      };
    } else if (simStep === 3) {
      timer = setTimeout(() => setSimStep(4), 2200);
      return () => clearTimeout(timer);
    } else if (simStep === 4) {
      timer = setTimeout(() => setSimStep(1), 3800);
      return () => clearTimeout(timer);
    }
  }, [viewMode, simStep, simPlaying]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % filteredFeatures.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + filteredFeatures.length) % filteredFeatures.length);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setDirection(0);
  };

  const getIcon = (name: string) => {
    const props = { className: "w-5 h-5 text-[#d4af37]" };
    switch (name) {
      case 'User': return <User {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Bot': return <Bot {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'CheckSquare': return <CheckSquare {...props} />;
      case 'Target': return <Target {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'Lightbulb': return <Lightbulb {...props} />;
      case 'Search': return <Search {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-[#f5f5f5] font-sans overflow-x-hidden selection:bg-[#d4af37]/20 selection:text-[#d4af37]">
      
      {/* Background Ambience / Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#d4af37]/5 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#d4af37]/5 blur-3xl rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-4 flex items-center justify-between gap-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-2 text-xs sm:text-sm font-sans"
        >
          <button 
            onClick={onNavigateHome}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <span className="font-bold tracking-[0.25em] sm:tracking-[0.35em] text-xs sm:text-sm">ScholarHub</span>
          </button>
          <span className="text-white/20">/</span>
          <span className="text-[#d4af37] tracking-[0.2em] sm:tracking-[0.25em]">Features</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center space-x-1.5 sm:space-x-3 shrink-0"
        >
          <nav className="flex items-center bg-white/[0.04] border border-white/10 rounded-full p-0.5 sm:p-1 text-[11px] sm:text-xs text-white/60 backdrop-blur-md">
            <button
              id="nav-home-btn"
              onClick={onNavigateHome}
              className="px-2.5 sm:px-3.5 py-1 rounded-full transition-all cursor-pointer hover:text-white/90"
            >
              Home
            </button>
            <button
              id="nav-features-btn"
              className="px-2.5 sm:px-3.5 py-1 rounded-full bg-white/15 text-[#f5f5f5] font-medium shadow-xs cursor-pointer"
            >
              Features
            </button>
          </nav>

          {onNavigateLogin && (
            <button
              id="features-login-header-btn"
              onClick={onNavigateLogin}
              className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium text-black bg-[#d4af37] hover:bg-[#e6ca65] shadow-xs hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all cursor-pointer shrink-0"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            id="back-home-header-btn"
            onClick={onNavigateHome}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer hover:text-white shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Hero</span>
          </button>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <main 
        className="relative z-10 flex-1 px-4 sm:px-8 md:px-16 lg:px-24 py-6 sm:py-10 max-w-7xl mx-auto w-full"
      >
        
        {/* Top Hero Section Header with Exact Hero Typography & Gold Line Marker */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          
          {/* Editorial Gold Line Section Marker */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-3 flex items-center justify-center space-x-3"
          >
            <span className="inline-block w-8 h-[1px] bg-[#d4af37]" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37] font-semibold">
              ScholarHub &ndash; Core AI Features
            </span>
            <span className="inline-block w-8 h-[1px] bg-[#d4af37]" />
          </motion.div>

          {/* Headline matching Hero style */}
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.12] text-ghost-glow-dark"
          >
            Transform Your Learning with
            <span className="block mt-1 font-serif-italic font-normal text-[#d4af37] gold-gradient-text hover:brightness-110 transition-all duration-300">
              AI-Powered Solutions
            </span>
          </motion.h1>

          {/* Subtitle matching Hero text-crisp-dark & typography */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="mt-3 sm:mt-4 text-sm sm:text-base md:text-[1.05rem] text-white/80 font-light leading-relaxed max-w-2xl mx-auto text-crisp-dark"
          >
            Upload notes, extract key concepts, generate quizzes, and master course materials with spaced repetition.
          </motion.p>

          {/* View Mode & Category Controls */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-2.5"
          >
            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center bg-white/[0.03] border border-white/10 p-1 rounded-full backdrop-blur-md shadow-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-3 sm:px-4 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#d4af37] text-black font-semibold shadow-[0_2px_12px_rgba(212,175,55,0.4)] scale-105'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle: Slides (Default with Video-style enhancements), 3D Book, Live AI Pipeline, Grid */}
            <div className="flex items-center bg-white/[0.03] border border-white/10 p-1 rounded-full backdrop-blur-md shadow-sm">
              <button
                onClick={() => setViewMode('slide')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  viewMode === 'slide' 
                    ? 'bg-[#d4af37] text-black shadow-[0_2px_10px_rgba(212,175,55,0.35)] font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Interactive Slide Deck & Live macOS Preview"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Interactive Slides</span>
              </button>

              <button
                onClick={() => setViewMode('pipeline')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  viewMode === 'pipeline' 
                    ? 'bg-[#d4af37] text-black shadow-[0_2px_10px_rgba(212,175,55,0.35)] font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Autonomous 4-Step Workflow Pipeline"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">⚡ AI Pipeline</span>
              </button>

              <button
                onClick={() => setViewMode('book')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  viewMode === 'book' 
                    ? 'bg-[#d4af37] text-black shadow-[0_2px_10px_rgba(212,175,55,0.35)] font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Interactive 3D Book Mode"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Book</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-[#d4af37] text-black shadow-[0_2px_10px_rgba(212,175,55,0.35)] font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Grid Catalog"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Presentation: Slide Showcase (macOS Window) vs. 3D Book vs. AI Pipeline vs. Grid */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {viewMode === 'slide' ? (
            <div className="w-full max-w-5xl mx-auto space-y-6">

              {/* Video-Style 4-Stage Connected Workflow Stepper Header */}
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 sm:p-4 backdrop-blur-md">
                <div className="flex items-center justify-between max-w-3xl mx-auto px-2 sm:px-6">
                  {PIPELINE_STAGES.map((stg, i) => {
                    const isCurrent = currentStage.step === stg.step;
                    const isCompleted = currentStage.step > stg.step;
                    return (
                      <React.Fragment key={stg.step}>
                        <button
                          onClick={() => {
                            setDirection(stg.featureIndex > currentIndex ? 1 : -1);
                            setCurrentIndex(stg.featureIndex);
                          }}
                          className="flex flex-col items-center group cursor-pointer focus:outline-none"
                        >
                          <div 
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-md ${
                              isCurrent
                                ? 'scale-110 ring-4 ring-white/15 text-white font-mono'
                                : isCompleted
                                ? 'bg-white/15 text-white'
                                : 'bg-white/5 text-white/40 group-hover:text-white/80'
                            }`}
                            style={{
                              backgroundColor: isCurrent ? stg.color : undefined,
                              boxShadow: isCurrent ? `0 0 20px ${stg.color}88` : undefined
                            }}
                          >
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stg.step}
                          </div>
                          <span className={`text-[10px] sm:text-[11px] font-mono mt-1.5 transition-colors ${
                            isCurrent ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/80'
                          }`}>
                            {stg.badge}
                          </span>
                        </button>

                        {i < PIPELINE_STAGES.length - 1 && (
                          <div className="flex-1 mx-2 sm:mx-4 h-[2px] bg-white/10 relative overflow-hidden rounded-full self-center mb-4">
                            <div 
                              className="h-full transition-all duration-500 rounded-full"
                              style={{
                                width: currentStage.step > stg.step ? '100%' : '0%',
                                backgroundColor: stg.color
                              }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            
              {/* Slide Navigation & Play Controls */}
              <div className="flex items-center justify-between px-2 text-xs font-mono text-white/60">
                <div className="flex items-center space-x-3">
                  <span className="text-[#d4af37] font-semibold text-sm">
                    {currentFeature.number}
                  </span>
                  <span className="text-white/20">/</span>
                  <span>{String(filteredFeatures.length).padStart(2, '0')}</span>
                  <span className="text-white/30 hidden sm:inline">&bull;</span>
                  <span className="text-white/70 font-sans hidden sm:inline">{currentFeature.category}</span>
                </div>

                {/* Prev / Next / Auto-play */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-1.5 rounded-full border border-white/10 transition-all cursor-pointer text-xs ${
                      isPlaying ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40' : 'bg-white/5 text-white/50 hover:text-white'
                    }`}
                    title={isPlaying ? "Pause auto-slide" : "Play auto-slide (6s)"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    id="slide-prev-btn"
                    onClick={handlePrev}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    aria-label="Previous Feature Slide"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    id="slide-next-btn"
                    onClick={handleNext}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    aria-label="Next Feature Slide"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video-Inspired macOS Presentation Window Card */}
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentFeature.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="rounded-2xl bg-[#0c0c0e]/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
                >
                  {/* macOS Window Title Bar */}
                  <div className="px-5 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center space-x-3">
                      {/* Window Controls (Red, Yellow, Green) */}
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
                      {/* Brand Logo & Current Feature */}
                      <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        </div>
                        <span className="tracking-wider">ScholarHub</span>
                        <span className="text-white/30 hidden sm:inline">&bull;</span>
                        <span className="text-white/60 font-mono text-[11px] font-normal hidden sm:inline">{currentFeature.title}</span>
                      </div>
                    </div>

                    {/* Stage Status Badge */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold flex items-center space-x-1.5 border ${currentStage.activeBorder}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${currentStage.dotColor} animate-pulse`} />
                        <span>● {currentStage.badge}</span>
                      </span>
                    </div>
                  </div>

                  {/* Window Content: Left Feature Details & Right Tactile Mockup */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      {/* Left details */}
                      <div className="lg:col-span-6 space-y-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                            {getIcon(currentFeature.iconName)}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-mono font-semibold">
                              Feature {currentFeature.number} &bull; {currentFeature.category}
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                              {currentFeature.title}
                            </h2>
                          </div>
                        </div>

                        <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                          {currentFeature.tagline}
                        </p>

                        <div className="space-y-2.5 pt-2">
                          {currentFeature.bullets.map((bullet, idx) => (
                            <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-white/80">
                              <span className="w-4 h-4 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase text-white/40 font-mono">
                              {currentFeature.details.metricsLabel}
                            </div>
                            <div className="text-sm font-semibold text-[#d4af37]">
                              {currentFeature.details.metricsValue}
                            </div>
                          </div>

                          {onNavigateLogin && (
                            <button
                              onClick={onNavigateLogin}
                              className="flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium text-black bg-[#d4af37] hover:bg-[#e6ca65] transition-all shadow-md shadow-[#d4af37]/20 cursor-pointer"
                            >
                              <span>Try This Feature</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right interactive video-style mockup */}
                      <div className="lg:col-span-6">
                        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 p-1.5 shadow-2xl">
                          <FeatureMockup feature={currentFeature} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* macOS Window Bottom Status Bar */}
                  <div className="px-5 sm:px-6 py-2.5 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-white/50 font-mono">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[#d4af37] font-semibold">Step {currentFeature.number}</span>
                      <span>&mdash;</span>
                      <span className="text-white/70 font-sans text-[11px] truncate">{currentFeature.tagline}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-emerald-400 shrink-0 ml-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-sans font-medium">AI Active</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : viewMode === 'pipeline' ? (
            /* Dedicated Autonomous 4-Stage AI Pipeline Simulator (Video Experience) */
            <div className="w-full max-w-4xl mx-auto space-y-6">
              
              {/* Pipeline Controls */}
              <div className="flex items-center justify-between px-2 text-xs font-mono text-white/60">
                <div className="flex items-center space-x-2">
                  <span className="text-[#d4af37] font-semibold">Autonomous Study Pipeline</span>
                  <span>&bull;</span>
                  <span>Live Simulation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSimPlaying(!simPlaying)}
                    className={`px-3 py-1 rounded-full border border-white/10 flex items-center space-x-1.5 text-xs transition-all cursor-pointer ${
                      simPlaying ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40' : 'bg-white/5 text-white/70'
                    }`}
                  >
                    {simPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{simPlaying ? 'Pause Auto' : 'Resume Auto'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSimStep(1);
                      setSimProgress(0);
                    }}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 transition-all cursor-pointer"
                    title="Restart Simulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Window Box */}
              <div className="rounded-2xl bg-[#0d0d10] border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
                
                {/* Title Bar */}
                <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-white tracking-wide">ScholarHub</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                      simStep === 1 ? 'border-blue-500/40 text-blue-400 bg-blue-500/15' :
                      simStep === 2 ? 'border-purple-500/40 text-purple-400 bg-purple-500/15' :
                      simStep === 3 ? 'border-amber-500/40 text-amber-400 bg-amber-500/15' :
                      'border-emerald-500/40 text-emerald-400 bg-emerald-500/15'
                    }`}>
                      ● {PIPELINE_STAGES[simStep - 1].badge}
                    </span>
                  </div>
                </div>

                {/* 4 Connected Milestone Dots */}
                <div className="px-6 pt-6 pb-2">
                  <div className="flex items-center justify-between max-w-xl mx-auto">
                    {PIPELINE_STAGES.map((stg, i) => {
                      const isCur = simStep === stg.step;
                      const isDone = simStep > stg.step;
                      return (
                        <React.Fragment key={stg.step}>
                          <button
                            onClick={() => setSimStep(stg.step)}
                            className="flex flex-col items-center cursor-pointer"
                          >
                            <div 
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                isCur ? 'scale-110 ring-4 ring-white/15 text-white' :
                                isDone ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40'
                              }`}
                              style={{
                                backgroundColor: isCur ? stg.color : undefined,
                                boxShadow: isCur ? `0 0 20px ${stg.color}66` : undefined
                              }}
                            >
                              {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stg.step}
                            </div>
                          </button>

                          {i < PIPELINE_STAGES.length - 1 && (
                            <div className="flex-1 mx-3 h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                              <div 
                                className="h-full transition-all duration-500"
                                style={{
                                  width: simStep > stg.step ? '100%' : '0%',
                                  backgroundColor: stg.color
                                }}
                              />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Step Content */}
                <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {simStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="max-w-lg mx-auto w-full space-y-4"
                      >
                        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white font-mono">Lecture_Notes.pdf</div>
                                <div className="text-xs text-white/50">3.2 MB &bull; PDF Document</div>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              {simProgress}%
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-xs text-white/50 font-mono">
                              <span>Uploading & processing...</span>
                              <span className="text-blue-400">{simProgress}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-150"
                                style={{ width: `${simProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {simStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="max-w-lg mx-auto w-full space-y-4"
                      >
                        <div className="space-y-1 text-center">
                          <div className="text-sm font-bold text-white">AI Analysis</div>
                          <div className="text-xs text-white/50">Scanning content & extracting core syllabus anchors...</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'AI Note Summarizer', checked: simChecklist[0] },
                            { label: 'AI Question & Quiz Generation', checked: simChecklist[1] },
                            { label: 'Personalized Tracking', checked: simChecklist[2] },
                            { label: 'Document-Based Q&A', checked: simChecklist[3] },
                          ].map((item, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-xl border transition-all flex items-center space-x-2.5 ${
                                item.checked 
                                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-200' 
                                  : 'bg-white/[0.02] border-white/5 text-white/30'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                item.checked ? 'bg-purple-500 text-white' : 'border border-white/20'
                              }`}>
                                {item.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-medium">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {simStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="max-w-lg mx-auto w-full space-y-4"
                      >
                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-center space-y-1">
                          <div className="text-sm font-bold text-amber-300">Generating Study Materials</div>
                          <div className="text-xs text-white/60">Summaries, diagnostics, tracking models & grounded Q&A...</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <FileText className="w-4 h-4 text-amber-400" />
                              <span className="text-xs text-white font-medium">AI Note Summarizer</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <Target className="w-4 h-4 text-purple-400" />
                              <span className="text-xs text-white font-medium">AI Quiz Generation</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <BarChart3 className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs text-white font-medium">Personalized Tracking</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                          </div>

                          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-xs text-white font-medium">Document-Based Q&A</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {simStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1 }}
                        className="max-w-md mx-auto w-full text-center space-y-4 relative"
                      >
                        {/* Confetti simulation dots */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <span className="absolute top-2 left-10 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="absolute top-4 right-12 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="absolute bottom-4 left-16 w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                          <span className="absolute bottom-6 right-16 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                        </div>

                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                          <Check className="w-8 h-8 stroke-[3]" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">Ready to Study!</h3>
                          <p className="text-xs text-white/60 mt-1">
                            Materials generated & personalized tracking active
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => setSimActiveModal('flashcards')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 flex items-center space-x-1.5 cursor-pointer text-white"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span>AI Summaries</span>
                          </button>
                          <button
                            onClick={() => setSimActiveModal('quiz')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 flex items-center space-x-1.5 cursor-pointer text-white"
                          >
                            <Target className="w-3.5 h-3.5 text-purple-400" />
                            <span>AI Quizzes</span>
                          </button>
                          <button
                            onClick={() => setSimActiveModal('tracking')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 flex items-center space-x-1.5 cursor-pointer text-white"
                          >
                            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tracking</span>
                          </button>
                          <button
                            onClick={() => setSimActiveModal('tutor')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 flex items-center space-x-1.5 cursor-pointer text-white"
                          >
                            <Bot className="w-3.5 h-3.5 text-blue-400" />
                            <span>Document Q&A</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Footer */}
                <div className="px-6 py-3 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-xs text-white/50 font-mono">
                  <span>
                    Step {simStep} &mdash; {
                      simStep === 1 ? 'Processing document...' :
                      simStep === 2 ? 'Extracting key concepts...' :
                      simStep === 3 ? 'Creating study materials...' :
                      'All materials ready!'
                    }
                  </span>
                  <div className="flex items-center space-x-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-sans font-medium">AI Active</span>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'book' ? (
            <ThreeDBookShowcase
              features={filteredFeatures}
              currentIndex={currentIndex}
              onSelectFeature={(idx) => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          ) : (
            /* Grid View: 9 Features */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredFeatures.map((feat) => (
                <motion.div
                  key={feat.id}
                  whileHover={{ 
                    y: -5, 
                    scale: 1.02,
                    boxShadow: '0 0 25px rgba(212, 175, 55, 0.35), 0 14px 35px rgba(0, 0, 0, 0.6)' 
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-[#d4af37]/80 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle golden ambient glow inside on hover */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] group-hover:scale-110 group-hover:bg-[#d4af37]/25 group-hover:border-[#d4af37] group-hover:shadow-[0_0_12px_rgba(212,175,55,0.4)] transition-all duration-300">
                        {getIcon(feat.iconName)}
                      </div>
                      <span className="font-mono text-xs text-white/40 group-hover:text-[#d4af37] font-semibold transition-colors">
                        {feat.number}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white group-hover:text-[#d4af37] transition-colors duration-200">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-white/60 font-light mt-1 line-clamp-2">
                        {feat.tagline}
                      </p>
                    </div>

                    {/* Bullet list items inside grid card */}
                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      {feat.bullets.map((bullet, bIdx) => (
                        <div 
                          key={bIdx} 
                          className="group/b flex items-center space-x-2 text-xs text-white/80 p-1 -mx-1 rounded-md hover:bg-white/5 hover:translate-x-1 transition-all duration-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0 group-hover/b:scale-125 group-hover/b:shadow-[0_0_6px_rgba(212,175,55,0.8)] transition-all" />
                          <span className="truncate group-hover/b:text-white transition-colors">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">{feat.category}</span>
                    <button
                      onClick={() => {
                        const featureIndex = filteredFeatures.findIndex(f => f.id === feat.id);
                        if (featureIndex !== -1) {
                          setCurrentIndex(featureIndex);
                          setViewMode('slide');
                        }
                      }}
                      className="flex items-center space-x-1 text-[#d4af37] hover:text-[#e6ca65] group-hover:translate-x-0.5 cursor-pointer text-xs font-semibold transition-all"
                    >
                      <span>Open in Slides</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Modal for Pipeline Previews */}
        <AnimatePresence>
          {simActiveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#121214] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm font-semibold text-white">
                    {simActiveModal === 'flashcards' && 'AI Note Summarizer'}
                    {simActiveModal === 'quiz' && 'AI Question & Quiz Generation'}
                    {simActiveModal === 'tracking' && 'Personalized Tracking'}
                    {simActiveModal === 'tutor' && 'Document-Based Q&A'}
                  </span>
                  <button
                    onClick={() => setSimActiveModal(null)}
                    className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-white/80 leading-relaxed">
                  {simActiveModal === 'flashcards' && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="text-[11px] font-mono text-[#d4af37] font-semibold">CHAPTER SUMMARY &bull; KEY ANCHORS</div>
                        <p className="text-xs text-white/90">
                          Extracted from <span className="font-mono text-white underline">Lecture_Notes.pdf</span>: Core mechanisms broken down into 4 high-yield summaries, 18 concept definitions, and automated spaced recall flashcards.
                        </p>
                      </div>
                      <div className="text-[11px] text-white/50 text-center">
                        Active recall flashcard deck ready with automated interval scheduling.
                      </div>
                    </div>
                  )}

                  {simActiveModal === 'quiz' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium space-y-1">
                        <div className="text-[10px] text-purple-400 font-mono">DIAGNOSTIC QUESTION 1 OF 12</div>
                        <div>Which factor most directly dictates retrieval speed in multi-tier memory hierarchies?</div>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="p-2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                          &bull; Cache locality and spatial reference patterns (Correct &mdash; verified in notes)
                        </div>
                        <div className="p-2 rounded bg-white/[0.03] text-white/60 border border-white/5">
                          &bull; Random sequential access timing
                        </div>
                      </div>
                    </div>
                  )}

                  {simActiveModal === 'tracking' && (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/70">Estimated Retention Mastery</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">92%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] text-white/40 font-mono pt-1">
                          <span>Optimal Review: In 2 Days</span>
                          <span>SM-2 Factor: 2.6</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {simActiveModal === 'tutor' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-200">
                        "According to your Lecture Notes (p. 4), what is the relationship between latency and throughput?"
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 text-white/90">
                        Grounded Answer: Throughput measures total work per unit time, while latency is delay per single transaction. Your notes highlight how pipelining improves throughput without reducing per-item latency.
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSimActiveModal(null)}
                    className="w-full py-2 rounded-xl bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e6ca65] transition-all cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Bottom CTA Block */}
        <div className="mt-16 text-center border-t border-white/10 pt-12 pb-8">
          <h3 className="text-xl sm:text-2xl font-light text-white mb-3">
            Ready to experience the future of studying?
          </h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-6">
            Join thousands of students turning course materials into high-yield mastery with ScholarHub.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onNavigateLogin && (
              <button
                onClick={onNavigateLogin}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-medium text-black bg-[#d4af37] hover:bg-[#e6ca65] shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setViewMode('slide');
                setCurrentIndex(2); // Jump to AI Study Chatbot demo
              }}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-medium text-white/90 bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer"
            >
              <span>Test AI Study Chatbot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateHome}
              className="px-6 py-2.5 rounded-full text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/15 transition-all cursor-pointer"
            >
              Back to Main Hero
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

