import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/recommendations - Get real recommendations based on activity
router.get('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const userId = req.userId!;
    const recommendations: any[] = [];

    // 1. Find weak quiz topics (score < 70%)
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: true },
      orderBy: { createdAt: 'desc' },
    });

    const topicScores = new Map<string, number[]>();
    for (const attempt of quizAttempts) {
      const topic = attempt.quiz.topic || 'General';
      const scores = topicScores.get(topic) || [];
      scores.push(attempt.score);
      topicScores.set(topic, scores);
    }

    for (const [topic, scores] of topicScores) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 70) {
        recommendations.push({
          type: 'weak_topic',
          priority: 'high',
          title: `Review ${topic}`,
          description: `Your average score in ${topic} is ${avg.toFixed(1)}%. Consider reviewing this topic and retaking practice quizzes.`,
          action: 'study',
        });
      }
    }

    // 2. Find documents that are not yet summarized or reviewed
    const docs = await prisma.document.findMany({
      where: { userId, status: 'ready' },
      select: { id: true, originalName: true, summary: true, createdAt: true },
    });

    const unsummarizedDocs = docs.filter((d) => !d.summary);
    for (const doc of unsummarizedDocs.slice(0, 2)) {
      recommendations.push({
        type: 'unreviewed_doc',
        priority: 'medium',
        title: `Generate summary for ${doc.originalName}`,
        description: 'This document has been uploaded but does not have an AI summary yet.',
        action: 'summarize',
        docId: doc.id,
      });
    }

    // 3. Suggest quizzes if few attempts
    if (quizAttempts.length < 3 && docs.length > 0) {
      recommendations.push({
        type: 'practice_quiz',
        priority: 'medium',
        title: 'Take a practice quiz',
        description: 'You have uploaded documents but haven\'t taken many quizzes. Test your knowledge!',
        action: 'quiz',
      });
    }

    // 4. Suggest study plan if none exists
    const studyPlanCount = await prisma.studyPlan.count({ where: { userId } });
    if (studyPlanCount === 0) {
      recommendations.push({
        type: 'create_plan',
        priority: 'low',
        title: 'Create a study plan',
        description: 'Stay organized by creating a personalized study schedule based on your exam dates.',
        action: 'planner',
      });
    }

    // 5. Default recommendation if nothing specific
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Keep up the good work!',
        description: 'Continue studying and taking quizzes to improve your mastery.',
        action: 'study',
      });
    }

    return res.json({ recommendations });
  } catch (err) {
    return next(err);
  }
});

export default router;
