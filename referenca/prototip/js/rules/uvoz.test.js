const test = require('node:test');
const assert = require('node:assert/strict');
const { parseUvozCsv, parseSrDateFlexible, parseSrNumber, findClientId, isDuplicate, buildItem, uvozCsvTemplate, looksLikeDateShape } = require('./uvoz.js');

test('parseSrNumber: srpski format (tačka hiljade, zarez decimala)', () => {
  assert.equal(parseSrNumber('1.200,00'), 1200);
  assert.equal(parseSrNumber('85.000,50'), 85000.5);
  assert.equal(parseSrNumber(''), NaN);
  assert.ok(Number.isNaN(parseSrNumber(null)));
});

test('parseSrDateFlexible: dd.mm.gggg i dd.mm.gggg. (sa tačkom na kraju)', () => {
  const d = parseSrDateFlexible('15.03.2026.');
  assert.equal(d.getFullYear(), 2026); assert.equal(d.getMonth(), 2); assert.equal(d.getDate(), 15);
});

test('parseSrDateFlexible: 31. dan u mesecu koji ima 31 dan je validan', () => {
  const d = parseSrDateFlexible('31.01.2026');
  assert.equal(d.getDate(), 31); assert.equal(d.getMonth(), 0);
});

test('parseSrDateFlexible: mesec>12 ili dan>31 se ODBIJA (vraća null), ne tiho prelama u sledeću godinu', () => {
  assert.equal(parseSrDateFlexible('32.13.2026'), null);
});

// Round 30, nalaz 4 (fix za Faza 0 NAĐEN NALAZ): dan se sad proverava protiv STVARNOG broja dana u datom
// mesecu (uključujući prestupne godine za februar), ne samo protiv fiksnog opsega 1-31.
test('parseSrDateFlexible: 31.04. NE POSTOJI (april ima 30 dana) — vraća null, ne tiho prelama u 1. maj', () => {
  assert.equal(parseSrDateFlexible('31.04.2026'), null);
});
test('parseSrDateFlexible: 29.02. u neprestupnoj godini ne postoji; u prestupnoj je validan', () => {
  assert.equal(parseSrDateFlexible('29.02.2026'), null); // 2026 nije prestupna
  const d = parseSrDateFlexible('29.02.2024'); // 2024 JESTE prestupna
  assert.notEqual(d, null); assert.equal(d.getMonth(), 1); assert.equal(d.getDate(), 29);
});
test('parseSrDateFlexible: 31. februar (ISO oblik) takođe ne postoji', () => {
  assert.equal(parseSrDateFlexible('2026-02-31'), null);
});
test('looksLikeDateShape: razlikuje "oblik datuma, ali ne postoji" od "uopšte ne liči na datum" (za UI poruku)', () => {
  assert.equal(looksLikeDateShape('31.04.2026'), true);  // oblik tačan, vrednost ne postoji
  assert.equal(looksLikeDateShape('neki tekst'), false); // ne liči na datum uopšte
  assert.equal(looksLikeDateShape(''), false);
});

test('parseSrDateFlexible: ISO format (gggg-mm-dd) takođe radi', () => {
  const d = parseSrDateFlexible('2026-03-15');
  assert.equal(d.getFullYear(), 2026); assert.equal(d.getMonth(), 2); assert.equal(d.getDate(), 15);
});

test('parseSrDateFlexible: prazno ili neprepoznatljivo vraća null', () => {
  assert.equal(parseSrDateFlexible(''), null);
  assert.equal(parseSrDateFlexible('neki tekst'), null);
});

test('parseUvozCsv: parsira sopstveni šablon, uključujući navodnike oko iznosa', () => {
  const rows = parseUvozCsv(uvozCsvTemplate());
  assert.equal(rows.length, 2);
  assert.equal(rows[0].client, 'Acme Inc.');
  assert.equal(rows[0].amount, '1.200,00');
  assert.equal(rows[0].currency, 'EUR');
});

test('parseUvozCsv: prazan tekst daje praznu listu', () => {
  assert.deepEqual(parseUvozCsv(''), []);
  assert.deepEqual(parseUvozCsv('samo,zaglavlje,red'), []);
});

test('findClientId: poklapanje po imenu, bez obzira na veličinu slova', () => {
  const clients = [{ id: 'c1', name: 'Acme Inc.' }];
  assert.equal(findClientId(clients, 'acme inc.'), 'c1');
  assert.equal(findClientId(clients, 'Nepostojeći'), null);
  assert.equal(findClientId(clients, ''), null);
});

test('isDuplicate: isti datum+iznos+broj fakture već u knjizi prihoda je duplikat', () => {
  const deps = { incomesRsd: [], incomesFx: [{ date: '2026-03-15T00:00:00.000Z', amount: 1200, invoiceId: 'i1' }], invoices: [{ id: 'i1', number: '25/26-01' }] };
  assert.equal(isDuplicate(deps, { dateIso: '2026-03-15T12:00:00.000Z', currency: 'EUR', amount: 1200, invoiceNumber: '25/26-01' }), true);
});

test('isDuplicate: različit broj fakture istog dana/iznosa NIJE duplikat', () => {
  const deps = { incomesRsd: [], incomesFx: [{ date: '2026-03-15T00:00:00.000Z', amount: 1200, invoiceId: 'i1' }], invoices: [{ id: 'i1', number: '25/26-01' }] };
  assert.equal(isDuplicate(deps, { dateIso: '2026-03-15T12:00:00.000Z', currency: 'EUR', amount: 1200, invoiceNumber: '25/26-02' }), false);
});

test('isDuplicate: iznos van tolerancije od 0,5 NIJE duplikat', () => {
  const deps = { incomesRsd: [{ date: '2026-03-15T00:00:00.000Z', amount: 1200 }], incomesFx: [], invoices: [] };
  assert.equal(isDuplicate(deps, { dateIso: '2026-03-15T00:00:00.000Z', currency: 'RSD', amount: 1201 }), false);
});

test('buildItem: ispravan red bez problema dobija status "ok"', () => {
  const deps = { clients: [], incomesRsd: [], incomesFx: [], invoices: [] };
  const item = buildItem({ date: '2026-03-15T00:00:00.000Z', client: '', invoiceNumber: '', currency: 'RSD', amount: 1000 }, deps, () => 1, new Date(2026,10,20));
  assert.equal(item.status, 'ok');
  assert.equal(item.issues.length, 0);
});

test('buildItem: red bez fakture (noInvoice) je uvek "review" sa objašnjenjem', () => {
  const deps = { clients: [], incomesRsd: [], incomesFx: [], invoices: [] };
  const item = buildItem({ date: '2026-03-15T00:00:00.000Z', client: '', invoiceNumber: '', currency: 'RSD', amount: 1000, noInvoice: true }, deps, () => 1, new Date(2026,10,20));
  assert.equal(item.status, 'review');
  assert.equal(item.noInvoice, true);
});

test('buildItem: CSV red sa neprepoznatim datumom se označava "review", ne tiho prolazi sa iznosom 0', () => {
  const deps = { clients: [], incomesRsd: [], incomesFx: [], invoices: [] };
  const item = buildItem({ date: '', dateRaw: 'nesto besmisleno', client: '', invoiceNumber: '', currency: 'RSD', amount: 0 }, deps, () => 1, new Date(2026,10,20));
  assert.equal(item.status, 'review');
  assert.ok(item.issues[0].includes('Nisam prepoznala datum'));
});

// Round 30, nalaz 4: datum OBLIKA tačnog (dd.mm.gggg) ali VREDNOSTI koja ne postoji dobija RAZLIČITU,
// precizniju poruku ("Taj datum ne postoji.") od datuma koji se uopšte ne prepoznaje.
test('buildItem: CSV red sa datumom koji ne postoji (31.04.) dobija poruku "Taj datum ne postoji."', () => {
  const deps = { clients: [], incomesRsd: [], incomesFx: [], invoices: [] };
  const item = buildItem({ date: '', dateRaw: '31.04.2026', client: '', invoiceNumber: '', currency: 'RSD', amount: 0 }, deps, () => 1, new Date(2026,10,20));
  assert.equal(item.status, 'review');
  assert.ok(item.issues[0].includes('Taj datum ne postoji'));
});

test('buildItem: prazan ručni red (bez dateRaw/amountRaw) NIJE automatski obeležen kao problem', () => {
  const deps = { clients: [], incomesRsd: [], incomesFx: [], invoices: [] };
  const item = buildItem({ date: '', client: '', invoiceNumber: '', currency: 'EUR', amount: 0 }, deps, () => 1, new Date(2026,10,20));
  assert.equal(item.issues.length, 0, 'prazan ručni red čeka unos, ne prijavljuje grešku unapred');
});

test('buildItem: devizna stavka koristi injektovan kurs (nbsRateFn), ne poziva ga sama', () => {
  const deps = { clients: [], incomesRsd: [], incomesFx: [], invoices: [] };
  let calledWith = null;
  const item = buildItem({ date: '2026-03-15T00:00:00.000Z', client: '', invoiceNumber: '', currency: 'EUR', amount: 100 }, deps, (d,c)=>{ calledWith=[d,c]; return 117.2; }, new Date(2026,10,20));
  assert.equal(item.rate, 117.2);
  assert.equal(item.amountDin, Math.round(100*117.2));
  assert.equal(calledWith[1], 'EUR');
});
