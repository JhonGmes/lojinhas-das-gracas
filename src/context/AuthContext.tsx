import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    login: (email: string, pass: string) => Promise<boolean>
    signUp: (data: { email: string; pass: string; name: string; whatsapp: string; address: string; storeId?: string }) => Promise<{ success: boolean; message?: string }>
    resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
    updatePassword: (password: string) => Promise<{ success: boolean; message?: string }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LS_USER = 'auth_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem(LS_USER);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const saveUser = (u: User | null) => {
        setUser(u);
        if (u) {
            localStorage.setItem(LS_USER, JSON.stringify(u));
        } else {
            localStorage.removeItem(LS_USER);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            const session = data.session;
            if (!session) {
                if (user) saveUser(null);
                return;
            }

            const authId = session.user.id;
            const { data: usuario, error: dbError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (dbError) throw dbError;

            if (usuario) {
                saveUser({
                    id: usuario.id,
                    email: usuario.email,
                    name: usuario.nome,
                    whatsapp: usuario.telefone,
                    address: usuario.endereco,
                    role: usuario.nivel,
                    store_id: usuario.store_id
                });
            }
        } catch (err: any) {
            console.warn('⚠️ Sessão mantida localmente devido a erro de rede:', err.message);
        }
    }

    async function login(email: string, pass: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: pass
            });

            if (error || !data.user) return false;

            const { data: usuario, error: dbError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('auth_id', data.user.id)
                .single();

            if (dbError || !usuario) return false;

            saveUser({
                id: usuario.id,
                email: usuario.email,
                name: usuario.nome,
                whatsapp: usuario.telefone,
                address: usuario.endereco,
                role: usuario.nivel,
                store_id: usuario.store_id
            });

            return true;
        } catch {
            return false;
        }
    }

    async function signUp({ email, pass, name, whatsapp, address, storeId = '00000000-0000-0000-0000-000000000001' }: { email: string; pass: string; name: string; whatsapp: string; address: string, storeId?: string }) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: pass
            });

            if (error || !data.user) {
                return { success: false, message: error?.message || 'Erro ao cadastrar' }
            }

            const insertData = {
                auth_id: data.user.id,
                email: email,
                nome: name,
                telefone: whatsapp,
                endereco: address,
                nivel: 'customer',
                store_id: storeId
            };

            const { error: profileError } = await supabase
                .from('usuarios')
                .insert([insertData]);

            if (profileError) {
                return { success: false, message: 'Conta criada, mas erro ao salvar perfil.' }
            }

            if (data.session) {
                saveUser({
                    id: data.user.id,
                    email: email,
                    name: name,
                    whatsapp: whatsapp,
                    address: address,
                    role: 'customer',
                    store_id: storeId
                });
            }

            return { success: true }
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }

    async function resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) return { success: false, message: error.message }
        return { success: true }
    }

    async function updatePassword(password: string) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) return { success: false, message: error.message }
        return { success: true }
    }

    async function logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('cart');
        saveUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, login, signUp, resetPassword, updatePassword, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth error")
    return context
}
