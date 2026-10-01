import { generateText } from './provider';

export interface SummaryResult {
  concise: string;
  detailed: string;
  keyTopics: string[];
  importantPoints: string[];
}

const MAX_CHUNK_SIZE = 12000;

export function chunkText(text: string, maxChunkSize = MAX_CHUNK_SIZE): string[] {
  if (text.length <= maxChunkSize) return [text];
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';

  for (const para of paragraphs) {
    if ((current + para).length > maxChunkSize) {
      if (current) chunks.push(current.trim());
      if (para.length > maxChunkSize) {
        const sentences = para.split(/(?<=[.!?])\s+/);
        current = '';
        for (const sent of sentences) {
          if ((current + sent).length > maxChunkSize) {
            if (current) chunks.push(current.trim());
            current = sent;
          } else {
            current += ' ' + sent;
          }
        }
      } else {
        current = para;
      }
    } else {
      current += '\n\n' + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function summarizeDocument(extractedText: string): Promise<SummaryResult> {
  const chunks = chunkText(extractedText);

  if (chunks.length === 1) {
    return summarizeSingleChunk(chunks[0]);
  }

  const chunkSummaries: string[] = [];
  for (const chunk of chunks) {
    const summary = await generateText(
      `Summarize the following document section concisely, capturing key concepts, definitions, and important points:\n\n${chunk}`,
      'You are an expert academic assistant. Provide clear, accurate summaries.'
    );
    chunkSummaries.push(summary);
  }

  const combined = chunkSummaries.join('\n\n---\n\n');
  return summarizeSingleChunk(combined, true);
}

async function summarizeSingleChunk(text: string, isCombined = false): Promise<SummaryResult> {
  const prompt = isCombined
    ? `The following are summaries of different sections of a document. Create a final comprehensive summary.\n\nSection summaries:\n${text}\n\nReturn a JSON object with:\n- "concise": a 2-3 sentence summary\n- "detailed": a detailed multi-paragraph summary\n- "keyTopics": array of key topic strings\n- "importantPoints": array of important point strings`
    : `Analyze the following document content and create a comprehensive summary.\n\nDocument content:\n${text}\n\nReturn a JSON object with:\n- "concise": a 2-3 sentence summary\n- "detailed": a detailed multi-paragraph summary\n- "keyTopics": array of key topic strings\n- "importantPoints": array of important point strings`;

  const raw = await generateText(prompt, 'You are an expert academic assistant. Always respond with valid JSON.');
  try {
    const parsed = JSON.parse(raw);
    return {
      concise: parsed.concise || '',
      detailed: parsed.detailed || '',
      keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
      importantPoints: Array.isArray(parsed.importantPoints) ? parsed.importantPoints : [],
    };
  } catch {
    return {
      concise: raw.slice(0, 300),
      detailed: raw,
      keyTopics: [],
      importantPoints: [],
    };
  }
}
