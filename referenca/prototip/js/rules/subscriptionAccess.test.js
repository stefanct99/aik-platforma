const test = require('node:test');
const assert = require('node:assert/strict');
const { computeAccess, isFreeAccessActive, effectiveAccess, freeAccessCardInfo } = require('./subscriptionAccess.js');

const NOW = new Date(2026, 10, 20);

test('computeAccess: "Istekla" pauzira AI knjigovođu', () => {
  assert.equal(computeAccess({ status: 'Istekla' }, NOW).aiPaused, true);
});

test('computeAccess: "Probni" NIKAD ne pauzira AI, ni blizu isteka', () => {
  assert.equal(computeAccess({ status: 'Probni', trialDaysLeft: 0 }, NOW).aiPaused, false);
});

test('computeAccess: "Otkazana" radi normalno DOK accessUntil nije prošao', () => {
  const r = computeAccess({ status: 'Otkazana', accessUntil: new Date(2026, 11, 1).toISOString() }, NOW);
  assert.equal(r.aiPaused, false);
  assert.equal(r.canceledPastEnd, false);
});

test('computeAccess: "Otkazana" pauzira AI POSLE accessUntil (postaje isto kao Istekla)', () => {
  const r = computeAccess({ status: 'Otkazana', accessUntil: new Date(2026, 9, 1).toISOString() }, NOW);
  assert.equal(r.aiPaused, true);
  assert.equal(r.canceledPastEnd, true);
});

test('computeAccess: "Naplata nije uspela" i "Aktivna" ne pauziraju AI', () => {
  assert.equal(computeAccess({ status: 'Naplata nije uspela' }, NOW).aiPaused, false);
  assert.equal(computeAccess({ status: 'Aktivna' }, NOW).aiPaused, false);
});

test('isFreeAccessActive: "bez roka" (noEnd) je uvek aktivan', () => {
  assert.equal(isFreeAccessActive({ noEnd: true }, NOW), true);
});

test('isFreeAccessActive: sa rokom, aktivan dok se ne dostigne datum, neaktivan posle', () => {
  assert.equal(isFreeAccessActive({ untilIso: new Date(2026, 11, 1).toISOString() }, NOW), true);
  assert.equal(isFreeAccessActive({ untilIso: new Date(2026, 9, 1).toISOString() }, NOW), false);
});

test('isFreeAccessActive: odsutan/null ulaz nije aktivan pristup', () => {
  assert.equal(isFreeAccessActive(null, NOW), false);
  assert.equal(isFreeAccessActive({}, NOW), false);
});

// Round 30, nalaz 5 (ADMIN_SPECIFIKACIJA.md odeljak 6): besplatan pristup mora da POBEDI stvarno stanje
// pretplate i da daje pun pristup (bez pauze AI) koliko god pretplata inače bila istekla/otkazana.
test('effectiveAccess: besplatan pristup DAJE pun pristup i korisniku sa isteklim probnim periodom', () => {
  const r = effectiveAccess({ status: 'Istekla' }, { noEnd: true }, NOW);
  assert.equal(r.aiPaused, false);
  assert.equal(r.freeAccess, true);
});

test('effectiveAccess: besplatan pristup sa rokom koji je već prošao NE daje pristup — pada na stvarno stanje pretplate', () => {
  const r = effectiveAccess({ status: 'Istekla' }, { untilIso: new Date(2026, 9, 1).toISOString() }, NOW);
  assert.equal(r.aiPaused, true);
  assert.equal(r.freeAccess, false);
});

test('effectiveAccess: bez besplatnog pristupa (null/odsutno) ponaša se identično kao computeAccess', () => {
  const withoutFree = effectiveAccess({ status: 'Aktivna' }, null, NOW);
  const direct = computeAccess({ status: 'Aktivna' }, NOW);
  assert.equal(withoutFree.aiPaused, direct.aiPaused);
  assert.equal(withoutFree.freeAccess, false);
});

test('effectiveAccess: ukidanje pristupa (freeAccess vraćen na null) vraća PRETHODNO stanje pretplate (Istekla ostaje Istekla)', () => {
  const granted = effectiveAccess({ status: 'Istekla' }, { noEnd: true }, NOW);
  assert.equal(granted.aiPaused, false);
  const revoked = effectiveAccess({ status: 'Istekla' }, null, NOW);
  assert.equal(revoked.aiPaused, true);
});

// Poslednja ispravka: svih pet mesta koja prikazuju "AI knjigovođa je pauziran" (Početna baner, Početna
// AiPausedPanel, AI knjigovođa chat, sidebar kartica, selectors.js subscriptionBanner) MORAJU da čitaju
// `aiPaused` sa ISTOG mesta (Sel.subscriptionAccess, koji poziva effectiveAccess) — ne posebnu proveru
// sub.status direktno. Sledeći testovi pokrivaju svaki OBLIK ulaza koji ta mesta mogu da vide (uključujući
// Probni sa trialDaysLeft<=0, koji selectors.js's subscriptionBanner ranije proveravao ODVOJENO,
// direktno na sub.status, mimo aiPaused).
test('effectiveAccess: Probni sa trialDaysLeft<=0 NIKAD ne pauzira, ni uz ni bez besplatnog pristupa', () => {
  const bez = effectiveAccess({ status: 'Probni', trialDaysLeft: 0 }, null, NOW);
  assert.equal(bez.aiPaused, false);
  const sa = effectiveAccess({ status: 'Probni', trialDaysLeft: 0 }, { noEnd: true }, NOW);
  assert.equal(sa.aiPaused, false);
});

test('effectiveAccess: Otkazana posle accessUntil uz besplatan pristup NE pauzira (banner ne sme da kaže "pauziran")', () => {
  const r = effectiveAccess({ status: 'Otkazana', accessUntil: new Date(2026, 9, 1).toISOString() }, { noEnd: true }, NOW);
  assert.equal(r.aiPaused, false);
  assert.equal(r.canceledPastEnd, false);
});

test('effectiveAccess: Istekla BEZ besplatnog pristupa i dalje pauzira (fix ne sme da sakrije stvarnu pauzu)', () => {
  const r = effectiveAccess({ status: 'Istekla' }, null, NOW);
  assert.equal(r.aiPaused, true);
});

// Mala ispravka (posle Round 30): sidebar kartica je pokazivala "Pretplata aktivna / Obnavlja se 1. jan
// 1970." za nalog sa besplatnim pristupom (jer sub.nextChargeAt je null) — freeAccessCardInfo daje čiste
// podatke (bez formatiranja datuma, to ostaje na UI) da kartica prikaže "Besplatan pristup" / "Bez roka"
// ili "Do <datum>", nikad pogrešan datum iz stvarne pretplate.
test('freeAccessCardInfo: null kad besplatan pristup nije aktivan', () => {
  assert.equal(freeAccessCardInfo(null, NOW), null);
  assert.equal(freeAccessCardInfo({ untilIso: new Date(2026, 9, 1).toISOString() }, NOW), null); // rok prošao
});

test('freeAccessCardInfo: {noEnd:true} kad je bez roka', () => {
  const info = freeAccessCardInfo({ noEnd: true }, NOW);
  assert.deepEqual(info, { noEnd: true, untilIso: null });
});

test('freeAccessCardInfo: {untilIso} kad ima rok koji još nije prošao', () => {
  const untilIso = new Date(2026, 11, 14).toISOString();
  const info = freeAccessCardInfo({ untilIso }, NOW);
  assert.deepEqual(info, { noEnd: false, untilIso });
});
