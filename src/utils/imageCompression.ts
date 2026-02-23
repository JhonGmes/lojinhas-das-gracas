/**
 * Utilitário para compressão de imagem no cliente (Browser)
 * Reduz o tamanho da imagem para caber no limite de 1MB do Firestore (Base64)
 */
export async function compressImage(file: File, maxWidth = 1000, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensiona mantendo o aspect ratio
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available'));

                ctx.drawImage(img, 0, 0, width, height);

                // Converte para JPEG com compressão
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error('Erro ao carregar imagem para compressão'));
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    });
}
