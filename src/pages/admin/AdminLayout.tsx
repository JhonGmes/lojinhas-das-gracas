import { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import {
    LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft,
    Settings as SettingsIcon, FolderTree, BookOpen,
    User, ChevronRight, Menu, Camera, Users, Ticket, Clock
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Inventory } from './Inventory';
import { Orders } from './Orders';
import { AddProduct } from './AddProduct';
import { EditProduct } from './EditProduct';
import { Settings } from './Settings';
import { Categories } from './Categories';
import { BlogAdmin } from './BlogAdmin';
import { Customers } from './Customers';
import { Coupons } from './Coupons';
import { Waitlist } from './Waitlist';


export function AdminLayout() {
    const { user, logout } = useAuth();
    const { settings } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Avatar State (Local Persistence)
    const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('admin_avatar'));
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    const fetchPendingCount = async () => {
        const orders = await api.orders.list();
        const pending = orders.filter((o: any) => o.status === 'pending').length;
        setPendingOrdersCount(pending);
    };

    useEffect(() => {
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                localStorage.setItem('admin_avatar', base64);
                setAvatar(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/admin-login');
        }
    }, [user, navigate]);

    if (!user) return null;

    const navGroups = [
        {
            title: 'Visão Geral',
            items: [
                { path: '/admin', label: 'Resumo Executivo', icon: LayoutDashboard },
                { path: '/admin/orders', label: 'Vendas & Pedidos', icon: ShoppingBag },
                { path: '/admin/customers', label: 'Clientes (CRM)', icon: Users },
                { path: '/admin/waitlist', label: 'Lista de Espera', icon: Clock },
            ]
        },

        {
            title: 'Gestão da Loja',
            items: [
                { path: '/admin/inventory', label: 'Catálogo de Produtos', icon: Package },
                { path: '/admin/categories', label: 'Categorias', icon: FolderTree },
                { path: '/admin/coupons', label: 'Cupons de Desconto', icon: Ticket },
                { path: '/admin/blog', label: 'Blog de Fé', icon: BookOpen },
            ]
        }
    ];

    const storeInitials = settings.store_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="flex h-screen overflow-hidden bg-[#F7F7F7] dark:bg-stone-950 font-sans">
            {/* Sidebar Moderno - Ajustes Finos (Fonte Display, Less Yellow, Avatar Upload) */}
            <aside className="w-64 h-full bg-[#2A3F54] text-stone-300 hidden md:flex flex-col shadow-2xl z-20 font-sans shrink-0 transition-all duration-300 border-r border-white/5 overflow-hidden">
                {/* Brand Header - Compacted */}
                <div className="h-16 flex items-center px-6 bg-[#1f2f3f] shadow-sm relative overflow-hidden group shrink-0">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl -translate-y-10 translate-x-10 pointer-events-none" />

                    <div className="w-9 h-9 bg-gradient-to-br from-brand-gold to-amber-600 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-brand-gold/20 shrink-0 transform group-hover:scale-105 transition-transform duration-500">
                        {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-cover rounded-xl" /> : storeInitials}
                    </div>
                    <span className="font-display font-bold text-xs text-white tracking-widest uppercase truncate drop-shadow-sm">{settings.store_name}</span>
                </div>

                {/* User Profile Section with Upload - Compacted */}
                <div className="px-6 py-4 border-b border-white/5 bg-[#253849] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative group/avatar cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-stone-700 border-2 border-stone-600 group-hover/avatar:border-brand-gold transition-colors flex items-center justify-center overflow-hidden shadow-md">
                                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <User size={20} className="text-stone-400" />}
                            </div>
                            {/* Camera Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center rounded-full transition-opacity duration-300 backdrop-blur-[1px]">
                                <Camera size={14} className="text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                title="Alterar foto de perfil"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-0.5">Gerente</span>
                            <span className="text-sm font-bold text-white truncate">{user.name || 'Admin'}</span>
                        </div>
                    </div>
                </div>

                {/* Navigation - Fixed & Compacted */}
                <nav className="flex-1 overflow-hidden py-4 px-0 space-y-2">
                    {navGroups.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="px-6 text-[9px] font-black text-stone-500 uppercase tracking-widest mb-2 opacity-70 flex items-center gap-2">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map(item => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-6 py-2.5 transition-all group relative ${isActive
                                                ? 'bg-gradient-to-r from-white/10 to-transparent text-brand-gold font-bold'
                                                : 'hover:bg-white/5 hover:text-white text-stone-400'
                                                }`}
                                        >
                                            {/* Active Indicator (Thin Line) */}
                                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}

                                            <item.icon size={18} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>

                                            {/* Badge for Orders */}
                                            {item.path === '/admin/orders' && pendingOrdersCount > 0 && (
                                                <span className="ml-auto bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                                    {pendingOrdersCount}
                                                </span>
                                            )}

                                            {/* Chevron Highlight */}
                                            {isActive && !(item.path === '/admin/orders' && pendingOrdersCount > 0) && <ChevronRight size={14} className="ml-auto opacity-100 text-brand-gold/50" />}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / System - Compact */}
                <div className="p-3 bg-[#1f2f3f] space-y-1 border-t border-white/5 shrink-0">
                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group ${location.pathname === '/admin/settings' ? 'text-brand-gold bg-white/5' : 'text-stone-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <SettingsIcon size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-sm font-medium">Configurações</span>
                    </Link>

                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-stone-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all w-full text-left group mt-1">
                        <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Sair</span>
                    </button>

                    <Link to="/" className="flex items-center gap-2 px-4 py-2 text-[9px] text-stone-500 hover:text-brand-gold uppercase tracking-widest transition-colors mt-2 border-t border-white/5 pt-2 justify-center">
                        <ArrowLeft size={10} /> Ir para Loja
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto relative bg-[#F7F7F7] dark:bg-stone-900 scrollbar-hide">
                {/* Mobile Header */}
                <div className="md:hidden bg-[#2A3F54] text-white p-4 flex items-center justify-between shadow-md mb-6 sticky top-0 z-30">
                    <span className="font-display font-medium uppercase tracking-widest">{settings.store_name}</span>
                    <button className="p-2"><Menu size={24} /></button>
                </div>

                <div className="p-8 pb-20 max-w-[1600px] mx-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/coupons" element={<Coupons />} />
                        <Route path="/blog" element={<BlogAdmin />} />
                        <Route path="/add-product" element={<AddProduct />} />
                        <Route path="/edit-product/:id" element={<EditProduct />} />
                        <Route path="/waitlist" element={<Waitlist />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>

                </div>
            </main>
        </div>
    );
}
