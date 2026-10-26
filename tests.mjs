import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Worker} from 'node:worker_threads';
import {runRegex} from './dist/core.js';
import {languages,messages,catalog} from './dist/locales.js';
const run=(pattern,text,replacement='',flags='g')=>runRegex({pattern,text,replacement,flags});
const mail=run('(?<name>[a-z]+)@(?<domain>[a-z.]+)','a@b.test and c@d.test','$<name> [at] $<domain>');
assert.equal(mail.output,'a [at] b.test and c [at] d.test');assert.deepEqual(mail.matches.map(m=>m.index),[0,13]);assert.deepEqual(mail.matches[0].groups,['a','b.test']);
assert.equal(run('cat','cat cat','dog','').output,'dog cat');
assert.equal(run('cat','Cat cat','dog','gi').output,'dog dog');
assert.equal(run('^x','x\nx','z','gm').output,'z\nz');
assert.equal(run('a.b','a\nb','x','gs').output,'x');
assert.deepEqual(run('(?=.)','😀x','|','gu').matches.map(m=>m.index),[0,2]);
assert.equal(run('(?=.)','😀x','|','gu').output,'|😀|x');
assert.equal(run('a','aba','X','gy').output,'Xba');
assert.equal(run('z','abc','x').output,'abc');
assert.equal(run('$','abc','!').output,'abc!');
assert.equal(run('(a)(b)?','a','<$1>-$2-$10-$$-$&').output,'<a>--a0-$-a');
for(const replacement of ['$0','$01','$10','$99',"$`-$&-$'",'$<missing>','$$$&']){const text='pre ab post';assert.equal(run('(a)(b)',text,replacement).output,text.replace(/(a)(b)/g,replacement));}
assert.equal(run('(?<x>a)','a','$<missing>/$<x>').output,'/a');
const clip=run('a','a'.repeat(501),'x');assert.equal(clip.matches.length,500);assert.equal(clip.clipped,true);assert.equal(clip.output,'x'.repeat(500)+'a');
for(const [p,t,r,f,error]of [['','x','','g','emptyPattern'],['(','x','','g','invalidPattern'],['a','x','','gg','invalidFlags'],['a','x','','v','invalidFlags'],['a'.repeat(1001),'x','','g','patternLimit'],['a','x'.repeat(100001),'','g','textLimit'],['a','x','x'.repeat(2001),'g','replacementLimit'],['()'.repeat(51),'x','','g','captureLimit'],['(?=(.*))','a'.repeat(100000),'','g','captureSizeLimit'],['a','a'.repeat(300),'x'.repeat(2000),'g','outputLimit']])assert.throws(()=>run(p,t,r,f),new RegExp(error));
assert.equal(run('<script>','<script>alert(1)</script>','safe').output,'safealert(1)</script>');
for(const row of catalog)assert.equal(row.length,6);
for(const language of languages){const html=fs.readFileSync(language==='ko'?'dist/index.html':`dist/${language}/index.html`,'utf8');assert.ok(html.includes(`lang="${language}"`));assert.equal((html.match(/lang="(?:ko|en|es|zh|ja|de)"/g)||[]).length,7);assert.ok(html.includes('noindex,nofollow'));assert.deepEqual(Object.keys(messages[language]),Object.keys(messages.ko));if(language!=='ko'){assert.doesNotMatch(html.replace(/<nav[\s\S]*?<\/nav>/,''),/[가-힣]/);for(const text of Object.values(messages[language]))assert.doesNotMatch(text,/[가-힣]/);}}
console.log('PASS fixtures: captures, flags, Unicode zero-width, substitutions, limits, clipping and six languages.');
await new Promise((resolve,reject)=>{const worker=new Worker(new URL('./node-test-worker.mjs',import.meta.url));let settled=false;worker.on('error',reject);worker.on('message',()=>{settled=true;reject(new Error('Pathological pattern unexpectedly finished before timeout'));});const started=Date.now();worker.postMessage({pattern:'^(a+)+$',text:'a'.repeat(40)+'!',flags:'g',replacement:''});setTimeout(async()=>{if(settled)return;await worker.terminate();assert.ok(Date.now()-started<3000);console.log('PASS pathological pattern: worker terminated at 1 second; main thread stayed responsive.');resolve();},1000);});
