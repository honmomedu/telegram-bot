import { Context } from "grammy";

/**
 * Checks if the message sender is an Administrator or Creator in the chat.
 */
export async function isUserAdmin(ctx: Context): Promise<boolean> {
  if (ctx.chat?.type === "private") {
    return true;
  }

  const userId = ctx.from?.id;
  if (!userId) return false;

  try {
    const member = await ctx.getChatMember(userId);
    return member.status === "creator" || member.status === "administrator";
  } catch (error) {
    console.error("[Admin Check Error]:", error);
    return false;
  }
}

/**
 * Handles /warn command (Admin only, replied to a member).
 */
export async function handleWarnCommand(ctx: Context): Promise<void> {
  const isAdmin = await isUserAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply("⚠️ ពាក្យបញ្ជានេះសម្រាប់តែ Admin ក្នុងក្រុមប៉ុណ្ណោះ!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const repliedMsg = ctx.message?.reply_to_message;
  if (!repliedMsg || !repliedMsg.from) {
    await ctx.reply("💡 សូម Reply លើសាររបស់សមាជិកដែលអ្នកចង់ព្រមាន (Warn)!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const targetUser = repliedMsg.from;
  const adminName = ctx.from?.first_name || "Admin";

  await ctx.reply(
    `⚠️ *ការព្រមានពី Admin (${adminName})!*\n\n` +
      `សមាជិក [${targetUser.first_name}](tg://user?id=${targetUser.id}) បានប្រព្រឹត្តល្មើសនឹងគោលការណ៍ក្រុម។\n` +
      `សូមគោរពវិន័យក្រុម ជៀសវាងការផ្ញើសារ Spam ឬខ្លឹមសារមិនសមរម្យ! (/rules)`,
    {
      parse_mode: "Markdown",
      reply_to_message_id: repliedMsg.message_id,
    }
  );
}

/**
 * Handles /mute <minutes> command (Admin only, replied to a member).
 */
export async function handleMuteCommand(ctx: Context): Promise<void> {
  const isAdmin = await isUserAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply("⚠️ ពាក្យបញ្ជានេះសម្រាប់តែ Admin ក្នុងក្រុមប៉ុណ្ណោះ!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const repliedMsg = ctx.message?.reply_to_message;
  if (!repliedMsg || !repliedMsg.from) {
    await ctx.reply("💡 សូម Reply លើសាររបស់សមាជិកដែលអ្នកចង់បិទមាត់ (Mute) ឧទាហរណ៍៖ `/mute 30` (បិទ ៣០នាទី)", {
      reply_to_message_id: ctx.message?.message_id,
      parse_mode: "Markdown",
    });
    return;
  }

  const text = ctx.message?.text || "";
  const parts = text.split(" ");
  const minutes = parts[1] ? parseInt(parts[1], 10) : 30;
  const duration = isNaN(minutes) || minutes <= 0 ? 30 : minutes;
  const untilDate = Math.floor(Date.now() / 1000) + duration * 60;

  const targetUser = repliedMsg.from;
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  try {
    await ctx.api.restrictChatMember(chatId, targetUser.id, {
      can_send_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
    }, {
      until_date: untilDate,
    });

    await ctx.reply(
      `🔇 [${targetUser.first_name}](tg://user?id=${targetUser.id}) ត្រូវបានបិទសំឡេង (Mute) រយៈពេល *${duration} នាទី*!`,
      {
        parse_mode: "Markdown",
        reply_to_message_id: repliedMsg.message_id,
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    await ctx.reply(`⚠️ មិនអាច Mute បានទេ (សូមប្រាកដថា Bot មានសិទ្ធិ Admin ក្នុងក្រុម)៖ ${error.message}`);
  }
}

/**
 * Handles /unmute command (Admin only, replied to a member).
 */
export async function handleUnmuteCommand(ctx: Context): Promise<void> {
  const isAdmin = await isUserAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply("⚠️ ពាក្យបញ្ជានេះសម្រាប់តែ Admin ក្នុងក្រុមប៉ុណ្ណោះ!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const repliedMsg = ctx.message?.reply_to_message;
  if (!repliedMsg || !repliedMsg.from) {
    await ctx.reply("💡 សូម Reply លើសាររបស់សមាជិកដែលអ្នកចង់បើកសំឡេងវិញ (Unmute)!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const targetUser = repliedMsg.from;
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  try {
    await ctx.api.restrictChatMember(chatId, targetUser.id, {
      can_send_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });

    await ctx.reply(
      `🔊 [${targetUser.first_name}](tg://user?id=${targetUser.id}) ត្រូវបានបើកសំឡេង (Unmute) វិញហើយ!`,
      {
        parse_mode: "Markdown",
        reply_to_message_id: repliedMsg.message_id,
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    await ctx.reply(`⚠️ មិនអាច Unmute បានទេ៖ ${error.message}`);
  }
}

/**
 * Handles /kick command (Admin only, replied to a member).
 */
export async function handleKickCommand(ctx: Context): Promise<void> {
  const isAdmin = await isUserAdmin(ctx);
  if (!isAdmin) {
    await ctx.reply("⚠️ ពាក្យបញ្ជានេះសម្រាប់តែ Admin ក្នុងក្រុមប៉ុណ្ណោះ!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const repliedMsg = ctx.message?.reply_to_message;
  if (!repliedMsg || !repliedMsg.from) {
    await ctx.reply("💡 សូម Reply លើសាររបស់សមាជិកដែលអ្នកចង់ទាត់ចេញពីក្រុម (Kick)!", {
      reply_to_message_id: ctx.message?.message_id,
    });
    return;
  }

  const targetUser = repliedMsg.from;
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  try {
    // Ban and unban removes the user without permanently blocking them
    await ctx.api.banChatMember(chatId, targetUser.id);
    await ctx.api.unbanChatMember(chatId, targetUser.id);

    await ctx.reply(`🚪 [${targetUser.first_name}](tg://user?id=${targetUser.id}) ត្រូវបានទាត់ចេញពីក្រុម!`, {
      parse_mode: "Markdown",
    });
  } catch (err: unknown) {
    const error = err as Error;
    await ctx.reply(`⚠️ មិនអាច Kick បានទេ (សូមប្រាកដថា Bot មានសិទ្ធិ Admin ក្នុងក្រុម)៖ ${error.message}`);
  }
}
