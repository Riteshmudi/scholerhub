const API_BASE = '/api';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({ error: 'Network error' }));

    if (!response.ok) {
      const message = data.error || data.message || `Request failed (${response.status})`;
      throw new ApiError(message, response.status);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError) {
      throw new ApiError('Cannot connect to the server. Is the backend running on port 4000?', 0);
    }
    throw err;
  }
}

// ===== Auth API =====
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: { id: string; name: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ user: { id: string; name: string; email: string } }>('/auth/me'),

  health: () =>
    request<{ status: string; geminiConfigured: boolean }>('/health'),
};

// ===== Documents API =====
export interface ApiDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  size: string;
  pages: number;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'failed';
  summary: string;
  errorMessage: string;
}

export const documentsApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ id: string; name: string; status: string; message: string }>('/documents', {
      method: 'POST',
      body: formData,
    });
  },

  list: () =>
    request<{ documents: ApiDocument[] }>('/documents'),

  get: (id: string) =>
    request<{
      id: string;
      name: string;
      type: string;
      size: string;
      pages: number;
      status: string;
      summary: string;
      detailedSummary: string;
      keyTopics: string[];
      errorMessage: string;
      uploadedAt: string;
    }>(`/documents/${id}`),

  delete: (id: string) =>
    request<{ success: boolean }>(`/documents/${id}`, { method: 'DELETE' }),

  summarize: (id: string) =>
    request<{ summary: string; detailedSummary: string; keyTopics: string[]; importantPoints: string[] }>(
      `/documents/${id}/summarize`,
      { method: 'POST' }
    ),
};

// ===== Chat API =====
export interface ApiChatResponse {
  message: string;
  messageId: string;
  conversationId: string;
  citations: { docName: string; page: number }[];
}

export const chatApi = {
  send: (message: string, conversationId?: string, documentIds?: string[]) =>
    request<ApiChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, documentIds }),
    }),

  conversations: () =>
    request<{
      conversations: {
        id: string;
        title: string;
        messages: {
          id: string;
          sender: string;
          text: string;
          timestamp: string;
          citation?: { docName: string; page: number };
        }[];
      }[];
    }>('/chat/conversations'),
};

// ===== Quiz API =====
export interface ApiQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ApiQuiz {
  id: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: ApiQuizQuestion[];
}

export const quizApi = {
  generate: (topic: string, numQuestions: number, difficulty: string, documentIds?: string[]) =>
    request<ApiQuiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ topic, numQuestions, difficulty, documentIds }),
    }),

  list: () =>
    request<{
      quizzes: {
        id: string;
        title: string;
        topic: string;
        difficulty: string;
        questionCount: number;
        attempts: { id: string; score: number; totalQuestions: number; createdAt: string }[];
        createdAt: string;
      }[];
    }>('/quizzes'),

  get: (id: string) =>
    request<ApiQuiz>(`/quizzes/${id}`),

  submit: (quizId: string, answers: { questionId: string; selectedAnswer: number }[]) =>
    request<{
      attemptId: string;
      score: number;
      correctCount: number;
      totalQuestions: number;
      results: {
        questionId: string;
        question: string;
        options: string[];
        correctAnswer: number;
        selectedAnswer: number | null;
        isCorrect: boolean;
        explanation: string;
      }[];
    }>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

// ===== Planner API =====
export interface ApiStudyPlanDay {
  day: string;
  topic: string;
  duration: string;
  status: string;
}

export const plannerApi = {
  generate: (params: {
    subjects: string[];
    examDate?: string;
    availableHours?: number;
    preferredTime?: string;
    difficulty?: string;
  }) =>
    request<{ id: string; title: string; days: ApiStudyPlanDay[] }>('/planner', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  list: () =>
    request<{
      plans: {
        id: string;
        title: string;
        examDate: string | null;
        days: ApiStudyPlanDay[];
        createdAt: string;
      }[];
    }>('/planner'),
};

// ===== Progress API =====
export const progressApi = {
  get: () =>
    request<{
      stats: {
        documentsUploaded: number;
        documentsReady: number;
        quizzesGenerated: number;
        quizAttempts: number;
        studyPlans: number;
        notes: number;
        averageQuizScore: number;
        studyStreak: number;
      };
      subjectPerformance: { subject: string; avgScore: number; attempts: number }[];
      recentActivity: { eventType: string; metadata: any; timestamp: string }[];
    }>('/progress'),
};

// ===== Recommendations API =====
export const recommendationsApi = {
  get: () =>
    request<{
      recommendations: {
        type: string;
        priority: string;
        title: string;
        description: string;
        action: string;
        docId?: string;
      }[];
    }>('/recommendations'),
};

// ===== Notes API =====
export const notesApi = {
  generate: (topic: string, documentId?: string) =>
    request<{
      id: string;
      title: string;
      headings: string[];
      bulletPoints: string[];
      keyConcepts: string[];
      revisionPoints: string[];
      content: string;
      source: string;
    }>('/notes', {
      method: 'POST',
      body: JSON.stringify({ topic, documentId }),
    }),

  list: () =>
    request<{
      notes: { id: string; title: string; content: string; source: string; createdAt: string }[];
    }>('/notes'),

  delete: (id: string) =>
    request<{ success: boolean }>(`/notes/${id}`, { method: 'DELETE' }),
};
