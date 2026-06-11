import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

// Initialize conditionally
let bot: Telegraf | null = null;
if (botToken) {
  bot = new Telegraf(botToken);
}

export async function POST(req: NextRequest) {
  if (!bot) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not set' }, { status: 500 });
  }
  
  try {
    const { telegramId, name, month, gross, additions, deductions, net } = await req.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegram ID' }, { status: 400 });
    }

    const message = `
💰 *វាយតម្លៃប្រាក់ខែ (Payslip)*
🗓 ខែ (Month): ${month}
👤 បុគ្គលិក (Employee): ${name}

💵 *ប្រាក់ខែគោលម៉ោង (Gross):* $${gross.toFixed(2)}
➕ *ប្រាក់ថែម (Additions):* $${additions.toFixed(2)}
➖ *ប្រាក់កាត់ (Deductions):* $${deductions.toFixed(2)}

✅ *ប្រាក់ត្រូវបើកសរុប (Net Pay):* $${net.toFixed(2)}

សូមអរគុណ! (Thank you!)
`;

    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Payslip error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
