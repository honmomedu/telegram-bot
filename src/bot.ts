import { Bot, Context } from "grammy";
import { config } from "./config.js";
import { formatKhmerCalendarMessage } from "./modules/khmerCalendar.js";
import { formatExchangeRateMessage } from "./modules/exchangeRate.js";
import { askGemini } from "./modules/gemini.js";
import {
  formatRulesMessage,
  formatGroupInfoMessage,
  formatWelcomeMessage,
} from "./modules/groupInfo.js";
import {
  handleWarnCommand,
  handleMuteCommand,
  handleUnmuteCommand,
  handleKickCommand,
} from "./modules/moderation.js";
import {
  removeKeyboard,
  calendarInlineKeyboard,
  exchangeInlineKeyboard,
  helpInlineKeyboard,
} from "./keyboards/menu.js";

export const bot = new Bot(config.botToken);

// ==========================================
// 1. Core Commands (/start, /help, /rules, /info)
// ==========================================

/**
 * /start command handler (Dismisses any old bottom keyboard)
 */
bot.command("start", async (ctx: Context) => {
  const userFirstName = ctx.from?.first_name || "មិត្តសំឡាញ់";

  const welcomeText =
    `👋 *សួស្តី ${userFirstName}! ខ្ញុំជាជំនួយការ AI សម្រាប់ក្រុមរៀនសូត្រ* 🎓\n\n` +
    `🤖 *មុខងារសំខាន់ៗ:*\n` +
    `• 💡 *រៀនសូត្រ & ស្រាវជ្រាវ:* សួរមេរៀន លំហាត់ ឬបកប្រែភាសា (គ្រាន់តែ Mention ឬ Tag ខ្ញុំមក \`@mykh168bot\`)\n` +
    `• 📜 *វិន័យក្រុម:* វាយ \`/rules\`\n` +
    `• 🏫 *ព័ត៌មានក្រុម & កាលវិភាគ:* វាយ \`/info\`\n` +
    `• 📅 *ប្រតិទិនខ្មែរ:* វាយ \`/calendar\` ឬ \`/date\`\n` +
    `• 💱 *អត្រាប្តូរប្រាក់:* វាយ \`/rate\` ឬ \`/exchange\`\n\n` +
    `💡 _នៅក្នុងក្រុម ខ្ញុំនឹងឆ្លើយតបតែពេលមានគេ Mention ឬ Reply លើសាររបស់ខ្ញុំប៉ុណ្ណោះ!_`;

  await ctx.reply(welcomeText, {
    parse_mode: "Markdown",
    reply_markup: removeKeyboard,
  });
});

/**
 * /rules command handler
 */
bot.command("rules", async (ctx: Context) => {
  await ctx.reply(formatRulesMessage(), {
    parse_mode: "Markdown",
    reply_to_message_id: ctx.message?.message_id,
  });
});

/**
 * /info command handler
 */
bot.command("info", async (ctx: Context) => {
  await ctx.reply(formatGroupInfoMessage(), {
    parse_mode: "Markdown",
    reply_to_message_id: ctx.message?.message_id,
  });
});

/**
 * /help command handler
 */
bot.command("help", async (ctx: Context) => {
  const helpText =
    `ℹ️ *ការណែនាំអំពីការប្រើប្រាស់ Bot ក្នុងក្រុម:*\n\n` +
    `📌 *សម្រាប់សមាជិកទាំងអស់:*\n` +
    `• Tag ឬ Mention មក \`@mykh168bot\` ដើម្បីសួរមេរៀន លំហាត់ ឬសង្ខេបអត្ថបទ\n` +
    `• Reply លើសាររបស់ Bot ដើម្បីជជែកបន្ថែម\n` +
    `• \`/rules\` - មើលវិន័យ និងគោលការណ៍រួម\n` +
    `• \`/info\` - មើលកាលវិភាគ និងឯកសាររៀនសូត្រ\n` +
    `• \`/calendar\` - មើលប្រតិទិនចន្ទគតិខ្មែរ និងថ្ងៃសីល\n` +
    `• \`/rate\` - មើលអត្រាប្តូរប្រាក់\n\n` +
    `🛡 *សម្រាប់ Admin គ្រប់គ្រងក្រុម:*\n` +
    `• \`/warn\` (Reply លើសារ) - ព្រមានសមាជិក\n` +
    `• \`/mute <នាទី>\` (Reply លើសារ) - បិទសំឡេងសមាជិកបណ្តោះអាសន្ន\n` +
    `• \`/unmute\` (Reply លើសារ) - បើកសំឡេងវិញ\n` +
    `• \`/kick\` (Reply លើសារ) - បណ្តេញចេញពីក្រុម`;

  await ctx.reply(helpText, {
    parse_mode: "Markdown",
    reply_markup: helpInlineKeyboard,
    reply_to_message_id: ctx.message?.message_id,
  });
});

// ==========================================
// 2. Admin Moderation Commands (/warn, /mute, /unmute, /kick)
// ==========================================

bot.command("warn", handleWarnCommand);
bot.command("mute", handleMuteCommand);
bot.command("unmute", handleUnmuteCommand);
bot.command("kick", handleKickCommand);

// ==========================================
// 3. Information Modules (/calendar, /exchange, /ai)
// ==========================================

bot.command(["calendar", "date"], async (ctx: Context) => {
  const calendarMsg = formatKhmerCalendarMessage();
  await ctx.reply(calendarMsg, {
    parse_mode: "Markdown",
    reply_markup: calendarInlineKeyboard,
    reply_to_message_id: ctx.message?.message_id,
  });
});

bot.command(["exchange", "rate"], async (ctx: Context) => {
  await ctx.replyWithChatAction("typing");
  try {
    const exchangeMsg = await formatExchangeRateMessage();
    await ctx.reply(exchangeMsg, {
      parse_mode: "Markdown",
      reply_markup: exchangeInlineKeyboard,
      reply_to_message_id: ctx.message?.message_id,
    });
  } catch (error: unknown) {
    const err = error as Error;
    await ctx.reply(`⚠️ មិនអាចទាញយកអត្រាប្តូរប្រាក់បានទេ៖ ${err.message}`, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
});

bot.command("ai", async (ctx: Context) => {
  const prompt = ctx.match?.toString().trim();

  if (!prompt) {
    await ctx.reply(
      `🤖 *សូមសរសេរសំណួរអមជាមួយ:* ឧទាហរណ៍៖ \`/ai តើផែនដីវិលជុំវិញព្រះអាទិត្យរយៈពេលប៉ុន្មាន?\``,
      {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message?.message_id,
      }
    );
    return;
  }

  await ctx.replyWithChatAction("typing");
  const response = await askGemini(prompt);
  await ctx.reply(response, {
    parse_mode: "Markdown",
    reply_to_message_id: ctx.message?.message_id,
  });
});

// ==========================================
// 4. Welcome New Chat Members
// ==========================================

bot.on(":new_chat_members", async (ctx: Context) => {
  const newMembers = ctx.message?.new_chat_members || [];

  for (const member of newMembers) {
    // If the bot itself was added to the group
    if (member.id === ctx.me.id) {
      await ctx.reply(
        `👋 *សូមជម្រាបសួរអ្នកទាំងអស់គ្នា!* 🎓\n\n` +
          `ខ្ញុំជា Bot ជំនួយការរៀនសូត្រ និងគ្រប់គ្រងក្រុម។\n` +
          `• សួរមេរៀន/លំហាត់៖ Tag ឬ Mention មក \`@${ctx.me.username} <សំណួរ>\`\n` +
          `• វាយ \`/rules\` ដើម្បីមើលវិន័យក្រុម\n` +
          `• វាយ \`/info\` ដើម្បីមើលកាលវិភាគ និងឯកសារសិក្សា!`,
        { parse_mode: "Markdown" }
      );
      continue;
    }

    // Welcome human member
    const welcomeMsg = formatWelcomeMessage(member.first_name);
    await ctx.reply(welcomeMsg, { parse_mode: "Markdown" });
  }
});

// ==========================================
// 5. Inline Keyboard Callback Queries
// ==========================================

bot.callbackQuery("action_rules", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(formatRulesMessage(), { parse_mode: "Markdown" });
});

bot.callbackQuery("action_info", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(formatGroupInfoMessage(), { parse_mode: "Markdown" });
});

bot.callbackQuery("refresh_calendar", async (ctx) => {
  await ctx.answerCallbackQuery({ text: "🔄 កំពុងធ្វើបច្ចុប្បន្នភាព..." });
  const calendarMsg = formatKhmerCalendarMessage();
  try {
    await ctx.editMessageText(calendarMsg, {
      parse_mode: "Markdown",
      reply_markup: calendarInlineKeyboard,
    });
  } catch {
    // Ignored if message content is unchanged
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
// 6. Mention & Reply AI Listener (Zero Spam)
// ==========================================

bot.on("message:text", async (ctx: Context) => {
  const text = ctx.message?.text?.trim();
  if (!text) return;

  const isPrivate = ctx.chat?.type === "private";
  const botUsername = ctx.me.username;

  // In groups: Respond ONLY when mentioned (@bot) or replied to bot's message
  const isMentioned = botUsername
    ? text.toLowerCase().includes(`@${botUsername.toLowerCase()}`)
    : false;
  const isReplyToBot = ctx.message?.reply_to_message?.from?.id === ctx.me.id;

  if (!isPrivate && !isMentioned && !isReplyToBot) {
    // Stay silent, do not interfere with normal group conversation
    return;
  }

  // Strip bot's @username mention from the question
  let cleanPrompt = text;
  if (botUsername) {
    const mentionRegex = new RegExp(`@${botUsername}`, "gi");
    cleanPrompt = cleanPrompt.replace(mentionRegex, "").trim();
  }

  if (!cleanPrompt) {
    await ctx.reply(
      `👋 សួស្តី! តើប្អូន/មិត្តមានចម្ងល់ ឬសំណួរអ្វីចង់សួរខ្ញុំដែរទេ? (ឧទាហរណ៍៖ \`@${botUsername} ពន្យល់អំពីច្បាប់ញូតុន\`)`,
      {
        parse_mode: "Markdown",
        reply_to_message_id: ctx.message?.message_id,
      }
    );
    return;
  }

  await ctx.replyWithChatAction("typing");
  const aiAnswer = await askGemini(cleanPrompt);
  await ctx.reply(aiAnswer, {
    parse_mode: "Markdown",
    reply_to_message_id: ctx.message?.message_id,
  });
});

// ==========================================
// 7. Error Handler
// ==========================================

bot.catch((err) => {
  console.error(`[Telegram Bot Error] [Update ${err.ctx.update.update_id}]:`, err.error);
});
