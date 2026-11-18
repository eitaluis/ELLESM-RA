// ============================================================================
// 5. TERRENO
// ============================================================================
const TERR_W = 3200, TERR_H = 3200, segs = 800;
const terrenoGeo = new THREE.PlaneGeometry(TERR_W, TERR_H, segs, segs);
terrenoGeo.rotateX(-Math.PI/2);

const posAttr = terrenoGeo.attributes.position;
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i), z = posAttr.getZ(i);
  posAttr.setY(i, alturaTerreno(x, z));
}
terrenoGeo.computeVertexNormals();

const corTerreno = new THREE.Color();
const cores = new Float32Array(posAttr.count * 3);
for (let i = 0; i < posAttr.count; i++) {
  const x = posAttr.getX(i), z = posAttr.getZ(i);
  const n = fbm(x*0.03, z*0.03, 3);
  const damp = fbm(x*0.008+71, z*0.008-29, 4);
  const soil = fbm(x*0.075, z*0.075, 3);
  const mossTone=fbm(x*.018+91,z*.018-47,3);
  const needleTone=fbm(x*.062-33,z*.062+12,3);
  const exposedSoil=fbm(x*.11+17,z*.11-26,2);
  corTerreno.setHSL(0.205+mossTone*.07+needleTone*.012,
    0.20+soil*.10+mossTone*.08,
    0.155+n*.055+damp*.035+exposedSoil*.035);
  cores[i*3] = corTerreno.r; cores[i*3+1] = corTerreno.g; cores[i*3+2] = corTerreno.b;
}
terrenoGeo.setAttribute('color', new THREE.BufferAttribute(cores, 3));

function criarTexturaSolo(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#40382b';ctx.fillRect(0,0,1024,1024);
  // Grandes manchas de húmus, argila escura e musgo, com bordas suaves e irregulares.
  const manchas=[
    'rgba(74,78,43,0.42)','rgba(93,72,47,0.46)','rgba(42,54,31,0.48)',
    'rgba(109,91,60,0.32)','rgba(57,67,42,0.38)','rgba(32,38,27,0.42)'
  ];
  for(let i=0;i<780;i++){
    const x=Math.random()*1024,y=Math.random()*1024,rx=8+Math.random()*78,ry=5+Math.random()*42;
    const g=ctx.createRadialGradient(x,y,1,x,y,Math.max(rx,ry));
    const col=manchas[Math.floor(Math.random()*manchas.length)];
    g.addColorStop(0,col);g.addColorStop(.62,col.replace(/0\.[0-9]+\)/,'0.16)'));g.addColorStop(1,'rgba(35,34,25,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,Math.random()*Math.PI,0,Math.PI*2);ctx.fill();
  }
  // Grãos de terra, agulhas de pinheiro e folhinhas quebradas.
  for(let i=0;i<46000;i++){
    const x=Math.random()*1024,y=Math.random()*1024;
    ctx.fillStyle=Math.random()<.52?'rgba(25,29,21,0.34)':'rgba(150,119,75,0.23)';
    ctx.fillRect(x,y,.5+Math.random()*2.1,.5+Math.random()*1.5);
  }
  for(let i=0;i<17000;i++){
    const x=Math.random()*1024,y=Math.random()*1024,a=Math.random()*Math.PI*2,len=2+Math.random()*21;
    ctx.strokeStyle=Math.random()<.55?'rgba(29,34,23,0.56)':'rgba(138,111,70,0.48)';
    ctx.lineWidth=.35+Math.random()*.9;ctx.beginPath();ctx.moveTo(x,y);
    ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();
  }
  const tex=new THREE.CanvasTexture(canvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(44,44);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;return tex;
}
const TEX_SOLO=criarTexturaSolo();
const terrenoMat = new THREE.MeshStandardMaterial({ map:TEX_SOLO, vertexColors:true, roughness:1.0 });
const terreno = new THREE.Mesh(terrenoGeo, terrenoMat);
terreno.receiveShadow = true;
scene.add(terreno);

// ============================================================================
// 6. CLAREIRAS
// ============================================================================
// Clareiras orgânicas: bordas assimétricas e superfície acompanhando o relevo.
const clareiraMat = new THREE.MeshStandardMaterial({ color: 0x465238, roughness: 1.0, transparent: true, opacity: 0.20, side: THREE.DoubleSide });
for (const p of PONTOS) {
  if (p.raio === 0 || p.raio < 8) continue;
  const radial=72, positions=[p.x,alturaTerreno(p.x,p.z)+0.035,p.z], indices=[];
  const phase=hash2(p.x+19,p.z-31)*Math.PI*2;
  for(let i=0;i<radial;i++){
    const a=i/radial*Math.PI*2,wobble=0.88+0.09*Math.sin(a*3+phase)+0.055*Math.sin(a*7-phase*1.7)+0.035*Math.sin(a*11+phase);
    const rr=p.raio*wobble,x=p.x+Math.cos(a)*rr,z=p.z+Math.sin(a)*rr;
    positions.push(x,alturaTerreno(x,z)+0.04,z);
    if(i<radial-1)indices.push(0,i+1,i+2);
  }
  indices.push(0,radial,1);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,clareiraMat);m.receiveShadow=true;scene.add(m);
}

// ============================================================================
// 7. CAMINHOS
// ============================================================================
const caminhoMat = new THREE.MeshStandardMaterial({ color: 0x6a5a42, roughness: 1.0 });
const CURVAS_CAMINHOS = [];

function criarCaminho(pontosXZ, larguraBase = 1.8) {
  const vecs = pontosXZ.map(([x,z]) => new THREE.Vector3(x, 0, z));
  const curva = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.5);
  CURVAS_CAMINHOS.push(curva);
  const N = Math.max(30, Math.floor(curva.getLength() / 2));
  const pts = curva.getPoints(N);
  const posArr = [], idxArr = [];
  const up = new THREE.Vector3(0,1,0);

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const tangente = i < pts.length-1 ? pts[i+1].clone().sub(p).normalize() : p.clone().sub(pts[i-1]).normalize();
    const lateral = new THREE.Vector3().crossVectors(tangente, up).normalize();
    const wob = (fbm(p.x*0.08, p.z*0.08, 3) - 0.5) * 0.9;
    const half = larguraBase*0.5 + wob;
    const jitter = (fbm(p.x*0.5, p.z*0.5, 2) - 0.5) * 0.4;
    const y = alturaTerreno(p.x, p.z) + 0.06;
    posArr.push(p.x - lateral.x*half + jitter, y, p.z - lateral.z*half + jitter);
    posArr.push(p.x + lateral.x*half - jitter, y, p.z + lateral.z*half - jitter);
    if (i < pts.length - 1) {
      const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;
      idxArr.push(a,b,c, b,d,c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  g.setIndex(idxArr);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, caminhoMat);
  mesh.receiveShadow = true;
  scene.add(mesh);

  const nPedras = Math.floor(curva.getLength() / 6);
  for (let i = 0; i < nPedras; i++) {
    const t = i / nPedras;
    const pt = curva.getPointAt(t);
    const tang = curva.getTangentAt(t);
    const lat = new THREE.Vector3().crossVectors(tang, up).normalize();
    const side = Math.random() < 0.5 ? -1 : 1;
    const offset = (larguraBase*0.5 + 0.3 + Math.random()*0.8) * side;
    const px = pt.x + lat.x*offset, pz = pt.z + lat.z*offset;
    const py = alturaTerreno(px, pz);
    const geo = new THREE.DodecahedronGeometry(0.12 + Math.random()*0.18, 0);
    const pp = geo.attributes.position;
    for (let v = 0; v < pp.count; v++) {
      pp.setXYZ(v, pp.getX(v)*(0.7+Math.random()*0.6), pp.getY(v)*0.5, pp.getZ(v)*(0.7+Math.random()*0.6));
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({
      color: Math.random() < 0.15 ? 0x2e6b4a : 0x7a7568,
      roughness: 0.9, emissive: Math.random() < 0.15 ? 0x0a2a15 : 0x000000
    });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(px, py + 0.05, pz);
    p.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
    scene.add(p);
  }
  return curva;
}

criarCaminho([[850,-60],[700,-60],[600,-60],[530,-60],[490,-55],[450,-60],[425,-58],[400,-60],[360,-55],[320,-50],[280,-45],[250,-40],[200,-30],[150,-15],[100,-8],[50,-3],[0,0]], 1.8);
criarCaminho([[0,0],[60,30],[120,70],[160,30],[200,-80],[200,-160]], 1.6);
criarCaminho([[0,0],[-80,-60],[-180,-130],[-260,-180],[-300,-200]], 1.6);
criarCaminho([[-300,-200],[-280,-120],[-240,-40],[-180,100],[-180,220]], 1.6);
criarCaminho([[-180,220],[-240,300],[-300,400],[-360,480],[-380,520]], 1.6);
criarCaminho([[-380,520],[-460,400],[-540,220],[-600,140],[-600,60]], 1.6);
criarCaminho([[-1100,0],[-1120,200],[-1125,500],[-1128,800],[-1130,1100],[-1130,1200]], 1.4);
criarCaminho([[-1130,1200],[-1090,1215],[-1050,1230]], 1.2);

// ============================================================================
// 8. RIACHO
// ============================================================================
const riachoMat = new THREE.MeshStandardMaterial({
  color: 0x3a6a8a, roughness: 0.15, metalness: 0.2,
  transparent: true, opacity: 0.82, emissive: 0x081420
});
let CURVA_RIACHO = null;

function criarRiacho(pontosXZ, larguraBase = 2.5) {
  const vecs = pontosXZ.map(([x,z]) => new THREE.Vector3(x, 0, z));
  const curva = new THREE.CatmullRomCurve3(vecs, false, 'catmullrom', 0.5);
  CURVA_RIACHO = curva;
  const N = Math.max(50, Math.floor(curva.getLength() / 1.5));
  const pts = curva.getPoints(N);
  const posArr = [], idxArr = [];
  const up = new THREE.Vector3(0,1,0);

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const tangente = i < pts.length-1 ? pts[i+1].clone().sub(p).normalize() : p.clone().sub(pts[i-1]).normalize();
    const lateral = new THREE.Vector3().crossVectors(tangente, up).normalize();
    const wob = (fbm(p.x*0.15, p.z*0.15, 3) - 0.5) * 1.2;
    const half = larguraBase*0.5 + wob;
    const jitter = (fbm(p.x*0.7, p.z*0.7, 2) - 0.5) * 0.3;
    const y = alturaTerreno(p.x, p.z) + 0.05;
    posArr.push(p.x - lateral.x*half + jitter, y, p.z - lateral.z*half + jitter);
    posArr.push(p.x + lateral.x*half - jitter, y, p.z + lateral.z*half - jitter);
    if (i < pts.length - 1) {
      const a=i*2,b=i*2+1,c=i*2+2,d=i*2+3;
      idxArr.push(a,b,c, b,d,c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  g.setIndex(idxArr);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, riachoMat);
  mesh.receiveShadow = true;
  scene.add(mesh);

  for (let i = 0; i < Math.floor(curva.getLength() / 4); i++) {
    const t = i / Math.floor(curva.getLength() / 4);
    const pt = curva.getPointAt(t);
    const tang = curva.getTangentAt(t);
    const lat = new THREE.Vector3().crossVectors(tang, up).normalize();
    const side = Math.random() < 0.5 ? -1 : 1;
    const off = (larguraBase*0.5 + 0.2 + Math.random()*0.5) * side;
    const px = pt.x + lat.x*off, pz = pt.z + lat.z*off;
    const py = alturaTerreno(px, pz);
    const geo = new THREE.DodecahedronGeometry(0.15 + Math.random()*0.3, 0);
    const pp = geo.attributes.position;
    for (let v = 0; v < pp.count; v++) {
      pp.setXYZ(v, pp.getX(v)*(0.7+Math.random()*0.5), pp.getY(v)*0.5, pp.getZ(v)*(0.7+Math.random()*0.5));
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0x5a5a55, roughness: 0.95 });
    const p = new THREE.Mesh(geo, mat);
    p.position.set(px, py + 0.08, pz);
    p.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3);
    scene.add(p);
  }
  return curva;
}

criarRiacho([[300,-400],[320,-250],[340,-150],[355,-80],[360,-40],[355,20],[340,80],[320,160],[300,260],[280,380],[270,500]], 2.5);

// ============================================================================
// 9. PENHASCO
// ============================================================================
const penhascoGrupo = new THREE.Group();
const rochaMat = new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: 0.9, flatShading: true });

const paredeGeo = new THREE.PlaneGeometry(2400, 300, 90, 30);
const paredePos = paredeGeo.attributes.position;
for (let i = 0; i < paredePos.count; i++) {
  const x = paredePos.getX(i), y = paredePos.getY(i);
  const n = Math.sin(x*0.02)*Math.cos(y*0.05)*3.0
          + Math.sin(x*0.07+y*0.11)*1.2
          + (fbm(x*0.05, y*0.08, 3) - 0.5) * 2.0;
  paredePos.setZ(i, n);
}
paredeGeo.computeVertexNormals();
const parede = new THREE.Mesh(paredeGeo, rochaMat);
parede.rotation.y = -Math.PI/2;
parede.position.set(-1150, -150, 0);
parede.receiveShadow = true; parede.castShadow = true;
penhascoGrupo.add(parede);

const topoGeo = new THREE.PlaneGeometry(300, 2400, 30, 60);
topoGeo.rotateX(-Math.PI/2);
const topoPos = topoGeo.attributes.position;
for (let i = 0; i < topoPos.count; i++) {
  const x = topoPos.getX(i), z = topoPos.getZ(i);
  topoPos.setY(i, fbm(x*0.02, z*0.02, 4)*2.5);
}
topoGeo.computeVertexNormals();
const topoMat = new THREE.MeshStandardMaterial({ color: 0x3a4a28, roughness: 1.0 });
const topo = new THREE.Mesh(topoGeo, topoMat);
topo.position.set(-1300, 0.02, 0);
topo.receiveShadow = true;
penhascoGrupo.add(topo);
scene.add(penhascoGrupo);

for (let i = 0; i < 3; i++) {
  const nevoaGeo = new THREE.PlaneGeometry(2400, 400);
  const nevoaMat = new THREE.MeshBasicMaterial({ color: 0x9fb8c8, transparent: true, opacity: 0.25 - i*0.06, depthWrite: false, side: THREE.DoubleSide });
  const nevoa = new THREE.Mesh(nevoaGeo, nevoaMat);
  nevoa.rotation.y = Math.PI/2;
  nevoa.position.set(-1400 - i*120, -150 + i*40, 0);
  scene.add(nevoa);
}

