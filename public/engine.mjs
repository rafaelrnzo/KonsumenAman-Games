export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeBag(items, random = Math.random) {
  let bag = [], previous;
  return () => {
    if (!bag.length) {
      bag = shuffle(items, random);
      if (bag.length > 1 && bag[bag.length - 1] === previous) {
        [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
      }
    }
    previous = bag.pop();
    return previous;
  };
}

export function assess(required, chosen) {
  const unique = [...new Set(chosen)];
  const correct = unique.filter(id => required.includes(id)).length;
  return { correct, wrong: unique.length - correct, complete: correct === required.length };
}

export function scoreAct(elapsedMs, wrong, targetSeconds) {
  const seconds = elapsedMs / 1000;
  const bonus = seconds <= targetSeconds ? 300 : seconds <= targetSeconds * 1.5 ? 200 : seconds <= targetSeconds * 2 ? 100 : 0;
  const score = Math.max(0, 700 + bonus - wrong * 75);
  const badge = score >= 900 ? 'FAST & SAFE RESPONDER' : score >= 750 ? 'SAFE RESPONDER' : 'KEEP YOUR RADAR ON';
  return { score, bonus, badge };
}

export function formatTime(ms) { return (ms / 1000).toFixed(1); }
