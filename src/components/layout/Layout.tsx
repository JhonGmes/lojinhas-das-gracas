import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, User, LogOut, LayoutDashboard, Search, Mail, Send, Menu, X as CloseIcon, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { WhatsAppWidget } from '../ui/WhatsAppWidget';
import { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

export function Layout({ children }: { children: React.ReactNode }) {
    const { items: cartItems } = useCart();
    const { items: wishlistItems } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const { settings, currentStoreId } = useStore();
    const { user, logout } = useAuth();
    const { categories } = useProducts();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const s = params.get('q');
        if (s) setSearch(s);
    }, [location.search]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/?q=${encodeURIComponent(search.trim())}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-400 dark:bg-stone-950 dark:text-stone-100 bg-brand-cotton">
            {/* Mobile Sidebar Menu */}
            <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-stone-950/40 backdrop-blur-sm transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-stone-900 shadow-2xl transition-transform duration-500 ease-out border-r border-stone-100 dark:border-stone-800 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="font-script text-2xl text-brand-gold" style={{ fontFamily: "'Cookie', cursive" }}>{settings.store_name}</h2>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-stone-400">Coleções de Fé</p>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-stone-400 hover:text-brand-gold">
                            <CloseIcon size={24} />
                        </button>
                    </div>
                    <nav className="p-4">
                        <ul className="space-y-1">
                            <li>
                                <Link
                                    to={`/blog`}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex items-center px-4 py-4 text-sm font-display font-medium text-stone-700 dark:text-stone-300 hover:bg-brand-cotton dark:hover:bg-stone-800 rounded-xl transition-colors uppercase tracking-widest text-brand-gold"
                                >
                                    Blog Diário
                                </Link>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const newParams = new URLSearchParams();
                                            newParams.set('cat', cat);
                                            window.history.replaceState({}, '', `?${newParams.toString()}`);
                                            setIsSidebarOpen(false);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="flex items-center px-4 py-4 text-sm font-display font-medium text-stone-700 dark:text-stone-300 hover:bg-brand-cotton dark:hover:bg-stone-800 rounded-xl transition-colors uppercase tracking-widest"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>

            <header className="sticky top-0 z-50 bg-white/95 dark:bg-stone-900 shadow-soft transition-all duration-400 backdrop-blur-md border-b border-brand-cotton-dark/50">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-3.5 flex items-center justify-between gap-5 md:gap-10">
                    <button
                        className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-brand-gold transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={22} />
                    </button>

                    <Link
                        to="/"
                        onClick={() => {
                            window.location.href = '/';
                        }}
                        className="flex items-center gap-3 md:gap-4 shrink-0 hover:opacity-95 transition-all group mx-auto lg:mx-0"
                    >
                        {settings.logo_url ? (
                            <img src={settings.logo_url} className="h-8 md:h-11 lg:h-13 w-auto object-contain drop-shadow-sm" alt={settings.store_name} />
                        ) : (
                            <div className="h-8 w-8 md:h-11 md:w-11 bg-brand-gold/10 rounded-full flex items-center justify-center text-lg md:text-xl shadow-inner">🕊️</div>
                        )}
                        <div className="flex flex-col">
                            <h1 className="font-script text-base md:text-xl lg:text-2xl text-brand-gold leading-none" style={{ fontFamily: "'Cookie', cursive" }}>
                                {settings.store_name}
                            </h1>
                            <p className="font-display text-[6px] md:text-[8px] text-brand-gold/80 mt-0.5 font-bold tracking-[0.2em] uppercase truncate">
                                Artigos Religiosos
                            </p>
                        </div>
                    </Link>

                    <div className="hidden lg:flex flex-1 max-w-lg mx-4">
                        <form onSubmit={handleSearch} className="relative w-full group">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="O que sua Fé procura hoje?"
                                className="w-full bg-brand-cotton dark:bg-stone-800 border-none rounded-sm px-5 py-2.5 outline-none ring-1 ring-brand-cotton-dark dark:ring-stone-700/50 focus:ring-brand-gold transition-all duration-400 text-xs shadow-inner-soft placeholder:text-stone-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 bottom-1 px-4 flex items-center justify-center bg-brand-gold text-brand-wood rounded-sm hover:bg-brand-gold-light transition-all duration-400"
                            >
                                <Search size={16} />
                            </button>
                        </form>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={toggleTheme} className="hidden sm:block p-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-600 dark:text-stone-300">
                            {theme === 'light' ? <Moon size={18} className="text-brand-gold/60" /> : <Sun size={18} className="text-brand-gold" />}
                        </button>

                        <div className="relative" ref={userMenuRef}>
                            {user ? (
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-1 md:gap-2.5 group p-1.5 hover:bg-brand-cotton dark:hover:bg-stone-800 rounded-sm transition-all duration-400"
                                >
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-sm bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-[10px] md:text-xs">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                </button>
                            ) : (
                                <Link to="/login" className="flex flex-col items-center gap-0.5 hover:opacity-75 transition-all text-brand-gold">
                                    <User size={18} />
                                    <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Entrar</span>
                                </Link>
                            )}

                            {isUserMenuOpen && user && (
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-stone-800 rounded-sm shadow-soft-xl border border-brand-cotton-dark dark:border-stone-700 p-2 z-[100] animate-fade-in-up">
                                    <div className="p-4 border-b border-stone-50 dark:border-stone-700 mb-2 bg-stone-50/50 dark:bg-stone-900/30 rounded-sm text-center">
                                        <p className="text-[10px] font-bold text-stone-800 dark:text-stone-100 truncate">{user.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3.5 w-full px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-300 hover:bg-brand-cotton dark:hover:bg-stone-900 rounded-sm transition-colors">
                                                <LayoutDashboard size={14} className="text-brand-gold" /> Painel de Gestão
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="flex items-center gap-3.5 w-full px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-sm transition-colors text-left">
                                            <LogOut size={14} /> Encerrar Sessão
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Wishlist Link */}
                        <Link to="/wishlist" className="flex flex-col items-center gap-0.5 hover:opacity-75 transition-all text-brand-gold relative group">
                            <div className="relative">
                                <Heart size={20} className="md:size-22 group-hover:scale-110 transition-transform" />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1.5 bg-brand-gold text-brand-wood text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-sm ring-2 ring-white dark:ring-stone-900 shadow-md">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Favoritos</span>
                        </Link>

                        <Link to="/cart" className="flex flex-col items-center gap-0.5 hover:opacity-75 transition-all text-brand-gold relative group">
                            <div className="relative">
                                <ShoppingCart size={20} className="md:size-22 group-hover:scale-110 transition-transform" />
                                {cartItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1.5 bg-brand-wood text-brand-gold text-[7px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-sm ring-2 ring-white dark:ring-stone-900 shadow-md">
                                        {cartItems.length}
                                    </span>
                                )}
                            </div>
                            <span className="text-[7px] font-black uppercase tracking-widest hidden md:block">Carrinho</span>
                        </Link>
                    </div>
                </div>

                <nav className="hidden lg:block border-t border-stone-100 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 relative">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center h-12">
                        <ul className="flex items-center gap-8 md:gap-10">
                            <li>
                                <Link
                                    to="/blog"
                                    className="font-display text-[10px] font-medium text-brand-gold hover:text-brand-amber transition-all relative group py-1.5 uppercase tracking-[0.2em]"
                                >
                                    Blog Diário
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                                </Link>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const newParams = new URLSearchParams();
                                            newParams.set('cat', cat);
                                            window.history.replaceState({}, '', `?${newParams.toString()}`);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            // Se estiver na Home, o useEffect vai disparar a atualização do estado
                                            if (location.pathname !== '/') {
                                                navigate(`/?cat=${cat}`);
                                            }
                                        }}
                                        className="font-display text-[10px] font-medium text-stone-500 dark:text-stone-400 hover:text-brand-gold transition-all relative group py-1.5 uppercase tracking-[0.2em]"
                                    >
                                        {cat}
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </header >

            <main className="flex-1 w-full">
                {children}
            </main>

            <footer className="bg-brand-wood text-amber-50 mt-auto border-t-2 border-brand-gold overflow-hidden">
                <div className="bg-white/5 border-b border-white/5 py-8">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-wood shadow-lg rotate-3">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="font-display text-lg font-bold text-brand-gold">Bênção Diária</h3>
                                    <p className="text-[10px] opacity-60">Receba orações e novidades</p>
                                </div>
                            </div>
                            <form
                                className="flex-1 max-w-xs w-full flex items-center gap-2"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const emailInput = e.currentTarget.querySelector('input') as HTMLInputElement;
                                    const email = emailInput.value;
                                    if (!email) return;
                                    try {
                                        await api.newsletter.subscribe(email, currentStoreId);
                                        toast.success('Inscrito com sucesso! 🙏');
                                        emailInput.value = '';
                                    } catch {
                                        toast.error('Ocorreu um erro.');
                                    }
                                }}
                            >
                                <input
                                    type="email"
                                    required
                                    placeholder="Seu e-mail"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 outline-none focus:bg-white/10 focus:border-brand-gold transition-all text-[11px]"
                                />
                                <button type="submit" className="bg-brand-gold text-brand-wood p-2 rounded-full hover:bg-white hover:text-brand-gold transition-all shadow-lg">
                                    <Send size={14} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start text-center md:text-left">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="font-script text-3xl md:text-4xl text-brand-gold leading-none" style={{ fontFamily: "'Cookie', cursive" }}>{settings.store_name}</h2>
                                <p className="font-display text-[8px] text-brand-gold/60 uppercase tracking-[0.2em] font-bold">Artigos Religiosos</p>
                            </div>
                            <p className="text-[11px] leading-relaxed opacity-60 max-w-xs mx-auto md:mx-0">
                                Levando fé, esperança e devoção para o seu lar através de artigos selecionados com amor e respeito à tradição.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-display text-sm font-bold text-brand-gold uppercase tracking-widest">Institucional</h4>
                            <ul className="space-y-2 text-[11px] opacity-60">
                                <li><Link to="/quem-somos" className="hover:text-brand-gold transition-colors">Quem Somos</Link></li>
                                <li><a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">Fale Conosco</a></li>
                                <li><Link to="/privacidade" className="hover:text-brand-gold transition-colors">Política de Privacidade</Link></li>
                                <li><Link to="/blog" className="hover:text-brand-gold transition-colors">Blog Diário</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-display text-sm font-bold text-brand-gold uppercase tracking-widest">Inspiração</h4>
                            <div className="relative p-4 bg-white/5 rounded-2xl border border-white/5 italic text-[11px] opacity-80 leading-relaxed shadow-inner">
                                "Tudo posso naquele que me fortalece."
                                <div className="absolute -top-2 -left-2 w-6 h-6 bg-brand-gold text-brand-wood flex items-center justify-center rounded text-sm font-serif">“</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/5 text-center">
                        <p className="text-[8px] opacity-40 font-bold uppercase tracking-wider">
                            © {new Date().getFullYear()} {settings.store_name} • Todos os direitos reservados
                        </p>
                    </div>
                </div>
            </footer>
            <WhatsAppWidget />
        </div >
    );
}
