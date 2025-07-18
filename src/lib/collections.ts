
import { collection, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- PRIMARY COLLECTIONS ---
export const usersCollection = collection(db, 'users');
export const rolesCollection = collection(db, 'roles');
export const configCollection = collection(db, 'config');
export const scenariosCollection = collection(db, "econosim_scenarios"); // Global
export const simulationsCollection = collection(db, "econosim_simulations"); // Global

// --- DOCUMENT HELPERS ---
export const userDoc = (uid: string) => doc(db, `users/${uid}`);
export const roleDoc = (uid: string) => doc(db, `roles/${uid}`);
export const moduleConfigDoc = () => doc(db, "config/modules");
export const scenarioDoc = (scenarioId: string) => doc(db, `econosim_scenarios/${scenarioId}`);
export const simulationDoc = (simId: string) => doc(db, `econosim_simulations/${simId}`);


// --- USER-NESTED SUBCOLLECTIONS ---

// NeuroBank
export const neurobankAccountDoc = (uid: string) => doc(db, `users/${uid}/neurobank/account`);
export const neurobankTransactionsCollection = (uid: string) => collection(db, `users/${uid}/neurobank/account/transactions`);
export const neurobankBudgetsCollection = (uid: string) => collection(db, `users/${uid}/neurobank/account/budgets`);
export const neurobankAnalyticsDoc = (uid: string) => doc(db, `users/${uid}/neurobank/analytics`);

// PayWave
export const paywaveWalletDoc = (uid: string) => doc(db, `users/${uid}/paywave/wallet`);
export const paywaveTransactionsCollection = (uid: string) => collection(db, `users/${uid}/paywave/wallet/transactions`);
export const paywaveAlertsCollection = (uid: string) => collection(db, `users/${uid}/paywave/wallet/alerts`);

// CryptoCore
export const cryptocoreCollection = (uid: string) => collection(db, `users/${uid}/cryptocore`);
export const cryptocoreWalletDoc = (uid: string, walletId: string) => doc(db, `users/${uid}/cryptocore/${walletId}`);
export const cryptocoreTokensCollection = (uid: string, walletId: string) => collection(db, `users/${uid}/cryptocore/${walletId}/tokens`);
export const cryptocoreNftsCollection = (uid: string, walletId: string) => collection(db, `users/${uid}/cryptocore/${walletId}/nfts`);
export const cryptocoreInsightsDoc = (uid: string, walletId: string) => doc(db, `users/${uid}/cryptocore/${walletId}/insights/summary`);

// LoanSync
export const loanSyncBaseDoc = (uid: string) => doc(db, `users/${uid}/loansync/data`);
export const loanSyncActiveLoanDoc = (uid:string) => doc(loanSyncBaseDoc(uid), 'active/loan');
export const loanSyncHistoryCollection = (uid: string) => collection(loanSyncBaseDoc(uid), 'history');
export const loanSyncRepaymentsCollection = (uid: string) => collection(loanSyncBaseDoc(uid), 'repayments');
export const loanSyncInsightsDoc = (uid: string) => doc(loanSyncBaseDoc(uid), 'insights/summary');

// InvestHub
export const investhubPortfolioDoc = (uid: string) => doc(db, `users/${uid}/investhub/portfolio`);
export const investhubAssetsCollection = (uid: string) => collection(db, `users/${uid}/investhub/assets/items`);
export const investhubHistoryCollection = (uid: string) => collection(db, `users/${uid}/investhub/history/items`);
export const investhubInsightsDoc = (uid: string) => doc(db, `users/${uid}/investhub/insights`);

// Vault
export const vaultCollection = (uid: string) => collection(db, `users/${uid}/vault`);

// IDBank (Simple collection for user identity data)
export const idbankCollection = (uid: string) => collection(db, `users/${uid}/idbank`);

// TaxGrid
export const taxGridSummaryDoc = (uid: string) => doc(db, `users/${uid}/taxgrid/summary`);
export const taxGridAiInsightsDoc = (uid: string) => doc(db, `users/${uid}/taxgrid/aiInsights`);
export const taxGridIncomeSourcesCollection = (uid: string) => collection(db, `users/${uid}/taxgrid/data/incomeSources`);
export const taxGridDeductionsCollection = (uid: string) => collection(db, `users/${uid}/taxgrid/data/deductions`);
export const taxGridFilingsCollection = (uid: string) => collection(db, `users/${uid}/taxgrid/data/filings`);
