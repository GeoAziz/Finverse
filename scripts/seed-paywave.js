
const admin = require("firebase-admin");
const { faker } = require("@faker-js/faker");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

// --- CONFIGURATION ---
const USER_CREDENTIALS = [
  { uid: "NakdvPiGUzXKMfaIs9pOJqcDcLE3", email: "admin@zizo.finverse", role: "admin", name: "Admin Finversia" },
  { uid: "SElPq7PboMOF1uhyHR2QX7OjSsz2", email: "user1@zizo.finverse", role: "user", name: "Alex Cybersmith" },
  { uid: "gaV1aL1LpQYMZx4ZgJiGcek2sbk1", email: "user2@zizo.finverse", role: "user", name: "Jasmine Tek" },
  { uid: "WyuK3Ot4l4Xc33uoom2T3Y8aoM03", email: "user3@zizo.finverse", role: "user", name: "Neo Digitalis" },
  { uid: "bi8nu5NdH9Zk4ehFwZPcbLhCncV2", email: "user4@zizo.finverse", role: "user", name: "Eva Matrix" },
  { uid: "kp0Hh1J4okcdAEEBSORU7CxZ07i2", email: "user5@zizo.finverse", role: "user", name: "Kenji Byte" },
  { uid: "FUu5DHdkZzYQtvqCEoWmz3ybjq42", email: "user6@zizo.finverse", role: "user", name: "Sonia Grid" },
];
// --- END CONFIGURATION ---

const deleteCollection = async (collectionRef, batchSize = 50) => {
    const query = collectionRef.limit(batchSize);
    let snapshot = await query.get();
    
    while (snapshot.size > 0) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            // Important: Recursively delete subcollections if they exist
            const subcollections = ['transactions', 'alerts'];
            subcollections.forEach(sub => {
                deleteCollection(doc.ref.collection(sub), batchSize);
            });
            batch.delete(doc.ref);
        });
        await batch.commit();
        snapshot = await query.get();
    }
}

const clearPayWaveForUser = async (uid) => {
    const payWaveRef = db.collection('users').doc(uid).collection('paywave');
    await deleteCollection(payWaveRef);
    console.log(`🧹 Cleared existing PayWave data for user ${uid}`);
};

const seedPayWaveForUser = async (user, allUsers) => {
    const uid = user.uid;
    const batch = db.batch();
    const payWaveBaseRef = db.collection('users').doc(uid).collection('paywave');

    // 1. Seed Wallet document
    const walletRef = payWaveBaseRef.doc('wallet');
    batch.set(walletRef, {
        balance: faker.number.float({ min: 1000, max: 25000, multipleOf: 0.01 }),
        currency: "KES",
        lastUpdated: admin.firestore.Timestamp.now(),
        isFrozen: false,
    });

    // 2. Seed Transactions subcollection
    const transactionsRef = payWaveBaseRef.doc('wallet').collection('transactions');
    for (let i = 0; i < 20; i++) {
        const docRef = transactionsRef.doc();
        const otherUser = faker.helpers.arrayElement(allUsers.filter(u => u.uid !== uid && u.role === 'user'));
        const isSend = faker.datatype.boolean();

        batch.set(docRef, {
            type: isSend ? "send" : "receive",
            amount: faker.number.float({ min: 50, max: 5000, multipleOf: 0.01 }),
            to: isSend ? otherUser.uid : uid,
            from: isSend ? uid : otherUser.uid,
            method: faker.helpers.arrayElement(["MobiCash", "Mpesa", "Card"]),
            status: faker.helpers.arrayElement(["success", "pending"]),
            timestamp: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 90 })),
            note: faker.lorem.sentence(),
        });
    }
    
    // 3. Seed Alerts subcollection
    const alertsRef = payWaveBaseRef.doc('wallet').collection('alerts');
    const alertDocRef = alertsRef.doc();
    batch.set(alertDocRef, {
        type: 'HighTransfer',
        description: 'A transfer of KES 15,000 to a new recipient was flagged.',
        timestamp: admin.firestore.Timestamp.now(),
    });


    await batch.commit();
    console.log(`🌊 PayWave: Nested wallet, transactions, and alerts seeded for user ${uid}`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_PayWave Standalone Seeder ---");
    
    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    // 1. Clear existing data for all users first.
    for (const user of usersToSeed) {
        await clearPayWaveForUser(user.uid);
    }
    console.log("--- ✅ PayWave data cleared for all users. ---");

    // 2. Seed fresh data for each user.
    for (const user of usersToSeed) {
        await seedPayWaveForUser(user, usersToSeed);
    }
    
    console.log(`\n🎉 PayWave seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("PayWave seeding failed:", err);
});
