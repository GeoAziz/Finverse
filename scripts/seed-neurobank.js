
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
            const subcollections = ['transactions', 'budgets'];
            subcollections.forEach(sub => {
                deleteCollection(doc.ref.collection(sub), batchSize);
            });
            batch.delete(doc.ref);
        });
        await batch.commit();
        snapshot = await query.get();
    }
}


const clearNeuroBankForUser = async (uid) => {
    const neuroBankRef = db.collection('users').doc(uid).collection('neurobank');
    await deleteCollection(neuroBankRef);
    console.log(`🧹 Cleared existing NeuroBank data for user ${uid}`);
};

const seedNeuroBankForUser = async (uid) => {
    const batch = db.batch();
    const neuroBankBaseRef = db.collection('users').doc(uid).collection('neurobank');
    
    // 1. Seed Account document
    const accountRef = neuroBankBaseRef.doc('account');
    const balance = faker.number.float({ min: 5000, max: 150000, multipleOf: 0.01 });
    batch.set(accountRef, {
        balance: balance,
        currency: "KES",
        accountType: faker.helpers.arrayElement(["Savings", "Current"]),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    });

    // 2. Seed Transactions subcollection
    const transactionsRef = neuroBankBaseRef.doc('account').collection('transactions');
    let totalSpent = 0;
    const categories = ["Food", "Transport", "Bills", "Entertainment", "Shopping"];
    for (let i = 0; i < 30; i++) {
        const docRef = transactionsRef.doc();
        const isDebit = faker.datatype.boolean(0.8); // 80% chance of being a debit
        const amount = faker.number.float({ min: 100, max: 5000, multipleOf: 0.01 });
        
        if (isDebit) totalSpent += amount;
        
        batch.set(docRef, {
            type: isDebit ? "debit" : "credit",
            amount: amount,
            category: isDebit ? faker.helpers.arrayElement(categories) : "Income",
            description: faker.finance.transactionDescription(),
            paymentMethod: faker.helpers.arrayElement(["Card", "MobiCash", "Bank"]),
            timestamp: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 30 })),
            taggedByAI: true
        });
    }

    // 3. Seed Analytics document
    const analyticsRef = neuroBankBaseRef.doc('analytics');
    batch.set(analyticsRef, {
        totalSpent: totalSpent,
        topCategory: faker.helpers.arrayElement(categories),
        avgMonthlySpending: faker.number.float({ min: 20000, max: 80000 }),
        burnRate: faker.number.float({ min: 500, max: 3000 }),
        alert: "You’re spending too fast this month.",
        AIComment: "Your spending on entertainment has increased by 15% this week."
    });

    // 4. Seed Budgets subcollection
    const budgetsRef = neuroBankBaseRef.doc('account').collection('budgets');
    for (const category of categories.slice(0, 3)) { // Create budgets for first 3 categories
        const budgetDocRef = budgetsRef.doc();
        const limit = faker.helpers.arrayElement([5000, 10000, 15000, 20000]);
        batch.set(budgetDocRef, {
            category,
            limit: limit,
            spent: faker.number.float({ min: limit * 0.5, max: limit * 1.2 }),
            month: "July 2024" // Static for now
        });
    }

    await batch.commit();
    console.log(`🧠 NeuroBank: Nested data seeded for user ${uid}`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_NeuroBank Standalone Seeder ---");
    
    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    // Clear old top-level collection if it exists
    await deleteCollection(db.collection('neurobank'));
    console.log('--- ✅ Old top-level `neurobank` collection cleared. ---');

    // 1. Clear existing nested data for all users first.
    for (const user of usersToSeed) {
        await clearNeuroBankForUser(user.uid);
    }
    console.log("--- ✅ Nested NeuroBank data cleared for all users. ---");

    // 2. Seed fresh data for each user.
    for (const user of usersToSeed) {
        await seedNeuroBankForUser(user.uid);
    }
    
    console.log(`\n🎉 NeuroBank seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("NeuroBank seeding failed:", err);
});
