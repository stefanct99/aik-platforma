const test = require('node:test');
const assert = require('node:assert/strict');
const { effectiveAutoSend, effectiveFxMode, computeFxSale } = require('./autonomy.js');

test('effectiveAutoSend: bez izuzetka po klijentu, prati globalno podešavanje', () => {
  assert.equal(effectiveAutoSend(null, { globalMode: 'auto' }), true);
  assert.equal(effectiveAutoSend(null, { globalMode: 'ask' }), false);
});

test('effectiveAutoSend: izuzetak po klijentu PREGAZI globalno podešavanje (7.7)', () => {
  assert.equal(effectiveAutoSend({ autoSend: true }, { globalMode: 'ask' }), true);
  assert.equal(effectiveAutoSend({ autoSend: false }, { globalMode: 'auto' }), false);
});

test('effectiveFxMode: bez izuzetka (null ili "none"), prati globalni režim', () => {
  assert.equal(effectiveFxMode(null, { fxMode: 'sell_all' }), 'sell_all');
  assert.equal(effectiveFxMode({ fxMode: 'none' }, { fxMode: 'book_only' }), 'book_only');
  assert.equal(effectiveFxMode({ fxMode: null }, { fxMode: 'sell_part' }), 'sell_part');
});

test('effectiveFxMode: izuzetak po klijentu PREGAZI globalni režim', () => {
  assert.equal(effectiveFxMode({ fxMode: 'sell_all' }, { fxMode: 'book_only' }), 'sell_all');
});

test('computeFxSale: book_only ne prodaje ništa', () => {
  assert.equal(computeFxSale(1000, 'EUR', 'book_only', 50, 117.2), null);
});

test('computeFxSale: sell_all prodaje ceo iznos', () => {
  assert.deepEqual(computeFxSale(1000, 'EUR', 'sell_all', 50, 117.2), { amount: 1000, currency: 'EUR', rate: 117.2 });
});

test('computeFxSale: sell_part prodaje tačno procenat, zaokruženo na 2 decimale', () => {
  const r = computeFxSale(1000, 'EUR', 'sell_part', 50, 117.2);
  assert.equal(r.amount, 500);
  assert.equal(r.percent, 50);
});

test('computeFxSale: sell_part sa procentom koji daje neceo broj se zaokružuje ispravno', () => {
  const r = computeFxSale(333, 'EUR', 'sell_part', 33, 117.2);
  assert.equal(r.amount, Math.round(333*33)/100);
});
