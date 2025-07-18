
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

const clearCollectionForUser = async (uid, collectionName) => {
    const collectionRef = db.collection('users').doc(uid).collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.size === 0) return;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️  Cleared ${collectionName} for user ${uid}`);
}

const seedVaultForUser = async (user) => {
    const col = db.collection("users").doc(user.uid).collection("vault");
    const batch = db.batch();

    for (let i = 0; i < 5; i++) {
        const docRef = col.doc();
        batch.set(docRef, {
            // No need for uid inside the document anymore, path-based security is enough
            title: faker.system.commonFileName({ extension: faker.helpers.arrayElement(['pdf', 'docx', 'png']) }),
            category: faker.helpers.arrayElement(["Financial", "Legal", "Identity", "Personal"]),
            url: "https://placehold.co/100x100.png",
            createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 365 })),
            isBiometric: faker.datatype.boolean(),
            tags: faker.helpers.arrayElements(["confidential", faker.lorem.word()], faker.number.int({min: 1, max: 3})),
        });
    }
    
    await batch.commit();
    console.log(`🔐 SafeVault: 5 docs seeded for user ${user.uid}`);
};

const seedAll = async () => {
    console.log("--- ⚡️ Starting Zizo_SafeVault Standalone Seeder ---");

    const usersToSeed = USER_CREDENTIALS.filter(u => u.role === 'user');
    if (usersToSeed.length === 0) {
        console.error("No users with role 'user' found to seed.");
        return;
    }

    for (const user of usersToSeed) {
        await clearCollectionForUser(user.uid, 'vault');
        await seedVaultForUser(user);
    }
    
    console.log(`\n🎉 SafeVault seeding complete for ${usersToSeed.length} user(s).`);
};

seedAll().catch(err => {
    console.error("SafeVault seeding failed:", err)
});
