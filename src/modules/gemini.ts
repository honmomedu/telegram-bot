import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  if (!config.geminiApiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
You are an intelligent, polite, and friendly Telegram AI Assistant.
- You are fluent in Khmer (ភាសាខ្មែរ) and English.
- Always match the user's language: if the user writes in Khmer, reply in natural, polite Khmer. If they write in English, reply in English.
- Structure answers clearly using Telegram-compatible Markdown (bold, lists, code blocks).
- Keep replies concise, helpful, and pleasant to read on mobile devices.
- Note: This bot also has built-in features for:
  1) 📅 ប្រតិទិនចន្ទគតិខ្មែរ (Khmer Lunar Calendar) via /calendar or /date.
  2) 💱 អត្រាប្តូរប្រាក់ (Currency Exchange Rates) via /exchange or /rate.
`.trim();

/**
 * Generates an AI response using the Google Gen AI SDK.
 * Handles missing API key, rate limits, and Telegram message length limits.
 */
export async function askGemini(prompt: string): Promise<string> {
  const client = getClient();

  if (!client) {
    return (
      `⚠️ *មិនទាន់កំណត់ GEMINI\\_API\\_KEY*\n\n` +
      `សូមកំណត់ \`GEMINI_API_KEY\` នៅក្នុងឯកសារ \`.env\` (ឬ Vercel Environment Variables) ` +
      `ដើម្បីដំណើរការមុខងារ Gemini AI Chatbot។\n\n` +
      `🔗 យក Key ឥតគិតថ្លៃនៅ៖ [Google AI Studio](https://aistudio.google.com/)`
    );
  }

  try {
    const response = await client.models.generateContent({
      model: config.geminiModel,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return "🤖 មិនមានចម្លើយពី Gemini AI ទេ សូមសាកល្បងម្ដងទៀត។";
    }

    // Telegram messages have a hard limit of 4096 characters
    if (reply.length > 4000) {
      return reply.slice(0, 3990) + "\n\n...(អត្ថបទត្រូវបានកាត់ត្រឹមនេះ)";
    }

    return reply;
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Gemini Error]:", err);

    if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("invalid API key")) {
      return "❌ *កំហុស API Key:* `GEMINI_API_KEY` មិនត្រឹមត្រូវទេ។ សូមពិនិត្យមើល Key របស់អ្នកឡើងវិញ។";
    }

    if (err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("quota")) {
      return "⏳ *ជាប់ Quota:* សំណើច្រើនពេក សូមរង់ចាំមួយភ្លែត រួចសាកល្បងម្ដងទៀត។";
    }

    return `⚠️ *កំហុសពី Gemini AI:* ${err.message || "មិនអាចដំណើរការបាននៅពេលនេះ"}`;
  }
}
