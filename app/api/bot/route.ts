import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { supabase } from '@/lib/supabase';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://secure-attend.example.com';

const bot = new Telegraf(botToken || 'DUMMY_TOKEN');

bot.start((ctx) => {
  ctx.reply('Welcome to SecureAttend! Please open the Mini App to check in or register.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Open Mini App', web_app: { url: `${appUrl}/employee` } }]
      ]
    }
  });
});

bot.command('link', async (ctx) => {
  const text = ctx.message.text;
  const parts = text.split(' ');
  if (parts.length < 2) {
    return ctx.reply('Usage: /link <EmployeeID>');
  }
  const employeeCode = parts[1].trim();
  const telegramId = ctx.from.id;

  const { data, error } = await supabase
    .from('employees')
    .update({ telegram_id: telegramId })
    .eq('employee_code', employeeCode)
    .select()
    .single();

  if (error || !data) {
    return ctx.reply(`Could not link. Employee ID ${employeeCode} might not exist.`);
  }

  return ctx.reply(`Successfully linked to Employee ${data.name} (${employeeCode}).`);
});

export async function POST(req: NextRequest) {
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not set' }, { status: 500 });
  }
  
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Telegraf POST error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
