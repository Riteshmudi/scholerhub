import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Bot, 
  BrainCircuit, 
  CalendarDays, 
  TrendingUp, 
  UploadCloud, 
  BookOpen, 
  MessageSquare, 
  Puzzle, 
  Layers, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun, 
  Bell, 
  Search, 
  Filter, 
  ChevronDown, 
  Sparkles, 
  MoreVertical, 
  Paperclip, 
  Mic, 
  Send, 
  Clock, 
  CheckCheck, 
  ExternalLink, 
  X, 
  Menu,
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  HelpCircle,
  FileCheck,
  RotateCcw,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardDocument, ChatMessage, UserSession } from '../types';
import { protectRoute } from '../services/auth';
import { documentsApi, chatApi, quizApi, plannerApi, progressApi, notesApi, recommendationsApi, ApiError } from '../services/api';

interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
  onNavigateHome?: () => void;
}

const INITIAL_DOCS: DashboardDocument[] = [];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    text: "Hi! I'm your ScholarHub AI Tutor. Ask me anything about your uploaded study materials, or upload a document to get started.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onNavigateHome }) => {
  const [activeNav, setActiveNav] = useState('dashboard');

  // Enforce route protection immediately upon mounting
  React.useEffect(() => {
    if (!protectRoute()) {
      onLogout();
    }
  }, [onLogout]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<DashboardDocument[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<DashboardDocument | null>(null);

  // Notifications & User popovers
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toolModal, setToolModal] = useState<{ title: string; description: string; content: string } | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Dynamic time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isAiTyping) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsAiTyping(true);

    try {
      const response = await chatApi.send(query, conversationId || undefined);
      setConversationId(response.conversationId);

      const botMsg: ChatMessage = {
        id: response.messageId,
        sender: 'bot',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citation: response.citations?.[0]
          ? { docName: response.citations[0].docName, page: response.citations[0].page }
          : undefined,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = err instanceof ApiError
        ? err.message
        : 'Failed to get AI response. Please try again.';
      setChatError(errorMsg);
      const botMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'bot',
        text: `Error: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsAiTyping(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (!['pdf', 'docx', 'txt'].includes(fileExt)) {
      setUploadStatus(`Unsupported file type: .${fileExt}. Supported: PDF, DOCX, TXT.`);
      setTimeout(() => setUploadStatus(null), 4000);
      e.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadStatus('File is too large. Maximum size is 20 MB.');
      setTimeout(() => setUploadStatus(null), 4000);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Uploading ${file.name}...`);

    try {
      const result = await documentsApi.upload(file);
      
      // Add the doc to the list with processing status
      const newDoc: DashboardDocument = {
        id: result.id,
        name: file.name,
        pages: 0,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: 'Just now',
        type: fileExt === 'pdf' ? 'pdf' : fileExt === 'docx' ? 'docx' : 'txt',
        summary: '',
        status: 'processing',
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploadStatus(`${file.name} uploaded. Processing...`);

      // Poll for processing completion
      pollDocumentStatus(result.id, file.name);

      const botMsg: ChatMessage = {
        id: `msg-upload-${Date.now()}`,
        sender: 'bot',
        text: `Document "${file.name}" uploaded successfully. I'm extracting the text and generating a summary. You can ask me questions about it shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = err instanceof ApiError ? err.message : 'Failed to upload file.';
      setUploadStatus(`Upload failed: ${errorMsg}`);
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const pollDocumentStatus = (docId: string, docName: string) => {
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const doc = await documentsApi.get(docId);
        if (doc.status === 'ready' || doc.status === 'failed') {
          clearInterval(interval);
          setDocuments(prev =>
            prev.map(d =>
              d.id === docId
                ? {
                    ...d,
                    status: doc.status,
                    pages: doc.pages,
                    summary: doc.summary,
                    errorMessage: doc.errorMessage,
                  }
                : d
            )
          );
          if (doc.status === 'ready') {
            setUploadStatus(`${docName} is ready. Summary generated.`);
          } else {
            setUploadStatus(`${docName} processing failed: ${doc.errorMessage || 'Unknown error'}`);
          }
          setTimeout(() => setUploadStatus(null), 5000);
        }
      } catch {
        // ignore polling errors
      }
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 3000);
  };

  const handleAskAboutDoc = (doc: DashboardDocument) => {
    const prompt = `Can you provide a high-yield study breakdown and test questions for ${doc.name}?`;
    setInputQuery(prompt);
    handleSendMessage(prompt);
  };

  // Real data states for backend-driven views
  const [savedNotes, setSavedNotes] = useState<{ id: string; title: string; content: string; source: string; createdAt: string }[]>([]);
  const [savedQuizzes, setSavedQuizzes] = useState<{ id: string; title: string; topic: string; difficulty: string; questionCount: number; attempts: any[]; createdAt: string }[]>([]);
  const [savedPlans, setSavedPlans] = useState<{ id: string; title: string; days: { day: string; topic: string; duration: string; status: string }[]; createdAt: string }[]>([]);
  const [progressStats, setProgressStats] = useState<{ documentsUploaded: number; documentsReady: number; quizzesGenerated: number; quizAttempts: number; studyPlans: number; notes: number; averageQuizScore: number; studyStreak: number } | null>(null);
  const [subjectPerformance, setSubjectPerformance] = useState<{ subject: string; avgScore: number; attempts: number }[]>([]);
  const [recommendations, setRecommendations] = useState<{ type: string; priority: string; title: string; description: string; action: string }[]>([]);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{ id: string; title: string; questions: { id: string; question: string; options: string[]; correctAnswer: number; explanation: string }[]; currentIndex: number; answers: Record<string, number> } | null>(null);
  const [quizResult, setQuizResult] = useState<{ score: number; correctCount: number; totalQuestions: number; results: any[] } | null>(null);
  const [plannerForm, setPlannerForm] = useState({ subjects: '', examDate: '', availableHours: '2', difficulty: 'balanced' });
  const [viewError, setViewError] = useState<string | null>(null);

  // Load all data from backend on mount
  React.useEffect(() => {
    loadDocuments();
    loadNotes();
    loadQuizzes();
    loadPlans();
    loadProgress();
    loadRecommendations();
  }, []);

  const loadDocuments = async () => {
    try {
      const result = await documentsApi.list();
      setDocuments(result.documents.map((d) => ({
        id: d.id,
        name: d.name,
        pages: d.pages,
        size: d.size,
        uploadedAt: new Date(d.uploadedAt).toLocaleDateString(),
        type: d.type as any,
        summary: d.summary,
        status: d.status as any,
        errorMessage: d.errorMessage,
      })));
    } catch (err) {
      // silently fail - empty state will show
    }
  };

  const loadNotes = async () => {
    try {
      const result = await notesApi.list();
      setSavedNotes(result.notes);
    } catch { /* empty state */ }
  };

  const loadQuizzes = async () => {
    try {
      const result = await quizApi.list();
      setSavedQuizzes(result.quizzes);
    } catch { /* empty state */ }
  };

  const loadPlans = async () => {
    try {
      const result = await plannerApi.list();
      setSavedPlans(result.plans);
    } catch { /* empty state */ }
  };

  const loadProgress = async () => {
    try {
      const result = await progressApi.get();
      setProgressStats(result.stats);
      setSubjectPerformance(result.subjectPerformance);
    } catch { /* empty state */ }
  };

  const loadRecommendations = async () => {
    try {
      const result = await recommendationsApi.get();
      setRecommendations(result.recommendations);
    } catch { /* empty state */ }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await documentsApi.delete(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete document.';
      setViewError(msg);
      setTimeout(() => setViewError(null), 4000);
    }
  };

  const handleGenerateNote = async () => {
    const topic = documents.length > 0
      ? `Key concepts from: ${documents.map(d => d.name).join(', ')}`
      : 'General study strategies and exam preparation';
    setIsGeneratingNote(true);
    setViewError(null);
    try {
      await notesApi.generate(topic, documents[0]?.id);
      await loadNotes();
      await loadProgress();
    } catch (err) {
      setViewError(err instanceof ApiError ? err.message : 'Failed to generate notes.');
      setTimeout(() => setViewError(null), 5000);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleGenerateQuiz = async (topic: string, numQuestions: number, difficulty: string) => {
    setIsGeneratingQuiz(true);
    setViewError(null);
    setQuizResult(null);
    try {
      const quiz = await quizApi.generate(topic, numQuestions, difficulty, documents.length > 0 ? documents.map(d => d.id) : undefined);
      setActiveQuiz({ id: quiz.id, title: quiz.title, questions: quiz.questions, currentIndex: 0, answers: {} });
      await loadQuizzes();
      await loadProgress();
    } catch (err) {
      setViewError(err instanceof ApiError ? err.message : 'Failed to generate quiz.');
      setTimeout(() => setViewError(null), 5000);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsGeneratingQuiz(true);
    try {
      const answers = Object.entries(activeQuiz.answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
      const result = await quizApi.submit(activeQuiz.id, answers);
      setQuizResult(result);
      setActiveQuiz(null);
      await loadQuizzes();
      await loadProgress();
    } catch (err) {
      setViewError(err instanceof ApiError ? err.message : 'Failed to submit quiz.');
      setTimeout(() => setViewError(null), 5000);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGeneratePlan = async () => {
    const subjects = plannerForm.subjects.split(',').map(s => s.trim()).filter(Boolean);
    if (subjects.length === 0) {
      setViewError('Please enter at least one subject.');
      setTimeout(() => setViewError(null), 4000);
      return;
    }
    setIsGeneratingPlan(true);
    setViewError(null);
    try {
      await plannerApi.generate({
        subjects,
        examDate: plannerForm.examDate || undefined,
        availableHours: parseInt(plannerForm.availableHours) || 2,
        difficulty: plannerForm.difficulty,
      });
      await loadPlans();
      await loadProgress();
    } catch (err) {
      setViewError(err instanceof ApiError ? err.message : 'Failed to generate study plan.');
      setTimeout(() => setViewError(null), 5000);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const [docFilterType, setDocFilterType] = useState<'all' | 'pdf' | 'docx' | 'txt'>('all');

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = docFilterType === 'all' || d.type === docFilterType;
    return matchesSearch && matchesType;
  });

  const renderRecentMaterialsView = () => (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <button 
              onClick={() => setActiveNav('dashboard')}
              className={`cursor-pointer transition-colors flex items-center gap-1 ${
                isDarkMode ? 'text-white/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className={isDarkMode ? 'text-white/30' : 'text-slate-300'}>/</span>
            <span className="text-[#d4af37] font-medium">Recent Materials</span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Recent Materials
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
            Manage, search, and review all your uploaded study notes and files ({documents.length} available)
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:opacity-95 text-black font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#d4af37]/25 transition-all cursor-pointer shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Material</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
          <input 
            type="text"
            placeholder="Search documents by name or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pl-9 pr-8 py-2 rounded-xl border focus:outline-hidden ${
              isDarkMode 
                ? 'bg-[#181818] border-white/10 text-white placeholder:text-white/30 focus:ring-1 focus:ring-[#d4af37]' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500'
            }`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'pdf', 'docx', 'txt'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setDocFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                docFilterType === type 
                  ? 'bg-[#d4af37] text-black font-semibold' 
                  : isDarkMode ? 'bg-white/5 text-white/60 hover:text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {type === 'all' ? `All (${documents.length})` : type}
            </button>
          ))}
        </div>
      </div>

      {/* Document List Rows */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className={`p-10 rounded-2xl border text-center ${
            isDarkMode ? 'bg-[#121212]/50 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#d4af37]" />
            <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              {searchQuery ? 'No matching documents found' : 'No documents uploaded yet'}
            </h4>
            <p className="text-xs opacity-70 mb-4 max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search keywords or clearing filters.' : 'Upload lecture notes, textbooks, or PDFs to start studying.'}
            </p>
            <button
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery('');
                  setDocFilterType('all');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#d4af37] text-black inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#e6ca65]"
            >
              {searchQuery ? 'Clear Search' : <><Plus className="w-3.5 h-3.5" /> Upload Material</>}
            </button>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            let badgeBg = isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30' : 'bg-rose-100 text-rose-600';
            let badgeText = 'PDF';
            if (doc.type === 'docx') {
              badgeBg = isDarkMode ? 'bg-[#67E8F9]/15 text-[#67E8F9] border border-[#67E8F9]/30' : 'bg-blue-100 text-blue-600';
              badgeText = 'DOC';
            } else if (doc.type === 'txt') {
              badgeBg = isDarkMode ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-600';
              badgeText = 'TXT';
            }

            return (
              <div
                key={doc.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isDarkMode 
                    ? 'bg-[#121212]/90 border-white/10 hover:border-[#d4af37]/30 shadow-xs' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                }`}
              >
                {/* Left: icon & title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl ${badgeBg} font-bold text-xs flex items-center justify-center shrink-0`}>
                    {badgeText}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      {doc.name}
                    </h4>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>
                      {doc.pages} pages • {doc.size} • {doc.uploadedAt}
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedDocPreview(doc)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'border-white/15 hover:bg-white/5 text-white/80' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    Open
                  </button>

                  <button
                    onClick={() => handleAskAboutDoc(doc)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#67E8F9]/15 hover:bg-[#67E8F9]/25 text-[#67E8F9] border border-[#67E8F9]/30' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/60'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI
                  </button>

                  <button 
                    onClick={() => handleDeleteDoc(doc.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode ? 'text-white/40 hover:text-rose-400 hover:bg-white/5' : 'text-slate-400 hover:text-rose-500'
                    }`}
                    title="Remove document"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderMyNotesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <button onClick={() => setActiveNav('dashboard')} className={`cursor-pointer flex items-center gap-1 ${isDarkMode ? 'text-white/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-blue-600'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className={isDarkMode ? 'text-white/30' : 'text-slate-300'}>/</span>
            <span className="text-[#d4af37] font-medium">My Notes</span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Notes</h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
            AI-generated key concepts, formulas, and revision highlights from your uploaded files
          </p>
        </div>
        <button 
          onClick={handleGenerateNote}
          disabled={isGeneratingNote}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
        >
          {isGeneratingNote ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate AI Notes</>}
        </button>
      </div>

      {viewError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {viewError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedNotes.length === 0 ? (
          <div className={`col-span-full p-10 rounded-2xl border text-center ${isDarkMode ? 'bg-[#121212]/50 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#d4af37]" />
            <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No notes generated yet</h4>
            <p className="text-xs opacity-70 mb-4 max-w-sm mx-auto">Upload documents and click "Generate AI Notes" to create study notes.</p>
          </div>
        ) : (
          savedNotes.map((note) => (
            <div key={note.id} className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#121212]/90 border-white/10 hover:border-[#d4af37]/30' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] font-semibold">AI Generated</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{note.source}</span>
              </div>
              <h3 className={`font-bold text-base mb-2.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{note.title}</h3>
              <div className={`text-xs space-y-1.5 mb-4 ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>
                <p className="whitespace-pre-line line-clamp-6">{note.content}</p>
              </div>
              <button 
                onClick={() => handleSendMessage(`Can you explain "${note.title}" in greater depth with an exam example?`)}
                className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                Ask AI to expand <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAiTutorView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <button onClick={() => setActiveNav('dashboard')} className={`cursor-pointer flex items-center gap-1 ${isDarkMode ? 'text-white/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-blue-600'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className={isDarkMode ? 'text-white/30' : 'text-slate-300'}>/</span>
            <span className="text-[#d4af37] font-medium">AI Tutor</span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Study Tutor</h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
            Ask complex questions, test your mental models, and receive step-by-step guidance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Socratic Dialogue', desc: 'The AI will ask progressive questions to test your understanding step by step.', action: () => handleSendMessage('Act as a Socratic tutor on Machine Learning. Ask me the first conceptual question.') },
          { title: 'Explain Like I am 5', desc: 'Break down tough equations and algorithms into simple real-world analogies.', action: () => handleSendMessage('Explain Tree Rotations in AVL trees using a simple physical analogy.') },
          { title: 'Exam Problem Solver', desc: 'Submit a sample question or formula to get detailed step-by-step working.', action: () => handleSendMessage('Give me a challenging practice problem on Database Normalization and guide me through the solution.') },
          { title: 'Speed Drill', desc: 'Rapid 60-second concept checking across your notes.', action: () => handleSendMessage('Start a 60-second speed drill with 3 rapid questions on Data Structures.') },
        ].map((tut, i) => (
          <div key={i} className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-[#121212]/90 border-white/10 hover:border-[#d4af37]/30' : 'bg-white border-slate-200'}`}>
            <h3 className={`font-bold text-base mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tut.title}</h3>
            <p className={`text-xs mb-4 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>{tut.desc}</p>
            <button 
              onClick={tut.action}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/25 flex items-center gap-1.5 cursor-pointer"
            >
              Start Session <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuizGeneratorView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <button onClick={() => setActiveNav('dashboard')} className={`cursor-pointer flex items-center gap-1 ${isDarkMode ? 'text-white/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-blue-600'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className={isDarkMode ? 'text-white/30' : 'text-slate-300'}>/</span>
            <span className="text-[#d4af37] font-medium">Quiz Generator</span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quiz Generator</h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
            Generate personalized quizzes directly from your uploaded materials
          </p>
        </div>
      </div>

      {viewError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{viewError}</div>
      )}

      {/* Active Quiz Taking UI */}
      {activeQuiz && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#121212]/90 border-[#d4af37]/30' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{activeQuiz.title}</h3>
            <span className="text-xs text-[#d4af37] font-mono">Q {activeQuiz.currentIndex + 1} / {activeQuiz.questions.length}</span>
          </div>
          <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-[#181818]' : 'bg-slate-50'}`}>
            <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {activeQuiz.questions[activeQuiz.currentIndex].question}
            </p>
            <div className="space-y-2">
              {activeQuiz.questions[activeQuiz.currentIndex].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQuiz(prev => prev ? {
                    ...prev,
                    answers: { ...prev.answers, [prev.questions[prev.currentIndex].id]: i }
                  } : null)}
                  className={`w-full p-3 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                    activeQuiz.answers[activeQuiz.questions[activeQuiz.currentIndex].id] === i
                      ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-white'
                      : isDarkMode ? 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono mr-2">{String.fromCharCode(65 + i)})</span> {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveQuiz(prev => prev ? { ...prev, currentIndex: Math.max(0, prev.currentIndex - 1) } : null)}
              disabled={activeQuiz.currentIndex === 0}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-white/15 text-white/80 hover:bg-white/5 cursor-pointer disabled:opacity-40"
            >
              Previous
            </button>
            {activeQuiz.currentIndex < activeQuiz.questions.length - 1 ? (
              <button
                onClick={() => setActiveQuiz(prev => prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#d4af37] text-black cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={isGeneratingQuiz}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white cursor-pointer disabled:opacity-60"
              >
                {isGeneratingQuiz ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Result UI */}
      {quizResult && (
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#121212]/90 border-emerald-500/30' : 'bg-white border-emerald-200'}`}>
          <div className="text-center mb-4">
            <div className={`text-3xl font-bold ${quizResult.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {quizResult.score.toFixed(1)}%
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
              {quizResult.correctCount} out of {quizResult.totalQuestions} correct
            </p>
          </div>
          <div className="space-y-2">
            {quizResult.results.map((r, i) => (
              <div key={i} className={`p-3 rounded-lg text-xs border ${r.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{r.question}</p>
                <p className={r.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                  {r.isCorrect ? 'Correct!' : `You selected: ${r.selectedAnswer !== null ? String.fromCharCode(65 + r.selectedAnswer) : 'None'} | Correct: ${String.fromCharCode(65 + r.correctAnswer)}`}
                </p>
                {r.explanation && <p className={`mt-1 ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>{r.explanation}</p>}
              </div>
            ))}
          </div>
          <button onClick={() => setQuizResult(null)} className="mt-4 px-4 py-2 rounded-lg text-xs font-medium border border-white/15 text-white/80 hover:bg-white/5 cursor-pointer">
            Back to Quiz Generator
          </button>
        </div>
      )}

      {/* Quiz Generation Options */}
      {!activeQuiz && !quizResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Quick 3-Question Quiz', desc: 'Ideal for 2-minute active recall practice', numQ: 3, diff: 'easy' },
              { title: 'Exam Diagnostic (10 Qs)', desc: 'Comprehensive exam difficulty test', numQ: 10, diff: 'hard' },
              { title: 'Flashcard Drill (5 Qs)', desc: '5 definition and term questions', numQ: 5, diff: 'medium' },
            ].map((q, i) => (
              <div key={i} className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
                <div>
                  <BrainCircuit className="w-8 h-8 text-[#d4af37] mb-3" />
                  <h3 className={`font-bold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{q.title}</h3>
                  <p className={`text-xs mb-4 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>{q.desc}</p>
                </div>
                <button 
                  onClick={() => handleGenerateQuiz(documents.length > 0 ? `Based on: ${documents.map(d => d.name).join(', ')}` : 'General Study Material', q.numQ, q.diff)}
                  disabled={isGeneratingQuiz}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black shadow-xs cursor-pointer hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isGeneratingQuiz ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : 'Generate Quiz'}
                </button>
              </div>
            ))}
          </div>

          {/* Past quizzes */}
          {savedQuizzes.length > 0 && (
            <div className="space-y-3">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Past Quizzes</h3>
              {savedQuizzes.map((q) => (
                <div key={q.id} className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div>
                    <span className="text-[11px] font-mono text-[#d4af37] font-semibold">{q.topic}</span>
                    <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{q.title}</h4>
                    <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>{q.questionCount} questions • {q.attempts.length} attempts</span>
                  </div>
                  <button
                    onClick={async () => {
                      const quiz = await quizApi.get(q.id);
                      setActiveQuiz({ id: quiz.id, title: quiz.title, questions: quiz.questions, currentIndex: 0, answers: {} });
                      setQuizResult(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/25 cursor-pointer"
                  >
                    Retake
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderStudyPlannerView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono mb-1">
            <button onClick={() => setActiveNav('dashboard')} className={`cursor-pointer flex items-center gap-1 ${isDarkMode ? 'text-white/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-blue-600'}`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className={isDarkMode ? 'text-white/30' : 'text-slate-300'}>/</span>
            <span className="text-[#d4af37] font-medium">Study Planner</span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Study Planner</h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
            AI-generated study schedule calibrated to your exam milestones and subjects
          </p>
        </div>
      </div>

      {viewError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{viewError}</div>
      )}

      {/* Planner Input Form */}
      <div className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create a New Study Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-600'} block mb-1`}>Subjects (comma-separated)</label>
            <input
              type="text"
              value={plannerForm.subjects}
              onChange={(e) => setPlannerForm(prev => ({ ...prev, subjects: e.target.value }))}
              placeholder="e.g. Machine Learning, Data Structures, DBMS"
              className={`w-full text-xs px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-[#d4af37]`}
            />
          </div>
          <div>
            <label className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-600'} block mb-1`}>Exam Date (optional)</label>
            <input
              type="date"
              value={plannerForm.examDate}
              onChange={(e) => setPlannerForm(prev => ({ ...prev, examDate: e.target.value }))}
              className={`w-full text-xs px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-[#d4af37]`}
            />
          </div>
          <div>
            <label className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-600'} block mb-1`}>Hours per day</label>
            <input
              type="number"
              value={plannerForm.availableHours}
              onChange={(e) => setPlannerForm(prev => ({ ...prev, availableHours: e.target.value }))}
              min="1"
              max="12"
              className={`w-full text-xs px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-[#d4af37]`}
            />
          </div>
          <div>
            <label className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-600'} block mb-1`}>Difficulty</label>
            <select
              value={plannerForm.difficulty}
              onChange={(e) => setPlannerForm(prev => ({ ...prev, difficulty: e.target.value }))}
              className={`w-full text-xs px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-[#181818] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-[#d4af37]`}
            >
              <option value="easy">Easy</option>
              <option value="balanced">Balanced</option>
              <option value="intensive">Intensive</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={isGeneratingPlan}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
        >
          {isGeneratingPlan ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><CalendarDays className="w-3.5 h-3.5" /> Generate Study Plan</>}
        </button>
      </div>

      {/* Saved plans */}
      {savedPlans.length > 0 && (
        <div className="space-y-4">
          {savedPlans.map((plan) => (
            <div key={plan.id}>
              <h3 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.title}</h3>
              <div className="space-y-3">
                {plan.days.map((p, i) => (
                  <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] font-mono text-[#d4af37] font-semibold">{p.day}</span>
                      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.topic}</h4>
                      <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>{p.duration}</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${p.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white/50'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {savedPlans.length === 0 && !isGeneratingPlan && (
        <div className={`p-10 rounded-2xl border text-center ${isDarkMode ? 'bg-[#121212]/50 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#d4af37]" />
          <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>No study plans yet</h4>
          <p className="text-xs opacity-70 mb-4 max-w-sm mx-auto">Fill out the form above to generate an AI-powered study schedule.</p>
        </div>
      )}
    </div>
  );

  const renderProgressView = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono mb-1">
          <button onClick={() => setActiveNav('dashboard')} className={`cursor-pointer flex items-center gap-1 ${isDarkMode ? 'text-white/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-blue-600'}`}>
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span className={isDarkMode ? 'text-white/30' : 'text-slate-300'}>/</span>
          <span className="text-[#d4af37] font-medium">Progress & Analytics</span>
        </div>
        <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Study Progress</h2>
        <p className={`text-xs sm:text-sm mt-0.5 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
          Real analytics calculated from your study activity
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Documents Uploaded', value: progressStats?.documentsUploaded ?? 0, change: `${progressStats?.documentsReady ?? 0} ready` },
          { label: 'Study Streak', value: `${progressStats?.studyStreak ?? 0} Days`, change: progressStats?.studyStreak ? 'Keep it up!' : 'Start studying' },
          { label: 'Avg Quiz Score', value: progressStats ? `${progressStats.averageQuizScore.toFixed(1)}%` : 'N/A', change: `${progressStats?.quizAttempts ?? 0} attempts` },
          { label: 'Quizzes Generated', value: progressStats?.quizzesGenerated ?? 0, change: `${progressStats?.notes ?? 0} notes saved` },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
            <span className="text-[11px] text-[#d4af37] font-medium">{stat.change}</span>
          </div>
        ))}
      </div>

      {subjectPerformance.length > 0 && (
        <div className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Subject Performance</h3>
          <div className="space-y-2.5">
            {subjectPerformance.map((subj, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={isDarkMode ? 'text-white/80' : 'text-slate-700'}>{subj.subject}</span>
                  <span className="font-mono text-white/90 font-medium">{subj.avgScore.toFixed(1)}% ({subj.attempts} attempts)</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${subj.avgScore >= 80 ? 'bg-emerald-400' : subj.avgScore >= 60 ? 'bg-[#d4af37]' : 'bg-amber-400'}`}
                    style={{ width: `${subj.avgScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className={`p-5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div key={i} className={`p-3 rounded-lg border text-xs ${
                rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                rec.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <p className="font-semibold mb-0.5">{rec.title}</p>
                <p className="opacity-80">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen w-full flex ${isDarkMode ? 'bg-[#0a0a0a] text-[#f5f5f5]' : 'bg-[#f8fafc] text-slate-900'} font-sans transition-colors duration-200`}>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".pdf,.docx,.txt"
      />

      {/* MOBILE DRAWER MODAL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className={`relative w-72 max-w-[85vw] h-full flex flex-col justify-between overflow-y-auto ${
                isDarkMode ? 'bg-[#0c0c0c] text-white/80 border-r border-white/10' : 'bg-white text-slate-700 border-r border-slate-200'
              } p-4 shadow-2xl z-10`}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setMobileMenuOpen(false); onNavigateHome(); }}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#d4af37] to-[#e6ca65] p-[1px] flex items-center justify-center text-black">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Scholar Hub</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-1 mb-6">
                  <button
                    onClick={() => { setActiveNav('dashboard'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeNav === 'dashboard'
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold'
                        : isDarkMode ? 'text-white/70 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  {[
                    { id: 'recent-materials', label: 'Recent Materials', icon: Clock, count: documents.length },
                    { id: 'my-notes', label: 'My Notes', icon: FileText },
                    { id: 'documents', label: 'Documents', icon: FolderOpen, count: documents.length },
                    { id: 'ai-tutor', label: 'AI Tutor', icon: Bot },
                    { id: 'quiz-generator', label: 'Quiz Generator', icon: BrainCircuit },
                    { id: 'study-planner', label: 'Study Planner', icon: CalendarDays },
                    { id: 'progress', label: 'Progress', icon: TrendingUp },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveNav(item.id);
                          setMobileMenuOpen(false);
                          if (item.id === 'quiz-generator') { /* navigate only - quiz generated via button */ }
                          if (item.id === 'ai-tutor') { /* navigate only */ }
                          if (item.id === 'study-planner') { /* navigate only */ }
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-sm ${
                          activeNav === item.id 
                            ? 'bg-[#d4af37]/15 text-[#d4af37] font-medium border border-[#d4af37]/30' 
                            : isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-mono font-bold">
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 px-3 mb-2">Tools</div>
                <div className="space-y-1">
                  {[
                    { id: 'upload-tool', label: 'Upload Material', icon: UploadCloud, action: () => fileInputRef.current?.click() },
                    { id: 'summarize', label: 'Summarize Notes', icon: BookOpen, action: () => handleSendMessage('Please summarize the key formulas from my notes.') },
                    { id: 'ask-notes', label: 'Ask Notes', icon: MessageSquare, action: () => handleSendMessage('Explain the main takeaways across all my uploaded files.') },
                    { id: 'flashcards', label: 'Flashcards', icon: Layers, action: () => handleSendMessage('Create 5 flashcard pairs for rapid revision.') },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveNav(item.id);
                          setMobileMenuOpen(false);
                          item.action();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onNavigateHome(); }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-white/70 hover:text-white"
                >
                  <BookOpen className="w-4 h-4 text-[#d4af37]" />
                  <span>Landing Page</span>
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR (Desktop) */}
      <aside 
        className={`relative z-20 hidden md:flex flex-col justify-between transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${isDarkMode ? 'bg-[#0c0c0c] text-white/80 border-r border-white/10' : 'bg-white text-slate-700 border-r border-slate-200'} shrink-0 select-none`}
      >
        {/* Top Logo & Brand */}
        <div>
          <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={onNavigateHome}>
              {/* Scholar Hub Glowing Book Logo */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#d4af37] via-[#f3e5ab] to-[#67E8F9] p-[1.5px] shadow-[0_0_15px_rgba(212,175,55,0.35)] shrink-0 flex items-center justify-center">
                <div className={`w-full h-full ${isDarkMode ? 'bg-[#0c0c0c]' : 'bg-white'} rounded-[10px] flex items-center justify-center`}>
                  <BookOpen className="w-5 h-5 text-[#d4af37]" />
                </div>
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className={`font-bold text-lg tracking-tight flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Scholar Hub
                  </span>
                  <span className={`text-[11px] font-normal truncate ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                    Your AI Study Assistant
                  </span>
                </div>
              )}
            </div>

            {/* Collapse toggle */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav List */}
          <div className="px-3 py-4 space-y-6">
            {/* Primary active Dashboard Button */}
            <div>
              <button
                onClick={() => setActiveNav('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeNav === 'dashboard'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold shadow-lg shadow-[#d4af37]/25'
                    : isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>
            </div>

            {/* MAIN section */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                  Main
                </div>
              )}
              {[
                { id: 'recent-materials', label: 'Recent Materials', icon: Clock, count: documents.length },
                { id: 'my-notes', label: 'My Notes', icon: FileText },
                { id: 'documents', label: 'Documents', icon: FolderOpen, count: documents.length },
                { id: 'ai-tutor', label: 'AI Tutor', icon: Bot },
                { id: 'quiz-generator', label: 'Quiz Generator', icon: BrainCircuit },
                { id: 'study-planner', label: 'Study Planner', icon: CalendarDays },
                { id: 'progress', label: 'Progress', icon: TrendingUp },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      if (item.id === 'quiz-generator') { /* navigate only */ }
                      if (item.id === 'ai-tutor') { /* navigate only */ }
                      if (item.id === 'study-planner') { /* navigate only */ }
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#d4af37]/15 text-[#d4af37] font-medium border border-[#d4af37]/30' 
                        : isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-mono font-bold">
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* TOOLS section */}
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <div className={`px-3 text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                  Tools
                </div>
              )}
              {[
                { id: 'upload-tool', label: 'Upload Material', icon: UploadCloud, action: () => fileInputRef.current?.click() },
                { id: 'summarize', label: 'Summarize', icon: BookOpen, action: () => handleSendMessage('Please summarize the key formulas and concepts from my study notes.') },
                { id: 'ask-notes', label: 'Ask Notes', icon: MessageSquare, action: () => handleSendMessage('Explain the main takeaways across all my uploaded files.') },
                { id: 'generate-quiz', label: 'Generate Quiz', icon: Puzzle, action: () => handleSendMessage('Create an interactive flashcard quiz.') },
                { id: 'flashcards', label: 'Flashcards', icon: Layers, action: () => handleSendMessage('Create 5 flashcard pairs (Term -> Definition) for rapid revision.') },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      item.action?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#d4af37]/15 text-[#d4af37] font-medium border border-[#d4af37]/30' 
                        : isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Settings, Profile, Logout, Dark Mode */}
        <div className={`p-3 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'} space-y-1`}>
          <button 
            onClick={() => setActiveNav('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>

          <button 
            onClick={() => setActiveNav('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              isDarkMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Profile"
          >
            <User className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Profile</span>}
          </button>

          <button 
            onClick={onLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer font-medium"
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>

          {/* Theme switch in sidebar */}
          {!sidebarCollapsed ? (
            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-500'} flex items-center justify-between px-3 text-xs`}>
              <Moon className="w-4 h-4" />
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                  isDarkMode ? 'bg-[#d4af37]' : 'bg-slate-300'
                }`}
              >
                <div 
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0 bg-white'
                  }`}
                />
              </button>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
          ) : (
            <div className="pt-2 flex justify-center">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDarkMode ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className={`sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 border-b backdrop-blur-md gap-3 ${
          isDarkMode 
            ? 'bg-[#0a0a0a]/90 border-white/10' 
            : 'bg-white/90 border-slate-200/80'
        }`}>
          {/* Mobile hamburger + Greeting */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white/80 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`text-base sm:text-xl md:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {getGreeting()}, {user.name || 'Sayantan'} <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
              </h1>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-white/50' : 'text-slate-500'} hidden xs:block`}>
                What would you like to learn today?
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:border-[#d4af37]/40' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs'
                }`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#d4af37] text-black text-[11px] font-bold flex items-center justify-center border-2 border-[#0a0a0a]">
                  3
                </span>
              </button>

              {/* Notification Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-4 z-50 ${
                      isDarkMode ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/50'}`}>
                      <span className="font-semibold text-sm">Notifications</span>
                      <span className="text-xs text-[#67E8F9] font-medium cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className={`divide-y text-xs ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
                      <div className="py-3 flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#67E8F9]/15 text-[#67E8F9] flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium">AI analysis completed</p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Machine Learning Notes are fully indexed.</p>
                        </div>
                      </div>
                      <div className="py-3 flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <FileCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium">Quiz Milestone reached!</p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>You scored 92% on Data Structures Quiz 2.</p>
                        </div>
                      </div>
                      <div className="py-3 flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center shrink-0">
                          <CalendarDays className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium">Study goal reminder</p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Revise DBMS Normalization today.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark/Light mode toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-[#d4af37] hover:bg-white/10' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs'
              }`}
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Sun className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile avatar dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2.5 p-1 rounded-full transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#e6ca65] text-black font-bold flex items-center justify-center shadow-sm overflow-hidden ring-2 ring-[#d4af37]/30">
                  {user.name ? user.name[0].toUpperCase() : 'S'}
                </div>
                <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`} />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border p-2 z-50 ${
                      isDarkMode ? 'bg-[#121212] border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/50'}`}>
                      <p className="font-semibold text-sm">{user.name || 'Sayantan'}</p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{user.email || 'sayantanmaity41@gmail.com'}</p>
                    </div>
                    <div className="py-1 text-sm">
                      <button 
                        onClick={() => { setShowUserMenu(false); onNavigateHome?.(); }} 
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${
                          isDarkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-[#d4af37]" /> Home Landing
                      </button>
                      <button 
                        onClick={() => { setShowUserMenu(false); setActiveNav('settings'); }} 
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer ${
                          isDarkMode ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <button 
                        onClick={onLogout} 
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer font-medium ${
                          isDarkMode ? 'hover:bg-rose-950/30 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                        }`}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* CONTENT & CHAT SPLIT VIEW */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT 8 COLS: Upload Box, Study Tools, Recent Materials */}
          <div className="xl:col-span-8 space-y-8">
            {activeNav === 'dashboard' ? (
              <>
                {/* UPLOAD HERO BANNER */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const input = fileInputRef.current;
                      if (input) {
                        input.files = e.dataTransfer.files;
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event);
                      }
                    }
                  }}
                  className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
                    isDarkMode 
                      ? 'border-[#d4af37]/30 bg-[#121212]/80 hover:border-[#d4af37]/60 shadow-[0_0_30px_rgba(212,175,55,0.05)]' 
                      : 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-400'
                  }`}
                >
              {/* Center Illustration with floating file tags */}
              <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-xl ${isDarkMode ? 'bg-gradient-to-tr from-[#d4af37]/20 to-[#67E8F9]/15' : 'bg-gradient-to-tr from-indigo-200/50 to-blue-200/50'}`} />
                
                {/* Floating small icons */}
                <div className={`absolute -top-1 -left-2 w-7 h-7 rounded-lg shadow-md flex items-center justify-center animate-bounce ${
                  isDarkMode ? 'bg-[#181818] border border-white/10 text-[#67E8F9]' : 'bg-white text-purple-600'
                }`} style={{ animationDuration: '3s' }}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className={`absolute -bottom-1 -left-3 w-7 h-7 rounded-lg shadow-md flex items-center justify-center animate-bounce ${
                  isDarkMode ? 'bg-[#181818] border border-white/10 text-[#d4af37]' : 'bg-white text-indigo-600'
                }`} style={{ animationDuration: '4s' }}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className={`absolute -bottom-1 -right-3 w-7 h-7 rounded-lg shadow-md flex items-center justify-center animate-bounce ${
                  isDarkMode ? 'bg-[#181818] border border-white/10 text-emerald-400' : 'bg-white text-emerald-600'
                }`} style={{ animationDuration: '3.5s' }}>
                  <FileCheck className="w-4 h-4" />
                </div>

                {/* Central Big File Document */}
                <div className={`relative w-16 h-20 rounded-xl shadow-lg border flex flex-col items-center justify-center p-2 ${
                  isDarkMode ? 'bg-[#161616] border-white/15' : 'bg-white border-slate-200'
                }`}>
                  <div className="w-9 h-7 rounded-md bg-[#d4af37] text-black font-bold text-[10px] flex items-center justify-center mb-1">
                    PDF
                  </div>
                  <div className={`w-8 h-1 rounded-full mb-1 ${isDarkMode ? 'bg-white/20' : 'bg-slate-200'}`} />
                  <div className={`w-6 h-1 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
                </div>
              </div>

              <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Upload your study material
              </h2>
              <p className={`text-sm max-w-md mx-auto mb-6 ${isDarkMode ? 'text-white/50' : 'text-slate-600'}`}>
                Turn your PDFs, notes and documents into an interactive AI study experience.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] hover:opacity-95 text-black font-semibold text-sm flex items-center gap-2 shadow-md shadow-[#d4af37]/25 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  Choose Files
                </button>
              </div>

              <p className={`text-xs mt-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                or drag and drop your files here
              </p>
              <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                Supported formats: PDF • DOCX • TXT • Images (PNG, JPG)
              </p>
            </div>

            {/* STUDY TOOLS - Revealed when documents/PDFs are uploaded */}
            <div className="transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Study Tools
                  </h3>
                  {documents.length > 0 && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      Ready
                    </span>
                  )}
                </div>

                {documents.length === 0 && (
                  <span className={`text-xs flex items-center gap-1.5 ${isDarkMode ? 'text-[#d4af37]' : 'text-amber-600'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Upload a PDF to unlock features
                  </span>
                )}
              </div>

              {documents.length === 0 ? (
                /* Smooth placeholder card guiding the user */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-3xl border border-dashed text-center cursor-pointer transition-all ${
                    isDarkMode 
                      ? 'bg-[#121212]/50 border-white/10 hover:border-[#d4af37]/40 hover:bg-[#121212]/80' 
                      : 'bg-slate-50/60 border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                    isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    The features will be displayed once the PDF is uploaded
                  </h4>
                  <p className={`text-xs max-w-md mx-auto mb-4 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                    Upload any course notes, syllabus, textbook, or PDF to automatically unlock AI Summaries, Flashcards, Quiz Generators, and Study Planners.
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs ${
                    isDarkMode 
                      ? 'bg-[#d4af37] text-black hover:bg-[#e6ca65]' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    <Plus className="w-3.5 h-3.5" /> Upload PDF Now
                  </span>
                </motion.div>
              ) : (
                /* Smoothly animated Study Tools Grid */
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {[
                    {
                      title: 'AI Summary',
                      desc: 'Convert lengthy study material into concise notes.',
                      icon: Sparkles,
                      color: isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37]' : 'bg-purple-100 text-purple-600',
                      action: () => handleSendMessage('Summarize the essential concepts from my uploaded notes into key revision bullet points.')
                    },
                    {
                      title: 'Ask Your Notes',
                      desc: 'Ask questions and get answers directly from your materials.',
                      icon: MessageSquare,
                      color: isDarkMode ? 'bg-[#67E8F9]/15 text-[#67E8F9]' : 'bg-blue-100 text-blue-600',
                      action: () => handleSendMessage('What are the most heavily tested topics in my uploaded files?')
                    },
                    {
                      title: 'Quiz Generator',
                      desc: 'Generate personalized quizzes from your notes.',
                      icon: BrainCircuit,
                      color: isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600',
                      action: () => handleSendMessage('Create a 3-question conceptual quiz based on Machine Learning and Data Structures.')
                    },
                    {
                      title: 'Flashcards',
                      desc: 'Automatically create flashcards for faster revision.',
                      icon: Layers,
                      color: isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
                      action: () => handleSendMessage('Generate 5 flashcards for quick revision before my exam.')
                    },
                    {
                      title: 'Study Planner',
                      desc: 'Create an intelligent study schedule based on your goals.',
                      icon: CalendarDays,
                      color: isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37]' : 'bg-purple-100 text-purple-600',
                      action: () => handleSendMessage('Build an effective 5-day study timeline for my upcoming subjects.')
                    },
                    {
                      title: 'Progress',
                      desc: 'Track learning progress and identify weak topics.',
                      icon: TrendingUp,
                      color: isDarkMode ? 'bg-[#67E8F9]/15 text-[#67E8F9]' : 'bg-blue-100 text-blue-600',
                      action: () => handleSendMessage('Analyze my current study progress and recommend areas to strengthen.')
                    },
                  ].map((tool, idx) => {
                    const Icon = tool.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.4 }}
                        onClick={tool.action}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                          isDarkMode 
                            ? 'bg-[#121212]/90 border-white/10 hover:border-[#d4af37]/40 shadow-[0_0_20px_rgba(0,0,0,0.3)]' 
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isDarkMode 
                              ? 'bg-white/5 group-hover:bg-[#d4af37] group-hover:text-black text-white/50' 
                              : 'bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400'
                          }`}>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <h4 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{tool.title}</h4>
                        <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                          {tool.desc}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </>
        ) : (activeNav === 'recent-materials' || activeNav === 'documents') ? (
          renderRecentMaterialsView()
        ) : activeNav === 'my-notes' ? (
          renderMyNotesView()
        ) : activeNav === 'ai-tutor' ? (
          renderAiTutorView()
        ) : activeNav === 'quiz-generator' ? (
          renderQuizGeneratorView()
        ) : activeNav === 'study-planner' ? (
          renderStudyPlannerView()
        ) : activeNav === 'progress' ? (
          renderProgressView()
        ) : (
          renderRecentMaterialsView()
        )}
      </div>

      {/* RIGHT 4 COLS: StudyAI Assistant Chat Panel */}
          <div className="xl:col-span-4 sticky top-24">
            <div className={`rounded-3xl border flex flex-col h-[780px] shadow-sm overflow-hidden transition-all ${
              isDarkMode 
                ? 'bg-[#101010] border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]' 
                : 'bg-white border-slate-200'
            }`}>
              
              {/* Chat Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    isDarkMode ? 'bg-gradient-to-tr from-[#d4af37] to-[#e6ca65] text-black shadow-[#d4af37]/20 font-bold' : 'bg-blue-600 text-white shadow-blue-500/30'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Scholar Hub Assistant
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] text-emerald-400 font-medium">Online</span>
                      <span className={`text-[11px] ml-1 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>• Ask anything</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => {
                      setMessages(INITIAL_MESSAGES);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Reset conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={isChatExpanded ? "Collapse chat" : "Expand chat"}
                  >
                    {isChatExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
                {messages.map((msg) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`flex gap-2.5 max-w-[88%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                        {isBot && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37]' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`rounded-2xl p-3.5 leading-relaxed ${
                          isBot 
                            ? isDarkMode ? 'bg-[#181818] border border-white/10 text-white/95' : 'bg-slate-100/80 text-slate-800'
                            : isDarkMode ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-medium shadow-xs' : 'bg-blue-600 text-white shadow-xs'
                        }`}>
                          <div className="whitespace-pre-line">
                            {msg.text}
                          </div>

                          {/* Citation box if bot generated */}
                          {msg.citation && (
                            <div className={`mt-3 pt-2.5 border-t text-[11px] flex items-center justify-between ${
                              isDarkMode ? 'border-white/10 text-white/70' : 'border-slate-200 text-slate-600'
                            }`}>
                              <span className={`font-semibold ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Answer based on:</span>
                              <div className={`flex items-center gap-1 font-medium px-2 py-0.5 rounded-md ${
                                isDarkMode ? 'text-[#67E8F9] bg-[#67E8F9]/10 border border-[#67E8F9]/20' : 'text-blue-600 bg-blue-50'
                              }`}>
                                <FileText className="w-3 h-3" />
                                <span className="truncate max-w-[130px]">{msg.citation.docName}</span>
                                <span>P.{msg.citation.page}</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp & Status */}
                      <div className={`text-[10px] mt-1 flex items-center gap-1 ${isBot ? 'ml-9' : 'mr-1'} ${isDarkMode ? 'text-white/35' : 'text-slate-400'}`}>
                        <span>{msg.timestamp}</span>
                        {!isBot && <CheckCheck className="w-3 h-3 text-[#67E8F9]" />}
                      </div>
                    </div>
                  );
                })}

                {/* AI Typing indicator */}
                {isAiTyping && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isDarkMode ? 'bg-[#d4af37]/15 text-[#d4af37]' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Bot className="w-4 h-4 animate-spin" />
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-2 rounded-xl ${
                      isDarkMode ? 'bg-[#181818] border border-white/10' : 'bg-slate-100'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className={`px-4 py-2 border-t overflow-x-auto no-scrollbar flex items-center gap-1.5 ${
                isDarkMode ? 'border-white/10 bg-[#141414]' : 'border-slate-100 bg-slate-50/50'
              }`}>
                {[
                  'Summarize this',
                  'Create quiz',
                  'Important topics',
                  'Explain simply',
                  'Find key points'
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                      isDarkMode 
                        ? 'border-white/10 bg-[#181818] text-white/70 hover:bg-[#d4af37]/15 hover:text-[#d4af37] hover:border-[#d4af37]/40' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className={`p-3 border-t ${
                isDarkMode ? 'border-white/10 bg-[#121212]' : 'border-slate-100 bg-white'
              }`}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all ${
                    isDarkMode 
                      ? 'border-white/10 bg-[#161616] focus-within:border-[#d4af37]' 
                      : 'border-slate-200 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white shadow-inner'
                  }`}
                >
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`transition-colors p-1 cursor-pointer ${
                      isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Attach notes"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input 
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask anything about your notes..."
                    className={`flex-1 bg-transparent text-xs sm:text-sm focus:outline-hidden ${
                      isDarkMode ? 'text-white placeholder:text-white/30' : 'placeholder:text-slate-400 text-slate-900'
                    }`}
                  />

                  <button 
                    type="button"
                    onClick={() => {
                      setIsListening(!isListening);
                      if (!isListening) {
                        setInputQuery('Explain the key theorem in Machine Learning Notes.');
                      }
                    }}
                    className={`p-1 transition-colors cursor-pointer ${
                      isListening ? 'text-red-500 animate-pulse' : isDarkMode ? 'text-white/40 hover:text-[#d4af37]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <button 
                    type="submit"
                    disabled={!inputQuery.trim()}
                    className={`w-8 h-8 rounded-full disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
                      isDarkMode 
                        ? 'bg-[#d4af37] hover:bg-[#e6ca65] text-black font-semibold shadow-[#d4af37]/20' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    title="Send message"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>

                <p className={`text-[10px] text-center mt-2 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                  AI responses may not be 100% accurate. Please verify important information.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDocPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl border ${
                isDarkMode ? 'bg-[#121212] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className={`flex items-center justify-between pb-4 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center ${
                    isDarkMode ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {selectedDocPreview.type.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{selectedDocPreview.name}</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{selectedDocPreview.pages} pages • {selectedDocPreview.size}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDocPreview(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-[#d4af37]/10 border-[#d4af37]/25 text-white/90' : 'bg-indigo-50/50 border-indigo-100 text-slate-700'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${
                    isDarkMode ? 'text-[#d4af37]' : 'text-indigo-600'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" /> AI Summary & Abstract
                  </span>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>
                    {selectedDocPreview.summary}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#161616]' : 'border-slate-200'}`}>
                    <span className={`text-xs block ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Flashcards</span>
                    <span className="text-lg font-bold text-[#67E8F9]">18 Ready</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#161616]' : 'border-slate-200'}`}>
                    <span className={`text-xs block ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Quiz Questions</span>
                    <span className="text-lg font-bold text-emerald-400">25 Generated</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#161616]' : 'border-slate-200'}`}>
                    <span className={`text-xs block ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>Readiness</span>
                    <span className="text-lg font-bold text-[#d4af37]">94%</span>
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setSelectedDocPreview(null)}
                  className={`px-4 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    isDarkMode ? 'border-white/15 text-white/70 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAskAboutDoc(selectedDocPreview);
                    setSelectedDocPreview(null);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-md ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold shadow-[#d4af37]/20 hover:opacity-95' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask Assistant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
