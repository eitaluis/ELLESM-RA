// ============================================================================
// 17. MINIMAPA
// ============================================================================
const mmCanvas = document.getElementById('minimapa');
const mmCtx = mmCanvas.getContext('2d');
const MM_SIZE = 220;
let minimapaVisivel = true;
let minimapaZoomLocal = false;
const MM_LIM = 1500;

addEventListener('keydown', e => {
  if (e.code === 'Tab') {
    e.preventDefault();
    minimapaVisivel = !minimapaVisivel;
    document.getElementById('minimapa-container').style.display = minimapaVisivel ? 'block' : 'none';
    document.getElementById('minimapa-legenda').style.display = minimapaVisivel ? 'flex' : 'none';
  }
});
document.getElementById('minimapa-container').addEventListener('wheel', e => {
  e.preventDefault();
  minimapaZoomLocal = !minimapaZoomLocal;
  document.getElementById('mm-escala').textContent = minimapaZoomLocal ? 'zoom local' : 'visão geral';
}, { passive: false });

function mundoParaMapa(x, z) {
  if (minimapaZoomLocal) {
    const raio = 350;
    return {
      px: MM_SIZE/2 + (x - jogador.pos.x) / raio * (MM_SIZE/2),
      py: MM_SIZE/2 - (z - jogador.pos.z) / raio * (MM_SIZE/2)
    };
  }
  return {
    px: (x + MM_LIM) / (2*MM_LIM) * MM_SIZE,
    py: MM_SIZE - (z + MM_LIM) / (2*MM_LIM) * MM_SIZE
  };
}

function desenharMinimapa() {
  if (!minimapaVisivel) return;
  mmCtx.clearRect(0, 0, MM_SIZE, MM_SIZE);
  mmCtx.fillStyle = '#0a1a10';
  mmCtx.fillRect(0, 0, MM_SIZE, MM_SIZE);

  const canto1 = mundoParaMapa(-MM_LIM, -MM_LIM);
  const canto2 = mundoParaMapa(MM_LIM, MM_LIM);
  mmCtx.strokeStyle = 'rgba(120,200,120,0.4)';
  mmCtx.lineWidth = 1;
  mmCtx.strokeRect(canto1.px, canto1.py, canto2.px - canto1.px, canto2.py - canto1.py);

  const p1 = mundoParaMapa(-1150, -1200);
  const p2 = mundoParaMapa(-1150, 1200);
  mmCtx.strokeStyle = 'rgba(240,240,240,0.8)';
  mmCtx.lineWidth = 2;
  mmCtx.beginPath(); mmCtx.moveTo(p1.px, p1.py); mmCtx.lineTo(p2.px, p2.py); mmCtx.stroke();

  if (CURVA_RIACHO) {
    const pts = CURVA_RIACHO.getPoints(50);
    mmCtx.strokeStyle = 'rgba(80,150,200,0.8)';
    mmCtx.lineWidth = 1.5;
    mmCtx.beginPath();
    pts.forEach((p, i) => {
      const m = mundoParaMapa(p.x, p.z);
      if (i === 0) mmCtx.moveTo(m.px, m.py); else mmCtx.lineTo(m.px, m.py);
    });
    mmCtx.stroke();
  }

  mmCtx.strokeStyle = 'rgba(200,180,140,0.6)';
  mmCtx.lineWidth = 1;
  for (const curva of CURVAS_CAMINHOS) {
    const pts = curva.getPoints(40);
    mmCtx.beginPath();
    pts.forEach((p, i) => {
      const m = mundoParaMapa(p.x, p.z);
      if (i === 0) mmCtx.moveTo(m.px, m.py); else mmCtx.lineTo(m.px, m.py);
    });
    mmCtx.stroke();
  }

  for (const p of PONTOS) {
    if (p.raio === 0) continue;
    const m = mundoParaMapa(p.x, p.z);
    const r = minimapaZoomLocal ? (p.raio / 350) * (MM_SIZE/2) : (p.raio / (2*MM_LIM)) * MM_SIZE;
    mmCtx.fillStyle = `rgba(${(p.cor>>16)&255},${(p.cor>>8)&255},${p.cor&255},0.15)`;
    mmCtx.beginPath(); mmCtx.arc(m.px, m.py, Math.max(1, r), 0, Math.PI*2); mmCtx.fill();
  }
  for (const p of PONTOS) {
    const m = mundoParaMapa(p.x, p.z);
    if (m.px < -10 || m.px > MM_SIZE+10 || m.py < -10 || m.py > MM_SIZE+10) continue;
    mmCtx.fillStyle = `rgb(${(p.cor>>16)&255},${(p.cor>>8)&255},${p.cor&255})`;
    mmCtx.beginPath(); mmCtx.arc(m.px, m.py, 3, 0, Math.PI*2); mmCtx.fill();
    mmCtx.strokeStyle = '#0a1a10'; mmCtx.lineWidth = 0.5; mmCtx.stroke();
    if (!minimapaZoomLocal || Math.hypot(p.x - jogador.pos.x, p.z - jogador.pos.z) < 200) {
      mmCtx.fillStyle = 'rgba(220,245,220,0.85)';
      mmCtx.font = '8px monospace';
      mmCtx.fillText(p.nome.split(' ')[0], m.px + 4, m.py + 2);
    }
  }

  const jm = mundoParaMapa(jogador.pos.x, jogador.pos.z);
  const dir = camera.rotation.y;
  mmCtx.save();
  mmCtx.translate(jm.px, jm.py);
  mmCtx.rotate(-dir);
  mmCtx.fillStyle = '#ff5555';
  mmCtx.beginPath();
  mmCtx.moveTo(0, -6); mmCtx.lineTo(4, 5); mmCtx.lineTo(0, 2); mmCtx.lineTo(-4, 5);
  mmCtx.closePath(); mmCtx.fill();
  mmCtx.strokeStyle = '#fff'; mmCtx.lineWidth = 1; mmCtx.stroke();
  mmCtx.restore();
}

// ============================================================================
// 18. NAVEGAÇÃO E COLISÃO
// ============================================================================
const jogador = {
  pos: new THREE.Vector3(0, 1.7, 0),
  vel: new THREE.Vector3(),
  noChao: true,
  raio: 0.35,
  alturaOlhos: 1.7
};

const teclas = {};
addEventListener('keydown', e => {
  teclas[e.code] = true;
  if (e.code === 'KeyM') teletransportar(1);
  if (e.code === 'KeyN') teletransportar(-1);
  if (e.code === 'KeyG') posicionarNaMenoa();
  if (e.code === 'KeyH') posicionarNaCidade();
  if (e.code === 'KeyJ') posicionarNaEscadaPrincipal();
  if (e.code === 'KeyO') alternarSomDaFloresta();
});
addEventListener('keyup', e => { teclas[e.code] = false; });

let travado = false;
const startEl = document.getElementById('start');
startEl.addEventListener('click', () => {
  startEl.style.display = 'none';
  iniciarSomDaFloresta();
  renderer.domElement.requestPointerLock();
});
document.addEventListener('pointerlockchange', () => {
  travado = document.pointerLockElement === renderer.domElement;
});
document.addEventListener('mousemove', e => {
  if (!travado) return;
  camera.rotation.y -= e.movementX * 0.0022;
  camera.rotation.x -= e.movementY * 0.0022;
  camera.rotation.x = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, camera.rotation.x));
});

let tpIdx = 0;
function teletransportar(dir) {
  tpIdx = (tpIdx + dir + PONTOS.length) % PONTOS.length;
  const p = PONTOS[tpIdx];
  const px = p.x + (p.raio > 0 ? p.raio*0.5 : 0);
  const pz = p.z + (p.raio > 0 ? p.raio*0.5 : 0);
  jogador.pos.set(px, alturaChao(px, pz, alturaTerreno(px,pz)) + jogador.alturaOlhos, pz);
  jogador.vel.set(0,0,0);
  document.getElementById('tp').textContent = `TP: ${p.nome}`;
}
// Inspeção: 220 m a leste, +50 m de altura, olhando para oeste e para baixo.
function posicionarNaMenoa() {
  const cx=-380,cz=520,px=cx+220,pz=cz;
  jogador.pos.set(px,alturaChao(px,pz)+jogador.alturaOlhos+50,pz);
  jogador.vel.set(0,0,0);camera.rotation.y=-Math.PI/2;camera.rotation.x=-0.45;
  document.getElementById('tp').textContent='Inspeção: Árvore Menoa';
}
function posicionarNaCidade(){
  const px=300,pz=-190;
  jogador.pos.set(px,alturaChao(px,pz)+jogador.alturaOlhos,pz);
  jogador.vel.set(0,0,0);camera.rotation.y=-2.39;camera.rotation.x=.34;
  document.getElementById('tp').textContent='Núcleo da cidade — casas nas copas';
}
function posicionarNaEscadaPrincipal(){
  const px=477.3,pz=-180;
  jogador.pos.set(px,alturaChao(px,pz)+jogador.alturaOlhos,pz);
  jogador.vel.set(0,0,0);camera.rotation.y=Math.PI;camera.rotation.x=-.04;
  document.getElementById('tp').textContent='Primeiro degrau — escada espiral protegida';
}
function estaSobrePisoEspecial(x,z,footY){
  // Degraus, pontes e raízes expostas substituem as colisões cilíndricas do tronco.
  const check=(points,width,root=null)=>{
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],den=dx*dx+dz*dz;
      const t=den>1e-8?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/den)):0;
      const px=a[0]+dx*t,pz=a[2]+dz*t,d=Math.hypot(x-px,z-pz);
      if(d>width)continue;
      let y=a[1]+(b[1]-a[1])*t;
      if(root)y+=(root.r0*(1-t)+root.r1*t)*.78;
      if(Math.abs(footY-y)<1.65)return true;
    }
    return false;
  };
  for(const walk of ELEVATED_WALKS)if(check(walk.points,walk.width*.5))return true;
  if(footY-alturaTerreno(x,z)>.12){
    for(const root of rootsPerto(x,z))if(check(root.points,root.r0*.95+.28,root))return true;
  }
  return false;
}
function protegerJogadorNaEscada(novaPos){
  const footY=novaPos.y-jogador.alturaOlhos;
  let best=null;
  for(const walk of ELEVATED_WALKS){
    if(walk.kind!=='stair')continue;
    const pts=walk.points;
    for(let i=0;i<pts.length-1;i++){
      const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[2]-a[2],den=dx*dx+dz*dz;
      const t=den>1e-8?Math.max(0,Math.min(1,((novaPos.x-a[0])*dx+(novaPos.z-a[2])*dz)/den)):0;
      const px=a[0]+dx*t,pz=a[2]+dz*t,d=Math.hypot(novaPos.x-px,novaPos.z-pz);
      if(d>2.25)continue;
      const y=a[1]+(b[1]-a[1])*t,vertical=Math.abs(footY-y);
      if(vertical>1.9)continue;
      const progress=(i+t)/(pts.length-1),score=d*d+vertical*vertical*.55;
      if(!best||score<best.score)best={px,pz,d,progress,score};
    }
  }
  // A borda funciona como uma guarda física: mantém o jogador dentro dos balaústres.
  if(best&&best.progress>.012&&best.progress<.988&&best.d>1.30&&best.d>1e-5){
    const factor=1.30/best.d;
    novaPos.x=best.px+(novaPos.x-best.px)*factor;
    novaPos.z=best.pz+(novaPos.z-best.pz)*factor;
  }
}

// Grade espacial de colisão: evita percorrer milhares de objetos a cada quadro.
const COLLISION_GRID_CELL = 48;
const COLLISION_GRID = new Map();
for (const c of colisores) {
  const gx = Math.floor(c.x / COLLISION_GRID_CELL), gz = Math.floor(c.z / COLLISION_GRID_CELL);
  const key = gx + ',' + gz;
  if (!COLLISION_GRID.has(key)) COLLISION_GRID.set(key, []);
  COLLISION_GRID.get(key).push(c);
}

function colidir(novaPos) {
  protegerJogadorNaEscada(novaPos);
  if (novaPos.x < -1150 + jogador.raio) novaPos.x = -1150 + jogador.raio;
  novaPos.x = Math.max(-1450, Math.min(1500, novaPos.x));
  novaPos.z = Math.max(-1450, Math.min(1500, novaPos.z));
  const footY=novaPos.y-jogador.alturaOlhos;
  if(footY>alturaTerreno(novaPos.x,novaPos.z)+4.5||estaSobrePisoEspecial(novaPos.x,novaPos.z,footY))return;
  const cellX = Math.floor(novaPos.x / COLLISION_GRID_CELL);
  const cellZ = Math.floor(novaPos.z / COLLISION_GRID_CELL);
  for (let ox = -1; ox <= 1; ox++) {
    for (let oz = -1; oz <= 1; oz++) {
      const nearby = COLLISION_GRID.get((cellX + ox) + ',' + (cellZ + oz));
      if (!nearby) continue;
      for (let i = 0; i < nearby.length; i++) {
        const c = nearby[i];
        const dx = novaPos.x - c.x, dz = novaPos.z - c.z;
        const minDist = c.raio + jogador.raio;
        if (dx*dx + dz*dz < minDist*minDist) {
          const dist = Math.sqrt(dx*dx + dz*dz);
          if (dist > 0.0001) {
            const push = minDist - dist;
            novaPos.x += (dx/dist) * push; novaPos.z += (dz/dist) * push;
          }
        }
      }
    }
  }
}

