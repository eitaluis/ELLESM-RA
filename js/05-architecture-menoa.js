// ============================================================================
// 18. ÁRVORE MENOA — reconstrução conforme Eldest
// ============================================================================
let raizElevadaPontos = null;
const lanternaObjs = [];
const lanternaBaseY = [];
let menoaGrupo = null;

function construirMenoa(){
  const grupo=new THREE.Group(),cx=-380,cz=520,yBase=alturaTerreno(cx,cz);
  // Livro: Menoa tem a mesma altura das árvores vizinhas; é o tronco que é
  // colossal, mais grosso que cem árvores comuns. Diâmetro de projeto: 60 m.
  const altura=245,raioBase=34,raioTopo=15;
  const trunkMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,normalMap:TEX_CASCA_N,color:0xb0956d,roughness:.98,side:THREE.DoubleSide});
  aplicarAjusteRaizesAoRelevo(trunkMat);
  const branchMat=new THREE.MeshStandardMaterial({map:TEX_GALHO,color:0x957a55,roughness:1,side:THREE.DoubleSide});
  const barkRidgeMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0xb69a6d,roughness:1,side:THREE.DoubleSide});
  const needleMats=[
    new THREE.MeshStandardMaterial({color:0x456b3d,roughness:1,side:THREE.DoubleSide}),
    new THREE.MeshStandardMaterial({color:0x567e49,roughness:1,side:THREE.DoubleSide}),
    new THREE.MeshStandardMaterial({color:0x6c8c52,roughness:1,side:THREE.DoubleSide}),
    new THREE.MeshStandardMaterial({color:0x3a5f37,roughness:1,side:THREE.DoubleSide})
  ];

  const tubeBuckets=new Map([
    [trunkMat,{pos:[],uv:[],idx:[],rootMask:[],rootOffset:[]}],
    [branchMat,{pos:[],uv:[],idx:[],rootMask:[],rootOffset:[]}],
    [barkRidgeMat,{pos:[],uv:[],idx:[],rootMask:[],rootOffset:[]}]
  ]);
  function tube(points,r0,r1,mat=trunkMat,radial=14,segments=24,irregular=.14){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.4);
    const frames=curve.computeFrenetFrames(segments,false),bucket=tubeBuckets.get(mat),base=bucket.pos.length/3;
    for(let j=0;j<=segments;j++){
      const t=j/segments,p=curve.getPointAt(t),r=r0*(1-t)+r1*t;
      for(let k=0;k<radial;k++){
        const a=k/radial*Math.PI*2,w=1+Math.sin(a*3+t*8)*irregular+Math.cos(a*7-t*10)*irregular*.28;
        const off=frames.normals[j].clone().multiplyScalar(Math.cos(a)*r*w).add(frames.binormals[j].clone().multiplyScalar(Math.sin(a)*r*w));
        bucket.pos.push(p.x+off.x,p.y+off.y,p.z+off.z);bucket.uv.push(k/radial,t*2.7);bucket.rootMask.push(0);bucket.rootOffset.push(0);
      }
    }
    for(let j=0;j<segments;j++)for(let k=0;k<radial;k++){
      const a=base+j*radial+k,b=base+j*radial+(k+1)%radial,d=base+(j+1)*radial+(k+1)%radial,e=base+(j+1)*radial+k;
      bucket.idx.push(a,b,e,b,d,e);
    }
  }
  function flushTubeBuckets(){
    for(const [mat,b] of tubeBuckets){
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.setAttribute('rootMask',new THREE.Float32BufferAttribute(b.rootMask,1));g.setAttribute('rootOffset',new THREE.Float32BufferAttribute(b.rootOffset,1));g.setIndex(b.idx);g.computeVertexNormals();
      const mesh=new THREE.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;grupo.add(mesh);
    }
    tubeBuckets.clear();
  }
  function curve(points){return new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.4);}
  function rootTube(points,r0,r1,mat=trunkMat,radial=14,segments=34,irregular=.16){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.4);
    const frames=curve.computeFrenetFrames(segments,false),bucket=tubeBuckets.get(mat),base=bucket.pos.length/3;
    for(let j=0;j<=segments;j++){
      const t=j/segments,p=curve.getPointAt(t),r=r0*(1-t)+r1*t;
      const tangent=frames.tangents[j],lateral=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
      for(let k=0;k<radial;k++){
        const a=k/radial*Math.PI*2,w=1+Math.sin(a*3+t*8)*irregular;
        const side=r*Math.cos(a)*w,vertical=r*.18*Math.sin(a)*w;
        bucket.pos.push(p.x+lateral.x*side,p.y+vertical,p.z+lateral.z*side);bucket.uv.push(k/radial,t*2.7);bucket.rootMask.push(1);bucket.rootOffset.push(vertical + r*.18);
      }
    }
    for(let j=0;j<segments;j++)for(let k=0;k<radial;k++){
      const a=base+j*radial+k,b=base+j*radial+(k+1)%radial,d=base+(j+1)*radial+(k+1)%radial,e=base+(j+1)*radial+k;
      bucket.idx.push(a,b,e,b,d,e);
    }
  }
  const needleGeo=new THREE.ConeGeometry(.04,1.05,6,1);needleGeo.translate(0,.4,0);
  const needleCapacity=36000,needles=new THREE.InstancedMesh(needleGeo,new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide}),needleCapacity);
  needles.castShadow=false;needles.receiveShadow=true;
  const needleDummy=new THREE.Object3D();let needleIndex=0;
  // Recursos de agulhas são criados antes dos galhos que os preenchem.
  function needleSpray(p,axis,spread,count,seed){
    const dir=new THREE.Vector3(...axis).normalize(),reference=Math.abs(dir.y)>.8?new THREE.Vector3(1,0,0):new THREE.Vector3(0,1,0);
    const side=new THREE.Vector3().crossVectors(dir,reference).normalize(),up=new THREE.Vector3().crossVectors(side,dir).normalize();
    for(let n=0;n<count && needleIndex<needleCapacity;n++){
      const a=(n/count)*Math.PI*2+Math.random()*.5,r=Math.sqrt(Math.random())*spread;
      const base=new THREE.Vector3(p[0],p[1],p[2]).addScaledVector(side,Math.cos(a)*r).addScaledVector(up,Math.sin(a)*r*.55);
      const ndir=dir.clone().multiplyScalar(.46+Math.random()*.25)
        .addScaledVector(side,Math.cos(a)*(.24+Math.random()*.35))
        .addScaledVector(up,.12+Math.random()*.35).normalize();
      needleDummy.position.copy(base);
      needleDummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),ndir);
      needleDummy.rotateY(Math.random()*Math.PI*2);
      const len=.58+Math.random()*.78,w=.06+Math.random()*.04;
      needleDummy.scale.set(w,len/.8,w);needleDummy.updateMatrix();
      needles.setMatrixAt(needleIndex,needleDummy.matrix);
      const shade=(seed+n)%needleMats.length;needles.setColorAt(needleIndex,new THREE.Color(needleMats[shade].color));needleIndex++;
    }
  }

  // Tronco de base muito alargada e coluna alta, sem aumentar a altura da árvore.
  const trunkPath=[];
  for(let i=0;i<=14;i++){
    const t=i/14;
    trunkPath.push([cx+Math.sin(t*4.8)*10.5+Math.sin(t*12.4)*2.8,
      yBase+t*altura,cz+Math.cos(t*4.1)*8.0+Math.sin(t*9.2)*2.5]);
  }
  tube(trunkPath,raioBase,raioTopo,trunkMat,64,100,.075);

  // Sulcos e nervuras da casca percorrem o tronco em linhas tortuosas.
  for(let rib=0;rib<34;rib++){
    const a=rib/34*Math.PI*2+(Math.random()-.5)*.12,phase=Math.random()*6.28,pts=[];
    for(let j=0;j<=12;j++){
      const t=j/12,r=raioBase*(1-t)+raioTopo*t,aa=a+Math.sin(t*5+phase)*.045;
      pts.push([cx+Math.cos(aa)*(r+.18),yBase+t*altura,cz+Math.sin(aa)*(r+.18)]);
    }
    tube(pts,.75+Math.random()*.48,.18,barkRidgeMat,7,26,.18);
  }

  // Manto de raízes em forma de veias: raízes principais espessas e milhares
  // de linhas menores visíveis entre musgo, húmus e agulhas.
  const rootCount=38;
  for(let i=0;i<rootCount;i++){
    const a=i/rootCount*Math.PI*2+(Math.random()-.5)*.12,length=72+Math.random()*52;
    const raised=i===0,side=Math.sin(i*1.3)*2.2,pts=[];
    for(let j=0;j<=8;j++){
      const t=j/8,d=length*t;
      let lift=.07+Math.sin(t*Math.PI)*.12+Math.random()*.025;
      const lateral=Math.sin(t*3.8+i)*side*t;
      const rx=cx+Math.cos(a)*d+Math.cos(a+Math.PI/2)*lateral;
      const rz=cz+Math.sin(a)*d+Math.sin(a+Math.PI/2)*lateral;
      pts.push([rx,alturaTerreno(rx,rz)+lift,rz]);
    }
    const rootRadius=2.35+Math.random()*.65;
    rootTube(pts,rootRadius,.18,trunkMat,12,24,.18);
    for(const k of [2,4,6])colisores.push({x:pts[k][0],z:pts[k][2],raio:rootRadius*.78});
    // Veias laterais ramificam a raiz principal para os lados.
    for(let fork=0;fork<3;fork++){
      const t=.38+fork*.18,base=curve(pts).getPoint(t),turn=a+(fork%2?1:-1)*(.55+Math.random()*.28),len=18+Math.random()*24;
      const ex=base.x+Math.cos(turn)*len,ez=base.z+Math.sin(turn)*len;
      const mx=base.x+Math.cos(turn)*len*.55,mz=base.z+Math.sin(turn)*len*.55;
      const forkPoints=[[base.x,base.y,base.z],[mx,alturaTerreno(mx,mz)+.22,mz],[ex,alturaTerreno(ex,ez)+.12,ez]];
      rootTube(forkPoints,.62,.10,trunkMat,7,12,.16);
      colisores.push({x:mx,z:mz,raio:.55});
    }
  }

  // Galhos principais: 6 m de diâmetro junto ao tronco, abrindo-se por até 100 m.
  const mainBranches=[];
  const branchCount=24;
  for(let b=0;b<branchCount;b++){
    const a=b/branchCount*Math.PI*2+.17+(Math.random()-.5)*.12;
    const startY=yBase+altura*(.48+(b%4)*.035),length=92+Math.random()*48,rise=15+Math.random()*24;
    const pts=[];
    for(let j=0;j<=12;j++){
      const t=j/12,d=length*t,sway=Math.sin(t*Math.PI*1.3+b)*8+Math.sin(t*5+b)*3*t;
      pts.push([cx+Math.cos(a)*d+Math.cos(a+Math.PI/2)*sway,
        startY+rise*t+Math.sin(t*Math.PI)*2.2,
        cz+Math.sin(a)*d+Math.sin(a+Math.PI/2)*sway]);
    }
    tube(pts,4.6+Math.random()*.7,.72,branchMat,22,58,.20);
    mainBranches.push({points:pts,angle:a,length});

    // Ramos secundários alternados, distribuídos ao longo de cada galho.
    const mainCurve=curve(pts);
    for(let r=0;r<6;r++){
      const t=.22+r*.115,base=mainCurve.getPoint(t),side=r%2===0?1:-1;
      const aa=a+side*(.42+Math.random()*.45),len=18+Math.random()*21;
      const mid=[base.x+Math.cos(aa)*len*.48,base.y+5+Math.random()*4,base.z+Math.sin(aa)*len*.48];
      const tip=[base.x+Math.cos(aa)*len,base.y+7+Math.random()*7,base.z+Math.sin(aa)*len];
      const secondary=[base.toArray(),mid,tip];
      tube(secondary,1.35,.22,branchMat,11,24,.17);
      const secCurve=curve(secondary);
      // Ramificações terciárias curtas, com ponteiras voltadas para a luz.
      for(let q=0;q<2;q++){
        const tq=.32+q*.22,p=secCurve.getPoint(tq),a3=aa+(q%2?1:-1)*(.55+Math.random()*.35),l3=7+Math.random()*10;
        const t3=[p.x+Math.cos(a3)*l3,p.y+3+Math.random()*3,p.z+Math.sin(a3)*l3];
        tube([[p.x,p.y,p.z],[p.x+Math.cos(a3)*l3*.55,p.y+4,p.z+Math.sin(a3)*l3*.55],t3],.34,.06,branchMat,7,12,.12);
        for(let k=0;k<4;k++){
          const f=.25+k*.17,sp=curve([[p.x,p.y,p.z],t3]).getPoint(f);
          needleSpray([sp.x,sp.y,sp.z],[Math.cos(a3)*.6,.55+Math.random()*.2,Math.sin(a3)*.6],1.0,10,b+r+q+k);
        }
      }
      for(let k=1;k<=4;k++){
        const sp=secCurve.getPoint(k/6);
        needleSpray([sp.x,sp.y,sp.z],[Math.cos(aa)*.65,.38,Math.sin(aa)*.65],1.3,12,b+r+k);
      }
    }
    // Pequenos feixes ao longo do próprio galho, sem volumes elipsoidais.
    for(let k=1;k<=6;k++){
      const sp=mainCurve.getPoint(k/9);
      needleSpray([sp.x,sp.y,sp.z],[Math.cos(a)*.55,.55,Math.sin(a)*.55],2.0,14,b+k);
    }
  }

  // Ponteiro superior fino e quebrado, não uma massa sólida no topo.
  tube([[cx,yBase+altura*.84,cz],[cx+1.1,yBase+altura*.94,cz-.8],[cx-.8,yBase+altura,cz+.6]],.9,.16,branchMat,10,24,.12);

  // Agulhas finas em sprays discretos acompanhando os ramos, sem bolas ou cones.
  mainBranches.forEach((br,b)=>{
    const cv=curve(br.points);
    for(let k=1;k<=9;k++){
      const p=cv.getPoint(k/14),a=br.angle+(k%2?1:-1)*(.4+Math.random()*.4),offset=1.4+Math.random()*2.8;
      const pos=[p.x+Math.cos(a)*offset,p.y+Math.random()*2,p.z+Math.sin(a)*offset];
      needleSpray(pos,[Math.cos(br.angle)*.55+Math.cos(a)*.5,.35+Math.random()*.35,Math.sin(br.angle)*.55+Math.sin(a)*.5],2.0+Math.random()*1.6,14,b+k);
    }
  });

  needles.count=needleIndex;needles.instanceMatrix.needsUpdate=true;
  if(needles.instanceColor)needles.instanceColor.needsUpdate=true;grupo.add(needles);

  // Hollow in bark referenced in the Blood-oath celebration; quiet when not in use.
  const cavityMat=new THREE.MeshStandardMaterial({color:0x17160f,roughness:1,side:THREE.DoubleSide});
  const cavity=addOval(grupo,cx+raioBase*.96,yBase+9,cz+.8,1.55,2.1,.32,cavityMat,14);
  cavity.rotation.y=.12;
  const lip=[];
  for(let i=0;i<=16;i++){
    const a=-Math.PI*.55+i/16*Math.PI*1.1;
    lip.push([cx+raioBase*.97+Math.cos(a)*1.75,yBase+9+Math.sin(a)*2.35,cz+.8]);
  }
  tube(lip,.34,.22,barkRidgeMat,8,20,.12);
  flushTubeBuckets();

  // Lanternas só durante a celebração, nunca como pontos verdes permanentes.
  lanternaObjs.length=0;lanternaBaseY.length=0;
  grupo.position.set(0,0,0);scene.add(grupo);menoaGrupo=grupo;
  colisores.push({x:cx,z:cz,raio:31});
  const bbox=new THREE.Box3().setFromObject(grupo);
  console.log('Menoa reconstruída conforme Eldest — altura',altura,'diâmetro do tronco',raioBase*2,'galhos',branchCount,'raízes',rootCount,'bbox',bbox.min,bbox.max);
}


construirMenoa();

const ROOT_GRID_CELL=48,ROOT_WALK_GRID=new Map();
for(const root of ROOT_WALKS){
  const pad=(root.r0||.4)+.55;
  const minX=Math.min(...root.points.map(p=>p[0]))-pad,maxX=Math.max(...root.points.map(p=>p[0]))+pad;
  const minZ=Math.min(...root.points.map(p=>p[2]))-pad,maxZ=Math.max(...root.points.map(p=>p[2]))+pad;
  for(let gx=Math.floor(minX/ROOT_GRID_CELL);gx<=Math.floor(maxX/ROOT_GRID_CELL);gx++){
    for(let gz=Math.floor(minZ/ROOT_GRID_CELL);gz<=Math.floor(maxZ/ROOT_GRID_CELL);gz++){
      const key=gx+','+gz;if(!ROOT_WALK_GRID.has(key))ROOT_WALK_GRID.set(key,[]);
      ROOT_WALK_GRID.get(key).push(root);
    }
  }
}
function rootsPerto(x,z){
  return ROOT_WALK_GRID.get(Math.floor(x/ROOT_GRID_CELL)+','+Math.floor(z/ROOT_GRID_CELL))||[];
}

// Índice espacial de cada segmento elevado. Antes, a altura do piso percorria
// todas as amostras de todas as pontes e escadas a cada quadro. Agora só consulta
// os segmentos da célula de 18 m onde o jogador está.
const WALK_GRID_CELL=18,WALK_SEGMENT_GRID=new Map();
function walkGridKey(x,z){return Math.floor(x/WALK_GRID_CELL)+','+Math.floor(z/WALK_GRID_CELL);}
for(const walk of ELEVATED_WALKS){
  const half=walk.width*.5+1.2;
  for(let i=0;i<walk.points.length-1;i++){
    const a=walk.points[i],b=walk.points[i+1];
    const segment={a,b,half:walk.width*.5,kind:walk.kind,walk,index:i};
    const minX=Math.min(a[0],b[0])-half,maxX=Math.max(a[0],b[0])+half;
    const minZ=Math.min(a[2],b[2])-half,maxZ=Math.max(a[2],b[2])+half;
    for(let gx=Math.floor(minX/WALK_GRID_CELL);gx<=Math.floor(maxX/WALK_GRID_CELL);gx++){
      for(let gz=Math.floor(minZ/WALK_GRID_CELL);gz<=Math.floor(maxZ/WALK_GRID_CELL);gz++){
        const key=gx+','+gz;
        if(!WALK_SEGMENT_GRID.has(key))WALK_SEGMENT_GRID.set(key,[]);
        WALK_SEGMENT_GRID.get(key).push(segment);
      }
    }
  }
}
function segmentosPisoPerto(x,z){
  return WALK_SEGMENT_GRID.get(walkGridKey(x,z))||[];
}
function pontoNoSegmentoElevado(x,z,segment){
  const a=segment.a,b=segment.b,dx=b[0]-a[0],dz=b[2]-a[2],den=dx*dx+dz*dz;
  const t=den>1e-8?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/den)):0;
  const px=a[0]+dx*t,pz=a[2]+dz*t;
  return {t,px,pz,d:Math.hypot(x-px,z-pz),y:a[1]+(b[1]-a[1])*t};
}

function alturaChao(x,z,referenceY=null){
  let h=alturaTerreno(x,z);
  if(raizElevadaPontos)for(const p of raizElevadaPontos){
    const d=Math.hypot(x-p.x,z-p.z);if(d<p.r*.9)h=Math.max(h,p.y);
  }
  let bestScore=Infinity,specialY=null;
  for(const segment of segmentosPisoPerto(x,z)){
    const p=pontoNoSegmentoElevado(x,z,segment);
    if(p.d>segment.half)continue;
    const vertical=referenceY===null?0:Math.abs(p.y-referenceY);
    // Evita capturar uma passarela em outro nível acima ou abaixo do jogador.
    if(referenceY!==null&&vertical>(segment.kind==='stair'?3.35:2.6))continue;
    const score=p.d*p.d+vertical*vertical*.32;
    if(score<bestScore){bestScore=score;specialY=p.y;}
  }
  for(const root of rootsPerto(x,z)){
    const points=root.points;
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],den=dx*dx+dz*dz;
      const t=den>1e-8?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/den)):0;
      const px=a[0]+dx*t,pz=a[2]+dz*t,d=Math.hypot(x-px,z-pz),half=root.r0*.95+.28;
      if(d>half)continue;
      const y=a[1]+(b[1]-a[1])*t+(root.r0*(1-t)+root.r1*t)*.78;
      const vertical=referenceY===null?0:Math.abs(y-referenceY);
      if(referenceY!==null&&vertical>4.2)continue;
      const score=d*d+vertical*vertical*.32;
      if(score<bestScore){bestScore=score;specialY=y;}
    }
  }
  if(specialY!==null)h=Math.max(h,specialY);
  return h;
}
