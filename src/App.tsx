import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { BlogProvider } from './context/BlogContext';
import { WishlistProvider } from './context/WishlistContext';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense, useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

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
const BlogList = lazy(() => import('./pages/BlogList').then(m => ({ default: m.BlogList })));
const BlogDetail = lazy(() => import('./pages/BlogDetail').then(m => ({ default: m.BlogDetail })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Identification = lazy(() => import('./pages/Identification').then(m => ({ default: m.Identification })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const SuperAdmin = lazy(() => import('./pages/admin/SuperAdmin').then(m => ({ default: m.SuperAdmin })));

import { LoadingScreen } from './components/ui/LoadingScreen';

const LoadingFallback = () => <LoadingScreen />;

function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
        { role: 'bot', text: 'A Paz de Cristo! Eu sou a Gracinh IA. Posso ajudar você a encontrar algo especial hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const send = async () => {
        if (!input.trim()) return;
        const userText = input;
        setInput('');
        setMessages(p => [...p, { role: 'user', text: userText }]);
        setLoading(true);
        const reply = await geminiService.chat(userText);
        setMessages(p => [...p, { role: 'bot', text: reply }]);
        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {open && (
                <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 w-80 mb-4 overflow-hidden pointer-events-auto animate-fade-in-up flex flex-col max-h-[500px]">
                    <div className="bg-brand-wood text-white p-4 font-bold flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-brand-gold" />
                            <span>Gracinh IA</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50 dark:bg-stone-900">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.role === 'user'
                                    ? 'bg-brand-gold text-white rounded-tr-none'
                                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-tl-none'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-stone-400 p-2">Digitando...</div>}
                    </div>
                    <div className="p-3 border-t border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 flex gap-2">
                        <input
                            className="flex-1 bg-stone-100 dark:bg-stone-900 rounded-full px-4 py-2 text-sm focus:outline-none"
                            placeholder="Escreva sua dúvida..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                        />
                        <button onClick={send} className="bg-brand-gold text-white p-2 rounded-full hover:bg-brand-amber transition-colors">
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

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <StoreProvider>
                    <AuthProvider>
                        <BlogProvider>
                            <ProductProvider>
                                <WishlistProvider>
                                    <CartProvider>
                                        <BrowserRouter>
                                            <ScrollToTop />
                                            <Toaster position="top-right" />
                                            <ErrorBoundary whatsappNumber="5598984095956">
                                                <Suspense fallback={<LoadingFallback />}>
                                                    <Routes>
                                                        {/* Public Routes */}
                                                        <Route path="/" element={<Layout><Home /></Layout>} />
                                                        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                                                        <Route path="/cart" element={<Layout><Cart /></Layout>} />
                                                        <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                                                        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                                                        <Route path="/quem-somos" element={<Layout><AboutUs /></Layout>} />
                                                        <Route path="/privacidade" element={<Layout><PrivacyPolicy /></Layout>} />
                                                        <Route path="/pedido-confirmado/:orderId" element={<Layout><OrderSuccess /></Layout>} />

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
                                    </CartProvider>
                                </WishlistProvider>
                            </ProductProvider>
                        </BlogProvider>
                    </AuthProvider>
                </StoreProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;
