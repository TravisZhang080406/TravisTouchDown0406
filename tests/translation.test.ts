import test from 'node:test';
import assert from 'node:assert/strict';
import { demoRound } from '../lib/demo';
import { commitRound } from '../lib/state';
import { translateStory } from '../lib/translation';
import { RequestSchema, type Story } from '../lib/schema';
import { translateUI } from '../lib/i18n';
const empty=():Story=>({version:1,id:crypto.randomUUID(),language:'zh',title:'',idea:'test',style:'温暖水彩',mode:'demo',characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],createdAt:'',updatedAt:''});
test('English demo covers start, continuation, twist and ending without mutating canonical facts',async()=>{
 let story=empty();
 for(const action of ['start','continue','twist','ending'] as const){
  story=commitRound(story,demoRound(story,action,''));
  const snapshot=JSON.stringify(story);
  const en=await translateStory(story,'en',new AbortController().signal);
  assert.equal(en.title,'Lili and the Hidden Moon');
  for(const p of en.pages){assert.ok(!/[\u3400-\u9fff]/.test(p.text+p.heading));assert.equal(p.id,story.pages[p.number-1].id);assert.deepEqual(p.cast,story.pages[p.number-1].cast);}
  assert.ok(!/[\u3400-\u9fff]/.test(JSON.stringify(en.state)));
  assert.ok(!/[\u3400-\u9fff]/.test(JSON.stringify(en.characters)));
  assert.equal(JSON.stringify(story),snapshot);
  assert.deepEqual(await translateStory(story,'zh',new AbortController().signal),story);
 }
 assert.equal(story.pages.length,12);assert.equal(story.ended,true);
});
test('language requests are validated and legacy requests default to Chinese',()=>{
 assert.equal(RequestSchema.parse({action:'start',idea:'hello'}).language,'zh');
 assert.equal(RequestSchema.parse({action:'start',idea:'hello',language:'en'}).language,'en');
 assert.throws(()=>RequestSchema.parse({action:'start',idea:'hello',language:'fr'}));
});
test('UI translates dynamic page progress and preserves canonical style values',()=>{
 assert.equal(translateUI('第 3 页','en'),'Page 3');
 assert.equal(translateUI('文字已就绪，正在绘制第 2 页插画…','en'),'The text is ready. Illustrating page 2…');
 assert.equal(translateUI('温暖水彩','en'),'Warm watercolor');
 assert.equal(translateUI('温暖水彩','zh'),'温暖水彩');
});
test('live translation validates batches and does not alter IDs, images or canonical state',async()=>{
 const originalFetch=globalThis.fetch;
 const oldKey=process.env.OPENAI_API_KEY, oldMode=process.env.OPENAI_API_MODE;
 process.env.OPENAI_API_KEY='test-only-placeholder';process.env.OPENAI_API_MODE='chat';
 let calls=0;
 globalThis.fetch=async(_url,options)=>{
  calls++;
  const body=JSON.parse(String(options?.body));
  const input=JSON.parse(body.messages[1].content);
  return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({translations:input.strings.map((s:string)=>`Translated: ${s}`)})}}]}));
 };
 try{
  const story=commitRound(empty(),demoRound(empty(),'start',''));story.mode='live';story.pages[0].imageUrl='/demo-1.svg';
  const snapshot=JSON.stringify(story);
  const result=await translateStory(story,'en',new AbortController().signal);
  assert.ok(calls>1);assert.equal(result.pages[0].id,story.pages[0].id);assert.equal(result.pages[0].imageUrl,'/demo-1.svg');assert.equal(JSON.stringify(story),snapshot);assert.ok(result.title.startsWith('Translated:'));
 }finally{globalThis.fetch=originalFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;if(oldMode===undefined)delete process.env.OPENAI_API_MODE;else process.env.OPENAI_API_MODE=oldMode;}
});
