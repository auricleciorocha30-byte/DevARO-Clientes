import { GoogleGenAI } from "@google/genai";
import { Client } from "../types";

const getApiKey = () => {
  try {
    return (window as any).process?.env?.API_KEY || "";
  } catch {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generatePersonalizedMessage = async (client: Client, type: 'reminder' | 'overdue'): Promise<string> => {
  const prompt = `
    Você é o assistente virtual da empresa DevARO.
    Gere uma mensagem curta e profissional em português para o cliente ${client.name}.
    Produto: ${client.appName}.
    Valor Mensal: R$ ${client.monthlyValue.toFixed(2)}.
    Dia de Vencimento: ${client.dueDay}.
    Tipo da mensagem: ${type === 'reminder' ? 'Lembrete de vencimento próximo' : 'Notificação de atraso de pagamento'}.
    
    A mensagem deve incluir:
    1. Saudação personalizada.
    2. Referência ao produto ${client.appName}.
    3. Um tom prestativo.
    4. Mencione que o link de pagamento está disponível.
    
    Seja conciso para WhatsApp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Olá! Gostaria de lembrar sobre o vencimento da sua mensalidade DevARO.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Olá! Sua mensalidade está próxima do vencimento. Entre em contato para receber seu link de pagamento.";
  }
};