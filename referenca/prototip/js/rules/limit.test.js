const test = require('node:test');
const assert = require('node:assert/strict');
const { LIMIT, computeLimitInfo, limitWarningTier } = require('./limit.js');

const NOW = new Date(2026, 10, 20); // 20. novembar 2026.

test('limit: prazno stanje je 0/0%', () => {
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [] }, NOW);
  assert.equal(r.total, 0);
  assert.equal(r.pct, 0);
  assert.equal(r.remaining, LIMIT);
});

test('limit: tačno 6.000.000 din daje 100% i 0 preostalo', () => {
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [{ date: '2026-11-01', amount: 6000000, noInvoice: false }] }, NOW);
  assert.equal(r.total, 6000000);
  assert.equal(r.pct, 100);
  assert.equal(r.remaining, 0);
});

test('limit: preko 100% se ne zaustavlja na 100 (procenat raste dalje)', () => {
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [{ date: '2026-11-01', amount: 6600000, noInvoice: false }] }, NOW);
  assert.equal(r.pct, 110);
  assert.equal(r.remaining, 0); // Math.max(0, ...) ne ide u minus
});

test('limit: uplata tačno 365 dana pre "now" ULAZI (granica je uključena)', () => {
  const dan365 = new Date(NOW); dan365.setDate(dan365.getDate()-365);
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [{ date: dan365.toISOString(), amount: 1000, noInvoice: false }] }, NOW);
  assert.equal(r.total, 1000);
});

test('limit: uplata 366 dana pre "now" NE ulazi (van kliznog prozora)', () => {
  const dan366 = new Date(NOW); dan366.setDate(dan366.getDate()-366);
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [{ date: dan366.toISOString(), amount: 1000, noInvoice: false }] }, NOW);
  assert.equal(r.total, 0);
});

test('limit: uplate "bez fakture" (noInvoice) se isključuju (spec 8.4, odluka: NE ulaze)', () => {
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [
    { date: '2026-11-01', amount: 100000, noInvoice: true },
    { date: '2026-11-01', amount: 50000, noInvoice: false },
  ] }, NOW);
  assert.equal(r.total, 50000);
});

test('limit: devizne uplate se računaju po kursu SAČUVANOM uz uplatu (amount*rate), ne ponovo izvedenom', () => {
  const r = computeLimitInfo({ fxIncomes: [{ date: '2026-11-01', amount: 1000, rate: 117.2, noInvoice: false }], rsdIncomes: [] }, NOW);
  assert.equal(r.total, 117200);
});

test('limit: prestupna godina (2024) ne baca grešku i tačno broji 365 dana unazad preko 29. februara', () => {
  const now2024 = new Date(2024, 2, 1); // 1. mart 2024.
  const feb29 = new Date(2024, 1, 29).toISOString();
  const r = computeLimitInfo({ fxIncomes: [], rsdIncomes: [{ date: feb29, amount: 1000, noInvoice: false }] }, now2024);
  assert.equal(r.total, 1000); // 1 dan unazad, daleko unutar prozora
});

test('limit: RSD + FX zajedno se sabiraju u jedan zbir', () => {
  const r = computeLimitInfo({
    fxIncomes: [{ date: '2026-11-01', amount: 100, rate: 100, noInvoice: false }],
    rsdIncomes: [{ date: '2026-11-01', amount: 5000, noInvoice: false }],
  }, NOW);
  assert.equal(r.total, 15000);
});

// Round 30, nalaz 2 (spec 8.4: "Praćenje: 80% (upozorenje), 90% (jače upozorenje), 100% i više (kritično)").
test('limitWarningTier: ispod 80% nema upozorenja (null)', () => {
  assert.equal(limitWarningTier(0), null);
  assert.equal(limitWarningTier(79.9), null);
});
test('limitWarningTier: granica — tačno 80% je upozorenje (80), 79,99% nije', () => {
  assert.equal(limitWarningTier(80), 80);
  assert.equal(limitWarningTier(79.99), null);
});
test('limitWarningTier: granica — tačno 90% je jače upozorenje (90)', () => {
  assert.equal(limitWarningTier(90), 90);
  assert.equal(limitWarningTier(89.99), 80);
});
test('limitWarningTier: granica — tačno 100% i više je kritično (100)', () => {
  assert.equal(limitWarningTier(100), 100);
  assert.equal(limitWarningTier(150), 100); // i mnogo preko 100 i dalje samo "kritično", nema četvrtog nivoa
});
