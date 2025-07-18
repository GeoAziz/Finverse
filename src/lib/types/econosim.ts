
import {z} from 'zod';
import { Timestamp } from 'firebase/firestore';

// Base Schemas for Firestore documents
export const ScenarioSchema = z.object({
  title: z.string(),
  description: z.string(),
  policies: z.array(z.string()),
  initialValues: z.object({
    gdp: z.number(),
    inflation: z.number(),
    jobs: z.number(),
    interestRate: z.number().optional(),
    taxRate: z.number().optional(),
  }),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const SimulationSchema = z.object({
  id: z.string(),
  uid: z.string(),
  scenarioId: z.string(),
  status: z.enum(['not-started', 'active', 'finished']),
  inputs: z.object({
    interestRate: z.number(),
    taxRate: z.number(),
  }).optional(),
  outputs: z.object({
    gdp: z.number(),
    inflation: z.number(),
    jobs: z.number(),
  }),
  impactLevel: z.enum(['low', 'moderate', 'high']).optional(),
  aiCommentary: z.string().optional(),
  startedAt: z.instanceof(Timestamp).optional(),
  finishedAt: z.instanceof(Timestamp).optional(),
});
export type Simulation = z.infer<typeof SimulationSchema>;


// Schemas for the main simulation flow
export const RunSimulationInputSchema = z.object({
  simulationId: z.string().describe('The ID of the simulation document in Firestore.'),
  scenarioId: z.string().describe('The ID of the scenario document.'),
  inputs: z.object({
    interestRate: z.number().describe("The player's chosen interest rate."),
    taxRate: z.number().describe("The player's chosen tax rate."),
  }),
});
export type RunSimulationInput = z.infer<typeof RunSimulationInputSchema>;

export const RunSimulationOutputSchema = z.object({
  outputs: z.object({
    gdp: z.number().describe('The new Gross Domestic Product in billions.'),
    inflation: z.number().describe('The new inflation rate as a percentage.'),
    jobs: z.number().describe('The new employment rate as a percentage.'),
  }),
  impactLevel: z.enum(['low', 'moderate', 'high']).describe('The overall impact of the policy changes.'),
  aiCommentary: z.string().describe("A brief AI-generated explanation of the economic results."),
});
export type RunSimulationOutput = z.infer<typeof RunSimulationOutputSchema>;


// Schemas for the advice flow
export const GetMacroAdviceInputSchema = z.object({
  scenarioTitle: z.string(),
  currentOutputs: z.object({
    gdp: z.number(),
    inflation: z.number(),
    jobs: z.number(),
  }),
});
export type GetMacroAdviceInput = z.infer<typeof GetMacroAdviceInputSchema>;

export const GetMacroAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe(
      'Strategic economic advice for the player based on their current situation. Should be 2-3 sentences.'
    ),
});
export type GetMacroAdviceOutput = z.infer<typeof GetMacroAdviceOutputSchema>;
