import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import type { Story } from './schema';

export const dataDir = () => path.resolve(process.env.STORY_DATA_DIR || './data');
export const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export async function saveStory(story: Story) {
  await mkdir(dataDir(), {recursive: true});
  const target = path.join(dataDir(), `${story.id}.json`);
  const temporary = `${target}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(story), {mode: 0o600});
  await rename(temporary, target);
}
export async function readStory(id: string): Promise<Story> {
  if (!validId(id)) throw new Error('无效的故事编号');
  return JSON.parse(await readFile(path.join(dataDir(), `${id}.json`), 'utf8')) as Story;
}
// This app is intentionally a single-process local demo, not a multi-instance service.
const globalStore = globalThis as typeof globalThis & { moonbookLocks?: Set<string> };
const locks = globalStore.moonbookLocks ??= new Set();
export function lock(id: string) { if (locks.has(id)) return false; locks.add(id); return true; }
export function unlock(id: string) { locks.delete(id); }
export function busy(id: string) { return locks.has(id); }
