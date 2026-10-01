import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { answerWithRag } from '../ai/rag';
import { isGeminiConfigured } from '../ai/provider';

const router = Router();

// POST /api/chat
router.post('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const { message, conversationId, documentIds } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service is not configured. Set GEMINI_API_KEY in .env' });
    }

    const userId = req.userId!;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: { userId, title: message.slice(0, 50) },
        include: { messages: [] },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        text: message,
      },
    });

    // Build conversation history
    const history = [
      ...conversation.messages.map((m) => ({ sender: m.sender, text: m.text })),
      { sender: 'user', text: message },
    ];

    // Get AI response with RAG
    const { answer, citations } = await answerWithRag(
      userId,
      message,
      history,
      documentIds
    );

    // Save bot message
    const botMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'bot',
        text: answer,
        citationDocName: citations[0]?.docName,
        citationPage: citations[0]?.page,
      },
    });

    // Log progress event
    await prisma.progressEvent.create({
      data: { userId, eventType: 'chat_message', metadata: JSON.stringify({ conversationId: conversation.id }) },
    });

    return res.json({
      message: answer,
      messageId: botMessage.id,
      conversationId: conversation.id,
      citations,
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/chat/conversations - List user conversations
router.get('/conversations', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        messages: c.messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: m.createdAt,
          citation: m.citationDocName
            ? { docName: m.citationDocName, page: m.citationPage || 1 }
            : undefined,
        })),
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/chat/conversations/:id - Get single conversation
router.get('/conversations/:id', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    return res.json({
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.createdAt,
        citation: m.citationDocName
          ? { docName: m.citationDocName, page: m.citationPage || 1 }
          : undefined,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
