
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
            const subcollections = ['incomeSources', 'deductions', 'filings']; // Add all sub-collections here
            subcollections.forEach(sub => {
                deleteCollection(doc.ref.collection(sub), batchSize);
            });
            batch.delete(doc.ref);
        });
        await batch.commit();
        snapshot = await query.get();
    }
}

const clearTaxGridForUser = async (uid) => {
    const taxGridRef = db.collection('users').doc(uid).collection('taxgrid');
    await deleteCollection(taxGridRef);
    console.log(`🧹 Cleared existing TaxGrid data for user ${uid}`);
};

const seedTaxGridForUser = async (uid) => {
    const batch = db.batch();
    const taxGridBaseRef = db.collection('users').doc(uid).collection('taxgrid');

    let totalIncome = 0;
    let totalExpenses = 0;

    // 1. Seed Income Sources
    const incomeSourcesRef = taxGridBaseRef.doc('data').collection('incomeSources');
    const incomeSources = [
        { source: "Salary", amount: faker.number.int({ min: 50000, max: 80000 }), syncedFrom: "NeuroBank" },
        { source: "InvestHub Dividends", amount: faker.number.int({ min: 1000, max: 5000 }), syncedFrom: "InvestHub" },
        { source: "Crypto Payout", amount: faker.number.int({ min: 500, max: 3000 }), syncedFrom: "CryptoCore" },
    ];
    for (const income of incomeSources) {
        const incomeDocRef = incomeSourcesRef.doc();
        batch.set(incomeDocRef, { ...income, dateReceived: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 180 })) });
        totalIncome += income.amount;
    }

    // 2. Seed Deductions
    const deductionsRef = taxGridBaseRef.doc('data').collection('deductions');
    const deductionTypes = [ "Insurance", "Education", "Donation", "Retirement Fund" ];
    for (const type of deductionTypes) {
        const deductionDocRef = deductionsRef.doc();
        const amount = faker.number.int({ min: 1000, max: 5000 });
        batch.set(deductionDocRef, {
            type,
            amount,
            date: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 180 }))
        });
        totalExpenses += amount;
    }

    // 3. Seed Filings (Historical)
    const filingsRef = taxGridBaseRef.doc('data').collection('filings');
    for (let i = 2; i >= 1; i--) {
        const filingDocRef = filingsRef.doc();
        const year = new Date().getFullYear() - i;
        batch.set(filingDocRef, {
            period: `${year}`,
            filedOn: admin.firestore.Timestamp.fromDate(new Date(`${year}-04-10`)),
            status: "Filed",
            totalTax: faker.number.int({ min: 15000, max: 25000 }),
            summarySnapshot: {
                totalIncome: faker.number.int({ min: 80000, max: 120000 }),
                netTaxable: faker.number.int({ min: 60000, max: 100000 }),
            }
        });
    }

    // 4. Seed AI Insights
    const aiInsightsRef = taxGridBaseRef.doc('aiInsights');
    batch.set(aiInsightsRef, {
        comment: "Your income is on an upward trend. Consider consulting with an AI advisor about tax-advantaged investment accounts to optimize your strategy for next year.",
        savingsTips: "Maximizing retirement fund contributions can significantly lower your taxable income.",
        riskFlag: false,
        lastAnalysis: admin.firestore.Timestamp.now(),
    });

    // 5. Seed Summary Document
    const summaryRef = taxGridBaseRef.doc('summary');
    const netTaxable = totalIncome - totalExpenses;
    const taxBracket = netTaxable > 75000 ? "High" : netTaxable > 40000 ? "Medium" : "Low";
    const estimatedTax = netTaxable * (taxBracket === "High" ? 0.25 : taxBracket === "Medium" ? 0.18 : 0.12);
    
    batch.set(summaryRef, {
        totalIncome,
        totalExpenses,
        netTaxable,
        taxBracket,
        estimatedTax,
        status: "Pending",
        lastUpdated: admin.firestore.Timestamp.now(),
    });

    await batch.commit();
    console.log(`🧾 TaxGrid: Nested tax data seeded for user ${uid}`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_TaxGrid Standalone Seeder ---");
    
    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    // 1. Clear existing data for all users first.
    for (const user of usersToSeed) {
        await clearTaxGridForUser(user.uid);
    }
    console.log("--- ✅ TaxGrid data cleared for all users. ---");

    // 2. Seed fresh data for each user.
    for (const user of usersToSeed) {
        await seedTaxGridForUser(user.uid);
    }
    
    console.log(`\n🎉 TaxGrid seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("TaxGrid seeding failed:", err);
});

    