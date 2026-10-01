export interface FeatureItem {
  id: string;
  number: string;
  iconName: string;
  title: string;
  subtitle: string;
  category: 'Foundation' | 'AI Intelligence' | 'Assessment & Growth';
  bullets: string[];
  tagline: string;
  mockupType: 'profile' | 'upload' | 'chatbot' | 'summarizer' | 'quiz' | 'planner' | 'performance' | 'recommendations' | 'rag';
  details: {
    primaryHighlight: string;
    metricsLabel: string;
    metricsValue: string;
    sampleData: string[];
  };
}

export type PageView = 'home' | 'features' | 'how-it-works' | 'login' | 'dashboard';

export interface DashboardDocument {
  id: string;
  name: string;
  pages: number;
  size: string;
  uploadedAt: string;
  type: 'pdf' | 'docx' | 'txt' | 'img';
  summary?: string;
  status?: 'processing' | 'ready' | 'failed';
  errorMessage?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  citation?: {
    docName: string;
    page: number;
  };
}

export interface UserSession {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  token?: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: UserSession;
  code?: 'USER_NOT_FOUND' | 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'VALIDATION_ERROR' | 'SUCCESS';
}
