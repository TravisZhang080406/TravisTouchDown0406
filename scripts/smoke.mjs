// Run against the local server. Uses only deterministic demo mode, no paid API calls.
import assert from 'node:assert/strict';
const base=process.env.SMOKE_URL || 'http://127.0.0.1:3000';
async function request(body,origin=base){return fetch(`${base}/api/story`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});}
async function round(body){const r=await request(body);assert.equal(r.status,200);const events=(await r.text()).trim().split('\n').map(JSON.parse);assert(!events.some(e=>e.type==='error'),JSON.stringify(events.find(e=>e.type==='error')));assert(events.findIndex(e=>e.type==='story')<events.findIndex(e=>e.type==='page'));const result=events.at(-1);assert.equal(result.type,'done');return result.story;}
const first=await round({action:'start',mode:'demo',idea:'小狐狸寻找月亮'});
assert.equal(first.pages.length,3);assert(first.pages.every(p=>p.imageStatus==='ready'));
console.log('PASS first three pages + progressive image delivery');
const pending=request({action:'continue',id:first.id});
await new Promise(resolve=>setTimeout(resolve,80));
const conflict=await request({action:'continue',id:first.id});assert.equal(conflict.status,409);
const response=await pending;const second=(await response.text()).trim().split('\n').map(JSON.parse).at(-1).story;
assert.equal(second.pages.length,6);assert.equal(second.state.facts.keyOwner,'阿布');
console.log('PASS continuity + concurrent duplicate rejection');
const twist=await round({action:'twist',id:first.id});assert.equal(twist.pages.length,9);
const end=await round({action:'ending',id:first.id});assert.equal(end.ended,true);assert.equal(end.pages.length,12);assert.equal(end.state.facts.keyOwner,'栗栗');
console.log('PASS twist + ending + item transfer');
assert.equal((await request({action:'continue',id:first.id})).status,400);
assert.equal((await request({action:'start',mode:'demo',idea:'小狐狸'},'https://other.example')).status,400);
assert.equal((await request({action:'start',mode:'demo',idea:'x'.repeat(17000)})).status,400);
const restored=await (await fetch(`${base}/api/story?id=${first.id}`)).json();assert.equal(restored.story.pages.length,12);
const retry=await fetch(`${base}/api/image`,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({id:first.id,pageId:first.pages[0].id})});assert.equal(retry.status,200);
console.log('PASS completed-story guard + cross-origin/body-limit checks + persistence + ready-image idempotence');
console.log('All local smoke checks passed.');
