const admin = require("firebase-admin");
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

const seedEconoSim = async (users) => {
    // 1. Clear previous data
    await clearCollection('econosim_scenarios');
    await clearCollection('econosim_simulations');
    console.log("--- ✅ EconoSim collections cleared. ---");
    
    // 2. Seed Scenarios
    const scenariosCol = db.collection('econosim_scenarios');
    const scenarioId = 'inflation_crisis_2025';

    await scenariosCol.doc(scenarioId).set({
        id: scenarioId,
        title: 'Inflation Crisis 2025',
        description: 'A global supply chain disruption has caused inflation to spike to over 12%. Your goal is to use monetary and fiscal policy to tame inflation without causing a deep recession. Adjust interest and tax rates to stabilize the economy.',
        policies: ["InterestRates", "TaxRates"],
        initialValues: {
            gdp: 890.0,
            inflation: 12.2,
            jobs: 93.0,
            interestRate: 5.0,
            taxRate: 20.0,
        },
        createdBy: "admin",
        createdAt: admin.firestore.Timestamp.now(),
    });
    console.log(`📈 EconoSim: '${scenarioId}' scenario seeded.`);

    // 3. Create initial simulation state for each user
    const simulationsCol = db.collection('econosim_simulations');
    const batch = db.batch();
    const usersToSeed = users.filter(u => u.role === 'user');

    for (const user of usersToSeed) {
        const docRef = simulationsCol.doc(user.uid); // Use UID as doc ID
        batch.set(docRef, {
            id: user.uid,
            uid: user.uid,
            scenarioId,
            status: 'not-started',
            outputs: { gdp: 0, inflation: 0, jobs: 0 },
            createdAt: admin.firestore.Timestamp.now(),
        });
    }
    await batch.commit();
    console.log(`🎮 EconoSim: Initial simulation states created for ${usersToSeed.length} users.`);
}


const seedAll = async () => {
  console.log("--- ⚡️ Starting Zizo_EconoSim Standalone Seeder ---");

  const usersToSeed = USER_CREDENTIALS.filter(u => !u.uid.startsWith("placeholder_"));

  if (usersToSeed.length === 0) {
      console.error("\n🛑 ERROR: Placeholder UIDs found in USER_CREDENTIALS. Please run `npm run create-users` and paste the output array into this script before running seed.");
      return;
  }
  
  await seedEconoSim(usersToSeed);
  
  console.log(`\n🎉 EconoSim seeding complete.`);
};

seedAll().catch(err => {
    console.error("EconoSim seeding failed:", err)
});
