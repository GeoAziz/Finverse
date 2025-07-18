
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// --- CONFIGURATION ---
const defaultModules = {
  neurobank: true,
  mobicash: true,
  loansync: true,
  safevault: true,
  cryptocore: true,
  econosim: true,
  investhub: true,
  taxgrid: true,
  paywave: true,
  idbank: true,
};

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

async function setupRoles() {
  console.log("Setting up roles...");
  let setupCount = 0;
  
  const usersToSetup = USER_CREDENTIALS.filter(u => !u.uid.startsWith("placeholder_"));

  if (usersToSetup.length === 0) {
      console.error("\n🛑 ERROR: Placeholder UIDs found. Please run 'npm run create-users' and paste the output array into this script before running setup.");
      return;
  }

  for (const user of usersToSetup) {
    await db.collection("roles").doc(user.uid).set({
      role: user.role,
    });
    console.log(`✅ Set role for ${user.uid} (${user.email}) to ${user.role}`);
    setupCount++;
  }

  console.log(`\n✅ ${setupCount} roles were successfully set up.`);
}

async function setupModuleConfig() {
  console.log("\nSetting up global module configuration...");
  await db.collection("config").doc("modules").set(defaultModules);
  console.log("✅ Module config initialized in /config/modules.");
}

async function main() {
  console.log("--- Starting Zizo_FinVerse Firebase Setup ---");
  await setupRoles();
  await setupModuleConfig();
  console.log("\n🎉 Zizo_FinVerse Firebase setup complete!");
  console.log("\nNext step: Run 'npm run seed' to populate the database with test data.");
}

main().catch(console.error);
