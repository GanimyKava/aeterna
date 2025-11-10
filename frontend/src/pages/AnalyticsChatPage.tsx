import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage, ChatAttachment, ChatResponse } from "../api/analytics";
import { sendAnalyticsPrompt } from "../api/analytics";
import { PersonaDefinition, usePersonaStore } from "../store/personaStore";
import styles from "./AnalyticsChatPage.module.css";

type DisplayMessage = ChatMessage & { id: string };

const SOCKET_PATH = "/analytics-socket/socket.io";

const SAMPLE_TOKENS: Record<string, string> = {
  priya:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLXByaXlhIiwicGVyc29uYSI6InByaXlhIiwibmFtZSI6IlByaXlhIFNpbmdoIiwibGFuZ3VhZ2UiOiJlbiIsInRyYWl0cyI6eyJob21lQ2l0eSI6Ik11bWJhaSIsImZhbWlseU1lbWJlcnMiOlsiQW1hcmEiLCJLYWJpciJdLCJwcmVmZXJyZWRMYW5ndWFnZXMiOlsiZW4iLCJoaSJdfSwiaWF0IjoxNzMxMTA0ODAwLCJleHAiOjIwNzk5NDg4MDB9.7JYCBQFDssElVNNxtOIioEBpSmoRpq3MOJ2YwcPdlew",
  jax: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWpheCIsInBlcnNvbmEiOiJqYXgiLCJuYW1lIjoiSmF4IFRob21wc29uIiwibGFuZ3VhZ2UiOiJlbiIsInRyYWl0cyI6eyJtZW1iZXJzaGlwVGllciI6IkxlZ2VuZHMgKyIsImNvbGxlY3RpYmxlc093bmVkIjo4fSwiaWF0IjoxNzMxMTA0ODAwLCJleHAiOjIwNzk5NDg4MDB9.3_gMZ0Na_zZVh_MiN0-sCLkHLx26E7U-Fqk2GlIOa7Q",
  lena:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWxlbmEiLCJwZXJzb25hIjoibGVuYSIsIm5hbWUiOiJMZW5hIEtvd2Fsc2tpIiwibGFuZ3VhZ2UiOiJlbiIsInRyYWl0cyI6eyJyb2xlIjoiYW50aHJvcG9sb2dpc3QiLCJyZWdpb24iOiJVbHVydSJ9LCJpYXQiOjE3MzExMDQ4MDAsImV4cCI6MjA3OTk0ODgwMH0.gIULlJesG6yFU68RfUF4sPWsJkbdGv-ffCNifbYMGWk",
  mike:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLW1pa2UiLCJwZXJzb25hIjoibWlrZSIsIm5hbWUiOiJNaWtlIEhhcmdyYXZlcyIsImxhbmd1YWdlIjoiZW4iLCJ0cmFpdHMiOnsicm9sZSI6Ik9wZXJhdGlvbnMgTWFuYWdlciIsImRhaWx5Q2FwYWNpdHkiOjUwMH0sImlhdCI6MTczMTEwNDgwMCwiZXhwIjoyMDc5OTQ4ODAwfQ.X5Sobs2TIbp9J0BZJU1hhFgge7GPHTDFRGAWraZEnww",
  amara:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWFtYXJhIiwicGVyc29uYSI6ImFtYXJhIiwibmFtZSI6IkFtYXJhIFNpbmdoIiwibGFuZ3VhZ2UiOiJlbiIsInRyYWl0cyI6eyJhZ2UiOjEwLCJnYXJkaWFuVXNlcklkIjoidXNlci1wcml5YSJ9LCJpYXQiOjE3MzExMDQ4MDAsImV4cCI6MjA3OTk0ODgwMH0.Sy4x9r-bUQcBa8DK2KX9Ul1SsrUNutgjEZ8qUJ73Uyo",
  kabir:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWthYmlyIiwicGVyc29uYSI6ImthYmlyIiwibmFtZSI6IkthYmlyIFNpbmdoIiwibGFuZ3VhZ2UiOiJlbiIsInRyYWl0cyI6eyJhZ2UiOjcsImd1YXJkaWFuVXNlcklkIjoidXNlci1wcml5YSJ9LCJpYXQiOjE3MzExMDQ4MDAsImV4cCI6MjA3OTk0ODgwMH0.K90VWFRGJWwbrS2xwYtfXMBSxgHfMxPxkc3oLOyEhK8",
};

const generateId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `msg-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;

const filterAssistantMessages = (response: ChatResponse): ChatMessage[] =>
  (response.messages ?? []).filter((message) => message.role === "assistant");

export default function AnalyticsChatPage(): JSX.Element {
  const {
    personas,
    currentPersona,
    sessionId,
    setPersona,
    setSessionId,
    setToken,
  } = usePersonaStore();

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [composerValue, setComposerValue] = useState(currentPersona.defaultPrompt);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const sessionIdRef = useRef(sessionId);
  const seenMessagesRef = useRef<Set<string>>(new Set());

  const apiBaseUrl = useMemo(() => {
    const configured = import.meta.env.VITE_SOCKET_BASE_URL ?? import.meta.env.VITE_API_BASE_URL;
    if (configured) {
      return configured.replace(/\/$/, "");
    }
    return window.location.origin.replace(/\/$/, "");
  }, []);

  const appendStatus = useCallback((line: string) => {
    setStatusLog((previous) => [...previous.slice(-10), `[${new Date().toLocaleTimeString()}] ${line}`]);
  }, []);

  const appendMessages = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) {
      return;
    }
    setMessages((prev) => {
      const updates: DisplayMessage[] = [];
      incoming.forEach((message) => {
        const signature = `${message.role}|${message.content}|${JSON.stringify(message.attachments ?? [])}`;
        if (seenMessagesRef.current.has(signature)) {
          return;
        }
        seenMessagesRef.current.add(signature);
        updates.push({ ...message, id: generateId() });
      });
      if (updates.length === 0) {
        return prev;
      }
      return [...prev, ...updates];
    });
  }, []);

  useEffect(() => {
    personas.forEach((persona) => {
      if (!persona.token && SAMPLE_TOKENS[persona.key]) {
        setToken(persona.key, SAMPLE_TOKENS[persona.key]);
      }
    });
  }, [personas, setToken]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("register_session", { sessionId });
    }
  }, [sessionId]);

  useEffect(() => {
    const socket = io(apiBaseUrl, {
      path: SOCKET_PATH,
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      appendStatus("Socket connected");
      socket.emit("register_session", { sessionId: sessionIdRef.current });
    });

    socket.on("disconnect", () => {
      appendStatus("Socket disconnected");
    });

    socket.on("analytics:status", (payload: { message?: string; sessionId?: string }) => {
      if (!payload) {
        return;
      }
      appendStatus(payload.message ?? "Status update received");
    });

    socket.on(
      "analytics:response",
      (payload: {
        persona?: string;
        messages?: ChatMessage[];
        metadata?: { sessionId?: string };
      }) => {
        if (!payload?.metadata?.sessionId) {
          return;
        }
        if (payload.metadata.sessionId !== sessionIdRef.current) {
          return;
        }
        appendMessages(payload.messages ?? []);
      },
    );

    socket.on("analytics:error", (payload: { message?: string }) => {
      appendStatus(payload?.message ?? "Socket error");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_session", { sessionId: sessionIdRef.current });
        socketRef.current.disconnect();
      }
    };
  }, [apiBaseUrl, appendMessages, appendStatus]);

  useEffect(() => {
    setComposerValue(currentPersona.defaultPrompt);
  }, [currentPersona]);

  const handlePersonaChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPersona(event.target.value);
      setMessages([]);
      seenMessagesRef.current.clear();
      appendStatus(`Switched to persona ${event.target.value}`);
    },
    [appendStatus, setPersona],
  );

  const sendPrompt = useCallback(
    async (prompt: string) => {
      const personaToken = SAMPLE_TOKENS[currentPersona.key];
      const context = {
        channel: "web-chat",
        locale: currentPersona.language,
        viewport:
          typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
            ? "mobile"
            : "desktop",
      };

      const response = await sendAnalyticsPrompt(
        {
          persona: currentPersona.key,
          prompt,
          sessionId,
          language: currentPersona.language,
          context,
        },
        personaToken,
      );

      if (response.metadata?.sessionId && response.metadata.sessionId !== sessionId) {
        setSessionId(response.metadata.sessionId);
      }

      appendMessages(filterAssistantMessages(response));
      return response;
    },
    [appendMessages, currentPersona, sessionId, setSessionId],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!composerValue.trim()) {
        return;
      }
      const prompt = composerValue.trim();
      setIsSending(true);
      setMessages((prev) => [...prev, { id: generateId(), role: "user", content: prompt }]);
      setComposerValue("");
      try {
        const response = await sendPrompt(prompt);
        appendStatus(`EchoBot responded for ${response.persona}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to send analytics prompt";
        appendStatus(message);
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content: `⚠️ Unable to fulfil request right now. ${message}`,
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [appendStatus, composerValue, sendPrompt],
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Time-Weave Analytics Companion</h1>
        <p>
          Converse with EchoBot for CAMARA-powered heritage analytics. The Time-Weave Guide blends density
          forecasts, telco readiness and AR previews into an adaptive narrative tailored to each persona.
        </p>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.personaSelect}>
            <label htmlFor="persona-select">Active Persona</label>
            <select id="persona-select" value={currentPersona.key} onChange={handlePersonaChange}>
              {personas.map((persona) => (
                <option key={persona.key} value={persona.key}>
                  {persona.name} · {persona.tone}
                </option>
              ))}
            </select>
          </div>

          <PersonaPanel persona={currentPersona} />

          <div className={styles.statusLog}>
            <strong>Realtime Status</strong>
            <br />
            {statusLog.length === 0
              ? "Awaiting events…"
              : statusLog.map((line, index) => (
                  <div key={`${line}-${index}`}>{line}</div>
                ))}
          </div>
        </aside>

        <section className={styles.chatPanel} aria-live="polite">
          <div className={styles.chatHeader}>
            <h3>EchoBot · Time-Weave Guide</h3>
            <span className={styles.statusPill}>
              Session {sessionId.slice(0, 8)}
            </span>
          </div>

          <div className={styles.messageList}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          <form className={styles.composer} onSubmit={handleSubmit}>
            <textarea
              value={composerValue}
              onChange={(event) => setComposerValue(event.target.value)}
              placeholder="Ask EchoBot anything…"
              aria-label="Analytics prompt"
            />
            <button type="submit" className={styles.sendButton} disabled={isSending}>
              {isSending ? "Streaming…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function PersonaPanel({ persona }: { persona: PersonaDefinition }): JSX.Element {
  return (
    <article className={styles.personaCard}>
      <h2>{persona.name}</h2>
      <p>{persona.summary}</p>
      <div className={styles.personaMeta}>
        <span className={styles.toneBadge}>{persona.tone}</span>
        <span>Default insight: {persona.defaultPrompt}</span>
      </div>
    </article>
  );
}

function MessageBubble({ message }: { message: DisplayMessage }): JSX.Element {
  const isUser = message.role === "user";
  return (
    <div
      className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}
      role="group"
      aria-label={isUser ? "You" : "EchoBot"}
    >
      <span>{message.content}</span>
      {message.attachments ? (
        <div className={styles.attachments}>
          {message.attachments.map((attachment, index) => (
            <AttachmentCard attachment={attachment} key={`${message.id}-att-${index}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AttachmentCard({ attachment }: { attachment: ChatAttachment }): JSX.Element {
  return (
    <div className={styles.attachmentCard}>
      <span className={styles.attachmentTitle}>
        {attachment.title ?? attachment.type}
        {attachment.cta ? <small>{attachment.cta}</small> : null}
      </span>
      <div className={styles.attachmentActions}>
        {attachment.media ? (
          <a
            href={attachment.media}
            className={styles.attachmentButton}
            target="_blank"
            rel="noreferrer"
          >
            View Media
          </a>
        ) : null}
        {attachment.url ? (
          <a href={attachment.url} className={styles.attachmentButton} target="_blank" rel="noreferrer">
            Open Link
          </a>
        ) : null}
      </div>
    </div>
  );
}

