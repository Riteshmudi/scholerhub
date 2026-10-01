import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { generateNotes } from '../ai/notes';
import { isGeminiConfigured } from '../ai/provider';

const router = Router();

// POST /api/notes - Generate notes
router.post('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const { topic, documentId } = req.body;

    if (!topic && !documentId) {
      return res.status(400).json({ error: 'Either a topic or document ID is required.' });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service is not configured. Set GEMINI_API_KEY in .env' });
    }

    let documentContext = '';
    let noteTopic = topic || 'Uploaded Document';
    let docName: string | undefined;

    if (documentId) {
      const doc = await prisma.document.findFirst({
        where: { id: documentId, userId: req.userId },
        select: { originalName: true, extractedText: true },
      });
      if (!doc) {
        return res.status(404).json({ error: 'Document not found.' });
      }
      documentContext = doc.extractedText || '';
      noteTopic = topic || doc.originalName;
      docName = doc.originalName;
    }

    const noteData = await generateNotes(noteTopic, documentContext);

    const note = await prisma.note.create({
      data: {
        userId: req.userId!,
        title: noteData.title,
        content: noteData.content,
        source: docName || noteTopic,
        documentId: documentId || null,
      },
    });

    await prisma.progressEvent.create({
      data: { userId: req.userId!, eventType: 'note_generated', metadata: JSON.stringify({ noteId: note.id }) },
    });

    return res.status(201).json({
      id: note.id,
      title: noteData.title,
      headings: noteData.headings,
      bulletPoints: noteData.bulletPoints,
      keyConcepts: noteData.keyConcepts,
      revisionPoints: noteData.revisionPoints,
      content: noteData.content,
      source: note.source,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/notes - List user notes
router.get('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      notes: notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        source: n.source,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    await prisma.note.delete({ where: { id: note.id } });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
