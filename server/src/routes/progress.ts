import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/progress - Get real progress data from database
router.get('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const userId = req.userId!;

    const [documents, quizzes, quizAttempts, studyPlans, notes, progressEvents] = await Promise.all([
      prisma.document.count({ where: { userId } }),
      prisma.quiz.count({ where: { userId } }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studyPlan.count({ where: { userId } }),
      prisma.note.count({ where: { userId } }),
      prisma.progressEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const readyDocs = await prisma.document.count({
      where: { userId, status: 'ready' },
    });

    // Calculate average quiz score
    const avgScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
      : 0;

    // Calculate study streak from progress events
    const eventDates = new Set(
      progressEvents.map((e) => e.createdAt.toISOString().split('T')[0])
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (eventDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Subject-wise performance from quiz attempts
    const quizScoresByTopic = await prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: true },
      orderBy: { createdAt: 'desc' },
    });

    const topicMap = new Map<string, { scores: number[]; attempts: number }>();
    for (const attempt of quizScoresByTopic) {
      const topic = attempt.quiz.topic || 'General';
      const existing = topicMap.get(topic) || { scores: [], attempts: 0 };
      existing.scores.push(attempt.score);
      existing.attempts++;
      topicMap.set(topic, existing);
    }

    const subjectPerformance = Array.from(topicMap.entries()).map(([topic, data]) => ({
      subject: topic,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      attempts: data.attempts,
    }));

    return res.json({
      stats: {
        documentsUploaded: documents,
        documentsReady: readyDocs,
        quizzesGenerated: quizzes,
        quizAttempts: quizAttempts.length,
        studyPlans,
        notes,
        averageQuizScore: Math.round(avgScore * 10) / 10,
        studyStreak: streak,
      },
      subjectPerformance,
      recentActivity: progressEvents.slice(0, 10).map((e) => ({
        eventType: e.eventType,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
        timestamp: e.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
