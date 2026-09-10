process.env.NODE_ENV = process.env.NODE_ENV || "test";

import { getKhmerCalendar, formatKhmerCalendarMessage, toKhmerDigits } from "../src/modules/khmerCalendar.js";
import { getExchangeRates, formatExchangeRateMessage } from "../src/modules/exchangeRate.js";
import { askGemini } from "../src/modules/gemini.js";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING TELEGRAM BOT MODULE TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // Test 1: Khmer Calendar Module
  // ----------------------------------------------------
  console.log("\n[1] Testing Khmer Calendar Module...");
  try {
    const cal = getKhmerCalendar(new Date());
    assert(typeof cal.solar.gregorianFormattedKh === "string", "Solar Khmer date generated");
    assert(typeof cal.lunar.fullKhmerFormatted === "string", "Lunar Khmer formatted date generated");
    assert(cal.lunar.beYear > 2500, `Buddhist Era is valid (${cal.lunar.beYear})`);
    assert(cal.lunar.animalEmoji.length > 0, `Animal emoji present (${cal.lunar.animalEmoji})`);
    assert(typeof cal.holyDay.isHolyDay === "boolean", "Holy Day boolean checked");

    const message = formatKhmerCalendarMessage();
    assert(message.includes("ប្រតិទិនខ្មែរ"), "Calendar message has title");
    assert(message.includes("សុរិយគតិ"), "Calendar message has Solar section");
    assert(message.includes("ចន្ទគតិ"), "Calendar message has Lunar section");

    // Test specific date conversion: Khmer New Year 2024 (14 April 2024)
    const kny = getKhmerCalendar(new Date(2024, 3, 14));
    assert(kny.lunar.animalYearName === "រោង", `KNY 2024 Animal Year is Dragon/រោង (got ${kny.lunar.animalYearName})`);
    
    // In Buddhist tradition, BE increments at Visakha Bochea (May)
    const postVisakha = getKhmerCalendar(new Date(2024, 5, 1));
    assert(postVisakha.lunar.beYear === 2568, `Post-Visakha 2024 BE year is 2568 (got ${postVisakha.lunar.beYear})`);

    // Test digits conversion
    assert(toKhmerDigits("2026") === "២០២៦", "Digits conversion: 2026 -> ២០២៦");
  } catch (err: unknown) {
    console.error("  ❌ Calendar test exception:", err);
    failed++;
  }

  // ----------------------------------------------------
  // Test 2: Currency Exchange Rate Module
  // ----------------------------------------------------
  console.log("\n[2] Testing Exchange Rate Module...");
  try {
    const ratesData = await getExchangeRates();
    assert(ratesData.base === "USD", "Base currency is USD");
    assert(ratesData.rates.USD_KHR > 3500, `USD to KHR is realistic (${ratesData.rates.USD_KHR})`);
    assert(ratesData.rates.THB_KHR > 50, `THB to KHR is realistic (${ratesData.rates.THB_KHR})`);
    assert(ratesData.rates.EUR_KHR > 3500, `EUR to KHR is realistic (${ratesData.rates.EUR_KHR})`);

    const rateMsg = await formatExchangeRateMessage();
    assert(rateMsg.includes("អត្រាប្តូរប្រាក់"), "Exchange message has header");
    assert(rateMsg.includes("USD"), "Exchange message has USD rate");
    assert(rateMsg.includes("THB"), "Exchange message has THB rate");
  } catch (err: unknown) {
    console.error("  ❌ Exchange rate test exception:", err);
    failed++;
  }

  // ----------------------------------------------------
  // Test 3: Gemini AI Module Graceful Handling
  // ----------------------------------------------------
  console.log("\n[3] Testing Gemini AI Module (handling without key)...");
  try {
    const reply = await askGemini("សួស្តី");
    assert(typeof reply === "string" && reply.length > 0, "Gemini reply returned string");
    // If GEMINI_API_KEY is not configured yet, it should gracefully instruct user how to set it
    if (!process.env.GEMINI_API_KEY) {
      assert(
        reply.includes("GEMINI_API_KEY") || reply.includes("Google AI Studio"),
        "Graceful notice when GEMINI_API_KEY is not set"
      );
    }
  } catch (err: unknown) {
    console.error("  ❌ Gemini test exception:", err);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`🏁 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
