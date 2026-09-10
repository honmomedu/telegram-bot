import type { VercelRequest, VercelResponse } from "@vercel/node";
import { webhookCallback } from "grammy";
import { bot } from "../src/bot.js";
import { config } from "../src/config.js";

// Initialize webhook callback handler for Node.js HTTP
const handleUpdate = webhookCallback(
  bot,
  "http",
  config.webhookSecret
    ? {
        secretToken: config.webhookSecret,
      }
    : undefined
);

/**
 * Vercel Serverless Function entrypoint
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check / info endpoint for GET requests
  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      service: "Telegram Bot Webhook",
      runtime: "Vercel Serverless (Node.js)",
      timestamp: new Date().toISOString(),
      features: [
        "Gemini AI Assistant (@google/genai)",
        "Khmer Lunar & Solar Calendar (ចន្ទគតិ)",
        "Real-Time Currency Exchange Rates",
      ],
    });
  }

  // Only handle POST requests for Telegram updates
  if (req.method === "POST") {
    try {
      await handleUpdate(req, res);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("[Webhook Error]:", err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    }
    return;
  }

  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
