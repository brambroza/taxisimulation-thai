import './merchant.css';
const app=document.querySelector('#merchant-app');
const KEY='bkk-digital-twin-merchants-v1';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}};
const save=items=>localStorage.setItem(KEY,JSON.stringify(items));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
const items=read();
app.innerHTML=`<header><a href="/">← กลับไปเกม</a><h1>🏪 Bangkok Digital Twin · Merchant Portal</h1><p>Phase 1: ต้นแบบจัดการร้านบนแผนที่จริง (ข้อมูลบันทึกเฉพาะ Browser นี้)</p></header>
<main><section><h2>เพิ่ม / อัปเดตข้อมูลร้าน</h2><form id="shop-form">
<label>ชื่อร้าน<input name="name" required maxlength="100" placeholder="ชื่อร้าน"></label>
<label>ประเภทร้าน<select name="category"><option>ร้านอาหาร</option><option>คาเฟ่</option><option>ร้านค้า</option><option>บริการ</option><option>อื่น ๆ</option></select></label>
<label>Latitude<input name="lat" type="number" step="any" min="13.70" max="13.78" required value="13.7379"></label>
<label>Longitude<input name="lon" type="number" step="any" min="100.52" max="100.60" required value="100.5605"></label>
<label>รายละเอียด<textarea name="description" maxlength="500" placeholder="เวลาเปิดทำการ โปรโมชั่น หรือข้อมูลร้าน"></textarea></label>
<label>URL รูปถ่ายหน้าร้านจริง (HTTPS)<input name="image" type="url" placeholder="https://..."></label>
<label>ทิศที่หน้าร้านหัน (องศา)<input name="facing" type="number" min="0" max="359" step="1" value="0"></label>
<p class="hint">ใช้เฉพาะภาพที่คุณมีสิทธิ์เผยแพร่และเปิดให้เว็บภายนอกโหลดได้ ภาพจะแสดงเป็นแผ่นภาพในฉาก 3D ไม่ใช่โมเดลอาคารจริง</p>
<button type="submit">บันทึกร้าน (Demo)</button></form></section>
<section><h2>ร้านที่บันทึกไว้ <small>(${items.length})</small></h2><div id="shops">${items.length?items.map((s,i)=>`<article><h3>${escape(s.name)}</h3><p>${escape(s.category)} · ${s.lat.toFixed(5)}, ${s.lon.toFixed(5)}</p><p>${escape(s.description)}</p><button data-delete="${i}">ลบ</button></article>`).join(''):'<p>ยังไม่มีร้านที่บันทึก</p>'}</div></section>
<section><h2>📢 ระบบโฆษณา (เตรียมเชื่อม Backend)</h2><p>โครงสร้างรองรับการยืนยันเจ้าของร้าน การอนุมัติป้ายโฆษณา ตำแหน่งแสดงผล ระยะเวลา และการชำระเงินใน Phase ถัดไป</p><p><strong>ยังไม่เปิดรับเงินหรือแสดงโฆษณาจริง</strong></p></section></main>`;
document.querySelector('#shop-form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.target);const lat=Number(d.get('lat')),lon=Number(d.get('lon'));if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
const item={name:String(d.get('name')).trim(),category:String(d.get('category')),lat,lon,description:String(d.get('description')).trim(),image:String(d.get('image')).trim(),facing:Number(d.get('facing'))||0,createdAt:new Date().toISOString()};
const list=read();list.push(item);save(list);render()};
document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{const list=read();list.splice(Number(b.dataset.delete),1);save(list);render()});
}render();