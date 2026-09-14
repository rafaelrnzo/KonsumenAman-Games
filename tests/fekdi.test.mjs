import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stopScenarios, actScenarios, responses } from '../public/content.mjs';
import { shuffle, makeBag, assess, scoreAct } from '../public/engine.mjs';
import { audioSettings, gameTrack, musicSources } from '../public/audio.mjs';

test('lobby and in-game audio have distinct, audible sources', () => {
  assert.ok(audioSettings.lobbyMusicVolume > 0.28);
  assert.ok(audioSettings.musicVolume >= 0.5);
  assert.ok(audioSettings.effectsVolume > audioSettings.musicVolume);
  assert.notEqual(musicSources.lobby, musicSources.game);
  assert.equal(gameTrack.bpm, 132);
  assert.equal(gameTrack.melody.length, gameTrack.bass.length);
});

test('FEKDI revision 2 content, scoring, unique attempts, and 200-session distribution', () => {
  assert.equal(stopScenarios.length, 15);
  assert.equal(new Set(stopScenarios.map(s => s.id)).size, 15);
  assert.equal(stopScenarios.filter(s => s.answer === 'stop').length, 8);
  assert.equal(actScenarios.length, 10);
  assert.equal(responses.length, 8);
  const four = ['ACT-01', 'ACT-03', 'ACT-05', 'ACT-06', 'ACT-08', 'ACT-10'];
  for (const s of actScenarios) {
    assert.deepEqual(s.required, four.includes(s.id) ? ['R1', 'R2', 'R3', 'R4'] : ['R2', 'R3', 'R4']);
    assert.equal(s.targetTime, s.required.length === 3 ? 18 : 22);
    assert.equal(assess(s.required, s.required.slice(1)).complete, false);
    assert.deepEqual(assess(s.required, [...s.required, 'R5', 'R5']), { correct: s.required.length, wrong: 1, complete: true });
    assert.deepEqual(assess(s.required, [...s.required, ...s.required]), { correct: s.required.length, wrong: 0, complete: true });
    const target = s.targetTime * 1000;
    for (const [time, bonus] of [[target, 300], [target + 1, 200], [target * 1.5, 200], [target * 1.5 + 1, 100], [target * 2, 100], [target * 2 + 1, 0], [3_600_000, 0]]) {
      assert.equal(scoreAct(time, 1, s.targetTime).score, 700 + bonus - 75);
    }
  }
  assert.equal(scoreAct(0, 0, 18).badge, 'FAST & SAFE RESPONDER');
  assert.equal(scoreAct(0, 2, 18).badge, 'SAFE RESPONDER');
  assert.equal(scoreAct(90_000, 0, 18).badge, 'KEEP YOUR RADAR ON');
  assert.equal(scoreAct(90_000, 20, 18).score, 0);
  const source = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffle(source, () => 0).sort(), source);
  assert.deepEqual(source, [1, 2, 3, 4, 5]);
  // A constant random source also exercises the bag-boundary repeat guard.
  for (const random of [() => 0, () => 0.999, Math.random]) {
    const next = makeBag(actScenarios, random);
    let previous;
    for (let batch = 0; batch < 20; batch++) {
      const ids = [];
      for (let i = 0; i < 10; i++) {
        const scenario = next();
        assert.notEqual(scenario.id, previous);
        previous = scenario.id;
        ids.push(scenario.id);
      }
      assert.equal(new Set(ids).size, 10);
    }
  }
});
