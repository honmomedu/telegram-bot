import momentkh from "@thyrith/momentkh";

export interface KhmerCalendarResult {
  solar: {
    gregorianFormattedKh: string; // ថ្ងៃសុក្រ ទី០៤ ខែកញ្ញា ឆ្នាំ២០២៦
    gregorianFormattedEn: string; // Friday, 04 September 2026
    year: number;
    month: number;
    day: number;
    dayOfWeekNameKh: string;
    dayOfWeekNameEn: string;
  };
  lunar: {
    fullKhmerFormatted: string; // ថ្ងៃសុក្រ ៧រោច ខែស្រាពណ៍ ឆ្នាំមមី អដ្ឋស័ក ពុទ្ធសករាជ ២៥៧០
    day: number;
    dayKh: string;
    moonPhase: number; // 0 = កើត (Waxing), 1 = រោច (Waning)
    moonPhaseName: string; // កើត | រោច
    monthName: string; // ស្រាពណ៍
    beYear: number; // 2570
    beYearKh: string; // ២៥៧០
    animalYearName: string; // មមី
    animalEmoji: string; // 🐎
    sakName: string; // អដ្ឋស័ក
  };
  holyDay: {
    isHolyDay: boolean;
    holyDayType?: string; // ៨កើត | ១៥កើត (ពេញបូណ៌មី) | ៨រោច | ១៤រោច/១៥រោច (ដាច់ខែ)
    nextHolyDay?: {
      dateKh: string;
      lunarDesc: string;
      daysRemaining: number;
    };
  };
}

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
const SOLAR_MONTHS_KH = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const WEEKDAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Converts Western digits (0-9) to Khmer digits (០-៩)
 */
export function toKhmerDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => KHMER_DIGITS[parseInt(digit, 10)]);
}

/**
 * Checks if a given momentkh result represents a Buddhist Holy Day (ថ្ងៃសីល).
 * Holy days in Khmer tradition occur on:
 * - ៨កើត (8th day of waxing moon)
 * - ១៥កើត (15th day of waxing moon - full moon)
 * - ៨រោច (8th day of waning moon)
 * - ១៤រោច or ១៥រោច (last day of waning moon / new moon)
 */
function isDateHolyDay(res: ReturnType<typeof momentkh.fromDate>, checkDate: Date): {
  isHoly: boolean;
  type?: string;
} {
  const { day, moonPhase } = res.khmer;

  // 8 Waxing
  if (moonPhase === 0 && day === 8) {
    return { isHoly: true, type: "៨កើត" };
  }

  // 15 Waxing (Full Moon - ពេញបូណ៌មី)
  if (moonPhase === 0 && day === 15) {
    return { isHoly: true, type: "១៥កើត (ពេញបូណ៌មី)" };
  }

  // 8 Waning
  if (moonPhase === 1 && day === 8) {
    return { isHoly: true, type: "៨រោច" };
  }

  // 15 Waning (Last day for 30-day month)
  if (moonPhase === 1 && day === 15) {
    return { isHoly: true, type: "១៥រោច (ដាច់ខែ)" };
  }

  // 14 Waning: check if tomorrow is waxing (1កើត)
  if (moonPhase === 1 && day === 14) {
    const tomorrow = new Date(checkDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowRes = momentkh.fromDate(tomorrow);
    if (tomorrowRes.khmer.moonPhase === 0) {
      return { isHoly: true, type: "១៤រោច (ដាច់ខែ)" };
    }
  }

  return { isHoly: false };
}

/**
 * Finds the next Buddhist Holy Day starting from the day after checkDate.
 */
function findNextHolyDay(fromDateObj: Date): {
  dateKh: string;
  lunarDesc: string;
  daysRemaining: number;
} {
  const pointer = new Date(fromDateObj);

  for (let i = 1; i <= 32; i++) {
    pointer.setDate(pointer.getDate() + 1);
    const res = momentkh.fromDate(pointer);
    const holyCheck = isDateHolyDay(res, pointer);

    if (holyCheck.isHoly) {
      const dayOfWeekKh = res.khmer.dayOfWeekName;
      const dayNumKh = toKhmerDigits(String(pointer.getDate()).padStart(2, "0"));
      const monthKh = SOLAR_MONTHS_KH[pointer.getMonth()];
      const lunarDayKh = toKhmerDigits(res.khmer.day);
      const moonPhaseName = res.khmer.moonPhaseName;
      const lunarMonth = res.khmer.monthName;

      return {
        dateKh: `ថ្ងៃ${dayOfWeekKh} ទី${dayNumKh} ខែ${monthKh}`,
        lunarDesc: `${lunarDayKh}${moonPhaseName} ខែ${lunarMonth} (${holyCheck.type})`,
        daysRemaining: i,
      };
    }
  }

  return {
    dateKh: "មិនអាចគណនាបាន",
    lunarDesc: "",
    daysRemaining: 0,
  };
}

/**
 * Get comprehensive Khmer Calendar details for today or a specific date.
 */
export function getKhmerCalendar(date: Date = new Date()): KhmerCalendarResult {
  const khmerRes = momentkh.fromDate(date);

  const dayOfWeekEn = WEEKDAY_NAMES_EN[date.getDay()];
  const monthNameEn = MONTH_NAMES_EN[date.getMonth()];
  const gregorianFormattedEn = `${dayOfWeekEn}, ${String(date.getDate()).padStart(2, "0")} ${monthNameEn} ${date.getFullYear()}`;

  const dayOfWeekKh = khmerRes.khmer.dayOfWeekName;
  const dayKh = toKhmerDigits(String(date.getDate()).padStart(2, "0"));
  const monthKh = SOLAR_MONTHS_KH[date.getMonth()];
  const yearKh = toKhmerDigits(date.getFullYear());
  const gregorianFormattedKh = `ថ្ងៃ${dayOfWeekKh} ទី${dayKh} ខែ${monthKh} ឆ្នាំ${yearKh}`;

  // Animal Emoji lookup
  const animalEmojis = momentkh.constants.AnimalYearEmojis || [
    "🐀", "🐂", "🐅", "🐇", "🐉", "🐍", "🐎", "🐐", "🐒", "🐓", "🐕", "🐖",
  ];
  const animalEmoji = animalEmojis[khmerRes.khmer.animalYear] || "🌟";

  // Holy day check
  const holyDayCheck = isDateHolyDay(khmerRes, date);
  const nextHolyDay = holyDayCheck.isHoly ? undefined : findNextHolyDay(date);

  return {
    solar: {
      gregorianFormattedKh,
      gregorianFormattedEn,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      dayOfWeekNameKh: dayOfWeekKh,
      dayOfWeekNameEn: dayOfWeekEn,
    },
    lunar: {
      fullKhmerFormatted: momentkh.format(khmerRes),
      day: khmerRes.khmer.day,
      dayKh: toKhmerDigits(khmerRes.khmer.day),
      moonPhase: khmerRes.khmer.moonPhase,
      moonPhaseName: khmerRes.khmer.moonPhaseName,
      monthName: khmerRes.khmer.monthName,
      beYear: khmerRes.khmer.beYear,
      beYearKh: toKhmerDigits(khmerRes.khmer.beYear),
      animalYearName: khmerRes.khmer.animalYearName,
      animalEmoji,
      sakName: khmerRes.khmer.sakName,
    },
    holyDay: {
      isHolyDay: holyDayCheck.isHoly,
      holyDayType: holyDayCheck.type,
      nextHolyDay,
    },
  };
}

/**
 * Formats Khmer Calendar information as a Telegram Markdown message.
 */
export function formatKhmerCalendarMessage(date: Date = new Date()): string {
  const cal = getKhmerCalendar(date);

  let holyDaySection = "";
  if (cal.holyDay.isHolyDay) {
    holyDaySection = `🙏 *ថ្ងៃនេះជាថ្ងៃសីល (ឧបោសថសីល)*\n👉 *ប្រភេទ:* ${cal.holyDay.holyDayType}\n`;
  } else if (cal.holyDay.nextHolyDay) {
    const daysText =
      cal.holyDay.nextHolyDay.daysRemaining === 1
        ? "ស្អែកនេះ"
        : `នៅសល់ ${toKhmerDigits(cal.holyDay.nextHolyDay.daysRemaining)} ថ្ងៃទៀត`;

    holyDaySection =
      `⚪️ *ថ្ងៃនេះមិនមែនជាថ្ងៃសីលទេ*\n` +
      `🔜 *ថ្ងៃសីលបន្ទាប់:* ${cal.holyDay.nextHolyDay.dateKh}\n` +
      `   (${cal.holyDay.nextHolyDay.lunarDesc} - ${daysText})\n`;
  }

  return (
    `📅 *ប្រតិទិនខ្មែរ (Solar & Khmer Lunar)*\n\n` +
    `☀️ *សុរិយគតិ (Solar/Gregorian):*\n` +
    `• ${cal.solar.gregorianFormattedKh}\n` +
    `• ${cal.solar.gregorianFormattedEn}\n\n` +
    `🌙 *ចន្ទគតិ (Khmer Lunar):*\n` +
    `• *${cal.lunar.fullKhmerFormatted}*\n` +
    `• *ខ្នើត/រោច:* ${cal.lunar.dayKh}${cal.lunar.moonPhaseName} ខែ${cal.lunar.monthName}\n` +
    `• *ឆ្នាំសត្វ:* ឆ្នាំ${cal.lunar.animalYearName} ${cal.lunar.animalEmoji} (${cal.lunar.sakName})\n` +
    `• *ពុទ្ធសករាជ:* ព.ស. ${cal.lunar.beYearKh}\n\n` +
    `${holyDaySection}`
  );
}
