import { AIMessage } from '../types/aiAssistant';

const STORAGE_KEY_API = 'VRM_GEMINI_API_KEY';
const STORAGE_KEY_MODEL = 'VRM_GEMINI_MODEL';
export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
export const DEFAULT_GEMINI_API_KEY = 'AQ.Ab8RN6KzOa0l2amq0YqGDvNWJmZ3zXP3KXlfp5HQcwPmOvQzSQ';

export interface GeminiModelInfo {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
}

export function getStoredGeminiApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_API_KEY;
  const stored = localStorage.getItem(STORAGE_KEY_API);
  if (stored && stored.trim()) return stored.trim();
  // Check env variable
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
  } catch {
    // fallback
  }
  return DEFAULT_GEMINI_API_KEY;
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
  const stored = localStorage.getItem(STORAGE_KEY_MODEL);
  // Migrate deprecated models
  if (stored && (stored.includes('2.0-flash') || stored.includes('1.5-flash') || stored.includes('2.5-flash'))) {
    localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_GEMINI_MODEL);
    return DEFAULT_GEMINI_MODEL;
  }
  if (stored && stored.trim()) return stored.trim();
  try {
    const envModel = (import.meta as any).env?.VITE_GEMINI_MODEL;
    if (envModel && envModel.trim()) return envModel.trim();
  } catch {
    // fallback
  }
  return DEFAULT_GEMINI_MODEL;
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
    payrollRecords?: any[];
    departments?: any[];
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

  let model = overrideModel || getStoredGeminiModel() || DEFAULT_GEMINI_MODEL;
  if (model.includes('2.0-flash') || model.includes('1.5-flash') || model.includes('2.5-flash')) {
    model = DEFAULT_GEMINI_MODEL;
  }

  // Build condensed HRMS context for prompt injection
  const today = new Date().toISOString().split('T')[0];

  const condensedEmployees = (hrmsContext.employees || []).slice(0, 50).map(e => 
    `• [${e.employeeId}] ${e.firstName} ${e.lastName} | Dept: ${e.department || 'N/A'} | Desig: ${e.designation || 'N/A'} | Status: ${e.status || 'Active'} | Phone: ${e.phone || 'N/A'} | Email: ${e.email || 'N/A'} | Joining Date: ${e.joiningDate || 'N/A'}`
  ).join('\n') || 'None recorded';

  const condensedAttendance = (hrmsContext.attendanceRecords || []).slice(0, 20).map(a => 
    `• [${a.employeeId}] ${a.employeeName} (${a.department || 'N/A'}): Status ${a.status}, Check-in ${a.checkIn || 'None'}, Check-out ${a.checkOut || 'None'}, Date: ${a.date}`
  ).join('\n') || 'No attendance punches recorded yet for today.';

  const condensedLeaves = (hrmsContext.leaveRequests || []).slice(0, 15).map(l => 
    `• [${l.employeeId}] ${l.employeeName} (${l.department || 'N/A'}): ${l.leaveType}, ${l.startDate} to ${l.endDate}, Status: ${l.status}, Reason: "${l.reason}"`
  ).join('\n') || 'No leave requests recorded.';

  const condensedTasks = (hrmsContext.enhancedTasks || []).slice(0, 15).map(t => 
    `• [${t.taskNumber || t.id}] ${t.title} (Resp: ${t.responsiblePersonName || t.responsiblePersonId || 'N/A'}, Dept: ${t.department || 'N/A'}): Priority ${t.priority}, Due: ${t.dueDate}, Status: ${t.overallStatus || t.status}, Progress: ${t.overallProgress || t.progress || 0}%`
  ).join('\n') || 'No active tasks recorded.';

  const condensedPerformance = (hrmsContext.performanceScores || []).slice(0, 15).map(p => 
    `• [${p.employeeId}] ${p.employeeName} (${p.department || 'N/A'}): Score ${p.overallScore}%, Rating ${p.managerRating}/5`
  ).join('\n') || 'No performance reviews recorded.';

  const condensedPayroll = (hrmsContext.payrollRecords || []).slice(0, 15).map(p => 
    `• [${p.employeeId}] ${p.employeeName}: Gross ₹${p.grossSalary || p.totalGross || 0}, Net ₹${p.netPayable || p.totalNet || 0}, Status: ${p.status}`
  ).join('\n') || 'Standard corporate payroll policy active.';

  const condensedDepts = (hrmsContext.departments || []).map(d => 
    `• ${d.name} (Head: ${d.headName || 'Not assigned'})`
  ).join('\n') || 'Engineering, HR, Management, Field Operations';

  const systemInstruction = `You are the executive VRM Enterprise HRM AI Assistant (Seri HR Copilot), serving directly the CEO (Super Admin) and HR Management of VRM Structures Pvt. Ltd.
Today's date is: ${today}.
Current Logged-in Executive Role: ${hrmsContext.userRole}.

EXECUTIVE CAPABILITIES & RULES:
1. Native Multilingual Intelligence:
   - Understand and answer fluently in Tamil, Tanglish (Tamil written in English letters, e.g. "Inniku yaru present?", "Leave request status enna?"), Hindi, Hinglish, English, Malayalam, Telugu, Kannada, or any language requested.
   - Always respond in the SAME language and conversational tone used by the user. If they speak Tanglish, reply warmly and helpfully in Tanglish/Tamil. If English, reply in English.
2. Grounded Truth on Live System Data:
   - Base your answers STRICTLY on the authorized live HRMS data provided below.
   - Always quote real employee names, actual IDs, and live attendance/task/payroll numbers.
   - Do NOT invent or hallucinate fake employees.
3. Executive Polish:
   - Provide crisp, clear, informative answers with warm professional courtesy. Use bullet points or summary highlights for easy reading.

AUTHORIZED LIVE HRMS DATA FOR CEO & HR LEADERSHIP:
--- COMPANY ROSTER & EMPLOYEES ---
${condensedEmployees}

--- TODAY'S LIVE ATTENDANCE & PUNCHES ---
${condensedAttendance}

--- LEAVE REQUESTS & STATUS ---
${condensedLeaves}

--- TASKS & OPERATIONAL MILESTONES ---
${condensedTasks}

--- PERFORMANCE & RATINGS ---
${condensedPerformance}

--- PAYROLL & DISBURSEMENTS ---
${condensedPayroll}

--- DEPARTMENTS ---
${condensedDepts}
`;

  // Format past messages for multi-turn conversational context
  const previousTurns = (chatHistory || [])
    .filter(msg => msg.text && msg.text.trim())
    .slice(-4)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

  const contents = [
    ...previousTurns,
    {
      role: 'user',
      parts: [
        { text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }
      ]
    }
  ];

  const executeApiCall = async (targetModel: string) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error?.message || `Gemini API error: ${response.status}`);
    }

    const resultData = await response.json();
    return resultData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

  try {
    const textOutput = await executeApiCall(model);
    return {
      text: textOutput.trim(),
      modelUsed: model
    };
  } catch (err: any) {
    // If primary model failed and it wasn't gemini-flash-latest, retry with gemini-flash-latest
    if (model !== 'gemini-flash-latest') {
      try {
        const fallbackOutput = await executeApiCall('gemini-flash-latest');
        return {
          text: fallbackOutput.trim(),
          modelUsed: 'gemini-flash-latest'
        };
      } catch {
        throw err;
      }
    }
    throw err;
  }
}
