import { GoogleGenAI } from "@google/genai";
import { Client } from "../types";

// Função para obter o cliente AI de forma segura, evitando erro no carregamento inicial
const getAIClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  return new GoogleGenAI({ apiKey });
};

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
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `Olá ${client.name}! Lembrete do ${client.appName}. Link: ${paymentLink}`;
  } catch (error) {
    console.error("AI Error:", error);
    return `Olá ${client.name}! Lembrete de pagamento do app ${client.appName}. Link: ${paymentLink}`;
  }
};