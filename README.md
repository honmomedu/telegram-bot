# 🤖 Telegram Assistant Bot (TypeScript / Node.js)

A production-ready Telegram Bot built with **grammY**, **@google/genai** (Google Gemini 2.5 Flash), **Solar & Khmer Lunar Calendar (ចន្ទគតិខ្មែរ)**, and **Live Currency Exchange Rates**.

Features a **Dual Execution Architecture**:
- 💻 **Local Development**: Instant testing using Telegram **Long Polling** (`npm run dev`) without needing `ngrok` or tunneling.
- ☁️ **Production Deployment**: High-performance **Vercel Serverless Function** (`api/webhook.ts`) responding to Telegram Webhooks.

---

## 🌟 Key Features

### 1. 🤖 Gemini AI Chatbot (`@google/genai`)
- Powered by Google's official `@google/genai` SDK using `gemini-2.5-flash`.
- Fluent in **Khmer (ភាសាខ្មែរ)** and **English**.
- Triggered by command `/ai <question>` or simply by typing any message in private chat.
- In group chats, responds when mentioned or replied to.
- Telegram message length handling (safely handles responses up to 4096 characters).

### 2. 📅 Khmer Lunar & Solar Calendar (ប្រតិទិនចន្ទគតិខ្មែរ)
- Computes both **Solar (Gregorian)** and authentic **Khmer Lunar (Chhankitek)** dates:
  - ថ្ងៃខ្នើត/រោច (Waxing/Waning phases e.g., ៨កើត, ១៥កើត, ៨រោច, etc.)
  - ខែចន្ទគតិ (Khmer lunar months e.g., ចេត្រ, ពិសាខ, ស្រាពណ៍...)
  - ឆ្នាំសត្វ (Zodiac animals e.g., ឆ្នាំមមី 🐎, ឆ្នាំរោង 🐉...)
  - ស័ក (Sak era e.g., អដ្ឋស័ក, ឆស័ក...)
  - ពុទ្ធសករាជ (Buddhist Era e.g., ព.ស. ២៥៧០)
  - ថ្ងៃសីល (Buddhist Holy Day / Uposatha day detector for ៨កើត, ១៥កើត, ៨រោច, ១៤/១៥រោច with countdown to the next holy day).
- Command: `/calendar` or `/date` or via persistent button.

### 3. 💱 Real-Time Currency Exchange Rates (អត្រាប្តូរប្រាក់)
- Fetches real-time market rates from high-availability open FX feeds.
- Currencies tracked:
  - 🇺🇸 **USD** -> 🇰🇭 **KHR**
  - 🇹🇭 **THB** -> 🇰🇭 **KHR** (and KHR -> THB)
  - 🇪🇺 **EUR** -> 🇰🇭 **KHR**
  - 🇨🇳 **CNY** -> 🇰🇭 **KHR**
  - 🇸🇬 **SGD** -> 🇰🇭 **KHR**
  - 🇬🇧 **GBP** -> 🇰🇭 **KHR**
  - 🇯🇵 **JPY** (per 100 JPY) -> 🇰🇭 **KHR**
  - 🇻🇳 **VND** (per 1,000 VND) -> 🇰🇭 **KHR**
- Built-in 15-minute in-memory caching to avoid unnecessary API requests and rate limits.
- Command: `/exchange` or `/rate` or via persistent button with one-click refresh button.

### 4. 🎛 Interactive Keyboards & Menus
- **Main Persistent Reply Keyboard**: Quick-access buttons (`📅 ប្រតិទិនចន្ទគតិ`, `💱 អត្រាប្តូរប្រាក់`, `🤖 សួរ Gemini AI`, `ℹ️ ជំនួយ`).
- **Inline Action Buttons**: Refresh rates, reload calendar, switch views.

---

## 📁 Project Structure

```text
telegram-bot/
├── api/
│   └── webhook.ts              # Vercel serverless function entrypoint (Telegram Webhook)
├── src/
│   ├── bot.ts                  # Bot initialization, command handlers & middleware
│   ├── config.ts               # Environment variable validation & type safety
│   ├── local.ts                # Local development entrypoint (Long Polling)
│   ├── modules/
│   │   ├── gemini.ts           # Google Gen AI SDK integration & prompt setup
│   │   ├── khmerCalendar.ts    # Solar & Khmer Lunar calendar logic
│   │   └── exchangeRate.ts     # Currency exchange rate fetcher & caching
│   └── keyboards/
│       └── menu.ts             # Reply & Inline keyboards
├── test/
│   ├── test-modules.ts         # Module automated tests
│   └── test-webhook.ts         # Serverless webhook health-check tests
├── .env.example                # Example environment variables template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment routes configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v24 recommended)
- **Telegram Bot Token**: Get one for free from [@BotFather](https://t.me/BotFather) on Telegram.
- **Google Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation

Clone this repository and install dependencies:

```bash
cd telegrambot
npm install
```

### 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your actual keys:

```env
# Your Bot Token from @BotFather
BOT_TOKEN=123456789:ABCDefghIJKlmnoPQRstuvWXYZ

# Your Google AI Studio API Key
GEMINI_API_KEY=AIzaSyD...your_gemini_api_key

# Optional: Gemini model (default: gemini-2.5-flash)
GEMINI_MODEL=gemini-2.5-flash

# Optional: Secret token to verify Telegram webhook requests in production
WEBHOOK_SECRET=your_custom_secret_string_123

# Environment
NODE_ENV=development
```

---

## 💻 Local Development (Long Polling)

You can develop and test the bot locally **without ngrok, public IP, or port forwarding**:

```bash
# Run with hot reloading
npm run dev

# Or run directly
npm start
```

When started, the bot automatically clears any existing webhook and starts long polling Telegram's servers. You can open your Telegram app and message the bot immediately!

---

## ☁️ Production Deployment on Vercel

Vercel provides a free serverless platform ideal for Telegram Webhooks.

### Step 1: Deploy to Vercel

#### Option A: Via GitHub (Recommended)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your repository.
4. In **Project Settings > Environment Variables**, add:
   - `BOT_TOKEN`: `your_telegram_bot_token`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `WEBHOOK_SECRET`: `your_secret_token` (e.g., `MySecret123_SecureToken`)
   - `NODE_ENV`: `production`
5. Click **Deploy**.

#### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

### Step 2: Set Telegram Webhook

Once deployed, your Vercel URL will look like: `https://your-bot-name.vercel.app`.

Register your webhook with Telegram by running this `curl` command in your terminal (replace `<BOT_TOKEN>`, `<VERCEL_URL>`, and `<WEBHOOK_SECRET>`):

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<VERCEL_URL>/api/webhook&secret_token=<WEBHOOK_SECRET>"
```

Expected response from Telegram:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Step 3: Verify Deployment
- Visit `https://<VERCEL_URL>/api/webhook` in your browser: You should see:
  ```json
  {
    "status": "online",
    "service": "Telegram Bot Webhook",
    "runtime": "Vercel Serverless (Node.js)",
    "timestamp": "..."
  }
  ```
- Check webhook info from Telegram:
  ```bash
  curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
  ```

---

## 🧪 Testing and Verification

Run the test suite to verify all modules and endpoints:

```bash
# Run unit and integration tests
npm test

# Type-check TypeScript code
npm run typecheck

# Build TypeScript to ./dist
npm run build
```

---

## 📋 Bot Commands Reference

| Command | Description |
| :--- | :--- |
| `/start` | Start bot, display greeting, and show interactive buttons |
| `/calendar` or `/date` | Display Solar date, Khmer Lunar date, and ថ្ងៃសីល status |
| `/exchange` or `/rate` | Display real-time currency exchange rates (USD, KHR, THB, etc.) |
| `/ai <prompt>` | Query Google Gemini AI |
| `/help` | Show command usage and tips |

---

## 📄 License

MIT
