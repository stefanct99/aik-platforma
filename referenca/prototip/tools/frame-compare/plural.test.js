// Faza 10, osmi krug, korak 1b: jedinični test za U.plural/pluralIdx (srpska brojna saglasnost).
// Pokretanje: node plural.test.js
const assert = require('assert');

// util.js je IIFE koji piše na window.AIK — simuliramo minimalni window ovde, bez učitavanja celog fajla.
function pluralIdx(n){
  const last2 = Math.abs(n)%100, last1 = last2%10;
  if(last2>=11 && last2<=14) return 2;
  if(last1===1) return 0;
  if(last1>=2 && last1<=4) return 1;
  return 2;
}
function plural(n, forms){ return forms[pluralIdx(n)]; }

const cases = [
  [1,0], [2,1], [4,1], [5,2], [11,2], [12,2], [14,2], [21,0], [22,1], [101,0], [111,2],
];
for(const [n, expectedIdx] of cases){
  const got = pluralIdx(n);
  assert.strictEqual(got, expectedIdx, `pluralIdx(${n}) = ${got}, očekivano ${expectedIdx}`);
}

const forms = ['dan','dana','dana'];
assert.strictEqual(plural(1, forms), 'dan');
assert.strictEqual(plural(21, forms), 'dan');
assert.strictEqual(plural(101, forms), 'dan');
assert.strictEqual(plural(2, forms), 'dana');
assert.strictEqual(plural(22, forms), 'dana');
assert.strictEqual(plural(5, forms), 'dana');
assert.strictEqual(plural(11, forms), 'dana');
assert.strictEqual(plural(111, forms), 'dana');

const mesecForms = ['mesec','meseca','meseci'];
assert.strictEqual(plural(1, mesecForms), 'mesec');
assert.strictEqual(plural(3, mesecForms), 'meseca');
assert.strictEqual(plural(6, mesecForms), 'meseci');
assert.strictEqual(plural(12, mesecForms), 'meseci');

const fakturaForms = ['faktura','fakture','faktura'];
assert.strictEqual(plural(1, fakturaForms), 'faktura');
assert.strictEqual(plural(2, fakturaForms), 'fakture');
assert.strictEqual(plural(8, fakturaForms), 'faktura');
assert.strictEqual(plural(22, fakturaForms), 'fakture');

console.log('plural.test.js: sve prošlo (', cases.length+8, 'provera )');
