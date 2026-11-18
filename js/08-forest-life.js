// ============================================================================
// 20. VIDA DA FLORESTA — aves em voo e folhas levadas pelo vento
// ============================================================================
// Elementos ambientais leves e instanciados. Mantêm o foco na escala da floresta,
// sem usar sprites planos enormes ou efeitos luminosos artificiais.

const LIFE_BIRD_MAT=new THREE.MeshStandardMaterial({
  color:0x252d25,roughness:1,side:THREE.DoubleSide
});
const LIFE_LEAF_MAT=new THREE.MeshStandardMaterial({
  color:0xffffff,roughness:1,side:THREE.DoubleSide
});

function criarGeometriaFolhaVoo(){
  const shape=new THREE.Shape();
  shape.moveTo(0,0);
  shape.quadraticCurveTo(.28,.34,.92,.02);
  shape.quadraticCurveTo(.38,-.34,0,0);
  const geo=new THREE.ShapeGeometry(shape,10);
  geo.rotateX(-Math.PI/2);
  return geo;
}

function criarAveFlorestal(){
  const bird=new THREE.Group();
  const body=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),LIFE_BIRD_MAT);
  body.scale.set(.72,.78,2.35);body.position.z=.02;bird.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.105,9,7),LIFE_BIRD_MAT);
  head.position.set(0,.035,-.31);bird.add(head);
  const beak=new THREE.Mesh(new THREE.ConeGeometry(.045,.18,5),LIFE_BIRD_MAT);
  beak.rotation.x=-Math.PI/2;beak.position.set(0,.02,-.47);bird.add(beak);
  const tail=new THREE.Mesh(new THREE.ConeGeometry(.075,.38,5),LIFE_BIRD_MAT);
  tail.rotation.x=Math.PI/2;tail.position.set(0,-.015,.36);bird.add(tail);

  const wingShape=new THREE.Shape();
  wingShape.moveTo(0,0);
  wingShape.quadraticCurveTo(-.42,.34,-1.18,.48);
  wingShape.quadraticCurveTo(-.91,.13,-.74,-.08);
  wingShape.quadraticCurveTo(-.36,-.16,0,0);
  const wingGeo=new THREE.ShapeGeometry(wingShape,9);
  const left=new THREE.Group(),right=new THREE.Group();
  const leftMesh=new THREE.Mesh(wingGeo,LIFE_BIRD_MAT);
  const rightMesh=new THREE.Mesh(wingGeo,LIFE_BIRD_MAT);rightMesh.scale.x=-1;
  left.add(leftMesh);right.add(rightMesh);
  left.position.set(-.08,.035,0);right.position.set(.08,.035,0);
  bird.add(left,right);
  bird.userData.wings=[left,right];
  return bird;
}

const LIFE_BIRD_ROUTES=[
  {x:-380,z:520,r:92,h:112,s:.17},
  {x:250,z:-40,r:78,h:84,s:.22},
  {x:640,z:360,r:108,h:172,s:.13},
  {x:-600,z:60,r:82,h:96,s:.19},
  {x:300,z:-190,r:70,h:74,s:.24},
  {x:450,z:-60,r:88,h:128,s:.16}
];
const LIFE_BIRDS=[];
for(let i=0;i<10;i++){
  const route=LIFE_BIRD_ROUTES[i%LIFE_BIRD_ROUTES.length];
  const bird=criarAveFlorestal();
  const scale=.78+Math.random()*.42;
  bird.scale.setScalar(scale);
  bird.userData.route=route;
  bird.userData.phase=(i/LIFE_BIRD_ROUTES.length)*Math.PI*2+Math.random()*.8;
  bird.userData.speed=route.s*(.88+Math.random()*.34);
  bird.userData.wingPhase=Math.random()*Math.PI*2;
  scene.add(bird);LIFE_BIRDS.push(bird);
}

const LIFE_LEAF_GEO=criarGeometriaFolhaVoo();
const LIFE_LEAF_COUNT=104;
const LIFE_LEAVES=new THREE.InstancedMesh(LIFE_LEAF_GEO,LIFE_LEAF_MAT,LIFE_LEAF_COUNT);
LIFE_LEAVES.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
LIFE_LEAVES.frustumCulled=false;
const LIFE_LEAF_DATA=[];
const LIFE_LEAF_ZONES=[
  {x:0,z:0,r:145},{x:250,z:-40,r:115},{x:-380,z:520,r:132},
  {x:640,z:360,r:115},{x:-600,z:60,r:120},{x:300,z:-190,r:110}
];
const leafDummy=new THREE.Object3D();
for(let i=0;i<LIFE_LEAF_COUNT;i++){
  const zone=LIFE_LEAF_ZONES[i%LIFE_LEAF_ZONES.length],a=Math.random()*Math.PI*2,
    r=Math.sqrt(Math.random())*zone.r,x=zone.x+Math.cos(a)*r,z=zone.z+Math.sin(a)*r,
    ground=alturaTerreno(x,z),scale=.34+Math.random()*.72;
  const item={x,y:ground+8+Math.random()*48,z,ground,scale,
    driftX:(Math.random()-.5)*.34,driftZ:(Math.random()-.5)*.34,
    spin:Math.random()*Math.PI*2,spinRate:(Math.random()-.5)*1.6,
    flutter:Math.random()*Math.PI*2,zone};
  LIFE_LEAF_DATA.push(item);
  leafDummy.position.set(x,item.y,z);leafDummy.rotation.set((Math.random()-.5)*.6,item.spin,(Math.random()-.5)*.6);
  leafDummy.scale.set(scale,scale,scale);leafDummy.updateMatrix();LIFE_LEAVES.setMatrixAt(i,leafDummy.matrix);
  LIFE_LEAVES.setColorAt(i,new THREE.Color().setHSL(.19+Math.random()*.12,.30+Math.random()*.28,.28+Math.random()*.24));
}
LIFE_LEAVES.instanceMatrix.needsUpdate=true;
if(LIFE_LEAVES.instanceColor)LIFE_LEAVES.instanceColor.needsUpdate=true;
scene.add(LIFE_LEAVES);

let lifeLastTime=0;
function animarVidaDaFloresta(timestamp){
  const dt=lifeLastTime?Math.min(.05,(timestamp-lifeLastTime)/1000):0;
  lifeLastTime=timestamp;
  const time=timestamp*.001;

  for(let i=0;i<LIFE_LEAF_DATA.length;i++){
    const leaf=LIFE_LEAF_DATA[i];
    leaf.x+=leaf.driftX*dt+Math.sin(time*1.1+leaf.flutter)*.22*dt;
    leaf.z+=leaf.driftZ*dt+Math.cos(time*.8+leaf.flutter)*.18*dt;
    leaf.y-=(.55+leaf.scale*.32)*dt;
    leaf.spin+=leaf.spinRate*dt;
    if(leaf.y<leaf.ground+2){
      const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*leaf.zone.r;
      leaf.x=leaf.zone.x+Math.cos(a)*r;leaf.z=leaf.zone.z+Math.sin(a)*r;
      leaf.ground=alturaTerreno(leaf.x,leaf.z);leaf.y=leaf.ground+28+Math.random()*44;
      leaf.driftX=(Math.random()-.5)*.34;leaf.driftZ=(Math.random()-.5)*.34;
    }
    leafDummy.position.set(leaf.x,leaf.y,leaf.z);
    leafDummy.rotation.set(Math.sin(time*1.4+leaf.flutter)*.65,leaf.spin,Math.cos(time+leaf.flutter)*.45);
    leafDummy.scale.set(leaf.scale,leaf.scale,leaf.scale);leafDummy.updateMatrix();
    LIFE_LEAVES.setMatrixAt(i,leafDummy.matrix);
  }
  LIFE_LEAVES.instanceMatrix.needsUpdate=true;

  for(const bird of LIFE_BIRDS){
    const route=bird.userData.route,phase=time*bird.userData.speed+bird.userData.phase;
    const x=route.x+Math.cos(phase)*route.r,z=route.z+Math.sin(phase*.78)*route.r*.72;
    const nextPhase=phase+.025,dx=-Math.sin(nextPhase)*route.r,dz=Math.cos(nextPhase*.78)*route.r*.72;
    bird.position.set(x,alturaTerreno(x,z)+route.h+Math.sin(phase*2.1)*4.2,z);
    bird.rotation.y=Math.atan2(-dx,-dz);
    const flap=Math.sin(time*8.2+bird.userData.wingPhase);
    bird.userData.wings[0].rotation.z=-.18+flap*.62;
    bird.userData.wings[1].rotation.z=.18-flap*.62;
  }
  requestAnimationFrame(animarVidaDaFloresta);
}
requestAnimationFrame(animarVidaDaFloresta);
