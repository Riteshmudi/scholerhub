import { FeatureItem } from '../types';

export const FEATURES: FeatureItem[] = [
  {
    id: 'user-login-profile',
    number: '01',
    iconName: 'User',
    title: 'User Login & Profile',
    subtitle: 'Personalized Academic Identity',
    category: 'Foundation',
    tagline: 'Secure authentication customized to your curriculum, major, and learning pace.',
    bullets: [
      'Register / login with multi-device sync',
      'Custom student profile & academic level',
      'Target subjects & study style preferences'
    ],
    mockupType: 'profile',
    details: {
      primaryHighlight: 'Adaptive profile tailored to individual curriculum goals',
      metricsLabel: 'Active Preferences',
      metricsValue: '100% Synced',
      sampleData: ['Computer Science Major', 'Active Term: Fall 2026', 'Visual & Interactive Learner']
    }
  },
  {
    id: 'study-material-upload',
    number: '02',
    iconName: 'BookOpen',
    title: 'Study Material Upload',
    subtitle: 'Intelligent Knowledge Ingestion',
    category: 'Foundation',
    tagline: 'Effortlessly upload textbooks, lecture slides, and handwritten notes with instant OCR.',
    bullets: [
      'Upload PDF, DOCX & scanned notes',
      'Organize material automatically by subject / topic',
      'High-precision text extraction from documents'
    ],
    mockupType: 'upload',
    details: {
      primaryHighlight: 'High-speed multi-document OCR and layout-aware parser',
      metricsLabel: 'Supported Formats',
      metricsValue: 'PDF, EPUB, DOCX',
      sampleData: ['Neural_Networks_Ch4.pdf (24 MB)', 'Linear_Algebra_Notes.pdf (12 MB)', 'Organic_Chemistry_Review.pdf (18 MB)']
    }
  },
  {
    id: 'ai-study-chatbot',
    number: '03',
    iconName: 'Bot',
    title: 'AI Study Chatbot',
    subtitle: 'Conversational 24/7 AI Tutor',
    category: 'AI Intelligence',
    tagline: 'An empathetic, tireless AI tutor that explains complex concepts step-by-step.',
    bullets: [
      'Ask complex questions in natural language',
      'Get step-by-step intuitive explanations',
      'Interactive follow-up inquiries with memory',
      'Deep context-aware answers tailored to your syllabus'
    ],
    mockupType: 'chatbot',
    details: {
      primaryHighlight: 'Conversational reasoning powered by deep conceptual knowledge',
      metricsLabel: 'Response Latency',
      metricsValue: '< 350ms',
      sampleData: [
        'Student: "Explain backpropagation intuitively."',
        'AI Tutor: "Think of it as calculating how much each neuron contributed to the error..."',
        'Follow-up: "Can you provide a small mathematical proof?"'
      ]
    }
  },
  {
    id: 'ai-notes-summarizer',
    number: '04',
    iconName: 'FileText',
    title: 'AI Notes Summarizer',
    subtitle: 'Instant Synthesis & Key Takeaways',
    category: 'AI Intelligence',
    tagline: 'Turn 100-page dense textbook chapters into crisp, actionable synthesis in seconds.',
    bullets: [
      'Summarize uploaded multi-chapter PDFs',
      'Generate bulleted key points & executive summaries',
      'Extract critical definitions, theorems & concepts'
    ],
    mockupType: 'summarizer',
    details: {
      primaryHighlight: 'Distills complex literature into clear, memorable takeaways',
      metricsLabel: 'Reading Time Saved',
      metricsValue: '85%',
      sampleData: ['Core Principle: Gradient Descent Optimization', 'Key Theorem: Universal Approximation', 'Glossary: 14 Key Terms Highlighted']
    }
  },
  {
    id: 'ai-quiz-generator',
    number: '05',
    iconName: 'CheckSquare',
    title: 'AI Question & Quiz Generator',
    subtitle: 'Active Recall & Automated Assessment',
    category: 'Assessment & Growth',
    tagline: 'Test your understanding with dynamically generated quizzes and immediate grading.',
    bullets: [
      'Multiple Choice Questions (MCQs)',
      'True / False conceptual checkpoints',
      'Short-answer & problem-solving questions',
      'Automatic instant evaluation & detailed answer keys'
    ],
    mockupType: 'quiz',
    details: {
      primaryHighlight: 'Adaptive difficulty scaling based on your mastery level',
      metricsLabel: 'Question Formats',
      metricsValue: 'MCQ / T-F / Open',
      sampleData: ['Q1: What is the primary role of an activation function? [MCQ]', 'Score: 92% (11/12 Correct)', 'Explanations generated for every answer']
    }
  },
  {
    id: 'study-planner',
    number: '06',
    iconName: 'Target',
    title: 'Personalized Study Planner',
    subtitle: 'Goal-Oriented Dynamic Scheduling',
    category: 'Foundation',
    tagline: 'Structured timetables designed around your upcoming midterm and final exam dates.',
    bullets: [
      'Daily & weekly adaptive study schedules',
      'Exam-date based countdown planning',
      'High-yield topic prioritization & time allocation'
    ],
    mockupType: 'planner',
    details: {
      primaryHighlight: 'Automatic calendar rebalancing when sessions are rescheduled',
      metricsLabel: 'Upcoming Milestone',
      metricsValue: '12 Days to Finals',
      sampleData: ['Monday: 45 min Advanced Calculus', 'Tuesday: 60 min Data Structures', 'Wednesday: Mock Exam Simulation']
    }
  },
  {
    id: 'performance-tracking',
    number: '07',
    iconName: 'BarChart3',
    title: 'Performance Tracking',
    subtitle: 'Comprehensive Analytics Dashboard',
    category: 'Assessment & Growth',
    tagline: 'Track your growth trajectory, test averages, and retention curves over time.',
    bullets: [
      'Real-time quiz scores & historical trends',
      'Subject-wise mastery breakdown & performance heatmaps',
      'Overall syllabus completion & progress tracking',
      'Granular identification of strong vs. weak topics'
    ],
    mockupType: 'performance',
    details: {
      primaryHighlight: 'Visual mastery telemetry with predictive score forecasting',
      metricsLabel: 'Average Mastery',
      metricsValue: '88.4%',
      sampleData: ['Algorithms: 94% Mastery (Strong)', 'Database Systems: 89% Mastery', 'Operating Systems: 68% Mastery (Focus Needed)']
    }
  },
  {
    id: 'ai-recommendations',
    number: '08',
    iconName: 'Lightbulb',
    title: 'AI Recommendations',
    subtitle: 'Proactive Learning Remediation',
    category: 'Assessment & Growth',
    tagline: 'Smart diagnostic engine that pinpoints knowledge gaps and directs your next hour of study.',
    bullets: [
      'Identify critical weak areas before test day',
      'Recommend exact modules & notes to study next',
      'Automated spaced-repetition revision reminders'
    ],
    mockupType: 'recommendations',
    details: {
      primaryHighlight: 'Precision learning path algorithm optimizing for maximum score gains',
      metricsLabel: 'Next Recommended Task',
      metricsValue: 'Review Ch. 7 Memory Models',
      sampleData: ['Spaced Repetition: Review Linear Algebra in 2 days', 'Suggested Quiz: 5 Quick Questions on Paging', 'Focus Boost: +15% expected retention']
    }
  },
  {
    id: 'document-rag-qa',
    number: '09',
    iconName: 'Search',
    title: 'Document-Based Q&A (RAG)',
    subtitle: 'Grounded Retrieval-Augmented Generation',
    category: 'AI Intelligence',
    tagline: 'Eliminate hallucinations by anchoring answers strictly to your uploaded lecture notes.',
    bullets: [
      'Ask questions specifically from uploaded lecture notes',
      'AI retrieves exact relevant citations before answering',
      'Drastically reduces irrelevant answers & hallucinations'
    ],
    mockupType: 'rag',
    details: {
      primaryHighlight: 'Verified semantic search with clickable citation snippets',
      metricsLabel: 'Grounding Accuracy',
      metricsValue: '99.4% Factual',
      sampleData: ['Query: "What did Professor Smith state about deadlock prevention?"', 'Source: Lecture_08_Slides.pdf (Page 14, Para 2)', 'Answer: Grounded strictly in cited lecture content']
    }
  }
];
