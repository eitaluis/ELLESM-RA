// ============================================================================
// 19. LOOP
// ============================================================================
const relogio = new THREE.Clock();
let mmTimer = 0;
let alturaAlvo = alturaChao(jogador.pos.x, jogador.pos.z, jogador.pos.y-jogador.alturaOlhos);
let tAcum = 0;

function criarFeixesDeSol(){
  // Feixes discretos nas clareiras: luz diurna filtrada pelo dossel, sem escurecer o bosque.
  const spots=[[400,-60,34,52,-.08,.10],[250,-40,22,44,.06,-.08],[120,70,31,50,-.05,.12],
    [470,-180,28,46,.08,.10],[150,-80,34,54,-.04,-.08],[-600,60,36,56,.07,.11],
    [0,0,24,48,-.05,.06],[520,-142,30,48,.08,-.05],[-180,220,25,45,.04,.12]];
  for(const [x,z,radius,height,tiltX,tiltZ] of spots){
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.10,radius,height,14,1,true),
      new THREE.MeshBasicMaterial({color:0xfff0c9,transparent:true,opacity:.055,depthWrite:false,
        side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    beam.position.set(x,alturaTerreno(x,z)+height*.52,z);
    beam.rotation.x=tiltX;beam.rotation.z=tiltZ;beam.frustumCulled=false;scene.add(beam);
  }
}
criarFeixesDeSol();
posicionarNaCidade();

function animar() {
  requestAnimationFrame(animar);
  const dt = Math.min(relogio.getDelta(), 0.05);
  tAcum += dt;

  if (lanternaObjs.length > 0) {
    const pulso = 0.7 + 0.3 * Math.sin(tAcum * 0.5);
    for (let i = 0; i < lanternaObjs.length; i++) {
      const l = lanternaObjs[i];
      l.position.y = lanternaBaseY[i] + Math.sin(tAcum * 0.7 + i) * 0.2;
      if (l.material) l.material.emissiveIntensity = 1.0 + pulso * 0.6;
    }
  }

  const dir = new THREE.Vector3();
  const frente = new THREE.Vector3(-Math.sin(camera.rotation.y), 0, -Math.cos(camera.rotation.y));
  const direita = new THREE.Vector3(Math.cos(camera.rotation.y), 0, -Math.sin(camera.rotation.y));
  if (teclas['KeyW']) dir.add(frente);
  if (teclas['KeyS']) dir.sub(frente);
  if (teclas['KeyD']) dir.add(direita);
  if (teclas['KeyA']) dir.sub(direita);
  if (dir.lengthSq() > 0) dir.normalize();

  const velBase = teclas['ShiftLeft'] || teclas['ShiftRight'] ? 12 : 4.5;
  jogador.vel.x = dir.x * velBase;
  jogador.vel.z = dir.z * velBase;
  jogador.vel.y -= 25 * dt;
  if (teclas['Space'] && jogador.noChao) { jogador.vel.y = 8; jogador.noChao = false; }

  jogador.pos.x += jogador.vel.x * dt;
  jogador.pos.z += jogador.vel.z * dt;
  jogador.pos.y += jogador.vel.y * dt;

  alturaAlvo = alturaChao(jogador.pos.x, jogador.pos.z, jogador.pos.y-jogador.alturaOlhos);
  const alvoY = alturaAlvo + jogador.alturaOlhos;
  if (jogador.pos.y <= alvoY) {
    jogador.pos.y = alvoY;
    jogador.vel.y = 0;
    jogador.noChao = true;
  }

  colidir(jogador.pos);
  camera.position.copy(jogador.pos);

  sun.position.set(jogador.pos.x - 600, 400, jogador.pos.z + 300);
  sun.target.position.set(jogador.pos.x, 0, jogador.pos.z);

  document.getElementById('coord').textContent =
    `X ${jogador.pos.x.toFixed(1)}  Y ${jogador.pos.y.toFixed(1)}  Z ${jogador.pos.z.toFixed(1)}`;

  mmTimer += dt;
  if (mmTimer > 0.1) { desenharMinimapa(); mmTimer = 0; }

  renderer.render(scene, camera);
}

animar();
