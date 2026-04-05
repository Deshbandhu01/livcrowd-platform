import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Location } from "../types";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Resolve the Gemini API key.
 * Vite exposes env vars via import.meta.env (prefixed VITE_).
 */
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your .env file."
    );
  }
  return key;
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Simple delay helper.
 */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Retry a Gemini call with exponential back-off.
 * Handles 429 (quota) and 503 (overloaded) transparently.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 2000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const message =
        err instanceof Error ? err.message : String(err);
      const isRetryable =
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("overloaded") ||
        message.includes("503");

      if (isRetryable && attempt < maxAttempts) {
        const waitMs = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s …
        console.warn(
          `Gemini rate-limited. Retrying in ${waitMs / 1000}s (attempt ${attempt}/${maxAttempts})…`
        );
        await delay(waitMs);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Text-to-speech using Gemini TTS.
 * Falls back gracefully if the model is unavailable.
 */
export const generateSpeech = async (
  text: string
): Promise<string | undefined> => {
  try {
    const ai = getAI();
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      })
    );
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};

/**
 * Location insights using Google Search grounding.
 * NOTE: googleSearch and responseMimeType/JSON cannot be combined —
 *       this function returns plain text with grounding links.
 */
export const getLocationInsights = async (
  locationName: string,
  existingLocation?: Location
) => {
  try {
    const ai = getAI();
    const prompt = existingLocation
      ? `Provide detailed insights for "${locationName}".
         Current crowd in our database: ${existingLocation.currentCrowd}/${existingLocation.capacity}.
         Trend: ${existingLocation.trend}.
         Search for more precise information about this place, its history, and the best time to visit.`
      : `Search for information about "${locationName}".
         If you find it, provide a precise description and the best time to visit.
         If you cannot find specific crowd data for this exact location, say "We are working on it and will let you know as soon as possible."`;

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          // ⚠ Do NOT set responseMimeType here — incompatible with googleSearch
        },
      })
    );

    return {
      text: response.text,
      groundingChunks:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks,
    };
  } catch (error) {
    console.error("Insights Error:", error);
    return {
      text: `Sorry, I encountered an error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

/**
 * Real-time traffic summary using Google Search grounding.
 * Returns plain text — JSON mode is NOT compatible with googleSearch.
 */
export const getRealtimeTraffic = async (
  locationName: string,
  lat?: number,
  lng?: number
) => {
  try {
    const ai = getAI();
    const coords =
      lat !== undefined && lng !== undefined
        ? ` at coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}`
        : "";

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Search for current real-time traffic and crowd density for "${locationName}"${coords}.
                   Provide a concise 1–2 sentence summary of the current situation and the best time to visit today.`,
        config: {
          tools: [{ googleSearch: {} }],
          // ⚠ Do NOT set responseMimeType here — incompatible with googleSearch
        },
      })
    );

    return {
      text: response.text,
      groundingChunks:
        response.candidates?.[0]?.groundingMetadata?.groundingChunks,
    };
  } catch (error) {
    console.error("Traffic Error:", error);
    throw error;
  }
};

/**
 * Fetch details for a new location using JSON mode.
 * Uses plain text generation (NO googleSearch) so JSON mode works correctly.
 */
export const getNewLocationDetails = async (locationName: string) => {
  try {
    const ai = getAI();
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are a geographic data assistant.
Find the following details for the place "${locationName}":
1. Official Name
2. Short Description (max 100 chars)
3. Estimated Capacity (approximate number of people it can hold at once)
4. Latitude (decimal degrees)
5. Longitude (decimal degrees)
6. Full Address

If you do not know the exact coordinates or capacity, give your best reasonable estimate.
Return ONLY a valid JSON object with these fields:
name, description, capacity, latitude, longitude, address`,
        config: {
          // ⚠ No googleSearch here — use JSON mode only
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              capacity: { type: Type.NUMBER },
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER },
              address: { type: Type.STRING },
            },
            required: [
              "name",
              "description",
              "capacity",
              "latitude",
              "longitude",
            ],
          },
        },
      })
    );

    const raw = response.text?.trim();
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Auto-Create Error:", error);
    return null;
  }
};

/**
 * Generate a simulated live crowd trend for the last 30 minutes.
 * Uses JSON mode only (no googleSearch) to avoid API conflicts.
 */
export const getLiveTrend = async (
  locationName: string,
  capacity: number
) => {
  try {
    const ai = getAI();
    const now = new Date();

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are a crowd analytics assistant.
Generate a realistic simulated crowd trend for "${locationName}" (capacity: ${capacity}) over the last 30 minutes.
The current time is ${now.toISOString()}.
Return 7 data points, one every 5 minutes, starting from 30 minutes ago.
Each point must have:
  - timestamp: ISO 8601 string
  - crowdCount: integer between 0 and ${capacity}

Return ONLY a valid JSON object with a "trend" array.`,
        config: {
          // ⚠ No googleSearch here — use JSON mode only
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trend: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: { type: Type.STRING },
                    crowdCount: { type: Type.NUMBER },
                  },
                  required: ["timestamp", "crowdCount"],
                },
              },
            },
            required: ["trend"],
          },
        },
      })
    );

    const raw = response.text?.trim();
    if (!raw) return null;
    return JSON.parse(raw).trend;
  } catch (error) {
    console.error("Live Trend Error:", error);
    return null;
  }
};
