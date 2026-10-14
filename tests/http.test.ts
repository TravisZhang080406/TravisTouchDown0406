import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sameOrigin,bodyJSON} from '../lib/http';
test('Same browser host accepted despite Next internal hostname; foreign origins rejected',()=>{
 assert.doesNotThrow(()=>sameOrigin(new Request('http://localhost:3000/api/story',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})));
 assert.throws(()=>sameOrigin(new Request('http://localhost:3000/api/story',{headers:{host:'127.0.0.1:3000',origin:'https://other.example'}})));
});
test('Body limits reject oversized data before parsing',async()=>{
 await assert.rejects(()=>bodyJSON(new Request('http://localhost/api',{method:'POST',body:'x'.repeat(17000)})),/过长/);
 assert.deepEqual(await bodyJSON(new Request('http://localhost/api',{method:'POST',body:'{"action":"start"}'})),{action:'start'});
});
