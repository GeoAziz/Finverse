
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// --- CONFIGURATION ---
const usersToCreate = [
  { email: "admin@zizo.finverse", role: "admin", displayName: "Admin Finversia" },
  { email: "user1@zizo.finverse", role: "user", displayName: "Alex Cybersmith" },
  { email: "user2@zizo.finverse", role: "user", displayName: "Jasmine Tek" },
  { email: "user3@zizo.finverse", role: "user", displayName: "Neo Digitalis" },
  { email: "user4@zizo.finverse", role: "user", displayName: "Eva Matrix" },
  { email: "user5@zizo.finverse", role: "user", displayName: "Kenji Byte" },
  { email: "user6@zizo.finverse", role: "user", displayName: "Sonia Grid" },
];
const CONSTANT_PASSWORD = "password123";
// --- END CONFIGURATION ---


/**
 * Creates users in Firebase Authentication and sets their password.
 */
const createAuthUsers = async () => {
  console.log("--- Starting Firebase User Creation & Setup ---");
  const createdUsers = [];

  for (const userData of usersToCreate) {
    try {
      let userRecord;
      try {
        // Check if user already exists
        userRecord = await admin.auth().getUserByEmail(userData.email);
        console.log(`- User ${userData.email} already exists. Updating password...`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // User does not exist, create them
          userRecord = await admin.auth().createUser({
            email: userData.email,
            emailVerified: true,
            displayName: userData.displayName,
            disabled: false,
          });
          console.log(`✅ Successfully created new user: ${userData.email} | UID: ${userRecord.uid}`);
        } else {
          // Other error during user check
          throw error;
        }
      }

      // Set password for the user (either new or existing)
      await admin.auth().updateUser(userRecord.uid, {
        password: CONSTANT_PASSWORD,
      });
      console.log(`🔑 Set password for ${userData.email}.`);
      
      createdUsers.push({
        email: userRecord.email,
        uid: userRecord.uid,
        role: userData.role,
        name: userData.displayName
      });

    } catch (error) {
      console.error(`❌ Error processing user ${userData.email}:`, error.message);
    }
  }

  console.log("\n--- User Creation Summary ---");
  if (createdUsers.length > 0) {
    console.log("✅ All users have been created/updated successfully.");
    console.log(`\n🔒 Constant password for all users is: ${CONSTANT_PASSWORD}`);
    console.log("\n📋 IMPORTANT: Copy the following array and paste it into 'scripts/setup.js' and 'scripts/seed.js' to replace the existing placeholder array.\n");
    
    // Generate the code block to be copied
    let output = "const USER_CREDENTIALS = [\n";
    createdUsers.forEach(user => {
      output += `  { uid: "${user.uid}", email: "${user.email}", role: "${user.role}", name: "${user.name}" },\n`;
    });
    output += "];";
    console.log(output);

  } else {
    console.log("No new users were created. An error may have occurred.");
  }

  console.log("\n🎉 User creation process finished.");
};

createAuthUsers().catch(err => {
    console.error("Fatal error during user creation script:", err);
});
