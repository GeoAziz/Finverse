
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
            const subcollections = ['active', 'history', 'repayments', 'insights'];
            subcollections.forEach(sub => {
                deleteCollection(doc.ref.collection(sub), batchSize);
            });
            batch.delete(doc.ref);
        });
        await batch.commit();
        snapshot = await query.get();
    }
}

const clearLoanSyncForUser = async (uid) => {
    const loanSyncRef = db.collection('users').doc(uid).collection('loansync');
    await deleteCollection(loanSyncRef);
    console.log(`🧹 Cleared existing LoanSync data for user ${uid}`);
};

const seedLoanSyncForUser = async (uid) => {
    const batch = db.batch();
    const loanSyncBaseRef = db.collection('users').doc(uid).collection('loansync').doc('data');

    // 1. Create one active loan
    const loanType = faker.helpers.arrayElement(["Business", "Emergency", "Education", "Auto"]);
    const loanAmount = faker.number.int({ min: 5000, max: 50000 });
    const term = faker.helpers.arrayElement([6, 12, 24]);
    const interestRate = faker.number.float({ min: 5, max: 15, multipleOf: 0.1 });
    const repaymentsMade = faker.number.int({ min: 1, max: term - 1 });
    const monthlyPayment = (loanAmount * (1 + interestRate / 100)) / term;
    const remainingBalance = loanAmount * (1 + interestRate / 100) - (monthlyPayment * repaymentsMade);
    
    // Path: users/{uid}/loansync/data/active/loan
    const activeLoanRef = loanSyncBaseRef.collection('active').doc('loan');
    batch.set(activeLoanRef, {
        loanId: faker.string.uuid(),
        amount: loanAmount,
        type: loanType,
        interestRate: interestRate,
        termMonths: term,
        status: "active",
        remainingBalance: remainingBalance,
        startDate: admin.firestore.Timestamp.fromDate(faker.date.past({ months: repaymentsMade })),
        dueDate: admin.firestore.Timestamp.fromDate(faker.date.future({ months: term - repaymentsMade })),
    });

    // 2. Seed some repayments for the active loan
    const repaymentsRef = loanSyncBaseRef.collection('repayments');
    for (let i = 0; i < repaymentsMade; i++) {
        const repaymentDocRef = repaymentsRef.doc();
        batch.set(repaymentDocRef, {
            amountPaid: monthlyPayment,
            paidOn: admin.firestore.Timestamp.fromDate(faker.date.past({ months: i + 1 })),
            remainingBalance: remainingBalance + (monthlyPayment * (repaymentsMade - i)),
            method: faker.helpers.arrayElement(["MobiCash", "Card", "Mpesa"]),
        });
    }

    // 3. Seed some historical loans
    const historyRef = loanSyncBaseRef.collection('history');
    for (let i = 0; i < 3; i++) {
        const historyDocRef = historyRef.doc();
        batch.set(historyDocRef, {
            amount: faker.number.int({ min: 1000, max: 20000 }),
            status: faker.helpers.arrayElement(["Completed", "Declined"]),
            feedback: "AI feedback text placeholder.",
            loanType: faker.helpers.arrayElement(["Business", "Emergency", "Education", "Auto"]),
            submittedAt: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 2 })),
            approvedAt: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 2 })),
        });
    }

    // 4. Seed the insights document
    // Path: users/{uid}/loansync/data/insights/summary
    const insightsRef = loanSyncBaseRef.collection('insights').doc('summary');
    batch.set(insightsRef, {
        creditScore: faker.number.int({ min: 650, max: 850 }),
        missedPayments: faker.number.int({ min: 0, max: 2 }),
        AIComment: "Great job paying early last month. Keep it up!",
        repaymentBehavior: "Punctual payer",
        recommendation: "You're eligible to refinance.",
    });

    await batch.commit();
    console.log(`💳 LoanSync: Nested loan data seeded for user ${uid}`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_LoanSync Standalone Seeder ---");
    
    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    // 1. Clear existing data for all users first.
    for (const user of usersToSeed) {
        await clearLoanSyncForUser(user.uid);
    }
    console.log("--- ✅ LoanSync data cleared for all users. ---");

    // 2. Seed fresh data for each user.
    for (const user of usersToSeed) {
        await seedLoanSyncForUser(user.uid);
    }
    
    console.log(`\n🎉 LoanSync seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("LoanSync seeding failed:", err);
});
