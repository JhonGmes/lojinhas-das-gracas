import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import type { User } from '../../../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
    signup: (data: { email: string; pass: string; name: string; whatsapp?: string; address?: string; storeId?: string }) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
    updatePassword: (pass: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    const saveUser = (userData: User | null) => {
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    saveUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
                }
            } else {
                saveUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, pass);
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                saveUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
            }
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    const signup = async (data: any) => {
        try {
            const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, data.email, data.pass);
            const userData: User = {
                id: firebaseUser.uid,
                email: data.email,
                name: data.name,
                role: 'customer',
                store_id: data.storeId || 'lojinhadas-gracas',
                whatsapp: data.whatsapp,
                address: data.address
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            saveUser(userData);
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
        saveUser(null);
    };

    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    const updatePassword = async (_pass: string) => {
        try {
            if (!auth.currentUser) throw new Error("Usuário não autenticado.");
            return { success: true };
        } catch (err: any) {
            return { success: false, message: err.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword, updatePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
