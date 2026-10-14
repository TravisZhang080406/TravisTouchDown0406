import { z } from 'zod';

export const CharacterSchema = z.object({
  id: z.string(), name: z.string(), appearance: z.string(), personality: z.string(),
}).strict();
export const FactChangeSchema = z.object({key: z.string(), before: z.string().nullable(), after: z.string().nullable()}).strict();
export const PatchSchema = z.object({ changes: z.array(FactChangeSchema), event: z.string() }).strict();
export const PageDraftSchema = z.object({
  heading: z.string(), text: z.string(), scene: z.string(), cast: z.array(z.string()), patch: PatchSchema,
}).strict();
export const RoundSchema = z.object({
  title: z.string(), newCharacters: z.array(CharacterSchema), plan: z.array(z.string()),
  pages: z.array(PageDraftSchema), ended: z.boolean(),
}).strict();
export type Character = z.infer<typeof CharacterSchema>;
export type Patch = z.infer<typeof PatchSchema>;
export type Round = z.infer<typeof RoundSchema>;
export type State = { revision: number; facts: Record<string, string>; history: { page: number; event: string }[]; plan: string[] };
export type Page = z.infer<typeof PageDraftSchema> & {
  language?: 'zh' | 'en'; id: string; number: number; state: State; imagePrompt: string;
  imageStatus: 'pending' | 'ready' | 'error'; imageUrl?: string; imageError?: string; imageMs?: number;
};
export type Timing = { round: number; textMs: number; totalMs: number; imageMs: number[]; repaired: boolean };
export type Story = {
  version: 1; language?: 'zh' | 'en'; id: string; title: string; idea: string; style: string; mode: 'demo' | 'live';
  characters: Character[]; state: State; pages: Page[]; ended: boolean; timings: Timing[];
  createdAt: string; updatedAt: string;
};
export const ActionSchema = z.enum(['start', 'continue', 'twist', 'ending', 'custom']);
export type Action = z.infer<typeof ActionSchema>;
export const RequestSchema = z.object({
  language: z.enum(['zh','en']).default('zh'),
  id: z.string().uuid().optional(), idea: z.string().trim().min(3).max(1000).optional(),
  style: z.string().trim().min(1).max(200).default('温暖水彩'),
  mode: z.enum(['demo','live']).default('demo'), action: ActionSchema,
  instruction: z.string().trim().max(500).default(''),
}).strict();
export type StoryRequest = z.infer<typeof RequestSchema>;
