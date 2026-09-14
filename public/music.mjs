import { audioSettings } from './audio.mjs';

// Keep one lobby audio instance so returning home resumes instead of restarting it.
export function createMusic(onChange = () => {}) {
  const audio = new Audio('./assets/bgm-fekdi.mp3?v=6f9757cadf1c');
  audio.id = 'menu-bgm';
  audio.preload = 'auto';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = audioSettings.lobbyMusicVolume;
  document.body.append(audio);
  let enabled = true;
  function sync() {
    if (enabled && !document.hidden) {
      if (audio.paused) void audio.play().catch(() => onChange());
    } else audio.pause();
    onChange();
  }
  audio.addEventListener('playing', onChange);
  audio.addEventListener('pause', onChange);
  function unlock(event) {
    if (event.target.closest?.('#music')) return;
    sync();
  }
  document.addEventListener('pointerdown', unlock);
  document.addEventListener('keydown', unlock);
  document.addEventListener('click', unlock);
  document.addEventListener('visibilitychange', sync);
  return { audio, sync, setEnabled(value) { enabled = value; sync(); } };
}
