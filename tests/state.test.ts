import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPatch, commitRound } from '../lib/state';
import { demoRound } from '../lib/demo';
import type { Story } from '../lib/schema';
function base():Story{return {version:1,id:crypto.randomUUID(),title:'',idea:'狐狸寻找月亮',style:'温暖水彩',mode:'demo',characters:[],state:{revision:0,facts:{},history:[],plan:[]},pages:[],ended:false,timings:[],createdAt:'',updatedAt:''};}
test('Three pages preserve item ownership, extinguished lantern and immutable characters',()=>{
  const b=base();const first=commitRound(b,demoRound(b,'start',''));
  assert.equal(first.pages.length,3);assert.equal(first.state.facts.keyOwner,'阿布');assert.equal(first.state.facts.lantern,'熄灭');
  assert.equal(first.pages[0].state.facts.keyOwner,'栗栗');assert.equal(b.pages.length,0);
  const second=commitRound(first,demoRound(first,'continue',''));
  assert.equal(second.pages.length,6);assert.equal(second.state.facts.keyOwner,'阿布');assert.equal(second.state.facts.lantern,'熄灭');
  assert.deepEqual(second.characters,first.characters);assert.deepEqual(second.state.history.slice(0,3),first.state.history);
  assert.match(second.pages[5].imagePrompt,/蓝色围巾/);assert.match(second.pages[5].imagePrompt,/左耳/);
});
test('Wrong precondition fails atomically, no overwritten history',()=>{
  const b=base();const first=commitRound(b,demoRound(b,'start',''));
  const next=demoRound(first,'continue','');next.pages[2].patch.changes[0].before='错误地点';
  assert.throws(()=>commitRound(first,next),/状态冲突/);assert.equal(first.pages.length,3);assert.equal(first.state.revision,3);
});
test('Cannot overwrite a Character Bible entry',()=>{
  const b=base();const first=commitRound(b,demoRound(b,'start',''));const next=demoRound(first,'continue','');
  next.newCharacters=[{...first.characters[0],appearance:'红色围巾'}];assert.throws(()=>commitRound(first,next),/不可覆盖/);
});
test('Prototype and duplicate keys rejected',()=>{
  for(const key of ['__proto__','constructor','prototype'])assert.throws(()=>applyPatch(base().state,{changes:[{key,before:null,after:'x'}],event:'x'},1),/无效/);
  assert.throws(()=>applyPatch(base().state,{changes:[{key:'x',before:null,after:'1'},{key:'x',before:'1',after:'2'}],event:'x'},1),/重复/);
});
test('Ending clears future plans but retains history and explicitly transfers key back',()=>{
  const b=base();const first=commitRound(b,demoRound(b,'start',''));const end=commitRound(first,demoRound(first,'ending',''));
  assert.equal(end.ended,true);assert.equal(end.state.facts.keyOwner,'栗栗');assert.deepEqual(end.state.plan,[]);assert.equal(end.state.history.length,6);
});
test('Plans do not enter history; cast IDs must exist; exactly three pages required',()=>{
  const b=base();const r=demoRound(b,'start','');const first=commitRound(b,r);
  assert(!first.state.history.some(h=>h.event===r.plan[0]));
  r.pages[0].cast=['unknown'];assert.throws(()=>commitRound(b,r),/角色引用/);
  r.pages.pop();assert.throws(()=>commitRound(b,r),/三页/);
});
