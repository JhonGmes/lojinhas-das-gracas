import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, User, LogOut, LayoutDashboard, Search, Mail, Send, Instagram, Facebook, Menu, X as CloseIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { WhatsAppWidget } from '../ui/WhatsAppWidget';
import { useState, useRef, useEffect } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
    const { items } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { settings } = useStore();
    const { user, logout } = useAuth();
    const { categories } = useProducts();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Sync search input with URL if needed
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
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/?cat=${cat}`}
                                        onClick={() => setIsSidebarOpen(false)}
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
                {/* Top Row: Logo, Search, Actions - Widened container */}
                <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-3 md:py-4 flex items-center justify-between gap-4 md:gap-8">
                    {/* Mobile Menu Trigger */}
                    <button
                        className="lg:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-brand-gold transition-colors"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    {/* Brand Section: Logo + Name Side-by-Side */}
                    <Link to="/" className="flex items-center gap-2 md:gap-4 shrink-0 hover:opacity-95 transition-all group mx-auto lg:mx-0">
                        {settings.logo_url ? (
                            <img src={settings.logo_url} className="h-10 md:h-20 lg:h-24 w-auto object-contain drop-shadow-sm" alt={settings.store_name} />
                        ) : (
                            <div className="h-10 w-10 md:h-16 md:w-16 bg-brand-gold/10 rounded-full flex items-center justify-center text-xl md:text-3xl shadow-inner">🕊️</div>
                        )}
                        <div className="flex flex-col -gap-1">
                            <h1 className="font-script text-lg md:text-3xl lg:text-4xl text-brand-gold leading-tight text-shadow-premium" style={{ fontFamily: "'Cookie', cursive" }}>
                                {settings.store_name}
                            </h1>
                            <p className="font-display text-[8px] md:text-[10px] text-brand-gold/80 -mt-0.5 md:-mt-1 font-medium tracking-widest uppercase truncate max-w-[80px] md:max-w-none">
                                Artigos Religiosos
                            </p>
                        </div>
                    </Link>

                    {/* Search Section: Centered */}
                    <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                        <form onSubmit={handleSearch} className="relative w-full group">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="O que sua Fé procura hoje?"
                                className="w-full bg-brand-cotton dark:bg-stone-800 border-none rounded-sm px-6 py-2.5 outline-none ring-1 ring-brand-cotton-dark dark:ring-stone-700/50 focus:ring-brand-gold transition-all duration-400 text-sm shadow-inner-soft placeholder:text-stone-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1 bottom-1 px-4 flex items-center justify-center bg-brand-gold text-brand-wood rounded-sm hover:bg-brand-gold-light transition-all duration-400"
                            >
                                <Search size={18} />
                            </button>
                        </form>
                    </div>

                    {/* Actions Section: Right Aligned */}
                    <div className="flex items-center gap-2 md:gap-6">
                        <button onClick={toggleTheme} className="p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-600 dark:text-stone-300">
                            {theme === 'light' ? <Moon size={22} className="text-brand-gold/60" /> : <Sun size={22} className="text-brand-gold" />}
                        </button>

                        <div className="relative" ref={userMenuRef}>
                            {user ? (
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-1.5 md:gap-2 group p-1 hover:bg-brand-cotton dark:hover:bg-stone-800 rounded-sm transition-all duration-400"
                                >
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-sm bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-[10px] md:text-xs">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-brand-gold">
                                        {user.role === 'admin' ? 'Painel' : 'Perfil'}
                                    </span>
                                </button>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-all text-stone-600 dark:text-stone-300">
                                    <User size={20} className="text-brand-gold/60" />
                                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-brand-gold">Entrar</span>
                                </Link>
                            )}

                            {isUserMenuOpen && user && (
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-stone-800 rounded-sm shadow-soft-lg border border-brand-cotton-dark dark:border-stone-700 p-2 z-[100] animate-fade-in-up">
                                    <div className="p-4 border-b border-stone-50 dark:border-stone-700 mb-2">
                                        <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{user.email}</p>
                                        <p className="text-[8px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full inline-block mt-2 font-black uppercase tracking-tighter">
                                            {user.role === 'admin' ? 'Administrador' : 'Cliente Especial'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold hover:bg-brand-gold/5 rounded-xl transition-colors">
                                                <LayoutDashboard size={14} /> Painel Administrativo
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-left">
                                            <LogOut size={14} /> Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/cart" className="flex items-center gap-1.5 md:gap-2 p-1 md:px-3 md:py-2 hover:bg-brand-cotton dark:hover:bg-stone-800 rounded-sm transition-all duration-400 group">
                            <div className="relative">
                                <ShoppingCart size={20} className="md:size-22 text-brand-gold group-hover:text-brand-gold-light transition-colors" />
                                {items.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-brand-wood text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-minimal ring-1 ring-white">
                                        {items.length}
                                    </span>
                                )}
                            </div>
                            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest text-brand-gold group-hover:text-brand-gold-light">Carrinho</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom Row: Navigation (Desktop only) */}
                <nav className="hidden lg:block border-t border-stone-100 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 relative overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="max-w-[1600px] mx-auto px-4 md:px-10 flex items-center justify-center h-16">
                        <ul className="flex items-center gap-6 md:gap-10 min-w-max">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/?cat=${cat}`}
                                        className="font-display text-base text-stone-700 dark:text-stone-300 hover:text-brand-gold transition-all relative group py-2 uppercase tracking-widest"
                                    >
                                        {cat}
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </header>

            <main className="flex-1 w-full">
                {children}
            </main>

            <footer className="bg-brand-wood text-amber-50 mt-auto border-t-4 border-brand-gold overflow-hidden">
                {/* Newsletter Section */}
                <div className="bg-white/5 border-b border-white/10 py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-wood shadow-lg rotate-3">
                                    <Mail size={28} />
                                </div>
                                <div>
                                    <h3 className="font-display text-2xl font-bold text-brand-gold">Bênção Diária</h3>
                                    <p className="text-sm opacity-60">Receba orações e novidades em seu e-mail</p>
                                </div>
                            </div>
                            <form className="flex-1 max-w-md w-full flex items-center gap-2" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="email"
                                    placeholder="Seu melhor e-mail"
                                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 outline-none focus:bg-white/20 focus:border-brand-gold transition-all text-sm"
                                />
                                <button className="bg-brand-gold text-brand-wood p-3 rounded-full hover:bg-white hover:text-brand-gold transition-all shadow-xl">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start text-center md:text-left">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="font-script text-4xl md:text-5xl text-brand-gold leading-none">{settings.store_name}</h2>
                                <p className="font-display text-[10px] text-brand-gold/60 uppercase tracking-[0.3em] font-bold">Artigos Religiosos</p>
                            </div>
                            <p className="text-sm leading-relaxed opacity-60 max-w-xs mx-auto md:mx-0">
                                Levando fé, esperança e devoção para o seu lar através de artigos selecionados com amor e respeito à tradição.
                            </p>
                            <div className="flex justify-center md:justify-start gap-4 pt-2">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-all border border-white/10 group">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-all border border-white/10 group">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-all border border-white/10 group">
                                    <Mail size={18} />
                                </a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-display text-lg font-bold text-brand-gold uppercase tracking-widest">Institucional</h4>
                            <ul className="space-y-4 text-sm opacity-60">
                                <li><a href="#" className="hover:text-brand-gold transition-colors">Quem Somos</a></li>
                                <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Fale Conosco</Link></li>
                                <li><a href="#" className="hover:text-brand-gold transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-brand-gold transition-colors">Política de Privacidade</a></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-display text-lg font-bold text-brand-gold uppercase tracking-widest">Inspiração</h4>
                            <div className="relative p-6 bg-white/5 rounded-3xl border border-white/10 italic text-sm opacity-80 leading-relaxed shadow-inner">
                                "Tudo posso naquele que me fortalece. A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos."
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand-gold text-brand-wood flex items-center justify-center rounded-lg text-xl font-serif">“</div>
                            </div>
                            <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-brand-gold/30 hover:text-brand-gold transition-colors inline-block pt-4">Área do Lojista</Link>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/10 text-center">
                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} {settings.store_name} • Todos os direitos reservados
                        </p>
                    </div>
                </div>
            </footer>
            <WhatsAppWidget />
        </div >
    );
}
