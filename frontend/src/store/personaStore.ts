import { create } from "zustand";
import { PersonaKey } from "../api/analytics";

export type PersonaDefinition = {
  key: PersonaKey;
  name: string;
  summary: string;
  tone: string;
  defaultPrompt: string;
  token: string;
  language: string;
};

const SAMPLE_PERSONAS: PersonaDefinition[] = [
  {
    key: "priya",
    name: "Priya Singh",
    summary: "Mumbai-based family explorer planning heritage journeys.",
    tone: "Empathetic, bilingual (Hindi/English)",
    defaultPrompt: "We want a dawn-friendly Uluru plan with kid-safe AR quests.",
    token: "",
    language: "en",
  },
  {
    key: "jax",
    name: "Jax Thompson",
    summary: "Sydney history buff chasing merch drops and crowd-free events.",
    tone: "Energetic, stat-rich",
    defaultPrompt: "What rare Ashes overlays and merch can I catch tonight?",
    token: "",
    language: "en",
  },
  {
    key: "lena",
    name: "Lena Kowalski",
    summary: "Anangu collaborator ensuring ethical overlays.",
    tone: "Measured, scholarly",
    defaultPrompt: "Audit tomorrow's Uluru overlays for cultural compliance.",
    token: "",
    language: "en",
  },
  {
    key: "mike",
    name: "Mike Hargreaves",
    summary: "Uluru ops lead orchestrating group logistics.",
    tone: "Direct, data-driven",
    defaultPrompt: "Forecast next week's sunrise capacity and coach staging.",
    token: "",
    language: "en",
  },
  {
    key: "amara",
    name: "Amara Singh",
    summary: "Priya's daughter seeking playful AR quests.",
    tone: "Playful, bilingual snippets",
    defaultPrompt: "Can we do a desert scavenger hunt after sunrise?",
    token: "",
    language: "en",
  },
  {
    key: "kabir",
    name: "Kabir Singh",
    summary: "Priya's son looking for fun AR companions.",
    tone: "Encouraging, simple language",
    defaultPrompt: "Show me a friendly AR animal at Uluru tonight!",
    token: "",
    language: "en",
  },
];

type PersonaState = {
  personas: PersonaDefinition[];
  currentPersona: PersonaDefinition;
  sessionId: string;
  setPersona: (key: PersonaKey) => void;
  setSessionId: (sessionId: string) => void;
  setToken: (key: PersonaKey, token: string) => void;
};

function loadInitialPersona(): PersonaDefinition {
  if (typeof window === "undefined") {
    return SAMPLE_PERSONAS[0];
  }
  const storedKey = window.localStorage.getItem("analytics.persona.key");
  const fallback = SAMPLE_PERSONAS[0];
  if (!storedKey) {
    return fallback;
  }
  return SAMPLE_PERSONAS.find((persona) => persona.key === storedKey) ?? fallback;
}

function loadSessionId(): string {
  const generateId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? () => crypto.randomUUID()
      : () => `sess-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;

  if (typeof window === "undefined") {
    return generateId();
  }
  return window.localStorage.getItem("analytics.session.id") ?? generateId();
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  personas: SAMPLE_PERSONAS,
  currentPersona: loadInitialPersona(),
  sessionId: loadSessionId(),
  setPersona: (key) => {
    const persona = get().personas.find((item) => item.key === key);
    if (!persona) {
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("analytics.persona.key", persona.key);
    }
    set({ currentPersona: persona });
  },
  setSessionId: (sessionId) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("analytics.session.id", sessionId);
    }
    set({ sessionId });
  },
  setToken: (key, token) => {
    set((state) => ({
      personas: state.personas.map((persona) =>
        persona.key === key ? { ...persona, token } : persona,
      ),
      currentPersona:
        state.currentPersona.key === key ? { ...state.currentPersona, token } : state.currentPersona,
    }));
  },
}));

