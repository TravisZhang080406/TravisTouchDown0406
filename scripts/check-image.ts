// Opt-in live smoke test: generates ONE image and may incur provider cost.
// node --env-file=.env.local --import tsx scripts/check-image.ts
import { generateImage,safeError } from '../lib/providers';
import { demoRound } from '../lib/demo';
import { commitRound } from '../lib/state';
import type { Story } from '../lib/schema';
async function main(){
 const base:Story={version:1,id:crypto.randomUUID(),title:'',idea:'小狐狸找月亮',style:'温暖水彩',mode:'demo',characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],createdAt:'',updatedAt:''};
 const story=commitRound(base,demoRound(base,'start',''));story.mode='live';
 try{const url=await generateImage(story,story.pages[0],new AbortController().signal);console.log(JSON.stringify({ok:true,image:url.startsWith('/api/media')?'saved locally':'provider URL returned'}));}
 catch(error){console.log(JSON.stringify({ok:false,error:safeError(error)}));process.exitCode=1;}
}
main();
