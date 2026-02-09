import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, User, LogOut, LayoutDashboard, Search, Instagram, Facebook, Mail, Send } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { WhatsAppWidget } from '../ui/WhatsAppWidget';
import { useState, useRef, useEffect } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
    const { items } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { settings } = useStore();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Sync search input with URL if needed
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const s = params.get('q');
        if (s) setSearch(s);
    }, [location.search]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
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
        <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-stone-950 dark:text-stone-100 bg-stone-50">
            <header className="sticky top-0 z-50 bg-white dark:bg-stone-900 shadow-sm transition-all duration-300">
                {/* Top Row: Logo, Search, Actions - Widened container */}
                <div className="max-w-[1600px] mx-auto px-4 md:px-10 py-4 flex items-center justify-between gap-8">

                    {/* Brand Section: Logo + Name Side-by-Side */}
                    <Link to="/" className="flex items-center gap-4 shrink-0 hover:opacity-95 transition-all group">
                        {settings.logo_url ? (
                            <img src={settings.logo_url} className="h-12 md:h-32 w-auto object-contain drop-shadow-sm" alt={settings.store_name} />
                        ) : (
                            <div className="h-14 w-14 md:h-24 md:w-24 bg-brand-gold/10 rounded-full flex items-center justify-center text-4xl shadow-inner">🕊️</div>
                        )}
                        <div className="flex flex-col text-center -gap-1">
                            <h1 className="font-script text-xl md:text-5xl text-brand-gold leading-[0.7] text-shadow-premium" style={{ fontFamily: "'Cookie', cursive" }}>
                                {settings.store_name}
                            </h1>
                            <p className="font-display text-[10px] md:text-sm text-brand-gold/80 -mt-2 md:-mt-3 font-medium tracking-widest uppercase">
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
                                className="w-full bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 rounded-full px-6 py-2 outline-none focus:border-brand-gold transition-all text-sm shadow-sm placeholder:text-stone-300"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 bottom-1.5 w-10 flex items-center justify-center bg-brand-gold text-white rounded-full hover:bg-brand-amber transition-colors"
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

                        <div className="relative" ref={menuRef}>
                            {user ? (
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2 group p-1 pr-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full transition-all"
                                >
                                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-bold text-xs">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">
                                        {user.role === 'admin' ? 'Painel' : 'Perfil'}
                                    </span>
                                </button>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest text-brand-gold">
                                    <User size={20} className="text-brand-gold/60" />
                                    <span className="hidden sm:inline">Entrar</span>
                                </Link>
                            )}

                            {menuOpen && user && (
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-brand-gold/20 p-2 z-[100] animate-fade-in-up">
                                    <div className="p-4 border-b border-stone-50 dark:border-stone-700 mb-2">
                                        <p className="text-sm font-bold text-stone-800 dark:text-stone-100 truncate">{user.email}</p>
                                        <p className="text-[8px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded-full inline-block mt-2 font-black uppercase tracking-tighter">
                                            {user.role === 'admin' ? 'Administrador' : 'Cliente Especial'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold hover:bg-brand-gold/5 rounded-xl transition-colors">
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

                        <Link to="/cart" className="flex items-center gap-2 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-all group">
                            <div className="relative">
                                <ShoppingCart size={22} className="text-brand-gold/60 group-hover:text-brand-gold transition-colors" />
                                {items.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-brand-gold text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {items.length}
                                    </span>
                                )}
                            </div>
                            <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest text-brand-gold/60 group-hover:text-brand-gold">Carrinho</span>
                        </Link>
                    </div>
                </div>

                {/* Bottom Row: Mobile Toggle + Centered Navigation */}
                <nav className="border-t border-stone-100 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 relative">
                    <div className="max-w-[1600px] mx-auto px-4 md:px-10 flex items-center justify-center h-16">
                        {/* Hamburger Icon on the Left - Absolutely positioned to not affect centering */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="absolute left-4 md:left-10 p-2 text-stone-800 dark:text-stone-200 hover:text-brand-gold transition-colors"
                        >
                            <div className="space-y-1.5">
                                <div className={`w-8 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                <div className={`w-8 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                                <div className={`w-8 h-0.5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                            </div>
                        </button>

                        {/* DESKTOP Categories Navigation */}
                        <ul className="hidden md:flex items-center gap-12">
                            {['Adorno', 'Camisa', 'Caneca', 'Crucifixo', 'Imagem', 'Quadro', 'Terço'].map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/?cat=${cat}`}
                                        className="font-display text-xl text-stone-700 dark:text-stone-300 hover:text-brand-gold transition-all relative group py-2"
                                    >
                                        {cat}
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* MOBILE BRAND TEXT (When centered nav is hidden) */}

                    </div>

                    {/* Mobile Menu Dropdown */}
                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-stone-900 shadow-2xl border-t border-stone-100 dark:border-stone-800 animate-fade-in-up z-[90]">
                            <ul className="py-4 divide-y divide-stone-50 dark:divide-stone-800">
                                {['Adorno', 'Camisa', 'Caneca', 'Crucifixo', 'Imagem', 'Quadro', 'Terço'].map((cat) => (
                                    <li key={cat}>
                                        <Link
                                            to={`/?cat=${cat}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="block px-8 py-4 text-lg font-display text-stone-700 dark:text-stone-300 hover:bg-brand-gold/5 hover:text-brand-gold transition-colors"
                                        >
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </nav>
            </header>

            <main className="flex-1 w-full">
                {children}
            </main>

            <footer className="bg-brand-wood text-amber-50 mt-auto border-t-4 border-brand-gold overflow-hidden">
                {/* Newsletter Section - Benção Diária */}
                <div className="bg-white/5 border-b border-white/10 py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-wood shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
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
                                <button className="bg-brand-gold text-brand-wood p-3 rounded-full hover:bg-white hover:text-brand-gold transition-all shadow-xl active:scale-95">
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start text-center md:text-left">
                        {/* Brand Column */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="font-script text-4xl md:text-5xl text-brand-gold leading-none">{settings.store_name}</h2>
                                <p className="font-display text-[10px] text-brand-gold/60 uppercase tracking-[0.3em] font-bold">Artigos Religiosos</p>
                            </div>
                            <p className="text-sm leading-relaxed opacity-60 max-w-xs mx-auto md:mx-0">
                                Levando fé, esperança e devoção para o seu lar através de artigos selecionados com amor e respeito à tradição.
                            </p>
                            {/* Social Sharing - Botões de Compartilhamento */}
                            <div className="flex justify-center md:justify-start gap-4 pt-2">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-wood transition-all border border-white/10 group">
                                    <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-wood transition-all border border-white/10 group">
                                    <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-wood transition-all border border-white/10 group">
                                    <Mail size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* Navigation Column */}
                        <div className="space-y-6">
                            <h4 className="font-display text-lg font-bold text-brand-gold uppercase tracking-widest">Institucional</h4>
                            <ul className="space-y-4 text-sm opacity-60">
                                <li><a href="#" className="hover:text-brand-gold transition-colors">Quem Somos</a></li>
                                <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Fale Conosco</Link></li>
                                <li><a href="#" className="hover:text-brand-gold transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-brand-gold transition-colors">Política de Privacidade</a></li>
                            </ul>
                        </div>

                        {/* Contact/Quote Column */}
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
        </div>
    );
}
