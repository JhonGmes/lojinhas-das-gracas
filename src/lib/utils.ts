import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value).replace(/\u00A0/g, ' ');
}

export function normalizeText(text: string) {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[Çç]/g, 'C')
        .replace(/[^A-Z0-9 ]/gi, '') // Only Alphanumeric and spaces
        .toUpperCase()
        .trim();
}

export function generatePixPayload(key: string, amount: number, merchantName: string = 'LOJINHA DAS GRACAS', city: string = 'SAO LUIS') {
    let cleanKey = key.trim().replace(/\s/g, ''); // Remove todos os espaços

    // Normalização da chave baseada no tipo
    if (cleanKey.includes('@')) {
        cleanKey = cleanKey.toLowerCase(); // E-mail sempre minúsculo
    } else {
        const onlyNumbers = cleanKey.replace(/[^\d]/g, '');

        // Verifica se é um telefone (10 ou 11 dígitos puros)
        if (onlyNumbers.length === 10 || onlyNumbers.length === 11) {
            cleanKey = '+55' + onlyNumbers;
        }
        // Verifica se parece um CPF ou CNPJ formatado
        else if (onlyNumbers.length === 14) {
            cleanKey = onlyNumbers; // CNPJ
        }
        else if (onlyNumbers.length === 11 && !cleanKey.includes('-')) {
            // Provável CPF que não caiu no caso de telefone acima
            cleanKey = onlyNumbers;
        }
        // Se não for nenhum dos acima, e contém letras/hífens (como chave aleatória), mantém como está
        else if (cleanKey.length > 20) {
            // Chaves aleatórias têm 32 ou 36 caracteres. Mantemos o que o usuário digitou.
            // Apenas garantimos que não haja espaços (já removidos acima).
        }
        else {
            // Fallback: remove caracteres especiais básicos se for puramente numérico
            cleanKey = cleanKey.replace(/[.\-/()]/g, '');
        }
    }

    const cleanName = normalizeText(merchantName).slice(0, 25);
    const cleanCity = normalizeText(city).slice(0, 15);
    // FORCE TXID to *** for maximum compatibility with Static Pix
    const cleanTxid = '***';

    const pad = (tag: string, value: string) => {
        return tag + value.length.toString().padStart(2, '0') + value;
    };

    // Tag 26: Merchant Account Information
    const gui = pad('00', 'br.gov.bcb.pix');
    const keyField = pad('01', cleanKey);
    const merchantAccountInfo = pad('26', gui + keyField);

    // Tag 62: Additional Data Field (TXID)
    const txidField = pad('05', cleanTxid);
    const additionalData = pad('62', txidField);

    const parts = [
        pad('00', '01'),       // Payload Format Indicator
        merchantAccountInfo,   // Tag 26
        pad('52', '0000'),      // Merchant Category Code
        pad('53', '986'),       // Currency BRL
        pad('54', Number(amount).toFixed(2)), // Amount
        pad('58', 'BR'),        // Country Code
        pad('59', cleanName),   // Merchant Name
        pad('60', cleanCity),   // Merchant City
        additionalData,         // Tag 62
        '6304'                  // CRC16 Tag + Length
    ];

    const payloadWithoutCRC = parts.join('');

    // CRC16 CCITT
    let crc = 0xFFFF;
    for (let i = 0; i < payloadWithoutCRC.length; i++) {
        crc ^= (payloadWithoutCRC.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
            } else {
                crc = (crc << 1) & 0xFFFF;
            }
        }
    }

    return payloadWithoutCRC + crc.toString(16).toUpperCase().padStart(4, '0');
}

export function exportToCSV(data: any[], filename: string) {
    if (!data.length) return;

    // Extract headers
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                let cell = row[header];
                if (cell === null || cell === undefined) cell = '';
                // Handle objects/arrays
                if (typeof cell === 'object') cell = JSON.stringify(cell);
                // Handle commas/quotes in strings
                return `"${String(cell).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
