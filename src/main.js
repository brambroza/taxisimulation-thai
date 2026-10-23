import * as THREE from 'three';
import './style.css';
import {loadAsokMap,project,PLACES} from './osm.js';
const root=document.querySelector('#app');
root.innerHTML='<div id="hud"><b>🚕 BANGKOK DRIVE 3D</b><div id="speed">0 km/h</div><div id="navigation">เลือกจุดหมายเพื่อเริ่มนำทาง</div><div id="map-status">รอโหลด OSM</div><a href="/merchant.html" class="merchant-link">🏪 Merchant Portal</a><div id="cash">฿0</div><select id="destination"><option value="0">อโศก / Asok</option><option value="1">Terminal 21</option><option value="2">สวนเบญจสิริ</option><option value="3">พร้อมพงษ์</option></select><button id="mission">เริ่มภารกิจ</button><p id="status">ขับรถเที่ยวกรุงเทพฯ</p></div><div id="controls"><button data-key="left">◀</button><button data-key="right">▶</button><button data-key="brake">เบรก</button><button data-key="gas">เร่ง ▲</button></div><div id="tools"><button id="camera">📷 กล้อง</button><button id="reset">↻ รีเซ็ต</button></div><div id="credit">© OpenStreetMap contributors · OSM POIs may be outdated · geometry not photorealistic</div>';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x98c5e5);scene.fog=new THREE.Fog(0x98c5e5,160,650);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,1400);
scene.add(new THREE.HemisphereLight(0xffffff,0x516779,2.5));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(80,160,100);scene.add(light);
const material=c=>new THREE.MeshLambertMaterial({color:c});
const grass=new THREE.Mesh(new THREE.PlaneGeometry(3500,3500),material(0x65866d));grass.rotation.x=-Math.PI/2;grass.position.y=-.03;scene.add(grass);
const roadMat=material(0x343c45),white=material(0xe9e6d5),facades=[material(0xa9b7c0),material(0x8297a5),material(0xc6b4a2),material(0x9ba8b1)];
function road(x,z,w,h){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),roadMat);m.rotation.x=-Math.PI/2;m.position.set(x,.01,z);scene.add(m)}
// Map geometry is loaded from live OpenStreetMap; no fictional street grid.
loadAsokMap(scene,message=>{$('map-status').textContent=message}).catch(err=>{
  $('map-status').textContent='⚠️ OSM โหลดไม่ได้ ('+err.message+') · ลองรีเฟรช';
  console.error('OSM load failed',err);
});
const car=new THREE.Group();const chassis=new THREE.Mesh(new THREE.BoxGeometry(2.2,.8,4.3),material(0xf0d23e));chassis.position.y=.8;car.add(chassis);const cab=new THREE.Mesh(new THREE.BoxGeometry(1.75,.75,2.1),material(0x34566e));cab.position.set(0,1.52,-.25);car.add(cab);for(const x of [-1.08,1.08])for(const z of [-1.4,1.4]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.22,12),material(0x16191f));w.rotation.z=Math.PI/2;w.position.set(x,.43,z);car.add(w)}const sign=new THREE.Mesh(new THREE.BoxGeometry(.8,.28,.45),material(0xffffff));sign.position.y=2.02;car.add(sign);scene.add(car);
// Road signs are procedural geometry, not georeferenced Bangkok signage.
function signText(lines, width=9, height=3.4) {
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=384;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#16613c';ctx.fillRect(0,0,1024,384);
  ctx.strokeStyle='#fff';ctx.lineWidth=15;ctx.strokeRect(18,18,988,348);
  ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 70px system-ui';
  lines.forEach((line,i)=>ctx.fillText(line,512,150+i*95));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
}
// No invented road-sign locations: real signs require surveyed/georeferenced assets.
// Interior parts are attached to the car so they move and turn with it.
const interior=new THREE.Group();car.add(interior);
const trim=material(0x1b242d),dash=material(0x242c34),glass=new THREE.MeshStandardMaterial({color:0x80b4d1,transparent:true,opacity:.16,roughness:.13,metalness:.12,depthWrite:false});
function cabinBox(w,h,d,x,y,z,mat=trim){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);interior.add(m);return m}
cabinBox(2.12,.32,.82,0,1.32,-1.37,dash); // dashboard
cabinBox(2.1,.12,.13,0,2.12,-1.92,trim); // windshield upper frame
for(const x of [-1.03,1.03])cabinBox(.10,1.14,.12,x,1.76,-1.91,trim);
cabinBox(1.98,.82,.025,0,1.75,-1.94,glass);
const wheel=new THREE.Group();wheel.position.set(-.52,1.45,-1.05);wheel.rotation.x=-.35;interior.add(wheel);
const wheelRing=new THREE.Mesh(new THREE.TorusGeometry(.29,.045,9,24),trim);wheel.add(wheelRing);
for(let i=0;i<3;i++){const spoke=new THREE.Mesh(new THREE.BoxGeometry(.045,.35,.06),trim);spoke.rotation.z=i*Math.PI*2/3;spoke.position.y=.16;wheel.add(spoke)}
const instrument=signText(['TAXI  METER'],.76,.28);instrument.position.set(.44,1.62,-1.79);interior.add(instrument);
const seatMat=material(0x3c4149);
for(const x of [-.52,.52]){cabinBox(.72,.2,.72,x,.73,.54,seatMat);cabinBox(.72,.9,.17,x,1.25,.88,seatMat)}
// Rear-view mirror and wing mirrors.
cabinBox(.53,.17,.08,0,2.05,-1.74,material(0x8eb7cb));
for(const x of [-1.25,1.25])cabinBox(.37,.19,.12,x,1.34,-1.7,material(0x8eb7cb));
const cockpitEye=new THREE.Vector3(-.48,1.78,.30);
const cockpitTarget=new THREE.Vector3(-.48,1.70,-17);
// Merchant pins from the local prototype portal (same-origin localStorage).
const merchantPins=new THREE.Group();scene.add(merchantPins);
function refreshMerchantPins(){
  // Remove and dispose of previous merchant media to avoid GPU memory leaks.
  merchantPins.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>{m.map?.dispose();m.dispose()})}});
  merchantPins.clear();
  let shops=[];try{shops=JSON.parse(localStorage.getItem('bkk-digital-twin-merchants-v1')||'[]')}catch{}
  const loader=new THREE.TextureLoader();
  for(const shop of shops.slice(0,60)){
    if(!Number.isFinite(shop.lat)||!Number.isFinite(shop.lon))continue;
    const p=project(shop.lat,shop.lon);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,4.5,8),material(0x67757b));
    pole.position.set(p.x,2.25,p.z);merchantPins.add(pole);
    const label=signText([String(shop.name||'ร้านค้า').slice(0,22)],7,2);
    label.position.set(p.x,5.5,p.z);merchantPins.add(label);
    // A merchant-provided, licensed facade photograph is shown in the world.
    // It is a geolocated photo panel, NOT a reconstructed building facade.
    if(typeof shop.image==='string'&&/^https:\/\//i.test(shop.image)){
      const photo=new THREE.Mesh(new THREE.PlaneGeometry(8,4.5),new THREE.MeshBasicMaterial({color:0x55606b,side:THREE.DoubleSide}));
      photo.position.set(p.x,9,p.z);photo.rotation.y=THREE.MathUtils.degToRad(Number(shop.facing)||0);merchantPins.add(photo);
      loader.load(shop.image,texture=>{
        if(!photo.parent){texture.dispose();return}
        texture.colorSpace=THREE.SRGBColorSpace;
        photo.material.dispose();
        photo.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
      },undefined,()=>console.warn('Merchant image could not be loaded:',shop.image));
    }
  }
}
refreshMerchantPins();addEventListener('storage',refreshMerchantPins);
const goals=PLACES.map(p=>project(p.lat,p.lon));const marker=new THREE.Mesh(new THREE.CylinderGeometry(4,4,.15,24),new THREE.MeshBasicMaterial({color:0x31f7a7}));marker.position.y=.15;marker.visible=false;scene.add(marker);
let speed=0,heading=0,mode=0,goal=null,money=0;const keys={gas:false,brake:false,left:false,right:false};const $=id=>document.getElementById(id);
$('mission').onclick=()=>{goal=goals[Number($('destination').value)].clone();marker.position.x=goal.x;marker.position.z=goal.z;marker.visible=true;$('status').textContent='ขับไปยังหมุดสีเขียว'};
$('camera').onclick=()=>{mode=1-mode;$('camera').textContent=mode?'📷 ภายนอก':'🚘 ห้องโดยสาร'};
$('reset').onclick=()=>{speed=heading=0;car.position.set(0,0,0);goal=null;marker.visible=false;$('status').textContent='เริ่มใหม่'};
const codes={KeyW:'gas',ArrowUp:'gas',KeyS:'brake',ArrowDown:'brake',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
addEventListener('keydown',e=>{if(codes[e.code]&&document.activeElement.tagName!=='SELECT'){keys[codes[e.code]]=true;e.preventDefault()}});
addEventListener('keyup',e=>{if(codes[e.code])keys[codes[e.code]]=false});
addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
document.querySelectorAll('[data-key]').forEach(b=>{const key=b.dataset.key;b.addEventListener('pointerdown',e=>{keys[key]=true;b.setPointerCapture(e.pointerId)});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys[key]=false)});
let last=performance.now();
function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;
speed+=((keys.gas?13:0)-(keys.brake?24:0))*dt;speed*=Math.pow((keys.gas || keys.brake) ? 0.999 : 0.982,dt*60);speed=THREE.MathUtils.clamp(speed,-7,30);
heading+=(Number(keys.left)-Number(keys.right))*dt*speed*.035;car.rotation.y=heading;car.position.x-=Math.sin(heading)*speed*dt;car.position.z-=Math.cos(heading)*speed*dt;
cab.visible=mode!==0;
wheel.rotation.z=THREE.MathUtils.lerp(wheel.rotation.z,(Number(keys.right)-Number(keys.left))*.55,Math.min(1,dt*8));
if(mode===0){ // driver's eyes inside the cabin, facing forward
  camera.position.copy(car.localToWorld(cockpitEye.clone()));
  camera.lookAt(car.localToWorld(cockpitTarget.clone()));
}else{
  const offset=new THREE.Vector3(0,7,13).applyAxisAngle(new THREE.Vector3(0,1,0),heading);
  camera.position.lerp(car.position.clone().add(offset),Math.min(1,dt*6));
  camera.lookAt(car.localToWorld(new THREE.Vector3(0,1,-12)));
}
if(goal){
  const dx=goal.x-car.position.x,dz=goal.z-car.position.z;
  const forward=new THREE.Vector3(-Math.sin(heading),0,-Math.cos(heading));
  const right=new THREE.Vector3(Math.cos(heading),0,-Math.sin(heading));
  const f=dx*forward.x+dz*forward.z,side=dx*right.x+dz*right.z;
  const direction=f<0?'↩ กลับรถ':Math.abs(side)<18?'↑ ตรงไป':side>0?'→ เลี้ยวขวา':'← เลี้ยวซ้าย';
  $('navigation').textContent=direction+' · '+Math.round(Math.hypot(dx,dz))+' ม.';
}else $('navigation').textContent='เลือกจุดหมายเพื่อเริ่มนำทาง';
if(goal){const distance=car.position.distanceTo(goal);$('status').textContent='ระยะถึงจุดหมาย '+Math.round(distance)+' เมตร';if(distance<14){goal=null;marker.visible=false;money+=120;$('status').textContent='🎉 ถึงจุดหมาย +120 บาท'}}
$('speed').textContent=Math.round(Math.abs(speed)*3.6)+' km/h';$('cash').textContent='฿'+money;renderer.render(scene,camera);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
