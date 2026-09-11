import { AIMessage } from '../types/aiAssistant';

const STORAGE_KEY_API = 'VRM_GEMINI_API_KEY';
const STORAGE_KEY_MODEL = 'VRM_GEMINI_MODEL';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

export interface GeminiModelInfo {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
}

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(STORAGE_KEY_API);
  if (stored) return stored.trim();
  // Check env variable
  try {
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  } catch {
    return '';
  }
}

export function setStoredGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key) {
    localStorage.removeItem(STORAGE_KEY_API);
  } else {
    localStorage.setItem(STORAGE_KEY_API, key.trim());
  }
}

export function getStoredGeminiModel(): string {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_MODEL;
  return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_GEMINI_MODEL;
}

export function setStoredGeminiModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

/**
 * Lists available models from the Gemini API using the models.list endpoint:
 * https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY
 */
export async function listGeminiModels(apiKey: string): Promise<GeminiModelInfo[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) throw new Error('API key is required.');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch models: HTTP ${res.status}`);
  }

  const data = await res.json();
  const models: GeminiModelInfo[] = (data.models || [])
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => ({
      name: m.name.replace(/^models\//, ''),
      displayName: m.displayName || m.name,
      description: m.description || '',
      supportedGenerationMethods: m.supportedGenerationMethods || []
    }));

  return models;
}

/**
 * Validates the Gemini API Key by calling models.list
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const models = await listGeminiModels(apiKey);
    return models.length > 0;
  } catch (e) {
    console.warn('Gemini validation failed:', e);
    return false;
  }
}

/**
 * Calls Gemini generateContent with live HRMS Context & Multilingual Instructions
 */
export async function callGeminiGenerateContent(
  userPrompt: string,
  hrmsContext: {
    employees: any[];
    leaveRequests: any[];
    attendanceRecords: any[];
    enhancedTasks: any[];
    performanceScores: any[];
    userRole: string;
  },
  userLanguageHint: string,
  chatHistory: AIMessage[],
  overrideKey?: string,
  overrideModel?: string
): Promise<{ text: string; intent?: string; modelUsed: string }> {
  const apiKey = overrideKey || getStoredGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const model = overrideModel || getStoredGeminiModel() || DEFAULT_GEMINI_MODEL;

  // Build condensed HRMS context for prompt injection
  const today = new Date().toISOString().split('T')[0];
  const condensedLeaves = hrmsContext.leaveRequests.slice(0, 10).map(l => 
    `• [${l.employeeId}] ${l.employeeName} (${l.department}): ${l.leaveType}, ${l.startDate} to ${l.endDate}, Status: ${l.status}, Reason: "${l.reason}"`
  ).join('\n');

  const condensedAttendance = hrmsContext.attendanceRecords.slice(0, 10).map(a => 
    `• [${a.employeeId}] ${a.employeeName} (${a.department}): Status ${a.status}, Check-in ${a.checkIn || 'None'}, Date: ${a.date}`
  ).join('\n');

  const condensedTasks = hrmsContext.enhancedTasks.slice(0, 8).map(t => 
    `• [${t.taskNumber}] ${t.title} (Resp: ${t.responsiblePersonName}, Dept: ${t.department}): Priority ${t.priority}, Due: ${t.dueDate}, Status: ${t.overallStatus}, Progress: ${t.overallProgress}%`
  ).join('\n');

  const condensedPerformance = hrmsContext.performanceScores.slice(0, 8).map(p => 
    `• [${p.employeeId}] ${p.employeeName} (${p.department}): Score ${p.overallScore}%, Rating ${p.managerRating}/5`
  ).join('\n');

  const systemInstruction = `You are VRM Enterprise AI HRMS Assistant.
You possess native multilingual capabilities in ANY language, including Tamil, Tanglish (Tamil in English letters), Hindi, Hinglish, Telugu, Malayalam, Kannada, Arabic, French, German, Spanish, Japanese, etc.
Today's date is: ${today}.
Current Logged-in User Role: ${hrmsContext.userRole}.

CRITICAL RULES:
1. ALWAYS respond in the SAME language/dialect used by the user by default (e.g. if user asks in Tanglish "Nethu yaru leave?", reply warmly in Tamil/Tanglish; if in Hindi/Hinglish "Kal kaun leave pe tha?", reply in Hindi/Hinglish; if in English, reply in English).
2. NEVER translate or modify database entity values: Employee Names (e.g. "Robert Chen", "Priya Natarajan"), Employee IDs (e.g. "EMP-001"), Dates, Task Numbers ("TSK-001"), or Currency (₹). Only translate surrounding framing and conversational explanations.
3. Base your answers STRICTLY on the authorized live HRMS data provided below. Do NOT hallucinate employees.

AUTHORIZED LIVE HRMS DATA:
--- RECENT LEAVE REQUESTS ---
${condensedLeaves}

--- TODAY'S ATTENDANCE PUNCHES ---
${condensedAttendance}

--- CURRENT TASKS & DEADLINES ---
${condensedTasks}

--- PERFORMANCE & KPI SCORES ---
${condensedPerformance}
`;

  // Format past 4 messages for multi-turn conversational context
  const contents = [
    {
      role: 'user',
      parts: [
        { text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }
      ]
    }
  ];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      }
    })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Gemini API error: ${response.status}`);
  }

  const resultData = await response.json();
  const textOutput = resultData.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    text: textOutput.trim(),
    modelUsed: model
  };
}
