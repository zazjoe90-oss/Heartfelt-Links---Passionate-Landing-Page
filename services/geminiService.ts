
import { GoogleGenAI, Type } from "@google/genai";

export const generateBio = async (description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short, heartfelt, engaging, and professional social media "link-in-bio" summary (max 150 characters) based on this description: ${description}. Use a warm tone, include red heart emojis ❤️ or 💖, and make it feel very inviting and high-end.`,
    config: {
      temperature: 0.8,
      topP: 0.9,
      topK: 40,
    },
  });
  
  return response.text || "Spreading love & style! ❤️";
};

export const suggestLinks = async (niche: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 4 attractive link titles for a creator in the ${niche} niche. Make them feel personal and use a few emojis like ❤️, ✨, or 💖. Return only a comma-separated list.`,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
          }
      }
    });

    try {
        return JSON.parse(response.text || '[]');
    } catch (e) {
        return ["My Favorites ❤️", "Latest Work ✨", "Let's Connect 💖", "Monthly Letter 💌"];
    }
}
