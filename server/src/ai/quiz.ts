import { generateJson } from './provider';

export interface QuizQuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestionData[];
}

export async function generateQuiz(
  topic: string,
  numQuestions: number,
  difficulty: string,
  documentContext?: string
): Promise<QuizData> {
  const contextPart = documentContext
    ? `\n\nUse the following document content as the basis for questions:\n${documentContext.slice(0, 8000)}`
    : '';

  const prompt = `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.${contextPart}

Return a JSON object with this exact structure:
{
  "title": "Quiz title about the topic",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why the correct answer is correct"
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the 0-based index of the correct option
- Include an explanation for each question
- Make questions educationally sound`;

  const result = await generateJson<QuizData>(prompt, 'You are an expert quiz generator for educational purposes.');

  if (!result.questions || !Array.isArray(result.questions)) {
    throw new Error('AI returned malformed quiz data.');
  }

  for (const q of result.questions) {
    if (!q.question || !Array.isArray(q.options) || q.options.length < 2 ||
        typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      throw new Error('AI returned invalid quiz question structure.');
    }
  }

  return result;
}
