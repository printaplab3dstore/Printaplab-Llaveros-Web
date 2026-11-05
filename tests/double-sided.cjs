const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const main=html.slice(html.indexOf("'use strict';"),html.indexOf('</script>',html.indexOf("'use strict';")));
new vm.Script(main);
const values={contourSmooth:'0',width:'60',border:'0',hole:'4',wall:'2',attachType:'hook',tabLength:'8',baseSlot:'custom',baseColor:'#151515',base:'2',mode:'relief',layer:'0.2',pos:'top'};
const els=new Proxy({}, {get:(o,k)=>o[k]??=( {value:values[k],checked:false,textContent:''})});
const c=vm.createContext({console,els,assert});
vm.runInContext(`const $=id=>els[id],num=id=>Number($(id).value);let scene,pal=['#ff0000','#00ff00'],heights=[.4,.8],labels,W,H;function qheight(v){let l=num('layer');return Math.max(l,Math.round(v/l)*l)}function draw(){}function exportPalette(){};`,c);
for(const [start,end] of [['function rebuild(){','function previewScene(){'],['function contourGrid(s){','$(\'contourSmooth\').onchange'],['function doubleMesh(kind){','function meshFor(kind){'],['function meshFor(kind){',"$('baseColor').onchange"],['function unified(){',"$('stl').onclick"]])vm.runInContext(main.slice(main.indexOf(start),main.indexOf(end,main.indexOf(start))),c);
vm.runInContext(`
function volume(m){let v=0;for(let t of m.tris){let [a,b,c]=t.map(i=>m.verts[i]);v+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6}return v}
function closed(m){let edges=new Map();for(let t of m.tris)for(let j=0;j<3;j++){let a=t[j],b=t[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(',');edges.set(key,(edges.get(key)||0)+(a<b?1:-1))}assert.ok([...edges.values()].every(n=>n===0),'oriented closed surface')}
// Asymmetric color pattern: rear X reflection must reproduce the source when viewed from behind.
W=3;H=2;labels=new Int16Array([0,0,1,0,1,1]);
rebuild();let single=unified(),singleVolume=volume(single);assert.equal(scene.doubleSided,false);assert.equal(Math.max(...single.verts.map(v=>v[2])),2.8);
$('doubleSided').checked=true;rebuild();assert.equal(scene.doubleSided,true);
for(let y=0;y<scene.ny;y++)for(let x=0;x<scene.nx;x++)assert.equal(scene.backMap[y*scene.nx+x],scene.map[y*scene.nx+scene.nx-1-x]);
let m=unified();closed(m);assert.ok(Math.abs(volume(m)- (singleVolume+3*.4*400+3*.8*400))<1e-6);assert.ok(Math.abs(Math.max(...m.verts.map(v=>v[2]))-3.6)<1e-9);assert.equal(Math.min(...m.verts.map(v=>v[2])),0);
let parts=[meshFor(-1),meshFor(0),meshFor(1)];parts.forEach(closed);assert.ok(Math.abs(parts.reduce((n,p)=>n+volume(p),0)-volume(m))<1e-6);
// An asymmetric silhouette requires the union of both outlines, without losing rear pixels.
labels=new Int16Array([0,-1,1,0,-1,-1]);rebuild();for(let y=0;y<scene.ny;y++)for(let x=0;x<scene.nx;x++){let i=y*scene.nx+x;if(scene.map[i]>=0||scene.backMap[i]>=0)assert.equal(scene.baseMask[i],1)}closed(unified());
$('mode').value='flat';rebuild();m=unified();closed(m);assert.equal(Math.max(...m.verts.map(v=>v[2])),2.8);assert.ok(volume(m)>0);
W=30;H=20;labels=new Int16Array(W*H);$('eye').checked=true;$('attachType').value='hole';rebuild();assert.equal(scene.attachmentWarning,'');assert.ok(scene.ring);for(let i=0;i<scene.map.length;i++)if(!scene.baseMask[i]){assert.equal(scene.map[i],-1);assert.equal(scene.backMap[i],-1)}
$('contourSmooth').value='5';closed(unified());
for(let type of ['hook','bookmark'])for(let full of [false,true])for(let pos of ['top','bottom','left','right']){$('attachType').value=type;$('eyeFull').checked=full;$('pos').value=pos;rebuild();assert.equal(scene.attachmentWarning,'');closed(unified());}
$('layer').value='0.16';rebuild();closed(unified());

$('doubleSided').checked=false;rebuild();assert.equal(scene.doubleSided,false);assert.equal(scene.base,qheight(2));
console.log('OK: syntax, optional toggle, rear orientation, thickness, volume, closed meshes, parts, flat mode, hole and smoothing');
`,c);

