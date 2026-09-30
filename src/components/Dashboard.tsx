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

interface DashboardProps {
  user: UserSession;
  onLogout: () => void;
  onNavigateHome?: () => void;
}

const INITIAL_DOCS: DashboardDocument[] = [
  {
    id: 'doc-1',
    name: 'Data Structures.pdf',
    pages: 24,
    size: '12.4 MB',
    uploadedAt: 'Uploaded 2 hours ago',
    type: 'pdf',
    summary: 'Comprehensive guide covering Binary Search Trees, AVL Trees, Hash Tables, and Graph traversal algorithms (BFS, DFS).'
  },
  {
    id: 'doc-2',
    name: 'Machine Learning Notes.pdf',
    pages: 56,
    size: '18.7 MB',
    uploadedAt: 'Uploaded 1 day ago',
    type: 'pdf',
    summary: 'Core supervised and unsupervised learning algorithms: Linear Regression, Logistic Regression, Decision Trees, SVM, and k-Means clustering.'
  },
  {
    id: 'doc-3',
    name: 'DBMS Unit 3.docx',
    pages: 32,
    size: '8.1 MB',
    uploadedAt: 'Uploaded 2 days ago',
    type: 'docx',
    summary: 'Relational database normalization (1NF to BCNF), ACID properties, concurrency control mechanisms, and transaction logging.'
  },
  {
    id: 'doc-4',
    name: 'Operating Systems.txt',
    pages: 15,
    size: '4.3 MB',
    uploadedAt: 'Uploaded 3 days ago',
    type: 'txt',
    summary: 'Process synchronization, Deadlock prevention, Banker\'s algorithm, Virtual Memory paging, and page replacement strategies.'
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'bot',
    text: "Hi! I'm StudyAI Assistant 🤖\nI've analyzed your uploaded materials. What would you like to learn today?",
    timestamp: '7:30 PM'
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Explain supervised learning in simple words.',
    timestamp: '7:31 PM'
  },
  {
    id: 'msg-3',
    sender: 'bot',
    text: 'Supervised learning is a type of machine learning where the model learns from labeled examples. That means the training data includes both the input and the **correct output**. The model uses this data to **learn a mapping** from inputs to outputs and makes predictions on new, unseen data.',
    timestamp: '7:32 PM',
    citation: {
      docName: 'Machine_Learning_Notes.pdf',
      page: 12
    }
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
  const [documents, setDocuments] = useState<DashboardDocument[]>(INITIAL_DOCS);
  
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

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsAiTyping(true);

    setTimeout(() => {
      let botResponse = '';
      let citation = undefined;

      const lower = query.toLowerCase();
      if (lower.includes('supervised') || lower.includes('machine learning')) {
        botResponse = "Supervised learning uses input-output pairs to train algorithms. Key types include **Regression** (predicting continuous values like house prices) and **Classification** (predicting categories like spam vs non-spam). Popular models include Linear Regression, Logistic Regression, Decision Trees, and Random Forests.";
        citation = { docName: 'Machine_Learning_Notes.pdf', page: 14 };
      } else if (lower.includes('data structure') || lower.includes('tree') || lower.includes('graph')) {
        botResponse = "In Data Structures, **Binary Search Trees (BST)** maintain an ordered property: left subtree < root < right subtree, allowing O(log n) average search time. Balanced variants like **AVL Trees** perform rotations to guarantee O(log n) worst-case time.";
        citation = { docName: 'Data Structures.pdf', page: 8 };
      } else if (lower.includes('dbms') || lower.includes('acid') || lower.includes('normalization')) {
        botResponse = "**ACID Properties** ensure database transaction reliability:\n• **Atomicity**: All or nothing execution\n• **Consistency**: State moves from one valid state to another\n• **Isolation**: Concurrent transactions do not interfere\n• **Durability**: Committed changes persist even after system crashes.";
        citation = { docName: 'DBMS Unit 3.docx', page: 18 };
      } else if (lower.includes('quiz') || lower.includes('create quiz')) {
        botResponse = "Here is a quick quiz question based on your notes:\n\n**Q:** What is the primary difference between Supervised and Unsupervised learning?\n**A)** Supervised uses labeled data, while Unsupervised finds hidden patterns in unlabeled data.\n**B)** Unsupervised is faster.\n**C)** Supervised does not use loss functions.\n\n*Type your answer (A, B, or C) to test your recall!*";
        citation = { docName: 'Machine_Learning_Notes.pdf', page: 20 };
      } else if (lower.includes('summarize') || lower.includes('summary')) {
        botResponse = "Here is a concise summary of your recent study materials:\n1. **Data Structures**: Focus on tree traversals (inorder, preorder, postorder) and graph algorithms.\n2. **Machine Learning**: Grasp the bias-variance tradeoff and evaluation metrics (Precision, Recall, F1-Score).\n3. **DBMS**: Master BCNF decomposition and two-phase locking protocol (2PL).";
        citation = { docName: 'Data Structures.pdf', page: 2 };
      } else {
        botResponse = `Based on your study notes in **${documents[0]?.name || 'your documents'}**, here is what you need to know:\n\n1. **Core Concept**: Break complex topics into modular building blocks.\n2. **Key Principle**: Active recall and spaced repetition accelerate retention by up to 80%.\n3. **Practical Application**: Solve practice problems and generate flashcards before the exam.`;
        citation = { docName: documents[0]?.name || 'Machine_Learning_Notes.pdf', page: 5 };
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citation
      };

      setMessages(prev => [...prev, botMsg]);
      setIsAiTyping(false);

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    let type: 'pdf' | 'docx' | 'txt' | 'img' = 'pdf';
    if (fileExt === 'docx' || fileExt === 'doc') type = 'docx';
    else if (fileExt === 'txt') type = 'txt';
    else if (['png', 'jpg', 'jpeg'].includes(fileExt)) type = 'img';

    const newDoc: DashboardDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      pages: Math.max(1, Math.floor(file.size / (1024 * 50))),
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: 'Just now',
      type,
      summary: `Uploaded document "${file.name}". Ready for AI semantic indexing, flashcard generation, and concept analysis.`
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Send AI assistant greeting about uploaded doc
    const botMsg: ChatMessage = {
      id: `msg-upload-${Date.now()}`,
      sender: 'bot',
      text: `🎉 Successfully ingested **${file.name}**! I've indexed its content and created study flashcards. Ask me any question or ask me to summarize it!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citation: {
        docName: file.name,
        page: 1
      }
    };
    setMessages(prev => [...prev, botMsg]);
  };

  const handleAskAboutDoc = (doc: DashboardDocument) => {
    const prompt = `Can you provide a high-yield study breakdown and test questions for ${doc.name}?`;
    setInputQuery(prompt);
    handleSendMessage(prompt);
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
                    onClick={() => {
                      setDocuments(prev => prev.filter(d => d.id !== doc.id));
                    }}
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
            Auto-synthesized key concepts, formulas, and revision highlights from your uploaded files
          </p>
        </div>
        <button 
          onClick={() => handleSendMessage('Create a concise revision note sheet covering the key concepts across all my materials.')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" /> Generate AI Notes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Supervised vs Unsupervised Learning', source: 'Machine_Learning_Notes.pdf', bullets: ['Supervised uses labeled targets (Regression & Classification)', 'Unsupervised finds latent structure (K-Means, PCA)', 'Key metric: F1-score balances Precision & Recall'] },
          { title: 'Binary Search Tree & Balance Criteria', source: 'Data Structures.pdf', bullets: ['BST property: Left < Node < Right', 'Worst case O(n) degenerates into linked list without rebalancing', 'AVL / Red-Black trees maintain O(log n) height invariant'] },
          { title: 'Relational ACID Transactions', source: 'DBMS Unit 3.docx', bullets: ['Atomicity ensures all-or-nothing execution', 'Two-Phase Locking (2PL) prevents conflict serializability violations', 'Durability write-ahead logs withstand hardware crashes'] },
        ].map((note, idx) => (
          <div key={idx} className={`p-5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-[#121212]/90 border-white/10 hover:border-[#d4af37]/30' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] font-semibold">Concept #{idx + 1}</span>
              <span className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{note.source}</span>
            </div>
            <h3 className={`font-bold text-base mb-2.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{note.title}</h3>
            <ul className={`text-xs space-y-1.5 mb-4 list-disc list-inside ${isDarkMode ? 'text-white/70' : 'text-slate-600'}`}>
              {note.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
            <button 
              onClick={() => handleSendMessage(`Can you explain "${note.title}" in greater depth with an exam example?`)}
              className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              Ask AI to expand <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
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
            Generate personalized multiple-choice and flash quizzes directly from your uploaded materials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Quick 3-Question Quiz', desc: 'Ideal for 2-minute active recall practice', prompt: 'Generate a 3-question multiple choice diagnostic quiz on my notes with answers and explanations.' },
          { title: 'Exam Diagnostic (10 Qs)', desc: 'Comprehensive exam difficulty test', prompt: 'Generate a 10-question comprehensive exam quiz based on Machine Learning and DBMS notes.' },
          { title: 'Flashcard Drill', desc: '5 definition and term pairings', prompt: 'Create 5 flashcard pairs for rapid revision with questions on one side and definitions on the other.' },
        ].map((q, i) => (
          <div key={i} className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
            <div>
              <BrainCircuit className="w-8 h-8 text-[#d4af37] mb-3" />
              <h3 className={`font-bold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{q.title}</h3>
              <p className={`text-xs mb-4 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>{q.desc}</p>
            </div>
            <button 
              onClick={() => handleSendMessage(q.prompt)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black shadow-xs cursor-pointer hover:opacity-95"
            >
              Generate Quiz
            </button>
          </div>
        ))}
      </div>
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
            Adaptive weekly schedule calibrated to your exam milestones and uploaded notes
          </p>
        </div>
        <button 
          onClick={() => handleSendMessage('Create a 7-day revision schedule allocating 2 hours per day across my 3 uploaded courses.')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e6ca65] text-black font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <CalendarDays className="w-3.5 h-3.5" /> Re-optimize Schedule
        </button>
      </div>

      <div className="space-y-3">
        {[
          { day: 'Day 1 (Today)', topic: 'Machine Learning - Supervised Regression & Cost Functions', duration: '45 mins', status: 'In Progress' },
          { day: 'Day 2 (Tomorrow)', topic: 'Data Structures - Balanced BST, AVL Rotations & Complexity', duration: '50 mins', status: 'Scheduled' },
          { day: 'Day 3', topic: 'DBMS - ACID Properties & Transaction Locking Protocols', duration: '40 mins', status: 'Scheduled' },
          { day: 'Day 4', topic: 'Active Recall Diagnostic Quiz & Flashcard Review', duration: '30 mins', status: 'Scheduled' },
        ].map((plan, i) => (
          <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
            <div>
              <span className="text-[11px] font-mono text-[#d4af37] font-semibold">{plan.day}</span>
              <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{plan.topic}</h4>
              <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>{plan.duration} recommended</span>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${plan.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white/50'}`}>
              {plan.status}
            </span>
          </div>
        ))}
      </div>
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
          Active recall analytics, document mastery rates, and weekly study streaks
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Documents Indexed', value: documents.length, change: '+1 this week' },
          { label: 'Study Streak', value: '5 Days', change: 'Personal best' },
          { label: 'Quiz Accuracy', value: '88%', change: '+6% improvement' },
          { label: 'Concepts Mastered', value: '24', change: '3 in progress' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#121212]/90 border-white/10' : 'bg-white border-slate-200'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
            <span className="text-[11px] text-[#d4af37] font-medium">{stat.change}</span>
          </div>
        ))}
      </div>
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
        accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
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
                          if (item.id === 'quiz-generator') handleSendMessage('Generate a 5-question multiple choice quiz on my uploaded documents.');
                          if (item.id === 'ai-tutor') handleSendMessage('Act as my personal AI study tutor.');
                          if (item.id === 'study-planner') handleSendMessage('Create a 7-day study plan for my exams.');
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
                      if (item.id === 'quiz-generator') handleSendMessage('Generate a 5-question multiple choice quiz on my uploaded documents.');
                      if (item.id === 'ai-tutor') handleSendMessage('Act as my personal AI study tutor. What concept should we test first?');
                      if (item.id === 'study-planner') handleSendMessage('Create a 7-day study plan for my exams.');
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
