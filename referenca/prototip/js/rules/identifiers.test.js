const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeDigits, isValidPib, isValidMb } = require('./identifiers.js');

test('sanitizeDigits: uklanja sve osim cifara (razmaci, tačke, crtice iz nalepljenog teksta)', () => {
  assert.equal(sanitizeDigits('112 233 445'), '112233445');
  assert.equal(sanitizeDigits('112-233-445'), '112233445');
  assert.equal(sanitizeDigits('PIB: 112233445'), '112233445');
});

test('sanitizeDigits: prazno/null/undefined daje prazan string', () => {
  assert.equal(sanitizeDigits(''), '');
  assert.equal(sanitizeDigits(null), '');
  assert.equal(sanitizeDigits(undefined), '');
});

test('sanitizeDigits: maxLen seče na tačnu dužinu, i kad je nalepljeno više cifara nego treba', () => {
  assert.equal(sanitizeDigits('1122334455555', 9), '112233445');
  assert.equal(sanitizeDigits('123', 9), '123'); // kraće od maxLen ostaje kako jeste (korisnik još kuca)
});

test('sanitizeDigits: bez maxLen ne seče', () => {
  assert.equal(sanitizeDigits('123456789012'), '123456789012');
});

test('isValidPib: tačno 9 cifara (spec 3.1)', () => {
  assert.equal(isValidPib('112233445'), true);
  assert.equal(isValidPib('11223344'), false); // 8 cifara
  assert.equal(isValidPib('1122334455'), false); // 10 cifara
  assert.equal(isValidPib('11223344a'), false); // nije sve cifra
  assert.equal(isValidPib(''), false);
  assert.equal(isValidPib(null), false);
});

test('isValidMb: tačno 8 cifara (spec 3.1)', () => {
  assert.equal(isValidMb('66554433'), true);
  assert.equal(isValidMb('6655443'), false); // 7 cifara
  assert.equal(isValidMb('665544330'), false); // 9 cifara
  assert.equal(isValidMb(''), false);
  assert.equal(isValidMb(null), false);
});
