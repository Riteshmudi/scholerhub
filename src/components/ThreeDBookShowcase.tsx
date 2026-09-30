import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ArrowRight, Bookmark, Sparkles, Check, 
  BookOpen, ChevronRight, User, Bot, 
  FileText, CheckSquare, Target, BarChart3, Lightbulb, Search,
  Compass, Award, RefreshCw
} from 'lucide-react';
import { FeatureItem } from '../types';
import { FeatureMockup } from './FeatureMockup';

interface ThreeDBookShowcaseProps {
  features: FeatureItem[];
  currentIndex: number;
  onSelectFeature: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ThreeDBookShowcase: React.FC<ThreeDBookShowcaseProps> = ({
  features,
  currentIndex,
  onSelectFeature,
  onNext,
  onPrev
}) => {
  // Page flipping animation state
  const [flipState, setFlipState] = useState<{
    isFlipping: boolean;
    direction: 'forward' | 'backward';
    fromIndex: number;
    toIndex: number;
  }>({
    isFlipping: false,
    direction: 'forward',
    fromIndex: currentIndex,
    toIndex: currentIndex
  });

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'syllabus' | 'specs'>('syllabus');

  const currentFeature = features[currentIndex] || features[0];
  const nextIndex = (currentIndex + 1) % features.length;
  const prevIndex = (currentIndex - 1 + features.length) % features.length;

  const nextFeature = features[nextIndex];
  const prevFeature = features[prevIndex];

  // Execute genuine 3D paper leaf rotation
  const triggerFlipForward = () => {
    if (flipState.isFlipping) return;
    const target = (currentIndex + 1) % features.length;
    setFlipState({
      isFlipping: true,
      direction: 'forward',
      fromIndex: currentIndex,
      toIndex: target
    });

    setTimeout(() => {
      onNext();
      setFlipState(prev => ({ ...prev, isFlipping: false }));
    }, 650);
  };

  const triggerFlipBackward = () => {
    if (flipState.isFlipping) return;
    const target = (currentIndex - 1 + features.length) % features.length;
    setFlipState({
      isFlipping: true,
      direction: 'backward',
      fromIndex: currentIndex,
      toIndex: target
    });

    setTimeout(() => {
      onPrev();
      setFlipState(prev => ({ ...prev, isFlipping: false }));
    }, 650);
  };

  const jumpToFeature = (targetIndex: number) => {
    if (flipState.isFlipping || targetIndex === currentIndex) return;
    const direction = targetIndex > currentIndex ? 'forward' : 'backward';
    setFlipState({
      isFlipping: true,
      direction,
      fromIndex: currentIndex,
      toIndex: targetIndex
    });

    setTimeout(() => {
      onSelectFeature(targetIndex);
      setFlipState(prev => ({ ...prev, isFlipping: false }));
    }, 650);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const getTabIcon = (name: string) => {
    const props = { className: "w-3 h-3" };
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

  // Helper renderers for left and right pages
  const renderLeftPageContent = (feat: FeatureItem, pageNum: number) => (
    <div className="h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[#16161b] via-[#121215] to-[#0c0c0f] select-none text-left">
      {/* Top Folio Header */}
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#d4af37] font-semibold">
            <span>CHAPTER {feat.number}</span>
            <span className="text-white/20">&bull;</span>
            <span className="text-white/50 truncate max-w-[120px] sm:max-w-none">{feat.category}</span>
          </div>
          <span className="text-[10px] font-mono text-white/35">FOLIO P.{pageNum}</span>
        </div>

        {/* Chapter Title & Tagline */}
        <div className="mb-3 sm:mb-4">
          <div className="text-xs text-[#d4af37] font-serif-italic mb-1">
            {feat.subtitle}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-white tracking-tight leading-snug">
            {feat.title}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed mb-3 sm:mb-4">
          {feat.tagline}
        </p>

        {/* Syllabus Bullets with 3D tactile lift & luminous glow hover */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium flex items-center justify-between mb-1">
            <span>Core Syllabus Capabilities</span>
            <span className="text-[9px] text-[#d4af37]/80 font-mono">3 VERIFIED SPECS</span>
          </div>
          {feat.bullets.map((bullet, idx) => (
            <div
              key={idx}
              className="group/item flex items-start space-x-2.5 text-xs sm:text-sm text-white/90 p-1.5 sm:p-2 -mx-1 sm:-mx-2 rounded-lg border border-transparent hover:border-[#d4af37]/40 hover:bg-white/[0.04] hover:shadow-[0_4px_16px_rgba(212,175,55,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] hover:translate-x-1 hover:-translate-y-0.5 transition-all duration-250 cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-[#d4af37]/35 group-hover/item:border-[#d4af37] group-hover/item:scale-110 group-hover/item:shadow-[0_0_8px_rgba(212,175,55,0.5)] transition-all duration-200">
                <Check className="w-2.5 h-2.5 text-[#d4af37]" />
              </div>
              <span className="font-light leading-snug group-hover/item:text-white transition-colors duration-200">{bullet}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Page Telemetry & Page Turn Trigger */}
      <div className="pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between text-xs mt-3 sm:mt-4">
        <div className="flex items-center space-x-2 text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          <span className="truncate max-w-[120px] sm:max-w-none text-[11px]">{feat.details.primaryHighlight}</span>
        </div>
        <div className="font-mono text-[#d4af37] text-[10px] sm:text-[11px] shrink-0 ml-2">
          {feat.details.metricsLabel}: {feat.details.metricsValue}
        </div>
      </div>
    </div>
  );

  const renderRightPageContent = (feat: FeatureItem, pageNum: number) => (
    <div className="h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-gradient-to-bl from-[#16161b] via-[#121215] to-[#0c0c0f] select-none text-left">
      <div>
        {/* Right Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-white/60">
            <Sparkles className="w-3 h-3 text-[#d4af37]" />
            <span>Interactive AI Console</span>
          </div>
          <span className="text-[10px] font-mono text-white/35">FOLIO P.{pageNum}</span>
        </div>

        {/* Live Mockup */}
        <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[290px]">
          <FeatureMockup feature={feat} />
        </div>
      </div>

      {/* Right Bottom Footer */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-3">
        <div className="text-[10px] sm:text-[11px] text-white/50 font-light truncate max-w-[180px] sm:max-w-none">
          Simulator: <span className="text-white font-medium">{feat.title}</span>
        </div>

        <button
          onClick={triggerFlipForward}
          disabled={flipState.isFlipping}
          className="group flex items-center space-x-1 text-xs text-[#d4af37] font-medium hover:text-[#e6ca65] transition-colors cursor-pointer shrink-0"
        >
          <span>Turn Page</span>
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );

  // Back of paper leaf representation during 3D rotation
  const renderBackOfPage = (feat: FeatureItem) => (
    <div className="h-full w-full p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#1a1a20] via-[#141418] to-[#0f0f12] border-r border-white/10 text-left select-none">
      <div>
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
          <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-mono">
            TOME COMPENDIUM ARCHIVE
          </span>
          <span className="text-[10px] font-mono text-white/40">FOLIO BACK</span>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-[#d4af37] text-xs font-serif-italic">
            <Award className="w-3.5 h-3.5" />
            <span>Chapter Summary & Exam Diagnostics</span>
          </div>
          <p className="text-xs text-white/70 font-light leading-relaxed">
            {feat.tagline}
          </p>
          <div className="pt-2 flex flex-wrap gap-1.5">
            {feat.details.sampleData.slice(0, 3).map((item, i) => (
              <span key={i} className="px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[10px] text-white/80 font-mono">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-white/40">Architectural Pipeline</div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-white/80 space-y-1">
            <div className="text-[#d4af37]">&gt; Model: Gemini 2.5 Flash + Scholar RAG</div>
            <div>&gt; Latency: &lt; 280ms Vector Retrieval</div>
            <div>&gt; Verification: Real-time Theorem Proof</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-mono text-white/30 flex items-center justify-between border-t border-white/5 pt-2">
        <span>SCHOLARHUB ACADEMIC SUITE</span>
        <span className="text-[#d4af37]">TURN TO REVEAL</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto my-4 select-none">
      
      {/* Top 3D Book Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 sm:mb-6 px-1 sm:px-3">
        
        {/* Folio info */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-mono">
            <Bookmark className="w-3.5 h-3.5 shrink-0" />
            <span><span className="hidden xs:inline">FOLIO: </span>CH. {currentFeature.number} / 09</span>
          </div>
          <span className="text-white/40 text-xs hidden sm:inline">&bull;</span>
          <span className="text-white/60 text-xs hidden sm:inline truncate max-w-[140px]">{currentFeature.category}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <button
            id="book-paper-prev-btn"
            onClick={triggerFlipBackward}
            disabled={flipState.isFlipping}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            title="Rotate paper backward (Previous Chapter)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flip Left</span>
          </button>

          <div className="px-2.5 sm:px-3.5 py-1 text-xs font-mono text-[#d4af37] bg-white/[0.04] border border-[#d4af37]/30 rounded-full font-semibold">
            {currentIndex + 1} / {features.length}
          </div>

          <button
            id="book-paper-next-btn"
            onClick={triggerFlipForward}
            disabled={flipState.isFlipping}
            className="flex items-center space-x-1 sm:space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:brightness-110 text-black text-xs font-semibold transition-all shadow-lg shadow-[#d4af37]/25 cursor-pointer disabled:opacity-50 active:scale-95"
            title="Rotate paper forward (Next Chapter)"
          >
            <span className="hidden sm:inline">Flip Right</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Book Stage Container */}
      <div 
        className="perspective-book relative py-2 sm:py-4 px-0.5 sm:px-4 overflow-hidden lg:overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* Physical 3D Leather Cover Book Frame with Tilt */}
        <motion.div
          animate={{
            rotateX: tilt.x,
            rotateY: tilt.y,
            transition: { type: "spring", stiffness: 200, damping: 25 }
          }}
          className="preserve-3d relative rounded-xl sm:rounded-[22px] bg-[#111114] border-2 border-white/10 p-1.5 sm:p-4 md:p-6 book-shadow transition-shadow duration-500 hover:border-[#d4af37]/30"
        >
          {/* Top Silk Ribbon Marker */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
            <div className="w-5 sm:w-6 h-7 sm:h-9 bg-gradient-to-b from-[#d4af37] via-[#b89124] to-[#7a5e12] rounded-t-sm shadow-md" />
            <div className="w-0 h-0 border-l-[10px] sm:border-l-[12px] border-l-transparent border-r-[10px] sm:border-r-[12px] border-r-transparent border-t-[7px] sm:border-t-[8px] border-t-[#7a5e12]" />
          </div>

          {/* Golden Corner Edge Accents */}
          <div className="absolute top-2 left-2 w-4 sm:w-5 h-4 sm:h-5 border-t-2 border-l-2 border-[#d4af37]/70 pointer-events-none rounded-tl-sm" />
          <div className="absolute top-2 right-2 w-4 sm:w-5 h-4 sm:h-5 border-t-2 border-r-2 border-[#d4af37]/70 pointer-events-none rounded-tr-sm" />
          <div className="absolute bottom-2 left-2 w-4 sm:w-5 h-4 sm:h-5 border-b-2 border-l-2 border-[#d4af37]/70 pointer-events-none rounded-bl-sm" />
          <div className="absolute bottom-2 right-2 w-4 sm:w-5 h-4 sm:h-5 border-b-2 border-r-2 border-[#d4af37]/70 pointer-events-none rounded-br-sm" />

          {/* Layered Paper Edge Stacks for Depth */}
          <div className="absolute -bottom-2 left-4 sm:left-6 right-4 sm:right-6 h-2 bg-[#1a1a1e] border-x border-b border-white/15 rounded-b-lg shadow-lg opacity-90 page-edge-left" />
          <div className="absolute -bottom-4 left-8 sm:left-10 right-8 sm:right-10 h-2 bg-[#131316] border-x border-b border-white/10 rounded-b-lg opacity-70" />
          <div className="absolute -bottom-6 left-12 sm:left-14 right-12 sm:right-14 h-2 bg-[#0d0d0f] border-x border-b border-white/5 rounded-b-lg opacity-50" />

          {/* Left Page Edge Rim */}
          <div className="absolute top-4 bottom-4 -left-2 w-2 rounded-l-md bg-gradient-to-r from-[#1b1b20] to-[#26262e] border-l border-y border-white/10 hidden md:block" />
          
          {/* Right Page Edge Rim */}
          <div className="absolute top-4 bottom-4 -right-2 w-2 rounded-r-md bg-gradient-to-l from-[#1b1b20] to-[#26262e] border-r border-y border-white/10 hidden md:block" />

          {/* 
            ====================================================================
            DUAL-PAGE SPREAD & 3D ROTATING PAPER LEAF ENGINE
            ====================================================================
          */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 rounded-xl overflow-hidden bg-[#0e0e11] border border-white/5 min-h-[460px] preserve-3d">
            
            {/* 1. BASE LAYER LEFT (Shows destination or current left page) */}
            <div className="relative border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
              {renderLeftPageContent(
                flipState.isFlipping && flipState.direction === 'forward'
                  ? features[flipState.toIndex]
                  : currentFeature,
                (flipState.isFlipping && flipState.direction === 'forward' ? flipState.toIndex : currentIndex) * 2 + 1
              )}
              {/* Spine shadow on left base */}
              <div className="absolute top-0 right-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-black/80 via-black/30 to-transparent hidden lg:block z-10" />
            </div>

            {/* 2. BASE LAYER RIGHT (Shows incoming right page during flip forward, or current right) */}
            <div className="relative overflow-hidden">
              {renderRightPageContent(
                flipState.isFlipping && flipState.direction === 'forward'
                  ? features[flipState.toIndex]
                  : flipState.isFlipping && flipState.direction === 'backward'
                  ? features[flipState.toIndex]
                  : currentFeature,
                (flipState.isFlipping ? flipState.toIndex : currentIndex) * 2 + 2
              )}
              {/* Spine shadow on right base */}
              <div className="absolute top-0 left-0 bottom-0 w-10 pointer-events-none bg-gradient-to-r from-black/80 via-black/30 to-transparent hidden lg:block z-10" />
            </div>

            {/* 3. CENTER SPINE CREASE & BINDING */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 z-30 pointer-events-none spine-groove shadow-[0_0_15px_rgba(0,0,0,0.9)]" />

            {/* 
              4. THE 3D ROTATING PAPER SHEET (FORWARD FLIP: Right Page Pivots to Left)
            */}
            {flipState.isFlipping && flipState.direction === 'forward' && (
              <motion.div
                key={`flip-forward-${flipState.fromIndex}`}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -180 }}
                transition={{ duration: 0.65, ease: [0.4, 0.0, 0.2, 1] }}
                className="hidden lg:block absolute top-0 right-0 bottom-0 w-1/2 origin-left-spine preserve-3d z-35 pointer-events-none"
              >
                {/* FRONT FACE of the turning leaf (Current right page swinging away) */}
                <div className="absolute inset-0 backface-hidden overflow-hidden rounded-r-xl border border-white/10 shadow-2xl">
                  {renderRightPageContent(features[flipState.fromIndex], flipState.fromIndex * 2 + 2)}
                  {/* Dynamic Darkening Gradient as paper stands up */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.7, 0.9] }}
                    transition={{ duration: 0.65 }}
                    className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/80 pointer-events-none" 
                  />
                </div>

                {/* BACK FACE of the turning leaf (Turns over onto the left page stack at -180deg) */}
                <div 
                  className="absolute inset-0 backface-hidden overflow-hidden rounded-l-xl border border-white/10 shadow-2xl"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  {renderBackOfPage(features[flipState.fromIndex])}
                  {/* Highlight sheen as back of paper lands */}
                  <motion.div 
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: [0.8, 0.3, 0] }}
                    transition={{ duration: 0.65 }}
                    className="absolute inset-0 bg-gradient-to-l from-white/20 via-transparent to-black/60 pointer-events-none" 
                  />
                </div>
              </motion.div>
            )}

            {/* 
              5. THE 3D ROTATING PAPER SHEET (BACKWARD FLIP: Left Page Pivots to Right)
            */}
            {flipState.isFlipping && flipState.direction === 'backward' && (
              <motion.div
                key={`flip-backward-${flipState.fromIndex}`}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                transition={{ duration: 0.65, ease: [0.4, 0.0, 0.2, 1] }}
                className="hidden lg:block absolute top-0 left-0 bottom-0 w-1/2 origin-right-spine preserve-3d z-35 pointer-events-none"
              >
                {/* FRONT FACE of the turning left leaf */}
                <div className="absolute inset-0 backface-hidden overflow-hidden rounded-l-xl border border-white/10 shadow-2xl">
                  {renderLeftPageContent(features[flipState.fromIndex], flipState.fromIndex * 2 + 1)}
                  {/* Dynamic Darkening Gradient */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.7, 0.9] }}
                    transition={{ duration: 0.65 }}
                    className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/80 pointer-events-none" 
                  />
                </div>

                {/* BACK FACE of the turning left leaf (Turns over to right at +180deg) */}
                <div 
                  className="absolute inset-0 backface-hidden overflow-hidden rounded-r-xl border border-white/10 shadow-2xl"
                  style={{ transform: 'rotateY(-180deg)' }}
                >
                  {renderBackOfPage(features[flipState.toIndex])}
                  <motion.div 
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: [0.8, 0.3, 0] }}
                    transition={{ duration: 0.65 }}
                    className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/60 pointer-events-none" 
                  />
                </div>
              </motion.div>
            )}

          </div>

          {/* BOOKMARK THUMB INDEX TABS (Right edge for jumping to any chapter) */}
          <div className="hidden xl:flex absolute -right-10 top-10 bottom-10 flex-col justify-between py-2 z-30">
            {features.map((feat, idx) => (
              <button
                key={feat.id}
                onClick={() => jumpToFeature(idx)}
                disabled={flipState.isFlipping}
                className={`group flex items-center pl-2.5 pr-3.5 py-1.5 rounded-r-md transition-all duration-200 cursor-pointer text-[10px] font-mono border-y border-r shadow-md disabled:opacity-50 ${
                  currentIndex === idx
                    ? 'bg-[#d4af37] text-black border-[#e6ca65] translate-x-2 font-bold shadow-[0_4px_16px_rgba(212,175,55,0.4)]'
                    : 'bg-[#18181c] text-white/60 border-white/10 hover:text-white hover:bg-[#24242c] hover:border-[#d4af37]/40 hover:translate-x-2 hover:shadow-[0_4px_14px_rgba(212,175,55,0.25)]'
                }`}
                title={`Rotate to Chapter ${feat.number}: ${feat.title}`}
              >
                <span className="mr-1.5 transition-transform group-hover:scale-110">{getTabIcon(feat.iconName)}</span>
                <span>{feat.number}</span>
              </button>
            ))}
          </div>

        </motion.div>
      </div>

      {/* Chapter Thumbnails Strip Below the Book */}
      <div className="mt-7 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max px-2">
          {features.map((feat, idx) => (
            <button
              key={feat.id}
              onClick={() => jumpToFeature(idx)}
              disabled={flipState.isFlipping}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs transition-all duration-250 cursor-pointer disabled:opacity-50 ${
                currentIndex === idx
                  ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white font-medium shadow-[0_4px_20px_rgba(212,175,55,0.3)] ring-1 ring-[#d4af37]/50 -translate-y-1'
                  : 'bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.07] hover:border-[#d4af37]/40 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(212,175,55,0.18)]'
              }`}
            >
              <span className={`font-mono text-[10px] ${currentIndex === idx ? 'text-[#d4af37] font-bold' : 'text-white/40'}`}>
                {feat.number}
              </span>
              <span className="truncate max-w-[120px] text-[11px]">{feat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Helper Hint */}
      <div className="mt-2 text-center text-xs text-white/40 font-light flex items-center justify-center space-x-2">
        <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>Click <strong>Flip Right / Flip Left</strong> or any chapter tab to watch the 3D book paper rotate across the spine</span>
      </div>

    </div>
  );
};
