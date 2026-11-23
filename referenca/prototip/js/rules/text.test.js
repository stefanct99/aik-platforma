const test = require('node:test');
const assert = require('node:assert/strict');
const { plural, pluralIdx, firstNameVoc } = require('./text.js');

test('plural: jednina (završava na 1, osim 11)', () => {
  for (const n of [1, 21, 31, 101]) assert.equal(pluralIdx(n), 0, n);
});
test('plural: "malo" (2-4, osim 12-14)', () => {
  for (const n of [2, 4, 22]) assert.equal(pluralIdx(n), 1, n);
});
test('plural: "mnogo" (0, 5+, i UVEK 11-14 čak i 111/211)', () => {
  for (const n of [0, 5, 11, 12, 14, 111, 211]) assert.equal(pluralIdx(n), 2, n);
});
test('plural: vraća tačan oblik iz forms niza', () => {
  assert.equal(plural(1, ['dan','dana','dana']), 'dan');
  assert.equal(plural(5, ['dan','dana','dana']), 'dana');
  assert.equal(plural(2, ['stvar','stvari','stvari']), 'stvari');
});

test('firstNameVoc: ime na samoglasnik ostaje nepromenjeno', () => {
  assert.equal(firstNameVoc('Nikola Jovanović'), 'Nikola');
  assert.equal(firstNameVoc('Ana Stojanović'), 'Ana');
});
test('firstNameVoc: ime na suglasnik dobija dodato "e" (radi za ova imena)', () => {
  assert.equal(firstNameVoc('Stefan Milošević'), 'Stefane');
  assert.equal(firstNameVoc('Marko Petrović'), 'Marko'); // završava na samoglasnik, ne menja se
  assert.equal(firstNameVoc('Dragan Lazić'), 'Dragane');
});
test('POZNATO OGRANIČENJE: pravilo NIJE opšti srpski vokativ — "Petar" dobija pogrešan oblik', () => {
  // Ispravan srpski vokativ za "Petar" je "Petre" (ispadanje samoglasnika), pravilo ovde prosto dodaje
  // "e" na kraj i daje "Petare" — ovaj test NAMERNO dokumentuje grešku, ne pokušava da je reši.
  assert.equal(firstNameVoc('Petar Nikolić'), 'Petare');
  assert.notEqual(firstNameVoc('Petar Nikolić'), 'Petre');
});
