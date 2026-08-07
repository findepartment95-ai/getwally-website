export const runtime = "edge";

type Transaction = { date: string; title: string; category: string; amount: number; type: "income" | "expense"; ownerId: number | "family" };
type Turn = { role: "user" | "assistant"; text: string; createdAt: string };

function outputText(payload: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> }) {
  return payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text || "";
}

export async function POST(request: Request) {
  const { env } = await import("cloudflare:workers");
  const apiKey = env.OPENAI_API_KEY as string | undefined;
  if (!apiKey) return Response.json({ error: "AI_MODEL_NOT_CONFIGURED" }, { status: 503 });

  const body = await request.json() as {
    question?: string;
    transactions?: Transaction[];
    familyMembers?: Array<{ id: number; name: string; role: string; limit: number }>;
    familyLimit?: number;
    goalAmount?: number;
    goalSaved?: number;
    preferences?: { language?: string; priorities?: string[]; rules?: string[]; notes?: string };
    history?: Turn[];
  };
  if (!body.question?.trim()) return Response.json({ error: "EMPTY_QUESTION" }, { status: 400 });

  const financialContext = JSON.stringify({
    transactions: (body.transactions || []).slice(0, 250),
    familyMembers: body.familyMembers || [],
    familyLimit: body.familyLimit || 0,
    goal: { amount: body.goalAmount || 0, saved: body.goalSaved || 0 },
    preferences: body.preferences || {},
    recentConversation: (body.history || []).slice(-12),
  });

  const instructions = `Ты WALLY — персональный финансовый AI-ассистент семьи из Узбекистана. Отвечай кратко, естественно и по-русски, как в голосовом разговоре. Используй только переданные реальные цифры, не выдумывай операции и остатки. Объясняй расчёт, если даёшь сумму. Не являешься банком и не совершаешь банковские переводы. Любое изменение данных сначала предложи как pendingAction и попроси подтверждение. Верни ТОЛЬКО JSON: {"reply":"...","memory":null|{"kind":"priority|rule|note","value":"..."},"pendingAction":null|{"type":"add_expense|add_income|update_goal","title":"...","amount":123,"category":"...","ownerId":"family","reason":"..."}}. Запоминай предпочтение только если пользователь явно сообщает устойчивую цель, правило или предпочтение.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "authorization": `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: (env.OPENAI_MODEL as string | undefined) || "gpt-5.4",
      store: false,
      instructions,
      input: `Финансовый контекст пользователя:\n${financialContext}\n\nЗапрос пользователя: ${body.question}`,
      max_output_tokens: 700,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("WALLY AI request failed", response.status, detail.slice(0, 500));
    return Response.json({ error: "AI_REQUEST_FAILED" }, { status: 502 });
  }
  const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const raw = outputText(payload).replace(/^```json\s*|\s*```$/g, "").trim();
  try {
    return Response.json(JSON.parse(raw));
  } catch {
    return Response.json({ reply: raw || "Я не смог сформировать ответ. Попробуйте задать вопрос ещё раз.", memory: null, pendingAction: null });
  }
}
