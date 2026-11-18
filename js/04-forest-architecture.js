// ============================================================================
const woodMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,normalMap:TEX_CASCA_N,color:0x80684d,roughness:.96,side:THREE.DoubleSide});
const paleWood=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0xb39a73,roughness:.92,side:THREE.DoubleSide});
const stoneMat=new THREE.MeshStandardMaterial({map:TEX_PEDRA,color:0x777668,roughness:1});
const roofMat=new THREE.MeshStandardMaterial({color:0x273c28,roughness:1,side:THREE.DoubleSide});
const darkMat=new THREE.MeshStandardMaterial({color:0x11150f,roughness:1,side:THREE.DoubleSide});
const warmMat=new THREE.MeshStandardMaterial({color:0xe4c38a,emissive:0x332512,emissiveIntensity:.18,roughness:.8});
const mossFloorMat=new THREE.MeshStandardMaterial({color:0x30432a,roughness:1,side:THREE.DoubleSide});
const whiteBarkMat=new THREE.MeshStandardMaterial({color:0xd8d1bb,roughness:.9,side:THREE.DoubleSide});
const dwellingWallMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0xb5a07d,roughness:.9});
const dwellingTrimMat=new THREE.MeshStandardMaterial({color:0x634d35,roughness:.92});
const dwellingRoofMat=new THREE.MeshStandardMaterial({color:0x536d45,roughness:1});
const dwellingDoorMat=new THREE.MeshStandardMaterial({color:0x59432e,roughness:.92});
const dwellingGlassMat=new THREE.MeshStandardMaterial({color:0xffd28b,emissive:0xffb54d,emissiveIntensity:1.8,roughness:.24});
const dwellingDarkMat=new THREE.MeshStandardMaterial({color:0x181b13,roughness:1});
const RESIDENCE_WINDOW_MAT=new THREE.MeshStandardMaterial({color:0xffc16a,emissive:0xff922d,emissiveIntensity:2.0,roughness:.22,side:THREE.DoubleSide});
const RESIDENCE_FRAME_MAT=new THREE.MeshStandardMaterial({color:0x493521,roughness:.96});
const RESIDENCE_LAMP_GLOW=new THREE.MeshBasicMaterial({color:0xffbf63});
const RESIDENCE_WOVEN_MAT=new THREE.MeshStandardMaterial({color:0x887452,roughness:1,side:THREE.DoubleSide,transparent:true,opacity:.94,depthWrite:true});
const RESIDENCE_FIBER_MAT=new THREE.MeshStandardMaterial({color:0xc1a982,roughness:1,side:THREE.DoubleSide});
const CANOPY_DECK_MAT=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x927b59,roughness:.97,side:THREE.DoubleSide});
const HOME_LINEN_MAT=new THREE.MeshStandardMaterial({color:0x9a9b79,roughness:1});
const HOME_CUSHION_MAT=new THREE.MeshStandardMaterial({color:0x76624b,roughness:1});
const HOME_CERAMIC_MAT=new THREE.MeshStandardMaterial({color:0x7d8a78,roughness:.72});
const HOME_DARK_WOOD_MAT=new THREE.MeshStandardMaterial({color:0x483521,roughness:.96});

const ARCH_TUBE_BUCKETS=new Map();
const ELEVATED_WALKS=[];
function registerWalkablePath(points,width=2.4,kind='bridge'){if(points&&points.length>1)ELEVATED_WALKS.push({points:points.map(p=>[p[0],p[1],p[2]]),width,kind});}
function addOpenOvoidPod(parent,x,y,z,rx,ry,rz,mat=woodMat,frontAngle=Math.PI/2){
  const source=new THREE.SphereGeometry(1,40,28),sp=source.attributes.position,suv=source.attributes.uv,si=source.index.array;
  const outP=[],outUV=[];
  for(let t=0;t<si.length;t+=3){
    const ids=[si[t],si[t+1],si[t+2]];let nx=0,ny=0,nz=0;
    for(const id of ids){nx+=sp.getX(id)/3;ny+=sp.getY(id)/3;nz+=sp.getZ(id)/3;}
    const phi=Math.atan2(nz,-nx),delta=Math.atan2(Math.sin(phi-frontAngle),Math.cos(phi-frontAngle));
    const theta=Math.acos(Math.max(-1,Math.min(1,ny/Math.max(.001,Math.hypot(nx,ny,nz)))));
    if(Math.abs(delta)<.235&&theta>1.48&&theta<2.98)continue;
    for(const id of ids){outP.push(x+sp.getX(id)*rx,y+sp.getY(id)*ry,z+sp.getZ(id)*rz);outUV.push(suv.getX(id),suv.getY());}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(outP,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(outUV,2));geo.computeVertexNormals();source.dispose();
  const shell=new THREE.Mesh(geo,mat);shell.castShadow=true;shell.receiveShadow=true;parent.add(shell);
  const angles=[frontAngle+Math.PI*.62,frontAngle+Math.PI*1.38,frontAngle+Math.PI];
  const paneGeo=new THREE.PlaneGeometry(Math.min(rx,rz)*.50,ry*.44);
  const panes=new THREE.InstancedMesh(paneGeo,RESIDENCE_WINDOW_MAT,angles.length);
  const barGeo=new THREE.BoxGeometry(1,1,1),bars=new THREE.InstancedMesh(barGeo,RESIDENCE_FRAME_MAT,angles.length*4);
  const d=new THREE.Object3D();let barIndex=0,w=Math.min(rx,rz)*.50,h=ry*.44;
  for(let i=0;i<angles.length;i++){
    const a=angles[i],px=Math.sin(a)*rx*1.018,pz=Math.cos(a)*rz*1.018,py=y+ry*.06;
    d.position.set(px,py,pz);d.rotation.set(0,a,0);d.scale.set(1,1,1);d.updateMatrix();panes.setMatrixAt(i,d.matrix);
    const specs=[[-w*.5,0,.13,h+.16,.18],[w*.5,0,.13,h+.16,.18],[0,-h*.5,w+.18,.13,.18],[0,h*.5,w+.18,.13,.18]];
    for(const [ox,oy,sx,sy,sz] of specs){
      d.position.set(px+Math.cos(a)*ox,py+oy,pz-Math.sin(a)*ox);
      d.rotation.set(0,a,0);d.scale.set(sx,sy,sz);d.updateMatrix();bars.setMatrixAt(barIndex++,d.matrix);
    }
  }
  panes.instanceMatrix.needsUpdate=true;bars.instanceMatrix.needsUpdate=true;parent.add(panes,bars);
  return shell;
}

function addHexagonalLivingShell(parent,x,y,z,rx,ry,rz,mat=woodMat,door=true){
  // Seis painéis arqueados de madeira viva entrelaçada; o painel frontal mantém a abertura da porta.
  const positions=[],uvs=[],indices=[],rows=14,cols=6;
  for(let face=0;face<6;face++){
    const a0=-Math.PI/6+face*Math.PI/3,base=positions.length/3;
    for(let row=0;row<=rows;row++){
      const t=row/rows*2-1,profile=.84+.16*(1-Math.pow(Math.abs(t),1.6));
      for(let col=0;col<=cols;col++){
        const u=col/cols,a=a0+u*Math.PI/3;
        const wobble=1+.018*Math.sin(face*2.3+u*8+t*5);
        positions.push(x+Math.sin(a)*rx*profile*wobble,y+t*ry,z+Math.cos(a)*rz*profile*wobble);
        uvs.push(u,t*.5+.5);
      }
    }
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const t=(row+.5)/rows*2-1,u=(col+.5)/cols;
      // O vão frontal vai do piso até a altura de uma pessoa, sob o arco simbólico.
      if(door&&face===0&&u>.34&&u<.67&&t<-.05&&t>-.92)continue;
      const a=base+row*(cols+1)+col,b=a+1,d=base+(row+1)*(cols+1)+col,e=d+1;
      indices.push(a,b,d,b,e,d);
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  const shell=new THREE.Mesh(geo,mat);shell.castShadow=true;shell.receiveShadow=true;parent.add(shell);
  // Linhas de fibras entrelaçadas atravessam cada painel, deixando visível a construção.
  for(let face=0;face<6;face++){
    const a0=-Math.PI/6+face*Math.PI/3;
    for(let row=1;row<rows;row+=2){
      const t=row/rows*2-1,profile=.84+.16*(1-Math.pow(Math.abs(t),1.6)),pts=[];
      for(let col=0;col<=6;col++){
        const u=col/6,a=a0+u*Math.PI/3,wobble=1+.018*Math.sin(face*2.3+u*8+t*5);
        pts.push([x+Math.sin(a)*rx*profile*wobble,y+t*ry,z+Math.cos(a)*rz*profile*wobble]);
      }
      addOrganicTube(parent,pts,.065,.045,row%4?woodMat:paleWood,5,14,.10);
    }
    for(let col=1;col<=5;col+=2){
      const u=col/6,pts=[];
      for(let row=0;row<=8;row++){
        const t=row/8*2-1,profile=.84+.16*(1-Math.pow(Math.abs(t),1.6)),a=a0+u*Math.PI/3;
        pts.push([x+Math.sin(a)*rx*profile,y+t*ry,z+Math.cos(a)*rz*profile]);
      }
      addOrganicTube(parent,pts,.075,.045,woodMat,5,18,.10);
    }
  }
  return shell;
}
function addResidenceFloor(parent,x,y,z,rx,rz,mat=mossFloorMat){
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1,48),mat);floor.rotation.x=-Math.PI/2;
  floor.position.set(x,y+.04,z);floor.scale.set(rx,rz,1);floor.receiveShadow=true;parent.add(floor);return floor;
}
function addLivingDoorFrame(parent,x,floorY,z,width=2.1,height=3.0){
  const pts=[[x-width*.5,floorY,z],[x-width*.52,floorY+height*.55,z+.08],[x-width*.32,floorY+height*.88,z+.18],
    [x,floorY+height,z+.22],[x+width*.32,floorY+height*.88,z+.18],[x+width*.52,floorY+height*.55,z+.08],[x+width*.5,floorY,z]];
  addOrganicTube(parent,pts,.22,.13,paleWood,8,32,.08);
}
function addHoneycombRoof(parent,cx,cy,cz,length,width){
  const cols=8,rows=3,dx=length/cols,dz=width/rows;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const hx=cx-length/2+(col+.5+(row%2)*.5)*dx;if(hx>cx+length/2-dx*.15)continue;
    const hz=cz-width/2+(row+.5)*dz,rad=Math.min(dx*.48,dz*.55),hex=[];
    const archCenter=4.2*(1-Math.pow((hx-cx)/(length*.58),2));
    for(let k=0;k<=6;k++){const a=k/6*Math.PI*2,xx=hx+Math.cos(a)*rad,zz=hz+Math.sin(a)*rad;
      const arch=4.2*(1-Math.pow((xx-cx)/(length*.58),2));hex.push([xx,cy+Math.max(.6,arch)+Math.sin(a*2+row)*.25,zz]);}
    addOrganicTube(parent,hex,.17,.13,row%2?woodMat:paleWood,6,24,.12);
    for(let k=0;k<3;k++){const a=k*Math.PI*2/3;
      addOrganicTube(parent,[[hx,cy+Math.max(.6,archCenter),hz],
        [hx+Math.cos(a)*rad*.48,cy+archCenter+.4,hz+Math.sin(a)*rad*.48]],.09,.05,woodMat,5,8,.08);}
  }
}
function buildCanopyStairTower(parent,x,z,groundY,targetY,seed=0){
  const rise=Math.max(8,targetY-groundY),turns=Math.max(6,rise/26.0),radius=9.2;
  const samples=840,path=[];
  addLivingTrunk(parent,x,groundY,z,Math.max(250,rise+75),5.8,Math.sin(seed)*1.2,Math.cos(seed)*1.1,woodMat);
  const outerRail=[],innerRail=[],outerLower=[],innerLower=[],outerWallBase=[],innerWallBase=[];
  for(let i=0;i<=samples;i++){
    const t=i/samples,a=t*Math.PI*2*turns,y=groundY+.18+t*(rise-.18);
    path.push([x+Math.cos(a)*radius,y+.26,z+Math.sin(a)*radius]);
    outerRail.push([x+Math.cos(a)*(radius+2.02),y+1.28,z+Math.sin(a)*(radius+2.02)]);
    innerRail.push([x+Math.cos(a)*(radius-2.02),y+1.28,z+Math.sin(a)*(radius-2.02)]);
    outerLower.push([x+Math.cos(a)*(radius+2.02),y+.58,z+Math.sin(a)*(radius+2.02)]);
    outerWallBase.push([x+Math.cos(a)*(radius+2.02),y+.05,z+Math.sin(a)*(radius+2.02)]);
    innerLower.push([x+Math.cos(a)*(radius-2.02),y+.58,z+Math.sin(a)*(radius-2.02)]);
    innerWallBase.push([x+Math.cos(a)*(radius-2.02),y+.05,z+Math.sin(a)*(radius-2.02)]);
  }
  registerWalkablePath(path,4.05,'stair');

  // Degraus separados: comprimento radial, profundidade tangencial.
  const stairMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0xa38b68,roughness:.94});
  const stepCount=Math.ceil(turns*Math.PI*2*radius/.94);
  const stepGeo=new THREE.BoxGeometry(3.85,.26,1.02);
  const steps=new THREE.InstancedMesh(stepGeo,stairMat,stepCount),dummy=new THREE.Object3D();
  for(let i=0;i<stepCount;i++){
    const t=(i+.5)/stepCount,a=t*Math.PI*2*turns,y=groundY+.18+t*(rise-.18);
    dummy.position.set(x+Math.cos(a)*radius,y+.13,z+Math.sin(a)*radius);
    dummy.rotation.set(0,-a,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
    steps.setMatrixAt(i,dummy.matrix);
  }
  steps.instanceMatrix.needsUpdate=true;steps.castShadow=false;steps.receiveShadow=true;parent.add(steps);

  // Piso helicoidal contínuo sob os degraus: fecha todos os intervalos da escada.
  const rampPos=[],rampIdx=[];
  for(let i=0;i<path.length;i++){
    const p=path[i],prev=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)];
    const tangent=new THREE.Vector3(next[0]-prev[0],0,next[2]-prev[2]).normalize();
    const lateral=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();
    const half=1.92,yy=p[1]-.24;
    rampPos.push(p[0]-lateral.x*half,yy,p[2]-lateral.z*half);
    rampPos.push(p[0]+lateral.x*half,yy,p[2]+lateral.z*half);
    if(i<path.length-1){const a=i*2;rampIdx.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const rampGeo=new THREE.BufferGeometry();
  rampGeo.setAttribute('position',new THREE.Float32BufferAttribute(rampPos,3));
  rampGeo.setIndex(rampIdx);rampGeo.computeVertexNormals();
  const rampMesh=new THREE.Mesh(rampGeo,new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x8c7655,roughness:.96,side:THREE.DoubleSide}));
  rampMesh.receiveShadow=true;rampMesh.castShadow=true;parent.add(rampMesh);

  // Patamares anulares integram o primeiro degrau ao solo e o último à ponte.
  const landingGeo=new THREE.RingGeometry(radius-2.05,radius+2.05,48,1);
  landingGeo.rotateX(-Math.PI/2);
  const landingMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x8a7452,roughness:.96,side:THREE.DoubleSide});
  for(const y of [groundY+.04,targetY+.04]){
    const landing=new THREE.Mesh(landingGeo,landingMat);
    landing.position.set(x,y,z);landing.receiveShadow=true;landing.castShadow=true;parent.add(landing);
  }

  const railSegments=Math.min(380,samples);
  addOrganicTube(parent,outerRail,.24,.18,paleWood,8,railSegments,.055);
  addOrganicTube(parent,innerRail,.22,.17,woodMat,8,railSegments,.055);
  addOrganicTube(parent,outerLower,.11,.09,woodMat,6,railSegments,.04);
  addOrganicTube(parent,innerLower,.11,.09,woodMat,6,railSegments,.04);

  // Paredes laterais contínuas entre o piso e o corrimão: não são apenas cabos.
  function addSpiralSideWall(bottom,top){
    const p=[],idx=[];
    for(let i=0;i<bottom.length;i++){
      p.push(bottom[i][0],bottom[i][1],bottom[i][2],top[i][0],top[i][1],top[i][2]);
      if(i<bottom.length-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
    geo.setIndex(idx);geo.computeVertexNormals();
    const wall=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x745f43,roughness:.96,side:THREE.DoubleSide}));
    wall.castShadow=true;wall.receiveShadow=true;parent.add(wall);
  }
  addSpiralSideWall(outerWallBase,outerRail);
  addSpiralSideWall(innerWallBase,innerRail);


  // Postes verticais em ambas as bordas para evitar quedas.
  const postSpacing=2.25,postCount=Math.ceil(turns*Math.PI*2*radius/postSpacing)+1;
  const postGeo=new THREE.CylinderGeometry(.085,.11,1.3,7,1);
  const posts=new THREE.InstancedMesh(postGeo,paleWood,postCount*2);
  for(let i=0;i<postCount;i++){
    const t=i/(postCount-1),a=t*Math.PI*2*turns,y=groundY+.18+t*(rise-.18);
    for(let side=0;side<2;side++){
      const r=side===0?radius+2.02:radius-2.02;
      dummy.position.set(x+Math.cos(a)*r,y+.64,z+Math.sin(a)*r);
      dummy.rotation.set(0,-a,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
      posts.setMatrixAt(i*2+side,dummy.matrix);
    }
  }
  posts.instanceMatrix.needsUpdate=true;posts.castShadow=false;posts.receiveShadow=true;parent.add(posts);

  // Apoios de madeira viva grossos, não cabos finos.
  for(let i=0;i<10;i++){
    const t=(i+.5)/10,a=t*Math.PI*2*turns,y=groundY+t*rise;
    addOrganicTube(parent,[
      [x+Math.cos(a)*(radius-1.0),y,z+Math.sin(a)*(radius-1.0)],
      [x+Math.cos(a)*4.2,y+1.2,z+Math.sin(a)*4.2],
      [x+Math.cos(a)*2.1,y+3.4,z+Math.sin(a)*2.1]
    ],.72,.23,woodMat,8,18,.10);
  }
  return {x:x+radius,y:targetY,z,path,groundY,radius};
}
function buildLivingBridge(parent,start,endOrWidth,width=6.4,side=1){
  const legacy=Array.isArray(start[0]);
  let legacyPoints=null,end;
  if(legacy){
    legacyPoints=start;width=typeof endOrWidth==='number'?endOrWidth:3.8;
    start=legacyPoints[0];end=legacyPoints[legacyPoints.length-1];
  }else end=endOrWidth;
  const dx=end[0]-start[0],dz=end[2]-start[2],length=Math.max(1,Math.hypot(dx,dz));
  const nx=-dz/length,nz=dx/length,bend=Math.min(15,Math.max(7,length*.065))*side;
  const plan=legacy
    ?legacyPoints.map(p=>new THREE.Vector3(p[0],0,p[2]))
    :[
      new THREE.Vector3(start[0],0,start[2]),
      new THREE.Vector3(start[0]+dx*.32+nx*bend,0,start[2]+dz*.32+nz*bend),
      new THREE.Vector3(start[0]+dx*.68+nx*bend,0,start[2]+dz*.68+nz*bend),
      new THREE.Vector3(end[0],0,end[2])
    ];
  const curve=new THREE.CatmullRomCurve3(plan,false,'centripetal',.32);
  const count=Math.max(48,Math.ceil(length/1.35)),flat=curve.getPoints(count),samples=[];
  const arch=length<35?1.35:Math.min(8.5,Math.max(3.8,length*.034));
  for(let i=0;i<=count;i++){
    const t=i/count,p=flat[i],y=start[1]+(end[1]-start[1])*t+Math.sin(Math.PI*t)*arch;
    samples.push(new THREE.Vector3(p.x,y,p.z));
  }
  const left=[],right=[],indices=[],pos=[],uv=[];
  for(let i=0;i<samples.length;i++){
    const p=samples[i],tangent=samples[Math.min(samples.length-1,i+1)].clone().sub(samples[Math.max(0,i-1)]).setY(0).normalize();
    const lateral=new THREE.Vector3(-tangent.z,0,tangent.x).normalize(),w=width*.5;
    left.push([p.x+lateral.x*w,p.y,p.z+lateral.z*w]);
    right.push([p.x-lateral.x*w,p.y,p.z-lateral.z*w]);
    pos.push(left[i][0],left[i][1],left[i][2],right[i][0],right[i][1],right[i][2]);
    uv.push(0,i/samples.length*8,1,i/samples.length*8);
    if(i<samples.length-1){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  const deck=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x8e7958,roughness:.94,side:THREE.DoubleSide}));
  deck.castShadow=true;deck.receiveShadow=true;parent.add(deck);
  const railL=[],railR=[],underL=[],underR=[],spine=[];
  for(let i=0;i<samples.length;i++){
    railL.push([left[i][0],left[i][1]+1.2,left[i][2]]);
    railR.push([right[i][0],right[i][1]+1.2,right[i][2]]);
    underL.push([left[i][0],left[i][1]-.48,left[i][2]]);
    underR.push([right[i][0],right[i][1]-.48,right[i][2]]);
    spine.push([samples[i].x,samples[i].y-.66,samples[i].z]);
  }
  addOrganicTube(parent,railL,.30,.22,paleWood,8,count,.055);
  addOrganicTube(parent,railR,.30,.22,paleWood,8,count,.055);
  addOrganicTube(parent,underL,.50,.30,woodMat,9,count,.06);
  addOrganicTube(parent,underR,.50,.30,woodMat,9,count,.06);
  addOrganicTube(parent,spine,.34,.22,woodMat,8,count,.05);
  const postCount=Math.max(2,Math.floor(length/4.8)-1);
  const postGeo=new THREE.CylinderGeometry(.075,.11,1.2,7,1);
  const posts=new THREE.InstancedMesh(postGeo,paleWood,postCount*2),dummy=new THREE.Object3D();
  for(let i=1;i<=postCount;i++){
    const idx=Math.min(samples.length-1,Math.round(i/(postCount+1)*(samples.length-1))),p=samples[idx];
    for(let edge=0;edge<2;edge++){
      const q=edge===0?left[idx]:right[idx];
      dummy.position.set(q[0],p.y+.60,q[2]);
      dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
      posts.setMatrixAt((i-1)*2+edge,dummy.matrix);
    }
  }
  posts.instanceMatrix.needsUpdate=true;posts.castShadow=false;posts.receiveShadow=true;parent.add(posts);
  const tieStep=Math.max(12,Math.floor(samples.length/15));
  for(let i=tieStep;i<samples.length-tieStep;i+=tieStep){
    addOrganicTube(parent,[[left[i][0],left[i][1]-.20,left[i][2]],
      [samples[i].x,samples[i].y-.62,samples[i].z],
      [right[i][0],right[i][1]-.20,right[i][2]]],.12,.09,woodMat,6,10,.035);
  }
  const path=samples.map(p=>[p.x,p.y,p.z]);
  registerWalkablePath(path,width*.82,'bridge');
  return path;
}

function buildReadableDwelling(parent,x,z,floorY,scale=1,elevated=false,trunkHeight=260){
  const house=new THREE.Group();house.position.set(x,0,z);parent.add(house);
  const groundY=alturaTerreno(x,z),upperY=floorY+7.2*scale;
  const lowerOuter=13.8*scale,lowerInner=7.0*scale,upperOuter=8.0*scale,upperInner=4.1*scale;
  const floorMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x957c58,roughness:.96,side:THREE.DoubleSide});
  const wallMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x89704d,roughness:.98,side:THREE.DoubleSide});
  const doorMat=new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x4b3827,roughness:.96});
  const darkMat=new THREE.MeshStandardMaterial({color:0x21180e,roughness:1});
  addLivingTrunk(parent,x,groundY,z,Math.max(trunkHeight,upperY-groundY+18),7.6*scale,.85,-.65,woodMat);
  for(let r=0;r<6;r++){
    const a=r/6*Math.PI*2+Math.sin(r*2.1)*.10,len=13+Math.random()*7;
    addOrganicTube(parent,[[x+Math.cos(a)*3.4*scale,groundY+.22,z+Math.sin(a)*3.4*scale],
      [x+Math.cos(a)*7.2*scale,groundY+.28,z+Math.sin(a)*7.2*scale],
      [x+Math.cos(a)*len,groundY+.10,z+Math.sin(a)*len]],.68*scale,.10,woodMat,8,18,.16);
  }
  function ringPoints(radius,y,count=72){
    const pts=[];
    for(let i=0;i<=count;i++){const a=i/count*Math.PI*2,wobble=1+.015*Math.sin(a*5+x*.013)+.01*Math.sin(a*9+z*.017);pts.push([x+Math.cos(a)*radius*wobble,y,z+Math.sin(a)*radius*wobble]);}
    return pts;
  }
  function addFloor(outer,inner,y){
    const geo=new THREE.RingGeometry(inner,outer,6,2);geo.rotateX(-Math.PI/2);
    const mesh=new THREE.Mesh(geo,floorMat);mesh.position.set(0,y,0);mesh.receiveShadow=true;house.add(mesh);
    addOrganicTube(parent,ringPoints(outer,y+.12),.24*scale,.18*scale,woodMat,7,72,.06);
    addOrganicTube(parent,ringPoints(inner,y+.12),.18*scale,.13*scale,paleWood,6,72,.06);
    const walk=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;walk.push([x+Math.cos(a)*(outer+inner)*.5,y+.15,z+Math.sin(a)*(outer+inner)*.5]);}
    registerWalkablePath(walk,(outer-inner)*.96,'house');
  }
  addFloor(lowerOuter,lowerInner,floorY);addFloor(upperOuter,upperInner,upperY);
  const windowAngles=[Math.PI/3,2*Math.PI/3,Math.PI,4*Math.PI/3,5*Math.PI/3],angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  function addWallLantern(baseY,outer,angle){
    const fixture=new THREE.Group();fixture.position.set(Math.sin(angle)*(outer-.28*scale),baseY+2.55*scale,Math.cos(angle)*(outer-.28*scale));fixture.rotation.y=angle+Math.PI;
    const bracket=new THREE.Mesh(new THREE.BoxGeometry(.12*scale,.12*scale,.48*scale),RESIDENCE_FRAME_MAT);bracket.position.z=.20*scale;fixture.add(bracket);
    const cage=new THREE.Mesh(new THREE.BoxGeometry(.34*scale,.48*scale,.25*scale),RESIDENCE_FRAME_MAT);cage.position.z=.42*scale;fixture.add(cage);
    const flame=new THREE.Mesh(new THREE.BoxGeometry(.18*scale,.34*scale,.15*scale),RESIDENCE_LAMP_GLOW);flame.position.z=.44*scale;fixture.add(flame);house.add(fixture);
  }
  function addEnclosedStory(baseY,outer,height){
    const wallRadius=outer-.22*scale,sideSteps=18,radial=108,rows=10,wallBottom=baseY+.35*scale,wallTop=baseY+(height-.12)*scale;
    const doorHalf=1.36*scale/wallRadius,doorTop=baseY+3.22*scale,windowHalf=1.34*scale/wallRadius;
    const windowBottom=baseY+1.62*scale,windowTop=baseY+3.18*scale,positions=[],uvs=[],indices=[];
    for(let row=0;row<=rows;row++){
      const v=row/rows,y=wallBottom+(wallTop-wallBottom)*v;
      for(let i=0;i<=radial;i++){
        const face=Math.min(5,Math.floor(i/sideSteps)),u=(i-face*sideSteps)/sideSteps;
        const a0=-Math.PI/6+face*Math.PI/3,a1=a0+Math.PI/3;
        const nx=Math.sin(a0)*(1-u)+Math.sin(a1)*u,nz=Math.cos(a0)*(1-u)+Math.cos(a1)*u;
        const bulge=1+.024*Math.sin(u*Math.PI);
        positions.push(nx*wallRadius*bulge,y,nz*wallRadius*bulge);uvs.push(i/radial,v);
      }
    }
    for(let row=0;row<rows;row++){
      const yMid=wallBottom+(wallTop-wallBottom)*(row+.5)/rows;
      for(let i=0;i<radial;i++){
        const a=Math.floor((i+.5)/sideSteps)*Math.PI/3,isDoor=Math.abs(angleDiff(a,0))<doorHalf&&yMid<doorTop;
        const isWindow=windowAngles.some(wa=>Math.abs(angleDiff(a,wa))<windowHalf&&yMid>windowBottom&&yMid<windowTop);
        if(isDoor||isWindow)continue;
        const p=row*(radial+1)+i,q=p+1,r=p+radial+1,s=r+1;indices.push(p,r,q,q,r,s);
      }
    }
    const wallGeo=new THREE.BufferGeometry();wallGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    wallGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));wallGeo.setIndex(indices);wallGeo.computeVertexNormals();
    const wall=new THREE.Mesh(wallGeo,wallMat);wall.castShadow=true;wall.receiveShadow=true;house.add(wall);
    const paneWidth=2.32*scale,paneHeight=1.50*scale,windowY=baseY+2.40*scale;
    const panes=new THREE.InstancedMesh(new THREE.PlaneGeometry(paneWidth,paneHeight),RESIDENCE_WINDOW_MAT,windowAngles.length);
    const frames=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),RESIDENCE_FRAME_MAT,windowAngles.length*4);
    const dummy=new THREE.Object3D();let frameIndex=0;
    for(let i=0;i<windowAngles.length;i++){
      const a=windowAngles[i],r=wallRadius+.055*scale,px=Math.sin(a)*r,pz=Math.cos(a)*r;
      dummy.position.set(px,windowY,pz);dummy.rotation.set(0,a,0);dummy.scale.set(1,1,1);dummy.updateMatrix();panes.setMatrixAt(i,dummy.matrix);
      const specs=[[-paneWidth*.5,0,.13*scale,paneHeight+.18*scale,.20*scale],[paneWidth*.5,0,.13*scale,paneHeight+.18*scale,.20*scale],
        [0,-paneHeight*.5,paneWidth+.22*scale,.13*scale,.20*scale],[0,paneHeight*.5,paneWidth+.22*scale,.13*scale,.20*scale]];
      for(const [ox,oy,sx,sy,sz] of specs){
        dummy.position.set(px+Math.cos(a)*ox,windowY+oy,pz-Math.sin(a)*ox);
        dummy.rotation.set(0,a,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();frames.setMatrixAt(frameIndex++,dummy.matrix);
      }
    }
    panes.instanceMatrix.needsUpdate=true;frames.instanceMatrix.needsUpdate=true;house.add(panes,frames);
    const doorWidth=2.48*scale,doorHeight=3.22*scale,doorRadius=wallRadius+.10*scale;
    const left=new THREE.Mesh(new THREE.BoxGeometry(.18*scale,doorHeight+.14*scale,.24*scale),RESIDENCE_FRAME_MAT);
    left.position.set(-doorWidth*.5,baseY+doorHeight*.5,doorRadius);house.add(left);
    const right=left.clone();right.position.x=doorWidth*.5;house.add(right);
    const lintel=new THREE.Mesh(new THREE.BoxGeometry(doorWidth+.25*scale,.20*scale,.25*scale),paleWood);
    lintel.position.set(0,baseY+doorHeight,doorRadius);house.add(lintel);
    const pivot=new THREE.Group();pivot.position.set(doorWidth*.5,baseY+.12*scale,doorRadius-.04*scale);pivot.rotation.y=-.78;
    const leaf=new THREE.Mesh(new THREE.BoxGeometry(doorWidth,doorHeight,.16*scale),doorMat);leaf.position.set(-doorWidth*.5,doorHeight*.5,0);pivot.add(leaf);house.add(pivot);
    addWallLantern(baseY,outer,1.50);addWallLantern(baseY,outer,4.72);
    addOrganicTube(parent,ringPoints(wallRadius,wallTop),.25*scale,.18*scale,woodMat,7,72,.06);
  }
  addEnclosedStory(floorY,lowerOuter,4.8);addEnclosedStory(upperY,upperOuter,4.35);

  // Interiores habitados: mobiliário encostado ao anel de piso, preservando
  // a circulação entre a porta, a escada e o tronco vivo central.
  function addInteriorFurniture(baseY,upper=false){
    if(!upper){
      const tx=10.0*scale,tz=-1.1*scale;
      const rug=new THREE.Mesh(new THREE.CircleGeometry(1.75*scale,36),HOME_CUSHION_MAT);
      rug.rotation.x=-Math.PI/2;rug.position.set(tx,baseY+.085*scale,tz);house.add(rug);
      const top=new THREE.Mesh(new THREE.CylinderGeometry(1.28*scale,1.36*scale,.22*scale,20),woodMat);
      top.position.set(tx,baseY+1.12*scale,tz);top.castShadow=true;house.add(top);
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.22*scale,.34*scale,.95*scale,10),HOME_DARK_WOOD_MAT);
      stem.position.set(tx,baseY+.55*scale,tz);house.add(stem);
      for(let k=0;k<3;k++){
        const a=k*Math.PI*2/3;
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(.09*scale,.15*scale,.9*scale,7),woodMat);
        leg.position.set(tx+Math.cos(a)*.88*scale,baseY+.55*scale,tz+Math.sin(a)*.88*scale);house.add(leg);
        const sx=tx+Math.cos(a)*2.05*scale,sz=tz+Math.sin(a)*2.05*scale;
        const stool=new THREE.Mesh(new THREE.CylinderGeometry(.48*scale,.55*scale,.26*scale,12),HOME_CUSHION_MAT);
        stool.position.set(sx,baseY+.55*scale,sz);stool.castShadow=true;house.add(stool);
        const stoolLeg=new THREE.Mesh(new THREE.CylinderGeometry(.12*scale,.16*scale,.55*scale,7),woodMat);
        stoolLeg.position.set(sx,baseY+.28*scale,sz);house.add(stoolLeg);
      }
      const bowl=new THREE.Mesh(new THREE.SphereGeometry(.36*scale,14,8,0,Math.PI*2,0,Math.PI*.48),HOME_CERAMIC_MAT);
      bowl.position.set(tx,baseY+1.28*scale,tz);house.add(bowl);
      const shelf=new THREE.Group();shelf.position.set(-10.85*scale,baseY+.1*scale,-.8*scale);shelf.rotation.y=.08;house.add(shelf);
      const uprights=new THREE.BoxGeometry(.16*scale,2.65*scale,.18*scale);
      for(const side of [-1,1]){const post=new THREE.Mesh(uprights,HOME_DARK_WOOD_MAT);post.position.set(0,1.32*scale,side*1.28*scale);shelf.add(post);}
      for(let level=0;level<4;level++){
        const plank=new THREE.Mesh(new THREE.BoxGeometry(.7*scale,.12*scale,2.75*scale),woodMat);
        plank.position.set(.12*scale,.34*scale+level*.72*scale,0);shelf.add(plank);
        for(let book=0;book<3;book++){
          const volume=new THREE.Mesh(new THREE.BoxGeometry(.20*scale,.42*scale,.48*scale),
            book%2?HOME_CUSHION_MAT:HOME_LINEN_MAT);
          volume.position.set(.05*scale,.62*scale+level*.72*scale,(book-1)*.72*scale);shelf.add(volume);
        }
      }
    }else{
      const bx=-8.62*scale,bz=-.35*scale;
      const bedBase=new THREE.Mesh(new THREE.BoxGeometry(2.9*scale,.42*scale,1.9*scale),HOME_DARK_WOOD_MAT);
      bedBase.position.set(bx,baseY+.32*scale,bz);bedBase.castShadow=true;house.add(bedBase);
      const mattress=new THREE.Mesh(new THREE.BoxGeometry(2.72*scale,.28*scale,1.78*scale),HOME_LINEN_MAT);
      mattress.position.set(bx,baseY+.66*scale,bz);house.add(mattress);
      const blanket=new THREE.Mesh(new THREE.BoxGeometry(1.72*scale,.13*scale,1.82*scale),HOME_CUSHION_MAT);
      blanket.position.set(bx+.42*scale,baseY+.84*scale,bz);house.add(blanket);
      const pillow=new THREE.Mesh(new THREE.BoxGeometry(.72*scale,.18*scale,.92*scale),HOME_LINEN_MAT);
      pillow.position.set(bx-1.02*scale,baseY+.87*scale,bz);house.add(pillow);
      const headboard=new THREE.Mesh(new THREE.BoxGeometry(.18*scale,1.3*scale,2.05*scale),woodMat);
      headboard.position.set(bx-1.48*scale,baseY+.78*scale,bz);house.add(headboard);
      const chest=new THREE.Mesh(new THREE.BoxGeometry(1.65*scale,.92*scale,1.05*scale),HOME_DARK_WOOD_MAT);
      chest.position.set(8.45*scale,baseY+.52*scale,-.65*scale);chest.castShadow=true;house.add(chest);
      const lid=new THREE.Mesh(new THREE.BoxGeometry(1.72*scale,.16*scale,1.12*scale),paleWood);
      lid.position.set(8.45*scale,baseY+1.04*scale,-.65*scale);house.add(lid);
      const stool=new THREE.Mesh(new THREE.BoxGeometry(1.25*scale,.5*scale,.85*scale),HOME_CUSHION_MAT);
      stool.position.set(8.55*scale,baseY+.33*scale,2.0*scale);house.add(stool);
    }
  }
  addInteriorFurniture(floorY,false);
  addInteriorFurniture(upperY,true);
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
    addOrganicTube(parent,[[x+ca*upperOuter,upperY+4.02*scale,z+sa*upperOuter],
      [x+ca*6.0*scale,upperY+5.2*scale,z+sa*6.0*scale],[x+ca*3.3*scale,upperY+6.35*scale,z+sa*3.3*scale],
      [x+ca*1.7*scale,upperY+7.0*scale,z+sa*1.7*scale]],.27*scale,.07*scale,i%2?woodMat:dwellingRoofMat,7,20,.10);
  }
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2;
    addOrganicTube(parent,[[x+Math.cos(a)*lowerOuter*.78,floorY+4.0*scale,z+Math.sin(a)*lowerOuter*.78],
      [x+Math.cos(a+.25)*upperOuter*.92,upperY+.45*scale,z+Math.sin(a+.25)*upperOuter*.92]],.24*scale,.12*scale,paleWood,7,14,.08);
  }
  addWovenCanopy(parent,x,upperY+4.0*scale,z,upperOuter*.98,1.65*scale,3.05*scale,[1,5],scale);
  const stairPath=[],turns=1.28,stairRadius=5.35*scale,samples=64;
  for(let i=0;i<=samples;i++){const t=i/samples,a=t*Math.PI*2*turns,y=floorY+.18*scale+t*(upperY-floorY-.24*scale);stairPath.push([x+Math.cos(a)*stairRadius,y+.185*scale,z+Math.sin(a)*stairRadius]);}
  registerWalkablePath(stairPath,1.45*scale,'stair');
  const stepCount=48,stepGeo=new THREE.BoxGeometry(1.55*scale,.20*scale,1.02*scale);
  const steps=new THREE.InstancedMesh(stepGeo,new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x9b805a,roughness:.95}),stepCount),dummy=new THREE.Object3D();
  for(let i=0;i<stepCount;i++){const t=(i+.5)/stepCount,a=t*Math.PI*2*turns,y=floorY+.18*scale+t*(upperY-floorY-.24*scale);dummy.position.set(Math.cos(a)*stairRadius,y+.10*scale,Math.sin(a)*stairRadius);dummy.rotation.set(0,-a,0);dummy.updateMatrix();steps.setMatrixAt(i,dummy.matrix);}
  steps.instanceMatrix.needsUpdate=true;steps.castShadow=false;steps.receiveShadow=true;house.add(steps);
  const inner=[],outer=[];
  for(let i=0;i<=samples;i++){const t=i/samples,a=t*Math.PI*2*turns,y=floorY+1.05*scale+t*(upperY-floorY-.24*scale);inner.push([x+Math.cos(a)*(stairRadius-.78*scale),y,z+Math.sin(a)*(stairRadius-.78*scale)]);outer.push([x+Math.cos(a)*(stairRadius+.78*scale),y,z+Math.sin(a)*(stairRadius+.78*scale)]);}
  addOrganicTube(parent,inner,.22*scale,.15*scale,paleWood,7,96,.06);addOrganicTube(parent,outer,.26*scale,.18*scale,woodMat,8,96,.06);
  return {x:x,centerZ:z,y:floorY,z:z+lowerOuter+1.3*scale,floorY,upperY,outer:lowerOuter,upperOuter,scale,door:[x,floorY+.18*scale,z+lowerOuter+1.3*scale]};
}

function buildCanopyResidence(parent,x,z,floorY,seed=0){
  return buildReadableDwelling(parent,x,z,floorY,1.32,true,260);
}
function buildForestHome(parent,x,y,z){
  const floorY=y+.16,home=buildReadableDwelling(parent,x,z,floorY,.72,false,72);
  const porch=new THREE.Mesh(new THREE.BoxGeometry(4.4,.18,3.4),new THREE.MeshStandardMaterial({map:TEX_CASCA,color:0x8b7654,roughness:.96}));
  porch.position.set(x,floorY+.06,z+home.outer+2.25);porch.receiveShadow=true;parent.add(porch);
  registerWalkablePath([[x,floorY+.16,z+home.outer+6],[x,floorY+.16,z+home.outer+3],home.door],2.8);
  return home;
}
function addOrganicTube(parent,points,r0,r1,mat=woodMat,radial=9,segments=18,irregular=.12){
  let bucket=ARCH_TUBE_BUCKETS.get(mat);
  if(!bucket){bucket={pos:[],uv:[],idx:[]};ARCH_TUBE_BUCKETS.set(mat,bucket);}
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal',.38);
  const frames=curve.computeFrenetFrames(segments,false),base=bucket.pos.length/3;
  for(let j=0;j<=segments;j++){
    const t=j/segments,center=curve.getPointAt(t),r=r0*(1-t)+r1*t;
    for(let k=0;k<radial;k++){
      const a=k/radial*Math.PI*2,w=1+Math.sin(a*3+t*8)*irregular+Math.cos(a*5-t*11)*irregular*.3;
      const off=frames.normals[j].clone().multiplyScalar(Math.cos(a)*r*w).add(frames.binormals[j].clone().multiplyScalar(Math.sin(a)*r*w));
      bucket.pos.push(center.x+off.x,center.y+off.y,center.z+off.z);bucket.uv.push(k/radial,t*2.4);
    }
  }
  for(let j=0;j<segments;j++)for(let k=0;k<radial;k++){
    const a=base+j*radial+k,b=base+j*radial+(k+1)%radial,d=base+(j+1)*radial+(k+1)%radial,e=base+(j+1)*radial+k;
    bucket.idx.push(a,b,e,b,d,e);
  }
}
function addWovenCanopy(parent,cx,baseY,cz,outerRadius,innerRadius,height,openSectors=[1,5],scale=1){
  const positions=[],uvs=[],indices=[],filled=[],sectors=8,radialSteps=7,angularSteps=4;
  const surfacePoint=(t,u,sector)=>{
    const radius=outerRadius*(1-t)+innerRadius*t;
    const angle=(sector+u)/sectors*Math.PI*2;
    const y=baseY+height*(t*t*(3-2*t))+Math.sin(t*Math.PI)*.16*scale;
    const wobble=1+Math.sin(angle*7+t*8)*.012;
    return [cx+Math.sin(angle)*radius*wobble,y,cz+Math.cos(angle)*radius*wobble];
  };
  for(let sector=0;sector<sectors;sector++){
    if(openSectors.includes(sector))continue;
    const base=positions.length/3;filled.push(sector);
    for(let row=0;row<=radialSteps;row++){
      const t=row/radialSteps;
      for(let col=0;col<=angularSteps;col++){
        const u=col/angularSteps,p=surfacePoint(t,u,sector);
        positions.push(p[0],p[1],p[2]);uvs.push(u,t);
      }
    }
    for(let row=0;row<radialSteps;row++)for(let col=0;col<angularSteps;col++){
      const q=base+row*(angularSteps+1)+col,r=q+1,s0=q+angularSteps+1,t0=s0+1;
      indices.push(q,s0,r,r,s0,t0);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  const membrane=new THREE.Mesh(geo,RESIDENCE_WOVEN_MAT);
  membrane.castShadow=false;membrane.receiveShadow=true;parent.add(membrane);
  for(const sector of filled){
    for(const t of [.32,.66]){
      const pts=[];for(let j=0;j<=5;j++)pts.push(surfacePoint(t,j/5,sector));
      addOrganicTube(parent,pts,.055*scale,.035*scale,RESIDENCE_FIBER_MAT,5,12,.06);
    }
    for(const flip of [0,1]){
      const pts=[];for(let j=0;j<=7;j++){
        const t=j/7,u=flip===0?.14+t*.72:.86-t*.72;
        pts.push(surfacePoint(t,u,sector));
      }
      addOrganicTube(parent,pts,.047*scale,.03*scale,RESIDENCE_FIBER_MAT,5,14,.05);
    }
  }
  const outer=[],inner=[];
  for(let i=0;i<=64;i++){
    const a=i/64*Math.PI*2;
    outer.push([cx+Math.sin(a)*outerRadius,baseY,cz+Math.cos(a)*outerRadius]);
    inner.push([cx+Math.sin(a)*innerRadius,baseY+height,cz+Math.cos(a)*innerRadius]);
  }
  addOrganicTube(parent,outer,.12*scale,.08*scale,paleWood,7,64,.05);
  addOrganicTube(parent,inner,.09*scale,.06*scale,RESIDENCE_FIBER_MAT,6,64,.05);
}

function flushOrganicArchitecture(){
  for(const [mat,b] of ARCH_TUBE_BUCKETS){
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.setIndex(b.idx);g.computeVertexNormals();
    const mesh=new THREE.Mesh(g,mat);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
  }
  ARCH_TUBE_BUCKETS.clear();
}
function addOval(parent,x,y,z,rx,ry,rz,mat,detail=18){
  const g=new THREE.SphereGeometry(1,detail,Math.max(10,Math.floor(detail*.72))),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const X=p.getX(i),Y=p.getY(i),Z=p.getZ(i),n=1+.035*Math.sin(X*7+Z*3)+.025*Math.sin(Y*9-X*4);
    p.setXYZ(i,X*rx*n,Y*ry*n,Z*rz*n);
  }
  g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function addLivingTrunk(parent,x,y,z,height=22,radius=1.25,leanX=0,leanZ=0,mat=woodMat){
  const pts=[];
  for(let i=0;i<=6;i++){const t=i/6;pts.push([x+leanX*t+Math.sin(t*4+x)*.25,y+t*height,z+leanZ*t+Math.cos(t*3+z)*.22]);}
  const trunk=addOrganicTube(parent,pts,radius*1.35,radius*.12,mat,12,30,.10);
  for(let r=0;r<4;r++){
    const a=r*Math.PI*.5+x*.07,l=radius*(2.5+Math.random()*1.8);
    addOrganicTube(parent,[[x+Math.cos(a)*radius*.5,y+.12,z+Math.sin(a)*radius*.5],
      [x+Math.cos(a)*l,y+.3,z+Math.sin(a)*l]],radius*.35,.07,mat,7,12,.18);
  }
  return trunk;
}
function addOvoidPod(parent,x,y,z,rx,ry,rz,mat=woodMat){
  const pod=addOval(parent,x,y,z,rx,ry,rz,mat,20);
  // Seis nervuras curvas fazem a casa nascer visualmente dos galhos.
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,pts=[];
    for(let j=0;j<=5;j++){
      const t=j/5,yy=y-ry+2*ry*t,rr=Math.sqrt(Math.max(.04,1-Math.pow((yy-y)/ry,2)));
      pts.push([x+Math.cos(a)*rx*rr*1.03,yy,z+Math.sin(a)*rz*rr*1.03]);
    }
    addOrganicTube(parent,pts,.24,.16,paleWood,6,14,.08);
  }
  return pod;
}
function addTearOpening(parent,x,y,z,w,h,angle=0){
  const hole=addOval(parent,x,y,z,w*.5,h*.5,.17,darkMat,16);hole.rotation.y=angle;
  const rim=[];
  for(let i=0;i<=18;i++){const t=i/18,yy=y-h*.55+t*h,ww=w*.5*Math.sin(Math.PI*t*.88);rim.push([x+Math.cos(angle)*ww,yy,z+Math.sin(angle)*ww]);}
  addOrganicTube(parent,rim,.22,.15,paleWood,7,22,.06);
}
function addRootStair(parent,x,y,z,steps=8,width=9,forward=1){
  for(let i=0;i<steps;i++){
    const yy=y+i*.38,zz=z+forward*i*.82;
    addOrganicTube(parent,[[x-width*.55,yy,zz],[x-width*.25,yy+.12,zz+.12],[x+width*.25,yy+.12,zz-.12],[x+width*.55,yy,zz]],.48,.38,woodMat,8,12,.12);
    if(i%2===0)addOrganicTube(parent,[[x-width*.55,yy-.15,zz],[x-width*.75,yy-.35,zz+.35],[x-width*.9,yy-.42,zz+.65]],.2,.08,paleWood,6,10,.12);
  }
}
function addWovenRoof(parent,cx,cy,cz,length,width){
  // Nervuras principais e ramificações transversais: teto em favo de galhos vivos.
  for(let i=0;i<=7;i++){
    const x=cx-length/2+i*length/7,pts=[];
    for(let j=0;j<=7;j++){const t=j/7,z=cz-width/2+t*width;pts.push([x,cy+Math.sin(t*Math.PI)*4,z]);}
    addOrganicTube(parent,pts,.34,.20,woodMat,6,12,.13);
  }
  for(let j=0;j<=6;j++){
    const t=j/6,z=cz-width/2+t*width,pts=[];
    for(let i=0;i<=10;i++){const q=i/10,x=cx-length/2+q*length;pts.push([x,cy+Math.sin(t*Math.PI)*4+Math.sin(q*Math.PI)*1.5,z]);}
    addOrganicTube(parent,pts,.23,.14,paleWood,6,14,.10);
  }
  for(let i=0;i<6;i++){
    const x=cx-length/2+i*length/5;
    for(let j=0;j<4;j++){
      const z=cz-width/2+j*width/3;
      addOrganicTube(parent,[[x,cy+Math.sin((z-cz+width/2)/width*Math.PI)*4,z],
        [x+length/10,cy+4+Math.sin((z-cz+width/2)/width*Math.PI)*4,z+width/12],
        [x+length/5,cy+Math.sin((z-cz+width/2)/width*Math.PI)*4,z+width/6]],.14,.08,woodMat,5,7,.1);
    }
  }
}
function buildFlowerGrove(parent,x,y,z,radius=34,count=320,singleColor=null){
  const palette=singleColor?[singleColor]:[0xc49ab7,0xe2d29b,0xd8d5c4,0x8da67c,0x9a789a,0xc7a56d];
  const stemGeo=new THREE.CylinderGeometry(.018,.028,1,5),petalGeo=new THREE.SphereGeometry(1,7,5),centerGeo=new THREE.SphereGeometry(.075,6,5);
  const stemMat=new THREE.MeshStandardMaterial({color:0x405c32,roughness:1});
  const centerMat=new THREE.MeshStandardMaterial({color:0xe1bd73,roughness:.9});
  const petalMats=palette.map(color=>new THREE.MeshStandardMaterial({color,roughness:.85,side:THREE.DoubleSide}));
  const stems=new THREE.InstancedMesh(stemGeo,stemMat,count),centers=new THREE.InstancedMesh(centerGeo,centerMat,count);
  const petals=petalMats.map(mat=>new THREE.InstancedMesh(petalGeo,mat,count*9));
  const counts=palette.map(()=>0),d=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*radius,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    const ground=alturaTerreno(px,pz),h=(.45+Math.random()*.85)*(.65+Math.random()*.75),ci=i%palette.length;
    d.position.set(px,ground+h*.5,pz);d.rotation.set(0,Math.random()*Math.PI*2,0);d.scale.set(.8,h,.8);d.updateMatrix();stems.setMatrixAt(i,d.matrix);
    d.position.set(px,ground+h+.02,pz);d.rotation.set(0,0,0);d.scale.setScalar(.8);d.updateMatrix();centers.setMatrixAt(i,d.matrix);
    const n=5+(i%3)*2;
    for(let k=0;k<n;k++){
      const ang=k/n*Math.PI*2,pr=.18;
      d.position.set(px+Math.cos(ang)*pr,ground+h,pz+Math.sin(ang)*pr);
      d.rotation.set(.05,ang,Math.cos(ang)*.16);d.scale.set(.105,.045,.23);d.updateMatrix();
      petals[ci].setMatrixAt(counts[ci]++,d.matrix);
    }
  }
  stems.instanceMatrix.needsUpdate=true;centers.instanceMatrix.needsUpdate=true;parent.add(stems,centers);
  petals.forEach((mesh,i)=>{mesh.count=counts[i];mesh.instanceMatrix.needsUpdate=true;parent.add(mesh);});
}
function buildNaturalArch(parent,x,y,z){
  // Dois pinheiros vivos arqueiam os troncos um contra o outro.
  const left=[[x-7,y,z],[x-8,y+8,z+1],[x-5,y+17,z+2],[x-1,y+21,z+1]];
  const right=[[x+7,y,z],[x+8,y+8,z-1],[x+5,y+17,z-2],[x+1,y+21,z-1]];
  addOrganicTube(parent,left,2.1,.8,woodMat,12,30,.12);
  addOrganicTube(parent,right,2.0,.8,woodMat,12,30,.12);
  addOrganicTube(parent,[[x-1,y+21,z+1],[x,y+24,z],[x+1,y+21,z-1]],.85,.35,paleWood,9,18,.1);
  for(let s=-1;s<=1;s+=2){
    const base=s<0?left:right;
    for(let j=0;j<5;j++){
      const t=.35+j*.12,p=base[Math.min(3,Math.floor(t*3))];
      addOrganicTube(parent,[p,[p[0]+s*2,p[1]+4,p[2]-2],[p[0]+s*4,p[1]+6,p[2]-3]],.26,.06,woodMat,6,10,.12);
    }
  }
}
function buildGilderien(parent,x,y,z){
  // Feixe discreto e temporário de luz, não uma construção.
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.18,2.8,42,18,1,true),
    new THREE.MeshBasicMaterial({color:0xe3d99b,transparent:true,opacity:.045,depthWrite:false,side:THREE.DoubleSide}));
  beam.position.set(x,y+21,z);parent.add(beam);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(4,32),new THREE.MeshBasicMaterial({color:0xd9c98a,transparent:true,opacity:.10,side:THREE.DoubleSide}));
  glow.rotation.x=-Math.PI/2;glow.position.set(x,y+.04,z);parent.add(glow);
}
function buildTreeDwelling(parent,x,y,z){
  // Árvore dos Cavaleiros: pinheiro vivo com casa hexagonal em dois níveis.
  const h=260;
  addLivingTrunk(parent,x,y,z,h,8.2,8.5,-6.0,woodMat);
  const braces=[
    [[x-5,y+17,z+1],[x-13,y+25,z+3],[x-15,y+34,z+1]],
    [[x+5,y+18,z-1],[x+14,y+25,z-4],[x+16,y+35,z-3]],
    [[x-4,y+32,z-2],[x-12,y+40,z-7],[x-14,y+47,z-8]],
    [[x+4,y+34,z+1],[x+13,y+42,z+6],[x+15,y+49,z+7]]
  ];
  for(const p of braces)addOrganicTube(parent,p,1.25,.24,woodMat,10,28,.13);

  const lower=y+23,upper=y+36;
  addResidenceFloor(parent,x+1,lower,z+1,9.0,6.8,mossFloorMat);
  addHexagonalLivingShell(parent,x+1,lower+2.8,z+1,10.5,3.25,8.2,woodMat,true);
  addLivingDoorFrame(parent,x+1,lower,z+9.0,4.2,4.1);
  for(let side=0;side<6;side++){
    const a=-Math.PI/6+side*Math.PI/3,dx=Math.sin(a),dz=Math.cos(a);
    addOrganicTube(parent,[[x+1+dx*10.35,lower+.2,z+1+dz*8.05],
      [x+1+dx*10.85,lower+2.8,z+1+dz*8.45],
      [x+1+dx*8.9,lower+5.3,z+1+dz*6.9],
      [x+1+dx*4.2,lower+6.35,z+1+dz*3.5]],.32,.075,paleWood,7,22,.09);
  }
  for(const side of [-1,1]){
    const wx=x+side*7.6,wz=z+.8;
    addOval(parent,wx,lower+4.1,wz,1.45,2.0,.18,darkMat,16);
    const frame=[];for(let i=0;i<=18;i++){
      const q=-Math.PI*.82+i/18*Math.PI*1.64;
      frame.push([wx+Math.cos(q)*1.65,lower+4.1+Math.sin(q)*2.25,wz+.15]);
    }
    addOrganicTube(parent,frame,.18,.12,paleWood,7,24,.06);
  }

  addResidenceFloor(parent,x-2,upper,z-4,6.3,5.0,mossFloorMat);
  addHexagonalLivingShell(parent,x-2,upper+2.2,z-4,7.4,2.55,6.2,paleWood,true);
  addLivingDoorFrame(parent,x-2,upper,z+2.0,2.8,3.1);
  for(let side=0;side<6;side++){
    const a=-Math.PI/6+side*Math.PI/3,dx=Math.sin(a),dz=Math.cos(a);
    addOrganicTube(parent,[[x-2+dx*7.2,upper+.15,z-4+dz*6.0],
      [x-2+dx*7.5,upper+2.4,z-4+dz*6.3],
      [x-2+dx*5.8,upper+4.5,z-4+dz*4.9],
      [x-2+dx*2.8,upper+5.1,z-4+dz*2.4]],.25,.06,woodMat,7,18,.08);
  }
  for(const side of [-1,1]){
    const wx=x-2+side*5.0,wz=z-4;
    addOval(parent,wx,upper+3.1,wz,1.0,1.45,.14,darkMat,14);
    const frame=[];for(let i=0;i<=16;i++){
      const q=-Math.PI*.82+i/16*Math.PI*1.64;
      frame.push([wx+Math.cos(q)*1.15,upper+3.1+Math.sin(q)*1.65,wz+.12]);
    }
    addOrganicTube(parent,frame,.14,.09,woodMat,7,20,.05);
  }
  addWovenCanopy(parent,x-2,upper+4.9,z-4,7.6,1.6,2.5,[0,4],.88);

  const railOuter=[],railInner=[],walk=[],turns=2.25,steps=72,radius=12.2;
  for(let i=0;i<=steps;i++){
    const t=i/steps,q=t*Math.PI*2*turns-Math.PI/2,sy=y+1+t*22.7,
      px=x+Math.cos(q)*radius,pz=z+Math.sin(q)*radius;
    walk.push([px,sy,pz]);
    railOuter.push([x+Math.cos(q)*(radius+2.1),sy+2.1,z+Math.sin(q)*(radius+2.1)]);
    railInner.push([x+Math.cos(q)*(radius-2),sy+1.7,z+Math.sin(q)*(radius-2)]);
    if(i<steps){
      // Degraus e frisos em instâncias: mantém a escada detalhada sem 144 draw calls.
      // As matrizes são preenchidas abaixo, depois de criar as malhas compartilhadas.
    }
  }
  const knightStepCount=steps;
  const knightStepGeo=new THREE.BoxGeometry(4.2,.42,1.45);
  const knightNosingGeo=new THREE.BoxGeometry(4.35,.12,.18);
  const knightSteps=new THREE.InstancedMesh(knightStepGeo,paleWood,knightStepCount);
  const knightNosings=new THREE.InstancedMesh(knightNosingGeo,woodMat,knightStepCount);
  const stairDummy=new THREE.Object3D();
  for(let i=0;i<knightStepCount;i++){
    const t=(i+.5)/knightStepCount,q=t*Math.PI*2*turns,sy=y+1+t*22.7;
    const px=x+Math.cos(q)*radius,pz=z+Math.sin(q)*radius;
    stairDummy.position.set(px,sy,pz);stairDummy.rotation.set(0,-q,0);stairDummy.scale.set(1,1,1);
    stairDummy.updateMatrix();knightSteps.setMatrixAt(i,stairDummy.matrix);
    stairDummy.position.y=sy+.22;stairDummy.updateMatrix();knightNosings.setMatrixAt(i,stairDummy.matrix);
  }
  knightSteps.instanceMatrix.needsUpdate=true;knightNosings.instanceMatrix.needsUpdate=true;
  knightSteps.castShadow=false;knightSteps.receiveShadow=true;
  knightNosings.castShadow=false;knightNosings.receiveShadow=true;
  parent.add(knightSteps,knightNosings);
  addOrganicTube(parent,railOuter,.24,.18,paleWood,8,steps*2,.05);
  addOrganicTube(parent,railInner,.18,.12,woodMat,7,steps*2,.05);
  for(let i=0;i<=steps;i+=3){
    const p=walk[i],q=(i/steps)*Math.PI*2*turns-Math.PI/2;
    addOrganicTube(parent,[[x+Math.cos(q)*(radius+2.1),p[1],z+Math.sin(q)*(radius+2.1)],
      [x+Math.cos(q)*(radius+2.1),p[1]+1.9,z+Math.sin(q)*(radius+2.1)]],.10,.075,woodMat,6,5,.03);
  }
  registerWalkablePath(walk,3.5);
  registerWalkablePath([[x+1,lower,z+9],[x+1,lower,z+5],[x+1,lower,z+1]],3.2);
  registerWalkablePath([[x-2,upper,z+2],[x-2,upper,z-1],[x-2,upper,z-4]],2.6);

  for(let side=-1;side<=1;side+=2){
    addOrganicTube(parent,[[x+side*5,y+45,z],
      [x+side*20,y+57,z+side*5],[x+side*38,y+69,z+side*12],
      [x+side*54,y+74,z+side*18]],2.6,.28,woodMat,12,42,.16);
    for(let k=0;k<5;k++){
      const bx=x+side*(18+k*7),bz=z+side*(5+k*2);
      addOrganicTube(parent,[[bx,y+56+k*2,bz],[bx+side*6,y+64+k*2,bz+side*3],
        [bx+side*10,y+68+k*2,bz+side*5]],.55,.08,paleWood,8,18,.12);
    }
  }
}
function buildHall(parent,x,y,z){
  // Sala do Trono: salão de árvores, não um castelo ou templo de pedra.
  // Vinte e quatro assentos ladeiam o corredor central; ao fundo, o pavilhão
  // branco protege o trono de raízes entrelaçadas, conforme Eldest.
  const length=68,width=32,height=24,postXs=[];
  for(let i=0;i<9;i++)postXs.push(x-28+i*7);

  // Duas fileiras de pinheiros vivos formam a nave e sustentam a cobertura.
  for(const side of [-1,1]){
    for(let i=0;i<postXs.length;i++){
      const px=postXs[i],pz=z+side*13;
      addLivingTrunk(parent,px,y,pz,height+8,1.75,
        Math.sin(i*.7)*1.8,side*.95,woodMat);
      addOrganicTube(parent,[[px,y+height*.32,pz],
        [px+Math.sin(i*.6)*2.4,y+height+4,pz+side*2.4],
        [px+Math.sin(i*.42)*2.8,y+height+10,z+side*5],
        [x+(px-x)*.72,y+height+12,z]],.72,.16,paleWood,8,30,.13);
    }
  }

  // Ramos cruzados fecham as laterais sem criar paredes retas ou alvenaria.
  for(const side of [-1,1]){
    const wallZ=z+side*12.7;
    for(let i=0;i<8;i++){
      const ax=postXs[i]+.8,bx=postXs[i+1]-.8;
      addOrganicTube(parent,[[ax,y+1.0,wallZ],[ax+1.8,y+4.2,wallZ-side*.42],
        [bx-1.8,y+5.8,wallZ+side*.35],[bx,y+1.0,wallZ]],.30,.12,woodMat,7,20,.10);
      addOrganicTube(parent,[[ax,y+1.0,wallZ],[ax+1.9,y+5.7,wallZ+side*.35],
        [bx-1.9,y+4.1,wallZ-side*.35],[bx,y+1.0,wallZ]],.25,.10,paleWood,7,20,.09);
    }
    addOrganicTube(parent,[[x-30,y+1.0,wallZ],[x-18,y+2.0,wallZ-side*.3],
      [x,y+1.4,wallZ],[x+18,y+2.0,wallZ-side*.3],[x+30,y+1.0,wallZ]],.40,.22,woodMat,8,48,.08);
  }

  // Teto em colmeia: centenas de ramos se encontram em uma malha orgânica.
  addHoneycombRoof(parent,x,y+height+3,z,length,width);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1,96),mossFloorMat);
  floor.rotation.x=-Math.PI/2;floor.position.set(x,y+.04,z);
  floor.scale.set(length*.54,width*.80,1);floor.receiveShadow=true;parent.add(floor);
  const aisleMat=new THREE.MeshStandardMaterial({color:0x596b3c,roughness:1,side:THREE.DoubleSide});
  const aisle=new THREE.Mesh(new THREE.PlaneGeometry(6.2,42),aisleMat);
  aisle.rotation.x=-Math.PI/2;aisle.position.set(x,y+.08,z+1);parent.add(aisle);

  // Doze cadeiras de madeira viva em cada lado, todas voltadas para a rainha.
  for(let side of [-1,1])for(let i=0;i<12;i++){
    const px=x-23+i*4.18,pz=z+side*9.0,cy=y+.78;
    addOrganicTube(parent,[[px-.92,cy,pz],[px,cy+.28,pz+side*.18],[px+.92,cy,pz]],
      .27,.20,woodMat,8,12,.08);
    addOrganicTube(parent,[[px-.80,cy,pz],[px-.84,cy+2.0,pz-side*.38],
      [px,cy+2.48,pz-side*.55],[px+.84,cy+2.0,pz-side*.38],[px+.80,cy,pz]],
      .23,.13,paleWood,8,18,.09);
    for(let k of [-1,1])addOrganicTube(parent,[[px+k*.80,cy,pz],
      [px+k*1.02,cy+.95,pz+side*.08]],.13,.075,woodMat,6,9,.06);
    const seatInset=new THREE.Mesh(new THREE.BoxGeometry(1.15,.12,.72),HOME_CUSHION_MAT);
    seatInset.position.set(px,cy+.38,pz);parent.add(seatInset);
  }

  // Pavilhão branco aberto em nervuras; nada de cápsula ou volume esférico.
  const throneX=x,throneZ=z-25,platformY=y+.26;
  addResidenceFloor(parent,throneX,platformY,throneZ,8.2,6.4,whiteBarkMat);
  for(const side of [-1,1])for(const front of [-1,1]){
    const px=throneX+side*5.4,pz=throneZ+front*3.5;
    addLivingTrunk(parent,px,platformY,pz,8.8,.52,-side*.8,-front*.7,whiteBarkMat);
    addOrganicTube(parent,[[px,platformY+6.4,pz],
      [throneX+side*3.7,platformY+9.4,throneZ+front*2.0],
      [throneX,platformY+10.1,throneZ-1.2]],.38,.12,whiteBarkMat,8,24,.07);
  }
  addWovenCanopy(parent,throneX,platformY+6.2,throneZ,8.6,2.2,4.1,[0,4],1.12);
  for(let side of [-1,1]){
    addOrganicTube(parent,[[throneX+side*8.2,platformY+6.3,throneZ],
      [throneX+side*6.4,platformY+9.6,throneZ-1.0],
      [throneX,platformY+10.2,throneZ-1.2]],.32,.11,whiteBarkMat,8,26,.06);
  }

  // Trono de raízes nodosas: assento alto, encosto ramificado e braços vivos.
  addOrganicTube(parent,[[x-3.2,y+.55,throneZ+1.2],[x-2.4,y+1.55,throneZ],
    [x,y+1.8,throneZ-.8],[x+2.4,y+1.55,throneZ],[x+3.2,y+.55,throneZ+1.2]],
    .82,.36,woodMat,10,28,.13);
  addOval(parent,x,y+2.0,throneZ-.4,2.2,.42,1.72,paleWood,22);
  addOval(parent,x,y+2.28,throneZ-.6,1.75,.18,1.28,HOME_CUSHION_MAT,22);
  for(let side of [-1,1]){
    addOrganicTube(parent,[[x+side*1.55,y+2.1,throneZ+.65],
      [x+side*2.55,y+2.8,throneZ+.2],[x+side*2.45,y+3.15,throneZ-1.3],
      [x+side*1.55,y+3.35,throneZ-1.7]],.48,.17,woodMat,9,22,.12);
    addOrganicTube(parent,[[x+side*.85,y+2.35,throneZ-1.55],
      [x+side*1.35,y+4.4,throneZ-2.4],[x+side*.72,y+6.4,throneZ-2.1],
      [x+side*.15,y+7.8,throneZ-1.5]],.42,.10,paleWood,8,22,.1);
  }
  for(let i=0;i<7;i++){
    const a=-.9+i*.3,rx=Math.sin(a)*2.2;
    addOrganicTube(parent,[[x+rx,y+.18,throneZ+2.0],
      [x+rx*1.35,y+1.3,throneZ+.8],
      [x+rx*.8,y+3.3+(i%2)*.55,throneZ-1.7],
      [x+rx*.45,y+5.7+(i%3)*.42,throneZ-1.2]],.22,.065,woodMat,7,18,.12);
  }
  for(let side of [-1,1]){
    addOrganicTube(parent,[[x+side*7.0,y+.25,throneZ+3.5],
      [x+side*5.6,y+1.5,throneZ+2.0],[x+side*3.2,y+1.8,throneZ+1.4]],
      .34,.10,whiteBarkMat,8,22,.08);
  }

  // Entrada entre mudas cantantes e degraus de raízes, aberta para a clareira.
  addLivingDoorFrame(parent,x,y,z+27,7.0,9.5);
  for(let side of [-1,1]){
    addOrganicTube(parent,[[x+side*8,y,z+29],[x+side*7,y+4,z+27],
      [x+side*4,y+8,z+23],[x,y+11,z+19]],.38,.09,woodMat,8,24,.1);
  }
  // Piso contínuo desde a entrada; a subida é quase plana e sem degraus falsos.
  addOrganicTube(parent,[[x-7,y+.08,z+30],[x-5,y+.08,z+26],[x,y+.08,z+23],
    [x+5,y+.08,z+26],[x+7,y+.08,z+30]],.26,.18,paleWood,7,24,.06);
  registerWalkablePath([[x,y+.15,z+31],[x,y+.15,z+25],[x,y+.15,z+18],
    [x,y+.15,z+5],[x,y+.15,z-8],[x,y+.15,z-17],[x,y+.25,z-21]],5.2);

  // Poleiro vivo para Blagden, junto ao pavilhão.
  addOrganicTube(parent,[[x+11,y+3.0,z-18],[x+13,y+5.5,z-21],
    [x+14,y+8.0,z-23],[x+16,y+8.0,z-23]],.23,.10,woodMat,7,22,.07);
  const hallGlow=new THREE.PointLight(0xffd18a,1.2,44,1.8);
  hallGlow.position.set(x,y+8,z);parent.add(hallGlow);
}
function buildForge(parent,x,y,z){
  // Forja de Rhunön: oficina aberta, protegida por ramos vivos.
  // Pedra fica concentrada na zona de calor; a estrutura principal é madeira.
  const base=new THREE.Mesh(new THREE.CylinderGeometry(11.8,12.8,.78,12),stoneMat);
  base.position.set(x,y+.34,z);base.receiveShadow=true;parent.add(base);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(11.2,48),mossFloorMat);
  floor.rotation.x=-Math.PI/2;floor.position.set(x,y+.76,z);parent.add(floor);

  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,px=x+Math.cos(a)*10.3,pz=z+Math.sin(a)*10.3;
    addLivingTrunk(parent,px,y+.7,pz,11.5,.78,-Math.cos(a)*1.1,-Math.sin(a)*1.1,woodMat);
    addOrganicTube(parent,[[px,y+8.8,pz],
      [x+Math.cos(a)*6.8,y+12.3,z+Math.sin(a)*6.8],
      [x+Math.cos(a)*3.0,y+12.8,z+Math.sin(a)*3.0],
      [x+Math.cos(a+Math.PI/4)*.6,y+11.8,z+Math.sin(a+Math.PI/4)*.6]],
      .52,.10,i%2?woodMat:paleWood,8,26,.11);
  }
  addWovenCanopy(parent,x,y+8.8,z,12.4,3.4,3.2,[0,4],1.0);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,pts=[];
    for(let j=0;j<=12;j++){
      const t=j/12,r=11.8*(1-t)+3.5*t;
      pts.push([x+Math.cos(a)*r,y+8.9+2.8*t*t,z+Math.sin(a)*r]);
    }
    addOrganicTube(parent,pts,.11,.045,RESIDENCE_FIBER_MAT,5,18,.05);
  }

  // Lareira baixa em pedra, aberta na frente e sem chaminé de alvenaria.
  const hearthBase=new THREE.Mesh(new THREE.CylinderGeometry(3.25,3.8,1.15,12),stoneMat);
  hearthBase.position.set(x-4.2,y+1.32,z-2.8);hearthBase.receiveShadow=true;parent.add(hearthBase);
  const hearthRim=new THREE.Mesh(new THREE.CylinderGeometry(2.7,3.0,.72,12),paleWood);
  hearthRim.position.set(x-4.2,y+2.15,z-2.8);parent.add(hearthRim);
  const coal=new THREE.Mesh(new THREE.CylinderGeometry(2.0,2.2,.10,12),
    new THREE.MeshStandardMaterial({color:0x2c2119,emissive:0x562a12,emissiveIntensity:.65,roughness:1}));
  coal.position.set(x-4.2,y+2.55,z-2.8);parent.add(coal);
  const flameMat=new THREE.MeshBasicMaterial({color:0xf19a48,transparent:true,opacity:.72,
    side:THREE.DoubleSide});
  const flame=new THREE.Mesh(new THREE.CircleGeometry(1.35,18),flameMat);
  flame.rotation.x=-Math.PI/2;flame.position.set(x-4.2,y+2.62,z-2.8);parent.add(flame);
  const fireGlow=new THREE.PointLight(0xff873c,1.1,20);
  fireGlow.position.set(x-4.2,y+4,z-2.8);parent.add(fireGlow);

  // Bigorna sobre cepo e bancada de trabalho.
  const stump=new THREE.Mesh(new THREE.CylinderGeometry(.62,.92,1.55,9),woodMat);
  stump.position.set(x+3.9,y+1.55,z-2.2);parent.add(stump);
  const anvilBase=new THREE.Mesh(new THREE.BoxGeometry(2.8,.44,1.25),stoneMat);
  anvilBase.position.set(x+3.9,y+2.52,z-2.2);parent.add(anvilBase);
  const anvilMat=new THREE.MeshStandardMaterial({color:0x70716e,metalness:.72,roughness:.38});
  const anvilTop=new THREE.Mesh(new THREE.BoxGeometry(2.1,.58,.92),anvilMat);
  anvilTop.position.set(x+3.9,y+3.02,z-2.2);parent.add(anvilTop);
  const horn=new THREE.Mesh(new THREE.ConeGeometry(.42,1.25,7),anvilMat);
  horn.rotation.z=-Math.PI/2;horn.position.set(x+5.15,y+3.08,z-2.2);parent.add(horn);

  const bench=new THREE.Mesh(new THREE.BoxGeometry(4.2,.36,1.25),woodMat);
  bench.position.set(x+2.8,y+1.25,z+4.4);parent.add(bench);
  for(let side of [-1,1]){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.22,1.0,.22),woodMat);
    leg.position.set(x+2.8+side*1.55,y+.78,z+4.4);parent.add(leg);
  }
  const bellows=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.2,.55),dwellingTrimMat);
  bellows.position.set(x+6.3,y+2.15,z+3.2);bellows.rotation.y=-.35;parent.add(bellows);
  const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.11,.18,1.2,8),stoneMat);
  nozzle.rotation.x=Math.PI/2;nozzle.position.set(x+5.1,y+2.2,z+1.7);parent.add(nozzle);

  const rackLeft=[[x-8,y+1,z+5],[x-8,y+5.8,z+5],[x-4,y+6.2,z+5]];
  addOrganicTube(parent,rackLeft,.24,.08,woodMat,7,18,.06);
  for(let i=0;i<4;i++){
    const tool=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,3.5,6),stoneMat);
    tool.position.set(x-7.4+i*.72,y+4.1,z+5);tool.rotation.z=.12*(i-1.5);parent.add(tool);
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.065,1.1,6),woodMat);
    handle.position.set(x-7.4+i*.72,y+1.85,z+5);parent.add(handle);
  }
  registerWalkablePath([[x,y+.82,z+10],[x,y+.82,z+5],[x,y+.82,z],[x,y+.82,z-5]],4.2);
}
function buildTialdari(parent,x,y,z){
  // Tialdarí Hall: conjunto ancestral da família de Arya, com sala comum,
  // jardins e uma ala privada. Os aposentos formam uma sequência interna:
  // sala de estar coberta de trepadeiras, quarto pequeno e escritório.
  const common=buildReadableDwelling(parent,x,z,y+.18,1.18,true,112);

  // Ala de Arya: um único volume orgânico, de madeira viva e planta hexagonal.
  const suiteX=x-31,suiteZ=z-5,suiteFloor=y+.18,suiteRadius=12.3,suiteDepth=10.5;
  addResidenceFloor(parent,suiteX,suiteFloor,suiteZ,11.6,9.9,mossFloorMat);
  addHexagonalLivingShell(parent,suiteX,suiteFloor+2.75,suiteZ,
    suiteRadius,3.05,suiteDepth,dwellingWallMat,true);
  addLivingDoorFrame(parent,suiteX,suiteFloor,suiteZ+suiteDepth*.96,2.8,3.5);
  const suiteWalk=[];
  for(let i=0;i<=30;i++){
    const t=i/30;
    suiteWalk.push([suiteX,suiteFloor+.16,suiteZ+suiteDepth*.70-t*suiteDepth*1.28]);
  }
  registerWalkablePath(suiteWalk,4.2,'house');

  // Nervuras que se fecham em arcos altos e sustentam as paredes de madeira.
  for(let side=0;side<6;side++){
    const a=-Math.PI/6+side*Math.PI/3,dx=Math.sin(a),dz=Math.cos(a);
    addOrganicTube(parent,[[suiteX+dx*suiteRadius*.98,suiteFloor+.12,suiteZ+dz*suiteDepth*.98],
      [suiteX+dx*suiteRadius*1.02,suiteFloor+2.75,suiteZ+dz*suiteDepth*1.02],
      [suiteX+dx*suiteRadius*.84,suiteFloor+5.0,suiteZ+dz*suiteDepth*.84],
      [suiteX+dx*suiteRadius*.35,suiteFloor+6.25,suiteZ+dz*suiteDepth*.35]],
      .28,.07,side%2?woodMat:paleWood,7,22,.08);
  }

  // Trepadeiras cobrem o exterior da sala de estar e se entrelaçam pelo beiral.
  for(let vine=0;vine<18;vine++){
    const a=vine/18*Math.PI*2,ca=Math.sin(a),sa=Math.cos(a),
      radius=suiteRadius*.98,depth=suiteDepth*.98;
    addOrganicTube(parent,[[suiteX+ca*radius,suiteFloor+.2,suiteZ+sa*depth],
      [suiteX+ca*(radius+.35),suiteFloor+2.6,suiteZ+sa*(depth+.35)],
      [suiteX+ca*(radius-.2),suiteFloor+4.8,suiteZ+sa*(depth-.2)],
      [suiteX+ca*(radius*.56),suiteFloor+6.6,suiteZ+sa*(depth*.56)]],
      .115,.032,vine%3===0?mossFloorMat:paleWood,5,22,.13);
  }
  addWovenCanopy(parent,suiteX,suiteFloor+5.8,suiteZ,suiteRadius*.94,2.2,2.7,[0,4],.82);

  // Divisórias vazadas abrem para dois ambientes menores dentro da mesma ala.
  const dividerMat=new THREE.MeshStandardMaterial({color:0x796447,roughness:1,
    transparent:true,opacity:.88,side:THREE.DoubleSide});
  for(let side of [-1,1]){
    const divider=new THREE.Mesh(new THREE.BoxGeometry(.13,2.5,4.7),dividerMat);
    divider.position.set(suiteX+side*4.45,suiteFloor+1.25,suiteZ-.15);
    parent.add(divider);
    addOrganicTube(parent,[[suiteX+side*4.5,suiteFloor+.15,suiteZ-2.55],
      [suiteX+side*4.8,suiteFloor+2.6,suiteZ-2.55],
      [suiteX+side*4.45,suiteFloor+2.9,suiteZ+2.25],
      [suiteX+side*4.45,suiteFloor+.15,suiteZ+2.25]],.14,.05,woodMat,6,16,.08);
  }

  // Sala de estar: tapete, assentos e mesa baixa no centro.
  const livingRug=new THREE.Mesh(new THREE.CircleGeometry(2.7,32),HOME_CUSHION_MAT);
  livingRug.rotation.x=-Math.PI/2;livingRug.position.set(suiteX,suiteFloor+.10,suiteZ+1.1);parent.add(livingRug);
  const dayBed=new THREE.Mesh(new THREE.BoxGeometry(4.6,.62,1.35),HOME_LINEN_MAT);
  dayBed.position.set(suiteX,suiteFloor+.42,suiteZ+4.1);parent.add(dayBed);
  const lowTable=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.28,.24,16),woodMat);
  lowTable.position.set(suiteX,suiteFloor+.64,suiteZ+.45);parent.add(lowTable);
  const lowStem=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,.62,9),HOME_DARK_WOOD_MAT);
  lowStem.position.set(suiteX,suiteFloor+.34,suiteZ+.45);parent.add(lowStem);

  // Quarto pequeno: cama, cabeceira, manta e uma mesinha junto à parede lateral.
  const bedX=suiteX-8.0,bedZ=suiteZ+1.0;
  const bedBase=new THREE.Mesh(new THREE.BoxGeometry(3.3,.42,2.25),HOME_DARK_WOOD_MAT);
  bedBase.position.set(bedX,suiteFloor+.30,bedZ);parent.add(bedBase);
  const mattress=new THREE.Mesh(new THREE.BoxGeometry(3.12,.28,2.08),HOME_LINEN_MAT);
  mattress.position.set(bedX,suiteFloor+.64,bedZ);parent.add(mattress);
  const blanket=new THREE.Mesh(new THREE.BoxGeometry(1.8,.12,2.1),HOME_CUSHION_MAT);
  blanket.position.set(bedX+.42,suiteFloor+.84,bedZ);parent.add(blanket);
  const pillow=new THREE.Mesh(new THREE.BoxGeometry(.82,.18,1.02),HOME_LINEN_MAT);
  pillow.position.set(bedX-1.0,suiteFloor+.86,bedZ);parent.add(pillow);

  // Escritório: escrivaninha, rolos de pergaminho e estante estreita.
  const deskX=suiteX+8.0,deskZ=suiteZ-1.4;
  const desk=new THREE.Mesh(new THREE.BoxGeometry(3.0,.18,1.42),woodMat);
  desk.position.set(deskX,suiteFloor+1.22,deskZ);parent.add(desk);
  for(let side of [-1,1]){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,1.1,.16),HOME_DARK_WOOD_MAT);
    leg.position.set(deskX+side*1.15,suiteFloor+.63,deskZ);parent.add(leg);
  }
  for(let i=0;i<5;i++){
    const roll=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.95,8),HOME_LINEN_MAT);
    roll.rotation.z=Math.PI/2;roll.position.set(deskX-1.0+i*.48,suiteFloor+1.43,deskZ);parent.add(roll);
  }
  const shelf=new THREE.Mesh(new THREE.BoxGeometry(.38,2.45,3.2),HOME_DARK_WOOD_MAT);
  shelf.position.set(suiteX+10.0,suiteFloor+1.3,suiteZ-5.2);parent.add(shelf);
  for(let level=0;level<3;level++){
    const plank=new THREE.Mesh(new THREE.BoxGeometry(.56,.10,3.3),paleWood);
    plank.position.set(suiteX+9.75,suiteFloor+.55+level*.73,suiteZ-5.2);parent.add(plank);
  }
  const glassMemory=new THREE.Mesh(new THREE.SphereGeometry(.48,14,10),
    new THREE.MeshPhysicalMaterial({color:0x94a99b,roughness:.12,transmission:.72,transparent:true,opacity:.74}));
  glassMemory.position.set(bedX+2.1,suiteFloor+1.4,bedZ-1.5);parent.add(glassMemory);

  // Caminho de madeira viva liga a sala comum à ala privada.
  const suiteDoor=[suiteX,suiteFloor+.16,suiteZ+suiteDepth*.96+1.0];
  buildLivingBridge(parent,common.door,suiteDoor,4.0,1);
  const screen=[];
  for(let i=0;i<=16;i++){
    const t=i/16;
    screen.push([suiteX-1.65+3.3*t,suiteFloor+.25+Math.sin(t*Math.PI)*3.1,
      suiteZ+suiteDepth*.96+.15]);
  }
  addOrganicTube(parent,screen,.18,.07,paleWood,7,28,.06);

  // Jardins da família: canteiros em torno das casas e caminhos sinuosos.
  buildFlowerGrove(parent,x+25,y,z+25,28,150);
  buildFlowerGrove(parent,x-18,y,z+42,24,115);
  buildFlowerGrove(parent,x-62,y,z-4,20,95);
  addOrganicTube(parent,[[x+30,y+.12,z+38],[x+18,y+.14,z+32],
    [x+2,y+.12,z+31],[x-18,y+.12,z+35],[x-38,y+.12,z+33]],.24,.12,woodMat,6,48,.08);
  for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2,px=x+Math.cos(a)*61,pz=z+Math.sin(a)*42;
    addLivingTrunk(parent,px,y,pz,38+Math.random()*10,.78+Math.random()*.22,
      Math.cos(a)*1.6,Math.sin(a)*1.4,woodMat);
  }
}
function buildHexagonalResidence(parent,x,y,z,scale=1){
  return buildReadableDwelling(parent,x,z,y+.35*scale,.88*scale,false);
}
function buildFiveStoreyResidence(parent,x,y,z){
  // Casa de cinco pavimentos entre três pinheiros, como o exemplo descrito em Eldest.
  // Três troncos sustentam uma estrutura leve, hexagonal e escalonada por ramos curvos.
  const treePositions=[[-9,-6],[9,-6],[0,12]];
  for(let i=0;i<treePositions.length;i++){
    const [dx,dz]=treePositions[i],leanX=(i-1)*1.25,leanZ=i===2?-1.3:.8;
    addLivingTrunk(parent,x+dx,y,z+dz,68, i===2?2.15:1.85,leanX,leanZ,woodMat);
  }

  const levels=[3.6,10.1,16.6,23.1,29.6];
  const radii=[13.4,12.0,10.6,9.2,7.8];
  const depthFactor=.84;
  const storyMaterials=[dwellingWallMat,woodMat,paleWood,woodMat,whiteBarkMat];

  for(let level=0;level<levels.length;level++){
    const floorY=y+levels[level],radius=radii[level],depth=radius*depthFactor;
    addResidenceFloor(parent,x,floorY,z,radius*1.08,depth*1.08,mossFloorMat);
    addHexagonalLivingShell(parent,x,floorY+2.85,z,radius,3.15,depth,storyMaterials[level],true);

    // Seis nervuras de madeira viva sustentam cada pavimento e se afunilam no beiral.
    for(let side=0;side<6;side++){
      const a=-Math.PI/6+side*Math.PI/3,dx=Math.sin(a),dz=Math.cos(a)*depthFactor;
      addOrganicTube(parent,[[x+dx*radius*.98,floorY+.15,z+dz*radius*.98],
        [x+dx*radius*1.05,floorY+2.4,z+dz*radius*1.05],
        [x+dx*radius*.82,floorY+5.4,z+dz*radius*.82],
        [x+dx*radius*.42,floorY+6.45,z+dz*radius*.42],
        [x+dx*.65,floorY+6.85,z+dz*.65]],.34,.075,level%2?woodMat:paleWood,7,22,.08);
    }

    // Janelas pequenas em vidro colorido, uma por face que não contém a porta.
    for(let face=1;face<6;face++){
      const a=-Math.PI/6+(face+.5)*Math.PI/3;
      const wx=x+Math.sin(a)*(radius-.12),wz=z+Math.cos(a)*(depth-.12);
      const pane=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),
        RESIDENCE_WINDOW_MAT);
      pane.position.set(wx,floorY+3.25,wz);
      pane.scale.set(.72,1.05,.14);pane.rotation.y=a;parent.add(pane);
      const frame=[];
      for(let k=0;k<=14;k++){
        const q=-Math.PI*.82+k/14*Math.PI*1.64;
        frame.push([wx+Math.cos(q)*.82,floorY+3.25+Math.sin(q)*1.18,wz+Math.cos(a)*.10]);
      }
      addOrganicTube(parent,frame,.105,.065,paleWood,6,18,.04);
    }

    // Beiral leve de madeira entrelaçada e guarda-corpo contínuo.
    const rail=[];
    for(let i=0;i<=72;i++){
      const a=i/72*Math.PI*2;
      rail.push([x+Math.sin(a)*radius*1.02,floorY+1.08,z+Math.cos(a)*depth*1.02]);
    }
    addOrganicTube(parent,rail,.19,.14,paleWood,7,72,.055);
    for(let i=0;i<24;i++){
      const a=i/24*Math.PI*2;
      addOrganicTube(parent,[[x+Math.sin(a)*radius*1.02,floorY+.15,z+Math.cos(a)*depth*1.02],
        [x+Math.sin(a)*radius*1.02,floorY+1.02,z+Math.cos(a)*depth*1.02]],.07,.055,woodMat,5,5,.03);
    }
    addLivingDoorFrame(parent,x,floorY,z+depth*.96,2.9,3.55);
    const ring=[];for(let i=0;i<=72;i++){
      const a=i/72*Math.PI*2;
      ring.push([x+Math.sin(a)*radius*.56,floorY+.16,z+Math.cos(a)*depth*.56]);
    }
    registerWalkablePath(ring,Math.max(3.0,radius*.36),'house');
  }

  // Contrafortes voadores: os três pinheiros são unidos à casa por grandes ramos curvos.
  for(let tree=0;tree<treePositions.length;tree++){
    const [dx,dz]=treePositions[tree];
    for(let level=0;level<levels.length;level++){
      const floorY=y+levels[level],radius=radii[level],side=tree===0?-1:tree===1?1:0;
      addOrganicTube(parent,[[x+dx,y+37+tree*2,z+dz],
        [x+dx*.72+side*4,floorY+6.8,z+dz*.72-2],
        [x+side*radius*.88,floorY+4.8,z+radius*.30],
        [x+side*radius*.72,floorY+.4,z+radius*.42]],.62,.12,woodMat,8,26,.12);
    }
  }

  // Escada helicoidal externa, com degraus próprios, corrimão e ligação a cada nível.
  const stairX=x+21,stairZ=z-2,stairRise=levels[4]-levels[0],turns=3.3,stairRadius=5.25,samples=220,path=[];
  for(let i=0;i<=samples;i++){
    const t=i/samples,a=t*Math.PI*2*turns;
    path.push([stairX+Math.cos(a)*stairRadius,y+levels[0]+t*stairRise,stairZ+Math.sin(a)*stairRadius]);
  }
  registerWalkablePath(path,3.05,'stair');
  const stairGround=alturaTerreno(stairX+stairRadius,stairZ+8);
  addRootStair(parent,stairX+stairRadius,stairGround,stairZ+8,10,3.8,-.82);
  const baseSteps=Array.from({length:10},(_,i)=>[
    stairX+stairRadius,stairGround+i*.38,stairZ+8-i*.82
  ]);
  registerWalkablePath(baseSteps,3.8,'stair');
  buildLivingBridge(parent,baseSteps[baseSteps.length-1],path[0],3.1,1);
  const outerRail=[],innerRail=[];
  for(let i=0;i<=samples;i++){
    const t=i/samples,a=t*Math.PI*2*turns,yy=y+levels[0]+t*stairRise;
    outerRail.push([stairX+Math.cos(a)*(stairRadius+1.65),yy+1.2,stairZ+Math.sin(a)*(stairRadius+1.65)]);
    innerRail.push([stairX+Math.cos(a)*(stairRadius-1.65),yy+1.05,stairZ+Math.sin(a)*(stairRadius-1.65)]);
  }
  addOrganicTube(parent,outerRail,.20,.14,paleWood,7,samples,.04);
  addOrganicTube(parent,innerRail,.16,.11,woodMat,6,samples,.04);
  const stepCount=156,stepGeo=new THREE.BoxGeometry(3.1,.20,.94);
  const stairs=new THREE.InstancedMesh(stepGeo,woodMat,stepCount),dummy=new THREE.Object3D();
  for(let i=0;i<stepCount;i++){
    const t=(i+.5)/stepCount,a=t*Math.PI*2*turns;
    dummy.position.set(stairX+Math.cos(a)*stairRadius,y+levels[0]+t*stairRise,stairZ+Math.sin(a)*stairRadius);
    dummy.rotation.y=-a;dummy.updateMatrix();stairs.setMatrixAt(i,dummy.matrix);
  }
  stairs.instanceMatrix.needsUpdate=true;stairs.castShadow=false;stairs.receiveShadow=true;parent.add(stairs);
  for(let level=0;level<levels.length;level++){
    const t=(levels[level]-levels[0])/stairRise;
    const stairPoint=path[Math.round(t*samples)],door=[x,y+levels[level]+.16,z+radii[level]*depthFactor*.96+1.0];
    buildLivingBridge(parent,stairPoint,door,3.7,level%2===0?1:-1);
  }

  // Cobertura de ramos e fibras no último pavimento; os níveis inferiores permanecem abertos ao ar.
  addWovenCanopy(parent,x,y+levels[4]+6.2,z,radii[4]*1.05,2.0,3.9,[0,4],.82);
  // Raízes que abrem o caminho para a floresta na base das três árvores.
  for(let i=0;i<3;i++){
    const [dx,dz]=treePositions[i];
    addOrganicTube(parent,[[x+dx,y+.22,z+dz],[x+dx*1.35,y+.35,z+dz*1.2],
      [x+dx*1.85,y+.12,z+dz*1.65]],.46,.06,woodMat,7,18,.13);
  }
}
function buildWillowBower(parent,x,y,z){
  // Caramanchão de salgueiro e corniso: túnel vegetal em arcos paralelos.
  const width=7.2,length=18,archCount=9;
  for(let i=0;i<archCount;i++){
    const t=i/(archCount-1),zz=z-length*.5+t*length,pts=[];
    for(let j=0;j<=16;j++){
      const q=j/16*Math.PI,px=x+Math.cos(q)*width*.5,
        py=y+Math.sin(q)*4.4+Math.sin(t*Math.PI)*.28,
        pz=zz+Math.sin(q*2+t*3)*.16;
      pts.push([px,py,pz]);
    }
    addOrganicTube(parent,pts,.18,.06,i%2?woodMat:paleWood,7,28,.10);
  }
  for(let side of [-1,1]){
    const rail=[],lower=[];
    for(let i=0;i<=36;i++){
      const t=i/36,zz=z-length*.5+t*length;
      rail.push([x+side*width*.5,y+3.65+Math.sin(t*Math.PI)*.22,zz]);
      lower.push([x+side*width*.47,y+.18,zz]);
    }
    addOrganicTube(parent,rail,.16,.07,woodMat,6,36,.07);
    addOrganicTube(parent,lower,.22,.12,paleWood,7,36,.06);
    for(let i=0;i<8;i++){
      const z0=z-length*.5+i*(length/8),z1=z0+length/8;
      addOrganicTube(parent,[[x+side*width*.5,y+1.0,z0],
        [x+side*width*.24,y+3.2,z0+(z1-z0)*.5],
        [x-side*width*.5,y+1.0,z1]],.09,.035,i%2?woodMat:paleWood,5,16,.06);
    }
  }
  // Pequenas galhas luminosas, sem chama ou lâmpada exposta.
  const gallMat=new THREE.MeshStandardMaterial({color:0x69724b,emissive:0x756b32,
    emissiveIntensity:.48,roughness:.88});
  for(let i=0;i<12;i++){
    const side=i%2?1:-1,t=.12+Math.floor(i/2)*.125,
      zz=z-length*.5+t*length,px=x+side*(width*.5-.28),
      py=y+2.8+Math.sin(t*Math.PI)*.5;
    const gall=new THREE.Mesh(new THREE.SphereGeometry(1,9,7),gallMat);
    gall.position.set(px,py,zz);gall.scale.set(.19,.33,.18);gall.rotation.z=side*.18;parent.add(gall);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.11,7,5),
      new THREE.MeshStandardMaterial({color:0x9d9460,roughness:1}));
    cap.position.set(px,py+.26,zz);parent.add(cap);
  }
  registerWalkablePath([[x,y+.15,z+length*.5],[x,y+.15,z+length*.25],
    [x,y+.15,z],[x,y+.15,z-length*.25],[x,y+.15,z-length*.5]],4.3,'bridge');
}
function buildStable(parent,x,y,z){
  // Estábulo de três baias sob uma cobertura arqueada de madeira e folhagem.
  const floorMat=new THREE.MeshStandardMaterial({color:0x544936,roughness:1,side:THREE.DoubleSide});
  const troughMat=new THREE.MeshStandardMaterial({color:0x59432e,roughness:.98});
  const hayMat=new THREE.MeshStandardMaterial({color:0xb39a5d,roughness:1});
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1,64),floorMat);
  floor.rotation.x=-Math.PI/2;floor.position.set(x,y+.035,z);floor.scale.set(12.2,7.9,1);
  floor.receiveShadow=true;parent.add(floor);

  // Oito pilares vivos sustentam um telhado contínuo e claramente legível.
  for(const px of [-10.6,-3.55,3.55,10.6]){
    for(const pz of [-6.35,6.35]){
      addLivingTrunk(parent,x+px,y,z+pz,10.2,.72,
        px===0?0:-Math.sign(px)*.8,pz<0?.42:-.42,woodMat);
    }
  }
  const roofPos=[],roofUv=[],roofIdx=[],nx=28,nz=16;
  function roofHeight(px,pz){
    return y+9.35+3.45*(1-Math.pow(px/12.1,2))+.55*(1-Math.pow(pz/7.8,2));
  }
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
    const px=-12.1+i/nx*24.2,pz=-7.8+j/nz*15.6;
    const edgeWobble=1+.012*Math.sin(i*1.7+j*.8);
    roofPos.push(x+px,roofHeight(px,pz),z+pz);
    roofUv.push(i/nx*3,j/nz*2);
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
    const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;roofIdx.push(a,c,b,b,c,d);
  }
  const roofGeo=new THREE.BufferGeometry();
  roofGeo.setAttribute('position',new THREE.Float32BufferAttribute(roofPos,3));
  roofGeo.setAttribute('uv',new THREE.Float32BufferAttribute(roofUv,2));
  roofGeo.setIndex(roofIdx);roofGeo.computeVertexNormals();
  const roofMatStable=new THREE.MeshStandardMaterial({map:TEX_GALHO,color:0x596445,roughness:1,side:THREE.DoubleSide});
  const roof=new THREE.Mesh(roofGeo,roofMatStable);roof.castShadow=true;roof.receiveShadow=true;parent.add(roof);

  // Nervuras transversais e fibras longitudinais dão espessura à cobertura.
  for(let row=0;row<=8;row++){
    const pz=-7.6+row*1.9,pts=[];
    for(let k=0;k<=12;k++){
      const px=-11.8+k/12*23.6;pts.push([x+px,roofHeight(px,pz)+.10,z+pz]);
    }
    addOrganicTube(parent,pts,.22,.13,row%2?woodMat:paleWood,7,28,.07);
  }
  for(const px of [-10.4,-7.0,-3.5,0,3.5,7.0,10.4]){
    const pts=[];
    for(let k=0;k<=12;k++){
      const pz=-7.5+k/12*15.0;pts.push([x+px,roofHeight(px,pz)+.12,z+pz]);
    }
    addOrganicTube(parent,pts,.12,.075,woodMat,6,24,.06);
  }

  // Fechamentos baixos de ripas entre baias; a frente permanece aberta para os cavalos.
  for(const dividerX of [-7.0,0,7.0]){
    for(let level=0;level<3;level++){
      const yy=y+1.15+level*.92;
      addOrganicTube(parent,[[x+dividerX,yy,z-5.6],[x+dividerX+.12,yy+.12,z-1.2],
        [x+dividerX,yy,z+3.9]],.15,.11,level===2?paleWood:woodMat,6,18,.05);
    }
    for(const pz of [-5.5,-1.0,3.8]){
      addLivingTrunk(parent,x+dividerX,y,z+pz,3.25,.22,.12,0,woodMat);
    }
  }
  // Travessas traseiras e laterais protegem as baias sem fechar o espaço.
  for(const level of [1.0,2.0,3.0]){
    addOrganicTube(parent,[[x-10.2,y+level,z-5.9],[x,y+level,z-6.0],
      [x+10.2,y+level,z-5.9]],.16,.10,woodMat,6,36,.05);
    for(const side of [-1,1]){
      addOrganicTube(parent,[[x+side*10.5,y+level,z-5.6],[x+side*10.7,y+level,z],
        [x+side*10.5,y+level,z+5.8]],.14,.09,paleWood,6,18,.05);
    }
  }

  for(let i=-1;i<=1;i++){
    const px=x+i*7.0;
    // Cama de palha compacta no fundo e cocho baixo à frente.
    const bedding=new THREE.Mesh(new THREE.CircleGeometry(1,28),
      new THREE.MeshStandardMaterial({color:0x8c7950,roughness:1}));
    bedding.rotation.x=-Math.PI/2;bedding.position.set(px,y+.07,z-2.65);
    bedding.scale.set(2.25,2.6,1);parent.add(bedding);
    const trough=new THREE.Mesh(new THREE.BoxGeometry(3.25,.68,.88),troughMat);
    trough.position.set(px,y+.48,z+2.05);parent.add(trough);
    const water=new THREE.Mesh(new THREE.BoxGeometry(2.78,.055,.52),HOME_CERAMIC_MAT);
    water.position.set(px,y+.84,z+2.05);parent.add(water);
    for(const side of [-1,1]){
      const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,.52,.16),woodMat);
      leg.position.set(px+side*1.22,y+.23,z+2.05);parent.add(leg);
    }
    const hay=new THREE.Mesh(new THREE.ConeGeometry(1.0,1.25,8),hayMat);
    hay.position.set(px-1.35,y+.78,z-3.3);hay.rotation.z=.24;parent.add(hay);
    for(let strand=0;strand<7;strand++){
      const a=strand/7*Math.PI*2;
      addOrganicTube(parent,[[px-1.35+Math.cos(a)*.25,y+.25,z-3.3+Math.sin(a)*.25],
        [px-1.35+Math.cos(a)*.78,y+.67,z-3.3+Math.sin(a)*.78]],
        .04,.018,hayMat,4,5,.02);
    }
    // Arreios e argolas junto ao pilar externo da baia.
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.065,7,16),paleWood);
    ring.position.set(px+2.35,y+2.25,z+4.15);ring.rotation.x=Math.PI/2;parent.add(ring);
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.10,1.05,.10),HOME_DARK_WOOD_MAT);
    strap.position.set(px+2.35,y+1.55,z+4.12);parent.add(strap);
    // Entrada frontal livre e faixa de circulação no interior de cada baia.
    registerWalkablePath([[px,y+.10,z+7.8],[px,y+.10,z+5.0],
      [px,y+.10,z+2.6],[px,y+.10,z-.8]],2.75,'house');
  }
  // Travessa frontal arqueada, sem parede bloqueando o acesso às três baias.
  for(const px of [-10.5,-3.5,3.5,10.5]){
    addOrganicTube(parent,[[x+px,y+3.3,z+5.6],[x+px*.72,y+4.2,z+6.05],
      [x+px*.48,y+4.35,z+6.15]],.20,.09,paleWood,7,14,.07);
  }
}
function buildTraining(parent,x,y,z){
  // Clareira de treino em terra, com alvos, bonecos e suporte de armas — sem arena rígida.
  addOval(parent,x,y+.01,z,25,.05,24,new THREE.MeshStandardMaterial({color:0x554631,roughness:1}),32);
  const targetWood=new THREE.MeshStandardMaterial({color:0x80613e,roughness:.98});
  const targetDark=new THREE.MeshStandardMaterial({color:0x30291f,roughness:1});
  const targetLight=new THREE.MeshStandardMaterial({color:0xb69b69,roughness:1});
  for(let i=0;i<5;i++){
    const a=i/5*Math.PI*2,px=x+Math.cos(a)*18,pz=z+Math.sin(a)*18;
    addLivingTrunk(parent,px,y,pz,7,.34,Math.cos(a)*.8,Math.sin(a)*.8);
    addOrganicTube(parent,[[px-1.3,y+5.0,pz],[px,y+5.4,pz],[px+1.3,y+5.0,pz]],.15,.08,woodMat,6,9,.05);
  }
  // Três alvos de madeira voltados ao centro da clareira.
  for(let i=0;i<3;i++){
    const tx=x+(i-1)*7.5,tz=z-18.5,ty=y+3.6;
    const frame=new THREE.Mesh(new THREE.BoxGeometry(4.2,5.5,.42),targetWood);
    frame.position.set(tx,ty,tz);parent.add(frame);
    const target=new THREE.Mesh(new THREE.CircleGeometry(1.42,32),targetLight);
    target.position.set(tx,ty+.25,tz+.23);parent.add(target);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.76,.96,32),targetDark);
    ring.position.set(tx,ty+.25,tz+.25);parent.add(ring);
    const bull=new THREE.Mesh(new THREE.CircleGeometry(.38,24),dwellingGlassMat);
    bull.position.set(tx,ty+.25,tz+.27);parent.add(bull);
    addOrganicTube(parent,[[tx-2.4,y+.2,tz],[tx-2.5,y+5.4,tz],
      [tx,y+6.1,tz],[tx+2.5,y+5.4,tz],[tx+2.4,y+.2,tz]],.18,.08,paleWood,6,20,.06);
  }
  // Bonecos de palha e armação de madeira para espadas de treino.
  for(let i=0;i<2;i++){
    const dx=i===0?-13:13,dummyX=x+dx,dummyZ=z+4;
    addLivingTrunk(parent,dummyX,y,dummyZ,6,.52,dx>0?-.5:.5,0,woodMat);
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(.46,.62,2.6,8),HOME_LINEN_MAT);
    torso.position.set(dummyX,y+3.25,dummyZ);parent.add(torso);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.52,10,8),targetWood);
    head.position.set(dummyX,y+4.9,dummyZ);parent.add(head);
    addOrganicTube(parent,[[dummyX-1.9,y+4.0,dummyZ],[dummyX,y+3.9,dummyZ+.2],
      [dummyX+1.9,y+4.0,dummyZ]],.22,.12,targetWood,7,12,.08);
  }
  const rackX=x-20,rackZ=z+2;
  addLivingTrunk(parent,rackX,y,rackZ,4.7,.36,.2,0,woodMat);
  addLivingTrunk(parent,rackX+5,y,rackZ,4.7,.36,-.2,0,woodMat);
  addOrganicTube(parent,[[rackX,y+3.4,rackZ],[rackX+2.5,y+3.4,rackZ+.1],[rackX+5,y+3.4,rackZ]],.30,.18,paleWood,7,14,.06);
  for(let i=0;i<4;i++){
    const sx=rackX+.85+i*1.0,blade=new THREE.Mesh(new THREE.BoxGeometry(.10,1.7,.16),targetDark);
    blade.position.set(sx,y+2.55,rackZ+.08);blade.rotation.z=(i-1.5)*.09;parent.add(blade);
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.42,7),HOME_DARK_WOOD_MAT);
    grip.position.set(sx,y+1.48,rackZ+.08);parent.add(grip);
  }
}
function buildCabin(parent,x,y,z){
  // Cabana de madeira viva, integrada a quatro pinheiros; a forma é uma
  // interpretação arquitetônica, pois o texto não fixa uma planta detalhada.
  const floorY=y+1.28;
  const trees=[[-7.4,-6.2],[7.4,-6.2],[-7.4,6.2],[7.4,6.2]];
  trees.forEach(([dx,dz],i)=>{
    addLivingTrunk(parent,x+dx,y,z+dz,20+((i%2)*2),.92,
      dx<0?1.25:-1.25,dz<0?.95:-.95,woodMat);
  });

  addResidenceFloor(parent,x,floorY,z,5.75,5.25,mossFloorMat);
  addHexagonalLivingShell(parent,x,floorY+2.62,z,6.65,2.72,6.05,woodMat,true);
  addLivingDoorFrame(parent,x,floorY,z+5.96,2.18,2.62);

  // Janelas profundas encaixadas nos painéis laterais.
  for(const side of [-1,1]){
    const wx=x+side*5.72,wz=z-2.45,wy=floorY+2.55;
    const pane=new THREE.Mesh(new THREE.BoxGeometry(.16,1.48,1.58),RESIDENCE_WINDOW_MAT);
    pane.position.set(wx,wy,wz);parent.add(pane);
    for(const dz of [-.84,.84]){
      const frame=new THREE.Mesh(new THREE.BoxGeometry(.20,1.72,.13),RESIDENCE_FRAME_MAT);
      frame.position.set(wx+side*.08,wy,wz+dz);parent.add(frame);
    }
    for(const dy of [-.80,.80]){
      const frame=new THREE.Mesh(new THREE.BoxGeometry(.22,.13,1.82),RESIDENCE_FRAME_MAT);
      frame.position.set(wx+side*.08,wy+dy,wz);parent.add(frame);
    }
    const mullion=new THREE.Mesh(new THREE.BoxGeometry(.22,1.48,.10),paleWood);
    mullion.position.set(wx+side*.10,wy,wz);parent.add(mullion);
  }

  // Cobertura em trama orgânica, com beiral e nervuras que se apoiam nas árvores.
  addWovenCanopy(parent,x,floorY+4.82,z,7.25,1.25,2.9,[1,5],1);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    addOrganicTube(parent,[
      [x+Math.cos(a)*7.0,floorY+4.75,z+Math.sin(a)*7.0],
      [x+Math.cos(a)*5.6,floorY+5.65,z+Math.sin(a)*5.6],
      [x+Math.cos(a)*3.2,floorY+6.85,z+Math.sin(a)*3.2],
      [x+Math.cos(a)*1.15,floorY+7.55,z+Math.sin(a)*1.15]
    ],.24,.075,i%2?woodMat:paleWood,7,24,.10);
  }

  // Interior de estudo e repouso: mesa, assento, estante e leito baixo.
  const deskX=x-2.45,deskZ=z-2.1;
  const deskTop=new THREE.Mesh(new THREE.BoxGeometry(3.15,.18,1.45),HOME_DARK_WOOD_MAT);
  deskTop.position.set(deskX,floorY+1.08,deskZ);deskTop.castShadow=true;parent.add(deskTop);
  for(const dx of [-1.25,1.25]){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,1.0,.16),woodMat);
    leg.position.set(deskX+dx,floorY+.52,deskZ);parent.add(leg);
  }
  const openBook=new THREE.Mesh(new THREE.BoxGeometry(1.0,.07,.72),HOME_LINEN_MAT);
  openBook.position.set(deskX-.25,floorY+1.22,deskZ-.08);parent.add(openBook);
  const stool=new THREE.Mesh(new THREE.CylinderGeometry(.48,.54,.24,12),HOME_CUSHION_MAT);
  stool.position.set(deskX+2.15,floorY+.58,deskZ+.25);parent.add(stool);
  const shelf=new THREE.Group();shelf.position.set(x+3.45,floorY+.12,z-3.1);shelf.rotation.y=-.16;parent.add(shelf);
  for(const side of [-1,1]){
    const post=new THREE.Mesh(new THREE.BoxGeometry(.14,2.45,.16),HOME_DARK_WOOD_MAT);
    post.position.set(0,1.22,side*.88);shelf.add(post);
  }
  for(let level=0;level<4;level++){
    const plank=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,2.0),woodMat);
    plank.position.set(.08,.38+level*.63,0);shelf.add(plank);
    for(let book=0;book<4;book++){
      const volume=new THREE.Mesh(new THREE.BoxGeometry(.23,.38,.32),book%2?HOME_CUSHION_MAT:HOME_LINEN_MAT);
      volume.position.set(.02,.62+level*.63,(book-1.5)*.42);shelf.add(volume);
    }
  }
  const cot=new THREE.Mesh(new THREE.BoxGeometry(2.8,.32,1.65),HOME_DARK_WOOD_MAT);
  cot.position.set(x+1.5,floorY+.42,z+2.65);parent.add(cot);
  const mattress=new THREE.Mesh(new THREE.BoxGeometry(2.65,.22,1.52),HOME_LINEN_MAT);
  mattress.position.set(x+1.5,floorY+.69,z+2.65);parent.add(mattress);
  const blanket=new THREE.Mesh(new THREE.BoxGeometry(1.35,.10,1.55),HOME_CUSHION_MAT);
  blanket.position.set(x+1.9,floorY+.84,z+2.65);parent.add(blanket);

  // Três degraus baixos ligam a porta ao solo sem criar um piso suspenso.
  for(let i=0;i<3;i++){
    const step=new THREE.Mesh(new THREE.BoxGeometry(2.55,.22,1.08),CANOPY_DECK_MAT);
    step.position.set(x,floorY-.48+i*.18,z+7.25-i*.76);parent.add(step);
  }
  registerWalkablePath([
    [x,floorY+.10,z+10.1],[x,floorY-.12,z+8.35],
    [x,floorY+.05,z+6.2],[x,floorY+.05,z+3.1],[x,floorY+.05,z]
  ],2.8,'house');

  // Salgueiro ao lado da clareira de treino e pequeno curso d'água.
  addLivingTrunk(parent,x-12,y,z+11,17,.65,-1,1,woodMat);
  for(let i=0;i<22;i++){
    const a=i/22*Math.PI*2,ex=x-12+Math.cos(a)*4,ez=z+11+Math.sin(a)*4;
    addOrganicTube(parent,[[x-12,y+15,z+11],[ex,y+9,z+11+Math.sin(a)*2],
      [ex,y+2,z+11+Math.sin(a)*4]],.07,.025,mossFloorMat,5,12,.1);
  }
  addOval(parent,x,y+.025,z-18,7,.035,6,new THREE.MeshStandardMaterial({color:0x584733,roughness:1}),16);
  const streamPoints=[
    new THREE.Vector3(x-12,alturaTerreno(x-12,z+18)-.12,z+18),
    new THREE.Vector3(x-15,alturaTerreno(x-15,z+10)-.12,z+10),
    new THREE.Vector3(x-18,alturaTerreno(x-18,z+2)-.12,z+2),
    new THREE.Vector3(x-20,alturaTerreno(x-20,z-8)-.12,z-8),
    new THREE.Vector3(x-22,alturaTerreno(x-22,z-20)-.18,z-20)
  ];
  const streamCurve=new THREE.CatmullRomCurve3(streamPoints,false,'centripetal',.35);
  const streamGeo=new THREE.TubeGeometry(streamCurve,64,.38,8,false);
  const streamMat=new THREE.MeshStandardMaterial({color:0x77918b,metalness:.22,roughness:.25,transparent:true,opacity:.82});
  const stream=new THREE.Mesh(streamGeo,streamMat);stream.receiveShadow=true;parent.add(stream);
}
function buildBanquet(parent,x,y,z){
  // Refeitório aberto: mesa comunal esculpida, bancos-raiz e pequenas peças de serviço.
  const tableTop=addOval(parent,x,y+1.32,z,6.2,.42,3.25,woodMat,36);
  addOrganicTube(parent,[[x-3.8,y+.98,z],[x-2.2,y+.44,z],[x,y+.34,z],
    [x+2.2,y+.44,z],[x+3.8,y+.98,z]],.72,.34,woodMat,9,24,.12);
  addOrganicTube(parent,[[x,y+.35,z-2.0],[x,y+.35,z+2.0]],.34,.20,paleWood,7,12,.08);
  const seatMat=new THREE.MeshStandardMaterial({color:0x736047,roughness:.98});
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,px=x+Math.cos(a)*13.0,pz=z+Math.sin(a)*10.2;
    const tangent=a+Math.PI/2;
    const bench=addOval(parent,px,y+.72,pz,4.1,.48,1.05,seatMat,24);bench.rotation.y=-tangent;
    for(const side of [-1,1]){
      addOrganicTube(parent,[[px+Math.cos(tangent)*side*1.3,y+.45,pz+Math.sin(tangent)*side*1.3],
        [px+Math.cos(tangent)*side*1.1,y+.12,pz+Math.sin(tangent)*side*1.1]],.22,.14,woodMat,6,8,.06);
    }
  }
  const platter=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.12,.15,18),HOME_CERAMIC_MAT);
  platter.position.set(x,y+1.83,z-.35);parent.add(platter);
  for(let i=0;i<7;i++){
    const a=i/7*Math.PI*2,fruit=new THREE.Mesh(new THREE.SphereGeometry(.28+Math.random()*.10,10,8),
      i%2?HOME_LINEN_MAT:dwellingGlassMat);
    fruit.position.set(x+Math.cos(a)*.56,y+2.08,z-.35+Math.sin(a)*.56);parent.add(fruit);
  }
  for(let side of [-1,1]){
    const vessel=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.52,10),HOME_CERAMIC_MAT);
    vessel.position.set(x+side*3.6,y+1.72,z+.2);parent.add(vessel);
  }
  for(let i=0;i<5;i++){
    const a=i/5*Math.PI*2,px=x+Math.cos(a)*17,pz=z+Math.sin(a)*15;
    addOrganicTube(parent,[[px,y+.15,pz],[px+Math.cos(a)*2.5,y+1.6,pz+Math.sin(a)*2.5],
      [px+Math.cos(a+1.0)*2.2,y+2.6,pz+Math.sin(a+1.0)*2.2]],.22,.055,paleWood,6,14,.10);
  }
}
function buildCrags(parent,x,y,z){
  // Crags of Tel'naeír: uma borda de rocha alta e abrupta, com clareira de
  // trevo vermelho no topo — o lugar não é uma ruína nem uma construção.
  const segments=88,rows=16,rockPos=[],rockUv=[],rockColor=[],rockIdx=[];
  const cliffLength=820;
  for(let row=0;row<=rows;row++){
    const t=row/rows;
    for(let i=0;i<=segments;i++){
      const u=i/segments,zz=z-cliffLength*.5+u*cliffLength;
      const topX=x-12+Math.sin(u*8.5)*4.2+Math.sin(u*19.0)*1.35;
      const topY=alturaTerreno(topX,zz)+.4;
      const drop=292*(.93+.055*Math.sin(u*7.2)+.025*Math.sin(u*25.0));
      const faceX=topX+15*t+Math.sin(u*13+t*4)*(.8+3.2*t);
      const faceY=topY-drop*t+Math.sin(u*11+t*7)*2.1*t;
      rockPos.push(faceX,faceY,zz+Math.sin(t*4+u*9)*1.0*t);
      rockUv.push(u*9,t*3.5);
      const strata=Math.sin(t*31+u*5)*.035+Math.sin(u*41)*.022;
      const tone=.25+strata+(1-t)*.035;
      const color=new THREE.Color().setHSL(.105+Math.sin(u*12+t*6)*.012,.13,tone);
      rockColor.push(color.r,color.g,color.b);
      if(row<rows&&i<segments){
        const a=row*(segments+1)+i,b=a+1,c=a+segments+1,d=c+1;
        rockIdx.push(a,c,b,b,c,d);
      }
    }
  }
  const cliffGeo=new THREE.BufferGeometry();
  cliffGeo.setAttribute('position',new THREE.Float32BufferAttribute(rockPos,3));
  cliffGeo.setAttribute('uv',new THREE.Float32BufferAttribute(rockUv,2));
  cliffGeo.setAttribute('color',new THREE.Float32BufferAttribute(rockColor,3));
  cliffGeo.setIndex(rockIdx);cliffGeo.computeVertexNormals();
  const cliffMat=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,
    map:TEX_PEDRA,roughness:1,side:THREE.DoubleSide});
  const cliff=new THREE.Mesh(cliffGeo,cliffMat);cliff.castShadow=true;cliff.receiveShadow=true;parent.add(cliff);

  // Barreira de colisão contínua na borda: impede o visitante de atravessar o penhasco.
  const guardCount=Math.ceil(cliffLength/3);
  for(let i=0;i<=guardCount;i++){
    const u=i/guardCount,zz=z-cliffLength*.5+u*cliffLength;
    const topX=x-12+Math.sin(u*8.5)*4.2+Math.sin(u*19.0)*1.35;
    colisores.push({x:topX+4.1,z:zz,raio:2.2});
  }

  // Estratos e saliências horizontais tornam a queda legível à distância.
  for(const t of [.18,.37,.58,.78]){
    const ledge=[];
    for(let i=0;i<=segments;i+=2){
      const u=i/segments,zz=z-cliffLength*.5+u*cliffLength;
      const topX=x-12+Math.sin(u*8.5)*4.2+Math.sin(u*19.0)*1.35;
      const topY=alturaTerreno(topX,zz)+.4,drop=292*(.93+.055*Math.sin(u*7.2)+.025*Math.sin(u*25.0));
      ledge.push([topX+15*t+Math.sin(u*13+t*4)*(.8+3.2*t),
        topY-drop*t+Math.sin(u*11+t*7)*2.1*t+1.2,
        zz+Math.sin(t*4+u*9)*1.0*t]);
    }
    addOrganicTube(parent,ledge,.78,.32,stoneMat,7,segments*.5,.14);
  }
  const boulderMat=new THREE.MeshStandardMaterial({map:TEX_PEDRA,color:0x777064,roughness:1});
  for(let i=0;i<13;i++){
    const u=i/12,zz=z-cliffLength*.48+u*cliffLength*.96;
    const bx=x+18+Math.sin(u*8.5)*4.2,by=alturaTerreno(x-12+Math.sin(u*8.5)*4.2,zz)-280;
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(1.8+(i%4)*.65,1),boulderMat);
    rock.position.set(bx,by,zz);rock.rotation.set(.2*i,.7*i,.13*i);
    rock.scale.set(1.5,1.1,1.2);rock.castShadow=true;parent.add(rock);
  }
  // Árvores esparsas e trevo vermelho ficam no planalto, não na face vertical.
  for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2,r=22+Math.random()*16,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    addLivingTrunk(parent,px,y,pz,34+Math.random()*22,1.1+Math.random()*.6,Math.cos(a)*2,Math.sin(a)*2);
  }
  buildFlowerGrove(parent,x,y,z,24,360,0x9a3345);
  addOrganicTube(parent,[[x-8,y+.15,z+cliffLength*.48],[x-8,y+.15,z+180],
    [x-8,y+.15,z],[x-8,y+.15,z-180],[x-8,y+.15,z-cliffLength*.48]],.26,.15,woodMat,6,88,.08);
}
function buildOromisStump(parent,x,y,z){
  // Toco antigo de madeira clara: casca rugosa, fibras expostas, anéis e raízes.
  const radial=64,levels=[{r:1.85,y:.06},{r:1.62,y:.82},{r:1.42,y:1.62}],positions=[],indices=[];
  for(let ring=0;ring<levels.length;ring++){
    for(let i=0;i<radial;i++){
      const a=i/radial*Math.PI*2;
      const irregular=1+.055*Math.sin(a*5+.6)+.028*Math.sin(a*11+1.2);
      const r=levels[ring].r*irregular;
      const topWave=ring===2?.18*Math.sin(a*3+.3)+.10*Math.sin(a*7+1.1):0;
      positions.push(x+Math.cos(a)*r,y+levels[ring].y+topWave,z+Math.sin(a)*r);
    }
  }
  for(let ring=0;ring<levels.length-1;ring++)for(let i=0;i<radial;i++){
    const a=ring*radial+i,b=ring*radial+(i+1)%radial,c=(ring+1)*radial+i,d=(ring+1)*radial+(i+1)%radial;
    indices.push(a,b,c,b,d,c);
  }
  const sideGeo=new THREE.BufferGeometry();
  sideGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  sideGeo.setIndex(indices);sideGeo.computeVertexNormals();
  const barkMat=new THREE.MeshStandardMaterial({color:0xd2c6a4,roughness:.97,side:THREE.DoubleSide});
  const bark=new THREE.Mesh(sideGeo,barkMat);bark.castShadow=true;bark.receiveShadow=true;parent.add(bark);

  const topPos=[x,y+1.72,z],topIdx=[];
  for(let i=0;i<radial;i++){
    const a=levels[2].y+.18*Math.sin(i/radial*Math.PI*2*3+.3)+.10*Math.sin(i/radial*Math.PI*2*7+1.1);
    const v=positions[(2*radial+i)*3],vy=positions[(2*radial+i)*3+1],vz=positions[(2*radial+i)*3+2];
    topPos.push(v,vy,vz);
    topIdx.push(0,i+1,(i+1)%radial+1);
  }
  const topGeo=new THREE.BufferGeometry();
  topGeo.setAttribute('position',new THREE.Float32BufferAttribute(topPos,3));
  topGeo.setIndex(topIdx);topGeo.computeVertexNormals();
  const cutMat=new THREE.MeshStandardMaterial({color:0xe1d5b4,roughness:.94,side:THREE.DoubleSide});
  const cut=new THREE.Mesh(topGeo,cutMat);cut.castShadow=true;parent.add(cut);

  // Veios verticais acompanham a forma irregular da casca.
  for(let i=0;i<26;i++){
    const a=i/26*Math.PI*2,phase=i*.8,pts=[];
    for(let j=0;j<=6;j++){
      const t=j/6,r=1.78*(1-t)+1.38*t,wobble=1+.055*Math.sin(a*5+.6)+.028*Math.sin(a*11+1.2);
      pts.push([x+Math.cos(a+Math.sin(t*3+phase)*.025)*r*wobble,
        y+.12+t*1.47,z+Math.sin(a+Math.sin(t*3+phase)*.025)*r*wobble]);
    }
    addOrganicTube(parent,pts,.055,.025,i%3?whiteBarkMat:paleWood,5,12,.12);
  }
  // Anéis de crescimento visíveis na superfície recém-cortada.
  for(const r of [.34,.58,.82,1.06,1.25]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,4,56),
      new THREE.MeshStandardMaterial({color:0xa99a77,roughness:1}));
    ring.rotation.x=Math.PI/2;ring.position.set(x,y+1.78,z);ring.scale.set(1,.94,1);parent.add(ring);
  }
  // Raízes grossas espalham-se sobre o húmus; pequenos ramos cortados marcam a idade.
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2+(Math.random()-.5)*.10,len=3.0+Math.random()*2.1;
    addOrganicTube(parent,[[x+Math.cos(a)*.75,y+.22,z+Math.sin(a)*.75],
      [x+Math.cos(a)*1.8,y+.15,z+Math.sin(a)*1.8],
      [x+Math.cos(a)*len,y+.035,z+Math.sin(a)*len]],.38,.045,whiteBarkMat,7,16,.18);
  }
  for(let i=0;i<3;i++){
    const a=i/3*Math.PI*2+.45;
    addOrganicTube(parent,[[x+Math.cos(a)*1.1,y+1.15,z+Math.sin(a)*1.1],
      [x+Math.cos(a)*1.75,y+1.95,z+Math.sin(a)*1.75],
      [x+Math.cos(a)*2.25,y+2.15,z+Math.sin(a)*2.25]],.27,.07,whiteBarkMat,7,14,.16);
  }
}
function buildNaturalArchSite(parent,x,y,z){
  buildNaturalArch(parent,x,y,z);
  // Duas casas disfarçadas em troncos curvados nos limites da clareira.
  for(let side of [-1,1]){
    const hx=x+side*17,hz=z+side*7;
    addLivingTrunk(parent,hx,y,hz,25,1.35,side*2,-side,woodMat);
    const home=buildReadableDwelling(parent,hx+side*1.2,hz,y+2.25,.46,false,78);
    addOrganicTube(parent,[[hx,y+17,hz],[hx+side*7,y+20,hz+side*2],
      [hx+side*13,y+22,hz+side*5],[hx+side*15,y+24,hz+side*7]],.55,.12,woodMat,8,24,.10);
    registerWalkablePath([[hx+side*1.2,y+2.25,hz+home.outer+6],
      [hx+side*1.2,y+2.25,hz+home.outer+3],home.door],2.6);
  }
  buildFlowerGrove(parent,x,y,z,30,220);
}
function buildSite(name,x,z,kind){
  const g=new THREE.Group(),y=alturaTerreno(x,z);g.position.set(0,0,0);scene.add(g);
  if(kind==='hall')buildHall(g,x,y,z);
  else if(kind==='stable')buildStable(g,x,y,z);
  else if(kind==='forge')buildForge(g,x,y,z);
  else if(kind==='cabin')buildCabin(g,x,y,z);
  else if(kind==='banquet')buildBanquet(g,x,y,z);
  else if(kind==='training')buildTraining(g,x,y,z);
  else if(kind==='tialdari')buildTialdari(g,x,y,z);
  else if(kind==='flowers')buildFlowerGrove(g,x,y,z);
  else if(kind==='treehome')buildTreeDwelling(g,x,y,z);
  else if(kind==='arch')buildNaturalArchSite(g,x,y,z);
  else if(kind==='hexhouse')buildHexagonalResidence(g,x,y,z,1);
  else if(kind==='fivehome')buildFiveStoreyResidence(g,x,y+10,z);
  else if(kind==='foresthome')buildForestHome(g,x,y,z);
  else if(kind==='bower')buildWillowBower(g,x,y,z);
  else if(kind==='gilderien')buildGilderien(g,x,y,z);
  else if(kind==='crags')buildCrags(g,x,y,z);
  else if(kind==='stump')buildOromisStump(g,x,y,z);
  return g;
}
const SITE_BUILDINGS=[
  ['Arco natural',450,-60,'arch'],
  ['Caramanchão de salgueiro e corniso',285,-116,'bower'],
  ['Salão do Trono',250,-40,'hall'],['Colina do banquete',120,70,'banquet'],
  ['Árvore dos Cavaleiros',0,0,'treehome'],['Estábulos',200,-160,'stable'],
  ['Campo de esgrima',-300,-200,'training'],['Forja de Rhunön',-180,220,'forge'],
  ['Salão de Tialdarí',-600,60,'tialdari'],['Cabana de Oromis',-1130,1200,'cabin'],
  ['Clareira de flores',400,-60,'flowers'],['Colina dos Crags',-1100,0,'crags'],
  ['Toco branco',-1050,1230,'stump'],
  ['Morada de raízes — oeste',-760,-640,'foresthome'],
  ['Morada de raízes — vale oriental',780,700,'foresthome'],
  ['Casa entre três pinheiros — cinco níveis',940,-760,'fivehome'],
  ['Morada de raízes — sudoeste',-900,740,'foresthome'],
  ['Morada de raízes — leste',1080,420,'foresthome']
];
for(const [n,x,z,k] of SITE_BUILDINGS)buildSite(n,x,z,k);
criarCaminho([[200,-160],[245,-167],[300,-170],[355,-174],[410,-177],[477.3,-180]],2.3);
criarCaminho([[200,-160],[180,-145],[165,-130],[162.3,-120]],1.9);
criarCaminho([[-300,-200],[-220,-190],[-150,-175],[-110,-170],[-67.7,-165]],1.9);
criarCaminho([[120,70],[80,55],[50,40],[27.3,18]],1.8);
function buildCanopyForum(parent,x,z,floorY){
  const groundY=alturaTerreno(x,z);
  addLivingTrunk(parent,x,groundY,z,Math.max(250,floorY-groundY+28),6.2,.7,-.55,woodMat);
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,px=x+Math.cos(a)*20.5,pz=z+Math.sin(a)*20.5,gy=alturaTerreno(px,pz);
    addLivingTrunk(parent,px,gy,pz,Math.max(220,floorY-gy+5),1.35,Math.cos(a)*2.2,Math.sin(a)*2.2,woodMat);
  }
  const ringGeo=new THREE.RingGeometry(10.5,24,96,2);ringGeo.rotateX(-Math.PI/2);
  const deck=new THREE.Mesh(ringGeo,CANOPY_DECK_MAT);
  deck.position.set(x,floorY,z);deck.receiveShadow=true;deck.castShadow=true;parent.add(deck);
  const outer=[],inner=[];
  for(let i=0;i<=96;i++){
    const a=i/96*Math.PI*2;
    outer.push([x+Math.cos(a)*24,floorY+.14,z+Math.sin(a)*24]);
    inner.push([x+Math.cos(a)*10.5,floorY+.14,z+Math.sin(a)*10.5]);
  }
  addOrganicTube(parent,outer,.34,.24,paleWood,8,96,.06);
  addOrganicTube(parent,inner,.22,.16,woodMat,7,96,.06);
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
    addOrganicTube(parent,[[x+ca*23.5,floorY+10.2,z+sa*23.5],
      [x+ca*18.5,floorY+17.0,z+sa*18.5],[x+ca*12.4,floorY+21.2,z+sa*12.4],
      [x+ca*6.4,floorY+19.2,z+sa*6.4]],.58,.16,i%2?woodMat:paleWood,8,30,.11);
  }
  addWovenCanopy(parent,x,floorY+10.1,z,23.8,6.3,10.8,[1,5],1);
  const rail=[];
  for(let i=0;i<=80;i++){
    const a=-2.78+i/80*5.56;
    rail.push([x+Math.cos(a)*24,floorY+1.34,z+Math.sin(a)*24]);
  }
  addOrganicTube(parent,rail,.28,.21,paleWood,8,100,.05);
  const postLocations=[];
  for(let i=0;i<32;i++){
    const a=i/32*Math.PI*2,diff=Math.abs(Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI)));
    if(diff<.42)continue;
    postLocations.push(a);
  }
  const postGeo=new THREE.CylinderGeometry(.075,.11,1.28,7,1);
  const posts=new THREE.InstancedMesh(postGeo,paleWood,postLocations.length),dummy=new THREE.Object3D();
  postLocations.forEach((a,i)=>{
    dummy.position.set(x+Math.cos(a)*24,floorY+.65,z+Math.sin(a)*24);
    dummy.updateMatrix();posts.setMatrixAt(i,dummy.matrix);
    if(i%4===0){
      const glow=new THREE.Mesh(new THREE.BoxGeometry(.22,.48,.22),RESIDENCE_LAMP_GLOW);
      glow.position.set(x+Math.cos(a)*22.9,floorY+2.2,z+Math.sin(a)*22.9);parent.add(glow);
    }
  });
  posts.instanceMatrix.needsUpdate=true;posts.castShadow=false;posts.receiveShadow=true;parent.add(posts);
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2,pts=[];
    for(let j=0;j<=12;j++){
      const q=a-.28+j/12*.56,r=14.2;
      pts.push([x+Math.cos(q)*r,floorY+1.02,z+Math.sin(q)*r]);
    }
    addOrganicTube(parent,pts,.42,.34,woodMat,8,18,.06);
  }
  const walk=[];
  for(let i=0;i<=96;i++){
    const a=i/96*Math.PI*2;
    walk.push([x+Math.cos(a)*17.25,floorY+.16,z+Math.sin(a)*17.25]);
  }
  registerWalkablePath(walk,13.2,'house');
  const door=[x-24.0,floorY+.16,z];
  registerWalkablePath([door,[x-20.5,floorY+.16,z],[x-16.5,floorY+.16,z]],6.6,'house');
  return {door,floorY};
}

function buildCanopyTransit(){
  const g=new THREE.Group();scene.add(g);
  const tiers=[
    {floor:42,stair:[75,-350],homes:[[140,-300],[300,-260],[460,-220]]},
    {floor:100,stair:[75,-100],homes:[[140,-40],[300,0],[460,40]]},
    {floor:158,stair:[75,150],homes:[[140,220],[300,260],[460,300]]}
  ];
  for(let tierIndex=0;tierIndex<tiers.length;tierIndex++){
    const tier=tiers[tierIndex],row=[];
    for(const [x,z] of tier.homes){
      const floorY=alturaTerreno(x,z)+tier.floor;
      row.push(buildCanopyResidence(g,x,z,floorY,tierIndex*3+row.length));
    }
    const stair=buildCanopyStairTower(g,tier.stair[0],tier.stair[1],
      alturaTerreno(tier.stair[0],tier.stair[1]),row[0].floorY,tierIndex);
    const stairTop=stair.path[stair.path.length-1],first=row[0];
    buildLivingBridge(g,stairTop,first.door,6.4,tierIndex%2===0?1:-1);
    for(let i=0;i<row.length-1;i++){
      const side=(tierIndex+i)%2===0?1:-1;
      buildLivingBridge(g,row[i].door,row[i+1].door,6.4,side);
    }
    if(tierIndex===2){
      const forum=buildCanopyForum(g,640,360,alturaTerreno(640,360)+tier.floor);
      buildLivingBridge(g,row[2].door,forum.door,7.0,1);
    }
  }
}
buildCanopyTransit();
flushOrganicArchitecture();


