
import { GoogleGenAI } from "@google/genai";
import { Client } from "../types";

// Always use the required initialization format with a named parameter and process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a personalized message for WhatsApp using Gemini.
 */
export const generatePersonalizedMessage = async (
  client: Client, 
  type: 'reminder' | 'overdue',
  paymentLink: string
): Promise<string> => {
  const prompt = `
    Você é o assistente virtual da empresa DevARO.
    Gere uma mensagem curta e amigável para o cliente ${client.name}.
    App: ${client.appName}. Valor: R$ ${client.monthlyValue.toFixed(2)}.
    Link: ${paymentLink}
    Tipo: ${type === 'reminder' ? 'Lembrete' : 'Atraso'}.
    Responda apenas com o texto da mensagem para WhatsApp.
  `;

  try {
    // Using ai.models.generateContent directly with model name and contents prompt.
    // Selecting gemini-3-flash-preview for basic text task.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Using the .text property directly (it is a property, not a method).
    return response.text || `Olá ${client.name}! Lembrete do ${client.appName}. Link: ${paymentLink}`;
  } catch (error) {
    console.error("AI Error:", error);
    return `Olá ${client.name}! Lembrete de pagamento do app ${client.appName}. Link: ${paymentLink}`;
  }
};
