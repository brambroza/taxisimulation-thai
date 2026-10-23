import * as THREE from 'three';

// OpenStreetMap / Overpass: live public map geometry, not photorealistic imagery.
// A bounded Asok–Sukhumvit district keeps browser geometry manageable.
export const ORIGIN={lat:13.7379,lon:100.5605};
const RAD=Math.PI/180, METERS=111320;
export function project(lat,lon){return new THREE.Vector3((lon-ORIGIN.lon)*METERS*Math.cos(ORIGIN.lat*RAD),0,-(lat-ORIGIN.lat)*METERS)}
export const PLACES=[
  {name:'อโศก / Asok',lat:13.7379,lon:100.5605},
  {name:'Terminal 21',lat:13.7379,lon:100.5602},
  {name:'สวนเบญจสิริ',lat:13.7306,lon:100.5699},
  {name:'พร้อมพงษ์ / Phrom Phong',lat:13.7309,lon:100.5697}
];
const HIGHWAY_WIDTH={motorway:17,trunk:16,primary:14,secondary:12,tertiary:10,residential:7,service:5,unclassified:7,living_street:5,footway:2,pedestrian:3,path:1.8};
const mat=c=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide});
const roadMaterial=mat(0x3c4147),laneMaterial=mat(0xc7c5a8),buildingMaterials=[mat(0xb2aaa0),mat(0x9ba7ad),mat(0xbcb7ad),mat(0x8d999f)];
function roadSegment(a,b,width,group){
  const length=a.distanceTo(b);if(length<.4)return;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,length),roadMaterial);
  mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.position.y=.055;
  const base=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);
  const turn=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-Math.atan2(b.x-a.x,-(b.z-a.z)));
  mesh.quaternion.copy(turn.multiply(base));
  group.add(mesh);
  // Real-world street alignment from OSM; lane marking is an approximate visualization.
  if(width>=9){const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.16,Math.min(length*.78,24)),laneMaterial);stripe.position.copy(mesh.position);stripe.position.y=.065;stripe.quaternion.copy(mesh.quaternion);group.add(stripe)}
}
function building(nodes,way,group){
  const points=way.nodes.map(id=>nodes.get(id)).filter(Boolean);
  if(points.length<4||way.nodes[0]!==way.nodes[way.nodes.length-1])return;
  const outline=points.map(p=>project(p.lat,p.lon));
  const shape=new THREE.Shape();
  outline.forEach((p,i)=>i?shape.lineTo(p.x,-p.z):shape.moveTo(p.x,-p.z));
  const levels=parseFloat(way.tags['building:levels']);
  const h=Math.min(180,Math.max(4,Number.isFinite(parseFloat(way.tags.height))?parseFloat(way.tags.height):Number.isFinite(levels)?levels*3.2:12));
  try{
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,steps:1});
    geometry.rotateX(-Math.PI/2);
    const mesh=new THREE.Mesh(geometry,buildingMaterials[Math.abs(way.id)%buildingMaterials.length]);
    mesh.position.y=.06;group.add(mesh);
  }catch{}
}
function poiLabel(name){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(12,40,54,.93)';ctx.fillRect(0,0,512,128);
  ctx.fillStyle='#f8f8e7';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText(String(name).slice(0,24),256,81);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));
}
export async function loadAsokMap(scene,onStatus){
  const query='[out:json][timeout:35];(way["highway"](13.727,100.551,13.746,100.574);way["building"](13.727,100.551,13.746,100.574);node["shop"]["name"](13.727,100.551,13.746,100.574);node["amenity"]["name"](13.727,100.551,13.746,100.574););out body;>;out skel qt;';
  const url='https://overpass.kumi.systems/api/interpreter?data='+encodeURIComponent(query);
  onStatus('กำลังโหลดถนนและอาคารจริงจาก OpenStreetMap…');
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
  let json;
  try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);json=await response.json()}
  finally{clearTimeout(timeout)}
  const nodes=new Map(json.elements.filter(e=>e.type==='node').map(e=>[e.id,e]));
  const ways=json.elements.filter(e=>e.type==='way');
  const group=new THREE.Group();group.name='OSM Asok Sukhumvit';scene.add(group);
  let roads=0,buildings=0,pois=0;
  // Labels are based on OSM names; they are not verified to be up to date.
  const poiNodes=json.elements.filter(e=>e.type==='node'&&e.tags?.name&&(e.tags.shop||e.tags.amenity)).slice(0,120);
  for(const node of poiNodes){const p=project(node.lat,node.lon);const label=poiLabel(node.tags.name);label.position.set(p.x,8,p.z);label.scale.set(15,3.75,1);group.add(label);pois++}
  for(const way of ways){
    if(way.tags?.highway){
      const width=HIGHWAY_WIDTH[way.tags.highway];if(!width)continue;
      for(let i=1;i<way.nodes.length;i++){
        const a=nodes.get(way.nodes[i-1]),b=nodes.get(way.nodes[i]);
        if(a&&b){roadSegment(project(a.lat,a.lon),project(b.lat,b.lon),width,group);roads++}
      }
    }else if(way.tags?.building){building(nodes,way,group);buildings++}
  }
  onStatus('OSM: '+roads+' ช่วงถนน · '+buildings+' อาคาร · '+pois+' จุดร้าน/สถานที่ (ข้อมูล OSM อาจไม่ล่าสุด)');
  return {roads,buildings,pois,group};
}
