
import {z} from 'genkit';

export const FinancialInsightsInputSchema = z.object({
  financialData: z
    .string()
    .describe(
      'User financial data, including income, expenses, assets, and debts.'
    ),
  investmentPreferences: z
    .string()
    .optional()
    .describe(
      'User investment preferences, such as risk tolerance and investment goals.'
    ),
});
export type FinancialInsightsInput = z.infer<
  typeof FinancialInsightsInputSchema
>;

export const FinancialInsightsOutputSchema = z.object({
  savingsSuggestions: z
    .string()
    .describe('AI-powered suggestions for optimizing savings.'),
  investmentSuggestions: z
    .string()
    .describe(
      'AI-powered suggestions for investment opportunities based on financial data and preferences.'
    ),
});
export type FinancialInsightsOutput = z.infer<
  typeof FinancialInsightsOutputSchema
>;
