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

const clearCollection = async (collectionPath) => {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.size === 0) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️  Cleared collection: ${collectionPath}`);
}

const seedCryptoCoreForUser = async (uid) => {
    // FIX: Store wallet in user subcollection for UI compatibility
    const walletRef = db.collection("users").doc(uid).collection("cryptocore").doc();

    const batch = db.batch();

    // Set the main wallet document FIRST
    batch.set(walletRef, {
        uid: uid,
        walletName: `${faker.word.adjective()} Digital Wallet`,
        totalValue: 0, // Start at 0, will be updated
        lastUpdated: admin.firestore.Timestamp.now(),
        defaultCurrency: "USD",
    });
    
    // Seed Tokens
    const tokens = [
        { name: 'Bitcoin', symbol: 'BTC', price: 60123.45 },
        { name: 'Ethereum', symbol: 'ETH', price: 3000.60 },
        { name: 'Solana', symbol: 'SOL', price: 170.00 },
        { name: 'Cyber-Token', symbol: 'CYT', price: 0.125 },
    ];

    let totalValue = 0;
    for (const token of tokens) {
        const tokenRef = walletRef.collection('tokens').doc(token.symbol);
        const balance = faker.number.float({ min: 0.01, max: token.symbol === 'BTC' ? 2 : 20, multipleOf: 0.00000001 });
        const value = balance * token.price;
        totalValue += value;

        batch.set(tokenRef, {
            name: token.name,
            symbol: token.symbol,
            balance: balance,
            valueUSD: value,
            pricePerToken: token.price,
        });
    }

    // Seed NFTs
    const nfts = [
        { name: 'CryptoPunk #420', imageURL: 'https://placehold.co/200x200.png', hint: 'pixelated avatar', chain: "Ethereum", value: 3400 },
        { name: 'Bored Ape #1337', imageURL: 'https://placehold.co/200x200.png', hint: 'cartoon ape', chain: "Ethereum", value: 5600 },
        { name: 'Mecha-Kaiju #001', imageURL: 'https://placehold.co/200x200.png', hint: 'robot monster', chain: "Solana", value: 1200 },
    ];
    for (const nft of nfts) {
        const nftRef = walletRef.collection('nfts').doc();
        batch.set(nftRef, {
            name: nft.name,
            imageURL: nft.imageURL,
            chain: nft.chain,
            estValueUSD: nft.value,
        });
        totalValue += nft.value;
    }

    // Seed History
    for (let i = 0; i < 15; i++) {
        const historyRef = walletRef.collection('history').doc();
        const randomToken = faker.helpers.arrayElement(tokens);
        batch.set(historyRef, {
            type: faker.helpers.arrayElement(["Buy", "Sell", "Receive", "Send"]),
            token: randomToken.symbol,
            amount: faker.number.float({ min: 0.001, max: 0.5, multipleOf: 0.000001 }),
            price: faker.number.float({ min: 50, max: 2000, multipleOf: 0.01 }),
            valueUSD: faker.number.float({ min: 50, max: 2000 }),
            timestamp: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 90 })),
        });
    }

    // Seed Insights
    const insightsRef = walletRef.collection('insights').doc('summary');
    batch.set(insightsRef, {
        volatility: faker.helpers.arrayElement(["Low", "Moderate", "High"]),
        growth7d: `${faker.number.float({ min: -5, max: 15, multipleOf: 0.01 })}%`,
        riskLevel: faker.helpers.arrayElement(["Low", "Medium", "High"]),
        aiComment: "Diversification into stablecoins might be prudent given current market conditions.",
    });

    // Update the wallet with the final total value
    batch.update(walletRef, { totalValue });
    
    await batch.commit();
    console.log(`🪙 CryptoCore: Nested wallet for user ${uid} seeded with total value $${totalValue.toFixed(2)}.`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_CryptoCore Standalone Seeder ---");

    // 1. Clear the entire 'cryptocore' collection to ensure a fresh start.
    // This is more robust than trying to find and delete wallets for each user.
    await clearCollection('cryptocore');
    console.log("--- ✅ CryptoCore collection cleared. ---");
    
    // 2. Filter for non-admin users
    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    // 3. Seed data for each user.
    for (const user of usersToSeed) {
        await seedCryptoCoreForUser(user.uid);
    }
    
    console.log(`\n🎉 CryptoCore seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("CryptoCore seeding failed:", err)
});
