import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRound,generateImage,safeError } from '../lib/providers';
import { commitRound } from '../lib/state';
import { demoRound } from '../lib/demo';
import type { Story } from '../lib/schema';
const base:Story={version:1,id:crypto.randomUUID(),title:'',idea:'测试',style:'温暖水彩',mode:'demo',characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],createdAt:'',updatedAt:''};
test('Real Responses request uses environment secret, strict schema and parses completed output',async()=>{
  const oldFetch=global.fetch,oldKey=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='test-secret';
  global.fetch=async(url,init)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');const body=JSON.parse(init!.body as string);
    assert.equal(body.text.format.strict,true);assert.equal(body.store,false);assert.equal(body.text.format.schema.additionalProperties,false);
    return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(demoRound(base,'start',''))}]}]});
  };
  try{const round=await generateRound({...base,mode:'live'},'start','',new AbortController().signal);assert.equal(round.pages.length,3);}
  finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;}
});
test('Image provider uses requested model and accepts compatible HTTPS URL',async()=>{
  const oldFetch=global.fetch,oldKey=process.env.OPENOX_API_KEY;process.env.OPENOX_API_KEY='test-secret';
  const story=commitRound(base,demoRound(base,'start',''));story.mode='live';
  global.fetch=async(url,init)=>{assert.match(String(url),/api.openox.net\/v1\/images\/generations/);assert.equal(JSON.parse(init!.body as string).model,'gpt-image-2');return Response.json({data:[{url:'https://example.com/image.png'}]});};
  try{assert.equal(await generateImage(story,story.pages[0],new AbortController().signal),'https://example.com/image.png');}
  finally{global.fetch=oldFetch;if(oldKey===undefined)delete process.env.OPENOX_API_KEY;else process.env.OPENOX_API_KEY=oldKey;}
});
test('Upstream errors cannot leak credentials or raw payloads',()=>{assert(!safeError(new Error('Bearer private-token')).includes('private-token'));});

test('OpenOX chat mode uses configured base URL and parses validated three-page result',async()=>{
  const oldFetch=global.fetch;
  const names=['OPENAI_API_KEY','OPENAI_BASE_URL','OPENAI_API_MODE'] as const;
  const old=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  process.env.OPENAI_API_KEY='test-secret';process.env.OPENAI_BASE_URL='https://openox.tech/v1/';process.env.OPENAI_API_MODE='chat';
  global.fetch=async(url,init)=>{
    assert.equal(url,'https://openox.tech/v1/chat/completions');
    const body=JSON.parse(init!.body as string);
    assert.equal(body.response_format.json_schema.strict,true);
    assert.equal(JSON.parse(body.messages[1].content).instruction,'遇见小兔子');
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(demoRound(base,'start',''))}}]});
  };
  try{assert.equal((await generateRound({...base,mode:'live'},'custom','遇见小兔子',new AbortController().signal)).pages.length,3);}
  finally{global.fetch=oldFetch;for(const name of names){if(old[name]===undefined)delete process.env[name];else process.env[name]=old[name];}}
});

test('Chat mode rejects truncated output and never silently changes providers',async()=>{
  const oldFetch=global.fetch;
  const names=['OPENAI_API_KEY','OPENAI_BASE_URL','OPENAI_API_MODE'] as const;
  const old=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  process.env.OPENAI_API_KEY='test-secret';process.env.OPENAI_BASE_URL='https://openox.tech/v1';process.env.OPENAI_API_MODE='chat';
  let calls=0;global.fetch=async()=>{calls++;return Response.json({choices:[{finish_reason:'length',message:{content:'{}'}}]});};
  try{await assert.rejects(()=>generateRound({...base,mode:'live'},'start','',new AbortController().signal),/未完成/);assert.equal(calls,1);}
  finally{global.fetch=oldFetch;for(const name of names){if(old[name]===undefined)delete process.env[name];else process.env[name]=old[name];}}
});
