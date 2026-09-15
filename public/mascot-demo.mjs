import { createMusic } from './music.mjs?v=6f9757cadf1c';
import { character, react } from './mascot.mjs?v=backlog-3';
const moods=[['idle','Santai','Santai dulu.'],['wave','Menyapa','Hai! Siap bermain?'],['thinking','Berpikir','Hmm… periksa detailnya dulu.'],['happy','Benar','Nah, kamu jeli!'],['oops','Salah','Ups. Kita cek bareng, yuk.'],['encourage','Semangat','Yuk, kamu pasti bisa!'],['celebrate','Selebrasi','Tuntas! Kerja bagus.']];
const profiles = [
  { kind: 'stop', name: 'SI WASPADA', role: 'STOP OR GO · PERIKSA DULU', traits: 'Teliti · Kritis · Peduli', description: 'Si penjaga detail yang mengajak kita berhenti sejenak sebelum percaya. Ia membantu mengenali pesan mencurigakan, permintaan data pribadi, dan tanda penipuan.', message: 'Kalau ragu, STOP dulu!' },
  { kind: 'go', name: 'SI OPTIMIS', role: 'STOP OR GO · LANJUT DENGAN YAKIN', traits: 'Positif · Penasaran · Percaya diri', description: 'Si teman positif yang mengajak kita berani melanjutkan setelah memeriksa keamanannya. Bersama Si Waspada, ia menunjukkan bahwa keputusan aman perlu alasan yang jelas.', message: 'Sudah dicek? Yuk, lanjut!' },
  { kind: 'act', name: 'SI SIGAP', role: 'ACT FAST · BERTINDAK TEPAT', traits: 'Tenang · Tanggap · Solutif', description: 'Si teman andalan saat masalah sudah terjadi. Ia mengajak kita tetap tenang, mengamankan akun, menyimpan bukti, dan mencari bantuan melalui kanal resmi sesuai situasi.', message: 'Tenang dulu. Ambil langkah tepat!' },
];
document.querySelector('.cast').innerHTML = profiles.map(p => `<article>${character(p.kind)}<h2>${p.name}</h2><p class="profile-role">${p.role}</p><p class="profile-traits">${p.traits}</p><p class="profile-description">${p.description}</p><p class="profile-message">“${p.message}”</p></article>`).join('');
document.querySelector('#moods').innerHTML=moods.map(([id,label])=>`<button data-mood="${id}" aria-pressed="false">${label}</button>`).join('');
let index=0,timer;
function select(id){index=moods.findIndex(m=>m[0]===id);document.querySelectorAll('.toon').forEach(el=>react(el,id));document.querySelectorAll('[data-mood]:is(button)').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.mood===id)));document.querySelector('#caption').textContent=moods[index][2];}
function stop(){clearInterval(timer);timer=null;document.querySelector('#auto').setAttribute('aria-pressed','false');}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.mood){stop();select(b.dataset.mood);}if(b.id==='auto'){if(timer)stop();else{document.body.classList.remove('paused');document.querySelector('#pause').setAttribute('aria-pressed','false');timer=setInterval(()=>select(moods[(index+1)%moods.length][0]),4000);b.setAttribute('aria-pressed','true');}}if(b.id==='pause'){const paused=document.body.classList.toggle('paused');b.setAttribute('aria-pressed',String(paused));if(paused)stop();}if(b.id==='fullscreen'){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{document.querySelector('#caption').textContent='Gunakan mode layar penuh browser.';}}});select('idle');

const musicButton = document.createElement('button');
musicButton.id = 'music';
document.querySelector('.controls:last-child').append(musicButton);
let musicEnabled = true;
const music = createMusic(() => {
  musicButton.textContent = !musicEnabled ? 'Nyalakan musik' : music.audio.paused ? 'Putar musik' : 'Matikan musik';
  musicButton.setAttribute('aria-pressed', String(musicEnabled && !music.audio.paused));
});
musicButton.addEventListener('click', () => {
  if (!music.audio.paused) musicEnabled = false;
  else musicEnabled = true;
  music.setEnabled(musicEnabled);
});
music.sync();

document.querySelector('#variant').addEventListener('click', event => {
  const stick = event.target.getAttribute('aria-pressed') !== 'true';
  document.querySelectorAll('.toon').forEach(el => el.classList.toggle('stick', stick));
  event.target.setAttribute('aria-pressed', String(stick));
  event.target.textContent = stick ? 'Tangan stik (alternatif)' : 'Tangan lengkung (awal)';
});
