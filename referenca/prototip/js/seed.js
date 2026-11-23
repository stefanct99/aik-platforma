// Prilog B seed data. "Danas" u prototipu je fiksirano na 15.11.2026 (nedelja) da se poklapa sa primerima iz dizajna.
(function(){
  const D = (y,m,d)=> new Date(y,m-1,d).toISOString();
  const TODAY = new Date(2026,10,15); // 15. novembar 2026, nedelja

  const user = {
    id:'u1', name:'Stefan Milošević', email:'stefan@stephortless.com', phone:'+381 60 123 4567',
    emailVerified:true, twoFactor:false, theme:'system', lang:'sr', dateFormat:'dd.mm.yyyy.',
    createdAt: D(2024,3,14),
    // ADMIN_SPEC 8: u prototipu je uloga admin podrazumevano uključena (Stefanov sopstveni nalog).
    // Dev meni ima prekidač "Uloga: korisnik / admin" da se testira i stanje bez pristupa.
    role: 'admin',
  };

  const business = {
    id:'b1', name:'Stephortless PR', ownerName:'Stefan Milošević', pib:'112233445', mb:'66554433',
    delatnostCode:'6201', delatnostName:'Računarsko programiranje',
    regDate: D(2024,3,14), street:'Bulevar kralja Aleksandra 12', city:'Beograd', zip:'11000',
    contactEmail:'stefan@stephortless.com', phone:'+381 60 123 4567', logo:null,
    inboundSlug:'stephortless', inboundCode:'4k7q',
  };

  const accounts = [
    {id:'acc1', type:'RSD', currency:'RSD', bank:'Banka Primer', number:'160-0000123456-78', isDefault:true},
    {id:'acc2', type:'devizni', currency:'EUR', bank:'Banka Primer', iban:'RS35 1600 0000 1234 5678 90', swift:'BANKRSBG', isDefault:true},
    {id:'acc3', type:'devizni', currency:'USD', bank:'Banka Primer', iban:'RS35 1600 0000 1234 9999 11', swift:'BANKRSBG', isDefault:true},
  ];

  const clients = [
    {id:'c1', name:'Acme Inc.', country:'SAD', billingEmail:'billing@acme.com', address:'', domestic:false,
      defaultCurrency:'EUR', defaultLang:'en', defaultDueDays:3, defaultAccountId:'acc2',
      defaultItem:{desc:'Webflow development', amount:900}, autoSend:true, fxMode:'book_only'},
    {id:'c2', name:'Northwind Ltd.', country:'UK', billingEmail:'accounts@northwind.co.uk', address:'', domestic:false,
      defaultCurrency:'EUR', defaultLang:'en', defaultDueDays:7, defaultAccountId:'acc2',
      defaultItem:null, autoSend:false, fxMode:'book_only'},
    {id:'c3', name:'Bluebird GmbH', country:'Nemačka', billingEmail:'buchhaltung@bluebird.de', address:'', domestic:false,
      defaultCurrency:'EUR', defaultLang:'en', defaultDueDays:14, defaultAccountId:'acc2',
      defaultItem:{desc:'Održavanje', amount:2400}, autoSend:true, fxMode:'sell_all'},
    {id:'c4', name:'Joam Technologies LLC', country:'SAD', billingEmail:'ap@joamtech.com', address:'', domestic:false,
      defaultCurrency:'USD', defaultLang:'en', defaultDueDays:15, defaultAccountId:'acc3',
      defaultItem:{desc:'Maintenance', amount:441.28}, autoSend:false, fxMode:'book_only'},
    {id:'c5', name:'Marko Petrović PR', country:'Srbija', billingEmail:'marko@petrovic.rs', address:'', domestic:true,
      defaultCurrency:'RSD', defaultLang:'sr', defaultDueDays:10, defaultAccountId:'acc1',
      defaultItem:null, autoSend:false, fxMode:'none'},
    {id:'c6', name:'Cloudly Inc.', country:'SAD', billingEmail:'finance@cloudly.io', address:'', domestic:false,
      defaultCurrency:'USD', defaultLang:'en', defaultDueDays:15, defaultAccountId:'acc3',
      defaultItem:{desc:'Consulting', amount:2100}, autoSend:false, fxMode:'book_only'},
    {id:'c7', name:'Pekara Zlatni Klas', country:'Srbija', billingEmail:'kontakt@zlatniklas.rs', address:'', domestic:true,
      defaultCurrency:'RSD', defaultLang:'sr', defaultDueDays:10, defaultAccountId:'acc1', defaultItem:null, autoSend:false, fxMode:'none'},
    {id:'c8', name:'Mali Princ', country:'Srbija', billingEmail:'info@maliprinc.rs', address:'', domestic:true,
      defaultCurrency:'RSD', defaultLang:'sr', defaultDueDays:10, defaultAccountId:'acc1', defaultItem:null, autoSend:false, fxMode:'none'},
    {id:'c9', name:'Studio Nova d.o.o.', country:'Srbija', billingEmail:'office@studionova.rs', address:'', domestic:true,
      defaultCurrency:'RSD', defaultLang:'sr', defaultDueDays:10, defaultAccountId:'acc1', defaultItem:null, autoSend:true, fxMode:'none'},
  ];

  // broj fakture format 25/26-N (poslovna godina 2025/26)
  const invoices = [
    {id:'i07', number:'25/26-07', clientId:'c1', currency:'EUR', lang:'en', issueDate:D(2026,7,29), dueDays:7,
      items:[{desc:'Webflow development', qty:1, price:1200}], accountId:'acc2', status:'Plaćena', paidDate:D(2026,8,5)},
    {id:'i10', number:'25/26-10', clientId:'c2', currency:'EUR', lang:'en', issueDate:D(2026,9,1), dueDays:7,
      items:[{desc:'Design services', qty:1, price:900}], accountId:'acc2', status:'Plaćena', paidDate:D(2026,9,14)},
    {id:'i11', number:'25/26-11', clientId:'c4', currency:'USD', lang:'en', issueDate:D(2026,10,10), dueDays:15,
      items:[{desc:'Maintenance', qty:1, price:441.28}], accountId:'acc3', status:'Poslata'},
    {id:'i12', number:'25/26-12', clientId:'c3', currency:'EUR', lang:'en', issueDate:D(2026,10,19), dueDays:14,
      items:[{desc:'Održavanje', qty:1, price:2400}], accountId:'acc2', status:'Plaćena', paidDate:D(2026,11,2)},
    {id:'i13', number:'25/26-13', clientId:'c2', currency:'EUR', lang:'en', issueDate:D(2026,10,9), dueDays:7,
      items:[{desc:'Design services', qty:1, price:850}], accountId:'acc2', status:'Poslata'},
    {id:'i14', number:'25/26-14', clientId:'c1', currency:'EUR', lang:'en', issueDate:D(2026,11,12), dueDays:3,
      items:[{desc:'Webflow development', qty:1, price:1200}], accountId:'acc2', status:'Poslata'},
    {id:'i15', number:'25/26-15', clientId:'c6', currency:'USD', lang:'en', issueDate:D(2026,11,15), dueDays:15,
      items:[{desc:'Consulting', qty:1, price:2100}], accountId:'acc3', status:'Nacrt'},
    {id:'i09', number:'25/26-09', clientId:'c9', currency:'RSD', lang:'sr', issueDate:D(2026,11,10), dueDays:10,
      items:[{desc:'Dizajn usluge', qty:1, price:180000}], accountId:'acc1', status:'Plaćena', paidDate:D(2026,11,15)},
  ];

  const incomesFx = [
    {id:'inc0', date:D(2026,11,16), clientId:null, invoiceId:null, currency:'EUR', amount:1250, rate:117.20, source:'Mejl banke', noInvoice:true},
    {id:'inc1', date:D(2026,8,5), clientId:'c1', invoiceId:'i07', currency:'EUR', amount:1200, rate:117.25, source:'Mejl banke'},
    // Prilog B / frejmovi Kp1, Kp4: peti devizni priliv, 15.11. Acme 1.200 € (117,20), vezan za fakturu 25/26-14 (i14).
    // Mb3 potvrđuje isto ("Povezao sam uplatu sa fakturom 25/26-14"), dok je mejl banke bm1 i dalje "Čeka tvoje odobrenje" —
    // frejm pokazuje da je priliv već uknjižen u Knjigu prihoda PRE odobrenja mejla; status fakture ostaje "Poslata"
    // (menja se u "Plaćena" tek kad korisnik odobri i pošalje dokumenta banci, BankMails.approveSend).
    {id:'inc5', date:D(2026,11,15), clientId:'c1', invoiceId:'i14', currency:'EUR', amount:1200, rate:117.20, source:'Mejl banke'},
    {id:'inc2', date:D(2026,9,14), clientId:'c2', invoiceId:'i10', currency:'EUR', amount:900, rate:117.30, source:'Mejl banke'},
    {id:'inc3', date:D(2026,10,10), clientId:'c4', invoiceId:'i11', currency:'USD', amount:441.28, rate:107.10, source:'Mejl banke'},
    {id:'inc4', date:D(2026,11,2), clientId:'c3', invoiceId:'i12', currency:'EUR', amount:2400, rate:117.20, source:'Mejl banke'},
  ];
  const incomesRsd = [
    {id:'incr1', date:D(2026,7,3), clientId:'c7', invoiceId:null, amount:45000, source:'Ručno'},
    {id:'incr2', date:D(2026,8,22), clientId:'c7', invoiceId:null, amount:96000, source:'Ručno'},
    {id:'incr3', date:D(2026,9,17), clientId:'c8', invoiceId:null, amount:180000, source:'Ručno'},
    {id:'incr4', date:D(2026,10,28), clientId:'c8', invoiceId:null, amount:96000, source:'Ručno'},
    {id:'incr5', date:D(2026,11,15), clientId:'c9', invoiceId:'i09', amount:180000, source:'Mejl banke'},
  ];

  const taxDecision = {
    id:'td1', year:2026, fileName:'Resenje_2026.pdf', pib:'112233445', addedAt:D(2026,11,12),
    items:[
      {key:'porez', name:'Porez na prihod od samostalne delatnosti', amount:4950.00, account:'840-711122843-47', pozivNaBroj:'97 11-2026-0481'},
      {key:'pio', name:'PIO za radni staž', amount:12311.28, account:'840-721211843-26', pozivNaBroj:'97 12-2026-0481'},
      {key:'zdravstveno', name:'Zdravstveno osiguranje', amount:5283.59, account:'840-721311843-19', pozivNaBroj:'97 13-2026-0481'},
      {key:'nezaposlenost', name:'Osiguranje za slučaj nezaposlenosti', amount:384.73, account:'840-721411843-12', pozivNaBroj:'97 14-2026-0481'},
    ],
  };
  // monthly tax payments status map: { '2026-10': {porez:'Plaćeno', pio:'Plaćeno', ...}, '2026-11': {...all 'Neplaćeno'} }
  const taxPayments = {
    '2026-09':{porez:'Plaćeno',pio:'Plaćeno',zdravstveno:'Plaćeno',nezaposlenost:'Plaćeno'},
    '2026-10':{porez:'Plaćeno',pio:'Plaćeno',zdravstveno:'Plaćeno',nezaposlenost:'Plaćeno'},
    '2026-11':{porez:'Neplaćeno',pio:'Neplaćeno',zdravstveno:'Neplaćeno',nezaposlenost:'Neplaćeno'},
  };

  const bankMailTemplates = [
    {id:'bm1', kind:'devizni', amount:1200, currency:'EUR', clientId:'c1', invoiceId:'i14', sender:'obavestenja@erstebank.rs',
      replyTo:'devizni.dokumenta@erstebank.rs', subject:'Priliv 1.200,00 EUR, potrebna dokumentacija',
      status:'Čeka tvoje odobrenje', problem:null, receivedAt: new Date(2026,10,15,10,12).toISOString(),
      body:'Poštovani,\n\nobaveštavamo vas da je na vaš devizni račun evidentiran priliv od 1.200,00 EUR od pošiljaoca Acme Inc. Radi evidentiranja priliva molimo vas da dostavite fakturu, raspored priliva i nalog za prodaju deviza.\n\nDokumentaciju pošaljite na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank, Sektor platnog prometa'},
    {id:'bm2', kind:'devizni', amount:2400, currency:'EUR', clientId:'c3', invoiceId:'i12', sender:'obavestenja@erstebank.rs',
      replyTo:'devizni.dokumenta@erstebank.rs', subject:'Priliv 2.400,00 EUR, potrebna dokumentacija',
      status:'Poslato automatski', problem:null, receivedAt: new Date(2026,10,2,9,41).toISOString(),
      history:[{label:'Poslato banci', at:new Date(2026,10,2,9,43).toISOString()}, {label:'Devize prodate', at:new Date(2026,10,2,9,51).toISOString()}],
      fxSale:{amount:2400, currency:'EUR', rate:117.20, dinars:281280},
      body:'Poštovani,\n\nobaveštavamo vas da je na vaš devizni račun evidentiran priliv od 2.400,00 EUR od pošiljaoca Bluebird GmbH. Radi evidentiranja priliva molimo vas da dostavite fakturu, raspored priliva i nalog za prodaju deviza.\n\nDokumentaciju pošaljite na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank, Sektor platnog prometa'},
    {id:'bm3', kind:'problem_no_invoice', amount:1250, currency:'EUR', clientId:null, invoiceId:null, sender:'obavestenja@erstebank.rs',
      replyTo:'devizni.dokumenta@erstebank.rs', subject:'Priliv 1.250,00 EUR, potrebna dokumentacija',
      status:'Treba mi tvoja pomoć', problem:'no_invoice', senderName:'Delta Studio SRL', receivedAt: new Date(2026,10,14,15,3).toISOString(),
      body:'Poštovani,\n\nobaveštavamo vas da je na vaš devizni račun evidentiran priliv od 1.250,00 EUR od pošiljaoca Delta Studio SRL. Molimo da dostavite dokumentaciju na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank'},
    {id:'bm4', kind:'devizni', amount:441.28, currency:'USD', clientId:'c4', invoiceId:'i11', sender:'obavestenja@erstebank.rs',
      replyTo:'devizni.dokumenta@erstebank.rs', subject:'Priliv 441,28 USD, potrebna dokumentacija',
      status:'Poslato banci', problem:null, receivedAt: new Date(2026,9,10,11,20).toISOString(),
      history:[{label:'Poslato banci', at:new Date(2026,9,10,11,35).toISOString()}],
      body:'Poštovani,\n\nobaveštavamo vas da je na vaš devizni račun evidentiran priliv od 441,28 USD od pošiljaoca Joam Technologies LLC. Molimo vas da dostavite fakturu, raspored priliva i nalog za prodaju deviza.\n\nDokumentaciju pošaljite na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank, Sektor platnog prometa'},
    {id:'bm5', kind:'dinarski', amount:180000, currency:'RSD', clientId:'c9', invoiceId:'i09', sender:'obavestenja@erstebank.rs',
      replyTo:'devizni.dokumenta@erstebank.rs', subject:'Priliv 180.000,00 RSD, potrebna faktura',
      status:'Poslato automatski', problem:null, receivedAt: new Date(2026,10,15,11,48).toISOString(),
      history:[{label:'Poslato banci', at:new Date(2026,10,15,11,49).toISOString()}],
      body:'Poštovani,\n\nobaveštavamo vas da je na vaš dinarski račun evidentiran priliv od 180.000,00 RSD od pošiljaoca Studio Nova d.o.o. Za knjiženje priliva molimo da dostavite fakturu na adresu devizni.dokumenta@erstebank.rs.\n\nSrdačan pozdrav,\nErste Bank, Sektor platnog prometa'},
    {id:'bm6', kind:'extra_doc', amount:0, currency:null, clientId:null, invoiceId:null, sender:'obavestenja@erstebank.rs',
      replyTo:'kontrola@erstebank.rs', subject:'Zahtev za dodatni dokument',
      status:'Treba mi tvoja pomoć', problem:'extra_doc', deadlineDays:5, receivedAt: new Date(2026,9,8,14,35).toISOString(), relatedDate: D(2026,8,5),
      body:'Poštovani,\n\nu okviru redovne kontrole poslovanja molimo vas da dostavite potvrdu o poreklu sredstava za priliv od 05.08.2026. Odgovor pošaljite na adresu kontrola@erstebank.rs u roku od 5 radnih dana.\n\nSrdačan pozdrav,\nErste Bank, Služba kontrole'},
  ];

  const subscription = {
    status:'Probni', plan:'Sve uključeno', period:null, trialDaysLeft:23, trialEndsAt: D(2026,12,8),
    paymentMethod:null, nextChargeAt:null, history:[], cancelReason:null, accessUntil:null,
  };

  // 3.13: tip po kanalu (isti podaci se vide u Podešavanjima > Obaveštenja, Pd4).
  const notifications = [
    {id:'n1', read:false, type:'Novi mejl banke', title:'Uplata od Northwind Ltd.', body:'850 €, potvrdi da je za fakturu 25/26-13.', at: new Date(2026,10,15,12,0).toISOString(), route:'app/mejlovi'},
    {id:'n2', read:false, type:'Rokovi za porez', title:'Rok za akontaciju je sutra', body:'Akontacija za oktobar, 22.929,60 din.', at: new Date(2026,10,15,7,0).toISOString(), route:'app/porez'},
    {id:'n3', read:true, type:'Novi mejl banke', title:'Stigao je novi mejl banke', body:'Proknjižena uplata od Acme Inc., 1.200 €.', at: D(2026,11,14), route:'app/mejlovi'},
    {id:'n4', read:true, type:'AI je nešto primetio', title:'Obrazac za banku je spreman', body:'Pregledaj ga pa pošalji.', at: D(2026,11,12), route:'app/mejlovi'},
  ];

  // Faza 8 (6.11, 7.12): istorija razgovora sa AI knjigovođom, ista lista za Ak10 traku i Ak16/17 upravljanje.
  // Svaka poruka ima "kind" koji prati tip komponente iz 7.12 (data/regulation/scenario/action/refusal/attachment/proactive).
  const conversations = [
    {id:'conv1', title:'Koliko sam do limita?', updatedAt:new Date(2026,10,15,16,48).toISOString(), messages:[
      {id:'m1a', role:'user', at:new Date(2026,10,15,16,48).toISOString(), text:'Koliko sam do limita?'},
      {id:'m1b', role:'ai', at:new Date(2026,10,15,16,49).toISOString(), kind:'data', scenarioId:'limit'},
    ]},
    {id:'conv2', title:'Napravi fakturu za Acme', updatedAt:new Date(2026,10,15,11,20).toISOString(), messages:[
      {id:'m2a', role:'user', at:new Date(2026,10,15,11,20).toISOString(), text:'Napravi fakturu za Acme'},
      {id:'m2b', role:'ai', at:new Date(2026,10,15,11,21).toISOString(), kind:'action', scenarioId:'napravi-fakturu', resolved:null},
    ]},
    {id:'conv3', title:'Faktura za Acme, mart', updatedAt:new Date(2026,10,14,9,5).toISOString(), messages:[
      {id:'m3a', role:'user', at:new Date(2026,10,14,9,5).toISOString(), text:'Napravi fakturu za Acme za usluge u martu, 1.200 evra.'},
      {id:'m3b', role:'ai', at:new Date(2026,10,14,9,6).toISOString(), kind:'action', scenarioId:'napravi-fakturu', resolved:'created'},
    ]},
    {id:'conv4', title:'Priliv iz Nemačke, prijava', updatedAt:new Date(2026,10,12,10,30).toISOString(), messages:[
      {id:'m4a', role:'user', at:new Date(2026,10,12,10,30).toISOString(), text:'Da li moram da prijavim priliv od klijenta iz Nemačke?'},
      {id:'m4b', role:'ai', at:new Date(2026,10,12,10,31).toISOString(), kind:'regulation', scenarioId:'prijava-inostranstvo'},
    ]},
    {id:'conv5', title:'Podsetnik za Joam', updatedAt:new Date(2026,10,8,14,15).toISOString(), messages:[
      {id:'m5a', role:'user', at:new Date(2026,10,8,14,15).toISOString(), text:'Pošalji podsetnik za kasne fakture'},
      {id:'m5b', role:'ai', at:new Date(2026,10,8,14,16).toISOString(), kind:'text', text:'Faktura 25/26-11 (Joam Technologies LLC) kasni. Otvori je u Fakturama da pošalješ podsetnik — tekst ti već pripremim tamo.'},
    ]},
    {id:'conv6', title:'Kako se računa kurs', updatedAt:new Date(2026,10,2,16,0).toISOString(), messages:[
      {id:'m6a', role:'user', at:new Date(2026,10,2,16,0).toISOString(), text:'Kako se računa kurs za devizne uplate?'},
      {id:'m6b', role:'ai', at:new Date(2026,10,2,16,1).toISOString(), kind:'text', text:'Za devizne uplate koristim zvanični srednji kurs NBS na dan priliva, ne na dan izdavanja fakture. Taj kurs upisujem u Knjigu prihoda uz iznos u dinarima.'},
    ]},
    {id:'conv7', title:'Šta ako pređem limit?', updatedAt:new Date(2026,9,28,10,0).toISOString(), messages:[
      {id:'m7a', role:'user', at:new Date(2026,9,28,10,0).toISOString(), text:'Šta ako pređem limit?'},
      {id:'m7b', role:'ai', at:new Date(2026,9,28,10,1).toISOString(), kind:'regulation', scenarioId:'limit-prekoracen'},
    ]},
    {id:'conv8', title:'Prvi PDV pragovi', updatedAt:new Date(2026,9,14,9,0).toISOString(), messages:[
      {id:'m8a', role:'user', at:new Date(2026,9,14,9,0).toISOString(), text:'Kada moram da se prijavim za PDV?'},
      {id:'m8b', role:'ai', at:new Date(2026,9,14,9,1).toISOString(), kind:'regulation', scenarioId:'pdv-prag'},
    ]},
  ];

  // ===================== Faza 11: Admin (ADMIN_SPECIFIKACIJA, Prilog B) =====================
  // "Danas" za ceo Admin odeljak je 20.11.2026 — NE isto što i gornji TODAY (15.11.2026, ostatak
  // aplikacije) — izvedeno iz više nezavisnih tragova u Prilogu B koji se svi slažu: Nikola Jovanović
  // probni "ističe za 3 dana" + sledeća naplata data kao 23.11.2026 (20+3); Luka Marković "ističe za
  // 12 dana" + 02.12.2026 (20+12); najnoviji zapis u Dnevniku radnji je 20.11.2026 11:42; grafik "Nove
  // registracije po danima" poslednja oznaka je "20. nov". Ukupno 128 korisnika NE uključuje naloge sa
  // besplatnim pristupom (ni vlasnikov) — oni se vide u listi pod "Svi" ali se ne broje u Ukupno, u
  // četiri pilule (Probni/Aktivni/Naplata/Otkazani) ni u MRR (korisnikova odluka, ADMIN_PAKET2).
  const ADMIN_TODAY = new Date(2026,10,20);
  const adminDay = (n)=> new Date(ADMIN_TODAY.getTime()+n*86400000).toISOString();

  // Determinističko punjenje (mulberry32) — ista 128 korisnika na svakom učitavanju, ne Math.random()
  // (bitno za run.js snimke i ponovljivost poređenja frejm-protiv-ekrana).
  function mulberry32(seed){
    return function(){
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const arng = mulberry32(128128);
  function aPick(arr){ return arr[Math.floor(arng()*arr.length)]; }
  function aInt(min,max){ return min+Math.floor(arng()*(max-min+1)); }
  const A_FIRST = ['Marko','Jelena','Nikola','Ana','Luka','Milica','Petar','Dragan','Jovana','Milan','Tamara','Nemanja','Ivana','Aleksandar','Teodora','Miloš','Sara','Vladimir','Katarina','Filip','Dunja','Nenad','Bojan','Marija','Dušan','Tijana','Uroš','Jovan','Sofija','Darko','Vesna','Goran','Snežana','Zoran','Biljana','Saša','Dragana','Igor','Danijela','Slobodan'];
  const A_LAST = ['Petrović','Ilić','Jovanović','Stojanović','Marković','Đorđević','Nikolić','Lazić','Popović','Pavlović','Ristić','Radović','Stanković','Simić','Vuković','Antić','Milenković','Savić','Obradović','Tomić','Živković','Dimitrijević','Mitrović','Jovičić','Kovačević','Perić','Todorović','Branković','Cvetković','Janković'];
  const A_SERVICE = ['Dizajn','Prevodi','Foto','Web','Audio','Kopirajting','Konsalting','Marketing','Fotografija','Programiranje','Knjigovodstvo','Grafika','Prevod','Nekretnine','Event','Ilustracija','Video produkcija','Arhitektura','Pravni saveti','Brendiranje'];
  function aCompany(first, last, service){
    // "Petrović Dizajn" stil je najčešći (5/7 primera iz Priloga B); "NJ Foto"/"MD Kopirajting"
    // (inicijali) su ređi (2/7) — isti odnos približno ovde (1/5).
    if(aInt(0,4)===0) return aInitials(first,last)+' '+service;
    return last+' '+service;
  }
  function aInitials(first,last){ return (first[0]+last[0]).toUpperCase(); }
  function aActivityLabel(daysAgo){ if(daysAgo<=0) return 'Danas'; if(daysAgo===1) return 'Juče'; return 'Pre '+daysAgo+' '+U_dayWord(daysAgo); }
  function U_dayWord(n){ const n2=n%10, n10=n%100; if(n10>=11&&n10<=14) return 'dana'; if(n2===1) return 'dan'; return 'dana'; }
  function aPlural(n, forms){ const n2=n%10, n10=n%100; if(n10>=11&&n10<=14) return forms[2]; if(n2===1) return forms[0]; if(n2>=2&&n2<=4) return forms[1]; return forms[2]; }
  function fmtAdminDate(iso){ const d=new Date(iso); return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()+'.'; }

  // Prvih 7 (od 8 iz Priloga B — Stefan je poseban, van liste od 128, videti adminFreeAccess ispod),
  // tačno kao u tabeli. Ostalih 120 se generiše da zbir po statusu bude tačno 18/79/5/26.
  const A_SAMPLE = [
    {first:'Marko', last:'Petrović', company:'Petrović Dizajn', status:'aktivna', planMonths:12, registered:D(2026,3,12), activityDays:0, nextBilling:D(2027,3,15)},
    {first:'Jelena', last:'Ilić', company:'Ilić Prevodi', status:'aktivna', planMonths:3, registered:D(2026,9,28), activityDays:1, nextBilling:D(2026,12,28)},
    {first:'Nikola', last:'Jovanović', company:'NJ Foto', status:'probni', trialDaysLeft:3, registered:D(2026,11,10), activityDays:2},
    {first:'Ana', last:'Stojanović', company:'Stojanović Web', status:'naplata', planMonths:6, registered:D(2026,6,2), activityDays:5, retryDaysOut:2},
    {first:'Luka', last:'Marković', company:'Marković Audio', status:'probni', trialDaysLeft:12, registered:D(2026,11,17), activityDays:0},
    {first:'Milica', last:'Đorđević', company:'MD Kopirajting', status:'otkazana', registered:D(2026,1,14), activityDays:18, accessUntil:D(2026,12,14)},
    {first:'Petar', last:'Nikolić', company:'Nikolić Konsalting', status:'aktivna', planMonths:1, registered:D(2026,11,5), activityDays:3, nextBilling:D(2026,12,5)},
  ];
  // Registracije u poslednjih 30 dana (0=najstariji, 29=danas) — isti niz kao Pregled grafik. Nikola
  // (dan -10), Luka (dan -3) i Petar (dan -15) zauzimaju svoj dan; ostatak od 39 se raspoređuje na
  // preostale generisane korisnike da dnevni zbir OSTANE tačan (cross-check sa Pregled grafikom).
  const A_REG_BY_DAY = [0,1,1,2,1,0,2,1,1,3,1,0,2,1,2,1,0,1,2,1,3,1,1,2,0,2,1,2,1,3];
  const A_REG_CONSUMED = {19:1, 26:1, 14:1}; // indeksi za Nikola/Luka/Petar (29-10,29-3,29-15)

  function genAdminUsers(){
    const need = { probni:18-2, aktivna:79-3, naplata:5-1, otkazana:26-1 }; // minus uzorci
    const out = [];
    A_SAMPLE.forEach((u,i)=>{
      const rec = { id:'au'+i, name:u.first+' '+u.last, company:u.company, initials:aInitials(u.first,u.last), status:u.status,
        registered:u.registered, activityLabel:aActivityLabel(u.activityDays) };
      if(u.status==='probni'){ rec.plan='Probni period'; rec.badge='Probni, ističe za '+u.trialDaysLeft+' '+U_dayWord(u.trialDaysLeft); rec.nextBilling=fmtAdminDate(adminDay(u.trialDaysLeft)); }
      else if(u.status==='aktivna'){ rec.plan='Aktivna, '+u.planMonths+' '+aPlural(u.planMonths,['mesec','meseca','meseci']); rec.badge='Aktivna'; rec.nextBilling=fmtAdminDate(u.nextBilling); }
      else if(u.status==='naplata'){ rec.plan='Aktivna, '+u.planMonths+' '+aPlural(u.planMonths,['mesec','meseca','meseci']); rec.badge='Naplata nije uspela'; rec.nextBilling='Pokušaj '+fmtAdminDate(adminDay(u.retryDaysOut)).slice(0,6); }
      else { rec.plan='Otkazana'; rec.badge='Otkazana'; rec.nextBilling='Pristup do '+fmtAdminDate(u.accessUntil).slice(0,6); }
      out.push(rec);
    });
    // 36 preostalih "novih" slotova (39 ukupno - 3 uzorka) raspoređenih po danima po istom nizu.
    const newSlots = [];
    A_REG_BY_DAY.forEach((count,idx)=>{ const used=A_REG_CONSUMED[idx]||0; for(let k=0;k<count-used;k++) newSlots.push(idx); });
    let newSlotIdx = 0;
    let n = A_SAMPLE.length;
    ['probni','aktivna','naplata','otkazana'].forEach(status=>{
      for(let k=0;k<need[status]; k++){
        const first = aPick(A_FIRST), last = aPick(A_LAST);
        const isNew = newSlotIdx < newSlots.length && (status==='probni' || arng()<0.25);
        const dayIdx = isNew ? newSlots[newSlotIdx++] : null;
        const registered = dayIdx!=null ? adminDay(-(29-dayIdx)) : adminDay(-aInt(31,620));
        const activityDays = status==='otkazana' ? aInt(10,60) : aInt(0,20);
        const rec = { id:'au'+(n++), name:first+' '+last, company:aCompany(first, last, aPick(A_SERVICE)), initials:aInitials(first,last),
          status, registered, activityLabel:aActivityLabel(activityDays) };
        if(status==='probni'){
          const trialDaysLeft = k<5 ? aInt(1,7) : aInt(8,29);
          rec.plan='Probni period'; rec.badge='Probni, ističe za '+trialDaysLeft+' '+U_dayWord(trialDaysLeft); rec.nextBilling=fmtAdminDate(adminDay(trialDaysLeft));
        } else if(status==='aktivna'){
          const months = aPick([1,3,6,12]);
          rec.plan='Aktivna, '+months+' '+aPlural(months,['mesec','meseca','meseci']); rec.badge='Aktivna'; rec.nextBilling=fmtAdminDate(adminDay(aInt(5,340)));
        } else if(status==='naplata'){
          const months = aPick([1,3,6,12]);
          rec.plan='Aktivna, '+months+' '+aPlural(months,['mesec','meseca','meseci']); rec.badge='Naplata nije uspela'; rec.nextBilling='Pokušaj '+fmtAdminDate(adminDay(aInt(1,5))).slice(0,6);
        } else {
          rec.plan='Otkazana'; rec.badge='Otkazana'; rec.nextBilling='Pristup do '+fmtAdminDate(adminDay(aInt(5,60))).slice(0,6);
        }
        out.push(rec);
      }
    });
    return out;
  }

  // Dnevnik radnji (ADMIN_SPEC 4.4, Prilog B): 7 primera dati doslovno + 41 generisan da filteri
  // zbroje tačno 9/17/14/8 (Besplatan pristup/Popusti i produženja/Promene plana/Izvozi = 48 ukupno).
  function adminLogTime(daysAgo, h, m){ return new Date(ADMIN_TODAY.getTime()-daysAgo*86400000+h*3600000+m*60000).toISOString(); }
  const A_GIVEN_LOG = [
    { at:adminLogTime(0,11,42), action:'Odobren besplatan pristup', user:'Petar Nikolić', detail:'Pun plan, bez roka', cat:'besplatan' },
    { at:adminLogTime(1,16,5), action:'Produžen probni period', user:'Nikola Jovanović', detail:'+7 dana, do 30.11.2026.', cat:'popusti' },
    { at:adminLogTime(1,9,18), action:'Ručni popust', user:'Ana Stojanović', detail:'20% na sledeću naplatu', cat:'popusti' },
    { at:adminLogTime(3,14,30), action:'Ukinut besplatan pristup', user:'Dragan Lazić', detail:'Pun plan vraćen na probni', cat:'besplatan' },
    { at:adminLogTime(6,10,12), action:'Izvezen izveštaj', user:'Sistem', detail:'Korisnici, 01. do 14. nov', cat:'izvozi' },
    { at:adminLogTime(8,18,44), action:'Promenjen plan', user:'Jelena Ilić', detail:'Iz 1 meseca u 3 meseca', cat:'plan' },
    { at:adminLogTime(12,12,1), action:'Odobren besplatan pristup', user:'Stefan Milošević', detail:'Pun plan, bez roka', cat:'besplatan' },
  ];
  function genAdminLog(allUsers){
    const names = allUsers.map(u=>u.name);
    const need = { besplatan:9-3, popusti:17-2, plan:14-1, izvozi:8-1 };
    const out = A_GIVEN_LOG.slice();
    function pushEntries(cat, count, build){ for(let i=0;i<count;i++){ const daysAgo=aInt(1,29), h=aInt(8,19), m=aInt(0,59); out.push(Object.assign({at:adminLogTime(daysAgo,h,m), cat}, build())); } }
    pushEntries('besplatan', need.besplatan, ()=>{
      const grant = arng()<0.7;
      const user = aPick(names);
      return grant ? {action:'Odobren besplatan pristup', user, detail: arng()<0.5?'Pun plan, bez roka':'Pun plan, do '+fmtAdminDate(adminDay(aInt(10,90)))}
                   : {action:'Ukinut besplatan pristup', user, detail:'Pun plan vraćen na '+(arng()<0.5?'probni':'istekao')};
    });
    pushEntries('popusti', need.popusti, ()=>{
      const user = aPick(names);
      if(arng()<0.5){ const pct=aPick([10,15,20,25,30]); return {action:'Ručni popust', user, detail:pct+'% na sledeću naplatu'}; }
      const days=aPick([3,5,7,10,14]); return {action:'Produžen probni period', user, detail:'+'+days+' dana, do '+fmtAdminDate(adminDay(days))};
    });
    pushEntries('plan', need.plan, ()=>{
      const user = aPick(names); const pairs=[[1,3],[3,6],[1,12],[6,12],[3,1],[12,1]]; const [a,b]=aPick(pairs);
      return {action:'Promenjen plan', user, detail:'Iz '+a+' '+aPlural(a,['mesec','meseca','meseci'])+' u '+b+' '+aPlural(b,['mesec','meseca','meseci'])};
    });
    pushEntries('izvozi', need.izvozi, ()=>{
      const kind = aPick(['Korisnici','Dnevnik radnji']);
      return {action:'Izvezen izveštaj', user:'Sistem', detail:kind+', izveštaj'};
    });
    out.sort((a,b)=> new Date(b.at)-new Date(a.at));
    return out.map((e,i)=> ({ id:'log'+i, at:e.at, action:e.action, user:e.user, detail:e.detail, cat:e.cat }));
  }

  const A_USERS_FOR_SEED = genAdminUsers();
  const adminSeed = {
    TODAY: ADMIN_TODAY.toISOString(),
    users: A_USERS_FOR_SEED,
    log: genAdminLog(A_USERS_FOR_SEED),
    // Nalozi sa besplatnim pristupom (ADMIN_SPEC 4.3/6): izvan liste od 128, vide se u "Svi" ali se ne
    // broje u Ukupno/pilule/MRR. Stefan je podrazumevani (seed), admin može dodati još preko Koraka 4.
    freeAccess: [
      { id:'free-owner', name:'Stefan Milošević', company:'Stephortless PR', initials:'SM', plan:'Besplatan pristup', badge:'Admin, besplatno',
        registered:D(2026,11,1), activityLabel:'Danas', nextBilling:'Bez roka', note:'Vlasnik proizvoda.', noEnd:true },
    ],
    // Agregatni brojevi su DATI direktno u Prilogu B (nisu izvedeni iz 128 pojedinačnih naloga) —
    // dosledno sa ADMIN_SPEC odeljkom 9 ("pravo beleženje događaja dolazi kasnije, ne sada"). Brojke
    // koje SE moraju poklapati sa Korisnicima (Ukupno/Probni/Aktivni/Naplata/Otkazani) se u Koraku 3
    // računaju iz stvarne liste od 128 naloga, ne odavde — ovde su samo za Pregled dok ta lista ne
    // postoji, i Korak 3 generiše listu da TAČNO zbroji na iste brojeve.
    overview: {
      totalUsers: 128, newLast30d: 39,
      trial: 18, trialEndingSoon: 6,
      active: 79, paymentFailed: 5, canceled: 26,
      mrrEur: 4236,
      registrationsByDay: [0,1,1,2,1,0,2,1,1,3,1,0,2,1,2,1,0,1,2,1,3,1,1,2,0,2,1,2,1,3],
      registrationsAxisLabels: ['21. okt','5. nov','20. nov'],
      funnel: { registration:128, onboarding:109, firstInvoice:92, paidSub:79 },
      featureUsage: { aiMessages:23.5, invoices:14.2, calendar:9.1, bankMails:6.8 },
      newSupportTickets: 3,
      aiRatings: { helpfulPct:91, unhelpfulCount:31, reasons:{ inaccurate:14, noAnswer:9, tooLong:5, other:3 } },
    },
    // Podrška (ADMIN_SPEC 4.5, Prilog B) — 5 prijava dato doslovno, vremenske oznake su statičan tekst
    // (kao u Prilogu B), ne izvedene iz sata, jer nema stvarnog vremena prijave da se iz njega računaju.
    supportTickets: [
      { id:'t1', title:'Faktura se ne šalje klijentu', area:'Fakture', timeAgo:'Pre 2 h', status:'otvoreno' },
      { id:'t2', title:'Mejl banke nije stigao', area:'Mejlovi banke', timeAgo:'Pre 7 h', status:'hitno' },
      { id:'t3', title:'Pogrešan rok za porez', area:'Porez i rokovi', timeAgo:'Juče', status:'otvoreno' },
      { id:'t4', title:'Ne mogu da promenim karticu', area:'Pretplata', timeAgo:'Pre 2 dana', status:'reseno' },
      { id:'t5', title:'Izvoz knjige ne radi', area:'Knjiga prihoda', timeAgo:'Pre 4 dana', status:'reseno' },
    ],
  };

  window.AIK = window.AIK || {};
  window.AIK.Seed = {
    TODAY, user, business, accounts, clients, invoices,
    incomesFx, incomesRsd, taxDecision, taxPayments, bankMailTemplates, subscription, notifications,
    calendarEvents: [], conversations,
    recurring: [
      {id:'r1', clientId:'c3', desc:'Održavanje', amount:2400, currency:'EUR', freq:'mesečno', day:1,
       startDate:D(2026,6,1), endDate:null, mode:'auto', status:'Aktivna', nextDate:D(2026,12,1)},
    ],
    admin: adminSeed,
  };
})();
