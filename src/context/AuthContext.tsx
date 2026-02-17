import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    login: (email: string, pass: string) => Promise<boolean>
    signUp: (data: { email: string; pass: string; name: string; whatsapp: string; address: string; storeId?: string }) => Promise<{ success: boolean; message?: string }>
    resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        checkUser()
    }, [])

    async function checkUser() {
        const { data } = await supabase.auth.getSession()
        const session = data.session

        if (!session) return

        const authId = session.user.id

        const { data: usuario } = await supabase
            .from('usuarios')
            .select('*')
            .eq('auth_id', authId)
            .single()

        if (usuario) {
            setUser({
                id: usuario.id,
                email: usuario.email,
                name: usuario.nome,
                whatsapp: usuario.telefone,
                address: usuario.endereco,
                role: usuario.nivel,
                store_id: usuario.store_id
            })
        }
    }

    async function login(email: string, pass: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        })

        if (error || !data.user) return false

        const { data: usuario } = await supabase
            .from('usuarios')
            .select('*')
            .eq('auth_id', data.user.id)
            .single()

        if (!usuario) return false

        if (usuario) {
            setUser({
                id: usuario.id,
                email: usuario.email,
                name: usuario.nome,
                whatsapp: usuario.telefone,
                address: usuario.endereco,
                role: usuario.nivel,
                store_id: usuario.store_id
            })
        }

        return true
    }

    async function signUp({ email, pass, name, whatsapp, address, storeId = '00000000-0000-0000-0000-000000000001' }: { email: string; pass: string; name: string; whatsapp: string; address: string, storeId?: string }) {
        console.log('🚀 [AuthContext] Iniciando signUp com dados:', { email, name, whatsapp, address, storeId });

        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass
        })

        if (error || !data.user) {
            console.error('❌ [AuthContext] Erro ao criar usuário no auth:', error);
            return { success: false, message: error?.message || 'Erro ao cadastrar' }
        }

        console.log('✅ [AuthContext] Usuário auth criado com sucesso:', data.user.id);

        // Create profile in usuarios table
        const insertData = {
            auth_id: data.user.id,
            email: email,
            nome: name,
            telefone: whatsapp,
            endereco: address,
            nivel: 'customer',
            store_id: storeId
        };

        console.log('📝 [AuthContext] Dados que serão inseridos na tabela usuarios:', insertData);

        const { data: insertResult, error: profileError } = await supabase
            .from('usuarios')
            .insert([insertData])
            .select();

        console.log('📤 [AuthContext] Resultado do INSERT:', { insertResult, profileError });

        if (profileError) {
            console.error('❌ [AuthContext] Erro ao salvar perfil na tabela usuarios:', profileError);
            console.error('Dados que tentamos inserir:', insertData);
            return { success: false, message: 'Conta criada, mas erro ao salvar perfil. Contate o suporte.' }
        }

        console.log('✅ [AuthContext] Perfil salvo com sucesso na tabela usuarios');

        // If email confirmation is disabled in Supabase, we get a session immediately
        if (data.session) {
            setUser({
                id: data.user.id,
                email: email,
                name: name,
                whatsapp: whatsapp,
                address: address,
                role: 'customer',
                store_id: storeId
            })
            console.log('✅ [AuthContext] Sessão criada e usuário setado no contexto');
        }

        return { success: true }
    }

    async function resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            return { success: false, message: error.message }
        }

        return { success: true }
    }

    async function logout() {
        await supabase.auth.signOut()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, signUp, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth error")
    return context
}
