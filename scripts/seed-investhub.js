
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
            batch.delete(doc.ref);
        });
        await batch.commit();
        snapshot = await query.get();
    }
}

const clearInvestHubForUser = async (uid) => {
    const userRef = db.collection('users').doc(uid);
    const investHubRef = userRef.collection('investhub');
    
    // Get top-level docs like 'portfolio' and 'insights'
    const topLevelDocs = await investHubRef.listDocuments();
    const batch = db.batch();
    topLevelDocs.forEach(doc => batch.delete(doc));
    
    // Clear subcollections
    await deleteCollection(investHubRef.doc('assets').collection('items'));
    await deleteCollection(investHubRef.doc('history').collection('items'));
    
    await batch.commit();
    console.log(`🧹 Cleared existing InvestHub data for user ${uid}`);
};

const seedInvestHubForUser = async (uid) => {
    const batch = db.batch();
    const investHubRef = db.collection('users').doc(uid).collection('investhub');

    // Asset definitions
    const assetDefs = [
        { symbol: "CDS", name: "Cyberdyne Systems", price: 150.75 },
        { symbol: "STI", name: "Stark Industries", price: 320.50 },
        { symbol: "WNE", name: "Wayne Enterprises", price: 210.20 },
        { symbol: "SP500", name: "S&P 500 ETF", price: 450.00 },
        { symbol: "GTECH", name: "Global Tech Fund", price: 180.90 }
    ];

    let totalInvested = 0;
    let totalValue = 0;

    // 1. Seed Assets subcollection
    const assetsRef = investHubRef.doc('assets').collection('items');
    for (const assetDef of assetDefs) {
        const assetDocRef = assetsRef.doc(); // Use auto-ID for assets
        const quantity = faker.number.int({ min: 5, max: 50 });
        const priceAtBuy = faker.number.float({ min: assetDef.price * 0.8, max: assetDef.price * 1.1, multipleOf: 0.01 });
        const currentValue = assetDef.price * quantity;

        totalInvested += priceAtBuy * quantity;
        totalValue += currentValue;
        
        batch.set(assetDocRef, {
            symbol: assetDef.symbol,
            name: assetDef.name,
            quantity: quantity,
            priceAtBuy: priceAtBuy,
            currentPrice: assetDef.price,
            totalValue: currentValue
        });
    }

    // 2. Seed History subcollection
    const historyRef = investHubRef.doc('history').collection('items');
    for (let i = 0; i < 15; i++) {
        const historyDocRef = historyRef.doc();
        const randomAsset = faker.helpers.arrayElement(assetDefs);
        const quantity = faker.number.int({ min: 1, max: 10 });
        const total = randomAsset.price * quantity;

        batch.set(historyDocRef, {
            type: faker.helpers.arrayElement(["buy", "sell"]),
            symbol: randomAsset.symbol,
            quantity,
            price: randomAsset.price,
            total,
            timestamp: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 2 }))
        });
    }

    // 3. Seed Insights document
    const insightsDocRef = investHubRef.doc('insights');
    batch.set(insightsDocRef, {
        trendingAssets: faker.helpers.arrayElements(assetDefs.map(a => a.symbol), 3),
        performance24h: `${faker.number.float({ min: -5, max: 5, multipleOf: 0.01 })}%`,
        suggestion: "Diversify your portfolio with some low-risk ETFs.",
        AIComment: "Your portfolio is heavily weighted towards tech. Consider balancing with other sectors to mitigate risk."
    });

    // 4. Seed main Portfolio document
    const growth = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    const portfolioDocRef = investHubRef.doc('portfolio');
    batch.set(portfolioDocRef, {
        uid,
        totalValue: parseFloat(totalValue.toFixed(2)),
        investedAmount: parseFloat(totalInvested.toFixed(2)),
        growth: parseFloat(growth.toFixed(2)),
        riskLevel: faker.helpers.arrayElement(["Low", "Medium", "High"]),
        strategy: "AI-Guided",
        lastUpdated: admin.firestore.Timestamp.now()
    });

    await batch.commit();
    console.log(`📈 InvestHub: Nested portfolio for user ${uid} seeded with total value $${totalValue.toFixed(2)}.`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_InvestHub Standalone Seeder ---");
    
    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    // 1. Clear existing data for all users first.
    for (const user of usersToSeed) {
        await clearInvestHubForUser(user.uid);
    }
    console.log("--- ✅ InvestHub data cleared for all users. ---");

    // 2. Seed fresh data for each user.
    for (const user of usersToSeed) {
        await seedInvestHubForUser(user.uid);
    }
    
    console.log(`\n🎉 InvestHub seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("InvestHub seeding failed:", err);
});
