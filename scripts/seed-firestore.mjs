/**
 * seed-firestore.mjs
 * Uses Firebase client SDK (auth: email+password) to seed Firestore.
 * Run: node scripts/seed-firestore.mjs <email> <password>
 * 
 * Example:
 *   node scripts/seed-firestore.mjs jhongprojetos@gmail.com MySenha123
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCVQ5ZSkH2HPVqKEGcEh5bU7yR0TzwskaY",
    authDomain: "lojinha-dasgracas.firebaseapp.com",
    projectId: "lojinha-dasgracas",
    storageBucket: "lojinha-dasgracas.firebasestorage.app",
    messagingSenderId: "242796769867",
    appId: "1:242796769867:web:7247ca7185bba10c6913ce"
};

const DEFAULT_STORE_ID = '00000000-0000-0000-0000-000000000001';

const [, , email, password] = process.argv;

if (!email || !password) {
    console.error('\n❌ Usage: node scripts/seed-firestore.mjs <email> <password>\n');
    console.error('   Example: node scripts/seed-firestore.mjs jhongprojetos@gmail.com MyPassword\n');
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
    console.log('\n🔐 Authenticating...');

    await signInWithEmailAndPassword(auth, email, password);
    console.log(`✅ Logged in as: ${email}\n`);
    console.log('🌱 Starting Firestore seed...\n');

    // 1. Create main store document
    const storeRef = doc(db, 'stores', DEFAULT_STORE_ID);
    const storeSnap = await getDoc(storeRef);

    if (!storeSnap.exists()) {
        await setDoc(storeRef, {
            name: 'Lojinha das Graças',
            slug: 'lojinhas-das-gracas',
            status: 'active',
            created_at: new Date().toISOString()
        });
        console.log(`✅ Store created: stores/${DEFAULT_STORE_ID}`);
    } else {
        console.log(`ℹ️  Store already exists: stores/${DEFAULT_STORE_ID}`);
        console.log(`   Data: ${JSON.stringify(storeSnap.data())}`);
    }

    // 2. Create/update store settings
    const settingsRef = doc(db, 'settings', DEFAULT_STORE_ID);
    const settingsSnap = await getDoc(settingsRef);

    if (!settingsSnap.exists()) {
        await setDoc(settingsRef, {
            store_id: DEFAULT_STORE_ID,
            store_name: 'Lojinha das Graças',
            whatsapp_number: '5598984095956',
            primary_color: '#D4AF37',
            pix_key: '5598984095956',
            infinitepay_handle: 'lojinhadasgracas',
            instagram_url: 'https://instagram.com/lojinhadasgracas',
            hero_title: 'PAZ E DEVOÇÃO',
            hero_subtitle: 'Artigos religiosos selecionados com amor para fortalecer sua fé.',
            hero_button_text: 'VER OFERTAS',
            hero_image_url: 'https://images.unsplash.com/photo-1543783207-c0831a0b367c?auto=format&fit=crop&q=80&w=2000',
            hero_banners: [],
            about_text: 'Levando a paz de Cristo até você.',
            privacy_policy: 'Seus dados estão protegidos conosco.',
            monthly_revenue_goal: 5000,
            created_at: new Date().toISOString()
        });
        console.log(`✅ Settings created: settings/${DEFAULT_STORE_ID}`);
    } else {
        console.log(`ℹ️  Settings already exists: settings/${DEFAULT_STORE_ID}`);
    }

    // 3. Update user to have store_id (if user doc has no store_id)
    const { currentUser } = auth;
    if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (!userData.store_id) {
                await setDoc(userRef, { store_id: DEFAULT_STORE_ID }, { merge: true });
                console.log(`✅ User store_id set: users/${currentUser.uid} → ${DEFAULT_STORE_ID}`);
            } else {
                console.log(`ℹ️  User already has store_id: ${userData.store_id}`);
            }
        }
    }

    console.log('\n🎉 Seed completed!\n');
    console.log(`📌 DEFAULT_STORE_ID: ${DEFAULT_STORE_ID}`);
    console.log('   All orders and products should now sync correctly.\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('\n❌ Seed failed:', err.message || err);
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        console.error('   → Wrong email or password. Please check your credentials.\n');
    }
    process.exit(1);
});
