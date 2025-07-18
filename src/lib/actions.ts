
'use server';

import { addDoc, doc, getDoc, runTransaction, serverTimestamp, updateDoc, writeBatch, collection } from "firebase/firestore";
import { db, storage } from "./firebase";
import { 
    simulationDoc,
    investhubPortfolioDoc, 
    investhubHistoryCollection, 
    paywaveTransactionsCollection,
    paywaveWalletDoc,
    vaultCollection, 
    scenarioDoc, 
    loanSyncHistoryCollection,
    loanSyncActiveLoanDoc
} from "./collections";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { runMacroSimulation as runMacroSimulationFlow, getMacroEconomicAdvice as getMacroEconomicAdviceFlow } from '@/ai/flows/econosim-flow';
import type { GetMacroAdviceInput, RunSimulationInput } from "@/lib/types/econosim";
import { simulateLoanApplication } from "@/ai/flows/loan-simulation-flow";
import type { LoanApplicationOutput, LoanApplicationInput } from "@/lib/types/loansync";
import { getFinancialInsights as getFinancialInsightsFlow } from "@/ai/flows/ai-financial-insights";
import type { FinancialInsightsInput, FinancialInsightsOutput } from "@/lib/types/financial-insights";


// A mock function to simulate adding a PayWave transaction
export async function addPayWaveTransaction(payload: {
    uid: string;
    type: 'send' | 'pay-bill' | 'top-up' | 'withdraw';
    amount: number;
    description: string;
    status: 'Complete' | 'Pending';
}) {
    const { uid, type, amount, ...transactionData } = payload;
    const walletRef = paywaveWalletDoc(uid);
    const transactionsRef = paywaveTransactionsCollection(uid);

    try {
        await runTransaction(db, async (transaction) => {
            const walletDoc = await transaction.get(walletRef);
            if (!walletDoc.exists()) {
                throw "Wallet does not exist!";
            }

            const currentBalance = walletDoc.data().balance;
            const isDebit = type === 'send' || type === 'pay-bill' || type === 'withdraw';

            if (isDebit && currentBalance < amount) {
                throw "Insufficient funds.";
            }

            const newBalance = isDebit ? currentBalance - amount : currentBalance + amount;

            // 1. Update wallet balance
            transaction.update(walletRef, { 
                balance: newBalance,
                lastUpdated: serverTimestamp()
             });

            // 2. Add new transaction document
            const newTransactionRef = doc(transactionsRef); // Create a new doc reference in the subcollection
            transaction.set(newTransactionRef, {
                type,
                amount,
                ...transactionData,
                timestamp: serverTimestamp(),
            });
        });

        console.log("PayWave transaction and wallet update successful.");
        return { success: true };
    } catch (error) {
        console.error("Error in PayWave transaction:", error);
        // Re-throw the error to be caught by the calling modal
        throw new Error(typeof error === 'string' ? error : "Failed to complete transaction.");
    }
}


export async function uploadToVault(payload: { 
    uid: string; 
    file: File;
    category: string;
    isBiometric: boolean;
    tags: string[];
}) {
    const { uid, file, category, isBiometric, tags } = payload;
    if (!uid || !file) {
        throw new Error("User ID and file are required.");
    }

    try {
        // 1. Upload the actual file to Firebase Storage
        const storageRef = ref(storage, `users/${uid}/vault/${Date.now()}-${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        
        // 2. Get the download URL for the uploaded file
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // 3. Create the document in Firestore with metadata and the URL
        await addDoc(vaultCollection(uid), {
            title: file.name,
            url: downloadURL,
            category: category,
            isBiometric: isBiometric,
            tags: tags,
            createdAt: serverTimestamp(),
        });
        
        return { success: true, message: "File uploaded and secured successfully." };

    } catch (error) {
        console.error("Error uploading to vault:", error);
        throw new Error("File upload failed.");
    }
}


export async function updateInvestment(payload: {
    uid: string;
    assetId: string;
    amount: number; // This is the USD value to buy/sell
    type: 'Buy' | 'Sell';
}) {
    const { uid, assetId, amount, type } = payload;

    if (!uid || !assetId || !amount || !type) {
        throw new Error("Missing required parameters for investment update.");
    }

    const portfolioRef = investhubPortfolioDoc(uid);
    const assetRef = doc(db, `users/${uid}/investhub/assets/items`, assetId);
    const historyColRef = investhubHistoryCollection(uid);

    try {
        await runTransaction(db, async (transaction) => {
            const [portfolioSnap, assetSnap] = await Promise.all([
                transaction.get(portfolioRef),
                transaction.get(assetRef)
            ]);

            if (!portfolioSnap.exists() || !assetSnap.exists()) {
                throw new Error("Portfolio or asset not found.");
            }

            const portfolioData = portfolioSnap.data();
            const assetData = assetSnap.data();

            const quantityChange = amount / assetData.currentPrice;
            let newQuantity, newTotalValue, newInvestedAmount;

            if (type === 'Buy') {
                newQuantity = assetData.quantity + quantityChange;
                newTotalValue = portfolioData.totalValue + amount;
                newInvestedAmount = portfolioData.investedAmount + amount;
            } else { // Sell
                if (amount > assetData.totalValue) {
                    throw new Error("Sell amount exceeds asset value.");
                }
                newQuantity = assetData.quantity - quantityChange;
                newTotalValue = portfolioData.totalValue - amount;
                // Selling reduces the invested amount proportionally to the quantity sold
                const proportionSold = quantityChange / assetData.quantity;
                const costBasisOfSoldPortion = assetData.priceAtBuy * assetData.quantity * proportionSold;
                newInvestedAmount = portfolioData.investedAmount - costBasisOfSoldPortion;
            }

            // Update asset
            transaction.update(assetRef, {
                quantity: newQuantity,
                totalValue: newQuantity * assetData.currentPrice
            });

            // Update portfolio summary
            const newGrowth = newTotalValue > 0 ? ((newTotalValue - newInvestedAmount) / newInvestedAmount) * 100 : 0;
            transaction.update(portfolioRef, {
                totalValue: newTotalValue,
                investedAmount: newInvestedAmount,
                growth: newGrowth,
                lastUpdated: serverTimestamp()
            });

            // Log history
            const newHistoryRef = doc(historyColRef);
            transaction.set(newHistoryRef, {
                type: type.toLowerCase(),
                symbol: assetData.symbol,
                quantity: quantityChange,
                price: assetData.currentPrice,
                total: amount,
                timestamp: serverTimestamp()
            });
        });

        console.log("InvestHub transaction successful.");
        return { success: true };
    } catch (error) {
        console.error("Error updating investment:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to update investment.");
    }
}


// ECONOSIM ACTIONS
export async function startMacroSimulation({ simulationId }: { simulationId: string }) {
    const simRef = simulationDoc(simulationId);
    const simSnap = await getDoc(simRef);

    if (!simSnap.exists()) throw new Error("Simulation not found.");

    const scenarioId = simSnap.data().scenarioId;
    if (!scenarioId) throw new Error("Scenario ID is missing from the simulation document.");

    const scenarioRef = scenarioDoc(scenarioId);
    const scenarioSnap = await getDoc(scenarioRef);
    
    if (!scenarioSnap.exists()) throw new Error("Scenario not found.");
    
    const initialValues = scenarioSnap.data().initialValues;

    await updateDoc(simRef, {
        outputs: initialValues,
        inputs: {
            interestRate: initialValues.interestRate || 5,
            taxRate: initialValues.taxRate || 20,
        },
        status: 'active',
        startedAt: serverTimestamp(),
    });
}

export async function runMacroSimulation(input: Omit<RunSimulationInput, 'uid'>) {
    const simRef = simulationDoc(input.simulationId);
    const simSnap = await getDoc(simRef);
    if (!simSnap.exists()) throw new Error("Simulation not found.");
    
    const result = await runMacroSimulationFlow(input);

    await updateDoc(simRef, {
        inputs: input.inputs,
        outputs: result.outputs,
        impactLevel: result.impactLevel,
        aiCommentary: result.aiCommentary,
        finishedAt: serverTimestamp(),
    });
    return result;
}

export async function getMacroEconomicAdvice(input: GetMacroAdviceInput) {
    const result = await getMacroEconomicAdviceFlow(input);
    return result;
}


// LOANSYNC ACTIONS
export async function applyForLoan(payload: Omit<LoanApplicationInput, 'financialContext'> & {uid: string}): Promise<LoanApplicationOutput> {
    const { uid, amount, termMonths, purpose, loanType } = payload;
    
    const mockFinancialContext = {
        income: 50000,
        debt: 200000,
        creditScore: 720,
    };

    const decision = await simulateLoanApplication({
        amount,
        termMonths,
        purpose,
        loanType,
        financialContext: mockFinancialContext,
    });

    const historyColRef = loanSyncHistoryCollection(uid);
    const newHistoryDoc = doc(historyColRef);
    await setDoc(newHistoryDoc, {
        amount,
        termMonths,
        purpose,
        loanType,
        status: decision.status,
        interestRate: decision.interestRate,
        feedback: decision.justification,
        submittedAt: serverTimestamp(),
        approvedAt: decision.status === 'Approved' ? serverTimestamp() : null,
    });
    
    if (decision.status === 'Approved') {
        const activeLoanRef = loanSyncActiveLoanDoc(uid);
        await setDoc(activeLoanRef, {
            loanId: newHistoryDoc.id,
            amount: amount,
            type: loanType,
            interestRate: decision.interestRate,
            termMonths: termMonths,
            status: "active",
            remainingBalance: amount,
            startDate: serverTimestamp(),
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + termMonths)),
        });
    }

    return decision;
}


export async function getFinancialInsights(input: FinancialInsightsInput): Promise<FinancialInsightsOutput> {
    const result = await getFinancialInsightsFlow(input);
    return result;
}
