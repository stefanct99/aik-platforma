// Pretplata i pristup (PLATFORMA_SPECIFIKACIJA.md 5.5): koje stanje naloga pauzira AI knjigovođu.
// "Otkazana" radi normalno do accessUntil (kraj plaćenog perioda), posle toga je isto kao "Istekla".
// Probni period (i blizu isteka) NIKAD ne pauzira AI — samo dnevna kvota poruka (Ak14, nije ovde).
// Čista funkcija: bez state-a, bez Date.now() — "now" je uvek parametar.
(function(){
  // sub: {status, accessUntil} — jedno od 5 stanja (Probni/Aktivna/Istekla/Naplata nije uspela/Otkazana).
  function computeAccess(sub, now){
    const canceledPastEnd = sub.status==='Otkazana' && sub.accessUntil && new Date(sub.accessUntil) < new Date(now);
    const aiPaused = sub.status==='Istekla' || canceledPastEnd;
    return { aiPaused, status: sub.status, canceledPastEnd };
  }

  // ADMIN_SPECIFIKACIJA.md odeljak 6, peto stanje "besplatan pristup (admin)" — "daje isti pristup kao
  // aktivna pretplata i ne podleže pauziranju AI knjigovođe". Round 30, nalaz 5: POVEZANO preko
  // effectiveAccess ispod (selectors.js ga zove kao Sel.subscriptionAccess). Ostaje tačno, namerno
  // NEUGRAĐENO: PRIKAZ besplatnog pristupa u korisnikovoj (ne-admin) aplikaciji — sidebar kartica, ekran
  // Pretplata — jer ADMIN_SPEC sâm kaže da taj prikaz "nije nacrtan, ne improvizovati". Logika (pristup
  // JESTE omogućen) radi; samo VIZUELNI prikaz te činjenice nije izgrađen.
  // freeAccess: {noEnd, untilIso} — untilIso je ISO datum do kog pristup važi, ili odsutan ako noEnd.
  function isFreeAccessActive(freeAccess, now){
    if(!freeAccess) return false;
    if(freeAccess.noEnd) return true;
    if(!freeAccess.untilIso) return false;
    return new Date(now) < new Date(freeAccess.untilIso);
  }

  // Round 30, nalaz 5 (ADMIN_SPECIFIKACIJA.md odeljak 6): besplatan pristup POBEĐUJE stvarno stanje
  // pretplate — "daje isti pristup kao aktivna pretplata i ne podleže pauziranju AI knjigovođe" bez obzira
  // da li je probni period istekao ili je pretplata otkazana. Kad besplatan pristup prestane da važi
  // (ukinut ili mu prođe rok), vraća se STVARNO stanje pretplate ispod — ništa se trajno ne menja u
  // samoj pretplati, slojevi se samo preklapaju. freeAccess: isti oblik kao u isFreeAccessActive iznad.
  function effectiveAccess(sub, freeAccess, now){
    if(isFreeAccessActive(freeAccess, now)) return { aiPaused:false, status:sub.status, canceledPastEnd:false, freeAccess:true };
    return Object.assign({ freeAccess:false }, computeAccess(sub, now));
  }

  // Mala ispravka (posle Round 30): podaci za PRIKAZ besplatnog pristupa (sidebar kartica, ekran
  // Pretplata) — bez formatiranja datuma (to ostaje na UI, svaki ekran ima svoj format). null kad nije
  // aktivan (uključujući istekao rok), inače {noEnd, untilIso}.
  function freeAccessCardInfo(freeAccess, now){
    if(!isFreeAccessActive(freeAccess, now)) return null;
    return { noEnd: !!freeAccess.noEnd, untilIso: freeAccess.untilIso || null };
  }

  const api = { computeAccess, isFreeAccessActive, effectiveAccess, freeAccessCardInfo };
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  if(typeof window !== 'undefined'){ window.AIK = window.AIK || {}; window.AIK.Rules = window.AIK.Rules || {}; window.AIK.Rules.subscriptionAccess = api; }
})();
