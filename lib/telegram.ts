import { Telegraf } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

// Only instantiate bot if token exists, useful for both sending messages
let bot: Telegraf | null = null;
if (botToken) {
  bot = new Telegraf(botToken);
}

export async function notifyCheckIn(employee: any, method: string) {
  if (!bot) return;
  const adminGroupId = process.env.TELEGRAM_ADMIN_GROUP_ID;
  const time = new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' });
  const message = `✅ *Check-in Alert*\n\n👤 ${employee.name} (${employee.employee_code})\n🕒 ${time}\n📌 Method: ${method.toUpperCase()}`;

  // 1. Notify Admin Group
  if (adminGroupId) {
    try {
      await bot.telegram.sendMessage(adminGroupId, message, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error('Error sending to admin group:', e);
    }
  }

  // 2. Notify Employee DM
  if (employee.telegram_id) {
    try {
      await bot.telegram.sendMessage(employee.telegram_id, `You have successfully checked in at ${time} via ${method.toUpperCase()}.`, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error('Error sending to employee DM:', e);
    }
  }
}
