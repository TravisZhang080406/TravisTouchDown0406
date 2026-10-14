import type { Page, Story, Timing } from './schema';

type Dependencies = {
  generate: (story: Story, page: Page, signal: AbortSignal) => Promise<string>;
  save: (story: Story) => Promise<void>;
  errorText: (error: unknown) => string;
  emit: (event: {type: 'page'; page: Page} | {type: 'status'; message: string}) => void;
};

// Two workers generate independently; commits are serialized to avoid older saves
// overwriting newer results. Wait for both workers before releasing the story lock.
export async function generateImageBatch(story: Story, offset: number, timing: Timing, signal: AbortSignal, deps: Dependencies) {
  const pages = story.pages.slice(offset);
  let next = 0;
  let stopped = false;
  let commits: Promise<void> = Promise.resolve();
  async function worker() {
    while (!signal.aborted && !stopped && next < pages.length) {
      const slot = next++;
      const page = structuredClone(pages[slot]);
      deps.emit({type:'status', message:`文字已就绪，正在绘制第 ${page.number} 页插画…`});
      const started = Date.now();
      try {
        page.imageUrl = await deps.generate(story, page, signal);
        page.imageStatus = 'ready';
        delete page.imageError;
      } catch(error) {
        page.imageStatus = 'error';
        page.imageError = deps.errorText(error);
      }
      page.imageMs = Date.now() - started;
      const commit = commits.then(async()=> {
        Object.assign(story.pages[offset + slot], page);
        timing.imageMs[slot] = page.imageMs!;
        await deps.save(story);
        deps.emit({type:'page',page});
      });
      commits = commit;
      try { await commit; } catch(error) { stopped = true; throw error; }
    }
  }
  const results = await Promise.allSettled([worker(),worker()]);
  const failure = results.find(result=>result.status==='rejected');
  if(failure?.status==='rejected') throw failure.reason;
}
