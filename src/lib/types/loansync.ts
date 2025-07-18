
import { z } from 'zod';

export const LoanApplicationInputSchema = z.object({
  amount: z.number().describe('The amount of money being requested for the loan.'),
  termMonths: z.number().describe('The length of the loan term in months.'),
  purpose: z.string().describe('The stated purpose of the loan.'),
  loanType: z.string().describe('The type of loan, e.g., "Business", "Emergency"'),
  financialContext: z.object({
    income: z.number().describe('The applicant\'s approximate monthly income.'),
    debt: z.number().describe('The applicant\'s total existing debt.'),
    creditScore: z.number().describe('The applicant\'s credit score.'),
  }),
});
export type LoanApplicationInput = z.infer<typeof LoanApplicationInputSchema>;

export const LoanApplicationOutputSchema = z.object({
  status: z.enum(['Approved', 'Rejected']).describe('The outcome of the loan application.'),
  interestRate: z.number().describe('The approved interest rate. Set to 0 if rejected.'),
  justification: z.string().describe('A brief explanation for the decision, especially for rejections.'),
  loanType: z.string().describe('The type of loan that was applied for.'),
});
export type LoanApplicationOutput = z.infer<typeof LoanApplicationOutputSchema>;
