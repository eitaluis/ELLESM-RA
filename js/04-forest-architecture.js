function buildForge(parent,x,y,z){
  // Oficina circular de Rhunön: alvenaria, madeira, cobertura e ferramentas legíveis.
  const wallY=y+1,radius=12,wallH=7.2;
  const foundation=new THREE.Mesh(new THREE.CylinderGeometry(12.4,13.2,1.1,10),stoneMat);
  foundation.position.set(x,y+.48,z);foundation.receiveShadow=true;parent.add(foundation);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(11.7,48),mossFloorMat);
  floor.rotation.x=-Math.PI/2;floor.position.set(x,y+1.08,z);parent.add(floor);
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2,px=x+Math.cos(a)*radius,pz=z+Math.sin(a)*radius;
    addLivingTrunk(parent,px,wallY,pz,wallH,1.0,Math.cos(a)*.8,Math.sin(a)*.8,woodMat);
    addOrganicTube(parent,[[px,wallY+wallH-1,pz],[x+Math.cos(a)*7,wallY+wallH+3,z+Math.sin(a)*7],
      [x+Math.cos(a)*2,wallY+wallH+5,z+Math.sin(a)*2]],.62,.14,paleWood,9,24,.08);
  }
  // Paredes baixas entre pilares; as aberturas superiores deixam entrar luz e ar.
  for(let i=0;i<10;i++){
    const a=(i+.5)/10*Math.PI*2;if(Math.sin(a)>.65)continue;
    const panel=new THREE.Mesh(new THREE.BoxGeometry(5.6,4.6,.42),dwellingWallMat);
    panel.position.set(x+Math.cos(a)*10.9,wallY+3.45,z+Math.sin(a)*10.9);
    panel.rotation.y=-a+Math.PI/2;parent.add(panel);
    const lintel=new THREE.Mesh(new THREE.BoxGeometry(5.8,.32,.62),paleWood);
    lintel.position.set(panel.position.x,wallY+6.0,panel.position.z);lintel.rotation.y=panel.rotation.y;parent.add(lintel);
  }
  const roof=new THREE.Mesh(new THREE.ConeGeometry(15.2,5.2,10,1),roofMat);
  roof.position.set(x,wallY+wallH+3.2,z);roof.rotation.y=Math.PI/10;roof.castShadow=true;parent.add(roof);
  const ridge=new THREE.Mesh(new THREE.CylinderGeometry(.42,.68,3.8,10),woodMat);
  ridge.position.set(x,wallY+wallH+5.2,z);parent.add(ridge);
  const chimney=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.45,8.2,8),stoneMat);
  chimney.position.set(x-5,wallY+wallH+5.8,z-3);parent.add(chimney);
  const mouth=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.12,8),darkMat);
  mouth.position.set(x-5,wallY+wallH+10,z-3);parent.add(mouth);
  addLivingDoorFrame(parent,x,wallY,z+11,4.0,4.5);
  for(let i=0;i<4;i++){
    const step=new THREE.Mesh(new THREE.BoxGeometry(5.2,.32,1.0),stoneMat);
    step.position.set(x,wallY+.18+i*.02,z+12+i*.9);parent.add(step);
  }
  registerWalkablePath([[x,wallY+1.1,z+16],[x,wallY+1.1,z+10],[x,wallY+1.1,z+4],[x,wallY+1.1,z]],4.0);
  // Fornalha de pedra, abertura frontal e brasa no interior.
  const furnace=new THREE.Mesh(new THREE.BoxGeometry(5.6,4.8,4.2),stoneMat);
  furnace.position.set(x-4.2,wallY+3.45,z-4.5);parent.add(furnace);
  const furnaceMouth=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.3,.18),darkMat);
  furnaceMouth.position.set(x-4.2,wallY+2.7,z-2.35);parent.add(furnaceMouth);
  const fire=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),warmMat);
  fire.scale.set(1,.5,.25);fire.position.set(x-4.2,wallY+2.25,z-2.55);parent.add(fire);
  const glow=new THREE.PointLight(0xff873c,1.35,24);glow.position.set(x-4.2,wallY+4,z-1.5);parent.add(glow);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.72,.9,1.4,8),woodMat);
  base.position.set(x+3.8,wallY+1.8,z-2);parent.add(base);
  const anvil=new THREE.Mesh(new THREE.BoxGeometry(2.4,.72,1.25),stoneMat);
  anvil.position.set(x+3.8,wallY+2.85,z-2);parent.add(anvil);
  const horn=new THREE.Mesh(new THREE.ConeGeometry(.48,1.5,6),stoneMat);
  horn.rotation.z=-Math.PI/2;horn.position.set(x+5.35,wallY+2.9,z-2);parent.add(horn);
  const bellows=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,1.4),dwellingTrimMat);
  bellows.position.set(x+5,wallY+2.4,z+3);bellows.rotation.y=-.25;parent.add(bellows);
  for(let i=0;i<3;i++){
    const tool=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,3.4,6),woodMat);
    tool.position.set(x+7.2+i*.65,wallY+3.4,z-5+i*.3);tool.rotation.z=.18;parent.add(tool);
  }
  const windowGlow=new THREE.PointLight(0xffd6a0,.45,18);windowGlow.position.set(x+1,wallY+5,z+7);parent.add(windowGlow);
}
