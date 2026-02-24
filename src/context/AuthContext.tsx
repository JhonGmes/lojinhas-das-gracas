import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updatePassword as firebaseUpdatePassword
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { User } from '../types'

interface AuthContextType {
    user: User | null
    login: (email: string, pass: string) => Promise<boolean>
    signUp: (data: {
        email: string;
        pass: string;
        name: string;
        whatsapp: string;
        address: string;
        storeId?: string;
        customer_address_street?: string;
        customer_address_number?: string;
        customer_address_complement?: string;
        customer_address_neighborhood?: string;
        customer_address_city?: string;
        customer_address_state?: string;
        customer_address_zipcode?: string;
    }) => Promise<{ success: boolean; message?: string }>
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        saveUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: userData.name,
                            whatsapp: userData.whatsapp,
                            address: userData.address,
                            customer_address_street: userData.customer_address_street,
                            customer_address_number: userData.customer_address_number,
                            customer_address_complement: userData.customer_address_complement,
                            customer_address_neighborhood: userData.customer_address_neighborhood,
                            customer_address_city: userData.customer_address_city,
                            customer_address_state: userData.customer_address_state,
                            customer_address_zipcode: userData.customer_address_zipcode,
                            role: userData.role || 'customer',
                            store_id: userData.store_id
                        });
                    }
                } catch (err: any) {
                    console.warn('⚠️ Erro ao buscar perfil no Firestore:', err.message);
                }
            } else {
                saveUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    async function login(email: string, pass: string) {
        try {
            const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, pass);
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                saveUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: userData.name,
                    whatsapp: userData.whatsapp,
                    address: userData.address,
                    customer_address_street: userData.customer_address_street,
                    customer_address_number: userData.customer_address_number,
                    customer_address_complement: userData.customer_address_complement,
                    customer_address_neighborhood: userData.customer_address_neighborhood,
                    customer_address_city: userData.customer_address_city,
                    customer_address_state: userData.customer_address_state,
                    customer_address_zipcode: userData.customer_address_zipcode,
                    role: userData.role || 'customer',
                    store_id: userData.store_id
                });
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('❌ Erro no login Firebase:', err.message);
            return false;
        }
    }

    async function signUp({
        email, pass, name, whatsapp, address, storeId = 'lojinhadas-gracas',
        customer_address_street, customer_address_number, customer_address_complement,
        customer_address_neighborhood, customer_address_city, customer_address_state, customer_address_zipcode
    }: any) {
        try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, pass);

            const userData = {
                id: firebaseUser.uid,
                email,
                name,
                whatsapp,
                address,
                customer_address_street,
                customer_address_number,
                customer_address_complement,
                customer_address_neighborhood,
                customer_address_city,
                customer_address_state,
                customer_address_zipcode,
                role: 'customer',
                store_id: storeId,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), userData);

            saveUser(userData as User);
            return { success: true };
        } catch (err: any) {
            console.error('❌ Erro no cadastro Firebase:', err.message);
            return { success: false, message: err.message };
        }
    }

    async function resetPassword(email: string) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }

    async function updatePassword(password: string) {
        try {
            if (auth.currentUser) {
                await firebaseUpdatePassword(auth.currentUser, password);
                return { success: true };
            }
            return { success: false, message: 'Usuário não autenticado' };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    }

    async function logout() {
        await signOut(auth);
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
