
import { GoogleGenAI } from "@google/genai";
import { Client } from "../types";

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
    // Corrected initialization: directly use process.env.API_KEY as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using ai.models.generateContent directly with model name and contents prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Using the .text property directly.
    return response.text || `Olá ${client.name}! Lembrete do ${client.appName}. Link: ${paymentLink}`;
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback message if AI fails or key is missing
    return `Olá ${client.name}! Lembrete de pagamento do app ${client.appName}. Valor: R$ ${client.monthlyValue.toFixed(2)}. Link: ${paymentLink}`;
  }
};
