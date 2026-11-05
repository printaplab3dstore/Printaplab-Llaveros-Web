"""Check actual browser-generated STL, per-color ZIP and 3MF using only stdlib."""
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
from collections import Counter
import json, math, struct
ROOT=Path(__file__).parent
NS={'m':'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'}
def stl(raw):
    count=struct.unpack_from('<I',raw,80)[0]
    assert len(raw)==84+50*count
    return [tuple(tuple(struct.unpack_from('<fff',raw,84+50*i+12+12*j)) for j in range(3)) for i in range(count)]
def volume(tris):
    return sum(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]) for a,b,c in tris)/6

def hits(tris,x,y):
    found=[]
    for a,b,c in tris:
        den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(den)<1e-10: continue
        u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den
        v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den
        if u>=-1e-8 and v>=-1e-8 and u+v<=1+1e-8: found.append(u*a[2]+v*b[2]+(1-u-v)*c[2])
    found.sort()
    return [v for i,v in enumerate(found) if not i or abs(v-found[i-1])>1e-5]

def approx(a,b):
    assert len(a)==len(b),(a,b)
    assert all(abs(x-y)<1e-4 for x,y in zip(a,b)),(a,b)

for mode in ['aligned','mirror']:
    fixture=json.loads((ROOT/f'{mode}-fixture.json').read_text())
    whole=stl((ROOT/f'{mode}.stl').read_bytes())
    with ZipFile(ROOT/f'{mode}.3mf') as z:
        model=ET.fromstring(z.read('3D/3dmodel.model'))
        meshes={}
        for obj in model.findall('m:resources/m:object',NS):
            mesh=obj.find('m:mesh',NS)
            if mesh is None: continue
            vertices=[tuple(float(v.attrib[k]) for k in ['x','y','z']) for v in mesh.findall('m:vertices/m:vertex',NS)]
            meshes[obj.attrib['name']]=[tuple(vertices[int(t.attrib[k])] for k in ['v1','v2','v3']) for t in mesh.findall('m:triangles/m:triangle',NS)]
    with ZipFile(ROOT/f'{mode}-parts.zip') as z:
        assert sorted(z.namelist())==sorted(name+'.stl' for name in meshes)
        for name,tris in meshes.items():
            binary=stl(z.read(name+'.stl'))
            assert len(binary)==len(tris)
            for a,b in zip(binary,tris):
                for p,q in zip(a,b): approx(p,q)
    # All triangles must have a finite, non-zero area, including quantized Z transitions.
    for tris in [whole,*meshes.values()]:
        for a,b,c in tris:
            u=[b[i]-a[i] for i in range(3)]; v=[c[i]-a[i] for i in range(3)]
            area=math.sqrt(sum(n*n for n in [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]))
            assert math.isfinite(area) and area>1e-8
    assert abs(sum(volume(t) for t in meshes.values())-volume(whole))<.01
    suspended=0
    for i,segments in enumerate(fixture['intervals']):
        x=(i%fixture['nx']+.5)*fixture['step'];y=(fixture['ny']-i//fixture['nx']-.5)*fixture['step']
        expected=[] if not segments else [segments[0]['lo'],segments[-1]['hi']]
        approx(hits(whole,x,y),expected)
        if segments and segments[0]['lo']>1e-6: suspended+=1
        for name,tris in meshes.items():
            kind=int(name.split(' ')[-1])-1 if name.startswith('Color ') else -2 if name=='Ojal' else -1
            selected=[s for s in segments if s['kind']==kind]
            merged=[]
            for s in selected:
                if merged and abs(merged[-1]-s['lo'])<1e-6: merged[-1]=s['hi']
                else: merged.extend([s['lo'],s['hi']])
            approx(hits(tris,x,y),merged)
    if mode=='aligned': assert suspended==0
    else: assert suspended>0 # Explicitly retained behavior: the mirror option can require support.
    print(f'OK {mode}: real STL/3MF/ZIP match; all XY sections match; {suspended} columns begin above bed')
