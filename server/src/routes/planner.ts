import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { generateStudyPlan } from '../ai/planner';
import { isGeminiConfigured } from '../ai/provider';

const router = Router();

// POST /api/planner - Generate a study plan
router.post('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const { subjects, examDate, availableHours, preferredTime, difficulty } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'At least one subject is required.' });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service is not configured. Set GEMINI_API_KEY in .env' });
    }

    const planData = await generateStudyPlan({
      subjects,
      examDate,
      availableHours,
      preferredTime,
      difficulty,
    });

    const plan = await prisma.studyPlan.create({
      data: {
        userId: req.userId!,
        title: planData.title,
        examDate: examDate ? new Date(examDate) : null,
        planData: JSON.stringify(planData.days),
      },
    });

    await prisma.progressEvent.create({
      data: { userId: req.userId!, eventType: 'study_plan_created', metadata: JSON.stringify({ planId: plan.id }) },
    });

    return res.status(201).json({
      id: plan.id,
      title: planData.title,
      days: planData.days,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/planner - List user study plans
router.get('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const plans = await prisma.studyPlan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      plans: plans.map((p) => ({
        id: p.id,
        title: p.title,
        examDate: p.examDate,
        days: JSON.parse(p.planData),
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/planner/:id - Get single study plan
router.get('/:id', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const plan = await prisma.studyPlan.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Study plan not found.' });
    }

    return res.json({
      id: plan.id,
      title: plan.title,
      examDate: plan.examDate,
      days: JSON.parse(plan.planData),
      createdAt: plan.createdAt,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
