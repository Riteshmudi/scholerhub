import { generateJson } from './provider';

export interface StudyPlanDay {
  day: string;
  topic: string;
  duration: string;
  status: string;
}

export interface StudyPlanData {
  title: string;
  days: StudyPlanDay[];
}

export async function generateStudyPlan(params: {
  subjects: string[];
  examDate?: string;
  availableHours?: number;
  preferredTime?: string;
  difficulty?: string;
}): Promise<StudyPlanData> {
  const { subjects, examDate, availableHours, preferredTime, difficulty } = params;

  const prompt = `Create a personalized study plan with these parameters:
- Subjects: ${subjects.join(', ')}
- Exam date: ${examDate || 'not specified'}
- Available study hours per day: ${availableHours || 2}
- Preferred study time: ${preferredTime || 'flexible'}
- Difficulty/priority: ${difficulty || 'balanced'}

Return a JSON object with this structure:
{
  "title": "Study plan title",
  "days": [
    {
      "day": "Day 1 (date)",
      "topic": "What to study",
      "duration": "estimated time",
      "status": "Scheduled"
    }
  ]
}

Create a realistic schedule covering all subjects. Include 5-7 days.`;

  const result = await generateJson<StudyPlanData>(prompt, 'You are an expert study planner.');

  if (!result.days || !Array.isArray(result.days)) {
    throw new Error('AI returned malformed study plan data.');
  }

  return result;
}
