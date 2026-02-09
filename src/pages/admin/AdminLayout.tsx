import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft, Settings as SettingsIcon, FolderTree } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { Inventory } from './Inventory';
import { Orders } from './Orders';
import { AddProduct } from './AddProduct';
import { EditProduct } from './EditProduct';
import { Settings } from './Settings';
import { Categories } from './Categories';
import { BlogAdmin } from './BlogAdmin';
import { BookOpen } from 'lucide-react';

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


    const navItems = [
        { path: '/admin', label: 'Resumo', icon: LayoutDashboard },
        { path: '/admin/inventory', label: 'Estoque', icon: Package },
        { path: '/admin/categories', label: 'Categorias', icon: FolderTree },
        { path: '/admin/orders', label: 'Vendas', icon: ShoppingBag },
        { path: '/admin/blog', label: 'Blog de Fé', icon: BookOpen },
        { path: '/admin/settings', label: 'Ajustes', icon: SettingsIcon },
    ];

    const storeInitials = settings.store_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="flex min-h-screen bg-stone-100 dark:bg-stone-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-wood text-white hidden md:flex flex-col shadow-2xl z-20">
                <div className="p-6 border-b border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-gold rounded-lg flex items-center justify-center font-bold text-xl text-white">
                        {settings.logo_url ? <img src={settings.logo_url} className="w-8 h-8 object-contain" /> : storeInitials}
                    </div>
                    <div className="leading-tight">
                        <div className="font-bold tracking-wider uppercase text-sm">{settings.store_name}</div>
                        <div className="text-[10px] text-white/60 uppercase tracking-tighter">Gestão SaaS</div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all uppercase text-sm tracking-wide ${location.pathname === item.path
                                ? 'bg-brand-brown/50 border-l-4 border-brand-gold text-white font-bold'
                                : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-white/5 rounded-lg opacity-70 hover:opacity-100 transition-opacity uppercase text-xs">
                        <ArrowLeft size={16} /> Voltar à Loja
                    </Link>
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-red-500/20 rounded-lg text-red-300 hover:text-red-200 transition-colors uppercase text-xs">
                        <LogOut size={16} /> Sair
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto h-screen bg-[#FDFBF7] dark:bg-stone-950">
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
            </main>
        </div>
    );
}
