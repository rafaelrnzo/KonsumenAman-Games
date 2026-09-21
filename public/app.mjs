import { createMusic } from './music.mjs?v=backlog-3';
import { character, react } from './mascot.mjs?v=backlog-3';
import { stopScenarios, actScenarios, responses, inboxMessages, callScenario, redFlagRounds, qrScenarios, reportScenarios, settings } from './content.mjs';
import { shuffle, makeBag, assess, scoreAct, formatTime } from './engine.mjs';
import { gameAudio } from './audio.mjs?v=fanfare-6';
import { abandonPlay, completePlay, createParticipant, createPlay, getBooth, saveAction } from './booth-api.mjs';

const screen = document.querySelector('#screen');
const kiosk = document.querySelector('#kiosk');
const announcement = document.querySelector('#announcement');
const nextAct = makeBag(actScenarios);
const icon = name => `<svg aria-hidden="true"><use href="./assets/icons.svg#${name}"></use></svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const boothId = new URLSearchParams(location.search).get('boothId')?.trim() || '';
let booth = { phase: 'loading', data: null, message: '' };
let participant = null;
let participantRequestId = null;
let pendingPlay = null;
let pendingActions = [];
let actionFlush = Promise.resolve();
let state = { view: 'home', game: null };
let lastInput = performance.now(), enteredAt = performance.now(), completeTimer;
let sound = true;
const music = createMusic(updateMusicButton);
function updateMusicButton() {
  const button = document.querySelector('[data-action="music"]');
  if (!button) return;
  const playing = sound && !music.audio.paused;
  button.textContent = !sound ? 'Musik mati · Nyalakan' : playing ? '♫ Musik aktif' : '♫ Putar musik';
  button.setAttribute('aria-pressed', String(playing));
}
function syncMusic() {
  const menuMusic = ['home', 'intro', 'act-scenario'].includes(state.view);
  music.setEnabled(sound && menuMusic);
  gameAudio.setEnabled(sound);
  gameAudio.setMusicEnabled(sound && !menuMusic && !document.hidden);
}

function button(label, action, secondary = false) {
  return `<button class="button${secondary ? ' secondary' : ''}" data-action="${action}">${label}${icon('ArrowRight')}</button>`;
}
function header() {
  return `<header class="brand-header"><button class="brand-home" data-action="home" aria-label="Kembali ke pilihan game"><img src="./assets/logo-konsumen-aman-white.png" width="193" height="63" alt="Konsumen Aman"></button><span class="booth-title">${booth.data ? escape(booth.data.name) : ''}</span></header>`;
}
function footer() {
  return `<footer class="game-footer"><span>KALAU RAGU, <b>STOP DULU!</b></span><span>${icon('HandPalm')} SENTUH & MAIN</span></footer>`;
}
function nav(label, extra = '') {
  return `<div class="game-nav"><button class="back-button" data-action="home" aria-label="Kembali ke pilihan game" title="Pilihan game">${icon('ArrowLeft')}</button><span class="game-name">${label}</span>${extra || `<button class="reset-button" data-action="reset" aria-label="Mulai ulang sesi">${icon('ArrowCounterClockwise')}</button>`}</div>`;
}
function host(line, mood = '') {
  return `<div class="host-line">${character(state.game === 'act' ? 'act' : 'stop', mood)}<p>${line}</p></div>`;
}
const ALL_GAME_KEYS = ['stop-or-go', 'act-fast', 'inbox-phishing', 'telepon-bodong', 'cari-red-flag', 'anti-qris-palsu', 'cara-lapor'];
const GAME_KEY_BY_ID = { stop: 'stop-or-go', act: 'act-fast', inbox: 'inbox-phishing', call: 'telepon-bodong', redflag: 'cari-red-flag', qris: 'anti-qris-palsu', report: 'cara-lapor' };
const GAME_INTROS = {
  stop: { nav: 'STOP OR GO DECISION', eyebrow: 'STOP OR GO • 5 RONDE', lead: 'Baca situasi, lalu pilih STOP atau GO.', cta: 'MULAI MAIN!', mascot: 'stop' },
  act: { nav: 'ACT FAST CHALLENGE', eyebrow: 'ACT FAST • 1 INSIDEN', lead: 'Baca kasus, lalu temukan semua tindakan tepat.', cta: 'LIHAT KASUS!', mascot: 'act' },
  inbox: { nav: 'INBOX PHISHING', eyebrow: 'INBOX PHISHING • 6 PESAN', lead: 'Baca tiap pesan, lalu pilih PENIPUAN atau AMAN.', cta: 'MULAI MAIN!', mascot: 'stop' },
  call: { nav: 'TELEPON BODONG', eyebrow: 'TELEPON BODONG • 1 PANGGILAN', lead: 'Hadapi penelepon mencurigakan dan ambil langkah paling aman.', cta: 'ANGKAT TANTANGAN!', mascot: 'stop' },
  redflag: { nav: 'CARI RED FLAG', eyebrow: 'CARI RED FLAG • 3 PESAN', lead: 'Sentuh semua frasa yang menunjukkan taktik penipuan.', cta: 'MULAI MENCARI!', mascot: 'act' },
  qris: { nav: 'ANTI QRIS PALSU', eyebrow: 'ANTI QRIS PALSU • 5 LOKASI', lead: 'Periksa merchant dan nominal sebelum memilih bayar atau berhenti.', cta: 'MULAI PERIKSA!', mascot: 'stop' },
  report: { nav: 'CARA LAPOR', eyebrow: 'CARA LAPOR • 4 KASUS', lead: 'Pilih jalur penanganan dan pelaporan yang tepat.', cta: 'MULAI BANTU!', mascot: 'act' },
};
function enabledGames() {
  const games = booth.data?.games;
  return Array.isArray(games) && games.length ? games : ALL_GAME_KEYS;
}
function home() {
  return `<section class="home-view"><div class="home-hero"><p class="eyebrow">${participant ? `MAIN LAGI, ${escape(participant.nickname).toUpperCase()}?` : 'SELAMAT DATANG DI TEMPAT UJI INSTING'}</p><h1 tabindex="-1">Hmm…<br>YAKIN <span>AMAN?</span></h1><p>${state.preparing ? 'Menyiapkan permainan...' : participant ? 'Pilih game berikutnya. Identitas pemain tetap dipakai.' : 'Kelihatannya gampang.<br>Coba dulu, baru bilang.'}</p>${state.error ? `<p class="booth-error" role="alert">${escape(state.error)}</p>` : ''}</div><div class="home-games">
  <button class="game-choice stop-choice" data-action="choose-stop"${enabledGames().includes('stop-or-go') ? '' : ' hidden'}><span class="cabinet-label">01 / SI PALING WASPADA</span><span class="choice-title">STOP <i>or</i> GO</span><span class="character-scene">${character('stop', 'wave')}<span class="speech-scribble">Bentar.<br>Ini beneran?</span>${character('go')}</span><span class="choice-description">Insting bilang gas. Detailnya bilang apa?</span><span class="choice-meta">5 SITUASI <span>1 KEPUTUSAN TIAP RONDE</span></span><span class="start-strip">COBA INSTINGMU ${icon('ArrowRight')}</span></button>
  <button class="game-choice act-choice" data-action="choose-act"${enabledGames().includes('act-fast') ? '' : ' hidden'}><span class="cabinet-label">02 / SI PALING SIGAP</span><span class="choice-title">ACT FAST!</span><span class="character-scene">${character('act', 'thinking')}<span class="speech-scribble">Waduh.<br>Terus gimana?!</span><span class="loose-prop prop-one">${icon('LockKey')}</span><span class="loose-prop prop-two">${icon('FolderOpen')}</span></span><span class="choice-description">Sudah kejadian. Kamu mau ngapain?</span><span class="choice-meta">1 INSIDEN <span>CARI SEMUA AKSI TEPAT</span></span><span class="start-strip">AKU BISA HANDLE ${icon('ArrowRight')}</span></button>
  <button class="game-choice inbox-choice" data-action="choose-inbox"${enabledGames().includes('inbox-phishing') ? '' : ' hidden'}><span class="cabinet-label">03 / SI PALING JELI</span><span class="choice-title">INBOX PHISHING</span><span class="character-scene">${character('stop', 'thinking')}<span class="speech-scribble">Pesan ini<br>beneran atau bukan?</span><span class="loose-prop prop-one">${icon('EnvelopeSimple')}</span><span class="loose-prop prop-two">${icon('ShieldCheck')}</span></span><span class="choice-description">Pilah pesan penipu dari pesan wajar.</span><span class="choice-meta">6 PESAN <span>1 KEPUTUSAN TIAP PESAN</span></span><span class="start-strip">AKU JELI ${icon('ArrowRight')}</span></button>
  <button class="game-choice compact-choice call-choice" data-action="choose-call"${enabledGames().includes('telepon-bodong') ? '' : ' hidden'}><span class="cabinet-label">04 / SI PALING TENANG</span><span class="choice-icon">${icon('Phone')}</span><span class="choice-title">TELEPON BODONG</span><span class="choice-description">Tolak tekanan dari penelepon palsu.</span><span class="choice-meta">1 PANGGILAN <span>1 KEPUTUSAN</span></span><span class="start-strip">HADAPI PANGGILAN ${icon('ArrowRight')}</span></button>
  <button class="game-choice compact-choice redflag-choice" data-action="choose-redflag"${enabledGames().includes('cari-red-flag') ? '' : ' hidden'}><span class="cabinet-label">05 / SI PALING TELITI</span><span class="choice-icon">${icon('Warning')}</span><span class="choice-title">CARI RED FLAG</span><span class="choice-description">Temukan frasa berbahaya dalam pesan.</span><span class="choice-meta">3 PESAN <span>12 RED FLAG</span></span><span class="start-strip">CARI TANDANYA ${icon('ArrowRight')}</span></button>
  <button class="game-choice compact-choice qris-choice" data-action="choose-qris"${enabledGames().includes('anti-qris-palsu') ? '' : ' hidden'}><span class="cabinet-label">06 / SI PALING CERMAT</span><span class="choice-icon">${icon('QrCode')}</span><span class="choice-title">ANTI QRIS PALSU</span><span class="choice-description">Cocokkan penerima dan nominal.</span><span class="choice-meta">5 LOKASI <span>BAYAR ATAU STOP</span></span><span class="start-strip">PERIKSA QRIS ${icon('ArrowRight')}</span></button>
  <button class="game-choice compact-choice report-choice" data-action="choose-report"${enabledGames().includes('cara-lapor') ? '' : ' hidden'}><span class="cabinet-label">07 / SI PALING SIAP</span><span class="choice-icon">${icon('Flag')}</span><span class="choice-title">CARA LAPOR</span><span class="choice-description">Pilih kanal bantuan yang tepat.</span><span class="choice-meta">4 KASUS <span>3 PILIHAN</span></span><span class="start-strip">BANTU LAPORKAN ${icon('ArrowRight')}</span></button>
  </div><div class="menu-extras"><button data-action="music" class="back-button">♫ Putar musik</button></div></section>`;
}
function boothStatus() {
  const states = {
    loading: ['MENYIAPKAN SESI', 'Tunggu sebentar', 'Kami sedang memeriksa link booth ini.'],
    invalid: ['LINK TIDAK VALID', 'Sesi Game tidak ditemukan', 'Minta operator memindai QR Sesi Game lagi.'],
    scheduled: ['SESI TERJADWAL', booth.data?.name || 'Sesi belum dimulai', booth.message || 'Permainan akan tersedia saat jadwal event dimulai.'],
    closed: ['SESI DITUTUP', booth.data?.name || 'Permainan tidak tersedia', booth.message || 'Minta operator membuka Sesi Game dari Portal.'],
    finished: ['SESI SELESAI', booth.data?.name || 'Event sudah selesai', 'Permainan baru tidak dapat dimulai dari link ini.'],
    error: ['KONEKSI BERMASALAH', 'Sesi belum dapat dibuka', booth.message || 'Periksa koneksi lalu coba lagi.'],
  };
  const content = states[booth.phase] || states.error;
  return `<section class="booth-state"><div class="completion-seal">${icon(booth.phase === 'loading' ? 'Timer' : 'Info')}</div><p class="eyebrow">${content[0]}</p><h1 tabindex="-1">${escape(content[1])}</h1><p>${escape(content[2])}</p>${booth.phase === 'error' ? '<button class="button" data-action="retry-bootstrap">COBA LAGI</button>' : ''}</section>`;
}
function intro() {
  const copy = GAME_INTROS[state.game];
  return `${nav(copy.nav)}<section class="intro-view name-view"><div class="intro-copy"><p class="eyebrow">${copy.eyebrow}</p><h1 tabindex="-1">SIAPA<br><span>NAMAMU?</span></h1><p class="lead">${copy.lead}</p><form id="player-form"><label for="player-name">Nama panggilan</label><input id="player-name" name="playerName" type="text" required maxlength="30" autocomplete="off" enterkeyhint="go" aria-describedby="name-note" placeholder="Tulis namamu di sini"><p id="name-note">Nama panggilan ini disimpan bersama hasil permainan untuk Sesi Game ini.</p><p id="form-error" class="booth-error" role="alert"></p><button class="button" type="submit">${copy.cta}${icon('ArrowRight')}</button></form></div><div class="name-mascot">${character(copy.mascot, 'wave')}</div></section>`;
}
function caseCard(s) {
  return `<div class="case-card"><div class="case-channel">${icon(s.icon)}<span>${escape(s.channel)}</span></div><div class="case-sender"><span class="sender-icon">${icon(s.icon)}</span><div><b>${escape(s.sender)}</b><span>Situasi simulasi</span></div></div><blockquote>${escape(s.message)}</blockquote><div class="case-bottom"><span>${icon('Info')} Perhatikan detail sebelum memilih</span></div></div>`;
}
function stopFeedback(s, correct) {
  return `<dialog id="answer-feedback" class="answer-feedback" aria-labelledby="feedback-title"><button class="feedback-close" data-action="close-feedback" aria-label="Kembali ke situasi">${icon('X')}</button><div class="feedback-scroll"><div class="feedback-mascot">${character('stop', correct ? 'happy' : 'oops')}</div><p class="eyebrow">${correct ? 'JAWABAN BENAR' : 'JAWABAN BELUM TEPAT'}</p><h2 id="feedback-title" tabindex="-1">${correct ? 'NAH, BETUL!' : 'EH, TUNGGU…'}</h2><div class="round-reaction ${correct ? 'hit' : 'miss'}">${correct ? '+1 KEPUTUSAN TEPAT' : 'YUK, KENALI TANDA-TANDANYA'}</div><div class="decision-verdict ${s.answer}">${icon(s.answer === 'stop' ? 'HandPalm' : 'CheckCircle')}<span>Keputusan yang tepat: <b>${s.answer === 'stop' ? 'STOP' : 'GO'}</b></span></div><p class="reason">${escape(s.reason)}</p><div class="learning-point"><b>${s.answer === 'stop' ? 'Tanda bahaya' : 'Yang sudah diperiksa'}</b><p>${escape(s.checkpoint)}</p></div><div class="learning-point"><b>Langkah aman</b><p>${escape(s.action)}</p></div>${button(state.index === state.rounds.length - 1 ? 'Lihat hasilku' : 'RONDE BERIKUTNYA', 'next-stop')}</div></dialog>`;
}
function stopPlay() {
  const s = state.rounds[state.index];
  const answered = state.answer !== null;
  const correct = state.answer === s.answer;
  return `${nav('STOP OR GO DECISION', `<span class="round-count">TEPAT <b>${state.correct}</b> / ${state.rounds.length}</span>`)}<div class="round-track" aria-label="Progres situasi">${state.rounds.map((_, i) => `<span class="${i < state.index ? 'done' : i === state.index ? 'current' : ''}">${i < state.index ? icon('Check') : i + 1}</span>`).join('')}</div><section class="decision-view asking">${host(answered ? 'Yuk, pahami alasannya.' : 'Baca detailnya dulu, ya.', answered ? 'idle' : 'thinking')}${caseCard(s)}<div class="decision-copy"><p class="eyebrow">RONDE ${state.index + 1} • APA KEPUTUSANMU?</p><h1 tabindex="-1">${escape(s.title)}</h1><p class="lead">${escape(s.question)}</p>${answered ? button('Lihat penjelasan', 'open-feedback') : `<div class="decision-buttons"><button class="decision stop" data-action="answer" data-value="stop">${icon('HandPalm')}<b>STOP</b><span>Ada yang janggal!</span></button><button class="decision go" data-action="answer" data-value="go">${icon('ArrowRight')}<b>GO</b><span>Aman? Gas!</span></button></div><p class="decision-hint">Bukan soal cepat. Yang penting, tepat.</p>`}</div></section>${answered ? stopFeedback(s, correct) : ''}`;
}
function openFeedback() {
  const dialog = document.querySelector('#answer-feedback');
  if (!dialog) return;
  dialog.showModal();
  dialog.querySelector('#feedback-title').focus({ preventScroll: true });
  document.body.classList.add('feedback-open');
  dialog.addEventListener('close', () => {
    document.body.classList.remove('feedback-open');
    screen.querySelector('[data-action="open-feedback"]')?.focus({ preventScroll: true });
  }, { once: true });
}
function inboxCard(m) {
  return caseCard({ icon: m.channel === 'WhatsApp' ? 'ChatCircleText' : 'EnvelopeSimple', channel: `${m.channel} • ${m.waktu}`, sender: m.sender, message: m.isi });
}
function inboxFeedback(m, correct) {
  return `<dialog id="inbox-feedback" class="answer-feedback" aria-labelledby="inbox-feedback-title"><button class="feedback-close" data-action="close-inbox-feedback" aria-label="Kembali ke pesan">${icon('X')}</button><div class="feedback-scroll"><div class="feedback-mascot">${character('stop', correct ? 'happy' : 'oops')}</div><p class="eyebrow">${correct ? 'PENILAIAN BENAR' : 'PENILAIAN BELUM TEPAT'}</p><h2 id="inbox-feedback-title" tabindex="-1">${correct ? 'NAH, BETUL!' : 'EH, TUNGGU…'}</h2><div class="round-reaction ${correct ? 'hit' : 'miss'}">${correct ? '+1 PESAN TEPAT' : 'YUK, PERIKSA LAGI'}</div><div class="decision-verdict ${m.scam ? 'stop' : 'go'}">${icon(m.scam ? 'Flag' : 'CheckCircle')}<span>Pesan ini seharusnya: <b>${m.scam ? 'PENIPUAN' : 'AMAN'}</b></span></div><p class="reason">${escape(m.alasan)}</p>${button(state.index === state.rounds.length - 1 ? 'Lihat hasilku' : 'PESAN BERIKUTNYA', 'next-inbox')}</div></dialog>`;
}
function inboxPlay() {
  const m = state.rounds[state.index];
  const answered = state.answer !== null;
  const correct = state.answer === (m.scam ? 'report' : 'safe');
  return `${nav('INBOX PHISHING', `<span class="round-count">TEPAT <b>${state.correct}</b> / ${state.rounds.length}</span>`)}<div class="round-track" aria-label="Progres pesan">${state.rounds.map((_, i) => `<span class="${i < state.index ? 'done' : i === state.index ? 'current' : ''}">${i < state.index ? icon('Check') : i + 1}</span>`).join('')}</div><section class="decision-view asking">${host(answered ? 'Yuk, pahami alasannya.' : 'Periksa pengirim dan isinya dulu, ya.', answered ? 'idle' : 'thinking')}${inboxCard(m)}<div class="decision-copy"><p class="eyebrow">PESAN ${state.index + 1} • PENIPUAN ATAU AMAN?</p><h1 tabindex="-1">${escape(m.sender)}</h1><p class="lead">${escape(m.isi)}</p>${answered ? button('Lihat penjelasan', 'open-inbox-feedback') : `<div class="decision-buttons"><button class="decision stop" data-action="inbox-answer" data-value="report">${icon('Flag')}<b>PENIPUAN</b><span>Laporkan pesan ini</span></button><button class="decision go" data-action="inbox-answer" data-value="safe">${icon('CheckCircle')}<b>AMAN</b><span>Pesan wajar</span></button></div><p class="decision-hint">Cek domain, pengirim, dan permintaan datanya.</p>`}</div></section>${answered ? inboxFeedback(m, correct) : ''}`;
}
function openInboxFeedback() {
  const dialog = document.querySelector('#inbox-feedback');
  if (!dialog) return;
  dialog.showModal();
  dialog.querySelector('#inbox-feedback-title').focus({ preventScroll: true });
  document.body.classList.add('feedback-open');
  dialog.addEventListener('close', () => {
    document.body.classList.remove('feedback-open');
    screen.querySelector('[data-action="open-inbox-feedback"]')?.focus({ preventScroll: true });
  }, { once: true });
}
function actScenario() {
  const s = state.scenario;
  return `${nav('ACT FAST CHALLENGE')}<section class="act-scenario"><div class="incident-visual">${character('act', 'surprised')}<span class="incident-bubble">Oke. Tarik napas dulu.</span></div><div class="scenario-copy"><p class="eyebrow">MISI KAMU KALI INI</p><h1 tabindex="-1">${escape(s.title)}</h1><p class="lead">${escape(s.text)}</p><div class="ready-note">${icon('Timer')}<p>Baca dulu dengan tenang. Timer baru dimulai setelah kamu menekan <b>Saya siap</b>.</p></div>${button('SAYA SIAP!', 'ready')}</div></section>`;
}
function actPlay() {
  const s = state.scenario;
  return `${nav('ACT FAST CHALLENGE')}<section class="response-view"><aside class="response-context"><span class="incident-small">${icon(s.icon)}</span><h1 tabindex="-1">${escape(s.title)}</h1><p>${escape(s.text)}</p><div class="timer-panel"><span>${icon('Timer')} WAKTU BERJALAN</span><div><b id="timer">0.0</b><span>detik</span></div><small>Tanpa batas waktu. Tetap jeli!</small></div></aside><div class="response-main"><div class="response-heading">${host('Oke, bantu aku beresin ini!', 'thinking')}<h2>LANGKAH KAMU?</h2><p>Pilih semua tindakan yang diperlukan dalam situasi ini.</p></div><div class="power-cells" aria-hidden="true">${s.required.map(() => '<span></span>').join('')}</div><div class="response-progress"><span id="progress">0 dari ${s.required.length} tindakan tepat ditemukan</span><span id="wrong-count">0 salah</span></div><div class="response-grid">${state.responseOrder.map(id => { const r = responses.find(r => r.id === id); return `<button class="response-tile" data-action="respond" data-value="${r.id}"><span class="tile-icon">${icon(r.icon)}</span><b>${r.label}</b><span class="tile-state">PILIH AKSI INI</span><span class="tile-mark"></span></button>`; }).join('')}</div><p id="response-feedback" class="response-feedback" role="status">Ada ${s.required.length} tindakan tepat. Temukan semuanya.</p></div></section>`;
}
function progressTrack(total) {
  return `<div class="round-track" aria-label="Progres permainan">${Array.from({ length: total }, (_, i) => `<span class="${i < state.index ? 'done' : i === state.index ? 'current' : ''}">${i < state.index ? icon('Check') : i + 1}</span>`).join('')}</div>`;
}
function callPlay() {
  const connected = state.stage === 'connected';
  return `${nav('TELEPON BODONG')}<section class="solo-game"><div class="solo-card call-card"><span class="solo-icon">${icon(connected ? 'PhoneCall' : 'Phone')}</span><p class="eyebrow">${connected ? 'PANGGILAN TERSAMBUNG' : 'PANGGILAN MASUK'}</p><h1 tabindex="-1">${escape(callScenario.caller)}</h1><p class="solo-subtitle">${escape(callScenario.claim)}</p><blockquote>${escape(callScenario.message)}</blockquote>${connected ? `<p class="solo-hint">Penelepon terus menekan agar kamu bertindak cepat. Apa keputusanmu?</p><div class="decision-buttons"><button class="decision stop" data-action="call-decision" data-value="hang-up">${icon('X')}<b>TUTUP</b><span>Verifikasi lewat kanal resmi</span></button><button class="decision go" data-action="call-decision" data-value="continue">${icon('PhoneCall')}<b>LANJUT</b><span>Dengarkan permintaannya</span></button></div>` : `<p class="solo-hint">Nomor belum tersimpan. Kamu tidak wajib mengangkatnya.</p><div class="decision-buttons"><button class="decision stop" data-action="call-decision" data-value="reject">${icon('X')}<b>TOLAK</b><span>Hentikan sebelum tersambung</span></button><button class="decision go" data-action="call-answer">${icon('Phone')}<b>TERIMA</b><span>Dengarkan isi panggilan</span></button></div>`}</div></section>`;
}
function redFlagPlay() {
  const round = redFlagRounds[state.index];
  const flags = round.tokens.filter(token => token.flag);
  const foundHere = flags.filter(token => state.found.includes(token.actionKey)).length;
  return `${nav('CARI RED FLAG', `<span class="round-count">DITEMUKAN <b>${state.found.length}</b> / 12</span>`)}${progressTrack(redFlagRounds.length)}<section class="solo-game"><div class="solo-card message-card"><div class="message-head"><span>${icon('ChatCircleText')}</span><div><b>${escape(round.profileName)}</b><small>${escape(round.number)} · ${escape(round.channel)}</small></div></div><p class="token-message">${round.tokens.map((token, index) => `<button data-action="redflag-token" data-value="${index}" class="token-button${token.actionKey && state.found.includes(token.actionKey) ? ' found' : ''}"${token.actionKey && state.found.includes(token.actionKey) ? ' disabled' : ''}>${escape(token.text)}</button>`).join('')}</p></div><aside class="solo-panel"><p class="eyebrow">RONDE ${state.index + 1} DARI ${redFlagRounds.length}</p><h1 tabindex="-1">TEMUKAN<br><span>4 RED FLAG</span></h1><p>Sentuh frasa yang berisi klaim palsu, desakan, atau permintaan berisiko.</p><div class="flag-progress"><b>${foundHere}/4</b><span>ditemukan di pesan ini</span></div>${state.feedback ? `<div class="inline-feedback ${state.feedback.correct ? 'correct' : 'wrong'}" role="status"><b>${state.feedback.correct ? 'Tepat!' : 'Belum tepat'}</b><p>${escape(state.feedback.text)}</p></div>` : ''}${foundHere === flags.length ? button(state.index === redFlagRounds.length - 1 ? 'LIHAT HASIL' : 'PESAN BERIKUTNYA', 'next-redflag') : ''}</aside></section>`;
}
function qrisPlay() {
  const scenario = qrScenarios[state.index];
  const answered = state.answer !== null;
  const rupiah = value => `Rp${value.toLocaleString('id-ID')}`;
  return `${nav('ANTI QRIS PALSU', `<span class="round-count">TEPAT <b>${state.correct}</b> / ${qrScenarios.length}</span>`)}${progressTrack(qrScenarios.length)}<section class="solo-game"><div class="solo-card qris-card"><span class="solo-icon">${icon('QrCode')}</span><p class="eyebrow">LOKASI ${state.index + 1}</p><h1 tabindex="-1">${escape(scenario.location)}</h1><p>${escape(scenario.detail)}</p><dl><div><dt>Nama penerima</dt><dd>${escape(scenario.merchant)}</dd></div><div><dt>Nominal tampil</dt><dd>${rupiah(scenario.amount)}</dd></div><div><dt>Tagihan</dt><dd>${rupiah(scenario.expected)}</dd></div></dl></div><aside class="solo-panel"><p class="eyebrow">APA KEPUTUSANMU?</p><h1>${answered ? (state.answer === (scenario.safe ? 'pay' : 'stop') ? 'TEPAT!' : 'PERIKSA LAGI') : 'BAYAR<br><span>ATAU STOP?</span>'}</h1>${answered ? `<div class="inline-feedback ${state.answer === (scenario.safe ? 'pay' : 'stop') ? 'correct' : 'wrong'}"><p>${escape(scenario.explanation)}</p></div>${button(state.index === qrScenarios.length - 1 ? 'LIHAT HASIL' : 'LOKASI BERIKUTNYA', 'next-qris')}` : `<p>Pastikan penerima dan nominal sesuai konteks transaksi.</p><div class="decision-buttons"><button class="decision stop" data-action="qris-answer" data-value="stop">${icon('HandPalm')}<b>STOP</b><span>Jangan bayar</span></button><button class="decision go" data-action="qris-answer" data-value="pay">${icon('CheckCircle')}<b>BAYAR</b><span>Lanjutkan transaksi</span></button></div>`}</aside></section>`;
}
function reportPlay() {
  const scenario = reportScenarios[state.index];
  const answered = state.answer !== null;
  const correct = Number(state.answer) === scenario.correctIndex;
  return `${nav('CARA LAPOR', `<span class="round-count">TEPAT <b>${state.correct}</b> / ${reportScenarios.length}</span>`)}${progressTrack(reportScenarios.length)}<section class="solo-game"><div class="solo-card report-card"><div class="message-head"><span>${icon('ChatCircleText')}</span><div><b>${escape(scenario.sender)}</b><small>${escape(scenario.fraudType)}</small></div></div><blockquote>${escape(scenario.message)}</blockquote></div><aside class="solo-panel report-panel"><p class="eyebrow">KASUS ${state.index + 1} DARI ${reportScenarios.length}</p><h1 tabindex="-1">BANTU PILIH<br><span>LANGKAH TEPAT</span></h1>${answered ? `<div class="inline-feedback ${correct ? 'correct' : 'wrong'}"><b>${correct ? 'Tepat!' : 'Belum tepat'}</b><p>${escape(scenario.explanation)}</p></div>${button(state.index === reportScenarios.length - 1 ? 'LIHAT HASIL' : 'KASUS BERIKUTNYA', 'next-report')}` : `<div class="report-options">${scenario.choices.map((choice, index) => `<button data-action="report-answer" data-value="${index}"><span>${index + 1}</span>${escape(choice)}</button>`).join('')}</div>`}</aside></section>`;
}
function completion() {
  return `<section class="completion-view">${confetti()}<div class="finish-mascot">${character('act', 'celebrate')}</div><div class="completion-seal">${icon('Check')}</div><p class="eyebrow">SEMUA TINDAKAN TEPAT DITEMUKAN</p><h1 tabindex="-1">MISSION<br><span>COMPLETE!</span></h1><p>Waktu berhenti di <b>${formatTime(state.elapsed)} detik</b>.</p></section>`;
}
function savePanelHtml(showDebrief) {
  const saveState = state.saveState || 'saving';
  if (saveState === 'failed') return `<div class="save-panel failed"><b>Hasil belum tersimpan</b><p>${escape(state.saveError || 'Periksa koneksi lalu kirim ulang.')}</p><div class="result-actions"><button class="button" data-action="retry-complete">KIRIM ULANG${icon('ArrowRight')}</button><button class="button secondary" data-action="force-reset">RESET PAKSA</button></div></div>`;
  if (saveState === 'saved') return `<div class="save-panel saved"><b>${icon('CheckCircle')} Hasil tersimpan</b><p>Skor sudah masuk ke Sesi Game ${escape(booth.data.name)}.</p>${showDebrief ? '<button class="button secondary debrief-button" data-action="debrief">LIHAT PENJELASAN</button>' : ''}<div class="result-actions"><button class="button" data-action="repeat-player">MAIN LAGI${icon('ArrowRight')}</button><button class="button secondary" data-action="next-player">PEMAIN BERIKUTNYA</button></div></div>`;
  return '<div class="save-panel saving"><b>Menyimpan hasil...</b><p>Tunggu konfirmasi sebelum melanjutkan.</p></div>';
}
function inboxResult() {
  const displayedScore = state.savedScore ?? state.correct;
  return `${nav('INBOX PHISHING')}<section class="result-view stop-result">${confetti(48)}<div class="result-heading"><div class="finish-mascot">${character('stop', state.correct < state.rounds.length ? 'encourage' : 'celebrate')}</div><div class="result-seal">${icon('ShieldCheck')}</div><p class="eyebrow">TANTANGAN SELESAI, ${escape(state.playerName)}!</p><h1 tabindex="-1">INBOX<br><span>SELESAI!</span></h1><p>Setiap pesan adalah latihan untuk dunia nyata.</p><div class="stop-score"><strong>${displayedScore}<span> / ${state.rounds.length}</span></strong><p>pesan tepat</p></div></div><div class="result-details"><div class="learning-point"><b>Sebelum percaya</b><p>Periksa pengirim, domain tautan, dan permintaan datanya. Kalau ragu, jangan klik dan jangan balas.</p></div>${savePanelHtml(false)}${state.saveState === 'saved' ? '<p class="auto-reset">Pemain berikutnya dalam <span id="reset-count">45</span> detik.</p>' : ''}</div></section>`;
}
function simpleResult() {
  const details = {
    call: { nav: 'TELEPON BODONG', title: 'PANGGILAN<br><span>SELESAI!</span>', total: 1, unit: 'keputusan tepat', lesson: callScenario.explanation },
    redflag: { nav: 'CARI RED FLAG', title: 'SEMUA TANDA<br><span>DITEMUKAN!</span>', total: 12, unit: 'red flag ditemukan', lesson: 'Klaim identitas, hadiah mendadak, biaya di depan, tekanan waktu, tautan asing, dan permintaan OTP adalah tanda bahaya.' },
    qris: { nav: 'ANTI QRIS PALSU', title: 'QRIS<br><span>DIPERIKSA!</span>', total: qrScenarios.length, unit: 'keputusan tepat', lesson: 'Cocokkan nama penerima dan nominal, lalu konfirmasi kepada petugas atau kasir sebelum membayar.' },
    report: { nav: 'CARA LAPOR', title: 'SIAP<br><span>MELAPOR!</span>', total: reportScenarios.length, unit: 'kasus tepat', lesson: 'Simpan bukti, hubungi penyedia jasa secepatnya, dan gunakan kanal pelaporan resmi sesuai jenis masalah.' },
  }[state.game];
  const localScore = state.game === 'redflag' ? state.found.length : state.correct;
  const displayedScore = state.savedScore ?? localScore;
  return `${nav(details.nav)}<section class="result-view stop-result">${confetti(48)}<div class="result-heading"><div class="finish-mascot">${character(state.game === 'report' ? 'act' : 'stop', displayedScore < details.total ? 'encourage' : 'celebrate')}</div><div class="result-seal">${icon('ShieldCheck')}</div><p class="eyebrow">TANTANGAN SELESAI, ${escape(state.playerName)}!</p><h1 tabindex="-1">${details.title}</h1><div class="stop-score"><strong>${displayedScore}<span> / ${details.total}</span></strong><p>${details.unit}</p></div></div><div class="result-details"><div class="learning-point"><b>Bekal utama</b><p>${escape(details.lesson)}</p></div>${savePanelHtml(false)}${state.saveState === 'saved' ? '<p class="auto-reset">Pemain berikutnya dalam <span id="reset-count">45</span> detik.</p>' : ''}</div></section>`;
}
function result() {
  if (state.game === 'inbox') return inboxResult();
  if (!['stop', 'act'].includes(state.game)) return simpleResult();
  const isStop = state.game === 'stop';
  const stats = isStop ? null : assess(state.scenario.required, state.chosen);
  const score = isStop ? null : scoreAct(state.elapsed, stats.wrong, state.scenario.targetTime);
  const displayedScore = isStop ? state.savedScore ?? state.correct : state.savedScore ?? score.score;
  const savePanel = savePanelHtml(!isStop);
  return `${nav(isStop ? 'STOP OR GO DECISION' : 'ACT FAST CHALLENGE')}<section class="result-view ${isStop ? 'stop-result' : ''}">${confetti(isStop ? 64 : 16)}<div class="result-heading"><div class="finish-mascot">${character(state.game, isStop && state.correct < 3 ? 'encourage' : 'celebrate')}</div><div class="result-seal">${icon('ShieldCheck')}</div><p class="eyebrow">TANTANGAN SELESAI, ${escape(state.playerName)}!</p><h1 tabindex="-1">${isStop ? 'RONDE<br><span>SELESAI!</span>' : 'AKSI<br><span>TUNTAS!</span>'}</h1><p>${isStop ? 'Setiap keputusan adalah kesempatan untuk belajar.' : 'Kamu menemukan semua tindakan yang diperlukan.'}</p>${isStop ? `<div class="stop-score"><strong>${displayedScore}<span> / ${state.rounds.length}</span></strong><p>keputusan tepat</p></div>` : ''}</div><div class="result-details">${isStop ? '<div class="learning-point"><b>Ingat sebelum bertindak</b><p>Periksa identitas, penerima, nominal, dan tujuan. Jika ada yang meragukan, berhenti dan verifikasi melalui kanal resmi.</p></div>' : `<div class="badge-label">${icon('Trophy')}${score.badge}</div><div class="result-stats"><div><span>BENAR</span><b>${stats.correct}<small> / ${state.scenario.required.length}</small></b></div><div><span>SALAH</span><b>${stats.wrong}</b></div><div><span>WAKTU</span><b>${formatTime(state.elapsed)}<small> dtk</small></b></div><div class="score-stat"><span>SKOR</span><b>${displayedScore}</b></div></div>`}${savePanel}${state.saveState === 'saved' ? '<p class="auto-reset">Pemain berikutnya dalam <span id="reset-count">45</span> detik.</p>' : ''}</div></section>`;
}
function debrief() {
  const s = state.scenario;
  return `${nav('ACT FAST CHALLENGE')}<section class="debrief-view"><div class="debrief-heading"><p class="eyebrow">BEKAL UNTUK DUNIA NYATA</p><h1 tabindex="-1">BAWA PULANG<br><span>ILMUNYA!</span></h1><p class="lead">${escape(s.explanation)}</p></div><div class="action-recap">${s.required.map(id => {const r = responses.find(r => r.id === id); return `<div>${icon(r.icon)}<section><h2>${r.label}</h2><p>${r.detail}</p></section>${icon('CheckCircle')}</div>`;}).join('')}</div><div class="debrief-end"><p>Kalau ragu, STOP dulu.<br><b>Kalau sudah terjadi, bertindak tepat.</b></p><button id="finish" class="button" data-action="home" disabled>Selesai <span id="debrief-count">(5)</span>${icon('ArrowRight')}</button></div><p class="auto-reset">Kembali ke awal dalam <span id="reset-count">45</span> detik.</p></section>`;
}
function render() {
  document.body.classList.remove('feedback-open');
  const views = { home, intro, 'stop-play': stopPlay, 'inbox-play': inboxPlay, 'act-scenario': actScenario, 'act-play': actPlay, 'call-play': callPlay, 'redflag-play': redFlagPlay, 'qris-play': qrisPlay, 'report-play': reportPlay, completion, result, debrief };
  screen.innerHTML = header() + (booth.phase === 'active' ? views[state.view]() : boothStatus()) + footer();
  screen.dataset.view = state.view;
  screen.dataset.game = state.game || 'home';
  window.scrollTo(0, 0);
  kiosk.scrollTop = 0;
  screen.querySelector('h1')?.focus({ preventScroll: true });
  enteredAt = performance.now();
  syncMusic();
  if (booth.phase === 'active' && state.view === 'result') reportScore();
  if (state.view === 'intro') screen.querySelector('#player-name').focus({ preventScroll: true });
}
function resetHome({ clearParticipant = true, abandon = true } = {}) {
  clearTimeout(completeTimer);
  if (abandon && state.playId && state.saveState !== 'saved') {
    void abandonPlay(boothId, state.playId).catch(() => {});
  }
  if (clearParticipant) {
    participant = null;
    participantRequestId = null;
  }
  pendingPlay = null;
  pendingActions = [];
  actionFlush = Promise.resolve();
  state = { view: 'home', game: null };
  history.replaceState(null, '', location.pathname + location.search);
  render();
}
function goHome() {
  resetHome();
}
async function beginPlay(game, player) {
  const scenario = game === 'act' ? (pendingPlay?.game === game ? pendingPlay.scenario : nextAct()) : null;
  const rounds = game === 'stop'
    ? (pendingPlay?.game === game ? pendingPlay.rounds : shuffle(stopScenarios).slice(0, settings.stopCount))
    : game === 'inbox'
      ? (pendingPlay?.game === game ? pendingPlay.rounds : shuffle(inboxMessages))
      : null;
  pendingPlay = pendingPlay?.game === game ? pendingPlay : { game, scenario, rounds, requestId: crypto.randomUUID() };
  state = { view: 'home', game: null, preparing: true };
  render();
  try {
    const created = await createPlay(boothId, {
      participantId: player.participantId,
      gameKey: GAME_KEY_BY_ID[game],
      ...(scenario ? { scenarioKey: scenario.id } : {}),
      requestId: pendingPlay.requestId,
    });
    pendingActions = [];
    actionFlush = Promise.resolve();
    const shared = { game, playerName: player.nickname, playId: created.playId, saveState: 'playing' };
    if (game === 'stop') state = { ...shared, view: 'stop-play', rounds, index: 0, answer: null, correct: 0 };
    else if (game === 'inbox') state = { ...shared, view: 'inbox-play', rounds, index: 0, answer: null, correct: 0 };
    else if (game === 'act') state = { ...shared, view: 'act-scenario', scenario };
    else if (game === 'call') state = { ...shared, view: 'call-play', stage: 'ringing', correct: 0 };
    else if (game === 'redflag') state = { ...shared, view: 'redflag-play', index: 0, found: [], feedback: null };
    else if (game === 'qris') state = { ...shared, view: 'qris-play', index: 0, answer: null, correct: 0 };
    else state = { ...shared, view: 'report-play', index: 0, answer: null, correct: 0 };
    pendingPlay = null;
    tone(true);
    render();
  } catch (error) {
    state = { view: 'home', game: null, error: error instanceof Error ? error.message : 'Permainan belum dapat dimulai.' };
    render();
  }
}
function choose(game) {
  if (!enabledGames().includes(GAME_KEY_BY_ID[game])) return;
  clearTimeout(completeTimer);
  if (participant) {
    void beginPlay(game, participant);
    return;
  }
  state = { view: 'intro', game };
  tone(true);
  history.replaceState(null, '', `#${game}`);
  render();
}
async function sendPendingActions() {
  while (pendingActions.length) {
    const action = pendingActions[0];
    try {
      await saveAction(boothId, state.playId, action);
    } catch {
      await new Promise(resolve => setTimeout(resolve, 300));
      await saveAction(boothId, state.playId, action);
    }
    pendingActions.shift();
  }
}
function reportAction(actionKey, value) {
  pendingActions.push({
    gameKey: GAME_KEY_BY_ID[state.game],
    actionKey,
    ...(value === undefined ? {} : { value }),
  });
  actionFlush = actionFlush.catch(() => {}).then(sendPendingActions);
}
async function reportScore(force = false) {
  if (!state.playId || state.saveState === 'saved' || (state.completeStarted && !force)) return;
  state.completeStarted = true;
  state.saveState = 'saving';
  if (force) render();
  try {
    await actionFlush;
    await sendPendingActions();
    const result = await completePlay(boothId, state.playId);
    state.savedScore = result.score;
    state.saveState = 'saved';
    state.saveError = null;
  } catch (error) {
    state.saveState = 'failed';
    state.saveError = error instanceof Error ? error.message : 'Hasil belum dapat disimpan.';
  }
  render();
}
function confetti(count = 16) {
  return `<div class="confetti" aria-hidden="true">${Array.from({ length: count }, (_, i) => `<i style="--i:${i};--x:${(i * 37 + 3) % 100}%;--delay:${(i * 137) % 1000}ms;--fall:${80 + (i * 23) % 65}%;--drift:${(i % 2 ? 1 : -1) * (30 + (i * 13) % 90)}px"></i>`).join('')}</div>`;
}
function tone(correct, celebrate = false, finish = false, reward = false) {
  if (!sound) return;
  if (!gameAudio.feedback(correct, celebrate, finish, reward || celebrate || finish)) announcement.textContent = 'Suara tidak tersedia pada perangkat ini.';
}
function respond(id, tile) {
  if (state.view !== 'act-play' || state.chosen.includes(id) || !responses.some(r => r.id === id)) return;
  reportAction(id);
  state.chosen.push(id);
  const correct = state.scenario.required.includes(id);
  const stats = assess(state.scenario.required, state.chosen);
  tile.disabled = true;
  tile.classList.add(correct ? 'correct' : 'wrong');
  tile.querySelector('.tile-state').textContent = correct ? 'AKSI TEPAT!'  : id === 'R1' ? 'Tidak diperlukan di kasus ini' : 'Coba pilihan lain';
  tile.querySelector('.tile-mark').innerHTML = icon(correct ? 'CheckCircle' : 'X');
  document.querySelector('#progress').textContent = `${stats.correct} dari ${state.scenario.required.length} tindakan tepat ditemukan`;
  document.querySelector('#wrong-count').textContent = `${stats.wrong} salah`;
  document.querySelector('#response-feedback').textContent = correct ? 'Tepat. Cari tindakan lain yang diperlukan.' : id === 'R1' ? 'Dalam kasus ini, tidak ada akses akun atau perangkat yang disebut terpapar. Cari tindakan lain.' : 'Pilihan ini dapat menambah risiko. Coba tindakan lain.';
  document.querySelectorAll('.power-cells span').forEach((cell, i) => cell.classList.toggle('charged', i < stats.correct));
  const popup = document.createElement('span');
  popup.className = `hit-popup ${correct ? 'hit' : 'miss'}`;
  popup.textContent = correct ? '+1 TEPAT' : '−75 POIN';
  tile.append(popup);
  setTimeout(() => popup.remove(), 800);
  const hostLine = document.querySelector('.host-line p');
  if (hostLine) hostLine.textContent = correct ? (stats.complete ? 'Beres! Kamu tahu harus apa.' : `Sip! Masih ada ${state.scenario.required.length - stats.correct} lagi.`) : 'Waduh, coba langkah lain.';
  react(document.querySelector('.host-line .toon'), correct ? 'happy' : 'oops');
  if (!stats.complete) tone(correct, correct);
  if (stats.complete) {
    state.elapsed = performance.now() - state.started;
    state.view = 'completion';
    tone(true, true, true); render();
    completeTimer = setTimeout(() => { state.view = 'result'; render(); }, 1200);
  }
}
document.addEventListener('submit', async event => {
  if (event.target.id !== 'player-form' || state.view !== 'intro') return;
  event.preventDefault();
  const input = event.target.elements.playerName;
  const playerName = input.value.trim();
  input.setCustomValidity(playerName ? '' : 'Isi nama panggilanmu dulu.');
  if (!event.target.reportValidity()) return;
  const submit = event.target.querySelector('[type="submit"]');
  const error = event.target.querySelector('#form-error');
  submit.disabled = true;
  submit.textContent = 'MENYIAPKAN...';
  error.textContent = '';
  participantRequestId ||= crypto.randomUUID();
  try {
    participant = await createParticipant(boothId, playerName, participantRequestId);
    await beginPlay(state.game, participant);
  } catch (caught) {
    error.textContent = caught instanceof Error ? caught.message : 'Peserta belum dapat dibuat.';
    submit.disabled = false;
    submit.innerHTML = `${GAME_INTROS[state.game]?.cta || 'MULAI MAIN!'}${icon('ArrowRight')}`;
  }
});
document.addEventListener('input', event => {
  lastInput = performance.now();
  if (event.target.id === 'player-name') event.target.setCustomValidity('');
});
document.addEventListener('click', event => {
  const target = event.target.closest('button[data-action]');
  if (!target || target.disabled) return;
  const { action, value } = target.dataset;
  if (action === 'choose-stop') choose('stop');
  if (action === 'choose-act') choose('act');
  if (action === 'choose-inbox') choose('inbox');
  if (action === 'choose-call') choose('call');
  if (action === 'choose-redflag') choose('redflag');
  if (action === 'choose-qris') choose('qris');
  if (action === 'choose-report') choose('report');
  if (action === 'home') {
    if (['stop-play', 'inbox-play', 'act-play', 'act-scenario', 'call-play', 'redflag-play', 'qris-play', 'report-play', 'completion'].includes(state.view)) document.querySelector('#reset-dialog').showModal();
    else goHome();
  }
  if (action === 'reset') document.querySelector('#reset-dialog').showModal();
  if (action === 'cancel-reset') {
    document.querySelector('#reset-dialog').close();
    document.querySelector('#reset-dialog p').textContent = 'Permainan aktif akan ditandai sebagai ditinggalkan dan identitas pemain di layar akan dihapus.';
  }
  if (action === 'confirm-reset') {
    document.querySelector('#reset-dialog').close();
    document.querySelector('#reset-dialog p').textContent = 'Permainan aktif akan ditandai sebagai ditinggalkan dan identitas pemain di layar akan dihapus.';
    goHome();
  }
  if (action === 'retry-complete') void reportScore(true);
  if (action === 'repeat-player') resetHome({ clearParticipant: false, abandon: false });
  if (action === 'next-player') resetHome({ clearParticipant: true, abandon: false });
  if (action === 'force-reset') {
    document.querySelector('#reset-dialog p').textContent = 'Hasil yang belum terkirim dapat hilang. Lanjutkan reset paksa?';
    document.querySelector('#reset-dialog').showModal();
  }
  if (action === 'retry-bootstrap') void bootstrap();
  if (action === 'answer' && state.view === 'stop-play' && state.answer === null) {
    reportAction(state.rounds[state.index].id, value);
    state.answer = value;
    const correct = value === state.rounds[state.index].answer;
    if (correct) state.correct++;
    tone(correct, false, false, true); render(); openFeedback();
  }
  if (action === 'open-feedback') openFeedback();
  if (action === 'close-feedback') document.querySelector('#answer-feedback')?.close();
  if (action === 'inbox-answer' && state.view === 'inbox-play' && state.answer === null) {
    const current = state.rounds[state.index];
    reportAction(current.id, value);
    state.answer = value;
    const correct = value === (current.scam ? 'report' : 'safe');
    if (correct) state.correct++;
    tone(correct, false, false, true); render(); openInboxFeedback();
  }
  if (action === 'open-inbox-feedback') openInboxFeedback();
  if (action === 'close-inbox-feedback') document.querySelector('#inbox-feedback')?.close();
  if (action === 'next-inbox' && state.view === 'inbox-play' && state.answer !== null) {
    if (state.index === state.rounds.length - 1) {
      state.view = 'result';
      tone(true, true, true);
    }
    else { state.index++; state.answer = null; }
    render();
  }
  if (action === 'next-stop' && state.view === 'stop-play' && state.answer !== null) {
    if (state.index === state.rounds.length - 1) {
      state.view = 'result';
      tone(true, true, true);
    }
    else { state.index++; state.answer = null; }
    render();
  }
  if (action === 'call-answer' && state.view === 'call-play' && state.stage === 'ringing') {
    state.stage = 'connected';
    tone(true);
    render();
  }
  if (action === 'call-decision' && state.view === 'call-play') {
    reportAction('decision', value);
    state.correct = ['reject', 'hang-up'].includes(value) ? 1 : 0;
    state.view = 'result';
    tone(Boolean(state.correct), Boolean(state.correct), true);
    render();
  }
  if (action === 'redflag-token' && state.view === 'redflag-play') {
    const token = redFlagRounds[state.index].tokens[Number(value)];
    if (!token) return;
    if (token.flag && !state.found.includes(token.actionKey)) {
      state.found.push(token.actionKey);
      reportAction(token.actionKey, 'flag');
      state.feedback = { correct: true, text: token.why };
      tone(true, true, false, true);
    } else if (!token.flag) {
      state.feedback = { correct: false, text: 'Frasa ini belum menunjukkan taktik penipuan. Cari klaim identitas, tekanan, tautan, atau permintaan data.' };
      tone(false);
    }
    render();
  }
  if (action === 'next-redflag' && state.view === 'redflag-play') {
    if (state.index === redFlagRounds.length - 1) {
      state.view = 'result';
      tone(true, true, true);
    } else {
      state.index++;
      state.feedback = null;
    }
    render();
  }
  if (action === 'qris-answer' && state.view === 'qris-play' && state.answer === null) {
    const scenario = qrScenarios[state.index];
    state.answer = value;
    reportAction(scenario.id, value);
    const correct = value === (scenario.safe ? 'pay' : 'stop');
    if (correct) state.correct++;
    tone(correct, false, false, true);
    render();
  }
  if (action === 'next-qris' && state.view === 'qris-play' && state.answer !== null) {
    if (state.index === qrScenarios.length - 1) {
      state.view = 'result';
      tone(true, true, true);
    } else {
      state.index++;
      state.answer = null;
    }
    render();
  }
  if (action === 'report-answer' && state.view === 'report-play' && state.answer === null) {
    const scenario = reportScenarios[state.index];
    state.answer = value;
    reportAction(scenario.id, value);
    const correct = Number(value) === scenario.correctIndex;
    if (correct) state.correct++;
    tone(correct, false, false, true);
    render();
  }
  if (action === 'next-report' && state.view === 'report-play' && state.answer !== null) {
    if (state.index === reportScenarios.length - 1) {
      state.view = 'result';
      tone(true, true, true);
    } else {
      state.index++;
      state.answer = null;
    }
    render();
  }
  if (action === 'ready' && state.view === 'act-scenario') {
    // Distribute actions across the grid; keep this order stable between cases.
    state.responseOrder = ['R1', 'R5', 'R6', 'R3', 'R7', 'R2', 'R4', 'R8'];
    state.chosen = []; state.view = 'act-play'; tone(true); render(); state.started = performance.now(); reportAction('ready');
  }
  if (action === 'respond') respond(value, target);
  if (action === 'debrief' && state.view === 'result') { state.view = 'debrief'; render(); }
  if (action === 'layout') {
    kiosk.dataset.layout = value;
    document.querySelectorAll('[data-action="layout"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  }
  if (action === 'about') document.querySelector('#about').showModal();
  if (action === 'close-dialog') document.querySelector('#about').close();
  if (action === 'music') {
    if (!sound) document.querySelector('[data-action="sound"]').click();
    syncMusic();
  }
  if (action === 'sound') {
    sound = !sound; target.setAttribute('aria-pressed', String(sound));
    target.setAttribute('aria-label', sound ? 'Matikan suara' : 'Nyalakan suara');
    target.innerHTML = icon(sound ? 'SpeakerHigh' : 'SpeakerSlash');
    syncMusic();
    if (sound) tone(true);
  }
  if (action === 'fullscreen') {
    const promise = document.fullscreenElement ? document.exitFullscreen() : kiosk.requestFullscreen?.();
    promise?.catch(() => { announcement.textContent = 'Layar penuh tidak tersedia. Gunakan pengaturan layar penuh browser.'; });
  }
});
document.addEventListener('pointerdown', () => { lastInput = performance.now(); gameAudio.unlock(); });
document.addEventListener('visibilitychange', syncMusic);
document.addEventListener('keydown', event => {
  lastInput = performance.now();
  if (event.key === 'Escape' && !document.querySelector('dialog[open]') && state.view !== 'home') document.querySelector('#reset-dialog').showModal();
});
window.addEventListener('hashchange', () => { const game = location.hash.slice(1); if (Object.hasOwn(GAME_KEY_BY_ID, game)) choose(game); else goHome(); });
setInterval(() => {
  const now = performance.now();
  if (state.view === 'act-play') document.querySelector('#timer').textContent = formatTime(now - state.started);
  if (state.view === 'result' && state.saveState === 'saved') {
    const remaining = Math.max(0, Math.ceil((settings.resultResetMs - now + enteredAt) / 1000));
    const counter = document.querySelector('#reset-count');
    if (counter) counter.textContent = remaining;
    if (!remaining && !document.querySelector('dialog[open]')) {
      resetHome({ clearParticipant: true, abandon: false });
      return;
    }
  }
  if (state.view === 'debrief') {
    const remaining = Math.max(0, Math.ceil((settings.debriefMs - now + enteredAt) / 1000));
    document.querySelector('#debrief-count').textContent = remaining ? `(${remaining})` : '';
    document.querySelector('#finish').disabled = remaining > 0;
  }
  if (state.view !== 'home' && now - lastInput >= settings.abandonMs) {
    document.querySelectorAll('dialog[open]').forEach(d => d.close()); goHome();
  }
}, 100);
async function bootstrap() {
  booth = { phase: 'loading', data: null, message: '' };
  render();
  if (!boothId) {
    booth = { phase: 'invalid', data: null, message: '' };
    render();
    return;
  }
  try {
    const data = await getBooth(boothId);
    const phase = data.status === 'ACTIVE'
      ? 'active'
      : data.status === 'SCHEDULED'
        ? 'scheduled'
        : data.status === 'FINISHED'
          ? 'finished'
          : 'closed';
    const schedule = data.event?.startsAt ? `Mulai ${new Date(data.event.startsAt).toLocaleString('id-ID')}.` : '';
    booth = { phase, data, message: phase === 'scheduled' ? schedule : '' };
    if (phase === 'active') {
      const initial = location.hash.slice(1);
      if (Object.hasOwn(GAME_KEY_BY_ID, initial)) choose(initial);
      else resetHome({ clearParticipant: true, abandon: false });
    } else render();
  } catch (error) {
    booth = {
      phase: error?.status === 404 ? 'invalid' : 'error',
      data: null,
      message: error instanceof Error ? error.message : 'Sesi belum dapat diperiksa.',
    };
    render();
  }
}
void bootstrap();
