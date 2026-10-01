import { generateText } from './provider';

export interface NoteData {
  title: string;
  headings: string[];
  bulletPoints: string[];
  keyConcepts: string[];
  revisionPoints: string[];
  content: string;
}

export async function generateNotes(
  topic: string,
  documentContext?: string
): Promise<NoteData> {
  const contextPart = documentContext
    ? `\n\nUse the following document content as the primary source:\n${documentContext.slice(0, 8000)}`
    : '';

  const prompt = `Generate comprehensive study notes about "${topic}".${contextPart}

Return a JSON object with:
{
  "title": "Note title",
  "headings": ["Section heading 1", "Section heading 2"],
  "bulletPoints": ["Key point 1", "Key point 2"],
  "keyConcepts": ["Concept 1", "Concept 2"],
  "revisionPoints": ["Review point 1", "Review point 2"]
}`;

  const raw = await generateText(prompt, 'You are an expert academic note generator. Always respond with valid JSON.');

  try {
    const parsed = JSON.parse(raw);
    const noteData: NoteData = {
      title: parsed.title || `Notes on ${topic}`,
      headings: Array.isArray(parsed.headings) ? parsed.headings : [],
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : [],
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      revisionPoints: Array.isArray(parsed.revisionPoints) ? parsed.revisionPoints : [],
      content: '',
    };
    noteData.content = formatNoteContent(noteData);
    return noteData;
  } catch {
    return {
      title: `Notes on ${topic}`,
      headings: [],
      bulletPoints: [],
      keyConcepts: [],
      revisionPoints: [],
      content: raw,
    };
  }
}

function formatNoteContent(note: NoteData): string {
  const sections: string[] = [];
  if (note.headings.length) {
    sections.push('## Sections\n' + note.headings.map(h => `- ${h}`).join('\n'));
  }
  if (note.bulletPoints.length) {
    sections.push('## Key Points\n' + note.bulletPoints.map(b => `- ${b}`).join('\n'));
  }
  if (note.keyConcepts.length) {
    sections.push('## Key Concepts\n' + note.keyConcepts.map(c => `- ${c}`).join('\n'));
  }
  if (note.revisionPoints.length) {
    sections.push('## Revision Points\n' + note.revisionPoints.map(r => `- ${r}`).join('\n'));
  }
  return sections.join('\n\n');
}
