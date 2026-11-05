const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const main=html.slice(html.indexOf("'use strict';"),html.indexOf('</script>',html.indexOf("'use strict';")));
new vm.Script(main);
const values={contourSmooth:'0',width:'60',border:'0',hole:'4',wall:'2',attachType:'hook',tabLength:'8',baseSlot:'custom',baseColor:'#151515',base:'2',mode:'relief',layer:'0.2',pos:'top'};
const els=new Proxy({}, {get:(o,k)=>o[k]??=( {value:values[k],checked:false,textContent:''})});
const c=vm.createContext({console,els,assert});
vm.runInContext(`const $=id=>els[id],num=id=>Number($(id).value);let scene,pal=['#ff0000','#00ff00'],heights=[.4,.8],labels,W,H;function qheight(v){let l=num('layer');return Math.max(l,Math.round(v/l)*l)}function draw(){}function exportPalette(){};`,c);
for(const [start,end] of [['function rebuild(){','function previewScene(){'],['function contourGrid(s){','$(\'contourSmooth\').onchange'],['function doubleColumn(s,i){','function meshFor(kind){'],['function meshFor(kind){',"$('baseColor').onchange"],['function unified(){',"$('stl').onclick"]])vm.runInContext(main.slice(main.indexOf(start),main.indexOf(end,main.indexOf(start))),c);
vm.runInContext(`
function volume(m){let v=0;for(let t of m.tris){let [a,b,c]=t.map(i=>m.verts[i]);v+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6}return v}
function closed(m){let edges=new Map();for(let t of m.tris)for(let j=0;j<3;j++){let a=t[j],b=t[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(',');edges.set(key,(edges.get(key)||0)+(a<b?1:-1))}assert.ok([...edges.values()].every(n=>n===0),'oriented closed surface')}
// Sample the actual exported triangles, independently of the column generator.
function intersections(m,px,py){let hits=[];for(let t of m.tris){let [a,b,c]=t.map(i=>m.verts[i]),den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-10)continue;let u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den,v=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)hits.push(u*a[2]+v*b[2]+(1-u-v)*c[2])}hits.sort((a,b)=>a-b);return hits.filter((v,i)=>!i||Math.abs(v-hits[i-1])>1e-7)}
function sampleAligned(){let whole=unified(),parts=[-1,-2,0,1].map(k=>meshFor(k));closed(whole);parts.forEach(closed);assert.ok(Math.abs(parts.reduce((n,m)=>n+volume(m),0)-volume(whole))<1e-6);for(let y=0;y<scene.ny;y++)for(let x=0;x<scene.nx;x++){let i=y*scene.nx+x,c=doubleColumn(scene,i),px=(x+.5)*scene.step,py=(scene.ny-y-.5)*scene.step,hits=intersections(whole,px,py);if(!scene.baseMask[i]){assert.equal(hits.length,0);continue}assert.equal(hits.length,2,'one continuous vertical interval');assert.ok(Math.abs(hits[0])<1e-8,'starts on bed');assert.ok(Math.abs(hits[1]-c.top)<1e-7);let material=meshFor(c.kind);let colorHits=intersections(material,px,py);assert.equal(colorHits.length,2);assert.ok(Math.abs(colorHits[0])<1e-8,'color reaches bed');assert.ok(Math.abs(colorHits[1]-c.top)<1e-7)}return whole}
W=4;H=3;labels=new Int16Array([0,0,1,-1,0,1,1,-1,0,0,-1,-1]);
rebuild();assert.equal(scene.doubleSided,false);assert.equal($('mirrorBack').disabled,true);let originalMask=new Uint8Array(scene.baseMask),originalMap=new Int16Array(scene.map);
$('doubleSided').checked=true;rebuild();assert.equal(scene.mirrorBack,false);assert.equal($('mirrorBack').disabled,false);assert.deepEqual(scene.baseMask,originalMask);assert.deepEqual(scene.map,originalMap);assert.deepEqual(scene.backMap,scene.map);
let m=sampleAligned();assert.ok(Math.abs(Math.max(...m.verts.map(v=>v[2]))-3.6)<1e-9);
// The footprint at every higher layer is contained in the preceding layer: no newly floating regions.
for(let i=0;i<scene.map.length;i++){let intervals=doubleIntervals(scene,i);if(intervals.length){assert.equal(intervals.length,1);assert.equal(intervals[0].lo,0)}}
$('mode').value='flat';rebuild();m=sampleAligned();assert.ok(Math.abs(Math.max(...m.verts.map(v=>v[2]))-2.8)<1e-9);
// Explicit mirror mode preserves the old optional geometry, including its support requirement.
$('mirrorBack').checked=true;$('mode').value='relief';rebuild();assert.equal(scene.mirrorBack,true);let shifted=false,suspended=false;for(let y=0;y<scene.ny;y++)for(let x=0;x<scene.nx;x++){let i=y*scene.nx+x;assert.equal(scene.backMap[i],scene.map[y*scene.nx+scene.nx-1-x]);if(scene.backMap[i]!==scene.map[i])shifted=true;let segments=doubleIntervals(scene,i);if(segments.length&&segments[0].lo>1e-8)suspended=true}assert.ok(shifted);assert.ok(suspended,'test demonstrates why mirror mode may need supports');closed(unified());
$('doubleSided').checked=false;rebuild();assert.equal(scene.mirrorBack,false);assert.equal($('mirrorBack').disabled,true);assert.deepEqual(scene.baseMask,originalMask);
$('mirrorBack').checked=false;$('doubleSided').checked=true;rebuild();assert.deepEqual(scene.baseMask,originalMask);sampleAligned();
// Unequal heights and non-default layer quantization must not suspend a shorter region.
$('layer').value='0.16';heights=[.32,1.12];$('border').value='2';rebuild();sampleAligned();
$('contourSmooth').value='5';rebuild();sampleAligned();for(let layer of ['0.12','0.16','0.2','0.28']){$('layer').value=layer;rebuild();sampleAligned();}
W=12;H=10;labels=new Int16Array(W*H);$('eye').checked=true;$('attachType').value='hole';rebuild();assert.equal(scene.attachmentWarning,'');assert.ok(scene.ring);for(let i=0;i<scene.map.length;i++)if(!scene.baseMask[i])assert.equal(scene.map[i],-1);sampleAligned();
// Every attachment column also starts on Z=0, for short and full-height attachments.
for(let type of ['hook','bookmark'])for(let full of [false,true])for(let pos of ['top','bottom','left','right']){$('attachType').value=type;$('eyeFull').checked=full;$('pos').value=pos;rebuild();assert.equal(scene.attachmentWarning,'');closed(unified());for(let i=0;i<scene.map.length;i++){let intervals=doubleIntervals(scene,i);if(intervals.length)assert.equal(intervals[0].lo,0)}}
$('doubleSided').checked=false;rebuild();assert.equal(scene.doubleSided,false);assert.equal(scene.base,qheight(2));
console.log('OK: aligned XY, continuous colors from Z=0, actual mesh cross-sections, optional mirror, transitions, volumes, closed surfaces, flat/relief, layer quantization, holes and attachments');
`,c);

