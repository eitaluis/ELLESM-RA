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
const RESIDENCE_WOVEN_MAT=new THREE.MeshStandardMaterial({color:0x93856b,roughness:1,side:THREE.DoubleSide,transparent:true,opacity:.78,depthWrite:false});
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
  const lowerOuter=13.8*scale,lowerInner=7.0*scale,upperOuter=10.4*scale,upperInner=7.0*scale;
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
    const geo=new THREE.RingGeometry(inner,outer,56,2);geo.rotateX(-Math.PI/2);
    const mesh=new THREE.Mesh(geo,floorMat);mesh.position.set(0,y,0);mesh.receiveShadow=true;house.add(mesh);
    addOrganicTube(parent,ringPoints(outer,y+.12),.24*scale,.18*scale,woodMat,7,72,.06);
    addOrganicTube(parent,ringPoints(inner,y+.12),.18*scale,.13*scale,paleWood,6,72,.06);
    const walk=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*2;walk.push([x+Math.cos(a)*(outer+inner)*.5,y+.15,z+Math.sin(a)*(outer+inner)*.5]);}
    registerWalkablePath(walk,(outer-inner)*.96,'house');
  }
  addFloor(lowerOuter,lowerInner,floorY);addFloor(upperOuter,upperInner,upperY);
  const windowAngles=[.72,2.25,3.80,5.34],angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
  function addWallLantern(baseY,outer,angle){
    const fixture=new THREE.Group();fixture.position.set(Math.sin(angle)*(outer-.28*scale),baseY+2.55*scale,Math.cos(angle)*(outer-.28*scale));fixture.rotation.y=angle+Math.PI;
    const bracket=new THREE.Mesh(new THREE.BoxGeometry(.12*scale,.12*scale,.48*scale),RESIDENCE_FRAME_MAT);bracket.position.z=.20*scale;fixture.add(bracket);
    const cage=new THREE.Mesh(new THREE.BoxGeometry(.34*scale,.48*scale,.25*scale),RESIDENCE_FRAME_MAT);cage.position.z=.42*scale;fixture.add(cage);
    const flame=new THREE.Mesh(new THREE.BoxGeometry(.18*scale,.34*scale,.15*scale),RESIDENCE_LAMP_GLOW);flame.position.z=.44*scale;fixture.add(flame);house.add(fixture);
  }
  function addEnclosedStory(baseY,outer,height){
    const wallRadius=outer-.22*scale,radial=144,rows=10,wallBottom=baseY+.35*scale,wallTop=baseY+(height-.12)*scale;
    const doorHalf=1.36*scale/wallRadius,doorTop=baseY+3.22*scale,windowHalf=1.34*scale/wallRadius;
    const windowBottom=baseY+1.62*scale,windowTop=baseY+3.18*scale,positions=[],uvs=[],indices=[];
    for(let row=0;row<=rows;row++){
      const v=row/rows,y=wallBottom+(wallTop-wallBottom)*v;
      for(let i=0;i<=radial;i++){const a=i/radial*Math.PI*2;positions.push(Math.sin(a)*wallRadius,y,Math.cos(a)*wallRadius);uvs.push(i/radial,v);}
    }
    for(let row=0;row<rows;row++){
      const yMid=wallBottom+(wallTop-wallBottom)*(row+.5)/rows;
      for(let i=0;i<radial;i++){
        const a=(i+.5)/radial*Math.PI*2,isDoor=Math.abs(angleDiff(a,0))<doorHalf&&yMid<doorTop;
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
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
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
  return {x:x,y:floorY,z:z+lowerOuter+1.3*scale,floorY,upperY,outer:lowerOuter,upperOuter,door:[x,floorY+.18*scale,z+lowerOuter+1.3*scale]};
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
  // Árvore dos Cavaleiros: casa-salão de dois níveis integrada ao tronco vivo.
  const h=260;addLivingTrunk(parent,x,y,z,h,8.2,8.5,-6.0);
  const braces=[
    [[x-5,y+17,z+1],[x-13,y+25,z+3],[x-15,y+34,z+1]],
    [[x+5,y+18,z-1],[x+14,y+25,z-4],[x+16,y+35,z-3]],
    [[x-4,y+32,z-2],[x-12,y+40,z-7],[x-14,y+47,z-8]],
    [[x+4,y+34,z+1],[x+13,y+42,z+6],[x+15,y+49,z+7]]
  ];
  for(const p of braces)addOrganicTube(parent,p,1.25,.24,woodMat,10,28,.13);
  const lower=y+23,upper=y+36;
  addOpenOvoidPod(parent,x+1,lower+3.3,z+1,10.5,5.0,8.2,woodMat,Math.PI/2);
  addResidenceFloor(parent,x+1,lower,z+1,9.0,6.8,mossFloorMat);
  addLivingDoorFrame(parent,x+1,lower,z+9.0,4.2,4.1);
  for(const side of [-1,1]){
    const wx=x+side*7.6,wz=z+.8;
    addOval(parent,wx,lower+4.1,wz,1.45,2.0,.18,darkMat,16);
    const frame=[];for(let i=0;i<=18;i++){const q=-Math.PI*.82+i/18*Math.PI*1.64;frame.push([wx+Math.cos(q)*1.65,lower+4.1+Math.sin(q)*2.25,wz+.15]);}
    addOrganicTube(parent,frame,.18,.12,paleWood,7,24,.06);
  }
  addOpenOvoidPod(parent,x-2,upper+2.8,z-4,7.4,4.0,6.2,paleWood,Math.PI/2);
  addResidenceFloor(parent,x-2,upper,z-4,6.3,5.0,mossFloorMat);
  addLivingDoorFrame(parent,x-2,upper,z+2.0,2.8,3.1);
  for(const side of [-1,1]){
    const wx=x-2+side*5.0,wz=z-4;
    addOval(parent,wx,upper+3.1,wz,1.0,1.45,.14,darkMat,14);
    const frame=[];for(let i=0;i<=16;i++){const q=-Math.PI*.82+i/16*Math.PI*1.64;frame.push([wx+Math.cos(q)*1.15,upper+3.1+Math.sin(q)*1.65,wz+.12]);}
    addOrganicTube(parent,frame,.14,.09,woodMat,7,20,.05);
  }
  const railOuter=[],railInner=[],walk=[],turns=2.25,steps=72,radius=12.2;
  for(let i=0;i<=steps;i++){
    const t=i/steps,q=t*Math.PI*2*turns-Math.PI/2,sy=y+1+t*22.7,px=x+Math.cos(q)*radius,pz=z+Math.sin(q)*radius;
    walk.push([px,sy,pz]);railOuter.push([x+Math.cos(q)*(radius+2.1),sy+2.1,z+Math.sin(q)*(radius+2.1)]);
    railInner.push([x+Math.cos(q)*(radius-2),sy+1.7,z+Math.sin(q)*(radius-2)]);
    if(i<steps){
      const step=new THREE.Mesh(new THREE.BoxGeometry(4.2,.42,1.45),paleWood);
      step.position.set(px,sy,pz);step.rotation.y=-q;step.castShadow=true;step.receiveShadow=true;parent.add(step);
      const nosing=new THREE.Mesh(new THREE.BoxGeometry(4.35,.12,.18),woodMat);
      nosing.position.set(px,sy+.22,pz);nosing.rotation.y=-q;parent.add(nosing);
    }
  }
  addOrganicTube(parent,railOuter,.24,.18,paleWood,8,steps*2,.05);addOrganicTube(parent,railInner,.18,.12,woodMat,7,steps*2,.05);
  for(let i=0;i<=steps;i+=3){const p=walk[i],q=(i/steps)*Math.PI*2*turns-Math.PI/2;
    addOrganicTube(parent,[[x+Math.cos(q)*(radius+2.1),p[1],z+Math.sin(q)*(radius+2.1)],[x+Math.cos(q)*(radius+2.1),p[1]+1.9,z+Math.sin(q)*(radius+2.1)]],.10,.075,woodMat,6,5,.03);}
  registerWalkablePath(walk,3.5);
  registerWalkablePath([[x+1,lower,z+9],[x+1,lower,z+5],[x+1,lower,z+1]],3.2);
  registerWalkablePath([[x-2,upper,z+2],[x-2,upper,z-1],[x-2,upper,z-4]],2.6);
  for(let side=-1;side<=1;side+=2){
    addOrganicTube(parent,[[x+side*5,y+45,z],[x+side*20,y+57,z+side*5],[x+side*38,y+69,z+side*12],[x+side*54,y+74,z+side*18]],2.6,.28,woodMat,12,42,.16);
    for(let k=0;k<5;k++){const bx=x+side*(18+k*7),bz=z+side*(5+k*2);
      addOrganicTube(parent,[[bx,y+56+k*2,bz],[bx+side*6,y+64+k*2,bz+side*3],[bx+side*10,y+68+k*2,bz+side*5]],.55,.08,paleWood,8,18,.12);}
  }
}
function buildHall(parent,x,y,z){
  const length=58,width=26,height=20;
  // Salão de árvores vivas: uma nave ampla envolvida por troncos e raízes entrelaçados.
  for(let side of [-1,1])for(let i=0;i<9;i++){
    const px=x-24+i*6,pz=z+side*10.5;
    addLivingTrunk(parent,px,y,pz,height+5,1.55,Math.sin(i*.7)*1.2,side*.8,woodMat);
    addOrganicTube(parent,[[px,y+height*.35,pz],[px+Math.sin(i)*2.0,y+height+3,pz+side*2.0],
      [px+Math.sin(i*.45)*2.2,y+height+8,z+side*4.0]],.62,.16,paleWood,8,24,.14);
  }
  for(let side of [-1,1])for(let i=0;i<8;i++){
    const px=x-21+i*6,baseZ=z+side*12;
    addOrganicTube(parent,[[px,y+2,baseZ],[px+side*2,y+10,baseZ-side*2],
      [px+side*1.5,y+height+4,z+side*4],[x+(px-x)*.72,y+height+7,z]],.52,.12,woodMat,8,28,.13);
  }
  addHoneycombRoof(parent,x,y+height+3,z,length,width);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1,72),mossFloorMat);
  floor.rotation.x=-Math.PI/2;floor.position.set(x,y+.04,z);floor.scale.set(length*.56,width*.80,1);
  floor.receiveShadow=true;parent.add(floor);
  const aisleMat=new THREE.MeshStandardMaterial({color:0x596b3c,roughness:1,side:THREE.DoubleSide});
  const aisle=new THREE.Mesh(new THREE.PlaneGeometry(5.8,34),aisleMat);
  aisle.rotation.x=-Math.PI/2;aisle.position.set(x,y+.08,z+1);parent.add(aisle);
  registerWalkablePath([[x,y+.15,z+22],[x,y+.15,z+10],[x,y+.15,z],[x,y+.15,z-10],[x,y+3.3,z-17]],4.2);
  // 24 assentos, doze em cada parede, voltados para o trono branco.
  for(let side of [-1,1])for(let i=0;i<12;i++){
    const px=x-17+i*3.1,pz=z+side*7.2,cy=y+.78;
    addOrganicTube(parent,[[px-.85,cy,pz],[px,cy+.30,pz+side*.2],[px+.85,cy,pz]],.25,.20,woodMat,8,10,.1);
    addOrganicTube(parent,[[px-.72,cy,pz],[px-.78,cy+1.9,pz-side*.35],[px,cy+2.35,pz-side*.52],
      [px+.78,cy+1.9,pz-side*.35],[px+.72,cy,pz]],.21,.13,paleWood,8,14,.1);
    for(let k=-1;k<=1;k+=2)addOrganicTube(parent,[[px+k*.72,cy,pz],[px+k*.95,cy+.9,pz+side*.12]],.12,.07,woodMat,6,8,.08);
  }
  // Pavilhão real: casca branca, piso próprio, entrada alta e trono feito de raízes.
  addOpenOvoidPod(parent,x,y+7,z-20,7.2,4.6,4.2,whiteBarkMat,Math.PI/2);
  addResidenceFloor(parent,x,y+3.35,z-20,5.8,3.2,mossFloorMat);
  addLivingDoorFrame(parent,x,y+3.35,z-15.9,3.0,4.1);
  addOrganicTube(parent,[[x-2.6,y+3.65,z-20],[x-1.6,y+4.2,z-19.8],[x,y+4.4,z-20],
    [x+1.6,y+4.2,z-19.8],[x+2.6,y+3.65,z-20]],.55,.26,paleWood,9,26,.12);
  addOrganicTube(parent,[[x-1.7,y+4.0,z-20],[x-1.35,y+6.7,z-21],[x,y+7.8,z-21.5],
    [x+1.35,y+6.7,z-21],[x+1.7,y+4.0,z-20]],.42,.18,whiteBarkMat,9,26,.11);
  const velvet=new THREE.MeshStandardMaterial({color:0x542a3b,roughness:.96,side:THREE.DoubleSide});
  addOval(parent,x,y+5.2,z-23.6,3.0,2.8,.18,velvet,18);
  for(let i=0;i<11;i++){
    const xx=x-3.6+i*.72;
    addOrganicTube(parent,[[xx,y+1,z-23.0],[xx+Math.sin(i)*.35,y+4.5,z-23.4],
      [xx+Math.cos(i*.6)*.3,y+8.5,z-22.2]],.15,.045,whiteBarkMat,6,18,.1);
  }
  // Poleiro curvo para Blagden.
  addOrganicTube(parent,[[x+9,y+3,z-18],[x+10.2,y+5.5,z-20],[x+10.8,y+8,z-21]],.2,.1,woodMat,7,18,.08);
  addOrganicTube(parent,[[x+10.2,y+7.7,z-21],[x+12,y+7.7,z-21]],.10,.07,paleWood,6,8,.04);
  // Fachada de mudas, arco vivo e degraus de raízes na entrada.
  for(let side of [-1,1])for(let i=0;i<9;i++){
    const px=x+side*(7+i*2.2);
    addOrganicTube(parent,[[px,y-.2,z+22],[px+side*.6,y+5,z+23],[px+Math.sin(i)*.8,y+11,z+19],
      [px*.98,y+17+Math.random()*2,z+12]],.28,.07,woodMat,7,22,.14);
  }
  addOrganicTube(parent,[[x-8,y+2,z+22],[x-6,y+12,z+24],[x,y+19,z+23],
    [x+6,y+12,z+24],[x+8,y+2,z+22]],1.2,.28,paleWood,12,40,.12);
  for(let i=0;i<12;i++)addRootStair(parent,x,y+i*.06,z+17+i*.72,1,12,1);
  registerWalkablePath(Array.from({length:13},(_,i)=>[x,y+.25+i*.05,z+17+i*.72]),4.2);
  const hallGlow=new THREE.PointLight(0xffd18a,2.4,52,1.8);hallGlow.position.set(x,y+8,z);parent.add(hallGlow);
  const throneGlow=new THREE.PointLight(0xffd69a,1.8,26,1.8);throneGlow.position.set(x,y+5,z-20);parent.add(throneGlow);
}
function buildForge(parent,x,y,z){
  // Oficina circular de Rhunön: arquitetura funcional em madeira e pedra.
  const wallY=y+1,radius=12,wallH=7.2;
  const foundation=new THREE.Mesh(new THREE.CylinderGeometry(12.4,13.2,1.1,10),stoneMat);
  foundation.position.set(x,y+.48,z);foundation.receiveShadow=true;parent.add(foundation);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(11.7,48),mossFloorMat);floor.rotation.x=-Math.PI/2;floor.position.set(x,y+1.08,z);parent.add(floor);
  for(let i=0;i<10;i++){const q=i/10*Math.PI*2,px=x+Math.cos(q)*radius,pz=z+Math.sin(q)*radius;
    addLivingTrunk(parent,px,wallY,pz,wallH,1.0,Math.cos(q)*.8,Math.sin(q)*.8,woodMat);
    addOrganicTube(parent,[[px,wallY+wallH-1,pz],[x+Math.cos(q)*7,wallY+wallH+3,z+Math.sin(q)*7],[x+Math.cos(q)*2,wallY+wallH+5,z+Math.sin(q)*2]],.62,.14,paleWood,9,24,.08);}
  for(let i=0;i<10;i++){const q=(i+.5)/10*Math.PI*2;if(Math.sin(q)>.65)continue;
    const panel=new THREE.Mesh(new THREE.BoxGeometry(5.6,4.6,.42),dwellingWallMat);
    panel.position.set(x+Math.cos(q)*10.9,wallY+3.45,z+Math.sin(q)*10.9);panel.rotation.y=-q+Math.PI/2;parent.add(panel);
    const lintel=new THREE.Mesh(new THREE.BoxGeometry(5.8,.32,.62),paleWood);
    lintel.position.set(panel.position.x,wallY+6.0,panel.position.z);lintel.rotation.y=panel.rotation.y;parent.add(lintel);}
  const roof=new THREE.Mesh(new THREE.ConeGeometry(15.2,5.2,10,1),roofMat);roof.position.set(x,wallY+wallH+3.2,z);roof.rotation.y=Math.PI/10;roof.castShadow=true;parent.add(roof);
  const ridge=new THREE.Mesh(new THREE.CylinderGeometry(.42,.68,3.8,10),woodMat);ridge.position.set(x,wallY+wallH+5.2,z);parent.add(ridge);
  const chimney=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.45,8.2,8),stoneMat);chimney.position.set(x-5,wallY+wallH+5.8,z-3);parent.add(chimney);
  const mouth=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.12,8),darkMat);mouth.position.set(x-5,wallY+wallH+10,z-3);parent.add(mouth);
  addLivingDoorFrame(parent,x,wallY,z+11,4.0,4.5);
  for(let i=0;i<4;i++){const step=new THREE.Mesh(new THREE.BoxGeometry(5.2,.32,1.0),stoneMat);step.position.set(x,wallY+.18+i*.02,z+12+i*.9);parent.add(step);}
  registerWalkablePath([[x,wallY+1.1,z+16],[x,wallY+1.1,z+10],[x,wallY+1.1,z+4],[x,wallY+1.1,z]],4.0);
  const furnace=new THREE.Mesh(new THREE.BoxGeometry(5.6,4.8,4.2),stoneMat);furnace.position.set(x-4.2,wallY+3.45,z-4.5);parent.add(furnace);
  const furnaceMouth=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.3,.18),darkMat);furnaceMouth.position.set(x-4.2,wallY+2.7,z-2.35);parent.add(furnaceMouth);
  const fire=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),warmMat);fire.scale.set(1,.5,.25);fire.position.set(x-4.2,wallY+2.25,z-2.55);parent.add(fire);
  const glow=new THREE.PointLight(0xff873c,1.35,24);glow.position.set(x-4.2,wallY+4,z-1.5);parent.add(glow);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.72,.9,1.4,8),woodMat);base.position.set(x+3.8,wallY+1.8,z-2);parent.add(base);
  const anvil=new THREE.Mesh(new THREE.BoxGeometry(2.4,.72,1.25),stoneMat);anvil.position.set(x+3.8,wallY+2.85,z-2);parent.add(anvil);
  const horn=new THREE.Mesh(new THREE.ConeGeometry(.48,1.5,6),stoneMat);horn.rotation.z=-Math.PI/2;horn.position.set(x+5.35,wallY+2.9,z-2);parent.add(horn);
  const bellows=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.2,1.4),dwellingTrimMat);bellows.position.set(x+5,wallY+2.4,z+3);bellows.rotation.y=-.25;parent.add(bellows);
  for(let i=0;i<3;i++){const tool=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,3.4,6),woodMat);tool.position.set(x+7.2+i*.65,wallY+3.4,z-5+i*.3);tool.rotation.z=.18;parent.add(tool);}
  const windowGlow=new THREE.PointLight(0xffd6a0,.45,18);windowGlow.position.set(x+1,wallY+5,z+7);parent.add(windowGlow);
}
function buildTialdari(parent,x,y,z){
  // Arco lanceolado entre dois troncos vivos; sem pedra, pilares ou portal medieval.
  addLivingTrunk(parent,x-9,y,z,23,1.7,-2,0);
  addLivingTrunk(parent,x+9,y,z,23,1.7,2,0);
  addOrganicTube(parent,[[x-9,y+14,z],[x-7,y+20,z],[x,y+27,z],[x+7,y+20,z],[x+9,y+14,z]],1.25,.45,paleWood,12,34,.12);
  addTearOpening(parent,x,y+8,z+.25,5.5,10,0);
  // Porta se abre por feitiço: pequenas borboletas discretas ao redor do arco.
  const butterflyMat=new THREE.MeshStandardMaterial({color:0xc68b43,roughness:.8,side:THREE.DoubleSide});
  const wingGeo=new THREE.SphereGeometry(1,7,5),bodyGeo=new THREE.CylinderGeometry(.025,.035,.34,5);
  const wings=new THREE.InstancedMesh(wingGeo,butterflyMat,28),bodies=new THREE.InstancedMesh(bodyGeo,darkMat,14),d=new THREE.Object3D();
  for(let i=0;i<14;i++){
    const px=x+(Math.random()-.5)*14,py=y+7+Math.random()*13,pz=z+1+(Math.random()-.5)*4;
    d.position.set(px-.22,py,pz);d.rotation.set(0,.3,0);d.scale.set(.23,.07,.14);d.updateMatrix();wings.setMatrixAt(i*2,d.matrix);
    d.position.set(px+.22,py,pz);d.rotation.set(0,-.3,0);d.scale.set(.23,.07,.14);d.updateMatrix();wings.setMatrixAt(i*2+1,d.matrix);
    d.position.set(px,py,pz);d.rotation.set(0,0,0);d.scale.setScalar(1);d.updateMatrix();bodies.setMatrixAt(i,d.matrix);
  }
  wings.instanceMatrix.needsUpdate=true;bodies.instanceMatrix.needsUpdate=true;parent.add(wings,bodies);
  // Salões de troncos polidos, ligados por passagens cobertas.
  addLivingTrunk(parent,x-18,y,z-21,16,1.35,1.4,-.6);
  addLivingTrunk(parent,x+18,y,z-20,16,1.35,-1.2,-.5);
  addOpenOvoidPod(parent,x-18,y+7,z-21,7,4.2,6,paleWood,Math.PI/2);
  addOpenOvoidPod(parent,x+18,y+7,z-20,7.5,4.3,6.4,woodMat,Math.PI/2);
  const hallFloor=y+3.3;
  addResidenceFloor(parent,x-18,hallFloor,z-21,5.8,4.8,mossFloorMat);
  addResidenceFloor(parent,x+18,hallFloor,z-20,6.2,5.0,mossFloorMat);
  addLivingDoorFrame(parent,x-18,hallFloor,z-15.3,2.4,3.4);
  addLivingDoorFrame(parent,x+18,hallFloor,z-14.0,2.5,3.5);
  const tialdariGlass=[0x9b8c56,0x4e7660,0x8a6950,0x627b83];
  for(let i=0;i<4;i++){
    const angle=i*Math.PI/2,gemMat=new THREE.MeshStandardMaterial({color:tialdariGlass[i],roughness:.18,metalness:.1,emissive:0x9e6e32,emissiveIntensity:.7});
    addOval(parent,x-18+Math.cos(angle)*6.45,y+7,z-21+Math.sin(angle)*5.55,.42,1.05,.14,gemMat,12);
    addOval(parent,x+18+Math.cos(angle)*6.8,y+7,z-20+Math.sin(angle)*5.9,.42,1.05,.14,gemMat,12);
  }
  addOrganicTube(parent,[[x-18,hallFloor+3,z-14],[x-10,hallFloor+6,z-6],[x,hallFloor+7,z-4],
    [x+10,hallFloor+6,z-6],[x+18,hallFloor+3,z-13]],.30,.12,paleWood,7,36,.10);
  buildLivingBridge(parent,[[x-18,hallFloor,z-15.3],[x-9,hallFloor+.5,z-7],[x,hallFloor+.7,z-4],
    [x+9,hallFloor+.5,z-7],[x+18,hallFloor,z-14.0]],3.4);
  registerWalkablePath([[x-18,hallFloor,z-15.3],[x-18,hallFloor,z-20],[x-18,hallFloor,z-21]],2.6);
  registerWalkablePath([[x+18,hallFloor,z-14.0],[x+18,hallFloor,z-19],[x+18,hallFloor,z-20]],2.6);
  for(let side of [-1,1]){
    const hx=x+side*18,hz=z-21+(side===1?1:0);
    addOval(parent,hx,hallFloor+.42,hz-1.2,2.4,.35,1.0,woodMat,16);
    addOrganicTube(parent,[[hx-2,hallFloor+.25,hz-1.2],[hx-1,hallFloor+1.0,hz-1.5],
      [hx+1,hallFloor+1.0,hz-1.5],[hx+2,hallFloor+.25,hz-1.2]],.20,.12,paleWood,7,14,.08);
  }
  addOrganicTube(parent,[[x-12,hallFloor+1,z-23],[x-8,hallFloor+2,z-22],[x-3,hallFloor+1,z-21]],.28,.08,paleWood,7,16,.10);
  addOrganicTube(parent,[[x+12,hallFloor+1,z-22],[x+8,hallFloor+2,z-21],[x+3,hallFloor+1,z-20]],.28,.08,paleWood,7,16,.10);
  // Mobiliário e luz interna quente nas duas salas de Tialdarí.
  addOval(parent,x-18,hallFloor+.62,z-22,1.7,.42,1.15,paleWood,16);
  addOval(parent,x-18,hallFloor+.88,z-22,1.45,.13,.92,woodMat,14);
  addOval(parent,x+18,hallFloor+.55,z-21,1.6,.38,1.05,paleWood,16);
  addOrganicTube(parent,[[x+14,hallFloor+.25,z-19],[x+15,hallFloor+1.2,z-19.5],[x+18,hallFloor+1.35,z-19],
    [x+21,hallFloor+1.2,z-19.5],[x+22,hallFloor+.25,z-19]],.18,.10,woodMat,7,16,.08);
  const tialdariGlowA=new THREE.PointLight(0xffc77e,2.2,30,1.8);
  tialdariGlowA.position.set(x-18,hallFloor+2.6,z-21);parent.add(tialdariGlowA);
  const tialdariGlowB=new THREE.PointLight(0xffd18e,2.2,32,1.8);
  tialdariGlowB.position.set(x+18,hallFloor+2.5,z-20);parent.add(tialdariGlowB);
  // Riacho prateado que desce uma parede viva e atravessa o piso.
  const silverWater=new THREE.MeshStandardMaterial({color:0x8babb1,metalness:.45,roughness:.18,transparent:true,opacity:.8});
  addOrganicTube(parent,[[x-18,y+12,z-14],[x-17,y+8,z-12],[x-15,y+3,z-8],[x-10,y+.15,z-4],[x,y+.12,z+10]],.22,.13,silverWater,7,30,.04);
  buildFlowerGrove(parent,x,y,z,48,650);
}
function buildHexagonalResidence(parent,x,y,z,scale=1){
  return buildReadableDwelling(parent,x,z,y+.35*scale,.88*scale,false);
}
function buildFiveStoreyResidence(parent,x,y,z){
  const groundY=y-10,levels=5,homes=[];
  for(const [dx,dz] of [[-8,-5],[8,-5],[0,9]]){
    const base=alturaTerreno(x+dx,z+dz),height=Math.max(58,y+48-base);
    const supportGroup=new THREE.Group();supportGroup.position.y=groundY;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.85,height,10,5),woodMat);
    trunk.position.set(dx,base+height/2-groundY,dz);trunk.castShadow=true;trunk.receiveShadow=true;
    supportGroup.add(trunk);parent.add(supportGroup);
  }
  const firstFloor=y+8;
  for(let level=0;level<levels;level++){
    const floorY=firstFloor+level*6.6,shrink=.56-level*.035,podX=x+(level%2?1.2:-1.2);
    const home=buildReadableDwelling(parent,podX,z,floorY,shrink,false);
    homes.push({x:podX,y:floorY,z:home.z});
  }
  const topFloor=firstFloor+(levels-1)*6.6;
  const stair=buildCanopyStairTower(parent,x+14,z+2,groundY,topFloor+1.0,4);
  for(const home of homes){
    const t=Math.max(0,Math.min(1,(home.y-groundY)/(topFloor+1-groundY)));
    const p=stair.path[Math.round(t*(stair.path.length-1))];
    buildLivingBridge(parent,[[p[0],p[1],p[2]],[x+9,home.y,z+1],[home.x,home.y,home.z]],1.75);
  }
}
function buildWillowBower(parent,x,y,z){
  // Caramanchão aberto de salgueiro e corniso, trançado em arcos vivos.
  const radius=3.7,arches=12;
  for(let i=0;i<arches;i++){
    const a=i/arches*Math.PI*2,pts=[];
    for(let j=0;j<=8;j++){
      const t=j/8,ang=a+t*Math.PI,rad=radius*Math.sin(t*Math.PI*.5);
      pts.push([x+Math.cos(ang)*rad,y+Math.sin(t*Math.PI)*4.2,z+Math.sin(ang)*rad]);
    }
    addOrganicTube(parent,pts,.16,.055,i%2?woodMat:paleWood,6,18,.12);
  }
  for(let i=0;i<14;i++){
    const a=i/14*Math.PI*2;
    addOrganicTube(parent,[[x+Math.cos(a)*radius,y,z+Math.sin(a)*radius],
      [x+Math.cos(a)*radius*.72,y+2,z+Math.sin(a)*radius*.72],
      [x+Math.cos(a)*.3,y+4.3,z+Math.sin(a)*.3]],.12,.035,woodMat,5,12,.08);
  }
  // Sem frutos esféricos artificiais pendurados no caramanchão.
}
function buildStable(parent,x,y,z){
  // Três baias vivas, com comedouros, água, feno e arreios pendurados.
  const troughMat=new THREE.MeshStandardMaterial({color:0x5a432d,roughness:.98});
  const hayMat=new THREE.MeshStandardMaterial({color:0xb39a5d,roughness:1});
  for(let i=-1;i<=1;i++){
    const px=x+i*5.5;
    addLivingTrunk(parent,px,y,z-4,8,.6,i*.3,-.6);
    addLivingTrunk(parent,px,y,z+4,8,.6,-i*.3,.6);
    addOrganicTube(parent,[[px,y+7,z-4],[px,y+10,z],[px,y+7,z+4]],.38,.12,woodMat,7,18,.12);
    addOrganicTube(parent,[[px-2.2,y,z],[px-2.4,y+2.3,z+1],[px-2.1,y+3.5,z]],.13,.05,paleWood,6,9,.07);
    addOrganicTube(parent,[[px+2.2,y,z],[px+2.4,y+2.3,z+1],[px+2.1,y+3.5,z]],.13,.05,paleWood,6,9,.07);
    addOrganicTube(parent,[[px-2.1,y,z+4.1],[px-1.2,y+3.0,z+4.2],[px,y+3.6,z+4.2],[px+1.2,y+3.0,z+4.2],[px+2.1,y,z+4.1]],.18,.10,paleWood,7,16,.08);
    // Cocho baixo: bordas de madeira e interior escuro, sem caixas flutuantes.
    const trough=new THREE.Mesh(new THREE.BoxGeometry(3.25,.72,.92),troughMat);
    trough.position.set(px,y+.52,z+2.25);parent.add(trough);
    const water=new THREE.Mesh(new THREE.BoxGeometry(2.78,.06,.55),HOME_CERAMIC_MAT);
    water.position.set(px,y+.90,z+2.25);parent.add(water);
    for(const side of [-1,1]){
      const leg=new THREE.Mesh(new THREE.BoxGeometry(.18,.56,.18),woodMat);
      leg.position.set(px+side*1.2,y+.25,z+2.25);parent.add(leg);
    }
    const hay=new THREE.Mesh(new THREE.ConeGeometry(1.1,1.35,8),hayMat);
    hay.position.set(px-1.25,y+.85,z-1.75);hay.rotation.z=.28;parent.add(hay);
    for(let strand=0;strand<8;strand++){
      const a=strand/8*Math.PI*2;
      addOrganicTube(parent,[[px-1.25+Math.cos(a)*.3,y+.35,z-1.75+Math.sin(a)*.3],
        [px-1.25+Math.cos(a)*.85,y+.75+Math.sin(a)*.12,z-1.75+Math.sin(a)*.85]],.045,.018,hayMat,4,5,.02);
    }
    // Argolas e correias de sela no pilar frontal de cada baia.
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34,.07,7,16),paleWood);
    ring.position.set(px+1.8,y+2.35,z+3.92);ring.rotation.x=Math.PI/2;parent.add(ring);
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.10,1.15,.10),HOME_DARK_WOOD_MAT);
    strap.position.set(px+1.8,y+1.62,z+3.85);parent.add(strap);
    registerWalkablePath([[px,y+.05,z+6],[px,y+.05,z+2],[px,y+.05,z]],2.7);
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
  // Cabana baixa crescida entre quatro árvores; aberta para o riacho e a clareira.
  const trees=[[-7,-6],[7,-6],[-7,6],[7,6]];
  trees.forEach(([dx,dz],i)=>addLivingTrunk(parent,x+dx,y,z+dz,13,1.0,
    dx<0?1.1:-1.1,dz<0?.8:-.8));
  addOpenOvoidPod(parent,x,y+3.8,z,6.5,2.5,5.2,woodMat,Math.PI/2);
  addResidenceFloor(parent,x,y+1.6,z,5.2,4.1,mossFloorMat);addLivingDoorFrame(parent,x,y+1.6,z+5.05,2.1,2.8);
  registerWalkablePath([[x,y+1.6,z+5],[x,y+1.6,z+2],[x,y+1.6,z]],2.5);
  // paredes parcialmente abertas e cobertura baixa de galhos.
  for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2;
    addOrganicTube(parent,[[x+Math.cos(a)*5.5,y+1,z+Math.sin(a)*4.5],
      [x+Math.cos(a)*4.5,y+5,z+Math.sin(a)*3.8],
      [x+Math.cos(a)*2,y+7,z+Math.sin(a)*2]],.28,.08,paleWood,7,14,.1);
  }
  // Salgueiro sobre o riacho e quadrado de terra batida para o Rimgar.
  addLivingTrunk(parent,x-12,y,z+11,17,.65,-1,1,woodMat);
  for(let i=0;i<22;i++){
    const a=i/22*Math.PI*2,ex=x-12+Math.cos(a)*4,ez=z+11+Math.sin(a)*4;
    addOrganicTube(parent,[[x-12,y+15,z+11],[ex,y+9,z+11+Math.sin(a)*2],[ex,y+2,z+11+Math.sin(a)*4]],.07,.025,mossFloorMat,5,12,.1);
  }
  addOval(parent,x,y+.025,z-18,7,.035,6,new THREE.MeshStandardMaterial({color:0x584733,roughness:1}),16);
  // Riacho passa sob uma das quatro árvores e segue em direção à borda do penhasco.
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
  // Topo arborizado, clareira de trevo vermelho e início da queda de 300 m.
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2,r=12+Math.random()*18,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    addLivingTrunk(parent,px,y,pz,34+Math.random()*22,1.1+Math.random()*.6,Math.cos(a)*2,Math.sin(a)*2);
  }
  buildFlowerGrove(parent,x,y,z,24,360,0x9a3345);
}
function buildOromisStump(parent,x,y,z){
  const stumpMat=new THREE.MeshStandardMaterial({color:0xd4c9a7,roughness:.9,side:THREE.DoubleSide});
  const g=new THREE.CylinderGeometry(1.25,1.45,.8,18,4);g.translate(0,.4,0);
  const stump=new THREE.Mesh(g,stumpMat);stump.position.set(x,y,z);stump.castShadow=true;parent.add(stump);
  for(let i=0;i<18;i++){
    const a=i/18*Math.PI*2;addOrganicTube(parent,[[x+Math.cos(a)*.8,y+.15,z+Math.sin(a)*.8],
      [x+Math.cos(a)*1.3,y+.35,z+Math.sin(a)*1.3]],.08,.025,whiteBarkMat,5,5,.04);
  }
}
function buildNaturalArchSite(parent,x,y,z){
  buildNaturalArch(parent,x,y,z);
  // Duas casas disfarçadas em troncos curvados nos limites da clareira.
  for(let side of [-1,1]){
    const hx=x+side*17,hz=z+side*7;
    addLivingTrunk(parent,hx,y,hz,19,1.15,side*2,-side);
    addOpenOvoidPod(parent,hx+side*1.2,y+5,hz,4.8,3.1,4.0,woodMat,Math.PI/2);
    addResidenceFloor(parent,hx+side*1.2,y+2.25,hz,3.7,3.0,mossFloorMat);
    addLivingDoorFrame(parent,hx+side*1.2,y+2.25,hz+3.8,1.8,2.6);
    registerWalkablePath([[hx+side*1.2,y+2.25,hz+3.8],[hx+side*1.2,y+2.25,hz+1],[hx+side*1.2,y+2.25,hz]],2.4);
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
  ['Gilderien (feixe de luz)',850,-60,'gilderien'],
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
  ['Morada de raízes — nordeste',940,-760,'foresthome'],
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


