import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { generateQuiz } from '../ai/quiz';
import { isGeminiConfigured } from '../ai/provider';

const router = Router();

// POST /api/quizzes - Generate a quiz
router.post('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const { topic, numQuestions, difficulty, documentIds } = req.body;

    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service is not configured. Set GEMINI_API_KEY in .env' });
    }

    const quizTopic = topic || 'General Study Material';
    const count = Math.min(Math.max(numQuestions || 5, 1), 20);
    const diff = difficulty || 'medium';

    // Get document context if specified
    let documentContext = '';
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      const docs = await prisma.document.findMany({
        where: { id: { in: documentIds }, userId: req.userId, status: 'ready' },
        select: { extractedText: true },
      });
      documentContext = docs.map((d) => d.extractedText).filter(Boolean).join('\n\n').slice(0, 8000);
    }

    const quizData = await generateQuiz(quizTopic, count, diff, documentContext);

    const quiz = await prisma.quiz.create({
      data: {
        userId: req.userId!,
        title: quizData.title,
        topic: quizTopic,
        difficulty: diff,
        questions: {
          create: quizData.questions.map((q) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
          })),
        },
      },
      include: { questions: true },
    });

    await prisma.progressEvent.create({
      data: { userId: req.userId!, eventType: 'quiz_generated', metadata: JSON.stringify({ quizId: quiz.id }) },
    });

    return res.status(201).json({
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/quizzes - List user quizzes
router.get('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: true,
        attempts: { orderBy: { createdAt: 'desc' } },
      },
    });

    return res.json({
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        topic: q.topic,
        difficulty: q.difficulty,
        questionCount: q.questions.length,
        attempts: q.attempts.map((a) => ({
          id: a.id,
          score: a.score,
          totalQuestions: a.totalQuestions,
          createdAt: a.createdAt,
        })),
        createdAt: q.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/quizzes/:id - Get quiz with questions
router.get('/:id', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    return res.json({
      id: quiz.id,
      title: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/quizzes/:id/attempts - Submit quiz attempt
router.post('/:id/attempts', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const { answers } = req.body; // array of { questionId, selectedAnswer }

    const quiz = await prisma.quiz.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { questions: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    let correctCount = 0;
    const answerMap = new Map(
      (answers || []).map((a: any) => [a.questionId, a.selectedAnswer])
    );

    for (const q of quiz.questions) {
      const selected = answerMap.get(q.id);
      if (selected === q.correctAnswer) {
        correctCount++;
      }
    }

    const score = quiz.questions.length > 0
      ? (correctCount / quiz.questions.length) * 100
      : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: req.userId!,
        answers: JSON.stringify(answers || []),
        score,
        totalQuestions: quiz.questions.length,
      },
    });

    await prisma.progressEvent.create({
      data: {
        userId: req.userId!,
        eventType: 'quiz_attempt',
        metadata: JSON.stringify({ quizId: quiz.id, score, correctCount, total: quiz.questions.length }),
      },
    });

    // Return results with correct answers
    return res.json({
      attemptId: attempt.id,
      score,
      correctCount,
      totalQuestions: quiz.questions.length,
      results: quiz.questions.map((q) => ({
        questionId: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
        selectedAnswer: answerMap.get(q.id) ?? null,
        isCorrect: answerMap.get(q.id) === q.correctAnswer,
        explanation: q.explanation,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
