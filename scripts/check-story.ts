// Opt-in live text check. Calls the configured text provider once and saves a validated three-page story.
// node --env-file=.env.local --import tsx scripts/check-story.ts
import {generateRound,safeError} from '../lib/providers';
import {commitRound} from '../lib/state';
import {saveStory} from '../lib/store';
import type {Story} from '../lib/schema';
async function main(){
 const now=new Date().toISOString();
 const story:Story={version:1,id:crypto.randomUUID(),title:'',idea:'一只戴蓝围巾的怕黑小狐狸，和左耳羽毛有缺口的猫头鹰一起寻找月亮。小狐狸带着银钥匙和灯笼，第三页把钥匙交给猫头鹰，一阵风吹灭灯笼。',style:'温暖水彩',mode:'live',characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],createdAt:now,updatedAt:now};
 const start=Date.now();
 try{
  const round=await generateRound(story,'start','',new AbortController().signal);
  const result=commitRound(story,round);
  result.timings.push({round:1,textMs:Date.now()-start,totalMs:Date.now()-start,imageMs:[],repaired:false});
  await saveStory(result);
  console.log(JSON.stringify({ok:true,id:result.id,title:result.title,pages:result.pages.length,characters:result.characters.length,facts:result.state.facts,textMs:Date.now()-start}));
 }catch(error){console.log(JSON.stringify({ok:false,error:safeError(error),kind:error instanceof Error?error.name:'unknown',causeCode:(error as {cause?:{code?:string}})?.cause?.code}));process.exitCode=1;}
}
main();
