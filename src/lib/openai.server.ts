// Server-only OpenAI helper. Never import from client code.
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5-mini";

export async function callOpenAI(opts: {
  messages: ChatMessage[];
  model?: string;
  tools?: any[];
  tool_choice?: any;
  temperature?: number;
  response_format?: any;
}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured in the server environment.");
  }

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model || process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: opts.messages,
      ...(opts.tools ? { tools: opts.tools, tool_choice: opts.tool_choice } : {}),
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("OpenAI API error", res.status, body);
    if (res.status === 401) {
      throw new Error("OpenAI authentication failed. Check OPENAI_API_KEY.");
    }
    if (res.status === 429) {
      throw new Error("Rate limit reached. Please wait a moment and try again.");
    }
    if (res.status === 402) {
      throw new Error("OpenAI billing or quota limits prevented this request.");
    }
    throw new Error(`OpenAI API request failed: ${res.status}`);
  }

  return res.json();
}

export async function callOpenAIStructured<T = unknown>(opts: {
  messages: ChatMessage[];
  toolName: string;
  parameters: any;
  description: string;
  model?: string;
}): Promise<T> {
  const data = await callOpenAI({
    messages: opts.messages,
    model: opts.model,
    tools: [
      {
        type: "function",
        function: {
          name: opts.toolName,
          description: opts.description,
          parameters: opts.parameters,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: opts.toolName } },
    temperature: 0.3,
  });

  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!call?.function?.arguments) throw new Error("No structured output from model.");
  return JSON.parse(call.function.arguments) as T;
}
