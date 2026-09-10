import "dotenv/config";

/**
 * Validates and provides typed configuration from environment variables.
 */
function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (!value) {
    if (process.env.NODE_ENV === "test") {
      return defaultValue ?? "mock_test_token";
    }
    throw new Error(
      `[Config Error] Missing required environment variable: ${name}.\n` +
        `Please create a .env file based on .env.example or set ${name} in your environment.`
    );
  }
  return value;
}

export const config = {
  // Telegram Bot Token (required in runtime, mocked in tests)
  botToken:
    process.env.BOT_TOKEN ||
    (process.env.NODE_ENV === "test"
      ? "000000000:AAABBBCCCDDDEEEFFFGGGHHH"
      : getEnv("BOT_TOKEN")),

  // Google Gemini API Key
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // Google Gemini Model
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  // Secret token for securing Telegram Webhook updates on Vercel
  webhookSecret: process.env.WEBHOOK_SECRET || "",

  // Runtime environment
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV !== "production",

  // Port for local server / testing
  port: parseInt(process.env.PORT || "3000", 10),
};
