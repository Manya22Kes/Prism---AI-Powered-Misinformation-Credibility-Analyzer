import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ [AI Config] GEMINI_API_KEY is unconfigured in environment.");
}

// Temporarily isolate gcloud ADC credentials to prevent @google/genai from inheriting OAuth scope collisions
const originalGcloudCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

if (originalGcloudCreds) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGcloudCreds;
}

export default ai;
