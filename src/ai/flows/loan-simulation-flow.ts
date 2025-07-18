'use server';

/**
 * @fileOverview Simulates a loan application decision using an AI model.
 *
 * - simulateLoanApplication - The main flow that processes a loan request and returns a decision.
 */

import { ai } from '@/ai/genkit';
import { LoanApplicationInput, LoanApplicationInputSchema, LoanApplicationOutput, LoanApplicationOutputSchema } from '@/lib/types/loansync';


export async function simulateLoanApplication(input: LoanApplicationInput): Promise<LoanApplicationOutput> {
  return loanSimulationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'loanSimulationPrompt',
  input: { schema: LoanApplicationInputSchema },
  output: { schema: LoanApplicationOutputSchema },
  prompt: `You are an AI loan underwriter for a futuristic bank.
  Your task is to approve or reject a loan application based on the provided financial data.
  
  **Underwriting Rules:**
  - A credit score below 600 is an automatic rejection.
  - A debt-to-income ratio (total debt / monthly income) greater than 40% is a high-risk factor.
  - Base interest rate is 5%.
  - For every 20 points the credit score is below 750, add 0.5% to the interest rate.
  - For every 5% the debt-to-income ratio is above 20%, add 0.25% to the interest rate.
  
  **Applicant Data:**
  - Loan Amount: \${{amount}}
  - Loan Term: {{termMonths}} months
  - Loan Purpose: {{purpose}}
  - Monthly Income: \${{financialContext.income}}
  - Total Debt: \${{financialContext.debt}}
  - Credit Score: {{financialContext.creditScore}}

  Analyze the data according to the rules.
  - If approved, calculate the final interest rate.
  - Provide a clear justification for your decision, especially if it's a rejection.
  - Ensure your response strictly follows the output JSON schema.
  `,
});

const loanSimulationFlow = ai.defineFlow(
  {
    name: 'loanSimulationFlow',
    inputSchema: LoanApplicationInputSchema,
    outputSchema: LoanApplicationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI failed to process the loan application.');
    }
    return output;
  }
);
