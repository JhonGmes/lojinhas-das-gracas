import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// To run this: 
// 1. Download your service account key from Firebase Console
// 2. Save it as service-account.json in the project root
// 3. Run: node scripts/backfill-data.mjs

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function backfill() {
    console.log('🚀 Starting backfill...');

    // 1. Backfill Products (SKU/Code)
    const productsSnap = await db.collection('products').get();
    let productCount = 0;

    for (const doc of productsSnap.docs) {
        const data = doc.data();
        if (!data.code) {
            const generatedCode = `LJG-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await doc.ref.update({ code: generatedCode });
            productCount++;
        }
    }
    console.log(`✅ Updated ${productCount} products with missing SKU.`);

    // 2. Backfill Users (Address fields)
    const usersSnap = await db.collection('users').get();
    let userCount = 0;

    for (const doc of usersSnap.docs) {
        const data = doc.data();
        const update = {};

        if (!data.customer_address_street) update.customer_address_street = '';
        if (!data.customer_address_number) update.customer_address_number = '';
        if (!data.customer_address_city) update.customer_address_city = '';
        if (!data.customer_address_state) update.customer_address_state = '';
        if (!data.customer_address_zipcode) update.customer_address_zipcode = '';

        if (Object.keys(update).length > 0) {
            await doc.ref.update(update);
            userCount++;
        }
    }
    console.log(`✅ Initialized address fields for ${userCount} users.`);
}

backfill().catch(console.error);
