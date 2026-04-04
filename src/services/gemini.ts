import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Location } from "../types";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};

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
         Search Google for more precise information about this place, its history, and the best time to visit.`
      : `Search for information about "${locationName}". 
         If you find it, provide a precise description and the best time to visit. 
         If you cannot find specific crowd data for this exact location in our records, say "We are working on it and let you know as soon as possible."`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Insights Error:", error);
    return { text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

export const getRealtimeTraffic = async (locationName: string, lat?: number, lng?: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Search for current real-time traffic and crowd density for "${locationName}" at coordinates ${lat}, ${lng}. 
                 Provide a concise summary of the current situation and the best time to visit today.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Traffic Error:", error);
    throw error;
  }
};

export const getNewLocationDetails = async (locationName: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Find the following details for the place "${locationName}":
                 1. Official Name
                 2. Short Description (max 100 chars)
                 3. Estimated Capacity (approximate number of people it can hold)
                 4. Latitude and Longitude
                 5. Full Address
                 Return ONLY a JSON object.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            capacity: { type: Type.NUMBER },
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
            address: { type: Type.STRING }
          },
          required: ["name", "description", "capacity", "latitude", "longitude"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Auto-Create Error:", error);
    return null;
  }
};

export const getLiveTrend = async (locationName: string, capacity: number) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze the current crowd situation for "${locationName}". 
                 Based on real-time data (search if needed), generate a simulated trend for the last 30 minutes.
                 The capacity is ${capacity}.
                 Return a list of 7 data points (one every 5 minutes).
                 Each point should have:
                 1. timestamp (ISO string, starting from 30 mins ago)
                 2. crowdCount (number, must be <= capacity)
                 Return ONLY a JSON object with a "trend" array.`,
      config: {
        tools: [{ googleSearch: {} }],
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
                  crowdCount: { type: Type.NUMBER }
                },
                required: ["timestamp", "crowdCount"]
              }
            }
          },
          required: ["trend"]
        }
      },
    });

    return JSON.parse(response.text).trend;
  } catch (error) {
    console.error("Live Trend Error:", error);
    return null;
  }
};
