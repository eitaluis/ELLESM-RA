// ============================================================================
// 10. TEXTURAS PROCEDURAIS
// ============================================================================
function texRuido(baseHex, varHex, w=256, h=256, escala=4) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = baseHex; ctx.fillRect(0,0,w,h);
  for (let i = 0; i < w*h*0.20; i++) {
    const x = Math.random()*w, y = Math.random()*h;
    const s = 1 + Math.random()*escala;
    ctx.fillStyle = varHex.replace('ALPHA', (0.04 + Math.random()*0.18).toFixed(2));
    ctx.fillRect(x, y, s, s);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function normalRudimentar(tex) {
  const c = tex.image;
  const w = c.width, h = c.height;
  const data = c.getContext('2d').getImageData(0,0,w,h).data;
  const out = new Uint8ClampedArray(w*h*4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y*w + x) * 4;
      const dx = (data[(y*w + ((x+1)%w))*4] - data[(y*w + ((x-1+w)%w))*4]) / 255;
      const dy = (data[(((y+1)%h)*w + x)*4] - data[(((y-1+h)%h)*w + x)*4]) / 255;
      out[i]   = Math.floor((dx*0.5 + 0.5) * 255);
      out[i+1] = Math.floor((dy*0.5 + 0.5) * 255);
      out[i+2] = 255;
      out[i+3] = 255;
    }
  }
  const nc = document.createElement('canvas'); nc.width = w; nc.height = h;
  nc.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
  const nt = new THREE.CanvasTexture(nc);
  nt.wrapS = nt.wrapT = THREE.RepeatWrapping;
  return nt;
}

const TEX_CASCA = texRuido('#4a3a2a', 'rgba(30,20,10,ALPHA)', 512, 512, 6);
TEX_CASCA.repeat.set(2, 4);
const TEX_CASCA_N = normalRudimentar(TEX_CASCA);
const TEX_AGULHA = texRuido('#1e3a1e', 'rgba(10,25,10,ALPHA)', 256, 256, 4);
TEX_AGULHA.repeat.set(3, 3);
const TEX_AGULHA_N = normalRudimentar(TEX_AGULHA);
const TEX_MUSGO = texRuido('#2a3a1e', 'rgba(50,70,30,ALPHA)', 256, 256, 5);
const TEX_PEDRA = texRuido('#6a6a60', 'rgba(40,40,35,ALPHA)', 256, 256, 5);
const TEX_GALHO = texRuido('#3c3024', 'rgba(22,16,10,ALPHA)', 512, 512, 5);
TEX_GALHO.repeat.set(2,5);
TEX_PEDRA.repeat.set(2, 2);

const MATERIAIS = {
  tronco: new THREE.MeshStandardMaterial({ map:TEX_CASCA, normalMap:TEX_CASCA_N, roughness:0.96, color:0xb09b79 }),
  galho: new THREE.MeshStandardMaterial({ map:TEX_GALHO, roughness:0.98, color:0x9b8767 }),
  copa: new THREE.MeshStandardMaterial({ color:0xffffff, roughness:1.0, side:THREE.DoubleSide }),
  pedra: new THREE.MeshStandardMaterial({ map: TEX_PEDRA, roughness: 0.95, color: 0x8a8a80 }),
  musgo: new THREE.MeshStandardMaterial({ map: TEX_MUSGO, roughness: 1.0, color: 0x6a7a4a }),
  lanterna: new THREE.MeshStandardMaterial({ color: 0x7aff8a, emissive: 0x4aff6a, emissiveIntensity: 1.4, roughness: 0.3 }),
};

// ============================================================================
// 11. DISTRIBUIÇÃO — helpers
// ============================================================================
function distanciaPontoSegmento(px, pz, ax, az, bx, bz) {
  const dx = bx-ax, dz = bz-az;
  const l2 = dx*dx + dz*dz;
  if (l2 === 0) return Math.hypot(px-ax, pz-az);
  let t = ((px-ax)*dx + (pz-az)*dz) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax+t*dx), pz - (az+t*dz));
}
function distanciaCaminhos(x, z) {
  let min = Infinity;
  for (const curva of CURVAS_CAMINHOS) {
    const pts = curva.getPoints(30);
    for (let i = 0; i < pts.length-1; i++) {
      const d = distanciaPontoSegmento(x, z, pts[i].x, pts[i].z, pts[i+1].x, pts[i+1].z);
      if (d < min) min = d;
    }
  }
  if (CURVA_RIACHO) {
    const pts = CURVA_RIACHO.getPoints(40);
    for (let i = 0; i < pts.length-1; i++) {
      const d = distanciaPontoSegmento(x, z, pts[i].x, pts[i].z, pts[i+1].x, pts[i+1].z);
      if (d < min) min = d;
    }
  }
  return min;
}
function emClareira(x, z, margemExtra = 0) {
  for (const p of PONTOS) {
    if (p.raio === 0) continue;
    if (Math.hypot(x-p.x, z-p.z) < p.raio + margemExtra) return true;
  }
  return false;
}

