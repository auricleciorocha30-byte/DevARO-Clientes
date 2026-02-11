
import { GoogleGenAI } from "@google/genai";
import { Client } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
// Obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePersonalizedMessage = async (
  client: Client, 
  type: 'reminder' | 'overdue',
  paymentLink: string
): Promise<string> => {
  const prompt = `
    Você é o assistente virtual da empresa DevARO.
    Gere uma mensagem curta, direta e amigável em português para o cliente ${client.name}.
    Produto/App: ${client.appName}.
    Valor: R$ ${client.monthlyValue.toFixed(2)}.
    Vencimento: Dia ${client.dueDay}.
    Link de Pagamento: ${paymentLink}
    
    Tipo da mensagem: ${type === 'reminder' ? 'Lembrete de pagamento' : 'Aviso de cobrança atrasada'}.
    
    REGRAS CRÍTICAS:
    1. A mensagem deve ser curta (ideal para WhatsApp).
    2. Use emojis de forma profissional.
    3. INCLUA O LINK DE PAGAMENTO EXATO: ${paymentLink}
    4. Não peça para o cliente responder para receber o link, já envie o link na mensagem.
    5. O tom deve ser prestativo, nunca agressivo.
  `;

  try {
    // Must use ai.models.generateContent to query GenAI with both the model name and prompt.
    // Using gemini-3-flash-preview for basic text task.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Use response.text property directly to extract string output.
    return response.text || `Olá ${client.name}! Lembrete da mensalidade do ${client.appName}. Você pode pagar por aqui: ${paymentLink}`;
  } catch (error) {
    console.error("AI Error:", error);
    return `Olá ${client.name}! Gostaria de lembrar sobre o vencimento da sua mensalidade do app ${client.appName}. Link para pagamento: ${paymentLink}`;
  }
};
