
# Zizo FinVerse Test Credentials

This file outlines the fully scripted process for setting up your Firebase users and database.

**Password for all users**: `password123`

## User Accounts to be Created:

1.  **Admin**: `admin@zizo.finverse`
2.  **User 1**: `user1@zizo.finverse`
3.  **User 2**: `user2@zizo.finverse`
4.  **User 3**: `user3@zizo.finverse`
5.  **User 4**: `user4@zizo.finverse`
6.  **User 5**: `user5@zizo.finverse`
7.  **User 6**: `user6@zizo.finverse`

## Automated Setup Instructions

Follow these steps exactly to get your environment up and running.

### Step 1: Create Users
Run the user creation script. This will create all the users listed above in Firebase Authentication and set their password to `password123`.

```bash
npm run create-users
```

### Step 2: Update Your Setup & Seeder Scripts
After the script in Step 1 finishes, it will print a block of code (an array called `USER_CREDENTIALS`) in your terminal.
-   **Copy** this entire block of code.
-   Open `scripts/setup.js` and paste the code, completely replacing the existing `USER_CREDENTIALS` array.
-   Open `scripts/seed.js` and do the same: paste the code, replacing the `USER_CREDENTIALS` array.

### Step 3: Set Up Roles and Configuration
Run the setup script. This will use the UIDs you just pasted to assign roles (`admin` or `user`) and create the global module configuration in Firestore.

```bash
npm run setup
```

### Step 4: Seed the Database
Run the seeder script. This will populate the Firestore database with a large amount of realistic test data for each user.

```bash
npm run seed
```

After completing these four steps, your application will be fully configured with authenticated users and a rich dataset. You can now log in using the credentials above.
