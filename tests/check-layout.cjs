require('./build-browser-fixture.cjs');
const {spawn}=require('child_process'),fs=require('fs'),p=require('path');
(async()=>{
const child=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--allow-file-access-from-files','--no-first-run','--remote-debugging-port=9331','--user-data-dir='+p.resolve('tests/cdp-profile'),'about:blank'],{stdio:'ignore'});
try{
let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9331/json')).json();break}catch{await new Promise(r=>setTimeout(r,200))}}
let ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0,pending=new Map();ws.onmessage=e=>{let m=JSON.parse(e.data);if(m.id){let cb=pending.get(m.id);pending.delete(m.id);m.error?cb.reject(m.error):cb.resolve(m.result)}};
let call=(method,params={})=>new Promise((resolve,reject)=>{let n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
await call('Page.enable');
for(let [name,width,height] of [['desktop',1440,1080],['mobile',390,844],['small',320,740]]){
await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await call('Page.navigate',{url:'file:///'+p.resolve('tests/browser-check.html').replaceAll('\\','/')});
let result;for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,150));result=(await call('Runtime.evaluate',{expression:'JSON.stringify({result:document.body.dataset.testResult,error:document.body.dataset.browserError,width:innerWidth,scroll:document.documentElement.scrollWidth})',returnByValue:true})).result.value;if(result&&JSON.parse(result).result)break}
console.log(name,result);await call('Runtime.evaluate',{expression:'scrollTo(0,0)'});await new Promise(r=>setTimeout(r,100));let shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('tests/'+name+'.png',Buffer.from(shot.data,'base64'));
if(!result||JSON.parse(result).result!=='PASS')throw Error(name+': '+result);
if(name==='desktop'){let artifacts=(await call('Runtime.evaluate',{expression:'JSON.stringify(window.testArtifacts)',returnByValue:true})).result.value;artifacts=JSON.parse(artifacts);for(let [mode,a]of Object.entries(artifacts)){fs.writeFileSync('tests/'+mode+'.stl',Buffer.from(a.stl,'base64'));fs.writeFileSync('tests/'+mode+'.3mf',Buffer.from(a.mf,'base64'));fs.writeFileSync('tests/'+mode+'-parts.zip',Buffer.from(a.parts,'base64'));fs.writeFileSync('tests/'+mode+'-fixture.json',JSON.stringify(a.fixture));}}
await call('Runtime.evaluate',{expression:"document.getElementById('panel-image').scrollIntoView();"});shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('tests/'+name+'-settings.png',Buffer.from(shot.data,'base64'));
await call('Runtime.evaluate',{expression:"document.getElementById('fixtureAccessStyle').sheet.disabled=true;scrollTo(0,0);"});await new Promise(r=>setTimeout(r,100));shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync('tests/'+name+'-login.png',Buffer.from(shot.data,'base64'));
}
await call('Browser.close');
}catch(e){child.kill();console.error(e);process.exitCode=1}
})();
