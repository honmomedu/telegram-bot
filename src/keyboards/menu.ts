import { InlineKeyboard } from "grammy";

/**
 * Clean UI: Helper to dismiss any persistent reply keyboards in groups.
 */
export const removeKeyboard = { remove_keyboard: true as const };

/**
 * Inline keyboard for Calendar messages (unobtrusive, attached only to message)
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
  .text("📜 វិន័យក្រុម", "action_rules")
  .text("🏫 ព័ត៌មានក្រុម", "action_info");
