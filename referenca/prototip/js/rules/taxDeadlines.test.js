const test = require('node:test');
const assert = require('node:assert/strict');
const { isWeekend, isHoliday, nextBusinessDay, taxDueDate, orthodoxEaster, HOLIDAYS_2026 } = require('./taxDeadlines.js');

// Round 30, nalaz 3: praznici se sad računaju za BILO KOJU godinu (pravoslavni Uskrs po algoritmu),
// ne samo 2026. Datumi provereni spolja (calendardate.com i dr., Round 30 istraživanje):
// Uskrs 2026 = 12. april, 2027 = 2. maj, 2028 = 16. april.
test('orthodoxEaster: 2026, 2027, 2028 (nezavisno proverene vrednosti)', () => {
  const e26 = orthodoxEaster(2026);
  assert.equal(e26.getFullYear(), 2026); assert.equal(e26.getMonth(), 3); assert.equal(e26.getDate(), 12);
  const e27 = orthodoxEaster(2027);
  assert.equal(e27.getFullYear(), 2027); assert.equal(e27.getMonth(), 4); assert.equal(e27.getDate(), 2);
  const e28 = orthodoxEaster(2028);
  assert.equal(e28.getFullYear(), 2028); assert.equal(e28.getMonth(), 3); assert.equal(e28.getDate(), 16);
});

test('isHoliday: Vaskršnji praznici (Veliki petak do 2. dana Vaskrsa) za 2027 i 2028, ne samo 2026', () => {
  // 2027: Uskrs 2. maj (nedelja) -> Veliki petak 30. april, Vaskrsni ponedeljak 3. maj
  assert.equal(isHoliday(new Date(2027,3,30)), true); // Veliki petak
  assert.equal(isHoliday(new Date(2027,4,3)), true);  // 2. dan Vaskrsa
  // [PROVERITI] Uskrsna nedelja je PO DEFINICIJI uvek nedelja, pa čl. 3a nadoknada (ovde primenjena po
  // pojedinačnom datumu, ne po celom bloku praznika) znači da Vaskršnji praznici dobijaju dodatni neradni
  // dan SVAKE godine (ovde 4. maj) — nisam mogao da potvrdim iz primarnog izvora da li zakon ovo stvarno
  // tako primenjuje na VIŠEDNEVNE praznike ili samo na praznike od jednog dana. Dokumentovano, ne rešeno.
  assert.equal(isHoliday(new Date(2027,4,4)), true);
  // 2028: Uskrs 16. april -> Veliki petak 14. april, ponedeljak 17. april
  assert.equal(isHoliday(new Date(2028,3,14)), true);
  assert.equal(isHoliday(new Date(2028,3,17)), true);
});

test('isHoliday: fiksni praznici rade za bilo koju godinu (Nova godina, Božić, Sretenje, Praznik rada, Dan primirja)', () => {
  for(const y of [2026,2027,2028]){
    assert.equal(isHoliday(new Date(y,0,1)), true, y+'-01-01');
    assert.equal(isHoliday(new Date(y,0,2)), true, y+'-01-02');
    assert.equal(isHoliday(new Date(y,0,7)), true, y+'-01-07');
    assert.equal(isHoliday(new Date(y,1,15)), true, y+'-02-15');
    assert.equal(isHoliday(new Date(y,1,16)), true, y+'-02-16');
    assert.equal(isHoliday(new Date(y,4,1)), true, y+'-05-01');
    assert.equal(isHoliday(new Date(y,4,2)), true, y+'-05-02');
    assert.equal(isHoliday(new Date(y,10,11)), true, y+'-11-11');
  }
});

test('isHoliday: Dan pobede (9. maj) NIJE neradni dan — zakon ga izričito izuzima (čl. 3)', () => {
  assert.equal(isHoliday(new Date(2026,4,9)), false);
});

test('isHoliday: "radni praznici" (čl. 5: Sveti Sava, Vidovdan, ...) NISU neradni dani', () => {
  assert.equal(isHoliday(new Date(2026,0,27)), false); // Sveti Sava
  assert.equal(isHoliday(new Date(2026,5,28)), false); // Vidovdan
});

test('taxDueDate: novembar 2026 — 15. pada u nedelju, pomera se na ponedeljak 16.11. (uživo potvrđeno ranije)', () => {
  const d = taxDueDate('2026-11');
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 10); // novembar
  assert.equal(d.getDate(), 16);
});

test('taxDueDate: kad 15. padne na dan koji je i vikend i praznik u nizu, nijedan preskočeni dan nije radni', () => {
  const d = taxDueDate('2026-02');
  assert.equal(isWeekend(d), false);
  assert.equal(isHoliday(d), false);
  let x = new Date(2026, 1, 15);
  while (x.getTime() < d.getTime()) {
    assert.ok(isWeekend(x) || isHoliday(x), 'dan '+x.toISOString().slice(0,10)+' je preskočen a nije ni vikend ni praznik');
    x = new Date(x.getTime() + 86400000);
  }
});

test('taxDueDate: radi i za 2027/2028 (ranije je bilo HARDKODOVANO samo za 2026)', () => {
  // 2027-02-15 je ponedeljak, ALI Sretenje je fiksan datum (15/16. februar) svake godine bez obzira na dan
  // u nedelji -> 15. i 16. su oba praznik, rok se pomera na prvi radni dan, sredu 17.
  const d27 = taxDueDate('2027-02');
  assert.equal(d27.getFullYear(), 2027); assert.equal(d27.getMonth(), 1); assert.equal(d27.getDate(), 17);
});

test('nextBusinessDay: radni dan bez praznika ostaje nepromenjen', () => {
  const d = nextBusinessDay(new Date(2026, 10, 17));
  assert.equal(d.getDate(), 17);
  assert.equal(d.getMonth(), 10);
});

test('čl. 3a (nadoknada kad praznik padne u nedelju): 2026, Sretenje (15. februar) je nedelja -> 17. februar (utorak) je dodatni neradni dan jer je 16. VEĆ praznik (drugi dan Sretenja)', () => {
  assert.equal(new Date(2026,1,15).getDay(), 0, 'kontrola: 15. februar 2026 je zaista nedelja');
  assert.equal(isHoliday(new Date(2026,1,17)), true, '17. februar — nadoknada, prvi radni dan posle 15/16');
  assert.equal(isHoliday(new Date(2026,1,18)), false, '18. februar — prvi stvarno radni dan, nije praznik');
});

test('čl. 3a: 2026, Uskrs (12. april) je nedelja -> 14. april (utorak) je dodatni neradni dan jer je 13. VEĆ praznik (2. dan Vaskrsa)', () => {
  assert.equal(new Date(2026,3,12).getDay(), 0, 'kontrola: 12. april 2026 je zaista nedelja (Uskrs)');
  assert.equal(isHoliday(new Date(2026,3,14)), true, '14. april — nadoknada');
  assert.equal(isHoliday(new Date(2026,3,15)), false, '15. april — prvi stvarno radni dan');
});

test('[PROVERITI] Subota: zakon (tekst pročitan sa paragraf.rs, nije primarni izvor) pominje nadoknadu SAMO za nedelju, ne i za subotu — 2026, drugi dan Praznika rada (2. maj) je subota, ponedeljak 4. maj NIJE neradan (nema nadoknade za subotu, za razliku od nedelje)', () => {
  assert.equal(new Date(2026,4,2).getDay(), 6, 'kontrola: 2. maj 2026 je zaista subota');
  assert.equal(isHoliday(new Date(2026,4,4)), false, '4. maj (ponedeljak posle) — nema nadoknade za prazik koji je pao u subotu');
});
