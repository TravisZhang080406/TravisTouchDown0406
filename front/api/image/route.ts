import { z } from 'zod';
import { readStory,saveStory,lock,unlock } from '@/lib/store';
import { generateImage, safeError } from '@/lib/providers';
import { sameOrigin,bodyJSON } from '@/lib/http';
export const runtime='nodejs';
export const maxDuration=240;
export async function POST(request:Request) {
  let input;
  try {sameOrigin(request);input=z.object({id:z.string().uuid(),pageId:z.string().uuid()}).strict().parse(await bodyJSON(request));}
  catch {return Response.json({error:'请求无效'},{status:400});}
  if (!lock(input.id)) return Response.json({error:'当前故事正在生成，请稍后重试。'},{status:409});
  try {
    const story=await readStory(input.id);
    const page=story.pages.find(p=>p.id===input.pageId);
    if(!page) return Response.json({error:'没有找到页面。'},{status:404});
    if(page.imageStatus==='ready') return Response.json({page});
    const start=Date.now();
    try {page.imageUrl=await generateImage(story,page,request.signal);page.imageStatus='ready';delete page.imageError;}
    catch(error) {page.imageStatus='error';page.imageError=safeError(error);}
    page.imageMs=Date.now()-start;
    await saveStory(story);
    return Response.json({page});
  } catch(error) {return Response.json({error:safeError(error)},{status:500});}
  finally{unlock(input.id);}
}
