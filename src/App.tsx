import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './features/store/context/StoreContext';
import { BillingProvider } from './features/billing/context/BillingContext';
import { BlogProvider } from './context/BlogContext';
import { WishlistProvider } from './context/WishlistContext';
import { HelmetProvider } from 'react-helmet-async';
import { useState, useEffect, Suspense, lazy, useRef } from 'react';

import { useStore } from './context/StoreContext';
import { MessageCircle, Sparkles, ExternalLink } from 'lucide-react';
import type { ChatResponse } from './services/gemini';

import { Layout } from './components/layout/Layout';
import { geminiService } from './services/gemini';
import ScrollToTop from './components/layout/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const StoreNotFound = lazy(() => import('./pages/StoreNotFound').then(m => ({ default: m.StoreNotFound })));
const BlogList = lazy(() => import('./pages/BlogList').then(m => ({ default: m.BlogList })));
const BlogDetail = lazy(() => import('./pages/BlogDetail').then(m => ({ default: m.BlogDetail })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Identification = lazy(() => import('./pages/Identification').then(m => ({ default: m.Identification })));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const SuperAdmin = lazy(() => import('./pages/admin/SuperAdmin').then(m => ({ default: m.SuperAdmin })));
const RegisterStore = lazy(() => import('./pages/RegisterStore'));
const SaaSLandingPage = lazy(() => import('./pages/SaaSLandingPage'));

import { LoadingScreen } from './components/ui/LoadingScreen';

const LoadingFallback = () => <LoadingScreen />;

function ChatBot() {
    const { settings: storeSettings } = useStore();
    const whatsappNumber = storeSettings?.whatsapp_number || '5598984095956';

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; link?: ChatResponse['link'] }[]>([
        { role: 'bot', text: 'A Paz de Cristo! Eu sou a Gracinh IA. Posso ajudar você a encontrar algo especial hoje? 🙏' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const send = async () => {

        if (!input.trim()) return;
        const userText = input;
        setInput('');
        setMessages(p => [...p, { role: 'user', text: userText }]);
        setLoading(true);
        const reply = await geminiService.chat(userText, whatsappNumber);
        setMessages(p => [...p, { role: 'bot', text: reply.text, link: reply.link }]);
        setLoading(false);
    };

    const handleNavLink = (url: string) => {
        setOpen(false);
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    };


    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {open && (
                <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 w-80 mb-4 overflow-hidden pointer-events-auto animate-fade-in-up flex flex-col max-h-[520px]">
                    <div className="bg-brand-wood text-white p-4 font-bold flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-brand-gold" />
                            <span>Gracinh IA</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-stone-900/50" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user'
                                    ? 'bg-brand-gold text-white rounded-tr-none shadow-sm'
                                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-tl-none shadow-sm text-stone-800 dark:text-stone-200'
                                    }`}>
                                    {m.text}
                                </div>
                                {m.link && (
                                    <button
                                        onClick={() => handleNavLink(m.link!.url)}
                                        className="mt-2 flex items-center gap-2 bg-white dark:bg-stone-800 text-brand-wood dark:text-brand-gold border border-brand-gold/30 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-brand-gold hover:text-white transition-all transform hover:scale-105 active:scale-95 border-dashed"
                                    >
                                        <ExternalLink size={12} className="animate-pulse" />
                                        {m.link.label}
                                    </button>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-start">
                                <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl rounded-tl-none px-4 py-2.5">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-3 border-t border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 flex gap-2">
                        <input
                            className="flex-1 bg-stone-100 dark:bg-stone-900 rounded-full px-4 py-2 text-sm focus:outline-none"
                            placeholder="Escreva sua dúvida..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                        />
                        <button onClick={send} disabled={loading} className="bg-brand-gold text-white p-2 rounded-full hover:bg-brand-amber transition-colors disabled:opacity-50">
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>
            )}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 bg-brand-gold hover:bg-amber-500 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 pointer-events-auto"
            >
                <MessageCircle size={28} />
            </button>
        </div>
    )
}

function AppRoutes() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-right" />
            <ErrorBoundary whatsappNumber="5598984095956">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Layout><Home /></Layout>} />
                        <Route path="/plataforma" element={<SaaSLandingPage />} />
                        <Route path="/comecar" element={<RegisterStore />} />
                        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                        <Route path="/cart" element={<Layout><Cart /></Layout>} />
                        <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                        <Route path="/quem-somos" element={<Layout><AboutUs /></Layout>} />
                        <Route path="/privacidade" element={<Layout><PrivacyPolicy /></Layout>} />
                        <Route path="/pedido-confirmado/:id" element={<Layout><OrderSuccess /></Layout>} />
                        <Route path="/404-loja" element={<StoreNotFound />} />
                        <Route path="*" element={<Layout><Home /></Layout>} />

                        {/* Blog Routes */}
                        <Route path="/blog" element={<Layout><BlogList /></Layout>} />
                        <Route path="/blog/:id" element={<Layout><BlogDetail /></Layout>} />

                        {/* Auth Routes */}
                        <Route path="/login" element={<Layout><Identification /></Layout>} />
                        <Route path="/admin-login" element={<Login />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Secure Routes */}
                        <Route path="/admin/super" element={<SuperAdmin />} />
                        <Route path="/admin/*" element={<AdminLayout />} />

                        {/* Catch All */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
            <ChatBot />
        </BrowserRouter>
    );
}

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <StoreProvider>
                        <BillingProvider>
                            <BlogProvider>
                                <ProductProvider>
                                    <WishlistProvider>
                                        <CartProvider>
                                            <AppRoutes />
                                        </CartProvider>
                                    </WishlistProvider>
                                </ProductProvider>
                            </BlogProvider>
                        </BillingProvider>
                    </StoreProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
