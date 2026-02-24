import { lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import {
    LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft,
    Settings as SettingsIcon, FolderTree, BookOpen,
    User, ChevronRight, Menu, Camera, Users, Ticket, Clock, X, Star, Shield
} from 'lucide-react';

// Lazy loaded admin pages
const Dashboard = lazy(() => import('./Dashboard').then(m => ({ default: m.Dashboard })));
const Inventory = lazy(() => import('./Inventory').then(m => ({ default: m.Inventory })));
const Orders = lazy(() => import('./Orders').then(m => ({ default: m.Orders })));
const AddProduct = lazy(() => import('./AddProduct').then(m => ({ default: m.AddProduct })));
const EditProduct = lazy(() => import('./EditProduct').then(m => ({ default: m.EditProduct })));
const Settings = lazy(() => import('./Settings').then(m => ({ default: m.Settings })));
const Categories = lazy(() => import('./Categories').then(m => ({ default: m.Categories })));
const BlogAdmin = lazy(() => import('./BlogAdmin').then(m => ({ default: m.BlogAdmin })));
const Customers = lazy(() => import('./Customers').then(m => ({ default: m.Customers })));
const Coupons = lazy(() => import('./Coupons').then(m => ({ default: m.Coupons })));
const Waitlist = lazy(() => import('./Waitlist').then(m => ({ default: m.Waitlist })));
const Reviews = lazy(() => import('./Reviews').then(m => ({ default: m.Reviews })));

const AdminLoading = () => (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
        <div className="relative">
            <div className="w-10 h-10 border-2 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin" />
            <div className="absolute inset-0 bg-brand-gold/10 blur-xl rounded-full" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Carregando painel...</span>
    </div>
);

import { useEffect, useState } from 'react';
export function AdminLayout() {
    const { user, logout } = useAuth();
    const { settings, currentStoreId, updateSettings } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Avatar State (Local Persistence)
    const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('admin_avatar'));
    const [adminName, setAdminName] = useState<string>(settings.manager_name || localStorage.getItem('admin_custom_name') || user?.name || 'Admin');
    const [isEditingName, setIsEditingName] = useState(false);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Sync adminName when settings load
    useEffect(() => {
        if (settings.manager_name) {
            setAdminName(settings.manager_name);
        }
    }, [settings.manager_name]);

    const fetchPendingCount = async () => {
        if (!currentStoreId) return;
        const orders = await api.orders.list(currentStoreId);
        const pending = orders.filter((o: any) => o.status === 'pending').length;
        setPendingOrdersCount(pending);
    };

    useEffect(() => {
        if (currentStoreId) {
            fetchPendingCount();
            const interval = setInterval(fetchPendingCount, 60000);
            return () => clearInterval(interval);
        }
    }, [currentStoreId]);

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
    }, [user, navigate, location]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

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
                { path: '/admin/reviews', label: 'Avaliações de Clientes', icon: Star },
                { path: '/admin/blog', label: 'Blog de Fé', icon: BookOpen },
            ]
        }
    ];

    const storeInitials = settings.store_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="flex h-screen overflow-hidden bg-[#F7F7F7] dark:bg-stone-950 font-sans">
            {/* Backdrop for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Moderno */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#2A3F54] text-stone-300 flex flex-col shadow-2xl font-sans shrink-0 transition-all duration-300 border-r border-white/5 overflow-hidden md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand Header - Compacted & Elegant */}
                <div className="h-12 flex items-center px-4 bg-[#1f2f3f] shadow-sm relative overflow-hidden group shrink-0">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-2xl -translate-y-8 translate-x-8 pointer-events-none" />

                    <div className="w-7 h-7 bg-gradient-to-br from-brand-gold to-amber-600 rounded-lg flex items-center justify-center text-white font-bold mr-2.5 shadow-lg shadow-brand-gold/20 shrink-0 transform group-hover:scale-105 transition-transform duration-500">
                        {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-cover rounded-lg" /> : storeInitials}
                    </div>
                    <span className="font-script text-xl text-white truncate drop-shadow-sm flex-1 leading-none py-1" style={{ fontFamily: "'Cookie', cursive" }}>
                        {settings.store_name}
                    </span>
                    <button className="md:hidden ml-auto text-stone-400 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={18} />
                    </button>
                </div>


                {/* User Profile Section with Upload - Compacted & Editable */}
                <div className="px-4 py-2 border-b border-white/5 bg-[#253849] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="relative group/avatar cursor-pointer shrink-0">
                            <div className="w-8 h-8 rounded-full bg-stone-700 border-2 border-stone-600 group-hover/avatar:border-brand-gold transition-colors flex items-center justify-center overflow-hidden shadow-md">
                                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <User size={16} className="text-stone-400" />}
                            </div>
                            {/* Camera Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center rounded-full transition-opacity duration-300 backdrop-blur-[1px]">
                                <Camera size={10} className="text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                title="Alterar foto de perfil"
                            />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[7px] text-stone-400 font-bold uppercase tracking-widest leading-none">Gerente</span>


                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={adminName}
                                    onChange={(e) => setAdminName(e.target.value)}
                                    onBlur={async () => {
                                        setIsEditingName(false);
                                        await updateSettings({ manager_name: adminName });
                                    }}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            setIsEditingName(false);
                                            await updateSettings({ manager_name: adminName });
                                        }
                                    }}
                                    className="bg-stone-800 text-white text-xs font-bold rounded px-1 py-0.5 w-full border border-stone-600 focus:border-brand-gold outline-none"
                                    autoFocus
                                />
                            ) : (
                                <span
                                    onClick={() => setIsEditingName(true)}
                                    className="text-sm font-bold text-white truncate cursor-pointer hover:text-brand-gold transition-colors flex items-center gap-1 group/name"
                                    title="Clique para editar"
                                >
                                    {adminName}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation - Fixed & Compacted */}
                <nav className="flex-1 overflow-y-auto py-3 px-0 space-y-2 scrollbar-hide">
                    {navGroups.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="px-5 text-[8px] font-black text-stone-500 uppercase tracking-widest mb-1 opacity-70 flex items-center gap-2">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map(item => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-5 py-2 transition-all group relative ${isActive
                                                ? 'bg-gradient-to-r from-white/10 to-transparent text-brand-gold font-bold'
                                                : 'hover:bg-white/5 hover:text-white text-stone-400'
                                                }`}
                                        >
                                            {/* Active Indicator (Thin Line) */}
                                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}

                                            <item.icon size={16} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            <span className={`text-xs tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>

                                            {/* Badge for Orders */}
                                            {item.path === '/admin/orders' && pendingOrdersCount > 0 && (
                                                <span className="ml-auto bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                                                    {pendingOrdersCount}
                                                </span>
                                            )}

                                            {/* Chevron Highlight */}
                                            {isActive && !(item.path === '/admin/orders' && pendingOrdersCount > 0) && <ChevronRight size={12} className="ml-auto opacity-100 text-brand-gold/50" />}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / System - Extra Compact */}
                <div className="px-3 py-2 bg-[#1f2f3f] border-t border-white/5 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <Link
                            to="/admin/settings"
                            className={`p-1.5 rounded-lg transition-all group ${location.pathname === '/admin/settings' ? 'bg-brand-gold text-brand-wood shadow-lg' : 'bg-white/5 text-stone-400 hover:text-white'
                                }`}
                            title="Configurações"
                        >
                            <SettingsIcon size={14} className="group-hover:rotate-90 transition-transform duration-700" />
                        </Link>

                        <Link to="/" className="text-[8px] font-black text-stone-500 hover:text-brand-gold uppercase tracking-tighter transition-colors flex items-center gap-1">
                            <ArrowLeft size={10} /> Ver Loja
                        </Link>

                        <button
                            onClick={logout}
                            className="p-1.5 bg-white/5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all group"
                            title="Sair"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>

                    {/* Managed Store Indicator - Ultra Compact */}
                    <div className="mt-2 px-2 py-1 bg-brand-gold/5 rounded-lg border border-brand-gold/10 flex items-center justify-between">
                        <div className="overflow-hidden">
                            <p className="text-[7px] font-black text-brand-gold/60 uppercase tracking-widest leading-none">Status</p>
                            <p className="text-[8px] font-bold text-stone-300 truncate leading-tight mt-0.5">Online</p>
                        </div>
                        {user.role === 'admin' && (
                            <Link to="/admin/super" className="text-stone-500 hover:text-brand-gold transition-colors">
                                <Shield size={10} />
                            </Link>
                        )}
                    </div>
                </div>

            </aside>


            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto relative bg-[#F7F7F7] dark:bg-stone-900 scrollbar-hide">
                {/* Mobile Header */}
                <div className="md:hidden bg-[#2A3F54] text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-brand-gold rounded-lg flex items-center justify-center text-white font-bold text-[10px]">
                            {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-cover rounded-lg" /> : storeInitials}
                        </div>
                        <span className="font-display font-medium uppercase tracking-widest text-[10px]">{settings.store_name}</span>
                    </div>
                    <button className="p-2 text-stone-300 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>

                <div className="p-4 md:p-8 pb-20 max-w-[1600px] mx-auto">
                    <Suspense fallback={<AdminLoading />}>
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
                            <Route path="/reviews" element={<Reviews />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </Suspense>

                </div>
            </main>
        </div>
    );
}
