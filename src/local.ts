import { bot } from "./bot.js";
import { config } from "./config.js";

async function runLocal() {
  console.log("--------------------------------------------------");
  console.log("🚀 Starting Telegram Bot in Long Polling Mode...");
  console.log(`📌 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Gemini Model: ${config.geminiModel}`);
  console.log("--------------------------------------------------");

  try {
    // Delete any active webhook before starting long polling
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    console.log("✅ Previous webhooks cleared. Ready for polling updates.");

    // Retrieve bot profile info
    const me = await bot.api.getMe();
    console.log(`🤖 Bot connected as @${me.username} (ID: ${me.id})`);
    console.log("📡 Listening for incoming messages... (Press Ctrl+C to stop)");

    // Graceful shutdown handlers
    const stopBot = async () => {
      console.log("\n🛑 Stopping bot gracefully...");
      await bot.stop();
      process.exit(0);
    };

    process.once("SIGINT", stopBot);
    process.once("SIGTERM", stopBot);

    // Start long polling
    await bot.start({
      onStart: () => {
        console.log("✨ Bot is now actively polling for updates!");
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Failed to start bot locally:", err.message);

    if (err.message.includes("401: Unauthorized") || err.message.includes("Not Found")) {
      console.error(
        "\n💡 Hint: Your BOT_TOKEN appears invalid. Check your .env file or generate a new token via @BotFather on Telegram."
      );
    }
    process.exit(1);
  }
}

runLocal();
