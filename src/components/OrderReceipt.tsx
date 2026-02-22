import { useRef } from 'react';
import { Printer, X, Package, Truck, User } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import type { Order } from '../types';

interface OrderReceiptProps {
    order: Order;
    storeSettings: any;
    onClose: () => void;
}

export function OrderReceipt({ order, storeSettings, onClose }: OrderReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in print:bg-white print:p-0 print:block">
            <div className="bg-white dark:bg-stone-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative print:shadow-none print:max-h-none print:max-w-none print:static">

                {/* Actions Header (Hidden on Print) */}
                <div className="sticky top-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center z-10 print:hidden">
                    <h3 className="text-xs font-black uppercase tracking-widest text-stone-400">Comprovante de Compra</h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-brand-gold text-brand-wood px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-brand-wood hover:text-white transition-all shadow-sm"
                        >
                            <Printer size={14} /> Imprimir / PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Receipt Content */}
                <div ref={receiptRef} className="p-10 space-y-10 print:p-0 print:text-black">

                    {/* Store Branding */}
                    <div className="flex flex-col items-center text-center space-y-4 border-b border-stone-100 pb-10">
                        {storeSettings?.logo_url ? (
                            <img src={storeSettings.logo_url} alt={storeSettings.store_name} className="h-16 w-auto object-contain" />
                        ) : (
                            <div className="text-3xl font-display font-black text-brand-gold uppercase tracking-tighter">
                                {storeSettings?.store_name || 'Lojinha das Graças'}
                            </div>
                        )}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-800">Recibo de Pedido</p>
                            <p className="text-[9px] text-stone-400 uppercase tracking-widest">#{order.id}</p>
                            <p className="text-[9px] text-stone-400 uppercase tracking-widest">
                                {new Date(order.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                            </p>
                        </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-stone-50 pb-2">
                                <User size={14} className="text-brand-gold" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-700">Cliente</h4>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-stone-900">{order.customerName}</p>
                                <p className="text-[10px] text-stone-500">{order.customerEmail}</p>
                                <p className="text-[10px] text-stone-500">{order.customerPhone}</p>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-stone-50 pb-2">
                                <Truck size={14} className="text-brand-gold" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-700">Entrega</h4>
                            </div>
                            {order.customerAddress ? (
                                <div className="space-y-1">
                                    <p className="text-xs text-stone-700 font-medium">
                                        {order.customerAddress.street}, {order.customerAddress.number}
                                    </p>
                                    <p className="text-[10px] text-stone-500">
                                        {order.customerAddress.neighborhood}, {order.customerAddress.city} - {order.customerAddress.state}
                                    </p>
                                    <p className="text-[10px] text-stone-500">CEP: {order.customerAddress.zipcode}</p>
                                </div>
                            ) : (
                                <p className="text-[10px] text-stone-400 italic">Retirada ou entrega a combinar.</p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-stone-50 pb-2">
                            <Package size={14} className="text-brand-gold" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-700">Produtos</h4>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stone-100">
                                    <th className="py-3 text-[9px] font-black uppercase tracking-widest text-stone-400">Item</th>
                                    <th className="py-3 text-[9px] font-black uppercase tracking-widest text-stone-400 text-center">Qtd</th>
                                    <th className="py-3 text-[9px] font-black uppercase tracking-widest text-stone-400 text-right">Preço</th>
                                    <th className="py-3 text-[9px] font-black uppercase tracking-widest text-stone-400 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-50">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="text-xs">
                                        <td className="py-4 font-bold text-stone-800">{item.name}</td>
                                        <td className="py-4 text-center text-stone-500 font-mono">{item.quantity}</td>
                                        <td className="py-4 text-right text-stone-500 font-mono">{formatCurrency(item.promotionalPrice || item.price)}</td>
                                        <td className="py-4 text-right font-black text-stone-800 font-mono">
                                            {formatCurrency((item.promotionalPrice || item.price) * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end pt-6 border-t border-stone-100">
                        <div className="w-full max-w-[240px] space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-stone-400 uppercase font-bold tracking-widest text-[9px]">Status Pagamento</span>
                                <span className={`font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-sm ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-brand-gold/20 text-brand-wood'
                                    }`}>
                                    {order.status === 'paid' ? 'Confirmado' : 'Pendente'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-stone-400 uppercase font-bold tracking-widest text-[9px]">Método</span>
                                <span className="text-stone-700 font-black uppercase tracking-widest text-[9px]">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                                <span className="text-stone-800 font-black uppercase tracking-[0.2em] text-[10px]">Total Pago</span>
                                <span className="text-xl font-display font-medium text-brand-gold">
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Legal */}
                    <div className="pt-10 text-center space-y-2 pb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Obrigado pela preferência!</p>
                        <p className="text-[8px] text-stone-300 max-w-xs mx-auto leading-relaxed">
                            Este documento é um comprovante de pedido realizado na loja {storeSettings?.store_name}.
                            Para qualquer dúvida, entre em contato via WhatsApp com o número do seu pedido.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
