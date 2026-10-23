import * as THREE from 'three';
import './style.css';
const root=document.querySelector('#app');
root.innerHTML='<div id="hud"><b>🚕 BANGKOK DRIVE 3D</b><div id="speed">0 km/h</div><div id="cash">฿0</div><select id="destination"><option value="0">Terminal 21</option><option value="1">Siam</option><option value="2">Rama IX</option></select><button id="mission">เริ่มภารกิจ</button><p id="status">ขับรถเที่ยวกรุงเทพฯ</p></div><div id="controls"><button data-key="left">◀</button><button data-key="right">▶</button><button data-key="brake">เบรก</button><button data-key="gas">เร่ง ▲</button></div><div id="tools"><button id="camera">📷 กล้อง</button><button id="reset">↻ รีเซ็ต</button></div><div id="credit">Bangkok-inspired procedural city · 3D prototype</div>';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x98c5e5);scene.fog=new THREE.Fog(0x98c5e5,160,650);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1400);
scene.add(new THREE.HemisphereLight(0xffffff,0x516779,2.5));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(80,160,100);scene.add(light);
const material=c=>new THREE.MeshLambertMaterial({color:c});
const grass=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),material(0x65866d));grass.rotation.x=-Math.PI/2;grass.position.y=-.03;scene.add(grass);
const roadMat=material(0x343c45),white=material(0xe9e6d5),facades=[material(0xa9b7c0),material(0x8297a5),material(0xc6b4a2),material(0x9ba8b1)];
function road(x,z,w,h){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),roadMat);m.rotation.x=-Math.PI/2;m.position.set(x,.01,z);scene.add(m)}
for(let n=-5;n<=5;n++){road(n*95,0,15,1100);road(0,n*95,1100,15)}
for(let n=-5;n<=5;n++)for(let z=-500;z<=500;z+=24){const m=new THREE.Mesh(new THREE.PlaneGeometry(.18,10),white);m.rotation.x=-Math.PI/2;m.position.set(n*95,.02,z);scene.add(m)}
for(let n=-5;n<=5;n++)for(let x=-500;x<=500;x+=24){const m=new THREE.Mesh(new THREE.PlaneGeometry(10,.18),white);m.rotation.x=-Math.PI/2;m.position.set(x,.02,n*95);scene.add(m)}
for(let x=-5;x<5;x++)for(let z=-5;z<5;z++)for(let i=0;i<3;i++){const w=15+i*4,h=12+Math.abs((x*19+z*23+i*31)%90),d=17+i*3;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),facades[Math.abs(x+z+i)%facades.length]);m.position.set(x*95+22+i*20,h/2,z*95+23+(i%2)*30);scene.add(m)}
const car=new THREE.Group();const chassis=new THREE.Mesh(new THREE.BoxGeometry(2.2,.8,4.3),material(0xf0d23e));chassis.position.y=.8;car.add(chassis);const cab=new THREE.Mesh(new THREE.BoxGeometry(1.75,.75,2.1),material(0x34566e));cab.position.set(0,1.52,-.25);car.add(cab);for(const x of [-1.08,1.08])for(const z of [-1.4,1.4]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.22,12),material(0x16191f));w.rotation.z=Math.PI/2;w.position.set(x,.43,z);car.add(w)}const sign=new THREE.Mesh(new THREE.BoxGeometry(.8,.28,.45),material(0xffffff));sign.position.y=2.02;car.add(sign);scene.add(car);
const goals=[new THREE.Vector3(95,0,-190),new THREE.Vector3(-190,0,-285),new THREE.Vector3(285,0,-95)];const marker=new THREE.Mesh(new THREE.CylinderGeometry(4,4,.15,24),new THREE.MeshBasicMaterial({color:0x31f7a7}));marker.position.y=.15;marker.visible=false;scene.add(marker);
let speed=0,heading=0,mode=0,goal=null,money=0;const keys={gas:false,brake:false,left:false,right:false};const $=id=>document.getElementById(id);
$('mission').onclick=()=>{goal=goals[Number($('destination').value)].clone();marker.position.x=goal.x;marker.position.z=goal.z;marker.visible=true;$('status').textContent='ขับไปยังหมุดสีเขียว'};
$('camera').onclick=()=>mode=1-mode;
$('reset').onclick=()=>{speed=heading=0;car.position.set(0,0,0);goal=null;marker.visible=false;$('status').textContent='เริ่มใหม่'};
const codes={KeyW:'gas',ArrowUp:'gas',KeyS:'brake',ArrowDown:'brake',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
addEventListener('keydown',e=>{if(codes[e.code]&&document.activeElement.tagName!=='SELECT'){keys[codes[e.code]]=true;e.preventDefault()}});
addEventListener('keyup',e=>{if(codes[e.code])keys[codes[e.code]]=false});
addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
document.querySelectorAll('[data-key]').forEach(b=>{const key=b.dataset.key;b.addEventListener('pointerdown',e=>{keys[key]=true;b.setPointerCapture(e.pointerId)});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys[key]=false)});
let last=performance.now();
function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;
speed+=((keys.gas?13:0)-(keys.brake?24:0))*dt;speed*=Math.pow(keys.gas||keys.brake?.999:.982,dt*60);speed=THREE.MathUtils.clamp(speed,-7,30);
heading+=(Number(keys.left)-Number(keys.right))*dt*speed*.035;car.rotation.y=heading;car.position.x-=Math.sin(heading)*speed*dt;car.position.z-=Math.cos(heading)*speed*dt;
const offset=new THREE.Vector3(0,mode?2.5:7,mode?1:13).applyAxisAngle(new THREE.Vector3(0,1,0),heading);camera.position.lerp(car.position.clone().add(offset),Math.min(1,dt*6));camera.lookAt(car.position.clone().add(new THREE.Vector3(0,1,-12).applyAxisAngle(new THREE.Vector3(0,1,0),heading)));
if(goal){const distance=car.position.distanceTo(goal);$('status').textContent='ระยะถึงจุดหมาย '+Math.round(distance)+' เมตร';if(distance<14){goal=null;marker.visible=false;money+=120;$('status').textContent='🎉 ถึงจุดหมาย +120 บาท'}}
$('speed').textContent=Math.round(Math.abs(speed)*3.6)+' km/h';$('cash').textContent='฿'+money;renderer.render(scene,camera);requestAnimationFrame(frame)}
requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
