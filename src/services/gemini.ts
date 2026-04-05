import { GoogleGenAI, Modality } from "@google/genai";
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
        contents: `You are a geographic data assistant with knowledge of world locations.
Return a JSON object for the place: "${locationName}"

The JSON must have exactly these fields:
- name: string (official name of the place)
- description: string (brief description, max 100 characters)
- capacity: number (estimated max visitors at once, e.g. a beach = 5000, a restaurant = 100)
- latitude: number (decimal degrees, e.g. 15.2993)
- longitude: number (decimal degrees, e.g. 74.1240)
- address: string (city, state/region, country)

For well-known places like cities, beaches, monuments, malls — you always have this data. Use your knowledge.
Do NOT refuse. Always return a best-estimate JSON.`,
        config: {
          // responseSchema removed — it causes silent empty responses on some inputs.
          // responseMimeType alone is sufficient to force JSON output.
          responseMimeType: "application/json",
        },
      })
    );

    const raw = response.text?.trim();
    if (!raw) {
      console.error("Auto-Create Error: Empty response from Gemini");
      return null;
    }

    // Extract JSON even if the model wraps it in markdown code fences
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw;

    const parsed = JSON.parse(jsonStr);

    // Validate required fields exist
    if (!parsed.name || !parsed.latitude || !parsed.longitude) {
      console.error("Auto-Create Error: Missing required fields in response", parsed);
      return null;
    }

    return parsed;
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

Return ONLY a valid JSON object like: { "trend": [ { "timestamp": "...", "crowdCount": 123 }, ... ] }`,
        config: {
          // responseSchema removed — causes silent failures on some Gemini versions.
          // responseMimeType alone is sufficient.
          responseMimeType: "application/json",
        },
      })
    );

    const raw = response.text?.trim();
    if (!raw) {
      // Fallback: generate a synthetic trend client-side
      return generateLocalTrend(capacity, now);
    }

    // Extract JSON even if wrapped in markdown fences
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw;
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed.trend) && parsed.trend.length > 0) {
      return parsed.trend;
    }
    return generateLocalTrend(capacity, now);
  } catch (error) {
    console.error("Live Trend Error:", error);
    // Always return something so the chart doesn't break
    return generateLocalTrend(capacity, new Date());
  }
};

/** Client-side synthetic trend fallback — used when the API fails. */
function generateLocalTrend(capacity: number, now: Date) {
  const base = Math.floor(capacity * 0.35);
  return Array.from({ length: 7 }, (_, i) => {
    const t = new Date(now.getTime() - (6 - i) * 5 * 60 * 1000);
    const jitter = Math.floor(Math.random() * capacity * 0.1);
    return {
      timestamp: t.toISOString(),
      crowdCount: Math.min(capacity, Math.max(0, base + jitter)),
    };
  });
}
