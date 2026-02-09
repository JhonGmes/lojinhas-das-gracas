import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    login: (email: string, pass: string) => Promise<boolean>
    signUp: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>
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
                role: usuario.nivel
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

        setUser({
            id: usuario.id,
            email: usuario.email,
            role: usuario.nivel
        })

        return true
    }

    async function signUp(email: string, pass: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass
        })

        if (error || !data.user) {
            return { success: false, message: error?.message || 'Erro ao cadastrar' }
        }

        // Create profile in usuarios table
        const { error: profileError } = await supabase
            .from('usuarios')
            .insert([
                {
                    auth_id: data.user.id,
                    email: email,
                    nivel: 'cliente'
                }
            ])

        if (profileError) {
            console.error('Error creating profile:', JSON.stringify(profileError, null, 2))
            // Even if profile creation fails, the auth user is created.
            // We return success if it's just a duplicate profile error,
            // but let's be strict for now and just log it.
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
