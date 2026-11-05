document.getElementById('studio').removeAttribute('inert');
window.addEventListener('error',e=>document.body.dataset.browserError=e.message);
setTimeout(()=>{try{
let check=(v,m)=>{if(!v)throw Error(m)};
check(!$('doubleSided').checked,'default off');$('res').value='160';$('demo').click();
setTimeout(()=>{try{
check(!!scene,'conversion');$('doubleSided').checked=true;$('doubleSided').onchange();check(scene.doubleSided,'toggle on');
let front=scene.map;$('flipFace').click();check(backView,'rear button');let rear=previewScene();check(rear.map.every((v,i)=>v===front[i]),'rear readable orientation');
is3=false;draw();is3=true;draw();heights[0]=1.2;refreshAppearance();check(!scene.backPreview,'rear cache invalidated before frame');draw();check(previewScene().hh[0]===qheight(1.2),'live height');
$('mode').value='flat';$('mode').onchange();draw();check(scene.flat,'flat');
let ms=meshes();check(ms.length>1,'color parts');let bytes=stl([unified()]);check(bytes.length>84,'STL');let mf=threeMF(ms);check(mf.size>0,'3MF');
$('doubleSided').checked=false;$('doubleSided').onchange();check(!scene.doubleSided,'toggle off');
$('doubleSided').checked=true;$('doubleSided').onchange();$('mode').value='relief';$('mode').onchange();$('flipFace').click();
let overflow=[...document.querySelectorAll('#studio button,#studio input,#studio select')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().right>innerWidth+2).map(e=>e.id);
check(!overflow.length,'control overflow: '+overflow);check(document.documentElement.scrollWidth<=innerWidth+2,'page overflow');
document.body.dataset.testResult='PASS';document.body.dataset.exportSizes=bytes.length+','+mf.size;
}catch(e){document.body.dataset.testResult='FAIL: '+e.message}},500);
}catch(e){document.body.dataset.testResult='FAIL: '+e.message}},100);
