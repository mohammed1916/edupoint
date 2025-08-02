export interface GemmaMessage {
  role: "system" | "user";
  content: { type: "text" | "image"; text?: string; url?: string }[];
}

export type GemmaProvider = "gemini" | "ollama";

export async function fetchGemmaResult(messages: GemmaMessage[], provider: GemmaProvider = "ollama") {
  const res = await fetch("http://localhost:8000/api/gemma", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, provider }),
  });
  const data = await res.json();
  return data.result as string;
}
