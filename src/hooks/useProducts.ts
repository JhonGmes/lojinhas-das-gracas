import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Product } from '../types';
import { toast } from 'react-hot-toast';

export function useProducts(storeId: string) {
    const queryClient = useQueryClient();

    // Query para Produtos
    const productsQuery = useQuery({
        queryKey: ['products', storeId],
        queryFn: () => api.products.list(storeId),
    });

    // Query para Categorias
    const categoriesQuery = useQuery({
        queryKey: ['categories', storeId],
        queryFn: () => api.categories.list(storeId),
    });

    // Mutação para atualizar produto
    const updateProductMutation = useMutation({
        mutationFn: (product: Product) => api.products.update(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', storeId] });
            toast.success('Produto atualizado!');
        },
        onError: () => toast.error('Erro ao atualizar produto')
    });

    // Mutação para criar produto
    const createProductMutation = useMutation({
        mutationFn: (product: Omit<Product, 'id'>) => api.products.create(product, storeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', storeId] });
            toast.success('Produto criado!');
        },
        onError: () => toast.error('Erro ao criar produto')
    });

    // Mutação para deletar produto
    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => api.products.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', storeId] });
            toast.success('Produto excluído');
        },
        onError: () => toast.error('Erro ao excluir produto')
    });

    // Categoria: Adicionar
    const addCategoryMutation = useMutation({
        mutationFn: (name: string) => api.categories.create(name, storeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
            toast.success('Categoria adicionada');
        },
        onError: () => toast.error('Erro ao adicionar categoria')
    });

    // Categoria: Deletar
    const deleteCategoryMutation = useMutation({
        mutationFn: (name: string) => api.categories.delete(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', storeId] });
            toast.success('Categoria removida');
        },
        onError: () => toast.error('Erro ao remover categoria')
    });

    return {
        products: productsQuery.data || [],
        categories: categoriesQuery.data || [],
        isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
        isFetching: productsQuery.isFetching || categoriesQuery.isFetching,
        updateProduct: updateProductMutation.mutateAsync,
        createProduct: createProductMutation.mutateAsync,
        deleteProduct: deleteProductMutation.mutateAsync,
        addCategory: addCategoryMutation.mutateAsync,
        deleteCategory: deleteCategoryMutation.mutateAsync,
        refresh: () => {
            productsQuery.refetch();
            categoriesQuery.refetch();
        }
    };
}
