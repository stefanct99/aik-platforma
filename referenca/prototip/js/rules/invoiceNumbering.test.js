const test = require('node:test');
const assert = require('node:assert/strict');
const { nextInvoiceNumber } = require('./invoiceNumbering.js');

test('numeracija: prazna lista počinje od 1', () => {
  assert.equal(nextInvoiceNumber([], '25/26'), '25/26-1');
});

test('numeracija: nastavlja posle najvećeg postojećeg broja (ne posle broja stavki — rupe su u redu)', () => {
  assert.equal(nextInvoiceNumber(['25/26-1', '25/26-3'], '25/26'), '25/26-4');
});

test('numeracija: format je "<prefiks>-<broj>", bez vodeće nule', () => {
  assert.equal(nextInvoiceNumber(['25/26-6'], '25/26'), '25/26-7');
  assert.ok(!nextInvoiceNumber(['25/26-6'], '25/26').includes('-07'));
});

test('numeracija: nevažeći (nebrojčani) nastavci iz ručno unetog uvoza se IGNORIŠU, ne ruše Math.max', () => {
  assert.equal(nextInvoiceNumber(['25/26-5', 'STARI-SISTEM-ABC'], '25/26'), '25/26-6');
});

test('numeracija: uvezene fakture ulaze u isti niz i računaju se u "najveći"', () => {
  assert.equal(nextInvoiceNumber(['25/26-2', '25/26-20'], '25/26'), '25/26-21');
});

test('numeracija: podrazumevani prefiks je "25/26" kad nije prosleđen', () => {
  assert.equal(nextInvoiceNumber([]), '25/26-1');
});
