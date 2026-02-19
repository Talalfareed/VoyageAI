import { GoogleGenAI, Type } from "@google/genai";
import { TripPreferences, Itinerary, DayPlan } from "./types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set the API_KEY or GEMINI_API_KEY environment variable in Vercel.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAIImage = async (searchTerm: string, isPortrait: boolean = false): Promise<string> => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
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
        aspectRatio: isPortrait ? "9:16" : "1:1",
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
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
  const ai = getAI();
  const promptText = `Generate a highly personalized ${prefs.days}-day travel itinerary for ${prefs.destination}.
    Radius: ${prefs.radius}km.
    Themes: ${prefs.themes.join(', ')}.
    Pace: ${prefs.pace}.
    Constraints: ${prefs.constraints.join(', ')}.
    Budget Optimized: ${prefs.budgetAware}.
    
    Ensure geographic efficiency (group nearby locations). Provide descriptive and exciting search terms for images.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: promptText,
    config: {
      responseMimeType: "application/json",
      responseSchema: itinerarySchema,
    },
  });

  const text = response.text;
  if (typeof text !== 'string' || !text) {
    throw new Error("The AI returned an empty response.");
  }

  return JSON.parse(text) as Itinerary;
};

export const regenerateDayPlan = async (prefs: TripPreferences, dayNumber: number, currentItinerary: Itinerary): Promise<DayPlan> => {
  const ai = getAI();
  const promptText = `Regenerate ONLY Day ${dayNumber} for the trip to ${prefs.destination}. 
    Previous Context: ${currentItinerary.itineraryName}.
    Themes: ${prefs.themes.join(', ')}.
    Keep the flow natural with the other days but provide fresh activities.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: promptText,
    config: {
      responseMimeType: "application/json",
      responseSchema: (itinerarySchema.properties.days.items) as any,
    },
  });

  const text = response.text;
  if (typeof text !== 'string' || !text) {
    throw new Error("The AI returned an empty response.");
  }

  return JSON.parse(text) as DayPlan;
};