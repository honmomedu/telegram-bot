import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import { getGroupKnowledgePrompt } from "./groupInfo.js";

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

function buildSystemInstruction(): string {
  const groupKnowledge = getGroupKnowledgePrompt();

  return `
You are an intelligent, polite, and encouraging Educational Assistant & Community Mentor in a Telegram Study Group.
- You are fluent in both Khmer (ភាសាខ្មែរ) and English.
- Always respond in the language used by the member (Khmer or English).
- Primary role: Help students and members with their learning, homework, research, concepts explanation, summaries, and language translation.
- Group dynamics: Keep replies clear, well-structured, and concise so the group chat remains readable on mobile devices.
- Tone: Polite, encouraging, educational, and respectful (e.g. "បាទ/ចាស", "សួស្តីប្អូន/មិត្ត", etc.).
- When asked about group schedule, rules, resources, or contacts, use the provided group knowledge below.

${groupKnowledge}

- Note: You also know about the bot's features:
  1) 📅 ប្រតិទិនចន្ទគតិខ្មែរ (Khmer Lunar Calendar & ថ្ងៃសីល) via /calendar or /date.
  2) 💱 អត្រាប្តូរប្រាក់ (Currency Exchange Rates) via /exchange or /rate.
  3) 📜 វិន័យក្រុម via /rules.
  4) 🏫 ព័ត៌មានក្រុម via /info.
`.trim();
}

/**
 * Generates an AI response using the Google Gen AI SDK.
 * Includes automatic retry on 503 High Demand, model fallback (e.g. gemini-2.5-flash),
 * and polite localized error handling.
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

  // Model fallback candidates: primary model first, followed by stable flash model
  const candidateModels = Array.from(new Set([config.geminiModel, "gemini-2.5-flash"]));
  const systemInstruction = buildSystemInstruction();

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    // Retry transient 503 / 429 errors up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          // Telegram messages have a hard limit of 4096 characters
          if (reply.length > 4000) {
            return reply.slice(0, 3990) + "\n\n...(អត្ថបទត្រូវបានកាត់ត្រឹមនេះ)";
          }
          return reply;
        }
      } catch (error: unknown) {
        lastError = error as Error;
        const errMsg = lastError.message || "";

        // If high demand or rate limit, pause briefly before retrying or switching models
        if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("429")) {
          if (attempt === 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
        }
        // If other error, move to fallback model
        break;
      }
    }
  }

  const errMessage = lastError?.message || "";
  console.error("[Gemini Final Error]:", errMessage);

  if (errMessage.includes("503") || errMessage.includes("high demand")) {
    return "⏳ *ប្រព័ន្ធ Gemini AI កំពុងមានអ្នកប្រើប្រាស់ច្រើន (High Demand)*។ សូមរង់ចាំប្រហែល ៥ ទៅ ១០ វិនាទី រួចសាកល្បងម្ដងទៀត!";
  }

  if (errMessage.includes("API_KEY_INVALID") || errMessage.includes("invalid API key")) {
    return "❌ *កំហុស API Key:* `GEMINI_API_KEY` មិនត្រឹមត្រូវទេ។ សូមពិនិត្យមើល Key របស់អ្នកឡើងវិញ។";
  }

  if (errMessage.includes("RESOURCE_EXHAUSTED") || errMessage.includes("quota")) {
    return "⏳ *ជាប់ Quota:* សំណើច្រើនពេក សូមរង់ចាំមួយភ្លែត រួចសាកល្បងម្ដងទៀត។";
  }

  return "⚠️ *កំហុសពី Gemini AI:* មិនអាចដំណើរការបាននៅពេលនេះ សូមសាកល្បងម្ដងទៀតបន្តិចក្រោយ។";
}
