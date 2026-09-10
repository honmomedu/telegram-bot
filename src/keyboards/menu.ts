import { Keyboard, InlineKeyboard } from "grammy";

/**
 * Main persistent reply keyboard
 */
export const mainMenuKeyboard = new Keyboard()
  .text("📅 ប្រតិទិនចន្ទគតិ")
  .text("💱 អត្រាប្តូរប្រាក់")
  .row()
  .text("🤖 សួរ Gemini AI")
  .text("ℹ️ ជំនួយ")
  .resized()
  .persistent();

/**
 * Inline keyboard for Calendar messages
 */
export const calendarInlineKeyboard = new InlineKeyboard()
  .text("🔄 ពិនិត្យឡើងវិញ", "refresh_calendar")
  .text("💱 អត្រាប្តូរប្រាក់", "switch_exchange");

/**
 * Inline keyboard for Exchange Rate messages
 */
export const exchangeInlineKeyboard = new InlineKeyboard()
  .text("🔄 ធ្វើបច្ចុប្បន្នភាព", "refresh_exchange")
  .text("📅 ប្រតិទិនចន្ទគតិ", "switch_calendar");

/**
 * Inline keyboard for Help / Info messages
 */
export const helpInlineKeyboard = new InlineKeyboard()
  .text("📅 ប្រតិទិន", "action_calendar")
  .text("💱 អត្រាប្តូរប្រាក់", "action_exchange")
  .row()
  .url("🌐 Google AI Studio", "https://aistudio.google.com/");
