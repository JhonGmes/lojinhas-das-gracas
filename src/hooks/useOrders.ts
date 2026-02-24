import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Order } from '../types';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export function useOrders(storeId: string, notificationSoundUrl?: string) {
    const queryClient = useQueryClient();
    const prevOrdersCount = useRef<number | null>(null);

    const playNotificationSound = () => {
        const audio = new Audio(notificationSoundUrl || 'https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    };

    const query = useQuery({
        queryKey: ['orders', storeId],
        queryFn: () => api.orders.list(storeId),
        refetchInterval: 30000, // Sync with the previous 30s interval
    });

    // Detect new orders
    useEffect(() => {
        if (query.data) {
            if (prevOrdersCount.current !== null && query.data.length > prevOrdersCount.current) {
                const newCount = query.data.length - prevOrdersCount.current;
                playNotificationSound();
                toast.success(`${newCount} ${newCount === 1 ? 'novo pedido' : 'novos pedidos'}!`, {
                    icon: '🔔',
                    duration: 5000,
                    style: {
                        background: '#D4AF37',
                        color: '#2d2a28',
                        fontSize: '12px',
                        fontWeight: '900'
                    }
                });
            }
            prevOrdersCount.current = query.data.length;
        }
    }, [query.data]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, newStatus, currentOrder }: { orderId: string, newStatus: Order['status'], currentOrder?: Order }) => {
            if (newStatus === 'paid' && currentOrder) {
                return api.orders.confirmPayment(currentOrder);
            } else {
                return api.orders.updateStatus(orderId, newStatus, storeId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', storeId] });
            toast.success('Status atualizado!', { icon: '✓' });
        },
        onError: () => {
            toast.error('Erro ao atualizar status');
        }
    });

    const deleteOrderMutation = useMutation({
        mutationFn: (orderId: string) => api.orders.delete(orderId, storeId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', storeId] });
            toast.success('Pedido excluído');
        },
        onError: () => {
            toast.error('Erro ao excluir pedido');
        }
    });

    return {
        orders: query.data || [],
        isLoading: query.isLoading && !query.data, // Initial load only
        isFetching: query.isFetching,
        error: query.error,
        updateStatus: updateStatusMutation.mutateAsync,
        deleteOrder: deleteOrderMutation.mutateAsync,
        refresh: () => query.refetch(),
    };
}
