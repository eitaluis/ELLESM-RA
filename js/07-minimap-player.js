// ============================================================================
// 19. LOOP
// ============================================================================
const relogio = new THREE.Clock();
// ÁUDIO AMBIENTE — gravação real de floresta (vento, folhas, aves e insetos).
// Fonte: nille, "forest ambience", Wikimedia Commons — domínio público.
let naturezaAudio=null,naturezaAtiva=true;
const NATUREZA_AUDIO_URL='https://upload.wikimedia.org/wikipedia/commons/0/0a/20090610_0_ambience.ogg';

function iniciarSomDaFloresta(){
  if(!naturezaAtiva)return;
  if(!naturezaAudio){
    naturezaAudio=new Audio(NATUREZA_AUDIO_URL);
    naturezaAudio.loop=true;
    naturezaAudio.preload='auto';
    naturezaAudio.volume=.28;
    naturezaAudio.addEventListener('error',()=>{
      const aviso=document.getElementById('tp');
      if(aviso)aviso.textContent='Não foi possível carregar o áudio da floresta. Verifique a conexão.';
    });
  }
  if(naturezaAudio.paused){
    const tentativa=naturezaAudio.play();
    if(tentativa&&typeof tentativa.catch==='function'){
      tentativa.catch(()=>{
        const aviso=document.getElementById('tp');
        if(aviso)aviso.textContent='Clique na cena para ativar o som ambiente.';
      });
    }
  }
}

function alternarSomDaFloresta(){
  naturezaAtiva=!naturezaAtiva;
  if(naturezaAtiva){
    iniciarSomDaFloresta();
  }else if(naturezaAudio){
    naturezaAudio.pause();
  }
  const aviso=document.getElementById('tp');
  if(aviso)aviso.textContent=naturezaAtiva?'Som natural da floresta ligado':'Som da floresta desligado';
}
let mmTimer = 0;
let alturaAlvo = alturaChao(jogador.pos.x, jogador.pos.z, jogador.pos.y-jogador.alturaOlhos);
let tAcum = 0;

function criarFeixesDeSol(){
  // Feixes estreitos e suaves, filtrados pela copa, sem cones geométricos largos.
  const spots=[[400,-60,34,52],[250,-40,22,44],[120,70,31,50],[470,-180,28,46],
    [150,-80,34,54],[-600,60,36,56],[0,0,24,48],[520,-142,30,48],[-180,220,25,45]];
  for(const [x,z,radius,height] of spots){
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.22,.34,height,12,1,true),
      new THREE.MeshBasicMaterial({color:0xfff2d5,transparent:true,opacity:.026,depthWrite:false,
        side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    beam.position.set(x,alturaTerreno(x,z)+height*.54,z);beam.frustumCulled=false;scene.add(beam);
    const glow=new THREE.Mesh(new THREE.CircleGeometry(radius*.48,32),
      new THREE.MeshBasicMaterial({color:0xe7ddb0,transparent:true,opacity:.018,depthWrite:false,side:THREE.DoubleSide}));
    glow.rotation.x=-Math.PI/2;glow.position.set(x,alturaTerreno(x,z)+.08,z);scene.add(glow);
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

  const velBase = teclas['ShiftLeft'] || teclas['ShiftRight'] ? 16 : 7.0;
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
  atualizarNeblinaPorAltitude(jogador.pos.y);

  sun.position.set(jogador.pos.x - 600, 400, jogador.pos.z + 300);
  sun.target.position.set(jogador.pos.x, 0, jogador.pos.z);

  document.getElementById('coord').textContent =
    `X ${jogador.pos.x.toFixed(1)}  Y ${jogador.pos.y.toFixed(1)}  Z ${jogador.pos.z.toFixed(1)}`;

  mmTimer += dt;
  if (mmTimer > 0.1) { desenharMinimapa(); mmTimer = 0; }

  renderer.render(scene, camera);
}

animar();
