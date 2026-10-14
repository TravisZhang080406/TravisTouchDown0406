import test from 'node:test';
import assert from 'node:assert/strict';
import { generateImageBatch } from '../lib/image-batch';
import { commitRound, imagePrompt } from '../lib/state';
import { demoRound } from '../lib/demo';
import { RequestSchema, type Story, type Timing } from '../lib/schema';
function fixture(){
 const base:Story={version:1,id:crypto.randomUUID(),title:'',idea:'test',style:'温暖水彩',mode:'demo',characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],createdAt:'',updatedAt:''};
 const story=commitRound(base,demoRound(base,'start',''));
 const timing:Timing={round:1,textMs:0,totalMs:0,imageMs:[],repaired:false};story.timings.push(timing);return {story,timing};
}
const tick=()=>new Promise<void>(r=>setImmediate(r));
test('two workers deliver out of order, preserve page order and serialize disk writes',async()=>{
 const {story,timing}=fixture();let active=0,peak=0,writes=0,peakWrites=0;
 const gates=new Map<number,(url:string)=>void>();const emitted:number[]=[];let stored:Story|undefined;
 const run=generateImageBatch(story,0,timing,new AbortController().signal,{
  generate:async(_s,p)=>{active++;peak=Math.max(peak,active);const url=await new Promise<string>(r=>gates.set(p.number,r));active--;return url;},
  save:async s=>{writes++;peakWrites=Math.max(peakWrites,writes);await tick();stored=structuredClone(s);writes--;},errorText:()=> 'error',emit:e=>{if(e.type==='page')emitted.push(e.page.number);},
 });
 await tick();assert.deepEqual([...gates.keys()],[1,2]);
 gates.get(2)!('/2');await tick();await tick();assert.ok(gates.has(3));assert.deepEqual(emitted,[2]);
 gates.get(3)!('/3');gates.get(1)!('/1');await run;
 assert.equal(peak,2);assert.equal(peakWrites,1);assert.deepEqual(stored!.pages.map(p=>p.imageUrl),['/1','/2','/3']);assert.equal(timing.imageMs.length,3);
});
test('one provider failure does not prevent other images from completing',async()=>{
 const {story,timing}=fixture();await generateImageBatch(story,0,timing,new AbortController().signal,{generate:async(_s,p)=>{if(p.number===2)throw Error();return '/ok';},save:async()=>{},errorText:()=> 'retry',emit:()=>{}});
 assert.deepEqual(story.pages.map(p=>p.imageStatus),['ready','error','ready']);assert.equal(story.pages[1].imageError,'retry');
});
test('cancel does not schedule the third page and waits for active requests',async()=>{
 const {story,timing}=fixture();const abort=new AbortController();const gates:Array<()=>void>=[];let started=0,finished=false;
 const run=generateImageBatch(story,0,timing,abort.signal,{generate:async()=>{started++;await new Promise<void>(r=>gates.push(r));throw Error('cancel');},save:async()=>{},errorText:()=> 'cancelled',emit:()=>{}}).then(()=>{finished=true;});
 abort.abort();gates[0]();await tick();assert.equal(finished,false);gates[1]();await run;assert.equal(started,2);assert.equal(story.pages[2].imageStatus,'pending');
});
test('custom styles are bounded, used in prompts and preserved through continuation',()=>{
 assert.equal(RequestSchema.parse({action:'start',idea:'test',style:'  复古版画，黑白线条  '}).style,'复古版画，黑白线条');
 for(const style of ['   ','x'.repeat(201)])assert.throws(()=>RequestSchema.parse({action:'start',idea:'test',style}));
 const {story}=fixture();story.style='复古版画，黑白线条';const next=commitRound(story,demoRound(story,'continue',''));
 assert.equal(next.style,story.style);assert.ok(imagePrompt(next,next.pages[3]).includes(story.style));assert.ok(!imagePrompt(next,next.pages[3]).includes('painterly paper texture'));
});
test('save failure waits for the other worker before returning and never starts page three',async()=>{
 const {story,timing}=fixture();let release!:()=>void,settled=false,calls=0;
 const run=generateImageBatch(story,0,timing,new AbortController().signal,{
  generate:async(_s,p)=>{calls++;if(p.number===2)await new Promise<void>(r=>release=r);return '/ok';},
  save:async()=>{throw Error('disk unavailable');},errorText:()=> 'error',emit:()=>{},
 }).catch(e=>{settled=true;assert.match(e.message,/disk/);});
 await tick();assert.equal(settled,false);release();await run;assert.equal(calls,2);
});
