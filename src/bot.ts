import { Bot, Context } from "grammy";
import { config } from "./config.js";
import { formatKhmerCalendarMessage } from "./modules/khmerCalendar.js";
import { formatExchangeRateMessage } from "./modules/exchangeRate.js";
import { askGemini } from "./modules/gemini.js";
import {
  mainMenuKeyboard,
  calendarInlineKeyboard,
  exchangeInlineKeyboard,
  helpInlineKeyboard,
} from "./keyboards/menu.js";

export const bot = new Bot(config.botToken);

// ==========================================
// 1. Bot Command Handlers
// ==========================================

/**
 * /start command handler
 */
bot.command("start", async (ctx: Context) => {
  const userFirstName = ctx.from?.first_name || "មិត្តសំឡាញ់";

  const welcomeText =
    `👋 *សួស្តី ${userFirstName}! សូមស្វាគមន៍មកកាន់ Telegram Assistant Bot*\n\n` +
    `🤖 *មុខងារសំខាន់ៗរបស់ Bot:*\n` +
    `• 📅 *ប្រតិទិនខ្មែរ:* មើលថ្ងៃខែសុរិយគតិ និងចន្ទគតិខ្មែរ (ខ្នើត/រោច, ឆ្នាំសត្វ, ស័ក, ព.ស., និងថ្ងៃសីល)\n` +
    `• 💱 *អត្រាប្តូរប្រាក់:* មើលតម្លៃប្តូរប្រាក់ USD, KHR, THB, EUR, CNY, VND ក្នុងពេលជាក់ស្តែង\n` +
    `• 🤖 *Gemini AI:* ឆ្លើយសំណួរ ជជែកកំសាន្ត និងបកប្រែភាសា\n\n` +
    `👇 *សូមជ្រើសរើសមុខងារតាមរយៈប៊ូតុងខាងក្រោម ឬវាយពាក្យបញ្ជាផ្ទាល់៖*`;

  await ctx.reply(welcomeText, {
    parse_mode: "Markdown",
    reply_markup: mainMenuKeyboard,
  });
});

/**
 * /help command handler
 */
bot.command("help", async (ctx: Context) => {
  const helpText =
    `ℹ️ *ការណែនាំអំពីការប្រើប្រាស់ Bot:*\n\n` +
    `📌 *បញ្ជីពាក្យបញ្ជា (Commands):*\n` +
    `• /start - ចាប់ផ្តើម និងបង្ហាញម៉ឺនុយមេ\n` +
    `• /calendar ឬ /date - មើលប្រតិទិនចន្ទគតិខ្មែរ និងថ្ងៃសីល\n` +
    `• /exchange ឬ /rate - មើលអត្រាប្តូរប្រាក់បច្ចុប្បន្ន\n` +
    `• /ai <សំណួរ> - សួរសំណួរទៅកាន់ Gemini AI\n` +
    `• /help - បង្ហាញជំនួយនេះ\n\n` +
    `💡 *ព័ត៌មានបន្ថែម:* នៅក្នុងការសន្ទនាផ្ទាល់ (Private Chat) អ្នកអាចវាយសំណួរណាមួយក៏បាន ដើម្បីសួរ Gemini AI ដោយផ្ទាល់!`;

  await ctx.reply(helpText, {
    parse_mode: "Markdown",
    reply_markup: helpInlineKeyboard,
  });
});

/**
 * /calendar and /date command handlers
 */
bot.command(["calendar", "date"], async (ctx: Context) => {
  const calendarMsg = formatKhmerCalendarMessage();
  await ctx.reply(calendarMsg, {
    parse_mode: "Markdown",
    reply_markup: calendarInlineKeyboard,
  });
});

/**
 * /exchange and /rate command handlers
 */
bot.command(["exchange", "rate"], async (ctx: Context) => {
  await ctx.replyWithChatAction("typing");
  try {
    const exchangeMsg = await formatExchangeRateMessage();
    await ctx.reply(exchangeMsg, {
      parse_mode: "Markdown",
      reply_markup: exchangeInlineKeyboard,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await ctx.reply(`⚠️ មិនអាចទាញយកអត្រាប្តូរប្រាក់បានទេ៖ ${err.message}`);
  }
});

/**
 * /ai command handler
 */
bot.command("ai", async (ctx: Context) => {
  const prompt = ctx.match?.toString().trim();

  if (!prompt) {
    await ctx.reply(
      `🤖 *របៀបសួរ Gemini AI:*\n\n` +
        `សូមវាយពាក្យបញ្ជាអមដោយសំណួរ ឧទាហរណ៍៖\n` +
        `• \`/ai តើអង្គរវត្តសាងសង់ឡើងនៅសតវត្សរ៍ណា?\`\n` +
        `• \`/ai សរសេរកំណាព្យអំពីធម្មជាតិខ្មែរ\`\n\n` +
        `💡 ឬគ្រាន់តែវាយសំណួររបស់អ្នកផ្ញើមកទីនេះដោយផ្ទាល់!`,
      { parse_mode: "Markdown" }
    );
    return;
  }

  await ctx.replyWithChatAction("typing");
  const response = await askGemini(prompt);
  await ctx.reply(response, { parse_mode: "Markdown" });
});

// ==========================================
// 2. Reply Keyboard Text Listeners
// ==========================================

bot.hears("📅 ប្រតិទិនចន្ទគតិ", async (ctx: Context) => {
  const calendarMsg = formatKhmerCalendarMessage();
  await ctx.reply(calendarMsg, {
    parse_mode: "Markdown",
    reply_markup: calendarInlineKeyboard,
  });
});

bot.hears("💱 អត្រាប្តូរប្រាក់", async (ctx: Context) => {
  await ctx.replyWithChatAction("typing");
  try {
    const exchangeMsg = await formatExchangeRateMessage();
    await ctx.reply(exchangeMsg, {
      parse_mode: "Markdown",
      reply_markup: exchangeInlineKeyboard,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await ctx.reply(`⚠️ មិនអាចទាញយកអត្រាប្តូរប្រាក់បានទេ៖ ${err.message}`);
  }
});

bot.hears("🤖 សួរ Gemini AI", async (ctx: Context) => {
  await ctx.reply(
    `🤖 *Gemini AI រួចរាល់ក្នុងការឆ្លើយសំណួរ!*\n\n` +
      `លោកអ្នកអាច៖\n` +
      `1. វាយសំណួររបស់អ្នកផ្ញើមកកាន់ទីនេះដោយផ្ទាល់\n` +
      `2. ឬប្រើពាក្យបញ្ជា \`/ai <សំណួរ>\`\n\n` +
      `✨ សួរជាភាសាខ្មែរ ឬភាសាអង់គ្លេសបានតាមចិត្ត!`,
    { parse_mode: "Markdown" }
  );
});

bot.hears("ℹ️ ជំនួយ", async (ctx: Context) => {
  const helpText =
    `ℹ️ *ជំនួយ និងការប្រើប្រាស់ Bot*\n\n` +
    `• ចុច *📅 ប្រតិទិនចន្ទគតិ* ដើម្បីពិនិត្យថ្ងៃខ្នើត/រោច និងថ្ងៃសីល\n` +
    `• ចុច *💱 អត្រាប្តូរប្រាក់* ដើម្បីពិនិត្យតម្លៃលុយដុល្លារ បាត យន់ អឺរ៉ូ\n` +
    `• វាយសារធម្មតាដើម្បីជជែកជាមួយ *Gemini AI*\n\n` +
    `⚙️ បង្កើតឡើងដោយ Node.js / TypeScript, grammY, @google/genai និង Vercel Serverless។`;

  await ctx.reply(helpText, {
    parse_mode: "Markdown",
    reply_markup: helpInlineKeyboard,
  });
});

// ==========================================
// 3. Inline Keyboard Callback Actions
// ==========================================

bot.callbackQuery("refresh_calendar", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "🔄 កំពុងធ្វើបច្ចុប្បន្នភាព..." });
  const calendarMsg = formatKhmerCalendarMessage();
  try {
    await ctx.editMessageText(calendarMsg, {
      parse_mode: "Markdown",
      reply_markup: calendarInlineKeyboard,
    });
  } catch {
    // Content might be identical
  }
});

bot.callbackQuery("refresh_exchange", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "🔄 កំពុងទាញយកទិន្នន័យថ្មី..." });
  try {
    const exchangeMsg = await formatExchangeRateMessage(true);
    await ctx.editMessageText(exchangeMsg, {
      parse_mode: "Markdown",
      reply_markup: exchangeInlineKeyboard,
    });
  } catch (err: unknown) {
    const error = err as Error;
    await ctx.reply(`⚠️ កំហុស៖ ${error.message}`);
  }
});

bot.callbackQuery(["switch_exchange", "action_exchange"], async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const exchangeMsg = await formatExchangeRateMessage();
    await ctx.reply(exchangeMsg, {
      parse_mode: "Markdown",
      reply_markup: exchangeInlineKeyboard,
    });
  } catch (err: unknown) {
    const error = err as Error;
    await ctx.reply(`⚠️ កំហុស៖ ${error.message}`);
  }
});

bot.callbackQuery(["switch_calendar", "action_calendar"], async (ctx) => {
  await ctx.answerCallbackQuery();
  const calendarMsg = formatKhmerCalendarMessage();
  await ctx.reply(calendarMsg, {
    parse_mode: "Markdown",
    reply_markup: calendarInlineKeyboard,
  });
});

// ==========================================
// 4. Default Text Message Handler (Gemini AI)
// ==========================================

bot.on("message:text", async (ctx: Context) => {
  const text = ctx.message?.text?.trim();
  if (!text) return;

  // In group chats, only respond if mentioned or replied to
  const isPrivate = ctx.chat?.type === "private";
  const botUsername = ctx.me.username;
  const isMentioned = botUsername ? text.includes(`@${botUsername}`) : false;
  const isReplyToBot = ctx.message?.reply_to_message?.from?.id === ctx.me.id;

  if (!isPrivate && !isMentioned && !isReplyToBot) {
    return;
  }

  // Clean prompt if bot was mentioned in group
  const cleanPrompt = botUsername ? text.replace(`@${botUsername}`, "").trim() : text;
  if (!cleanPrompt) return;

  await ctx.replyWithChatAction("typing");
  const aiAnswer = await askGemini(cleanPrompt);
  await ctx.reply(aiAnswer, { parse_mode: "Markdown" });
});

// ==========================================
// 5. Error Catching Middleware
// ==========================================

bot.catch((err) => {
  console.error(`[Telegram Bot Error] [ctx: ${err.ctx.update.update_id}]:`, err.error);
});
