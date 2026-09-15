export function character(kind = 'stop', mood = 'idle', variant = 'stick') {
  return `<span class="toon ${variant} ${kind} ${mood || 'idle'}" data-mood="${mood || 'idle'}" aria-hidden="true"><span class="toon-questions"><i>?</i><i>?</i><i>?</i></span><span class="toon-arm left"></span><span class="toon-arm right"></span><span class="toon-body"><span class="toon-eyes"><i></i><i></i></span><span class="toon-mouth"></span></span><span class="toon-foot left"></span><span class="toon-foot right"></span></span>`;
}

export function react(element, mood) {
  if (!element) return;
  element.classList.remove(element.dataset.mood || "idle", "happy", "surprised");
  void element.offsetWidth;
  element.dataset.mood = mood;
  element.classList.add(mood);
}
