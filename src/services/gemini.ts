import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log("VITE_GEMINI_API_KEY status:", API_KEY ? "Loaded" : "Not Found");

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const geminiService = {
    analyzeProduct: async (productName: string, description: string) => {
        if (!genAI) {
            await new Promise(r => setTimeout(r, 1500));
            return "✨ (Simulação IA) Este produto é uma peça de devocão única, ideal para momentos de oração profunda. Sua qualidade superior garante durabilidade, e o design inspira paz e recolhimento. Perfeito para presentear alguém especial ou para seu altar pessoal.";
        }
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            const prompt = `Atue como um especialista em artigos religiosos católicos. Analise este produto: ${productName} - ${description}. Escreva um parágrafo curto e persuasivo (máximo 50 palavras) sobre 'Por que vale a pena?'. Use tom solene e acolhedor.`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (e) {
            console.error(e);
            return "Não foi possível conectar à IA no momento.";
        }
    },
    chat: async (message: string) => {
        if (!genAI) {
            await new Promise(r => setTimeout(r, 1000));
            return "A Paz de Cristo! Sou o assistente virtual da Lojinhas das Graças. No momento estou operando em modo de demonstração, mas estou aqui para ajudar você a encontrar os melhores artigos para sua fé.";
        }
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
            const prompt = `Você é um assistente virtual da loja 'Lojinhas das Graças', especializado em artigos religiosos. Responda de forma curta e gentil: ${message}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (e) {
            return "Desculpe, estou em manutenção.";
        }
    },
    editImage: async (_image: string, _prompt: string) => {
        await new Promise(r => setTimeout(r, 3000));
        return "https://images.unsplash.com/photo-1548625361-ec880bb23bc1?auto=format&fit=crop&q=80&w=1000&sat=150";
    },
    generateBlogPost: async (reference: string) => {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!API_KEY) {
            console.error("ERRO: API Key não configurada.");
            throw new Error("Chave de API não configurada.");
        }

        try {
            console.log("Iniciando geração via REST API para:", reference);

            const prompt = `
            Você é um teólogo católico da 'Lojinhas das Graças'. 
            Escreva um blog sobre: "${reference}".
            Retorne APENAS um JSON válido seguindo esta estrutura:
            {
                "title": "Título inspirador",
                "excerpt": "Resumo de 2 linhas",
                "content": "Conteúdo completo com 3 parágrafos. Use \\n para quebras de linha.",
                "category": "Hagiografia",
                "author": "Assistente das Graças",
                "image": "https://images.unsplash.com/photo-1544764200-d834fd210a23?q=80&w=800"
            }
            `;

            // Call Gemini API directly via REST
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Erro da API Gemini:", response.status, errorData);
                throw new Error(`API Error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            console.log("Resposta da API recebida:", data);

            // Extract text from response
            const text = data.candidates[0].content.parts[0].text
                .replace(/```json|```/g, '')
                .trim();

            console.log("Texto extraído:", text);
            return text;

        } catch (e: any) {
            console.error("Erro detalhado no Gemini:", e.message || e);
            throw e;
        }
    }
};
