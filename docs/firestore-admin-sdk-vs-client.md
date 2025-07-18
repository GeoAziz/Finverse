# Firestore Admin SDK vs Client SDK in Next.js Server Actions

## Problem
When using Firestore in Next.js server actions, you may encounter confusing `permission-denied` errors—even if your Firestore security rules seem correct and your user is authenticated.

### Example Error
```
FirebaseError: Missing or insufficient permissions.
```

## Root Cause
- **Client SDK** (firebase/firestore) relies on the user's authentication context (browser cookies/tokens).
- **Server Actions** run on the server and do **not** have access to the user's client-side auth context.
- As a result, Firestore security rules see these requests as unauthenticated, and deny access—even if the user is logged in on the client.

## Solution
- **Use the Firebase Admin SDK** (`firebase-admin`) for all Firestore access in server actions or API routes.
- The Admin SDK bypasses security rules and has full access, so you must enforce any necessary checks in your server code.

## How We Fixed It
- Created `src/lib/firebase-admin.ts` to initialize the Admin SDK.
- Updated all server actions (e.g., `startMacroSimulation`) to use the Admin SDK Firestore instance instead of the client SDK.
- Now, server actions can read/write Firestore without permission errors.

## Key Takeaway
> **Never use the Firebase Client SDK in Next.js server actions. Always use the Admin SDK for server-side Firestore access.**

---

### References
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Common Firestore Permission Errors](https://firebase.google.com/docs/rules/faq)
