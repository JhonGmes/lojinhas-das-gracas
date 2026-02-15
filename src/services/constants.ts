import type { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Terço de Cristal Swarovski',
        description: 'Terço artesanal feito com cristais Swarovski legítimos e acabamento em ouro 18k.',
        price: 299.90,
        image: 'https://images.unsplash.com/photo-1621360841013-c768371e93cf?auto=format&fit=crop&q=80&w=1000',
        images: ['https://images.unsplash.com/photo-1621360841013-c768371e93cf?auto=format&fit=crop&q=80&w=1000'],
        category: 'Terços',
        stock: 10,
        isFeatured: true,
        active: true
    },
    {
        id: '2',
        name: 'Imagem de Nossa Senhora das Graças (30cm)',
        description: 'Imagem em resina importada, pintura à mão com detalhes realistas.',
        price: 159.00,
        promotionalPrice: 129.90,
        image: 'https://images.unsplash.com/photo-1548625361-ec880bb23bc1?auto=format&fit=crop&q=80&w=1000',
        images: ['https://images.unsplash.com/photo-1548625361-ec880bb23bc1?auto=format&fit=crop&q=80&w=1000'],
        category: 'Imagens',
        stock: 5,
        isFeatured: true,
        active: true
    },
    {
        id: '3',
        name: 'Bíblia de Estudo Ave Maria',
        description: 'Edição de luxo com capa em couro sintético e letras gigantes.',
        price: 89.90,
        image: 'https://images.unsplash.com/photo-1590895318723-52467b72db56?auto=format&fit=crop&q=80&w=1000',
        images: ['https://images.unsplash.com/photo-1590895318723-52467b72db56?auto=format&fit=crop&q=80&w=1000'],
        category: 'Bíblias',
        stock: 20,
        isFeatured: false,
        active: true
    },
    {
        id: '4',
        name: 'Capelinha de Madeira',
        description: 'Capelinha rústica de madeira nobre para imagens de até 20cm.',
        price: 75.00,
        image: 'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&q=80&w=1000',
        images: ['https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&q=80&w=1000'],
        category: 'Imagens',
        stock: 3,
        isFeatured: false,
        active: true
    },
];
