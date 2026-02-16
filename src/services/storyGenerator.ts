
export async function generateStoryCard(data: {
    title: string;
    image: string;
    excerpt: string;
    storeName: string;
}): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Instagram Story Dimensions
    canvas.width = 1080;
    canvas.height = 1920;

    // 1. Background - Elegant Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1c1917'); // stone-900
    gradient.addColorStop(1, '#0c0a09'); // stone-950
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Load and Draw Main Image
    const postImg = new Image();

    try {
        // Usamos um Proxy de Imagem (weserv.nl) para contornar problemas de CORS
        // Ele baixa a imagem no servidor deles e nos entrega com os headers corretos.
        const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(data.image)}&w=800`;

        await new Promise((resolve, reject) => {
            postImg.crossOrigin = "anonymous";
            postImg.onload = resolve;
            postImg.onerror = (e) => {
                console.error('StoryGenerator: Erro crítico ao carregar imagem via proxy:', e);
                reject(e);
            };
            postImg.src = proxiedUrl;
        });

        // 2.1 Draw blurred background image for depth
        ctx.save();
        ctx.filter = 'blur(100px) opacity(0.3)';
        const bgScale = Math.max(canvas.width / postImg.width, canvas.height / postImg.height);
        const bgW = postImg.width * bgScale;
        const bgH = postImg.height * bgScale;
        ctx.drawImage(postImg, (canvas.width - bgW) / 2, (canvas.height - bgH) / 2, bgW, bgH);
        ctx.restore();

        // 2.2 Draw Central Image Frame
        const frameW = 860;
        const frameH = 860;
        const frameX = (canvas.width - frameW) / 2;
        const frameY = 250;

        ctx.save();
        const radius = 40;
        ctx.beginPath();
        ctx.moveTo(frameX + radius, frameY);
        ctx.lineTo(frameX + frameW - radius, frameY);
        ctx.quadraticCurveTo(frameX + frameW, frameY, frameX + frameW, frameY + radius);
        ctx.lineTo(frameX + frameW, frameY + frameH - radius);
        ctx.quadraticCurveTo(frameX + frameW, frameY + frameH, frameX + frameW - radius, frameY + frameH);
        ctx.lineTo(frameX + radius, frameY + frameH);
        ctx.quadraticCurveTo(frameX, frameY + frameH, frameX, frameY + frameH - radius);
        ctx.lineTo(frameX, frameY + radius);
        ctx.quadraticCurveTo(frameX, frameY, frameX + radius, frameY);
        ctx.closePath();
        ctx.clip();

        const scale = Math.max(frameW / postImg.width, frameH / postImg.height);
        const x = frameX + (frameW - postImg.width * scale) / 2;
        const y = frameY + (frameH - postImg.height * scale) / 2;
        ctx.drawImage(postImg, x, y, postImg.width * scale, postImg.height * scale);
        ctx.restore();

    } catch (err) {
        console.warn('StoryGenerator: Fallback visual aplicado.', err);
        // Design de Fallback: Aura Dourada
        const gradientImg = ctx.createLinearGradient(100, 250, 980, 1110);
        gradientImg.addColorStop(0, '#D4AF37');
        gradientImg.addColorStop(1, '#B8860B');
        ctx.fillStyle = gradientImg;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(100, 250, 880, 860);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 4;
        ctx.strokeRect(100, 250, 880, 860);
    }

    // 3. Text Elements
    ctx.fillStyle = '#D4AF37'; // brand-gold
    ctx.textAlign = 'center';

    // Title
    ctx.font = '700 80px serif';
    const titleLines = wrapText(ctx, data.title.toUpperCase(), 900);
    titleLines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 1250 + (i * 100));
    });

    // Separator
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 1420);
    ctx.lineTo(canvas.width / 2 + 100, 1420);
    ctx.stroke();

    // Excerpt / Quote
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'italic 50px serif';
    const excerptLines = wrapText(ctx, `"${data.excerpt}"`, 800).slice(0, 3);
    excerptLines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 1530 + (i * 70));
    });

    // Footer - Store Name
    ctx.fillStyle = '#D4AF37';
    ctx.font = '700 30px sans-serif';
    ctx.letterSpacing = '10px';
    ctx.fillText(data.storeName.toUpperCase(), canvas.width / 2, 1800);

    // Call to Action
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '400 24px sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('LEIA MAIS NO LINK ACIMA', canvas.width / 2, 1860);

    return canvas.toDataURL('image/png');
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
