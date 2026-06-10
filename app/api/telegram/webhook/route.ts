import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || 'DUMMY_TOKEN');

// Telegram bot commands
bot.command('start', (ctx) => {
  ctx.reply('សួស្តី! សូមស្វាគមន៍មកកាន់ SecureAttend 🤖\nWelcome to SecureAttend bot! Use /checkin to register your attendance today.');
});

bot.command('checkin', (ctx) => {
  // In a real app, query Supabase to find user by telegram_id and record attendance
  ctx.reply('ការចុះវត្តមានទើបបានជោគជ័យ! (Check-in simulated via Telegram)');
});

// Since Next.js uses standard Request/Response with Edge/Node, we must manually pass the payload to Telegraf
export async function POST(req: NextRequest) {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Telegram bot not configured" }, { status: 500 });
    }

    const body = await req.json();
    
    // Process update through Telegraf
    await bot.handleUpdate(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

// Ensure the endpoint works when Telegram tests it
export async function GET() {
  return NextResponse.json({ status: "SecureAttend Bot Engine Running" });
}
