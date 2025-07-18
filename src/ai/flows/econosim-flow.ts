
'use server';

/**
 * @fileOverview Processes a macroeconomic simulation turn and provides advice.
 *
 * - runMacroSimulation - The main flow that calculates the outcome of policy changes.
 * - getMacroEconomicAdvice - A flow that provides strategic advice based on the current economic state.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    RunSimulationInputSchema, 
    RunSimulationOutputSchema,
    GetMacroAdviceInputSchema,
    GetMacroAdviceOutputSchema,
    RunSimulationInput,
    GetMacroAdviceInput
} from '@/lib/types/econosim';


// Exported function for the main turn processing
export async function runMacroSimulation(input: RunSimulationInput) {
  return macroSimulationFlow(input);
}

// Genkit prompt for turn processing
const macroTurnPrompt = ai.definePrompt({
  name: 'econosimMacroTurnPrompt',
  input: { schema: RunSimulationInputSchema },
  output: { schema: RunSimulationOutputSchema },
  prompt: `You are an economic model simulating the economy for a game called EconoSim.
A player has adjusted economic policies. Your task is to calculate the new state of the economy.

**Economic Principles:**
- **Higher Interest Rates:** Generally reduce inflation, but can slow GDP growth and increase unemployment.
- **Lower Interest Rates:** Stimulate GDP growth and decrease unemployment, but can increase inflation.
- **Higher Tax Rates:** Increase government revenue but can slow GDP growth by reducing private spending/investment.
- **Lower Tax Rates:** Stimulate GDP and reduce unemployment but can increase national debt if spending is not cut.

**Scenario:** Inflation Crisis 2025
- **Initial State:** High inflation (12.2%), decent employment (93%), stable GDP (890B).
- **Goal:** Tame inflation without causing a major recession.

**Player's Policy Inputs:**
- New Interest Rate: {{inputs.interestRate}}%
- New Tax Rate: {{inputs.taxRate}}%

Calculate the new GDP, inflation, and jobs percentages. The changes should be logical but not extreme for a single turn.
- A 1% change in interest rates might shift inflation by 0.5-1.5% and GDP by 0.2-0.8%.
- A 5% change in tax rates might shift GDP by 0.5-1.5%.

Determine an 'impactLevel' (low, moderate, high) based on the magnitude of the changes.
Provide a concise 'aiCommentary' explaining the economic outcome of the player's choices.
`,
});

// The main Genkit flow for processing a turn
const macroSimulationFlow = ai.defineFlow(
  {
    name: 'macroSimulationFlow',
    inputSchema: RunSimulationInputSchema,
    outputSchema: RunSimulationOutputSchema,
  },
  async (input) => {
    const { output } = await macroTurnPrompt(input);

    if (!output) {
      throw new Error('The AI failed to process the simulation turn.');
    }
    
    return output;
  }
);


// Exported function for getting AI advice
export async function getMacroEconomicAdvice(input: GetMacroAdviceInput) {
  return adviceFlow(input);
}

// Genkit prompt for AI advice
const advicePrompt = ai.definePrompt({
    name: 'econosimMacroAdvicePrompt',
    input: { schema: GetMacroAdviceInputSchema },
    output: { schema: GetMacroAdviceOutputSchema },
    prompt: `You are an expert economist advising a player in the EconoSim game.
    
    The current scenario is: {{scenarioTitle}}
    Here is the current state of the economy:
    - GDP: \${{currentOutputs.gdp}}B
    - Inflation: {{currentOutputs.inflation}}%
    - Employment: {{currentOutputs.jobs}}%

    Based on this data, provide concise, actionable advice (2-3 sentences) to help them achieve the scenario's goal.
    For an inflation crisis, the goal is to lower inflation without crashing the GDP.
    `,
});


// The Genkit flow for getting advice
const adviceFlow = ai.defineFlow(
    {
        name: 'getMacroEconomicAdviceFlow',
        inputSchema: GetMacroAdviceInputSchema,
        outputSchema: GetMacroAdviceOutputSchema,
    },
    async (input) => {
        const { output } = await advicePrompt(input);
        if (!output) {
            throw new Error('The AI failed to generate advice.');
        }
        return output;
    }
);
