import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ChatResponse {
    text: string;
    link?: { label: string; url: string };
}

// Keyword-based fallback with smart navigation links
const keywordFallbacks: Array<{ keywords: string[]; response: ChatResponse }> = [
    {
        keywords: ['terço', 'rosário', 'rosario', 'terco'],
        response: {
            text: "Temos terços lindíssimos: de madeira, cristal, sintético e muito mais! 📿",
            link: { label: "Ver Terços", url: "/?cat=Terço" }
        }
    },
    {
        keywords: ['imagem', 'santa', 'são', 'sao', 'santo', 'sagrada família', 'nossa senhora', 'jesus', 'cristal', 'terezinha', 'sacra'],
        response: {
            text: "Nossas imagens sacras são confeccionadas com muito cuidado e devoção. 🕊️",
            link: { label: "Ver Imagens Sacras", url: "/?cat=Imagem Sacra" }
        }
    },
    {
        keywords: ['livro', 'bíblia', 'biblia', 'oração', 'oracao', 'devocional'],
        response: {
            text: "Temos bíblias e livros de oração selecionados para fortalecer a sua fé!",
            link: { label: "Ver Bíblias", url: "/?cat=Bíblia" }
        }
    },
    {
        keywords: ['véu', 'veu', 'camisa', 'roupa', 'vestuário', 'vestimenta'],
        response: {
            text: "Confira nossa linha completa de artigos de vestuário religioso!",
            link: { label: "Ver Camisas", url: "/?cat=Camisa" }
        }
    },
    {
        keywords: ['crucifixo', 'cruz', 'crucifixos'],
        response: {
            text: "Temos crucifixos de vários estilos para decorar e enriquecer sua fé. ✝️",
            link: { label: "Ver Crucifixos", url: "/?cat=Crucifixo" }
        }
    },
    {
        keywords: ['caneca', 'presente', 'lembrança', 'lembrancinhas'],
        response: {
            text: "Que bom! Temos presentes religiosos incríveis para toda ocasião. 🎁",
            link: { label: "Ver Lembrancinhas", url: "/?cat=Lembrancinhas" }
        }
    },
    {
        keywords: ['frete', 'entrega', 'prazo', 'envio'],
        response: {
            text: "Entregamos para todo o Brasil! O prazo e frete são calculados no carrinho com base no seu CEP.",
            link: { label: "Ver Produtos", url: "/" }
        }
    },
    {
        keywords: ['pagamento', 'pix', 'parcel', 'cartão', 'boleto'],
        response: {
            text: "Aceitamos Pix, cartão de crédito parcelado e boleto. Pagamento 100% seguro! 😊",
            link: { label: "Ver Produtos", url: "/" }
        }
    },
    {
        keywords: ['oferta', 'promoção', 'promocao', 'desconto', 'barato', 'preço'],
        response: {
            text: "Temos ótimas ofertas com preços especiais esperando por você!",
            link: { label: "Ver Ofertas", url: "/?q=oferta" }
        }
    },
    {
        keywords: ['contato', 'whatsapp', 'falar com', 'atendimento', 'ajuda'],
        response: {
            text: "Você pode falar conosco pelo WhatsApp para um atendimento personalizado! 📱",
            link: { label: "Falar no WhatsApp", url: "https://wa.me/5511999999999" } // Note: User should update this number
        }
    },
];


const genericFallbacks: ChatResponse[] = [
    { text: "A Paz de Cristo! Posso ajudá-lo a encontrar o artigo religioso perfeito. O que está procurando?", link: { label: "Ver Catálogo", url: "/" } },
    { text: "Que bom ter sua visita! Temos artigos religiosos selecionados com muito amor. 🙏", link: { label: "Explorar Produtos", url: "/" } },
    { text: "A Paz de Cristo! 😊 Posso mostrar nossos produtos por categoria para facilitar sua busca.", link: { label: "Ver Catálogo", url: "/" } },
];

function getSmartFallback(message: string): ChatResponse {
    const lower = message.toLowerCase();
    for (const entry of keywordFallbacks) {
        if (entry.keywords.some(kw => lower.includes(kw))) {
            return entry.response;
        }
    }
    return genericFallbacks[Math.floor(Math.random() * genericFallbacks.length)];
}

async function callGemini(prompt: string): Promise<string | null> {
    if (!genAI) return null;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (e: any) {
        const isQuotaError =
            e?.message?.includes("quota") ||
            e?.status === 429 ||
            e?.message?.includes("RESOURCE_EXHAUSTED");
        if (!isQuotaError) console.error("Gemini API error:", e);
        return null;
    }
}

// Categories available for navigation
const CATEGORIES = [
    { name: "Imagem Sacra", keywords: ["imagem", "santa", "são", "sao", "santo", "nossa senhora", "jesus", "terezinha", "sagrada"] },
    { name: "Terço", keywords: ["terço", "terco", "rosário", "rosario"] },
    { name: "Bíblia", keywords: ["bíblia", "biblia", "livro", "oração"] },
    { name: "Crucifixo", keywords: ["crucifixo", "cruz"] },
    { name: "Camisa", keywords: ["camisa", "véu", "veu", "roupa"] },
    { name: "Caneca", keywords: ["caneca", "xícara"] },
    { name: "Lembrancinhas", keywords: ["lembrancinha", "presente", "brinde"] },
    { name: "Acessórios", keywords: ["acessório", "acessorio"] },
    { name: "Quadro", keywords: ["quadro", "imagem parede", "gravura"] },
];

function detectNavigationIntent(text: string): ChatResponse["link"] | undefined {
    const lower = text.toLowerCase();

    // Specific saints or highly specific products should trigger a search
    const specificTerms = [
        "santa terezinha", "santo antônio", "santo antonio", "são josé", "sao jose",
        "nossa senhora", "sagrada família", "sagrada familia", "padre pio",
        "arcanjo", "benção", "bencao", "batizado", "primeira eucaristia", "crisma"
    ];

    for (const term of specificTerms) {
        if (lower.includes(term)) {
            // If it's a specific saint/devotion, search for it
            return { label: `Buscar "${term}"`, url: `/?q=${encodeURIComponent(term)}` };
        }
    }

    // Check for search intent with product name patterns
    const searchPatterns = [
        /procuro (?:um |uma |por )?(.+)/i,
        /busco (?:um |uma |por )?(.+)/i,
        /quero (?:ver |comprar )?(.+)/i,
        /tem (.+)\?/i,
        /onde (?:tem|fica) (.+)/i,
        /mostrar (.+)/i,
        /exibir (.+)/i
    ];

    for (const pattern of searchPatterns) {
        const match = lower.match(pattern);
        if (match) {
            const query = match[1].replace(/^(?:um|uma|o|a|os|as|por|de|do|da)\s+/i, '').trim();
            if (query.length > 2) {
                // Check if the query matches a known category first
                for (const cat of CATEGORIES) {
                    if (cat.keywords.some(kw => query.includes(kw))) {
                        return { label: `Ver ${cat.name}`, url: `/?cat=${encodeURIComponent(cat.name)}` };
                    }
                }
                return { label: `Buscar "${query}"`, url: `/?q=${encodeURIComponent(query)}` };
            }
        }
    }

    // Category detection from full message (if no specific search was found)
    for (const cat of CATEGORIES) {
        if (cat.keywords.some(kw => lower.includes(kw))) {
            return { label: `Ver ${cat.name}`, url: `/?cat=${encodeURIComponent(cat.name)}` };
        }
    }

    return undefined;
}


export const geminiService = {
    analyzeProduct: async (productName: string, description: string) => {
        const prompt = `Atue como um especialista em artigos religiosos católicos. Analise este produto: ${productName} - ${description}. Escreva um parágrafo curto e persuasivo (máximo 50 palavras) sobre 'Por que vale a pena?'. Use tom solene e acolhedor.`;
        const result = await callGemini(prompt);
        if (result) return result;
        return "✨ Uma peça de devoção única, ideal para momentos de oração profunda. Qualidade superior com durabilidade garantida, design que inspira paz e recolhimento. Perfeito para presentear alguém especial ou para seu altar pessoal.";
    },

    chat: async (message: string, whatsappNumber?: string): Promise<ChatResponse> => {
        const prompt = `Você é a 'Gracinh IA', assistente virtual da loja 'Lojinhas das Graças', especializada em artigos religiosos católicos. 
Responda de forma MUITO curta e gentil (máximo 1 frase, até 20 palavras).
Não inclua links nem URLs na resposta — apenas texto simples e acolhedor.
Pergunta do cliente: ${message}`;

        const rawText = await callGemini(prompt);

        if (rawText) {
            // AI responded successfully — detect navigation intent from user's original message
            const link = detectNavigationIntent(message);
            return { text: rawText.trim(), link };
        }

        // Fallback with dynamic WhatsApp if provided
        const response = getSmartFallback(message);
        if (whatsappNumber && response.link?.url.includes('wa.me')) {
            response.link.url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
        }
        return response;
    },

    editImage: async (image: string, prompt: string) => {
        console.log("[GeminiService] editImage requested:", { image, prompt });
        // Real implementation would use Gemini Pro Vision + Image Generation or an editing API
        // For now, we provide a more descriptive mock that explains it's a simulation
        await new Promise(r => setTimeout(r, 2000));
        return `${image}&auto=format&fit=crop&q=80&w=1000&sat=150&sepia=20`; // Simulates a filter
    },

    generateBlogPost: async (reference: string) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Chave de API não configurada.");

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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Erro da API Gemini:", response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text
            .replace(/```json|```/g, '')
            .trim();
    }
};
