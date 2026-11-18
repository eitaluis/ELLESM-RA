// ============================================================================
// 1. CENA, CÂMERA, RENDERER
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaec5d0);
scene.fog = new THREE.FogExp2(0xc5d8c2, 0.00076);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 2200);
camera.position.set(0, 1.7, 34);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 0.84));
renderer.shadowMap.enabled = false;
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
sun.castShadow = false;
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
// Névoa volumétrica em pequenos agrupamentos tridimensionais, sempre dentro da floresta.
// Remove os grandes planos que pareciam véus soltos suspensos no céu.
function criarNeblinaDeCopas(){
  const puffGeo=new THREE.SphereGeometry(1,10,7);
  const puffMat=new THREE.MeshBasicMaterial({color:0xeaf2ed,transparent:true,opacity:.026,depthWrite:false});
  const zones=[
    {x:0,z:0,r:210,y:36,n:22},{x:250,z:-40,r:190,y:52,n:20},
    {x:400,z:-60,r:180,y:66,n:18},{x:-180,z:220,r:175,y:48,n:18},
    {x:-380,z:520,r:205,y:72,n:24},{x:-600,z:60,r:190,y:58,n:20},
    {x:200,z:-160,r:165,y:44,n:16},{x:-300,z:-200,r:175,y:42,n:16}
  ];
  const total=zones.reduce((n,z)=>n+z.n*5,0),mist=new THREE.InstancedMesh(puffGeo,puffMat,total);
  const d=new THREE.Object3D();let index=0;
  for(const zone of zones)for(let i=0;i<zone.n;i++){
    const a=Math.random()*Math.PI*2,rad=Math.sqrt(Math.random())*zone.r;
    const cx=zone.x+Math.cos(a)*rad,cz=zone.z+Math.sin(a)*rad,baseY=alturaTerreno(cx,cz);
    for(let k=0;k<5;k++){
      const spread=5+Math.random()*13;
      d.position.set(cx+(Math.random()-.5)*spread,baseY+zone.y+(Math.random()-.5)*13,cz+(Math.random()-.5)*spread);
      const size=3.5+Math.random()*8.5;d.scale.set(size*1.45,size*.38,size*.9);
      d.rotation.set((Math.random()-.5)*.18,Math.random()*Math.PI,(Math.random()-.5)*.18);
      d.updateMatrix();mist.setMatrixAt(index++,d.matrix);
    }
  }
  mist.count=index;mist.instanceMatrix.needsUpdate=true;mist.frustumCulled=false;mist.renderOrder=2;scene.add(mist);
}
const FOG_LOW_COLOR=new THREE.Color(0xc5d8c2),FOG_HIGH_COLOR=new THREE.Color(0xe8f0ee);
const SKY_LOW_COLOR=new THREE.Color(0xaec5d0),SKY_HIGH_COLOR=new THREE.Color(0xe0e9e8);
function atualizarNeblinaPorAltitude(alturaCamera){
  const t=THREE.MathUtils.smoothstep(alturaCamera,18,280);
  scene.fog.density=THREE.MathUtils.lerp(.00048,.00215,t);
  scene.fog.color.copy(FOG_LOW_COLOR).lerp(FOG_HIGH_COLOR,t);
  scene.background.copy(SKY_LOW_COLOR).lerp(SKY_HIGH_COLOR,t*.72);
}

criarNeblinaDeCopas();

// ============================================================================
// 3. PONTOS
// ============================================================================
const PONTOS = [
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
  { nome: 'Mirante da borda do penhasco', x:-1104, z:    0, raio:   0, cor: 0xffffff },
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

