import { NextRequest } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt || "What is this website about?";

    const token = process.env.GITHUB_TOKEN as string;
    const endpoint = "https://models.github.ai/inference";
    const model = "openai/gpt-4.1";

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: "You are a helpful assistant for the Nexa innovation platform." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        top_p: 1,
        model,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }
    const answer = response.body.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ answer }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(error?.message || "Assistant error", { status: 500 });
  }
}