/**
 * Currency Exchange Rate Module
 * Fetches real-time exchange rates (USD, KHR, THB, EUR, CNY, VND, etc.)
 * with in-memory caching and formatted Telegram messages.
 */

export interface ExchangeRatesData {
  base: string;
  lastUpdated: string;
  nextUpdate?: string;
  rates: {
    USD_KHR: number;
    THB_KHR: number;
    KHR_THB: number;
    EUR_KHR: number;
    CNY_KHR: number;
    VND_1K_KHR: number; // Rate per 1,000 VND
    JPY_100_KHR: number; // Rate per 100 JPY
    GBP_KHR: number;
    SGD_KHR: number;
  };
}

interface CachedData {
  data: ExchangeRatesData;
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache
let cachedExchangeRates: CachedData | null = null;

/**
 * Format number with localized thousand separators and fixed decimal places
 */
export function formatCurrencyNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Fetches latest exchange rates from open FX API with fallback and caching.
 */
export async function getExchangeRates(forceRefresh = false): Promise<ExchangeRatesData> {
  const now = Date.now();

  if (!forceRefresh && cachedExchangeRates && now - cachedExchangeRates.timestamp < CACHE_TTL_MS) {
    return cachedExchangeRates.data;
  }

  const endpoints = [
    "https://open.er-api.com/v6/latest/USD",
    "https://api.exchangerate-api.com/v4/latest/USD",
  ];

  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "TelegramBot/1.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} from ${url}`);
      }

      const json = (await response.json()) as {
        rates?: Record<string, number>;
        time_last_update_utc?: string;
        date?: string;
      };

      const rawRates = json.rates;
      if (!rawRates || !rawRates["KHR"]) {
        throw new Error(`Invalid response format or missing KHR from ${url}`);
      }

      const usdToKhr = rawRates["KHR"];
      const usdToThb = rawRates["THB"] || 34.0;
      const usdToEur = rawRates["EUR"] || 0.92;
      const usdToCny = rawRates["CNY"] || 7.2;
      const usdToVnd = rawRates["VND"] || 25000;
      const usdToJpy = rawRates["JPY"] || 155;
      const usdToGbp = rawRates["GBP"] || 0.79;
      const usdToSgd = rawRates["SGD"] || 1.34;

      const data: ExchangeRatesData = {
        base: "USD",
        lastUpdated: json.time_last_update_utc || new Date().toUTCString(),
        rates: {
          USD_KHR: usdToKhr,
          THB_KHR: usdToKhr / usdToThb,
          KHR_THB: usdToThb / usdToKhr,
          EUR_KHR: usdToKhr / usdToEur,
          CNY_KHR: usdToKhr / usdToCny,
          VND_1K_KHR: (1000 * usdToKhr) / usdToVnd,
          JPY_100_KHR: (100 * usdToKhr) / usdToJpy,
          GBP_KHR: usdToKhr / usdToGbp,
          SGD_KHR: usdToKhr / usdToSgd,
        },
      };

      cachedExchangeRates = {
        data,
        timestamp: now,
      };

      return data;
    } catch (err) {
      lastError = err as Error;
    }
  }

  // If both endpoints fail and we have a cached version (even if stale), return it
  if (cachedExchangeRates) {
    return cachedExchangeRates.data;
  }

  throw new Error(`Failed to fetch exchange rates: ${lastError?.message}`);
}

/**
 * Format Exchange Rates data as a Telegram Markdown message.
 */
export async function formatExchangeRateMessage(forceRefresh = false): Promise<string> {
  const data = await getExchangeRates(forceRefresh);
  const r = data.rates;

  // Format timestamp in Phnom Penh / Indochina Time (UTC+7)
  const updateDate = new Date(data.lastUpdated);
  const timeStr = !isNaN(updateDate.getTime())
    ? updateDate.toLocaleString("km-KH", {
        timeZone: "Asia/Phnom_Penh",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : data.lastUpdated;

  return (
    `💱 *អត្រាប្តូរប្រាក់លើទីផ្សារ (Exchange Rates)*\n\n` +
    `🇺🇸 1 USD  = *${formatCurrencyNumber(r.USD_KHR)} ៛*\n` +
    `🇹🇭 1 THB  = *${formatCurrencyNumber(r.THB_KHR)} ៛* ` +
    `_(10,000 ៛ = ${formatCurrencyNumber(10000 * r.KHR_THB, 1)} ฿)_\n` +
    `🇪🇺 1 EUR  = *${formatCurrencyNumber(r.EUR_KHR)} ៛*\n` +
    `🇨🇳 1 CNY  = *${formatCurrencyNumber(r.CNY_KHR)} ៛*\n` +
    `🇸🇬 1 SGD  = *${formatCurrencyNumber(r.SGD_KHR)} ៛*\n` +
    `🇬🇧 1 GBP  = *${formatCurrencyNumber(r.GBP_KHR)} ៛*\n` +
    `🇯🇵 100 JPY = *${formatCurrencyNumber(r.JPY_100_KHR)} ៛*\n` +
    `🇻🇳 1,000 VND = *${formatCurrencyNumber(r.VND_1K_KHR)} ៛*\n\n` +
    `⏱ _ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ${timeStr} (ICT)_\n` +
    `ℹ️ _អត្រាប្តូរប្រាក់នេះគឺផ្អែកលើទីផ្សារអន្តរជាតិ (Open FX Market)_`
  );
}
