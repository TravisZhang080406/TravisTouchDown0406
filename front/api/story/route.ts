import { generateImageBatch } from '@/lib/image-batch';
import { RequestSchema, type Story } from '@/lib/schema';
import { readStory, saveStory, lock, unlock, busy } from '@/lib/store';
import { generateRound, generateImage, PublicError, safeError } from '@/lib/providers';
import { commitRound } from '@/lib/state';
import { sameOrigin, bodyJSON } from '@/lib/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600;

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get('id') || '';
    const story = await readStory(id);
    return Response.json({story,busy:busy(id)},{headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'没有找到已保存的故事。'},{status:404}); }
}

export async function POST(request: Request) {
  let input;
  try { sameOrigin(request); input = RequestSchema.parse(await bodyJSON(request)); }
  catch { return Response.json({error:'输入无效，请检查故事想法（3–1000 字）、画风（1–200 字）和操作。'},{status:400}); }
  if (input.action === 'start' && !input.idea) return Response.json({error:'请先写下一个故事想法。'},{status:400});
  if (input.action === 'custom' && !input.instruction) return Response.json({error:'请填写你希望发生的情节。'},{status:400});
  const id = input.action === 'start' ? crypto.randomUUID() : input.id;
  if (!id) return Response.json({error:'请先创建故事。'},{status:400});
  if (!lock(id)) return Response.json({error:'这个故事正在生成，请等本轮结束。'},{status:409});
  let story: Story;
  try {
    story = input.action === 'start' ? {
      version:1,id,language:input.language,title:'正在为故事起名…',idea:input.idea!,style:input.style,mode:input.mode,
      characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    } : await readStory(id);
    story.language = input.language;
    if (story.ended) throw new PublicError('故事已圆满结束，请开始新的绘本。');
    if (story.pages.length >= 30) throw new PublicError('当前绘本已达 30 页，请开始新的绘本。');
    if (story.mode === 'live' && !process.env.OPENAI_API_KEY) throw new PublicError('请先配置 OPENAI_API_KEY 并重启，或使用离线样例模式。');
    if (story.mode === 'demo' && input.action === 'custom') throw new PublicError('离线样例不支持自定义改写，请在新故事中选择真实 AI 模式。');
  } catch (error) { unlock(id); return Response.json({error:safeError(error)},{status:400}); }
  const cancel = new AbortController();
  const signal = AbortSignal.any([request.signal,cancel.signal]);
  let disconnected = false;
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const emit = (value:unknown) => {
        if (disconnected) return;
        try {controller.enqueue(encoder.encode(JSON.stringify(value)+'\n'));} catch {disconnected=true;}
      };
      const started = Date.now(); const offset = story.pages.length;
      try {
        emit({type:'status',message:'正在规划三页故事，并核对角色与已有事实…',id});
        let repaired = false;
        let round = await generateRound(story,input.action,input.instruction,signal);
        if (signal.aborted) throw new DOMException('Aborted','AbortError');
        try { story = commitRound(story,round); }
        catch (error) {
          repaired = true;
          emit({type:'status',message:'发现状态冲突，正在修复本轮内容…'});
          round = await generateRound(story,input.action,input.instruction,signal,error instanceof Error ? error.message : '校验失败');
          try {story = commitRound(story,round);} catch {throw new PublicError('两次状态校验均未通过，已有故事保持不变。请调整情节后重试。');}
        }
        const timing = {round:offset/3+1,textMs:Date.now()-started,totalMs:0,imageMs:[] as number[],repaired};
        story.timings.push(timing);
        await saveStory(story);
        emit({type:'story',story});
        await generateImageBatch(story,offset,timing,signal,{
          generate:generateImage, save:saveStory, errorText:safeError, emit,
        });
        timing.totalMs=Date.now()-started;
        // Interrupted pending pages remain explicitly retryable after reload.
        await saveStory(story);
        emit({type:'done',story});
      } catch (error) { emit({type:'error',error:safeError(error)}); }
      finally { unlock(id); if (!disconnected) {try {controller.close();} catch { /* closed by browser */ }} }
    },
    cancel() {disconnected=true;cancel.abort();},
  });
  return new Response(stream,{headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store, no-transform','X-Accel-Buffering':'no'}});
}
