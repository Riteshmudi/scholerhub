import { Router, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import prisma from '../lib/prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { extractDocument } from '../extract/extract';
import { summarizeDocument } from '../ai/summary';
import { chunkText } from '../ai/summary';
import { isGeminiConfigured } from '../ai/provider';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// POST /api/documents - Upload and process
router.post('/', requireAuth, upload.single('file'), async (req: AuthedRequest, res: Response, next: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.userId!;

    // Create document record with processing status
    const doc = await prisma.document.create({
      data: {
        userId,
        name: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'processing',
      },
    });

    // Process asynchronously
    processDocument(doc.id, file.path, ext).catch((err) => {
      console.error(`[Document ${doc.id}] Processing failed:`, err.message);
    });

    return res.status(201).json({
      id: doc.id,
      name: doc.originalName,
      status: 'processing',
      message: 'Document uploaded. Processing has started.',
    });
  } catch (err) {
    return next(err);
  }
});

async function processDocument(docId: string, filePath: string, ext: string) {
  try {
    // 1. Extract text
    const extraction = await extractDocument(filePath, '', ext);

    if (extraction.lowTextWarning) {
      await prisma.document.update({
        where: { id: docId },
        data: {
          status: 'failed',
          errorMessage: 'This document appears to be scanned or image-based. OCR support is not enabled yet.',
          pageCount: extraction.pageCount,
        },
      });
      return;
    }

    // 2. Store chunks
    const chunks = chunkText(extraction.fullText, 2000);
    for (let i = 0; i < chunks.length; i++) {
      const chunkPages = extraction.pages.filter(
        (p) => p.text.includes(chunks[i].slice(0, 50)) || chunks[i].includes(p.text.slice(0, 50))
      );
      const pageNumber = chunkPages[0]?.pageNumber || Math.floor(i / 2) + 1;
      await prisma.documentChunk.create({
        data: {
          documentId: docId,
          chunkIndex: i,
          pageNumber,
          text: chunks[i],
        },
      });
    }

    // 3. Generate summary using Gemini (if configured)
    let summary = '';
    let detailedSummary = '';
    let keyTopics = '';

    if (isGeminiConfigured()) {
      try {
        const summaryResult = await summarizeDocument(extraction.fullText);
        summary = summaryResult.concise;
        detailedSummary = summaryResult.detailed;
        keyTopics = JSON.stringify(summaryResult.keyTopics);
      } catch (aiErr) {
        console.error(`[Document ${docId}] AI summarization failed:`, (aiErr as Error).message);
        // Continue without summary - text extraction still succeeded
      }
    }

    // 4. Update document as ready
    await prisma.document.update({
      where: { id: docId },
      data: {
        status: 'ready',
        pageCount: extraction.pageCount,
        extractedText: extraction.fullText.slice(0, 50000),
        summary,
        detailedSummary,
        keyTopics,
      },
    });

    // 5. Log progress event
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (doc) {
      await prisma.progressEvent.create({
        data: { userId: doc.userId, eventType: 'document_uploaded', metadata: JSON.stringify({ docId, docName: doc.originalName }) },
      });
    }
  } catch (err) {
    const errorMessage = (err as Error).message;
    await prisma.document.update({
      where: { id: docId },
      data: { status: 'failed', errorMessage },
    }).catch(() => {});
  }
}

// GET /api/documents - List user documents
router.get('/', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const docs = await prisma.document.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        name: true,
        mimeType: true,
        size: true,
        pageCount: true,
        status: true,
        summary: true,
        errorMessage: true,
        createdAt: true,
      },
    });

    return res.json({
      documents: docs.map((d) => ({
        id: d.id,
        name: d.originalName,
        type: d.mimeType.includes('pdf') ? 'pdf' : d.mimeType.includes('word') || d.mimeType.includes('officedocument') ? 'docx' : 'txt',
        size: `${(d.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: d.pageCount,
        uploadedAt: d.createdAt,
        status: d.status,
        summary: d.summary || '',
        errorMessage: d.errorMessage || '',
      })),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/documents/:id - Get single document with summary
router.get('/:id', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    return res.json({
      id: doc.id,
      name: doc.originalName,
      type: doc.mimeType.includes('pdf') ? 'pdf' : doc.mimeType.includes('word') || doc.mimeType.includes('officedocument') ? 'docx' : 'txt',
      size: `${(doc.size / (1024 * 1024)).toFixed(1)} MB`,
      pages: doc.pageCount,
      status: doc.status,
      summary: doc.summary || '',
      detailedSummary: doc.detailedSummary || '',
      keyTopics: doc.keyTopics ? JSON.parse(doc.keyTopics) : [],
      errorMessage: doc.errorMessage || '',
      uploadedAt: doc.createdAt,
    });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Try to delete the physical file
    const filePath = path.join(__dirname, '..', '..', 'uploads', req.userId!, doc.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({ where: { id: doc.id } });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

// POST /api/documents/:id/summarize - Re-generate summary
router.post('/:id/summarize', requireAuth, async (req: AuthedRequest, res: Response, next: any) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service is not configured. Set GEMINI_API_KEY in .env' });
    }

    if (!doc.extractedText) {
      return res.status(400).json({ error: 'Document has no extracted text to summarize.' });
    }

    const summaryResult = await summarizeDocument(doc.extractedText);

    await prisma.document.update({
      where: { id: doc.id },
      data: {
        summary: summaryResult.concise,
        detailedSummary: summaryResult.detailed,
        keyTopics: JSON.stringify(summaryResult.keyTopics),
      },
    });

    return res.json({
      summary: summaryResult.concise,
      detailedSummary: summaryResult.detailed,
      keyTopics: summaryResult.keyTopics,
      importantPoints: summaryResult.importantPoints,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
