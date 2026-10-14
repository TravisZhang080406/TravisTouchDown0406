import { z } from 'zod';
import { sameOrigin, bodyJSON } from '@/lib/http';
import { readStory } from '@/lib/store';
import { translateStory } from '@/lib/translation';
import { safeError } from '@/lib/providers';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=120;
const inputSchema=z.object({id:z.string().uuid(),language:z.enum(['zh','en'])}).strict();
// In-memory cache never changes the canonical story or its continuity patches.
const cache=new Map<string,unknown>();
export async function POST(request:Request){
 try{
  sameOrigin(request);
  const input=inputSchema.parse(await bodyJSON(request));
  const story=await readStory(input.id);
  const key=JSON.stringify([story,input.language]);
  if(cache.has(key))return Response.json({story:cache.get(key)},{headers:{'Cache-Control':'no-store'}});
  const result=await translateStory(story,input.language,request.signal);
  if(cache.size>=30)cache.delete(cache.keys().next().value!);
  cache.set(key,result);
  return Response.json({story:result},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:safeError(error)},{status:400});}
}
