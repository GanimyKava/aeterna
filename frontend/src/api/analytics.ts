import { apiClient } from "./client";

export type PersonaKey = "priya" | "jax" | "lena" | "mike" | "amara" | "kabir" | string;

export type ChatAttachment = {
  type: string;
  title?: string;
  media?: string;
  url?: string;
  cta?: string;
  payload?: unknown;
};

export type ChatMessage = {
  role: string;
  content: string;
  attachments?: ChatAttachment[];
};

export type ChatResponse = {
  persona: PersonaKey;
  messages: ChatMessage[];
  metadata?: {
    sessionId?: string;
    user?: Record<string, unknown> | null;
    maas?: Record<string, unknown>;
  };
};

export type ChatRequest = {
  persona: PersonaKey;
  prompt: string;
  sessionId?: string;
  language?: string;
  context?: Record<string, unknown>;
};

export async function sendAnalyticsPrompt(
  payload: ChatRequest,
  token?: string,
): Promise<ChatResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }

  const response = await apiClient.post<ChatResponse>("/analytics-chat", payload, { headers });
  return response.data;
}

