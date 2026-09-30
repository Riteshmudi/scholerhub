import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, Bot, FileText, CheckSquare, Target, 
  BarChart3, Lightbulb, Search, Check, ArrowRight, 
  FileCheck, Sparkles, Clock, Calendar, AlertCircle, 
  RotateCcw, RefreshCw, UploadCloud, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeatureItem } from '../types';

interface FeatureMockupProps {
  feature: FeatureItem;
}

export const FeatureMockup: React.FC<FeatureMockupProps> = ({ feature }) => {
  // Quiz State
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(1);
  const [quizScore, setQuizScore] = useState<number>(1);
  const [showConfetti, setShowConfetti] = useState<boolean>(true);

  // Chatbot State
  const [chatQuery, setChatQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'user', text: 'How does gradient descent update parameters?' },
    { sender: 'ai', text: 'Gradient descent computes loss gradient with respect to weights: θ = θ - α∇J(θ).' }
  ]);

  // Upload Simulation State
  const [uploadPercent, setUploadPercent] = useState(100);
  const [isUploading, setIsUploading] = useState(false);

  // AI Analysis / Scanner State
  const [analyzedItems, setAnalyzedItems] = useState([true, true, true, true]);
  const [isScanning, setIsScanning] = useState(false);

  // Flashcards state
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardRating, setFlashcardRating] = useState<'easy' | 'good' | 'hard' | null>(null);

  const triggerUploadSim = () => {
    setIsUploading(true);
    setUploadPercent(0);
    const interval = setInterval(() => {
      setUploadPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const triggerScanSim = () => {
    setIsScanning(true);
    setAnalyzedItems([false, false, false, false]);
    setTimeout(() => setAnalyzedItems([true, false, false, false]), 300);
    setTimeout(() => setAnalyzedItems([true, true, false, false]), 600);
    setTimeout(() => setAnalyzedItems([true, true, true, false]), 900);
    setTimeout(() => {
      setAnalyzedItems([true, true, true, true]);
      setIsScanning(false);
    }, 1200);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const userText = chatQuery;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatQuery('');
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: `Verified from your uploaded syllabus: "${userText}" is covered on Lecture 4, Slide 18 with 99.4% confidence.` }
      ]);
      setIsTyping(false);
    }, 600);
  };

  switch (feature.mockupType) {
    case 'profile':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Alex Chen</div>
                <div className="text-xs text-white/50">Computer Science &bull; 3rd Year</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Session</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-[#d4af37] font-medium">Study Preferences</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <span className="text-white/70">Pacing</span>
                <span className="text-white font-medium">Spaced Intervals</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <span className="text-white/70">Format</span>
                <span className="text-white font-medium">Visual + MCQs</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Linear Algebra', 'Distributed Systems', 'Machine Learning'].map((sub, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-white/5 border border-white/10 text-white/80">
                {sub}
              </span>
            ))}
          </div>
        </div>
      );

    case 'upload':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3.5 shadow-xl">
          {/* Top simulated status */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">Document Ingestion & OCR</span>
            </div>
            <button
              onClick={triggerUploadSim}
              disabled={isUploading}
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isUploading ? 'animate-spin' : ''}`} />
              <span>{isUploading ? 'Uploading...' : 'Re-run Upload'}</span>
            </button>
          </div>

          {/* Document Card with Video-style Progress */}
          <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white truncate font-mono">Lecture_Notes.pdf</div>
                  <div className="text-[10px] text-white/50">3.2 MB &bull; PDF Document</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                uploadPercent === 100 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              }`}>
                {uploadPercent === 100 ? 'Complete' : `${uploadPercent}%`}
              </span>
            </div>

            {/* Video-style Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
                <span className="flex items-center space-x-1">
                  {uploadPercent < 100 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />}
                  <span>{uploadPercent === 100 ? 'OCR extraction finished' : 'Uploading & processing...'}</span>
                </span>
                <span className="text-blue-400 font-semibold">{uploadPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  animate={{ width: `${uploadPercent}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Ingested tags */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-white/80">
              <span>Text Layers</span>
              <span className="text-emerald-400 font-mono">34 Pages</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-white/80">
              <span>Diagram OCR</span>
              <span className="text-emerald-400 font-mono">18 Figures</span>
            </div>
          </div>
        </div>
      );

    case 'chatbot':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md flex flex-col h-full max-h-[320px] justify-between space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-white">AI Study Companion</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online &bull; Context Loaded</span>
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 text-xs max-h-[160px]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg text-xs ${
                  msg.sender === 'user'
                    ? 'ml-auto max-w-[85%] bg-[#d4af37]/15 border border-[#d4af37]/30 text-white'
                    : 'mr-auto max-w-[90%] bg-white/[0.04] border border-white/10 text-white/90 font-light'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="mr-auto text-[10px] text-white/50 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1">
            {['Explain Backprop', 'Generate 3 Flashcards', 'Summarize Lecture 5'].map((p, i) => (
              <button
                key={i}
                onClick={() => setChatQuery(p)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white cursor-pointer transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-1">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="Ask a question about your notes..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#d4af37] text-black text-xs font-medium hover:bg-[#e6ca65] transition-all cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      );

    case 'summarizer':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3.5 shadow-xl">
          {/* Top Video-style AI Analysis Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-white">AI Analysis & Extraction</span>
                <span className="text-[10px] text-white/40 block">Scanning content & extracting key concepts</span>
              </div>
            </div>
            <button
              onClick={triggerScanSim}
              disabled={isScanning}
              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center space-x-1 font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Re-Scan'}</span>
            </button>
          </div>

          {/* Video-style 4 extraction checkmarks */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Key definitions', checked: analyzedItems[0] },
              { label: 'Handwriting detected', checked: analyzedItems[1] },
              { label: 'Diagrams & figures', checked: analyzedItems[2] },
              { label: 'Formulas & equations', checked: analyzedItems[3] },
            ].map((item, i) => (
              <motion.div
                key={i}
                animate={{ scale: item.checked ? 1 : 0.98, opacity: item.checked ? 1 : 0.4 }}
                className={`p-2.5 rounded-lg border transition-all flex items-center space-x-2 ${
                  item.checked
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                    : 'bg-white/[0.02] border-white/5 text-white/40'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                  item.checked ? 'bg-purple-500 text-white' : 'border border-white/20'
                }`}>
                  {item.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-medium truncate">{item.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Synthesized Executive Summary Card */}
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#d4af37] font-medium">
              <span>Principle of Locality</span>
              <span className="text-[10px] text-white/40 font-mono">Lecture 04</span>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed font-light">
              Temporal locality reuses data accessed recently. Spatial locality accesses contiguous memory addresses.
            </p>
          </div>
        </div>
      );

    case 'quiz':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3 shadow-xl relative overflow-hidden">
          {/* Confetti celebration dots if right answer */}
          {selectedQuizAnswer === 1 && showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <span className="absolute top-2 left-6 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="absolute top-4 right-10 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="absolute bottom-6 left-12 w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
            </div>
          )}

          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-semibold text-white">Generated Diagnostic Quiz</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Q 3 of 10 &bull; Score: {quizScore}
            </span>
          </div>

          <div className="text-xs text-white font-medium">
            Which algorithm guarantees the shortest path in a graph with non-negative edge weights?
          </div>

          <div className="space-y-1.5 text-xs">
            {[
              { id: 0, label: "A", text: "Bellman-Ford Algorithm" },
              { id: 1, label: "B", text: "Dijkstra's Algorithm (Correct)" },
              { id: 2, label: "C", text: "Depth-First Search (DFS)" },
              { id: 3, label: "D", text: "Prim's Minimum Spanning Tree" }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedQuizAnswer(option.id);
                  if (option.id === 1) {
                    setQuizScore(prev => prev + 1);
                    setShowConfetti(true);
                  }
                }}
                className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedQuizAnswer === option.id
                    ? option.id === 1
                      ? 'bg-emerald-500/20 border border-emerald-400/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-red-500/20 border border-red-400/60 text-white'
                    : 'bg-white/[0.03] border border-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold ${
                    selectedQuizAnswer === option.id && option.id === 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}>
                    {option.label}
                  </span>
                  <span>{option.text}</span>
                </div>
                {selectedQuizAnswer === option.id && option.id === 1 && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>+100 XP</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {selectedQuizAnswer === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300"
            >
              <strong>Explanation:</strong> Dijkstra uses a greedy priority queue to resolve minimal paths in O((V+E) log V).
            </motion.div>
          )}
        </div>
      );

    case 'planner':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-semibold text-white">Target Exam: Midterm 2</span>
            </div>
            <span className="text-[10px] text-[#d4af37] font-mono bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
              12 Days Remaining
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-white">Today &bull; 4:00 PM - 5:15 PM</div>
                <div className="text-[10px] text-white/70">Dynamic Programming: Memoization vs Tabulation</div>
              </div>
              <span className="text-[10px] bg-[#d4af37] text-black px-2 py-0.5 rounded font-medium">Priority #1</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-white/90">Tomorrow &bull; 10:00 AM</div>
                <div className="text-[10px] text-white/50">Graph Traversals & Topological Sort Quiz</div>
              </div>
              <span className="text-[10px] text-white/40">Scheduled</span>
            </div>
          </div>
        </div>
      );

    case 'performance':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-semibold text-white">Subject Mastery Telemetry</span>
            </div>
            <span className="text-xs text-white font-mono font-medium">Avg: 88.4%</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { subject: "Algorithms & Complexity", score: 94, status: "Strong", color: "bg-emerald-400" },
              { subject: "Computer Architecture", score: 86, status: "Good", color: "bg-[#d4af37]" },
              { subject: "Operating Systems (Paging)", score: 68, status: "Needs Review", color: "bg-amber-400" }
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/80">{item.subject}</span>
                  <span className="font-mono text-white/90 font-medium">{item.score}% ({item.status})</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`} 
                    style={{ width: `${item.score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'recommendations':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3 shadow-xl relative overflow-hidden">
          {/* Video-style Ready to Study celebration banner */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">Ready to Study!</div>
              <div className="text-[10px] text-emerald-400 font-mono">SM-2 Spaced Repetition Schedule Created</div>
            </div>

            {/* Video-style 3 study action pills */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 text-white/90 border border-white/15 flex items-center space-x-1">
                <BookOpen className="w-3 h-3 text-[#d4af37]" />
                <span>36 Flashcards</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 text-white/90 border border-white/15 flex items-center space-x-1">
                <Target className="w-3 h-3 text-purple-400" />
                <span>12 Quizzes</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 text-white/90 border border-white/15 flex items-center space-x-1">
                <Bot className="w-3 h-3 text-emerald-400" />
                <span>AI Tutor</span>
              </span>
            </div>
          </div>

          {/* Interactive SM-2 Flashcard Simulator */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-3 rounded-lg bg-white/[0.04] border border-white/10 cursor-pointer hover:border-[#d4af37]/40 transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between text-[10px] text-white/50 font-mono">
              <span>Flashcard 1 of 36 &bull; Click to flip</span>
              <span className="text-[#d4af37]">{isFlipped ? 'Answer' : 'Question'}</span>
            </div>
            <div className="text-xs text-white font-medium py-1">
              {isFlipped 
                ? "Dijkstra: O((V+E) log V) with min-priority queue." 
                : "What is the time complexity of Dijkstra with a binary heap?"}
            </div>
          </div>

          {/* Rating pills */}
          <div className="flex justify-between gap-1.5 pt-0.5">
            <button
              onClick={() => setFlashcardRating('hard')}
              className={`flex-1 py-1 rounded text-[10px] font-mono cursor-pointer transition-all ${
                flashcardRating === 'hard' ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              Again (1d)
            </button>
            <button
              onClick={() => setFlashcardRating('good')}
              className={`flex-1 py-1 rounded text-[10px] font-mono cursor-pointer transition-all ${
                flashcardRating === 'good' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              Good (3d)
            </button>
            <button
              onClick={() => setFlashcardRating('easy')}
              className={`flex-1 py-1 rounded text-[10px] font-mono cursor-pointer transition-all ${
                flashcardRating === 'easy' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              Easy (7d)
            </button>
          </div>
        </div>
      );

    case 'rag':
      return (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-md space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-semibold text-white">RAG Grounded Citation</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              99.4% Factual Match
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-white/[0.03] border border-white/5 text-[11px]">
              <span className="text-white/50">Prompt: </span>
              <span className="text-white font-medium">"What was the conclusion on deadlock recovery in Lecture 8?"</span>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/25 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                <span>[Source Citation] Lecture_08.pdf (Slide 22)</span>
                <span>Exact Match</span>
              </div>
              <p className="text-[11px] text-white/90 leading-relaxed font-light">
                "Resource preemption with checkpoint rollback is preferred over process termination when state recovery overhead is minimal."
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

