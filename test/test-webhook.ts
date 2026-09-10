process.env.NODE_ENV = "test";
process.env.BOT_TOKEN = "123456789:AAABBBCCCDDDEEEFFFGGGHHH";

import webhookHandler from "../api/webhook.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

async function testWebhook() {
  console.log("--------------------------------------------------");
  console.log("🧪 Testing Vercel Webhook Endpoint Handler...");
  console.log("--------------------------------------------------");

  let statusCode = 0;
  let jsonOutput: any = null;

  const mockReq = {
    method: "GET",
    headers: {},
  } as unknown as VercelRequest;

  const mockRes = {
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          jsonOutput = data;
          return data;
        },
      };
    },
  } as unknown as VercelResponse;

  await webhookHandler(mockReq, mockRes);

  if (statusCode === 200 && jsonOutput?.status === "online") {
    console.log("✅ PASS: GET /api/webhook returns 200 online health status");
    console.log("Response:", JSON.stringify(jsonOutput, null, 2));
  } else {
    console.error("❌ FAIL: Webhook handler returned:", statusCode, jsonOutput);
    process.exit(1);
  }
}

testWebhook().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
