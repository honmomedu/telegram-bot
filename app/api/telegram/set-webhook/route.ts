import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const host = url.host;
  const protocol = 'https:'; // Force HTTPS for Vercel and Telegram
  
  // You can override this via NEXT_PUBLIC_APP_URL if defined
  let appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}//${host}`;
  appUrl = appUrl.replace(/\/$/, ""); // Remove trailing slash
  const webhookUrl = `${appUrl}/api/bot`;
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not set" }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
    const data = await response.json();
    return NextResponse.json({ success: true, webhookUrl, telegramResponse: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
