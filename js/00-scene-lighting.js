// ============================================================================
// 1. CENA, CÂMERA, RENDERER
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaec5d0);
scene.fog = new THREE.FogExp2(0xc5d8c2, 0.00076);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 8000);
camera.position.set(0, 1.7, 34);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ============================================================================
// 2. ILUMINAÇÃO
// ============================================================================
const hemi = new THREE.HemisphereLight(0xf0f7e9, 0x596548, 1.78);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff0d2, 2.15);
sun.position.set(-600, 400, 300);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 2500;
sun.shadow.camera.left = -700; sun.shadow.camera.right = 700;
sun.shadow.camera.top = 700; sun.shadow.camera.bottom = -700;
scene.add(sun); scene.add(sun.target);

const fill = new THREE.DirectionalLight(0xd8ead5, 1.15);
fill.position.set(400, 200, -400);
scene.add(fill);

// Camadas de névoa suspensas entre os três níveis da floresta.
// As copas superiores só se revelam gradualmente conforme o visitante sobe.
function criarNeblinaDeCopas(){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
  const ctx=canvas.getContext('2d');
  const g=ctx.createRadialGradient(256,128,8,256,128,238);
  g.addColorStop(0,'rgba(245,250,246,0.46)');
  g.addColorStop(.34,'rgba(235,244,239,0.30)');
  g.addColorStop(.72,'rgba(224,237,231,0.10)');
  g.addColorStop(1,'rgba(224,237,231,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,512,256);
  for(let i=0;i<34;i++){
    const x=20+Math.random()*472,y=40+Math.random()*176,rx=24+Math.random()*82,ry=8+Math.random()*25;
    const puff=ctx.createRadialGradient(x,y,1,x,y,Math.max(rx,ry));
    puff.addColorStop(0,'rgba(255,255,255,0.22)');
    puff.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=puff;ctx.beginPath();ctx.ellipse(x,y,rx,ry,Math.random()*.6-.3,0,Math.PI*2);ctx.fill();
  }
  const texture=new THREE.CanvasTexture(canvas);
  const material=new THREE.MeshBasicMaterial({map:texture,color:0xe0e9e3,transparent:true,opacity:.31,depthWrite:false,side:THREE.DoubleSide});
  const geometry=new THREE.PlaneGeometry(210,76);
  const count=32,clouds=new THREE.InstancedMesh(geometry,material,count),dummy=new THREE.Object3D();
  const bands=[58,112,166,218];
  let index=0;
  for(let band=0;band<bands.length;band++)for(let j=0;j<8;j++){
    const x=((j*347+band*191)%1900)-950;
    const z=((j*563+band*277)%1900)-950;
    dummy.position.set(x,bands[band]+(Math.random()-.5)*12,z);
    dummy.rotation.set((Math.random()-.5)*.18,Math.random()*Math.PI,(Math.random()-.5)*.16);
    dummy.scale.set(.72+Math.random()*.95,.72+Math.random()*.7,1);
    dummy.updateMatrix();clouds.setMatrixAt(index++,dummy.matrix);
  }
  clouds.instanceMatrix.needsUpdate=true;
  clouds.frustumCulled=false;
  clouds.renderOrder=3;
  scene.add(clouds);
}

criarNeblinaDeCopas();

// ============================================================================
// 3. PONTOS
// ============================================================================
const PONTOS = [
  { nome: 'Gilderien (feixe de luz)',    x:  850, z:  -60, raio:   6, cor: 0xfff2b0 },
  { nome: 'Arco natural',                 x:  450, z:  -60, raio:  12, cor: 0xc8a878 },
  { nome: 'Clareira de flores',           x:  400, z:  -60, raio:  45, cor: 0xd88fb0 },
  { nome: 'Salão do Trono',               x:  250, z:  -40, raio:  40, cor: 0xd0c090 },
  { nome: 'Colina do banquete',           x:  120, z:   70, raio:  25, cor: 0xc8b070 },
  { nome: 'Árvore dos Cavaleiros',        x:    0, z:    0, raio:  15, cor: 0x9fe89f },
  { nome: 'Estábulos',                    x:  200, z: -160, raio:  30, cor: 0xc0c0c0 },
  { nome: 'Campo de esgrima',             x: -300, z: -200, raio:  50, cor: 0xa8c890 },
  { nome: 'Forja de Rhunön',              x: -180, z:  220, raio:  25, cor: 0xff9060 },
  { nome: 'Árvore Menoa',                 x: -380, z:  520, raio: 120, cor: 0xb0e0b0 },
  { nome: 'Salão de Tialdarí (entrada)',  x: -600, z:   60, raio:  90, cor: 0xe0b0e0 },
  { nome: 'Colina dos Crags (topo)',      x:-1100, z:    0, raio:  40, cor: 0xe0e0e0 },
  { nome: 'Borda do penhasco',            x:-1150, z:    0, raio:   0, cor: 0xffffff },
  { nome: 'Cabana de Oromis',             x:-1130, z: 1200, raio:  30, cor: 0xa0b090 },
  { nome: 'Clareira do toco branco',      x:-1050, z: 1230, raio:  20, cor: 0xffffff },
];

// ============================================================================
// 4. RUÍDO E ALTURA
// ============================================================================
function hash2(x, z) {
  const s = Math.sin(x*127.1 + z*311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise2(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf*xf*(3-2*xf), v = zf*zf*(3-2*zf);
  const a = hash2(xi, zi), b = hash2(xi+1, zi);
  const c = hash2(xi, zi+1), d = hash2(xi+1, zi+1);
  return a*(1-u)*(1-v) + b*u*(1-v) + c*(1-u)*v + d*u*v;
}
function fbm(x, z, oct=4) {
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * noise2(x*freq, z*freq);
    freq *= 2.0; amp *= 0.5;
  }
  return v;
}
function alturaTerreno(x,z){
  // Relevo profundo de floresta antiga: colinas largas, baixios, lombas de raízes,
  // depressões de árvores tombadas e ondulações menores de húmus.
  const broad=fbm(x*.0028+13,z*.0028-7,5);
  const ridge=fbm(x*.0075-41,z*.0075+23,4);
  const basin=fbm(x*.021+8,z*.021-61,4);
  const hummock=fbm(x*.061-17,z*.061+31,3);
  const fine=fbm(x*.16+63,z*.16-11,2);
  const micro=fbm(x*.34-91,z*.34+57,2);
  const broadRise=(broad-.5)*15.5;
  const longRidges=Math.pow(Math.max(0,ridge-.42),1.22)*11.5;
  const deepHollows=-Math.pow(Math.max(0,.36-basin),1.16)*10.5;
  const rootMounds=Math.pow(Math.max(0,hummock-.49),1.3)*6.8;
  const smallPits=-Math.pow(Math.max(0,.31-hummock),1.35)*2.7;
  const rolling=(basin-.5)*4.4+(fine-.5)*1.35+(micro-.5)*.42;
  return broadRise+longRidges+deepHollows+rootMounds+smallPits+rolling;
}

