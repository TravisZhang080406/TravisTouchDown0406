import test from 'node:test';
import assert from 'node:assert/strict';
import { imageProgress } from '../lib/image-progress';
import type { Page } from '../lib/schema';
const pages=[{id:'old',imageStatus:'ready'},{id:'a',imageStatus:'pending'},{id:'b',imageStatus:'ready'},{id:'c',imageStatus:'error'}] as Page[];
test('current round progress excludes previous pages and failed images',()=>{assert.deepEqual(imageProgress(pages,['a','b','c']),{ready:1,failed:1,total:3,percent:33});});
test('text planning never claims images are ready',()=>{assert.equal(imageProgress(pages,null).percent,0);});
test('single image retry has its own progress total',()=>{assert.deepEqual(imageProgress(pages,['b']),{ready:1,failed:0,total:1,percent:100});});
test('out of order delivery keeps progress monotonic and reaches 100 only on success',()=>{const next=pages.map(p=>({...p,imageStatus:'ready' as const}));assert.equal(imageProgress(next,['a','b','c']).percent,100);assert.equal(imageProgress(pages,['a','b','c']).percent,33);});
