import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { formatCurrency, exportToCSV } from '../../lib/utils';
import {
    Users, Search, UserCircle, ShoppingBag,
    Phone, Mail, ChevronRight,
    Award, Clock, X, Download, MessageCircle
} from 'lucide-react';
import type { Order } from '../../types';

interface CustomerSummary {
    email: string;
    name: string;
    phone: string;
    address?: string;
    orderCount: number;
    totalSpent: number;
    lastPurchase: string;
    orders: Order[];
    tier: 'VIP' | 'Recorrente' | 'Novo' | 'Prospecto';
}

export function Customers() {
    const { currentStoreId, settings } = useStore();
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ordersData] = await Promise.all([
                    api.orders.list(currentStoreId)
                ]);

                // Process customers map
                const map: Record<string, CustomerSummary> = {};

                // Add orders data
                ordersData.forEach((order: any) => {
                    const email = (order.customerEmail || 'no-email@undefined.com').toLowerCase();
                    if (!map[email]) {
                        map[email] = {
                            email: order.customerEmail || email,
                            name: order.customerName,
                            phone: order.customerPhone || 'N/A',
                            orderCount: 0,
                            totalSpent: 0,
                            lastPurchase: order.createdAt,
                            orders: [],
                            tier: 'Novo'
                        };
                    }

                    const customer = map[email];
                    customer.orderCount += 1;
                    customer.totalSpent += order.total;
                    customer.orders.push(order);

                    if (new Date(order.createdAt) > new Date(customer.lastPurchase)) {
                        customer.lastPurchase = order.createdAt;
                    }
                });

                // Apply tiers and sorting
                const finalCustomers = Object.values(map).map(c => {
                    if (c.orderCount === 0) c.tier = 'Prospecto';
                    else if (c.totalSpent > 500 || c.orderCount > 5) c.tier = 'VIP';
                    else if (c.orderCount > 2) c.tier = 'Recorrente';
                    else c.tier = 'Novo';
                    return c;
                }).sort((a, b) => b.totalSpent - a.totalSpent);

                setCustomers(finalCustomers);
            } catch (err) {
                console.error('Erro ao carregar dados do CRM:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: customers.length,
        vips: customers.filter(c => c.tier === 'VIP').length,
        avgTicket: customers.length ? customers.reduce((a, b) => a + b.totalSpent, 0) / customers.length : 0
    };

    const handleContact = (customer: any) => {
        const text = customer.tier === 'VIP'
            ? `A Paz de Cristo, ${customer.name}! Passando para agradecer sua fidelidade à ${settings.store_name}. Você é um de nossos clientes VIPs e preparamos um mimo especial para sua próxima compra! 🙏✨`
            : customer.tier === 'Prospecto'
                ? `A Paz, ${customer.name}! Seja bem-vindo(a) à ${settings.store_name}. Vimos que você se cadastrou em nosso portal. Se precisar de ajuda para escolher um item especial, estou à disposição! 🙏`
                : `A Paz, ${customer.name}! Tudo bem? Vimos sua última compra conosco. Temos novidades lindas na ${settings.store_name} esperando por você! 🙏`;

        let phone = customer.phone.replace(/\D/g, '');
        if (phone.length === 11 && !phone.startsWith('55')) phone = '55' + phone;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                    <h1 className="text-sm font-bold text-stone-700 dark:text-stone-200 uppercase tracking-widest flex items-center gap-2">
                        <Users size={16} className="text-brand-gold" />
                        Gestão de Clientes (CRM)
                    </h1>
                    <p className="text-[10px] text-stone-400 mt-0.5">Histórico e segmentação da sua base de fiéis</p>
                </div>
                <button
                    onClick={() => exportToCSV(customers, 'clientes-lojinha')}
                    className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center gap-2"
                >
                    <Download size={12} /> Exportar Clientes
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-stone-900 p-4 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-500"><Users size={18} /></div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-stone-400">Total de Clientes</div>
                            <div className="text-lg font-bold text-stone-700 dark:text-stone-200">{stats.total}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stone-900 p-4 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-500"><Award size={18} /></div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-stone-400">Clientes VIP</div>
                            <div className="text-lg font-bold text-stone-700 dark:text-stone-200">{stats.vips}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-stone-900 p-4 rounded-sm border border-stone-100 dark:border-stone-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-emerald-500"><ShoppingBag size={18} /></div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-stone-400">Gasto Médio</div>
                            <div className="text-lg font-bold text-stone-700 dark:text-stone-200">{formatCurrency(stats.avgTicket)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 w-64 text-xs bg-stone-50 dark:bg-stone-800 border-none rounded-sm focus:ring-1 focus:ring-brand-gold text-stone-600 placeholder-stone-400"
                    />
                </div>
            </div>

            {/* Client Table */}
            <div className="bg-white dark:bg-stone-900 rounded-sm shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest w-10">#</th>
                                <th className="px-4 py-2 text-left text-[9px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Pedidos</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Gasto</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Última Compra</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest">Tier</th>
                                <th className="px-4 py-2 text-center text-[9px] font-bold text-stone-400 uppercase tracking-widest w-20">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50 dark:divide-stone-800">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-4 py-4 whitespace-nowrap bg-stone-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredCustomers.map((customer, idx) => (
                                <tr key={customer.email} className="group hover:bg-stone-50 dark:hover:bg-stone-800/10 transition-colors">
                                    <td className="px-4 py-2 text-[10px] text-stone-400 font-mono">{idx + 1}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                                                <UserCircle size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-stone-700 dark:text-stone-200">{customer.name}</span>
                                                <span className="text-[9px] text-stone-400">{customer.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400">{customer.orderCount}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(customer.totalSpent)}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-stone-600 dark:text-stone-400">
                                                {new Date(customer.lastPurchase).toLocaleDateString()}
                                            </span>
                                            <span className="text-[8px] text-stone-400 uppercase tracking-tighter">
                                                {new Date(customer.lastPurchase).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${customer.tier === 'VIP' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                            customer.tier === 'Recorrente' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                customer.tier === 'Prospecto' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                    'bg-stone-100 text-stone-600 border border-stone-200'
                                            }`}>
                                            {customer.tier}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleContact(customer)}
                                                className={`p-1.5 rounded transition-all ${customer.tier === 'VIP' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-stone-100 text-stone-400 hover:text-brand-gold'}`}
                                                title="Contatar via WhatsApp"
                                            >
                                                <MessageCircle size={14} />
                                            </button>
                                            <button
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="p-1.5 bg-stone-100 text-stone-400 hover:bg-brand-gold rounded transition-all"
                                                title="Ver Detalhes"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-6 bg-stone-50 dark:bg-stone-800 border-b border-stone-100 dark:border-stone-700 flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                                    <UserCircle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-stone-800 dark:text-stone-100">{selectedCustomer.name}</h3>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                            <Mail size={12} /> {selectedCustomer.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                            <Phone size={12} /> {selectedCustomer.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button onClick={() => setSelectedCustomer(null)} className="text-stone-400 hover:text-stone-600 transition-colors">
                                    <X size={20} />
                                </button>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${selectedCustomer.tier === 'VIP' ? 'bg-amber-500 text-white' :
                                    selectedCustomer.tier === 'Recorrente' ? 'bg-blue-500 text-white' :
                                        selectedCustomer.tier === 'Prospecto' ? 'bg-emerald-500 text-white' :
                                            'bg-stone-500 text-white'
                                    }`}>
                                    {selectedCustomer.tier}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                                <Clock size={14} /> {selectedCustomer.tier === 'Prospecto' ? 'Resumo do Cadastro' : 'Histórico de Pedidos'}
                            </h4>

                            {selectedCustomer.tier === 'Prospecto' && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                        Este cliente ainda não realizou compras, mas já completou o cadastro.
                                    </p>
                                    <div className="mt-4 space-y-2">
                                        <div className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Endereço Registrado:</div>
                                        <div className="text-sm text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 p-3 rounded-md border border-stone-200 dark:border-stone-700">
                                            {selectedCustomer.address || 'Não informado'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {selectedCustomer.orders.map(order => (
                                    <div key={order.id} className="p-3 bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700 rounded flex justify-between items-center group hover:border-brand-gold/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[10px] font-mono text-stone-400">#{order.orderNumber}</div>
                                            <div>
                                                <div className="text-xs font-bold text-stone-700 dark:text-stone-200">
                                                    {formatCurrency(order.total)}
                                                </div>
                                                <div className="text-[10px] text-stone-400">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${order.status === 'paid' ? 'text-emerald-600 bg-emerald-50' :
                                                order.status === 'pending' ? 'text-amber-600 bg-amber-50' :
                                                    'text-stone-500 bg-stone-50'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <ChevronRight size={14} className="text-stone-300 group-hover:text-brand-gold transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t border-stone-100 dark:border-stone-700 flex justify-between items-center">
                            <div className="text-[10px] text-stone-400">
                                <strong className="text-stone-600 dark:text-stone-300">Total Acumulado:</strong> {formatCurrency(selectedCustomer.totalSpent)}
                            </div>
                            <div className="text-[10px] text-stone-400">
                                <strong className="text-stone-600 dark:text-stone-300">Membro desde:</strong> {selectedCustomer.orders.length > 0 ? new Date(selectedCustomer.orders[selectedCustomer.orders.length - 1].createdAt).toLocaleDateString() : new Date(selectedCustomer.lastPurchase).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
