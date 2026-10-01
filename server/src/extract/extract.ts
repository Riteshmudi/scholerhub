import { readFile } from 'fs/promises';

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  fullText: string;
  pageCount: number;
  lowTextWarning: boolean;
}

const LOW_TEXT_THRESHOLD = 50;

export async function extractPdf(filePath: string): Promise<ExtractionResult> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // Use a no-worker setup for Node
  GlobalWorkerOptions.workerSrc = '';

  const data = await readFile(filePath);
  const loadingTask = getDocument({ data: new Uint8Array(data) } as any);
  const pdf = await loadingTask.promise;

  const pages: ExtractedPage[] = [];
  let fullText = '';
  let lowTextCount = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ')
      .trim();

    pages.push({ pageNumber: i, text: pageText });
    fullText += pageText + '\n\n';

    if (pageText.length < LOW_TEXT_THRESHOLD) {
      lowTextCount++;
    }
  }

  const lowTextWarning =
    pdf.numPages > 0 && lowTextCount / pdf.numPages > 0.7;

  return {
    pages,
    fullText: fullText.trim(),
    pageCount: pdf.numPages,
    lowTextWarning,
  };
}

export async function extractDocx(filePath: string): Promise<ExtractionResult> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;

  return {
    pages: [{ pageNumber: 1, text }],
    fullText: text,
    pageCount: 1,
    lowTextWarning: text.trim().length < LOW_TEXT_THRESHOLD,
  };
}

export async function extractTxt(filePath: string): Promise<ExtractionResult> {
  const text = await readFile(filePath, 'utf-8');
  return {
    pages: [{ pageNumber: 1, text }],
    fullText: text,
    pageCount: 1,
    lowTextWarning: text.trim().length < LOW_TEXT_THRESHOLD,
  };
}

export async function extractDocument(
  filePath: string,
  mimeType: string,
  extension: string
): Promise<ExtractionResult> {
  if (extension === '.pdf') return extractPdf(filePath);
  if (extension === '.docx') return extractDocx(filePath);
  if (extension === '.txt') return extractTxt(filePath);
  throw new Error(`Unsupported file type: ${extension}`);
}
