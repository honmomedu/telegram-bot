import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
}

function getAppUrl() {
  let rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'secure-attend.example.com';
  if (!rawUrl.startsWith('http')) {
    rawUrl = 'https://' + rawUrl;
  }
  return rawUrl.replace(/\/$/, "");
}

function setupBot(token: string, appUrl: string) {
  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    await ctx.reply('សាលារៀនខ្មែរ សូមស្វាគមន៍!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'ចុចទីនេះដើម្បីចុះវត្តមាន', web_app: { url: `${appUrl}/employee` } }]
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

  return bot;
}

export async function POST(req: NextRequest) {
  console.log("=== Telegram Webhook Hit ===");
  const botToken = getBotToken();
  
  if (!botToken) {
    console.error("Missing TELEGRAM_BOT_TOKEN");
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not set' }, { status: 500 });
  }
  
  // Log token securely (masking mid part)
  const maskedToken = botToken.substring(0, 5) + '...' + botToken.substring(botToken.length - 5);
  console.log("Using bot token:", maskedToken);
  
  const appUrl = getAppUrl();
  const bot = setupBot(botToken, appUrl);
  
  try {
    const body = await req.json();
    console.log("Update received:", JSON.stringify(body, null, 2));
    await bot.handleUpdate(body);
    console.log("Update processed successfully");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Telegraf POST error:', err.message, err.stack);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const token = getBotToken();
  return NextResponse.json({ 
    status: 'Bot Endpoint Active',
    hasToken: !!token
  });
}

