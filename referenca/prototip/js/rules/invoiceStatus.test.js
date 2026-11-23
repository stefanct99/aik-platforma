const test = require('node:test');
const assert = require('node:assert/strict');
const { invoiceTotal, invoiceDueDate, isInvoiceLate, invoiceEffectiveStatus, lateDays } = require('./invoiceStatus.js');

test('invoiceTotal: zbir stavki (qty*price), podrazumevano qty=1', () => {
  assert.equal(invoiceTotal({ items: [{ price: 100 }, { qty: 2, price: 50 }] }), 200);
  assert.equal(invoiceTotal({ items: [] }), 0);
});

test('invoiceDueDate: izdato 31. dana, rok +7 dana prelazi u sledeći mesec ispravno (nov30→dec8 preko 31)', () => {
  // 31. januar 2026 + 7 dana = 7. februar 2026 (januar ima 31 dan)
  const d = invoiceDueDate({ issueDate: new Date(2026, 0, 31).toISOString(), dueDays: 7 });
  assert.equal(d.getMonth(), 1); // februar (0-indeksirano)
  assert.equal(d.getDate(), 7);
});

test('isInvoiceLate: Nacrt/Plaćena/Stornirana NIKAD ne kasne, čak i posle roka', () => {
  const stareProslost = new Date(2020, 0, 1);
  const buduce = new Date(2030, 0, 1);
  for (const status of ['Nacrt', 'Plaćena', 'Stornirana']) {
    assert.equal(isInvoiceLate({ status, issueDate: stareProslost.toISOString(), dueDays: 1 }, buduce), false);
  }
});

test('isInvoiceLate: granica — tačno na dan roka NIJE kasna, dan posle JESTE', () => {
  const issue = new Date(2026, 10, 1);
  const inv = { status: 'Poslata', issueDate: issue.toISOString(), dueDays: 7 };
  const due = invoiceDueDate(inv); // 8. novembar 2026
  assert.equal(isInvoiceLate(inv, due), false, 'tačno na rok — nije kasna');
  const danPosle = new Date(due.getTime() + 86400000);
  assert.equal(isInvoiceLate(inv, danPosle), true, 'dan posle roka — kasna');
});

test('invoiceEffectiveStatus: Poslata posle roka postaje "Kasni"; drugi statusi se ne menjaju', () => {
  const issue = new Date(2020, 0, 1);
  const kasno = new Date(2020, 0, 10);
  assert.equal(invoiceEffectiveStatus({ status: 'Poslata', issueDate: issue.toISOString(), dueDays: 1 }, kasno), 'Kasni');
  assert.equal(invoiceEffectiveStatus({ status: 'Plaćena', issueDate: issue.toISOString(), dueDays: 1 }, kasno), 'Plaćena');
  assert.equal(invoiceEffectiveStatus({ status: 'Nacrt', issueDate: issue.toISOString(), dueDays: 1 }, kasno), 'Nacrt');
});

test('lateDays: broj dana kašnjenja, nikad negativan', () => {
  const issue = new Date(2026, 10, 1);
  const inv = { issueDate: issue.toISOString(), dueDays: 7 }; // rok 8. novembar
  assert.equal(lateDays(inv, new Date(2026, 10, 8)), 0);
  assert.equal(lateDays(inv, new Date(2026, 10, 11)), 3);
  assert.equal(lateDays(inv, new Date(2026, 10, 1)), 0, 'pre roka — nikad negativno, samo 0');
});
