import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import {
    LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft,
    Settings as SettingsIcon, FolderTree, BookOpen,
    User, ChevronRight, Menu
} from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Inventory } from './Inventory';
import { Orders } from './Orders';
import { AddProduct } from './AddProduct';
import { EditProduct } from './EditProduct';
import { Settings } from './Settings';
import { Categories } from './Categories';
import { BlogAdmin } from './BlogAdmin';

export function AdminLayout() {
    const { user, logout } = useAuth();
    const { settings } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

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
            ]
        },
        {
            title: 'Gestão da Loja',
            items: [
                { path: '/admin/inventory', label: 'Catálogo de Produtos', icon: Package },
                { path: '/admin/categories', label: 'Categorias', icon: FolderTree },
                { path: '/admin/blog', label: 'Blog de Fé', icon: BookOpen },
            ]
        }
    ];

    const storeInitials = settings.store_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="flex min-h-screen bg-[#F7F7F7] dark:bg-stone-950 font-sans">
            {/* Sidebar Moderno - Estilo Gentelella Alela Refinado - Mais Estreito */}
            <aside className="w-60 bg-[#2A3F54] text-stone-300 hidden md:flex flex-col shadow-2xl z-20 font-sans shrink-0 transition-all duration-300">
                {/* Brand Header */}
                <div className="h-16 flex items-center px-5 bg-[#1f2f3f] shadow-sm">
                    <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-brand-gold/20 shrink-0">
                        {settings.logo_url ? <img src={settings.logo_url} className="w-5 h-5 object-contain" /> : storeInitials}
                    </div>
                    <span className="font-bold text-sm text-white tracking-wide uppercase truncate">{settings.store_name}</span>
                </div>

                {/* User Profile Section */}
                <div className="px-6 py-8 border-b border-white/5 bg-[#2A3F54]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-stone-700 border-2 border-brand-gold/30 flex items-center justify-center overflow-hidden shadow-inner">
                            <User size={24} className="text-stone-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Bem vindo,</span>
                            <span className="text-sm font-bold text-white truncate max-w-[140px]">{user.name || 'Gerente'}</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-stone-700">
                    {navGroups.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="px-4 text-[10px] font-black text-stone-500 uppercase tracking-widest mb-3 opacity-60 flex items-center gap-2">
                                {group.title} <div className="h-px bg-stone-700 flex-1"></div>
                            </h3>
                            <div className="space-y-1">
                                {group.items.map(item => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-r-full mr-4 transition-all group relative overflow-hidden ${isActive
                                                ? 'bg-gradient-to-r from-brand-gold to-brand-gold/80 text-white shadow-lg shadow-brand-gold/20 translate-x-1'
                                                : 'hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <item.icon size={18} className={`transition-colors ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`} />
                                            <span className={`text-sm tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>

                                            {/* Chevron Highlight */}
                                            {isActive && <ChevronRight size={14} className="ml-auto opacity-80" />}
                                            {!isActive && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-30 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / System */}
                <div className="p-4 bg-[#1f2f3f] space-y-1 border-t border-white/5">
                    <h3 className="px-4 text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 opacity-60">Sistema</h3>
                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all group ${location.pathname === '/admin/settings' ? 'text-white bg-white/10' : 'text-stone-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <SettingsIcon size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="text-sm font-medium">Configurações</span>
                    </Link>

                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-red-200 hover:bg-red-500/10 rounded-md transition-all w-full text-left group mt-2">
                        <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
                        <span className="text-sm font-medium">Sair</span>
                    </button>

                    <Link to="/" className="flex items-center gap-2 px-4 py-3 text-[10px] text-stone-500 hover:text-brand-gold uppercase tracking-widest transition-colors mt-4 border-t border-white/5 pt-4 justify-center">
                        <ArrowLeft size={12} /> Voltar para Loja
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative bg-[#F7F7F7] dark:bg-stone-900 scrollbar-hide">
                {/* Mobile Header (Visible only on small screens) */}
                <div className="md:hidden bg-[#2A3F54] text-white p-4 flex items-center justify-between shadow-md mb-6 sticky top-0 z-30">
                    <span className="font-bold uppercase tracking-widest">{settings.store_name}</span>
                    <button className="p-2"><Menu size={24} /></button>
                </div>

                <div className="p-8 pb-20 max-w-[1600px] mx-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/blog" element={<BlogAdmin />} />
                        <Route path="/add-product" element={<AddProduct />} />
                        <Route path="/edit-product/:id" element={<EditProduct />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
