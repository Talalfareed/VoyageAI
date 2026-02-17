
import { GoogleGenAI, Type } from "@google/genai";
import { TripPreferences, Itinerary, DayPlan } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIImage = async (searchTerm: string, isPortrait: boolean = false): Promise<string> => {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A professional, breathtaking travel photograph of ${searchTerm}. High resolution, 4k, cinematic lighting, vibrant colors, National Geographic style. No text, no people, just the scenery or food.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: isPortrait ? "9:16" : "16:9",
      },
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data found in response");
};

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    itineraryName: { type: Type.STRING },
    totalBudgetEstimate: { type: Type.STRING },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.NUMBER },
          title: { type: Type.STRING },
          dayHeroImageSearchTerm: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeOfDay: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING },
                location: { type: Type.STRING },
                googleMapsUrl: { type: Type.STRING },
                travelTimeNext: { type: Type.STRING },
                whyIncluded: { type: Type.STRING },
                imageSearchTerm: { type: Type.STRING },
              },
              required: ["timeOfDay", "title", "description", "duration", "location", "whyIncluded", "imageSearchTerm", "googleMapsUrl"]
            }
          },
          foodRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                meal: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                imageSearchTerm: { type: Type.STRING },
                googleMapsUrl: { type: Type.STRING },
              },
              required: ["meal", "name", "description", "imageSearchTerm", "googleMapsUrl"]
            }
          },
          localTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["dayNumber", "title", "activities", "foodRecommendations", "localTips", "dayHeroImageSearchTerm"]
      }
    }
  },
  required: ["itineraryName", "days"]
};

export const generateItinerary = async (prefs: TripPreferences): Promise<Itinerary> => {
  const prompt = `Create a highly detailed, visually descriptive travel itinerary for ${prefs.destination} for ${prefs.days} days.
  Themes: ${prefs.themes.join(', ')}.
  Pace: ${prefs.pace}.
  Daily travel radius: ${prefs.radius}km.
  Extra requirements: ${prefs.constraints.join(', ')}.
  
  CRITICAL: For every activity and food recommendation, provide a 'googleMapsUrl' (search link like https://www.google.com/maps/search/?api=1&query=LocationName).
  Provide a specific 'imageSearchTerm' (2-4 words) for AI image generation.
  
  Ensure activities are logically grouped by geography.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: itinerarySchema
    }
  });

  return JSON.parse(response.text);
};

export const regenerateDayPlan = async (prefs: TripPreferences, dayNumber: number, existingItinerary: Itinerary): Promise<DayPlan> => {
  const prompt = `Regenerate Day ${dayNumber} for the itinerary "${existingItinerary.itineraryName}" in ${prefs.destination}.
  Preferences: Pace: ${prefs.pace}, Themes: ${prefs.themes.join(', ')}.
  Keep it different from the previous version of this day if possible, but maintain the flow with surrounding days.
  Surrounding context: This is day ${dayNumber} of ${prefs.days}.
  
  Return ONLY the JSON for this specific day according to the day object schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: (itinerarySchema.properties.days as any).items
    }
  });

  return JSON.parse(response.text);
};
