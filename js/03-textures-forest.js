// ============================================================================
 // 12. ÁRVORES PROCEDURAIS — troncos altos, ramificação estrutural e agulhas
 // ============================================================================
function criarPinheiroGeo(seed,tipo='adulto'){
  const rand=(a,b)=>a+Math.random()*(b-a),sapling=tipo==='sub-bosque';
  const altura=sapling?rand(30,48):rand(78,90);
  const raioBase=sapling?rand(.78,1.28):rand(3.1,3.65);
  const topoRaio=sapling ? .07 : .17;
  const crownStart=altura*(sapling?rand(.38,.46):rand(.49,.57));
  const posT=[],idxT=[],posB=[],idxB=[],posF=[],idxF=[],rootPaths=[];
  const cx=Math.sin(seed*1.73)*.8,cz=Math.cos(seed*2.11)*.7;

  function addTube(pos,idx,points,r0,r1,radial=8,segments=12,irregular=.10){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.35);
    const frames=curve.computeFrenetFrames(segments,false),base=pos.length/3;
    for(let s=0;s<=segments;s++){
      const t=s/segments,center=curve.getPointAt(t),radius=r0*(1-t)+r1*t;
      for(let k=0;k<radial;k++){
        const a=k/radial*Math.PI*2,wob=1+Math.sin(a*3+seed+t*7)*irregular+Math.cos(a*5-seed)*irregular*.32;
        const off=frames.normals[s].clone().multiplyScalar(Math.cos(a)*radius*wob).add(frames.binormals[s].clone().multiplyScalar(Math.sin(a)*radius*wob));
        pos.push(center.x+off.x,center.y+off.y,center.z+off.z);
      }
    }
    for(let s=0;s<segments;s++)for(let k=0;k<radial;k++){
      const p=base+s*radial+k,q=base+s*radial+(k+1)%radial,r=base+(s+1)*radial+k,t=base+(s+1)*radial+(k+1)%radial;
      idx.push(p,q,r,q,t,r);
    }
  }
  function addNeedle(p,dir,len,width){
    const d=new THREE.Vector3(...dir).normalize(),ref=Math.abs(d.y)>.86?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
    const side=new THREE.Vector3().crossVectors(d,ref).normalize().multiplyScalar(width);
    const lift=new THREE.Vector3().crossVectors(side,d).normalize().multiplyScalar(width*.22);
    const base=posF.length/3,mid=new THREE.Vector3(...p).addScaledVector(d,len*.52).add(lift),tip=new THREE.Vector3(...p).addScaledVector(d,len);
    const left=mid.clone().add(side),right=mid.clone().sub(side);
    posF.push(p[0],p[1],p[2],left.x,left.y,left.z,tip.x,tip.y,tip.z,right.x,right.y,right.z);
    idxF.push(base,base+1,base+2,base,base+2,base+3);
  }
  function toGeo(pos,idx){
    const g=new THREE.BufferGeometry(),uv=[];
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    for(let i=0;i<pos.length;i+=3){
      const x=pos[i],y=pos[i+1],z=pos[i+2],angle=Math.atan2(z,x);
      uv.push(angle/(Math.PI*2)+.5,y*.055+Math.hypot(x,z)*.035);
    }
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    g.setIndex(idx);g.computeVertexNormals();return g;
  }

  // Tronco contínuo com conicidade forte, leve sinuosidade e casca irregular.
  const trunk=[];
  for(let s=0;s<=12;s++){
    const y=s<=2?s*3.5:7+(s-2)/10*(altura-7),t=y/altura;
    trunk.push([cx+Math.sin(t*2.4+seed)*(.25+t*.8),y,cz+Math.cos(t*1.9+seed*.4)*(.22+t*.55)]);
  }
  // Root flare spreads the basal 7 m to approximately 1.6 times the trunk diameter.
  addTube(posT,idxT,trunk.slice(0,3),raioBase*1.6,raioBase,16,16,.075);
  addTube(posT,idxT,trunk.slice(2),raioBase,topoRaio,20,42,.095);
  for(let rib=0;rib<12;rib++){
    const a=rib/12*Math.PI*2+(seed%7)*.08,pts=[];
    for(let j=0;j<=10;j++){
      const t=j/10,y=7+t*(altura-7),r=raioBase*(1-t)+topoRaio*t;
      const aa=a+Math.sin(t*5+rib)*.035;
      pts.push([cx+Math.cos(aa)*(r+.08),y,cz+Math.sin(aa)*(r+.08)]);
    }
    addTube(posT,idxT,pts,.16+raioBase*.025,.035,5,20,.16);
  }

  // Raízes expostas, ligadas ao colo do tronco e apoiadas sobre o solo.
  const rootCount=sapling?7:12;
  for(let r=0;r<rootCount;r++){
    const a=r/rootCount*Math.PI*2+rand(-.18,.18),len=sapling?rand(5,9):rand(18,30),side=Math.sin(a*2+seed)*.8;
    const root=[
      [cx+Math.cos(a)*raioBase*.42,.32,cz+Math.sin(a)*raioBase*.42],
      [cx+Math.cos(a)*len*.28+Math.cos(a+Math.PI/2)*side,.72,cz+Math.sin(a)*len*.28+Math.sin(a+Math.PI/2)*side],
      [cx+Math.cos(a)*len*.68+Math.cos(a+Math.PI/2)*side*1.8,.38,cz+Math.sin(a)*len*.68+Math.sin(a+Math.PI/2)*side*1.8],
      [cx+Math.cos(a)*len,.18,cz+Math.sin(a)*len]
    ];
    const rootRadius=raioBase*rand(.12,.20);
    addTube(posT,idxT,root,rootRadius,.035,7,14,.16);
    rootPaths.push({points:root.map(p=>p.slice()),radius:rootRadius});
    if(r%2===0){const fork=root[2],fa=a+rand(-.65,.65),fl=len*rand(.35,.58);addTube(posT,idxT,[fork,[fork[0]+Math.cos(fa)*fl*.45,.18,fork[2]+Math.sin(fa)*fl*.45],[fork[0]+Math.cos(fa)*fl,.05,fork[2]+Math.sin(fa)*fl]],.22,.025,6,9,.16);}
  }

  // Andares de galhos, mais longos na parte inferior da copa e progressivamente
  // menores no alto, com pequenos ramos alternados e agulhas finas individuais.
  const levels=sapling?6:9,arms=sapling?7:10,baseReach=sapling?rand(10,15):rand(29,39);
  for(let level=0;level<levels;level++){
    const t=level/(levels-1),y=crownStart+t*(altura-crownStart)*.92,reach=baseReach*(1-t*.86)+1.8,count=arms+(level%2);
    for(let arm=0;arm<count;arm++){
      const a=arm/count*Math.PI*2+level*.39+rand(-.16,.16),len=reach*rand(.82,1.17),droop=(1-t)*len*.13;
      const root=[cx+Math.cos(a)*raioBase*.55,y,cz+Math.sin(a)*raioBase*.55];
      const p1=[cx+Math.cos(a)*len*.34,y+len*.045,cz+Math.sin(a)*len*.34];
      const p2=[cx+Math.cos(a)*len*.70,y+len*.025-droop*.28,cz+Math.sin(a)*len*.70];
      const tip=[cx+Math.cos(a)*len,y+len*.015-droop,cz+Math.sin(a)*len];
      addTube(posB,idxB,[root,p1,p2,tip],sapling ? .20 : .48,sapling ? .025 : .055,5,10,.13);

      // Pequenos sprays distribuídos ao longo do galho principal.
      for(let s=1;s<=4;s++){
        const q=s/6,px=cx+Math.cos(a)*len*q,py=y+len*.025*q-droop*q*.65,pz=cz+Math.sin(a)*len*q;
        for(let n=0;n<2;n++){const aa=a+n*Math.PI+rand(-.25,.25);addNeedle([px,py,pz],[Math.cos(aa)*.56+Math.cos(a)*.62,.34+rand(-.05,.38),Math.sin(aa)*.56+Math.sin(a)*.62],rand(sapling ? .42 : 1.08,sapling ? .82 : 2.15),sapling ? .045 : .10);}
      }

      // Ramificações secundárias alternadas que quebram a silhueta em fios vegetais.
      const twigN=sapling?4:6;
      for(let twig=0;twig<twigN;twig++){
        const q=.16+twig*.17,side=twig%2===0?1:-1,bx=cx+Math.cos(a)*len*q,by=y+len*.025*q-droop*q*.65,bz=cz+Math.sin(a)*len*q;
        const aa=a+side*rand(.52,.92),tl=len*rand(.14,.22)*(1-t*.25);
        const mid=[bx+Math.cos(aa)*tl*.52,by+tl*.13,bz+Math.sin(aa)*tl*.52],end=[bx+Math.cos(aa)*tl,by+tl*.16+rand(.2,1.1),bz+Math.sin(aa)*tl];
        addTube(posB,idxB,[[bx,by,bz],mid,end],sapling ? .12 : .22,.018,5,6,.16);
        for(let n=0;n<10;n++){
          const a2=aa+n*Math.PI*2/11+rand(-.18,.18),p=[end[0]-Math.cos(aa)*rand(0,.7),end[1]-rand(0,.35),end[2]-Math.sin(aa)*rand(0,.7)];
          addNeedle(p,[Math.cos(a2)*.68+Math.cos(aa)*.35,.22+rand(.05,.48),Math.sin(a2)*.68+Math.sin(aa)*.35],rand(sapling ? .42 : .95,sapling ? .82 : 2.2),sapling ? .045 : .105);
        }
      }
    }
  }
  // Ponteiro superior e raminhos terminais irregulares, sem tufo esférico.
  addTube(posB,idxB,[[cx,altura*.84,cz],[cx+.2,altura*.94,cz-.15],[cx-.1,altura,cz+.1]],sapling ? .13 : .28,.025,7,14,.12);
  for(let n=0;n<14;n++){const a=n/14*Math.PI*2;addNeedle([cx+Math.cos(a)*.25,altura*.91,cz+Math.sin(a)*.25],[Math.cos(a)*.3,.9,Math.sin(a)*.3],sapling ? .55 : 1.2,sapling ? .035 : .08);}
  return {tronco:toGeo(posT,idxT),galhos:toGeo(posB,idxB),copa:toGeo(posF,idxF),altura,raioBase,raizes:rootPaths};
}
function criarSecundariaGeo(seed){return criarPinheiroGeo(seed,'sub-bosque');}

// ============================================================================
// 14. INSTANCIAMENTO — PINHEIROS E SECUNDÁRIAS
// ============================================================================
const colisores = [];
const ROOT_WALKS = [];
const ARCHITECTURE_CLEARINGS = [
  [410,-110,54],[150,-80,54],[-60,-165,54],[305,-92,42],[0,0,30],
  [470,-180,13],[155,-120,13],[-75,-165,13],[20,18,13],
  [350,-18,28],[215,-82,27],[165,-235,27],[520,-142,28],
  [250,-40,48],[200,-160,28],[120,70,28],[-180,220,26],[-600,60,28]
];
function pertoDaArquitetura(x,z,extra=0){
  for(const p of ARCHITECTURE_CLEARINGS)
    if(Math.hypot(x-p[0],z-p[1])<p[2]+extra)return true;
  return false;
}
const PINHEIROS = [];
const N_TENT = 6200;
for (let i = 0; i < N_TENT; i++) {
  const x = (Math.random()-0.5) * 2900;
  const z = (Math.random()-0.5) * 2900;
  if (Math.abs(x) > 1450 || Math.abs(z) > 1450) continue;
  if (emClareira(x, z, 6) || pertoDaArquitetura(x,z)) continue;
  if (distanciaCaminhos(x, z) < 4.5) continue;
  if (Math.hypot(x + 380, z - 520) < 180) continue;
  const distOrig = Math.hypot(x, z);
  const prob = distOrig < 120 ? 0.20 : (x < 0 ? 0.92 : 0.78);
  if (Math.random() > prob) continue;
  PINHEIROS.push({ x, z });
}

const VARIANTES_PINHEIRO = [criarPinheiroGeo(0), criarPinheiroGeo(50), criarPinheiroGeo(120), criarPinheiroGeo(200)];
const gruposPinheiro = VARIANTES_PINHEIRO.map(() => []);
for (const p of PINHEIROS) gruposPinheiro[Math.floor(Math.random()*VARIANTES_PINHEIRO.length)].push(p);

VARIANTES_PINHEIRO.forEach((variante, vi) => {
  const lista = gruposPinheiro[vi];
  if (lista.length === 0) return;
  const imT=new THREE.InstancedMesh(variante.tronco,MATERIAIS.tronco,lista.length);
  const imB=new THREE.InstancedMesh(variante.galhos,MATERIAIS.galho,lista.length);
  const imC=new THREE.InstancedMesh(variante.copa,MATERIAIS.copa,lista.length);
  imT.castShadow=false;imT.receiveShadow=true;imB.castShadow=false;imB.receiveShadow=true;imC.castShadow=false;imC.receiveShadow=true;
  const dummy=new THREE.Object3D();
  lista.forEach((p,i)=>{
    const baseY=alturaTerreno(p.x,p.z),rotation=Math.random()*Math.PI*2;
    dummy.position.set(p.x,baseY,p.z);dummy.rotation.y=rotation;
    const scale=.98+Math.random()*.20,scaleY=scale*1.06;dummy.scale.set(scale*1.16,scaleY,scale*1.16);dummy.updateMatrix();
    imT.setMatrixAt(i,dummy.matrix);imB.setMatrixAt(i,dummy.matrix);imC.setMatrixAt(i,dummy.matrix);
    imC.setColorAt(i,new THREE.Color().setHSL(.265+Math.random()*.055,.42+Math.random()*.16,.37+Math.random()*.11));
    colisores.push({x:p.x,z:p.z,raio:variante.raioBase+.7});
    if(Math.hypot(p.x,p.z)<700){
      const cs=Math.cos(rotation),sn=Math.sin(rotation);
      for(let ri=0;ri<variante.raizes.length;ri+=6){
        const root=variante.raizes[ri],points=root.points.map(v=>[
          p.x+(v[0]*cs+v[2]*sn)*scale,
          baseY+v[1]*scaleY,
          p.z+(-v[0]*sn+v[2]*cs)*scale
        ]);
        ROOT_WALKS.push({points,r0:root.radius*scale,r1:.035*scale});
      }
    }
  });
  imT.instanceMatrix.needsUpdate=true;imB.instanceMatrix.needsUpdate=true;imC.instanceMatrix.needsUpdate=true;
  if(imC.instanceColor)imC.instanceColor.needsUpdate=true;scene.add(imT);scene.add(imB);scene.add(imC);
});

const SECUNDARIAS = [];
for (let i = 0; i < 2000; i++) {
  const x = (Math.random()-0.5) * 2900;
  const z = (Math.random()-0.5) * 2900;
  if (Math.abs(x) > 1450 || Math.abs(z) > 1450) continue;
  if (emClareira(x, z, 5) || pertoDaArquitetura(x,z)) continue;
  if (distanciaCaminhos(x, z) < 4) continue;
  if (Math.hypot(x + 380, z - 520) < 180) continue;
  SECUNDARIAS.push({ x, z });
}
const VARIANTES_SEC = [criarSecundariaGeo(1), criarSecundariaGeo(77), criarSecundariaGeo(150)];
const gruposSec = VARIANTES_SEC.map(() => []);
for (const s of SECUNDARIAS) gruposSec[Math.floor(Math.random()*VARIANTES_SEC.length)].push(s);

VARIANTES_SEC.forEach((variante, vi) => {
  const lista = gruposSec[vi];
  if (lista.length === 0) return;
  const imT=new THREE.InstancedMesh(variante.tronco,MATERIAIS.tronco,lista.length);
  const imB=new THREE.InstancedMesh(variante.galhos,MATERIAIS.galho,lista.length);
  const imC=new THREE.InstancedMesh(variante.copa,MATERIAIS.copa,lista.length);
  imT.castShadow=false;imT.receiveShadow=true;imB.castShadow=false;imB.receiveShadow=true;imC.castShadow=false;imC.receiveShadow=true;
  const dummy=new THREE.Object3D();
  lista.forEach((s,i)=>{
    const baseY=alturaTerreno(s.x,s.z),rotation=Math.random()*Math.PI*2;
    dummy.position.set(s.x,baseY,s.z);dummy.rotation.y=rotation;
    const scale=.92+Math.random()*.18,scaleY=scale*1.05;dummy.scale.set(scale*1.18,scaleY,scale*1.18);dummy.updateMatrix();
    imT.setMatrixAt(i,dummy.matrix);imB.setMatrixAt(i,dummy.matrix);imC.setMatrixAt(i,dummy.matrix);
    imC.setColorAt(i,new THREE.Color().setHSL(.255+Math.random()*.055,.38+Math.random()*.16,.34+Math.random()*.11));
    colisores.push({x:s.x,z:s.z,raio:variante.raioBase+.35});
    if(Math.hypot(s.x,s.z)<700){
      const cs=Math.cos(rotation),sn=Math.sin(rotation);
      for(let ri=0;ri<variante.raizes.length;ri+=6){
        const root=variante.raizes[ri],points=root.points.map(v=>[
          s.x+(v[0]*cs+v[2]*sn)*scale,
          baseY+v[1]*scaleY,
          s.z+(-v[0]*sn+v[2]*cs)*scale
        ]);
        ROOT_WALKS.push({points,r0:root.radius*scale,r1:.035*scale});
      }
    }
  });
  imT.instanceMatrix.needsUpdate=true;imB.instanceMatrix.needsUpdate=true;imC.instanceMatrix.needsUpdate=true;
  if(imC.instanceColor)imC.instanceColor.needsUpdate=true;scene.add(imT);scene.add(imB);scene.add(imC);
});

// ============================================================================
// 15. VEGETAÇÃO RASTEIRA
// ============================================================================
function criarSamambaiaGeo(){
  const pos=[],idx=[];
  function blade(p,dir,len,w){
    const d=new THREE.Vector3(...dir).normalize(),ref=Math.abs(d.y)>.8?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
    const side=new THREE.Vector3().crossVectors(d,ref).normalize().multiplyScalar(w),mid=new THREE.Vector3(...p).addScaledVector(d,.55*len),tip=new THREE.Vector3(...p).addScaledVector(d,len),n=pos.length/3;
    pos.push(p[0],p[1],p[2],mid.x+side.x,mid.y+side.y,mid.z+side.z,tip.x,tip.y,tip.z,mid.x-side.x,mid.y-side.y,mid.z-side.z);
    idx.push(n,n+1,n+2,n,n+2,n+3);
  }
  // Frondes curvas; cada eixo tem dezenas de folíolos laterais.
  for(let f=0;f<9;f++){
    const a=f/9*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),len=.95+Math.random()*.72,h=.82+Math.random()*.55;
    const stem=[];
    for(let j=0;j<=7;j++){const t=j/7;stem.push([dx*len*t,h*(Math.sin(t*Math.PI*.78)*.72+t*.22),dz*len*t]);}
    for(let j=0;j<7;j++){
      const A=new THREE.Vector3(...stem[j]),B=new THREE.Vector3(...stem[j+1]),side=new THREE.Vector3(-dz,0,dx).normalize().multiplyScalar(.026),n=pos.length/3;
      pos.push(A.x+side.x,A.y,A.z+side.z,A.x-side.x,A.y,A.z-side.z,B.x+side.x,B.y,B.z+side.z,B.x-side.x,B.y,B.z-side.z);
      idx.push(n,n+2,n+1,n+1,n+2,n+3);
    }
    for(let j=1;j<=11;j++){
      const t=j/12,p=[dx*len*t,h*(Math.sin(t*Math.PI*.78)*.72+t*.22),dz*len*t],spread=.5*(1-t)+.12;
      for(const sign of [-1,1])blade(p,[dx*.28-dz*sign*.92,-.15+(.12*(1-t)),dz*.28+dx*sign*.92],spread,.075*(1-t*.4));
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function criarArbustoGeo(){
  const pos=[],idx=[];
  function blade(p,dir,len,w){
    const d=new THREE.Vector3(...dir).normalize(),ref=Math.abs(d.y)>.8?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
    const side=new THREE.Vector3().crossVectors(d,ref).normalize().multiplyScalar(w),mid=new THREE.Vector3(...p).addScaledVector(d,len*.5),tip=new THREE.Vector3(...p).addScaledVector(d,len),n=pos.length/3;
    pos.push(p[0],p[1],p[2],mid.x+side.x,mid.y+side.y,mid.z+side.z,tip.x,tip.y,tip.z,mid.x-side.x,mid.y-side.y,mid.z-side.z);
    idx.push(n,n+1,n+2,n,n+2,n+3);
  }
  for(let s=0;s<15;s++){
    const a=s/15*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),h=.7+Math.random()*.95,r=.35+Math.random()*.55;
    const base=[0,0,0],mid=[dx*r*.5,h*.48,dz*r*.5],tip=[dx*r,h,dz*r];
    blade(mid,[dx*.5,.55,dz*.5],.34,.07);
    for(let k=0;k<5;k++){
      const t=.22+k*.14,p=[dx*r*t,h*(.34+t*.54),dz*r*t],side=k%2?1:-1;
      blade(p,[dx*.18-dz*side*.92,.22,dz*.18+dx*side*.92],.2+Math.random()*.22,.045);
    }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
function criarPedraGeo() {
  const g = new THREE.DodecahedronGeometry(0.5, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + (fbm(x*2, z*2, 3)-0.5)*0.6 + (fbm(y*3, x*3, 2)-0.5)*0.3;
    p.setXYZ(i, x*n*0.9, y*n*0.55, z*n*0.9);
  }
  g.computeVertexNormals();
  return g;
}

function distribuirRasteira(geo,material,count,minH,maxH,raioColisao=0){
  const lista=[];let tentativas=0;
  while(lista.length<count && tentativas<count*5){
    tentativas++;
    const cx=(Math.random()-.5)*2900,cz=(Math.random()-.5)*2900;
    if(emClareira(cx,cz,3)||distanciaCaminhos(cx,cz)<2||Math.hypot(cx+380,cz-520)<60)continue;
    const densidade=8+Math.floor(Math.random()*16),raio=4+Math.random()*12;
    for(let j=0;j<densidade && lista.length<count;j++){
      const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*raio,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
      if(emClareira(x,z,2)||distanciaCaminhos(x,z)<1.7)continue;
      lista.push({x,z,s:minH+Math.random()*(maxH-minH),r:Math.random()*Math.PI*2});
    }
  }
  if(!lista.length)return;
  const im=new THREE.InstancedMesh(geo,material,lista.length);im.castShadow=false;im.receiveShadow=false;
  const dummy=new THREE.Object3D();
  lista.forEach((o,i)=>{dummy.position.set(o.x,alturaTerreno(o.x,o.z),o.z);dummy.rotation.y=o.r;dummy.scale.setScalar(o.s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);if(raioColisao>0)colisores.push({x:o.x,z:o.z,raio:raioColisao});});
  im.instanceMatrix.needsUpdate=true;scene.add(im);
}
distribuirRasteira(criarSamambaiaGeo(), new THREE.MeshStandardMaterial({ color: 0x3a6a3a, side: THREE.DoubleSide, roughness: 0.9 }), 2000, 0.8, 2.25);
distribuirRasteira(criarArbustoGeo(), new THREE.MeshStandardMaterial({ color: 0x4a6a3a, roughness: 0.9 }), 1100, 0.7, 1.9, 0.8);
distribuirRasteira(criarPedraGeo(), MATERIAIS.pedra, 200, 0.6, 1.6, 0.7);

// Capins de sub-bosque em touceiras: lâminas longas, finas e arqueadas.
function criarGramaGeo(){
  const pos=[],idx=[];
  for(let blade=0;blade<24;blade++){
    const a=blade/24*Math.PI*2+Math.random()*.22,dx=Math.cos(a),dz=Math.sin(a);
    const rootR=.08+Math.random()*.28,len=.55+Math.random()*1.05,width=.025+Math.random()*.035;
    const bx=dx*rootR,bz=dz*rootR,lean=(Math.random()-.5)*.35;
    const mx=bx+dx*len*.38+lean,mz=bz+dz*len*.38;
    const tx=bx+dx*len*.72+lean*2,tz=bz+dz*len*.72;
    const sideX=-dz*width,sideZ=dx*width,n=pos.length/3;
    pos.push(bx,0,bz,mx+sideX,.42*len,mz+sideZ,tx,len,tz,mx-sideX,.42*len,mz-sideZ);
    idx.push(n,n+1,n+2,n,n+2,n+3);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;
}
distribuirRasteira(criarGramaGeo(),new THREE.MeshStandardMaterial({color:0x52683c,roughness:1,side:THREE.DoubleSide}),2400,.62,1.25);

// CAMADA EXTRA DE FLORESTA — vegetação de transição, troncos caídos e musgo.
function criarLogGeo(){
  const g=new THREE.CylinderGeometry(0.42,0.66,1,14,12);g.rotateZ(Math.PI/2);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setY(i,p.getY(i)*(1+Math.sin(x*9)*0.06));p.setZ(i,p.getZ(i)*(1+Math.cos(x*7)*0.08));}g.computeVertexNormals();return g;
}
const logGeo=criarLogGeo(), logMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x5a4938,roughness:1});
const logs=[];
for(let i=0;i<420;i++){
  const x=(Math.random()-0.5)*2850,z=(Math.random()-0.5)*2850;
  if(emClareira(x,z,4)||distanciaCaminhos(x,z)<3||Math.hypot(x+380,z-520)<155)continue;
  logs.push({x,z,len:5+Math.random()*15,rot:Math.random()*Math.PI,thick:.75+Math.random()*.8});
}
if(logs.length){const im=new THREE.InstancedMesh(logGeo,logMat,logs.length);im.castShadow=false;im.receiveShadow=false;const d=new THREE.Object3D();logs.forEach((o,i)=>{d.position.set(o.x,alturaTerreno(o.x,o.z)+0.35,o.z);d.rotation.set(0,o.rot,Math.random()*0.18);d.scale.set(o.len,o.thick,o.thick);d.updateMatrix();im.setMatrixAt(i,d.matrix);});im.instanceMatrix.needsUpdate=true;scene.add(im);}
const logEndGeo=new THREE.CircleGeometry(.54,16);logEndGeo.rotateY(Math.PI/2);
const logEndMat=new THREE.MeshStandardMaterial({color:0x92734d,roughness:1,side:THREE.DoubleSide});
if(logs.length){
  const ends=new THREE.InstancedMesh(logEndGeo,logEndMat,logs.length*2),d=new THREE.Object3D();
  logs.forEach((o,i)=>{
    const y=alturaTerreno(o.x,o.z)+.35;
    for(let s=0;s<2;s++){
      const sign=s===0?-1:1;
      d.position.set(o.x+Math.cos(o.rot)*o.len*.5*sign,y,o.z-Math.sin(o.rot)*o.len*.5*sign);
      d.rotation.set(0,o.rot,0);d.scale.set(1,o.thick,o.thick);d.updateMatrix();ends.setMatrixAt(i*2+s,d.matrix);
    }
  });
  ends.instanceMatrix.needsUpdate=true;scene.add(ends);
}
// Musgo/rosetas pequenas em manchas, em vez de distribuição uniforme de props.
const mossGeo=new THREE.BufferGeometry();
{
  const p=[0,.012,0],idx=[],n=22,phase=Math.random()*Math.PI*2;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.78+.16*Math.sin(a*3+phase)+.09*Math.sin(a*7);p.push(Math.cos(a)*r,.008+Math.random()*.015,Math.sin(a)*r);}
  for(let i=0;i<n;i++)idx.push(0,i+1,(i+1)%n+1);
  mossGeo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));mossGeo.setIndex(idx);mossGeo.computeVertexNormals();
}
const mossMat=new THREE.MeshStandardMaterial({color:0x465b2e,roughness:1,side:THREE.DoubleSide});
const moss=[];
for(let patch=0;patch<400;patch++){
  const cx=(Math.random()-.5)*2850,cz=(Math.random()-.5)*2850;
  if(emClareira(cx,cz,2)||distanciaCaminhos(cx,cz)<2||Math.hypot(cx+380,cz-520)<150)continue;
  const count=3+Math.floor(Math.random()*7),radius=2+Math.random()*7;
  for(let j=0;j<count;j++){
    const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*radius;
    moss.push({x:cx+Math.cos(a)*r,z:cz+Math.sin(a)*r,s:.65+Math.random()*2.1});
  }
}
if(moss.length){
  const im=new THREE.InstancedMesh(mossGeo,mossMat,moss.length),d=new THREE.Object3D();
  moss.forEach((o,i)=>{d.position.set(o.x,alturaTerreno(o.x,o.z)+.035,o.z);d.rotation.y=Math.random()*6.28;d.scale.set(o.s,.65,o.s*(.65+Math.random()*.5));d.updateMatrix();im.setMatrixAt(i,d.matrix);});
  im.instanceMatrix.needsUpdate=true;im.receiveShadow=true;scene.add(im);
}
// ============================================================================
// 16. SUB-BOSQUE PROFUNDO + SOLO FLORESTAL ORGÂNICO
// ============================================================================
// Camadas adicionais: folhas largas, touceiras, raízes superficiais e manchas
// de serapilheira. Instancing mantém a cena leve apesar da densidade.
const leafMatA = new THREE.MeshStandardMaterial({color:0x354f2b,roughness:1,side:THREE.DoubleSide});
const leafMatB = new THREE.MeshStandardMaterial({color:0x53683a,roughness:1,side:THREE.DoubleSide});
const leafGeo = new THREE.BufferGeometry();
{
  const v=[],ix=[];
  for(let k=0;k<8;k++){
    const a=k*Math.PI*2/8,dx=Math.cos(a),dz=Math.sin(a),w=.035+Math.random()*.025,len=.28+Math.random()*.48,base=v.length/3;
    v.push(0,.012,0,dx*len*.48-dz*w,.035,dz*len*.48+dx*w,dx*len,.018,dz*len,dx*len*.48+dz*w,.025,dz*len*.48-dx*w);
    ix.push(base,base+1,base+2,base,base+2,base+3);
  }
  leafGeo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));leafGeo.setIndex(ix);leafGeo.computeVertexNormals();
}
function scatterInstanced(geo,mat,count,scaleMin,scaleMax,excludeClearings=true){
  const d=new THREE.Object3D(), list=[];
  for(let i=0;i<count;i++){
    const x=(Math.random()-.5)*2900,z=(Math.random()-.5)*2900;
    if(excludeClearings && emClareira(x,z,2))continue;
    if(distanciaCaminhos(x,z)<1.3 || Math.hypot(x+380,z-520)<145)continue;
    list.push({x,z,s:scaleMin+Math.random()*(scaleMax-scaleMin),r:Math.random()*Math.PI*2});
  }
  if(!list.length)return;
  const im=new THREE.InstancedMesh(geo,mat,list.length); im.receiveShadow=true;
  list.forEach((o,i)=>{d.position.set(o.x,alturaTerreno(o.x,o.z)+0.03,o.z);d.rotation.set((Math.random()-.5)*.18,o.r,(Math.random()-.5)*.18);d.scale.setScalar(o.s);d.updateMatrix();im.setMatrixAt(i,d.matrix);if(im.instanceColor){} });
  im.instanceMatrix.needsUpdate=true;scene.add(im);
}
scatterInstanced(leafGeo,leafMatA,2400,0.65,1.8);
scatterInstanced(leafGeo,leafMatB,1400,0.45,1.35);

// Raízes estruturais já fazem parte do tronco e se projetam pelo terreno.

// Serapilheira natural: pequenas agulhas, folhas secas e fragmentos de casca.
const litterGeo=new THREE.BufferGeometry(),litterPos=[],litterIdx=[];
for(let k=0;k<7;k++){
  const a=k/7*Math.PI*2,w=.045+Math.random()*.045,len=.25+Math.random()*.42,n=litterPos.length/3;
  litterPos.push(0,.012,0,Math.cos(a)*w,.02,Math.sin(a)*w,Math.cos(a)*len,.008,Math.sin(a)*len,-Math.sin(a)*w,.016,Math.cos(a)*w);
  litterIdx.push(n,n+1,n+2,n,n+2,n+3);
}
litterGeo.setAttribute('position',new THREE.Float32BufferAttribute(litterPos,3));litterGeo.setIndex(litterIdx);litterGeo.computeVertexNormals();
const litterMats=[0x55452f,0x756142,0x39452d,0x8a7650].map(color=>new THREE.MeshStandardMaterial({color,roughness:1,side:THREE.DoubleSide}));
for(let m=0;m<litterMats.length;m++){
  const bits=[];
  for(let patch=0;patch<220;patch++){
    const cx=(Math.random()-.5)*2900,cz=(Math.random()-.5)*2900;
    if(emClareira(cx,cz,2)||distanciaCaminhos(cx,cz)<1.5)continue;
    const amount=13+Math.floor(Math.random()*24),radius=3+Math.random()*12;
    for(let j=0;j<amount;j++){
      const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*radius;
      const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
      if(emClareira(x,z,1)||distanciaCaminhos(x,z)<1.4)continue;
      bits.push({x,z,s:.35+Math.random()*1.65,r:Math.random()*Math.PI*2});
    }
  }
  const im=new THREE.InstancedMesh(litterGeo,litterMats[m],bits.length),d=new THREE.Object3D();
  bits.forEach((o,i)=>{d.position.set(o.x,alturaTerreno(o.x,o.z)+.025,o.z);d.rotation.set((Math.random()-.5)*.08,o.r,(Math.random()-.5)*.08);d.scale.setScalar(o.s);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
  im.instanceMatrix.needsUpdate=true;im.receiveShadow=true;scene.add(im);
}
