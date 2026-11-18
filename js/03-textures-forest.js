// ============================================================================
 // 12. ÁRVORES PROCEDURAIS — troncos altos, ramificação estrutural e agulhas
 // ============================================================================
function criarPinheiroGeo(seed,tipo='adulto'){
  const rand=(a,b)=>a+Math.random()*(b-a),sapling=tipo==='sub-bosque',highCanopy=tipo==='corredor';
  const altura=sapling?rand(90,144):rand(225,270);
  const raioBase=sapling?rand(2.1,3.2):rand(5.2,6.2);
  const topoRaio=sapling ? .14 : .30;
  const crownStart=altura*(highCanopy?.86:(sapling?rand(.15,.22):rand(.38,.46)));
  const posT=[],idxT=[],posB=[],idxB=[],posF=[],idxF=[],rootPaths=[],rootMaskT=[],rootOffsetT=[];
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
        if(pos===posT){rootMaskT.push(0);rootOffsetT.push(0);}
      }
    }
    for(let s=0;s<segments;s++)for(let k=0;k<radial;k++){
      const p=base+s*radial+k,q=base+s*radial+(k+1)%radial,r=base+(s+1)*radial+k,t=base+(s+1)*radial+(k+1)%radial;
      idx.push(p,q,r,q,t,r);
    }
  }
  function addNeedle(p,dir,len,width){
    const d=new THREE.Vector3(...dir).normalize(),ref=Math.abs(d.y)>.86?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
    const sideA=new THREE.Vector3().crossVectors(d,ref).normalize().multiplyScalar(width);
    const sideB=new THREE.Vector3().crossVectors(d,sideA).normalize().multiplyScalar(width*.82);
    const lift=new THREE.Vector3().crossVectors(sideA,d).normalize().multiplyScalar(width*.22);
    const base=posF.length/3,origin=new THREE.Vector3(...p),mid=origin.clone().addScaledVector(d,len*.52).add(lift);
    const tip=origin.clone().addScaledVector(d,len);
    const l1=mid.clone().add(sideA),r1=mid.clone().sub(sideA),l2=mid.clone().add(sideB),r2=mid.clone().sub(sideB);
    posF.push(origin.x,origin.y,origin.z,l1.x,l1.y,l1.z,tip.x,tip.y,tip.z,r1.x,r1.y,r1.z,
      l2.x,l2.y,l2.z,tip.x,tip.y,tip.z,r2.x,r2.y,r2.z);
    idxF.push(base,base+1,base+2,base,base+2,base+3,base,base+4,base+5,base,base+5,base+6);
  }
  function toGeo(pos,idx,rootMask=null,rootOffset=null){
    const g=new THREE.BufferGeometry(),uv=[];
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    for(let i=0;i<pos.length;i+=3){
      const x=pos[i],y=pos[i+1],z=pos[i+2],angle=Math.atan2(z,x);
      uv.push(angle/(Math.PI*2)+.5,y*.055+Math.hypot(x,z)*.035);
    }
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    if(rootMask){g.setAttribute('rootMask',new THREE.Float32BufferAttribute(rootMask,1));g.setAttribute('rootOffset',new THREE.Float32BufferAttribute(rootOffset,1));}
    g.setIndex(idx);g.computeVertexNormals();return g;
  }

  // Eixo principal onduloso: o tronco serpenteia antes de se dividir em quatro líderes.
  const splitRatio=highCanopy?.82:.54;
  const trunkCenter=t=>({
    x:cx+Math.sin(t*4.6+seed*.07)*8*t+Math.sin(t*11.2+seed)*1.8*t,
    z:cz+Math.sin(t*3.9+seed*.11)*7*t+Math.cos(t*9.1+seed*.4)*1.6*t
  });
  const trunk=[];
  for(let s=0;s<=30;s++){
    const t=s/30*splitRatio,c=trunkCenter(t);
    trunk.push([c.x,t*altura,c.z]);
  }
  addTube(posT,idxT,trunk,raioBase*1.62,raioBase*.52,20,56,.19);
  const leaders=[],forkBase=trunkCenter(splitRatio);
  for(let i=0;i<4;i++){
    const angle=i/4*Math.PI*2+.23+(seed%9)*.07,reach=34+rand(8,19),sway=rand(5,11),pts=[];
    for(let j=0;j<=14;j++){
      const t=j/14,ratio=splitRatio+(1-splitRatio)*t;
      const wave=Math.sin(t*4.1+i*1.7)*sway*t,second=Math.sin(t*8.5+i*2.3)*3.8*t;
      const spread=reach*t+wave+second;
      pts.push([forkBase.x+Math.cos(angle)*spread+Math.sin(t*2.9+i)*4.2*t,
        altura*ratio,forkBase.z+Math.sin(angle)*spread+Math.cos(t*2.6+i)*4.0*t]);
    }
    addTube(posT,idxT,pts,raioBase*.62,.26,16,42,.21);
    leaders.push({angle,curve:new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),false,'centripetal',.38)});
  }
  for(let rib=0;rib<12;rib++){
    const a=rib/12*Math.PI*2+(seed%7)*.08,pts=[];
    for(let j=0;j<=12;j++){
      const t=j/12*splitRatio,c=trunkCenter(t),r=raioBase*1.5*(1-t*.72),aa=a+Math.sin(t*13+rib)*.11;
      pts.push([c.x+Math.cos(aa)*(r+.12),t*altura,c.z+Math.sin(aa)*(r+.12)]);
    }
    addTube(posT,idxT,pts,.20+raioBase*.035,.055,5,20,.18);
  }
  // Roots are broad and flattened against the terrain, never suspended arches.
  function addGroundRoot(pos,idx,points,r0,r1,radial=10,segments=28,irregular=.14){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.38);
    const frames=curve.computeFrenetFrames(segments,false),base=pos.length/3;
    for(let s=0;s<=segments;s++){
      const t=s/segments,center=curve.getPointAt(t),radius=r0*(1-t)+r1*t;
      const tangent=frames.tangents[s],lateral=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
      for(let k=0;k<radial;k++){
        const a=k/radial*Math.PI*2,w=1+Math.sin(a*3+seed+t*7)*irregular;
        const side=radius*Math.cos(a)*w,vertical=radius*.18*Math.sin(a)*w;
        pos.push(center.x+lateral.x*side,center.y+vertical,center.z+lateral.z*side);
        rootMaskT.push(1);rootOffsetT.push(vertical + radius*.18);
      }
    }
    for(let s=0;s<segments;s++)for(let k=0;k<radial;k++){
      const a=base+s*radial+k,b=base+s*radial+(k+1)%radial,c=base+(s+1)*radial+k,d=base+(s+1)*radial+(k+1)%radial;
      idx.push(a,b,c,b,d,c);
    }
  }

  const rootCount=sapling?6:12;
  for(let r=0;r<rootCount;r++){
    const a=r/rootCount*Math.PI*2+rand(-.22,.22),len=sapling?rand(8,14):rand(24,40);
    const side=Math.sin(a*2+seed)*rand(1.6,3.8);
    const root=[
      [cx+Math.cos(a)*raioBase*.82,.10,cz+Math.sin(a)*raioBase*.82],
      [cx+Math.cos(a)*len*.30+Math.cos(a+Math.PI/2)*side*.45,.11,cz+Math.sin(a)*len*.30+Math.sin(a+Math.PI/2)*side*.45],
      [cx+Math.cos(a)*len*.68+Math.cos(a+Math.PI/2)*side,.07,cz+Math.sin(a)*len*.68+Math.sin(a+Math.PI/2)*side],
      [cx+Math.cos(a)*len,.035,cz+Math.sin(a)*len]
    ];
    const rootRadius=raioBase*rand(.14,.20);
    addGroundRoot(posT,idxT,root,rootRadius,.05,8,20,.18);
    rootPaths.push({points:root.map(p=>p.slice()),radius:rootRadius});
    if(r%2===0){
      const fork=root[2],fa=a+rand(-.72,.72),fl=len*rand(.30,.48);
      const forkPoints=[fork,[fork[0]+Math.cos(fa)*fl*.48,.075,fork[2]+Math.sin(fa)*fl*.48],
        [fork[0]+Math.cos(fa)*fl,.035,fork[2]+Math.sin(fa)*fl]];
      addGroundRoot(posT,idxT,forkPoints,rootRadius*.42,.035,6,14,.15);
      rootPaths.push({points:forkPoints.map(p=>p.slice()),radius:rootRadius*.42});
    }
  }

  const levels=sapling?10:9,arms=sapling?11:10,baseReach=sapling?rand(29,37):rand(52,70);
  for(let level=0;level<levels;level++){
    const t=level/(levels-1),y=crownStart+t*(altura-crownStart)*.94,ratio=y/altura;
    const reach=baseReach*(1-t*.78)+3.2,count=arms+(level%2);
    for(let arm=0;arm<count;arm++){
      const a=arm/count*Math.PI*2+level*.41+rand(-.18,.18);
      let anchor;
      if(ratio<splitRatio)anchor=trunkCenter(ratio);
      else{
        let nearest=leaders[0],best=Infinity;
        for(const leader of leaders){
          const diff=Math.abs(Math.atan2(Math.sin(a-leader.angle),Math.cos(a-leader.angle)));
          if(diff<best){best=diff;nearest=leader;}
        }
        const u=THREE.MathUtils.clamp((ratio-splitRatio)/(1-splitRatio),0,1);
        const p=nearest.curve.getPointAt(u);anchor={x:p.x,z:p.z};
      }
      const len=reach*rand(sapling?.92:.82,sapling?1.16:1.2),droop=(1-t)*len*(sapling?.055:.12);
      const root=[anchor.x+Math.cos(a)*.55,y,anchor.z+Math.sin(a)*.55];
      const p1=[anchor.x+Math.cos(a)*len*.30+Math.cos(a+1.2)*4,y+len*.06,anchor.z+Math.sin(a)*len*.30+Math.sin(a+1.2)*4];
      const p2=[anchor.x+Math.cos(a)*len*.68+Math.sin(a*2+level)*4,y+len*.10-droop*.28,anchor.z+Math.sin(a)*len*.68+Math.cos(a*2+level)*4];
      const tip=[anchor.x+Math.cos(a)*len,y+len*.04-droop,anchor.z+Math.sin(a)*len];
      const branchPoints=[root,p1,p2,tip];
      addTube(posB,idxB,branchPoints,sapling?.58:1.55,sapling?.045:.16,6,16,.18);
      const branchCurve=new THREE.CatmullRomCurve3(branchPoints.map(p=>new THREE.Vector3(...p)),false,'centripetal',.36);
      // Folhagem distribuída por todo o galho principal: não deixar madeira exposta
      // entre o tronco e as pontas. As folhas se alternam em torno do eixo do ramo.
      const foliageStations=sapling?8:7,leafRing=4;
      for(let s=1;s<=foliageStations;s++){
        const q=s/(foliageStations+1),p=branchCurve.getPoint(q),tangent=branchCurve.getTangent(q);
        for(let n=0;n<leafRing;n++){
          const aa=a+n*Math.PI*2/leafRing+(s%2)*.24+rand(-.22,.22);
          const dir=[Math.cos(aa)*.72+tangent.x*.30,.25+rand(.08,.48)+Math.max(0,tangent.y)*.12,Math.sin(aa)*.72+tangent.z*.30];
          addNeedle([p.x+Math.cos(aa)*rand(.12,.42),p.y+rand(-.24,.38),p.z+Math.sin(aa)*rand(.12,.42)],dir,
            rand(sapling?1.25:1.45,sapling?2.15:2.55),sapling?.22:.24);
        }
      }

      // Ramos secundários também recebem folhas ao longo do eixo inteiro,
      // e não somente um tufo concentrado na extremidade.
      const twigN=sapling?5:4;
      for(let twig=0;twig<twigN;twig++){
        const q=sapling?.10+twig*.105:.13+twig*.12,side=twig%2===0?1:-1,base=branchCurve.getPoint(q);
        const aa=a+side*rand(.48,.98),tl=len*rand(sapling?.19:.15,sapling?.31:.24)*(1-t*.2);
        const mid=[base.x+Math.cos(aa)*tl*.48,base.y+tl*.19+2,base.z+Math.sin(aa)*tl*.48];
        const end=[base.x+Math.cos(aa)*tl,base.y+tl*.28+rand(1,3),base.z+Math.sin(aa)*tl];
        addTube(posB,idxB,[[base.x,base.y,base.z],mid,end],sapling?.21:.58,.035,5,10,.18);
        const twigCurve=new THREE.CatmullRomCurve3([[base.x,base.y,base.z],mid,end].map(p=>new THREE.Vector3(...p)),false,'centripetal',.36);
        const twigStations=sapling?3:2,twigLeaves=3;
        for(let st=1;st<=twigStations;st++){
          const u=st/(twigStations+1),tp=twigCurve.getPoint(u);
          for(let n=0;n<twigLeaves;n++){
            const a2=aa+n*Math.PI*2/twigLeaves+(st%2)*.31+rand(-.24,.24);
            addNeedle([tp.x+Math.cos(a2)*rand(.05,.28),tp.y+rand(-.16,.25),tp.z+Math.sin(a2)*rand(.05,.28)],
              [Math.cos(a2)*.68+Math.cos(aa)*.38,.24+rand(.08,.52),Math.sin(a2)*.68+Math.sin(aa)*.38],
              rand(sapling?1.0:1.2,sapling?1.85:2.1),sapling?.18:.20);
          }
        }
        // Pontas cheias, com folhas de vários comprimentos e orientações.
        for(let n=0;n<(sapling?11:9);n++){
          const a2=aa+n*Math.PI*2/(sapling?11:9)+rand(-.22,.22);
          const p=[end[0]-Math.cos(aa)*rand(0,sapling?1.8:1.2)+(Math.random()-.5)*(sapling?2.2:.9),end[1]-rand(0,sapling?1.0:.6),end[2]-Math.sin(aa)*rand(0,sapling?1.8:1.2)+(Math.random()-.5)*(sapling?2.2:.9)];
          addNeedle(p,[Math.cos(a2)*.68+Math.cos(aa)*.35,.22+rand(.05,.50),Math.sin(a2)*.68+Math.sin(aa)*.35],
            rand(sapling?.85:1.0,sapling?1.65:2.05),sapling?.15:.16);
        }
      }
    }
  }

  // Ponteiro superior e raminhos terminais irregulares, sem tufo esférico.
  addTube(posB,idxB,[[cx,altura*.84,cz],[cx+.2,altura*.94,cz-.15],[cx-.1,altura,cz+.1]],sapling ? .13 : .28,.025,7,14,.12);
  for(let n=0;n<(sapling?22:16);n++){
    const a=n/(sapling?22:16)*Math.PI*2;
    addNeedle([cx+Math.cos(a)*rand(.18,.72),altura*(sapling?rand(.84,.96):rand(.88,.97)),cz+Math.sin(a)*rand(.18,.72)],
      [Math.cos(a)*rand(.20,.52),.78+rand(.05,.35),Math.sin(a)*rand(.20,.52)],
      sapling?rand(1.0,1.8):rand(1.1,1.9),sapling?.16:.14);
  }
  return {tronco:toGeo(posT,idxT,rootMaskT,rootOffsetT),galhos:toGeo(posB,idxB),copa:toGeo(posF,idxF),altura,raioBase,raizes:rootPaths};
}
function criarSecundariaGeo(seed){return criarPinheiroGeo(seed,'sub-bosque');}

// ============================================================================
// 14. INSTANCIAMENTO — PINHEIROS E SECUNDÁRIAS
// ============================================================================
const colisores = [];
const ROOT_WALKS = [];
const ARCHITECTURE_CLEARINGS = [
  [410,-110,34],[150,-80,34],[350,-18,34],[-60,-165,34],[305,-92,34],[520,-142,34],
  [0,0,32],[470,-180,18],[75,-350,20],[75,-100,20],[75,150,20],
  [250,-40,52],[200,-160,34],[120,70,32],[-180,220,32],[-600,60,36],
  [450,-60,28],[285,-116,24],[-1130,1200,32],[-1100,0,28],
  [140,-300,32],[300,-260,32],[460,-220,32],
  [140,-40,32],[300,0,32],[460,40,32],
  [140,220,32],[300,260,32],[460,300,32],[640,360,50],
  [-760,-640,36],[780,700,36],[940,-760,36],[-900,740,36],[1080,420,36]
];
const ARCHITECTURE_CORRIDORS = [
  [[75,-350],[140,-280],[300,-240],[460,-200]],
  [[75,-100],[140,-20],[300,20],[460,60]],
  [[75,150],[140,240],[300,280],[460,320]],
  [[460,320],[520,332],[575,348],[616,360]]
];
function distanciaDasPassagens(x,z){
  let best=Infinity;
  for(const route of ARCHITECTURE_CORRIDORS){
    for(let i=0;i<route.length-1;i++){
      const a=route[i],b=route[i+1];
      best=Math.min(best,distanciaPontoSegmento(x,z,a[0],a[1],b[0],b[1]));
    }
  }
  return best;
}
function pertoDaArquitetura(x,z,extra=0){
  for(const p of ARCHITECTURE_CLEARINGS)
    if(Math.hypot(x-p[0],z-p[1])<p[2]+extra)return true;
  for(const route of ARCHITECTURE_CORRIDORS){
    for(let i=0;i<route.length-1;i++){
      const a=route[i],b=route[i+1];
      if(distanciaPontoSegmento(x,z,a[0],a[1],b[0],b[1])<27+extra)return true;
    }
  }
  return false;
}
const PINHEIROS = [], PINHEIROS_COPA_ALTA = [];
const N_TENT = 4100;
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
  const tree={x,z};
  if(distanciaDasPassagens(x,z)<180)PINHEIROS_COPA_ALTA.push(tree);
  else PINHEIROS.push(tree);
}

const VARIANTES_PINHEIRO = [criarPinheiroGeo(0), criarPinheiroGeo(50), criarPinheiroGeo(120), criarPinheiroGeo(200)];
const gruposPinheiro = VARIANTES_PINHEIRO.map(() => []);
for (const p of PINHEIROS) gruposPinheiro[Math.floor(Math.random()*VARIANTES_PINHEIRO.length)].push(p);

// Instanciamento por setor: cada lote ocupa uma região limitada do mapa.
// O frustum culling pode assim descartar setores inteiros fora da câmera,
// em vez de manter uma única caixa de milhares de metros sempre visível.
const TREE_RENDER_CHUNK=620;
function instanciarArvoresEmSetores(variantes,grupos,config){
  let setoresRenderizados=0;
  variantes.forEach((variante,vi)=>{
    const setores=new Map();
    for(const tree of grupos[vi]){
      const gx=Math.floor(tree.x/TREE_RENDER_CHUNK),gz=Math.floor(tree.z/TREE_RENDER_CHUNK);
      const key=gx+','+gz;
      if(!setores.has(key))setores.set(key,[]);
      setores.get(key).push(tree);
    }
    for(const lista of setores.values()){
      if(!lista.length)continue;
      const imT=new THREE.InstancedMesh(variante.tronco,MATERIAIS.tronco,lista.length);
      const imB=new THREE.InstancedMesh(variante.galhos,MATERIAIS.galho,lista.length);
      const imC=new THREE.InstancedMesh(variante.copa,MATERIAIS.copa,lista.length);
      imT.castShadow=false;imT.receiveShadow=true;
      imB.castShadow=false;imB.receiveShadow=true;
      imC.castShadow=false;imC.receiveShadow=true;
      const dummy=new THREE.Object3D();
      lista.forEach((tree,i)=>{
        const baseY=alturaTerreno(tree.x,tree.z),rotation=Math.random()*Math.PI*2;
        const scale=config.scaleMin+Math.random()*config.scaleRange,scaleY=scale*config.scaleY;
        dummy.position.set(tree.x,baseY,tree.z);dummy.rotation.y=rotation;
        dummy.scale.set(scale*config.horizontalScale,scaleY,scale*config.horizontalScale);
        dummy.updateMatrix();
        imT.setMatrixAt(i,dummy.matrix);imB.setMatrixAt(i,dummy.matrix);imC.setMatrixAt(i,dummy.matrix);
        imC.setColorAt(i,new THREE.Color().setHSL(
          config.hue+Math.random()*config.hueRange,
          config.saturation+Math.random()*config.saturationRange,
          config.lightness+Math.random()*config.lightnessRange
        ));
        colisores.push({x:tree.x,z:tree.z,
          raio:variante.raioBase*scale*config.horizontalScale+config.colliderExtra});
        if(Math.hypot(tree.x,tree.z)<700){
          const cs=Math.cos(rotation),sn=Math.sin(rotation);
          for(let ri=0;ri<variante.raizes.length;ri+=3){
            const root=variante.raizes[ri];
            const points=root.points.map(v=>[
              tree.x+(v[0]*cs+v[2]*sn)*scale,
              baseY+v[1]*scaleY,
              tree.z+(-v[0]*sn+v[2]*cs)*scale
            ]);
            for(const k of [1,2]){
              const q=points[k];
              colisores.push({x:q[0],z:q[2],raio:Math.max(config.rootMin,root.radius*scale*config.rootScale)});
            }
          }
        }
      });
      imT.instanceMatrix.needsUpdate=true;imB.instanceMatrix.needsUpdate=true;imC.instanceMatrix.needsUpdate=true;
      if(imC.instanceColor)imC.instanceColor.needsUpdate=true;
      // The chunk's instance bounds are local, so Three.js can cull it by camera.
      imT.frustumCulled=true;imB.frustumCulled=true;imC.frustumCulled=true;
      scene.add(imT,imB,imC);setoresRenderizados++;
    }
  });
  return setoresRenderizados;
}
const TREE_RENDER_CONFIG={
  scaleMin:.98,scaleRange:.20,scaleY:1.06,horizontalScale:1.16,
  hue:.265,hueRange:.055,saturation:.42,saturationRange:.16,
  lightness:.37,lightnessRange:.11,colliderExtra:.9,rootMin:.55,rootScale:.78
};
const SAPLING_RENDER_CONFIG={
  scaleMin:.92,scaleRange:.18,scaleY:1.05,horizontalScale:1.18,
  hue:.255,hueRange:.055,saturation:.38,saturationRange:.16,
  lightness:.34,lightnessRange:.11,colliderExtra:.65,rootMin:.42,rootScale:.72
};
instanciarArvoresEmSetores(VARIANTES_PINHEIRO,gruposPinheiro,TREE_RENDER_CONFIG);


// Árvores junto às passarelas: troncos nus até a copa alta, sem ramos
// atravessando o espaço de circulação suspenso.
const VARIANTES_COPA_ALTA=[
  criarPinheiroGeo(301,'corredor'),criarPinheiroGeo(402,'corredor'),
  criarPinheiroGeo(503,'corredor'),criarPinheiroGeo(604,'corredor')
];
const gruposCopa=VARIANTES_COPA_ALTA.map(()=>[]);
for(const p of PINHEIROS_COPA_ALTA){
  gruposCopa[Math.floor(Math.random()*VARIANTES_COPA_ALTA.length)].push(p);
}
instanciarArvoresEmSetores(VARIANTES_COPA_ALTA,gruposCopa,TREE_RENDER_CONFIG);

const SECUNDARIAS = [];
for (let i = 0; i < 950; i++) {
  const x = (Math.random()-0.5) * 2900;
  const z = (Math.random()-0.5) * 2900;
  if (Math.abs(x) > 1450 || Math.abs(z) > 1450) continue;
  if (emClareira(x, z, 5) || pertoDaArquitetura(x,z)) continue;
  if (distanciaCaminhos(x, z) < 4) continue;
  if (distanciaDasPassagens(x,z)<98) continue;
  if (Math.hypot(x + 380, z - 520) < 180) continue;
  SECUNDARIAS.push({ x, z });
}
const VARIANTES_SEC = [criarSecundariaGeo(1), criarSecundariaGeo(77), criarSecundariaGeo(150)];
const gruposSec = VARIANTES_SEC.map(() => []);
for (const s of SECUNDARIAS) gruposSec[Math.floor(Math.random()*VARIANTES_SEC.length)].push(s);

instanciarArvoresEmSetores(VARIANTES_SEC,gruposSec,SAPLING_RENDER_CONFIG);

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
distribuirRasteira(criarSamambaiaGeo(), new THREE.MeshStandardMaterial({ color: 0x3a6a3a, side: THREE.DoubleSide, roughness: 0.9 }), 1100, 0.9, 2.65);
distribuirRasteira(criarArbustoGeo(), new THREE.MeshStandardMaterial({ color: 0x4a6a3a, roughness: 0.9 }), 650, 0.8, 2.25, 0.8);
distribuirRasteira(criarPedraGeo(), MATERIAIS.pedra, 100, 0.6, 1.6, 0.7);

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
distribuirRasteira(criarGramaGeo(),new THREE.MeshStandardMaterial({color:0x52683c,roughness:1,side:THREE.DoubleSide}),1450,1.0,2.1);

// CAMADA EXTRA DE FLORESTA — vegetação de transição, troncos caídos e musgo.
function criarLogGeo(){
  const g=new THREE.CylinderGeometry(0.42,0.66,1,14,12);g.rotateZ(Math.PI/2);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setY(i,p.getY(i)*(1+Math.sin(x*9)*0.06));p.setZ(i,p.getZ(i)*(1+Math.cos(x*7)*0.08));}g.computeVertexNormals();return g;
}
const logGeo=criarLogGeo(), logMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x5a4938,roughness:1});
const logs=[];
for(let i=0;i<180;i++){
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
for(let patch=0;patch<260;patch++){
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
scatterInstanced(leafGeo,leafMatA,1200,0.65,1.8);
scatterInstanced(leafGeo,leafMatB,850,0.45,1.35);

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
  for(let patch=0;patch<80;patch++){
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
