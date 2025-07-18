'use server';

/**
 * @fileOverview Provides AI-powered financial insights and suggestions to users.
 *
 * - getFinancialInsights - A function that returns savings and investment suggestions based on user financial data.
 */

import {ai} from '@/ai/genkit';
import {
  FinancialInsightsInput,
  FinancialInsightsInputSchema,
  FinancialInsightsOutput,
  FinancialInsightsOutputSchema,
} from '@/lib/types/financial-insights';

export async function getFinancialInsights(
  input: FinancialInsightsInput
): Promise<FinancialInsightsOutput> {
  const result = await financialInsightsFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: {schema: FinancialInsightsInputSchema},
  output: {schema: FinancialInsightsOutputSchema},
  retries: 3, // Add retry mechanism for transient errors
  prompt: `You are a financial advisor providing personalized savings and investment suggestions based on user financial data and investment preferences.

  Analyze the user's financial data and investment preferences to generate tailored recommendations.

  Financial Data: {{{financialData}}}
  Investment Preferences: {{{investmentPreferences}}}

  Provide clear and actionable suggestions for optimizing savings and exploring investment opportunities.
  Make sure your output matches the JSON schema exactly.
  `,
});

export const financialInsightsFlow = ai.defineFlow(
  {
    name: 'financialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
