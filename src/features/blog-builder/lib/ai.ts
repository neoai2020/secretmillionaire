const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST ?? "chatgpt-42.p.rapidapi.com";

const DEFAULT_TIMEOUT_MS = 55_000;

interface ChatResponse {
  result?: string;
  message?: string;
  response?: string;
  choices?: { message?: { content?: string } }[];
}

export interface GptCallOptions {
  maxRetries?: number;
  timeoutMs?: number;
  /** Lower = more deterministic JSON (0.2–0.4 recommended for structured output). */
  temperature?: number;
}

export function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      /* fall through */
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      /* fall through */
    }
  }

  const arrStart = trimmed.indexOf("[");
  const arrEnd = trimmed.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    try {
      return JSON.parse(trimmed.slice(arrStart, arrEnd + 1));
    } catch {
      /* fall through */
    }
  }

  return null;
}

function extractResponseText(data: ChatResponse): string {
  const text =
    data.result ||
    data.message ||
    data.response ||
    data.choices?.[0]?.message?.content ||
    "";

  return typeof text === "string" ? text : JSON.stringify(text);
}

async function callGpt4(
  messages: { role: string; content: string }[],
  options: GptCallOptions
): Promise<string> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const body: Record<string, unknown> = {
    messages,
    web_access: false,
  };

  if (typeof options.temperature === "number") {
    body.temperature = options.temperature;
  }

  const response = await fetch(`https://${RAPIDAPI_HOST}/gpt4`, {
    method: "POST",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`AI request failed: ${response.status}${detail ? ` — ${detail.slice(0, 120)}` : ""}`);
  }

  const data: ChatResponse = await response.json();
  const text = extractResponseText(data);
  if (!text) throw new Error("Empty AI response");
  return text;
}

export async function generateWithGPT(
  systemPrompt: string,
  userPrompt: string,
  options?: GptCallOptions
): Promise<string> {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callGpt4(
        [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        options ?? {}
      );
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown AI error");
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("All AI attempts failed");
}

/**
 * Request JSON from GPT with validation, normalization, and one repair attempt.
 */
export async function generateStructuredJSON<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  validate: (raw: unknown) => T | null;
  options?: GptCallOptions;
}): Promise<T> {
  const opts: GptCallOptions = {
    temperature: 0.35,
    maxRetries: 2,
    ...params.options,
  };

  const raw = await generateWithGPT(params.systemPrompt, params.userPrompt, opts);
  const parsed = params.validate(extractJsonFromText(raw));
  if (parsed) return parsed;

  const repairRaw = await generateWithGPT(
    params.systemPrompt,
    `${params.userPrompt}

Your previous response was invalid or incomplete JSON. Return ONLY corrected JSON with all required fields. No markdown fences.`,
    { ...opts, maxRetries: 1 }
  );

  const repaired = params.validate(extractJsonFromText(repairRaw));
  if (repaired) return repaired;

  throw new Error("AI returned invalid structured output");
}
