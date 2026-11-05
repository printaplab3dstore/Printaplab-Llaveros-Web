document.getElementById('studio').removeAttribute('inert');
window.addEventListener('error',e=>document.body.dataset.browserError=e.message);
setTimeout(()=>{try{
let check=(v,m)=>{if(!v)throw Error(m)};
check(!$('doubleSided').checked,'default off');check($('doubleOptions').hidden,'advanced face options initially hidden');$('colorFill').value='through';$('res').value='160';$('demo').click();
setTimeout(async()=>{try{
check(!!scene,'conversion');$('doubleSided').checked=true;$('doubleSided').onchange();check(scene.doubleSided,'toggle on');
let front=scene.map;$('flipFace').click();check(backView,'rear button');let rear=previewScene();check(rear.displayMap.every((v,i)=>v===front[Math.floor(i/scene.nx)*scene.nx+scene.nx-1-i%scene.nx]),'natural rear view');
is3=false;draw();is3=true;draw();heights[0]=1.2;refreshAppearance();check(!scene.backPreview,'rear cache invalidated before frame');draw();check(previewScene().hh[0]===qheight(1.2),'live height');
$('mode').value='flat';$('mode').onchange();draw();check(scene.flat,'flat');
let ms=meshes();check(ms.length>1,'color parts');let bytes=stl([unified()]);check(bytes.length>84,'STL');let mf=threeMF(ms);check(mf.size>0,'3MF');
$('doubleSided').checked=false;$('doubleSided').onchange();check(!scene.doubleSided,'toggle off');
$('doubleSided').checked=true;$('doubleSided').onchange();$('mode').value='relief';$('mode').onchange();$('flipFace').click();

// Asymmetric, connected two-color design; compare views, picking and actual exports in both modes.
W=8;H=6;labels=new Int16Array(W*H).fill(-1);pal=['#19a64b','#ffffff'];heights=[.4,1.2];
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x<2||y<2||(y===3&&x<6))labels[y*W+x]=(x===1||y===1)?1:0;
palette();$('baseSlot').value='custom';$('baseColor').value='#cc0000';$('doubleSided').checked=true;$('eye').checked=false;$('border').value='0';$('mode').value='relief';
window.testArtifacts={};
let encode=bytes=>{let value='';for(let i=0;i<bytes.length;i+=4096)value+=String.fromCharCode(...bytes.subarray(i,i+4096));return btoa(value)};
for(let distribution of ['through','skins'])for(let mirror of [false,true]){
 $('colorFill').value=distribution;
 $('mirrorBack').checked=mirror;rebuild();check(scene.mirrorBack===mirror,'mirror transition');check(!$('doubleOptions').hidden,'face options visible when enabled');check($('mode').disabled===(distribution==='skins'),'mode enabled only for full color');check($('modeOptions').hidden===(distribution==='skins'),'orientation group shown only when applicable');check($('skinLayers').disabled===(distribution!=='skins'),'skin control depends on distribution');check([...document.querySelectorAll('#palette input[type=number]')].every(e=>e.disabled===(distribution==='skins')),'height controls match distribution');
 if(!mirror)check(scene.map.every((v,i)=>v===scene.backMap[i]),'aligned model XY');
 for(let rearFace of [false,true]){
  backView=rearFace;is3=false;draw();let s=previewScene(),face=s.displayMap||s.map;
  for(let kind of [0,1]){
   let i=face.findIndex(v=>v===kind);check(i>=0,'face has both colors');let x=i%s.nx+.5,y=Math.floor(i/s.nx)+.5,r=cv.getBoundingClientRect(),h=s.hit;
   selectAt({clientX:r.left+(h.x+x*h.z)*r.width/cv.width,clientY:r.top+(h.y+y*h.z)*r.height/cv.height});check(selected===kind,'2D picking matches visible face');
  }
  is3=true;draw();s=previewScene();
  for(let kind of [0,1]){
   let i=face.findIndex(v=>v===kind),x=(i%s.nx+.5-s.nx/2)*s.step,y=(Math.floor(i/s.nx)+.5-s.ny/2)*s.step,l=s.layers.find(l=>l.kind===kind),r=cv.getBoundingClientRect(),{scale,co,si}=s.projection;
   let px=550+(x*co-y*si)*scale,py=400+(x*si+y*co)*tilt*scale-l.z*scale*2;
   selectAt({clientX:r.left+px*r.width/cv.width,clientY:r.top+py*r.height/cv.height});check(selected===kind,'3D picking matches visible face');
  }
 }
 let parts=meshes(),binary=stl([unified()]);check($('exportPalette').querySelector('b').textContent==='Filamentos a exportar: '+new Set(parts.map(m=>m.color.toUpperCase())).size,'displayed filament count matches export');check(binary.byteLength===84+new DataView(binary.buffer).getUint32(80,true)*50,'STL structure');
 window.testArtifacts[(distribution==='skins'?'skins-':'')+(mirror?'mirror':'aligned')]={stl:encode(binary),mf:encode(new Uint8Array(await threeMF(parts).arrayBuffer())),parts:encode(new Uint8Array(await zip(parts.map(m=>[m.name+'.stl',stl([m])])).arrayBuffer())),fixture:{distribution,skin:scene.skin,base:scene.base,nx:scene.nx,ny:scene.ny,step:scene.step,map:Array.from(scene.map),baseMask:Array.from(scene.baseMask),intervals:Array.from(scene.map,(_,i)=>doubleIntervals(scene,i))}};
}
$('doubleSided').checked=false;rebuild();check($('mirrorBack').disabled&&!scene.mirrorBack,'mirror disabled with single face');
$('mirrorBack').checked=false;$('colorFill').value='skins';$('doubleSided').checked=true;backView=false;rebuild();switchPanel('image');

let overflow=[...document.querySelectorAll('#studio button,#studio input,#studio select')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().right>innerWidth+2).map(e=>e.id);
check(!overflow.length,'control overflow: '+overflow);check(document.documentElement.scrollWidth<=innerWidth+2,'page overflow');
document.body.dataset.testResult='PASS';document.body.dataset.exportSizes=bytes.length+','+mf.size;
}catch(e){document.body.dataset.testResult='FAIL: '+e.message}},500);
}catch(e){document.body.dataset.testResult='FAIL: '+e.message}},100);
