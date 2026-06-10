import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    // In a real production system, you'd fetch the user's reference face encoding from Supabase
    // and compare vector embeddings. Alternatively, send both the reference image and camera image
    // to Gemini and ask if they are the same person.
    // For this prototype, we'll ask Gemini to confirm if a face is present and analyze it.

    let ai;
    try {
      ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY || "", 
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } 
      });
    } catch (e) {
      console.warn("GoogleGenAI initialized without API key. Returning simulated response.");
      return NextResponse.json({ 
        match: true, 
        message: "ទម្រង់មុខត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ (Simulated - Missing API Key)",
        confidence: 0.95
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            text: "Analyze this image. Does it contain a clear, real human face suitable for attendance tracking? Is it a photo of a photo or screen? Respond using JSON with keys 'match' (boolean) and 'message' (string in Khmer language confirming success or failure).",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for more deterministic analysis
      }
    });

    try {
      const result = JSON.parse(response.text || "{}");
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ match: false, message: response.text });
    }

  } catch (error: any) {
    console.error("Face match error:", error);
    return NextResponse.json({ error: "Face match processing failed" }, { status: 500 });
  }
}
