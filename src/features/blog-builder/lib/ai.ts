const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST ?? "chatgpt-42.p.rapidapi.com";

interface ChatResponse {
  result?: string;
  message?: string;
  choices?: { message?: { content?: string } }[];
}

export function extractJsonFromText(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      /* fall through */
    }
  }
  const start = text.indexOf("{");
  const arrStart = text.indexOf("[");
  if (arrStart !== -1 && (start === -1 || arrStart < start)) {
    try {
      return JSON.parse(text.slice(arrStart));
    } catch {
      /* fall through */
    }
  }
  if (start !== -1) {
    try {
      return JSON.parse(text.slice(start));
    } catch {
      /* fall through */
    }
  }
  return null;
}

export async function generateWithGPT(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxRetries?: number }
): Promise<string> {
  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  const maxRetries = options?.maxRetries ?? 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 55000);

      const response = await fetch(`https://${RAPIDAPI_HOST}/gpt4`, {
        method: "POST",
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          web_access: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const text =
        data.result ||
        data.message ||
        data.choices?.[0]?.message?.content ||
        "";

      if (!text) throw new Error("Empty AI response");
      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Unknown AI error");
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("All AI attempts failed");
}
