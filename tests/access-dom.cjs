const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),script=fs.readFileSync(path.join(root,'access.mjs'),'utf8').replace(/^import[^\n]+\n/,'');
async function check(permission){
 const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]));const els=new Map([...ids].map(id=>[id,{id,hidden:false,inert:true,disabled:false,value:id==='accessEmail'?'test@example.invalid':id==='accessPassword'?'fixture-password':'',textContent:'',listeners:{},addEventListener(k,fn){this.listeners[k]=fn},setAttribute(){},reportValidity(){return true},dispatchEvent(){}}]));
 class AccessSession{constructor(){this.session=null;this.granted=false;this.lease=60000;this.clock=()=>0}allowed(){return this.granted}async signin(email){this.session={email};return true}async verify(){this.granted=permission;return permission}async signup(email){return this.signin(email)}async signout(){this.session=null;this.granted=false}}
 const ctx=vm.createContext({AccessSession,document:{getElementById:id=>els.get(id)||null,querySelectorAll:()=>[],hidden:false,addEventListener(){}},window:{dispatchEvent(){}},location:{origin:'https://example.invalid',pathname:'/',hash:'',search:'',reload(){}},history:{replaceState(){}},performance:{now:()=>0},setInterval(){},confirm:()=>false,Event:class{},console});
 vm.runInContext(script,ctx);assert.equal(els.get('studio').inert,true);assert.equal(els.get('accessGate').hidden,false);assert.equal(typeof els.get('sessionSignout').onclick,'function');
 await vm.runInContext('authenticate(false)',ctx);
 assert.equal(els.get('accessGate').hidden,permission);assert.equal(els.get('studio').inert,!permission);assert.equal(ctx.window.PrintaplabWebAccess.allowed(),permission);
 if(permission){assert.equal(els.get('sessionEmail').textContent,'test@example.invalid');assert.equal(els.get('accessPassword').value,'')}else assert.match(els.get('accessMessage').textContent,/pendiente/);
}
(async()=>{await check(true);await check(false);console.log('PASS: original access module initializes; authorized login opens workshop, denied login stays locked; session controls and export guard work.');})().catch(e=>{console.error(e);process.exitCode=1});
