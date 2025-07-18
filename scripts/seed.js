

const admin = require("firebase-admin");
const { faker } = require("@faker-js/faker");
const serviceAccount = require("../serviceAccountKey.json");
const { execSync } = require('child_process');


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}


const db = admin.firestore();

// --- CONFIGURATION ---
// ===============================================================================================
// IMPORTANT: RUN `npm run create-users` FIRST, THEN PASTE THE OUTPUT ARRAY HERE.
// ===============================================================================================
const USER_CREDENTIALS = [
  { uid: "NakdvPiGUzXKMfaIs9pOJqcDcLE3", email: "admin@zizo.finverse", role: "admin", name: "Admin Finversia" },
  { uid: "SElPq7PboMOF1uhyHR2QX7OjSsz2", email: "user1@zizo.finverse", role: "user", name: "Alex Cybersmith" },
  { uid: "gaV1aL1LpQYMZx4ZgJiGcek2sbk1", email: "user2@zizo.finverse", role: "user", name: "Jasmine Tek" },
  { uid: "WyuK3Ot4l4Xc33uoom2T3Y8aoM03", email: "user3@zizo.finverse", role: "user", name: "Neo Digitalis" },
  { uid: "bi8nu5NdH9Zk4ehFwZPcbLhCncV2", email: "user4@zizo.finverse", role: "user", name: "Eva Matrix" },
  { uid: "kp0Hh1J4okcdAEEBSORU7CxZ07i2", email: "user5@zizo.finverse", role: "user", name: "Kenji Byte" },
  { uid: "FUu5DHdkZzYQtvqCEoWmz3ybjq42", email: "user6@zizo.finverse", role: "user", name: "Sonia Grid" },
];
// ===============================================================================================
// --- END CONFIGURATION ---


const deleteCollection = async (collectionPath) => {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.limit(500).get();

    if (snapshot.size === 0) {
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🗑️  Cleared collection: ${collectionPath}`);
    // Recurse if there are more documents to delete
    if (snapshot.size >= 500) {
        await deleteCollection(collectionPath);
    }
}

const seedUserDocument = async (user) => {
    const docRef = db.collection("users").doc(user.uid);
    await docRef.set({
        email: user.email,
        name: user.name,
        createdAt: admin.firestore.Timestamp.fromDate(faker.date.past({ years: 3 })),
        lastLogin: admin.firestore.Timestamp.now(),
        profileImage: faker.image.avatar(),
    });
    console.log(`👤 User document created/updated for ${user.email}`);
};

const runScript = (scriptName) => {
    try {
        console.log(`\n--- Running ${scriptName} ---`);
        execSync(`npm run ${scriptName}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`\n❌ Error running ${scriptName}:`, error);
        process.exit(1);
    }
}

const seedAll = async () => {
  console.log("--- Starting Zizo_FinVerse Database Seeder ---");

  const usersToSeed = USER_CREDENTIALS.filter(u => !u.uid.startsWith("placeholder_"));

  if (usersToSeed.length === 0) {
      console.error("\n🛑 ERROR: Placeholder UIDs found. Please run 'npm run create-users' and paste the output array into this script before running seed.");
      return;
  }
  
  // Clear old top-level collections if they exist to prevent orphaned data
  await deleteCollection('cryptocore');
  await deleteCollection('vault');
  await deleteCollection('econosim_simulations');
  await deleteCollection('econosim_scenarios');

  for (const user of usersToSeed) {
    console.log(`\n--- Seeding user document for ${user.email} (UID: ${user.uid}) ---`);
    await seedUserDocument(user);
  }

  // Run individual seeders sequentially to avoid race conditions and improve logging.
  runScript('seed:neurobank');
  runScript('seed:paywave');
  runScript('seed:cryptocore');
  runScript('seed:investhub');
  runScript('seed:loansync');
  runScript('seed:taxgrid');
  runScript('seed:vault');
  runScript('seed:econosim');
  
  console.log(`\n✅ All data seeded for ${usersToSeed.length} user(s). FinVerse is ready.`);
};

seedAll().catch(err => {
    console.error("Seeding failed:", err)
});
