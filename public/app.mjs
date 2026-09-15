import { createMusic } from './music.mjs?v=audio-10';
import { character, react } from './mascot.mjs';
import { stopScenarios, actScenarios, responses, settings } from './content.mjs';
import { shuffle, makeBag, assess, scoreAct, formatTime } from './engine.mjs';
import { gameAudio } from './audio.mjs?v=audio-10';

const screen = document.querySelector('#screen');
const kiosk = document.querySelector('#kiosk');
const announcement = document.querySelector('#announcement');
const nextAct = makeBag(actScenarios);
const icon = name => `<svg aria-hidden="true"><use href="./assets/icons.svg#${name}"></use></svg>`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
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
  const inGame = state.view !== 'home';
  music.setEnabled(sound && !inGame);
  gameAudio.setEnabled(sound);
  gameAudio.setMusicEnabled(sound && inGame && !document.hidden);
}

function button(label, action, secondary = false) {
  return `<button class="button${secondary ? ' secondary' : ''}" data-action="${action}">${label}${icon('ArrowRight')}</button>`;
}
function header() {
  return `<header class="brand-header"><button class="brand-home" data-action="home" aria-label="Kembali ke pilihan game"><img src="./assets/bank-indonesia.svg" width="188" height="34" alt="Bank Indonesia"></button><span class="arcade-wordmark">GAME ZONE</span></header>`;
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
function home() {
  return `<section class="home-view"><div class="home-hero"><p class="eyebrow">SELAMAT DATANG DI TEMPAT UJI INSTING</p><h1 tabindex="-1">Hmm…<br>YAKIN <span>AMAN?</span></h1><p>Kelihatannya gampang.<br>Coba dulu, baru bilang.</p></div><div class="home-games">
  <button class="game-choice stop-choice" data-action="choose-stop"><span class="cabinet-label">01 / SI PALING WASPADA</span><span class="choice-title">STOP <i>or</i> GO</span><span class="character-scene">${character('stop', 'wave')}<span class="speech-scribble">Bentar.<br>Ini beneran?</span>${character('go')}</span><span class="choice-description">Insting bilang gas. Detailnya bilang apa?</span><span class="choice-meta">5 SITUASI <span>1 KEPUTUSAN TIAP RONDE</span></span><span class="start-strip">COBA INSTINGMU ${icon('ArrowRight')}</span></button>
  <button class="game-choice act-choice" data-action="choose-act"><span class="cabinet-label">02 / SI PALING SIGAP</span><span class="choice-title">ACT FAST!</span><span class="character-scene">${character('act', 'thinking')}<span class="speech-scribble">Waduh.<br>Terus gimana?!</span><span class="loose-prop prop-one">${icon('LockKey')}</span><span class="loose-prop prop-two">${icon('FolderOpen')}</span></span><span class="choice-description">Sudah kejadian. Kamu mau ngapain?</span><span class="choice-meta">1 INSIDEN <span>CARI SEMUA AKSI TEPAT</span></span><span class="start-strip">AKU BISA HANDLE ${icon('ArrowRight')}</span></button>
  </div><div class="menu-extras"><button data-action="music" class="back-button">♫ Putar musik</button></div></section>`;
}
function intro() {
  const isStop = state.game === 'stop';
  return `${nav(isStop ? 'STOP OR GO DECISION' : 'ACT FAST CHALLENGE')}<section class="intro-view"><div class="intro-copy"><p class="eyebrow">${isStop ? 'STOP OR GO • 5 RONDE' : 'ACT FAST • 1 INSIDEN'}</p><h1 tabindex="-1">${isStop ? 'GAS ATAU<br><span>REM DULU?</span>' : 'PANIK?<br><span>NANTI DULU.</span>'}</h1><p class="lead">${isStop ? 'Tidak semua situasi berbahaya. Bisakah kamu membedakan kapan harus berhenti dan kapan aman melanjutkan?' : 'Saat insiden sudah terjadi, satu tindakan belum tentu cukup. Temukan semua langkah yang tepat.'}</p>${button(isStop ? 'AYO MAIN!' : 'SIAP, LIHAT KASUS!' , 'start')}</div><div class="intro-guide"><div class="intro-cast">${character(isStop ? 'stop' : 'act')}</div><ol><li><span>01</span><div><b>Baca situasinya</b><p>${isStop ? 'Hadapi 5 situasi sehari-hari.' : 'Satu insiden dipilih secara acak.'}</p></div></li><li><span>02</span><div><b>${isStop ? 'Pilih STOP atau LANJUT' : 'Temukan 3-4 tindakan tepat'}</b><p>${isStop ? 'Putuskan setelah memeriksa detailnya.' : 'Pilih dari 8 respons. Pilihan salah dicatat.'}</p></div></li><li><span>03</span><div><b>${isStop ? 'Pahami alasannya' : 'Selesaikan dengan tenang'}</b><p>${isStop ? 'Pelajari langkah aman setelah menjawab.' : 'Waktu dihitung naik, bukan batas waktu.'}</p></div></li></ol></div></section>`;
}
function caseCard(s) {
  return `<div class="case-card"><div class="case-channel">${icon(s.icon)}<span>${escape(s.channel)}</span></div><div class="case-sender"><span class="sender-icon">${icon(s.icon)}</span><div><b>${escape(s.sender)}</b><span>Situasi simulasi</span></div></div><blockquote>${escape(s.message)}</blockquote><div class="case-bottom"><span>${icon('Info')} Perhatikan detail sebelum memilih</span></div></div>`;
}
function stopFeedback(s, correct) {
  return `<dialog id="answer-feedback" class="answer-feedback" aria-labelledby="feedback-title"><button class="feedback-close" data-action="close-feedback" aria-label="Kembali ke situasi">${icon('X')}</button><div class="feedback-scroll"><div class="feedback-mascot">${character('stop', correct ? 'happy' : 'oops')}</div><p class="eyebrow">${correct ? 'JAWABAN BENAR' : 'JAWABAN BELUM TEPAT'}</p><h2 id="feedback-title" tabindex="-1">${correct ? 'NAH, BETUL!' : 'EH, TUNGGU…'}</h2><div class="round-reaction ${correct ? 'hit' : 'miss'}">${correct ? '+1 KEPUTUSAN TEPAT' : 'YUK, KENALI TANDA-TANDANYA'}</div><div class="decision-verdict ${s.answer}">${icon(s.answer === 'stop' ? 'HandPalm' : 'CheckCircle')}<span>Keputusan yang tepat: <b>${s.answer === 'stop' ? 'STOP' : 'LANJUT'}</b></span></div><p class="reason">${escape(s.reason)}</p><div class="learning-point"><b>${s.answer === 'stop' ? 'Tanda bahaya' : 'Yang sudah diperiksa'}</b><p>${escape(s.checkpoint)}</p></div><div class="learning-point"><b>Langkah aman</b><p>${escape(s.action)}</p></div>${button(state.index === state.rounds.length - 1 ? 'Lihat hasilku' : 'RONDE BERIKUTNYA', 'next-stop')}</div></dialog>`;
}
function stopPlay() {
  const s = state.rounds[state.index];
  const answered = state.answer !== null;
  const correct = state.answer === s.answer;
  return `${nav('STOP OR GO DECISION', `<span class="round-count">TEPAT <b>${state.correct}</b> / ${state.rounds.length}</span>`)}<div class="round-track" aria-label="Progres situasi">${state.rounds.map((_, i) => `<span class="${i < state.index ? 'done' : i === state.index ? 'current' : ''}">${i < state.index ? icon('Check') : i + 1}</span>`).join('')}</div><section class="decision-view asking">${host(answered ? 'Yuk, pahami alasannya.' : 'Baca detailnya dulu, ya.', answered ? 'idle' : 'thinking')}${caseCard(s)}<div class="decision-copy"><p class="eyebrow">RONDE ${state.index + 1} • APA KEPUTUSANMU?</p><h1 tabindex="-1">${escape(s.title)}</h1><p class="lead">${escape(s.question)}</p>${answered ? button('Lihat penjelasan', 'open-feedback') : `<div class="decision-buttons"><button class="decision stop" data-action="answer" data-value="stop">${icon('HandPalm')}<b>STOP</b><span>Ada yang janggal!</span></button><button class="decision go" data-action="answer" data-value="go">${icon('ArrowRight')}<b>LANJUT</b><span>Aman? Gas!</span></button></div><p class="decision-hint">Bukan soal cepat. Yang penting, tepat.</p>`}</div></section>${answered ? stopFeedback(s, correct) : ''}`;
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
function actScenario() {
  const s = state.scenario;
  return `${nav('ACT FAST CHALLENGE')}<section class="act-scenario"><div class="incident-visual">${character('act', 'surprised')}<span class="incident-bubble">Oke. Tarik napas dulu.</span></div><div class="scenario-copy"><p class="eyebrow">MISI KAMU KALI INI</p><h1 tabindex="-1">${escape(s.title)}</h1><p class="lead">${escape(s.text)}</p><div class="ready-note">${icon('Timer')}<p>Baca dulu dengan tenang. Timer baru dimulai setelah kamu menekan <b>Saya siap</b>.</p></div>${button('SAYA SIAP!', 'ready')}</div></section>`;
}
function actPlay() {
  const s = state.scenario;
  return `${nav('ACT FAST CHALLENGE')}<section class="response-view"><aside class="response-context"><span class="incident-small">${icon(s.icon)}</span><h1 tabindex="-1">${escape(s.title)}</h1><p>${escape(s.text)}</p><div class="timer-panel"><span>${icon('Timer')} WAKTU BERJALAN</span><div><b id="timer">0.0</b><span>detik</span></div><small>Tanpa batas waktu. Tetap jeli!</small></div></aside><div class="response-main"><div class="response-heading">${host('Oke, bantu aku beresin ini!', 'thinking')}<h2>LANGKAH KAMU?</h2><p>Pilih semua tindakan yang diperlukan dalam situasi ini.</p></div><div class="power-cells" aria-hidden="true">${s.required.map(() => '<span></span>').join('')}</div><div class="response-progress"><span id="progress">0 dari ${s.required.length} tindakan tepat ditemukan</span><span id="wrong-count">0 salah</span></div><div class="response-grid">${state.responseOrder.map(id => { const r = responses.find(r => r.id === id); return `<button class="response-tile" data-action="respond" data-value="${r.id}"><span class="tile-icon">${icon(r.icon)}</span><b>${r.label}</b><span class="tile-state">PILIH AKSI INI</span><span class="tile-mark"></span></button>`; }).join('')}</div><p id="response-feedback" class="response-feedback" role="status">Ada ${s.required.length} tindakan tepat. Temukan semuanya.</p></div></section>`;
}
function completion() {
  return `<section class="completion-view">${confetti()}<div class="finish-mascot">${character('act', 'celebrate')}</div><div class="completion-seal">${icon('Check')}</div><p class="eyebrow">SEMUA TINDAKAN TEPAT DITEMUKAN</p><h1 tabindex="-1">MISSION<br><span>COMPLETE!</span></h1><p>Waktu berhenti di <b>${formatTime(state.elapsed)} detik</b>.</p></section>`;
}
function result() {
  const isStop = state.game === 'stop';
  const stats = isStop ? null : assess(state.scenario.required, state.chosen);
  const score = isStop ? null : scoreAct(state.elapsed, stats.wrong, state.scenario.targetTime);
  return `${nav(isStop ? 'STOP OR GO DECISION' : 'ACT FAST CHALLENGE')}<section class="result-view">${confetti()}<div class="result-heading"><div class="finish-mascot">${character(state.game, isStop && state.correct < 3 ? 'encourage' : 'celebrate')}</div><div class="result-seal">${icon('ShieldCheck')}</div><p class="eyebrow">TANTANGAN SELESAI</p><h1 tabindex="-1">${isStop ? 'RONDE<br><span>SELESAI!</span>' : 'AKSI<br><span>TUNTAS!</span>'}</h1><p>${isStop ? 'Setiap keputusan adalah kesempatan untuk belajar.' : 'Kamu menemukan semua tindakan yang diperlukan.'}</p></div><div class="result-details">${isStop ? `<div class="stop-score"><strong>${state.correct}<span> / ${state.rounds.length}</span></strong><p>keputusan tepat</p></div><div class="learning-point"><b>Ingat sebelum bertindak</b><p>Periksa identitas, penerima, nominal, dan tujuan. Jika ada yang meragukan, berhenti dan verifikasi melalui kanal resmi.</p></div>${button('Selesai', 'home')}` : `<div class="badge-label">${icon('Trophy')}${score.badge}</div><div class="result-stats"><div><span>BENAR</span><b>${stats.correct}<small> / ${state.scenario.required.length}</small></b></div><div><span>SALAH</span><b>${stats.wrong}</b></div><div><span>WAKTU</span><b>${formatTime(state.elapsed)}<small> dtk</small></b></div><div class="score-stat"><span>SKOR</span><b>${score.score}</b></div></div><p class="score-note">700 poin selesai + ${score.bonus} bonus waktu − ${stats.wrong * 75} poin pilihan salah.</p>${button('Lihat penjelasan', 'debrief')}`}<p class="auto-reset">${isStop ? 'Kembali ke awal' : 'Lihat penjelasan'} dalam <span id="reset-count">45</span> detik.</p></div></section>`;
}
function debrief() {
  const s = state.scenario;
  return `${nav('ACT FAST CHALLENGE')}<section class="debrief-view"><div class="debrief-heading"><p class="eyebrow">BEKAL UNTUK DUNIA NYATA</p><h1 tabindex="-1">BAWA PULANG<br><span>ILMUNYA!</span></h1><p class="lead">${escape(s.explanation)}</p></div><div class="action-recap">${s.required.map(id => {const r = responses.find(r => r.id === id); return `<div>${icon(r.icon)}<section><h2>${r.label}</h2><p>${r.detail}</p></section>${icon('CheckCircle')}</div>`;}).join('')}</div><div class="debrief-end"><p>Kalau ragu, STOP dulu.<br><b>Kalau sudah terjadi, bertindak tepat.</b></p><button id="finish" class="button" data-action="home" disabled>Selesai <span id="debrief-count">(5)</span>${icon('ArrowRight')}</button></div><p class="auto-reset">Kembali ke awal dalam <span id="reset-count">45</span> detik.</p></section>`;
}
let introTimers = [];
function animateIntro() {
  const guide = screen.querySelector('.intro-guide');
  if (!guide || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rows = [...guide.querySelectorAll('li')];
  const mascot = guide.querySelector('.toon');
  guide.classList.add('intro-sequence');
  react(mascot, 'wave');
  ['thinking', 'encourage', 'happy'].forEach((mood, index) => {
    introTimers.push(setTimeout(() => {
      rows.forEach(row => row.classList.remove('step-active'));
      rows[index].classList.add('step-visible', 'step-active');
      react(mascot, mood);
    }, 400 + index * 800));
  });
  introTimers.push(setTimeout(() => {
    react(mascot, 'idle');
    rows.forEach(row => row.classList.remove('step-active'));
  }, 3200));
}
function render() {
  document.body.classList.remove('feedback-open');
  introTimers.forEach(clearTimeout);
  introTimers = [];
  const views = { home, intro, 'stop-play': stopPlay, 'act-scenario': actScenario, 'act-play': actPlay, completion, result, debrief };
  screen.innerHTML = header() + views[state.view]() + footer();
  screen.dataset.view = state.view;
  screen.dataset.game = state.game || 'home';
  window.scrollTo(0, 0);
  kiosk.scrollTop = 0;
  screen.querySelector('h1')?.focus({ preventScroll: true });
  enteredAt = performance.now();
  syncMusic();
  if (state.view === 'intro') animateIntro();
}
function goHome() {
  clearTimeout(completeTimer);
  state = { view: 'home', game: null };
  history.replaceState(null, '', location.pathname + location.search);
  render();
}
function choose(game) {
  clearTimeout(completeTimer);
  state = { view: 'intro', game };
  tone(true);
  history.replaceState(null, '', `#${game}`);
  render();
}
function confetti() {
  return `<div class="confetti" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--i:${i};--x:${(i * 7 + 3) % 100}%"></i>`).join('')}</div>`;
}
function tone(correct, celebrate = false, finish = false) {
  if (!sound) return;
  if (!gameAudio.feedback(correct, celebrate, finish)) announcement.textContent = 'Suara tidak tersedia pada perangkat ini.';
}
function respond(id, tile) {
  if (state.view !== 'act-play' || state.chosen.includes(id) || !responses.some(r => r.id === id)) return;
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
  tone(correct);
  if (stats.complete) {
    state.elapsed = performance.now() - state.started;
    state.view = 'completion';
    tone(true, true); render();
    completeTimer = setTimeout(() => { state.view = 'result'; render(); }, 1200);
  }
}
document.addEventListener('click', event => {
  const target = event.target.closest('button[data-action]');
  if (!target || target.disabled) return;
  const { action, value } = target.dataset;
  if (action === 'choose-stop') choose('stop');
  if (action === 'choose-act') choose('act');
  if (action === 'home') {
    if (['stop-play', 'act-play', 'act-scenario', 'completion'].includes(state.view)) document.querySelector('#reset-dialog').showModal();
    else goHome();
  }
  if (action === 'reset') document.querySelector('#reset-dialog').showModal();
  if (action === 'cancel-reset') document.querySelector('#reset-dialog').close();
  if (action === 'confirm-reset') { document.querySelector('#reset-dialog').close(); goHome(); }
  if (action === 'start' && state.view === 'intro') {
    if (state.game === 'stop') state = { game: 'stop', view: 'stop-play', rounds: shuffle(stopScenarios).slice(0, settings.stopCount), index: 0, answer: null, correct: 0 };
    else state = { game: 'act', view: 'act-scenario', scenario: nextAct() };
    tone(true, true); render();
  }
  if (action === 'answer' && state.view === 'stop-play' && state.answer === null) {
    state.answer = value;
    const correct = value === state.rounds[state.index].answer;
    if (correct) state.correct++;
    tone(correct); render(); openFeedback();
  }
  if (action === 'open-feedback') openFeedback();
  if (action === 'close-feedback') document.querySelector('#answer-feedback')?.close();
  if (action === 'next-stop' && state.view === 'stop-play' && state.answer !== null) {
    if (state.index === state.rounds.length - 1) {
      state.view = 'result';
      tone(true, true, true);
    }
    else { state.index++; state.answer = null; }
    render();
  }
  if (action === 'ready' && state.view === 'act-scenario') {
    // Distribute actions across the grid; keep this order stable between cases.
    state.responseOrder = ['R1', 'R5', 'R6', 'R3', 'R7', 'R2', 'R4', 'R8'];
    state.chosen = []; state.view = 'act-play'; tone(true); render(); state.started = performance.now();
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
window.addEventListener('hashchange', () => { const game = location.hash.slice(1); if (['stop', 'act'].includes(game)) choose(game); else goHome(); });
setInterval(() => {
  const now = performance.now();
  if (state.view === 'act-play') document.querySelector('#timer').textContent = formatTime(now - state.started);
  if (['result', 'debrief'].includes(state.view)) {
    const remaining = Math.max(0, Math.ceil((settings.resultResetMs - now + enteredAt) / 1000));
    const counter = document.querySelector('#reset-count');
    if (counter) counter.textContent = remaining;
    if (!remaining && !document.querySelector('dialog[open]')) {
      if (state.view === 'result' && state.game === 'act') { state.view = 'debrief'; render(); }
      else goHome();
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
const initial = location.hash.slice(1);
if (['stop', 'act'].includes(initial)) choose(initial); else render();
