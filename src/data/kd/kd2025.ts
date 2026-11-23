// GENERISANO automatski skriptom scripts/generate-kd-data.ts, ne menjati ručno.
// Izvor: Republički zavod za statistiku Srbije (stat.gov.rs), stranica
// https://www.stat.gov.rs/istrazivanja/klasifikacije/, preuzeto 2026-11-23.
// Prilog 1 Uredbe o klasifikaciji delatnosti (KD 2025), nivo "razred" (četvorocifrena šifra sa tačkom).

export type KDRazred = { code: string; name: string };

export const KD2025: readonly KDRazred[] = [
  {
    "code": "01.11",
    "name": "Gajenje žitarica (osim pirinča), mahunarki i uljarica"
  },
  {
    "code": "01.12",
    "name": "Gajenje pirinča"
  },
  {
    "code": "01.13",
    "name": "Gajenje povrća, bostana, korenastih i krtolastih biljaka"
  },
  {
    "code": "01.14",
    "name": "Gajenje šećerne trske"
  },
  {
    "code": "01.15",
    "name": "Gajenje duvana"
  },
  {
    "code": "01.16",
    "name": "Gajenje biljaka za proizvodnju vlakana"
  },
  {
    "code": "01.19",
    "name": "Gajenje ostalih jednogodišnjih i dvogodišnjih biljaka"
  },
  {
    "code": "01.21",
    "name": "Gajenje grožđa"
  },
  {
    "code": "01.22",
    "name": "Gajenje tropskog i suptropskog voća"
  },
  {
    "code": "01.23",
    "name": "Gajenje citrusa"
  },
  {
    "code": "01.24",
    "name": "Gajenje jabučastog i koštičavog voća"
  },
  {
    "code": "01.25",
    "name": "Gajenje ostalog drvenastog i žbunastog voća i orašastih plodova"
  },
  {
    "code": "01.26",
    "name": "Gajenje uljanih plodova"
  },
  {
    "code": "01.27",
    "name": "Gajenje biljaka za pripremanje napitaka"
  },
  {
    "code": "01.28",
    "name": "Gajenje začinskog, aromatičnog i lekovitog bilja"
  },
  {
    "code": "01.29",
    "name": "Gajenje ostalih višegodišnjih biljaka"
  },
  {
    "code": "01.30",
    "name": "Gajenje sadnog materijala"
  },
  {
    "code": "01.41",
    "name": "Uzgoj muznih krava"
  },
  {
    "code": "01.42",
    "name": "Uzgoj ostalih goveda i bivola"
  },
  {
    "code": "01.43",
    "name": "Uzgoj konja i ostalih kopitara"
  },
  {
    "code": "01.44",
    "name": "Uzgoj kamila i lama"
  },
  {
    "code": "01.45",
    "name": "Uzgoj ovaca i koza"
  },
  {
    "code": "01.46",
    "name": "Uzgoj svinja"
  },
  {
    "code": "01.47",
    "name": "Uzgoj živine"
  },
  {
    "code": "01.48",
    "name": "Uzgoj ostalih životinja"
  },
  {
    "code": "01.50",
    "name": "Mešovita poljoprivredna proizvodnja"
  },
  {
    "code": "01.61",
    "name": "Delatnosti podrške biljnoj proizvodnji"
  },
  {
    "code": "01.62",
    "name": "Delatnosti podrške stočarskoj proizvodnji"
  },
  {
    "code": "01.63",
    "name": "Delatnosti posle žetve i dorada semena"
  },
  {
    "code": "01.70",
    "name": "Lov, traperstvo i povezane uslužne delatnosti"
  },
  {
    "code": "02.10",
    "name": "Gajenje šuma i ostale šumarske delatnosti"
  },
  {
    "code": "02.20",
    "name": "Seča drveća"
  },
  {
    "code": "02.30",
    "name": "Sakupljanje šumskih plodova"
  },
  {
    "code": "02.40",
    "name": "Uslužne delatnosti podrške šumarstvu"
  },
  {
    "code": "03.11",
    "name": "Morski ribolov"
  },
  {
    "code": "03.12",
    "name": "Slatkovodni ribolov"
  },
  {
    "code": "03.21",
    "name": "Morska akvakultura"
  },
  {
    "code": "03.22",
    "name": "Slatkovodna akvakultura"
  },
  {
    "code": "03.30",
    "name": "Delatnosti podrške ribolovu i akvakulturi"
  },
  {
    "code": "05.10",
    "name": "Eksploatacija kamenog uglja"
  },
  {
    "code": "05.20",
    "name": "Eksploatacija lignita"
  },
  {
    "code": "06.10",
    "name": "Eksploatacija sirove nafte"
  },
  {
    "code": "06.20",
    "name": "Eksploatacija prirodnog gasa"
  },
  {
    "code": "07.10",
    "name": "Eksploatacija ruda gvožđa"
  },
  {
    "code": "07.21",
    "name": "Eksploatacija ruda urana i torijuma"
  },
  {
    "code": "07.29",
    "name": "Eksploatacija ostalih ruda obojenih metala"
  },
  {
    "code": "08.11",
    "name": "Eksploatacija ukrasnog kamena, krečnjaka, gipsa, škriljaca i ostalog kamena"
  },
  {
    "code": "08.12",
    "name": "Eksploatacija šljunka, peska, gline i kaolina"
  },
  {
    "code": "08.91",
    "name": "Eksploatacija minerala za hemikalije i đubriva"
  },
  {
    "code": "08.92",
    "name": "Eksploatacija treseta"
  },
  {
    "code": "08.93",
    "name": "Eksploatacija soli"
  },
  {
    "code": "08.99",
    "name": "Ostalo rudarstvo neklasifikovano na drugom mestu"
  },
  {
    "code": "09.10",
    "name": "Delatnosti podrške eksploataciji nafte i prirodnog gasa"
  },
  {
    "code": "09.90",
    "name": "Delatnosti podrške ostalom rudarstvu"
  },
  {
    "code": "10.11",
    "name": "Prerada i konzervisanje mesa, osim živinskog mesa"
  },
  {
    "code": "10.12",
    "name": "Prerada i konzervisanje živinskog mesa"
  },
  {
    "code": "10.13",
    "name": "Proizvodnja mesnih i živinskih proizvoda"
  },
  {
    "code": "10.20",
    "name": "Prerada i konzervisanje ribe, ljuskara i mekušaca"
  },
  {
    "code": "10.31",
    "name": "Prerada i konzervisanje krompira"
  },
  {
    "code": "10.32",
    "name": "Proizvodnja sokova od voća i povrća"
  },
  {
    "code": "10.39",
    "name": "Ostala prerada i konzervisanje voća i povrća"
  },
  {
    "code": "10.41",
    "name": "Proizvodnja ulja i masti"
  },
  {
    "code": "10.42",
    "name": "Proizvodnja margarina i sličnih jestivih masti"
  },
  {
    "code": "10.51",
    "name": "Proizvodnja mlečnih proizvoda"
  },
  {
    "code": "10.52",
    "name": "Proizvodnja sladoleda i ostalih jestivih ledenih proizvoda"
  },
  {
    "code": "10.61",
    "name": "Proizvodnja mlinskih proizvoda"
  },
  {
    "code": "10.62",
    "name": "Proizvodnja skroba i skrobnih proizvoda"
  },
  {
    "code": "10.71",
    "name": "Proizvodnja hleba, svežih peciva i kolača"
  },
  {
    "code": "10.72",
    "name": "Proizvodnja dvopeka, keksa, trajnih peciva i kolača"
  },
  {
    "code": "10.73",
    "name": "Proizvodnja testenine"
  },
  {
    "code": "10.81",
    "name": "Proizvodnja šećera"
  },
  {
    "code": "10.82",
    "name": "Proizvodnja kakaoa, čokolade i konditorskih proizvoda"
  },
  {
    "code": "10.83",
    "name": "Prerada čaja i kafe"
  },
  {
    "code": "10.84",
    "name": "Proizvodnja začina i dodataka hrani"
  },
  {
    "code": "10.85",
    "name": "Proizvodnja gotovih jela"
  },
  {
    "code": "10.86",
    "name": "Proizvodnja homogenizovanih hranljivih preparata i dijetetske hrane"
  },
  {
    "code": "10.89",
    "name": "Proizvodnja ostalih prehrambenih proizvoda neklasifikovana na drugom mestu"
  },
  {
    "code": "10.91",
    "name": "Proizvodnja gotove hrane za domaće životinje"
  },
  {
    "code": "10.92",
    "name": "Proizvodnja gotove hrane za kućne ljubimce"
  },
  {
    "code": "11.01",
    "name": "Destilacija, prečišćavanje i mešanje žestokih pića"
  },
  {
    "code": "11.02",
    "name": "Proizvodnja vina od grožđa"
  },
  {
    "code": "11.03",
    "name": "Proizvodnja vina od jabuka i ostalih fermentisanih voćnih pića"
  },
  {
    "code": "11.04",
    "name": "Proizvodnja ostalih nedestilovanih fermentisanih pića"
  },
  {
    "code": "11.05",
    "name": "Proizvodnja piva"
  },
  {
    "code": "11.06",
    "name": "Proizvodnja slada"
  },
  {
    "code": "11.07",
    "name": "Proizvodnja bezalkoholnih pića i flaširane vode"
  },
  {
    "code": "12.00",
    "name": "Proizvodnja duvanskih proizvoda"
  },
  {
    "code": "13.10",
    "name": "Priprema i predenje tekstilnih vlakana"
  },
  {
    "code": "13.20",
    "name": "Tkanje tekstila"
  },
  {
    "code": "13.30",
    "name": "Dovršavanje tekstila"
  },
  {
    "code": "13.91",
    "name": "Proizvodnja pletenih i heklanih tkanina"
  },
  {
    "code": "13.92",
    "name": "Proizvodnja tekstila za domaćinstvo i gotovih predmeta za opremanje prostorija"
  },
  {
    "code": "13.93",
    "name": "Proizvodnja tepiha i prekrivača za pod"
  },
  {
    "code": "13.94",
    "name": "Proizvodnja konopaca, užadi, kanapa i mreža"
  },
  {
    "code": "13.95",
    "name": "Proizvodnja netkanog tekstila i predmeta od netkanog tekstila"
  },
  {
    "code": "13.96",
    "name": "Proizvodnja ostalog tehničkog i industrijskog tekstila"
  },
  {
    "code": "13.99",
    "name": "Proizvodnja ostalog tekstila neklasifikovana na drugom mestu"
  },
  {
    "code": "14.10",
    "name": "Proizvodnja pletene i heklane odeće"
  },
  {
    "code": "14.21",
    "name": "Proizvodnja gornje odeće"
  },
  {
    "code": "14.22",
    "name": "Proizvodnja donjeg veša"
  },
  {
    "code": "14.23",
    "name": "Proizvodnja radne odeće"
  },
  {
    "code": "14.24",
    "name": "Proizvodnja odevnih predmeta od kože i krzna"
  },
  {
    "code": "14.29",
    "name": "Proizvodnja ostalih odevnih predmeta i pribora neklasifikovana na drugom mestu"
  },
  {
    "code": "15.11",
    "name": "Štavljenje, obrada i bojenje kože i krzna"
  },
  {
    "code": "15.12",
    "name": "Proizvodnja putnih i ručnih torbi, sedlarskih proizvoda i kaiševa od bilo kog materijala"
  },
  {
    "code": "15.20",
    "name": "Proizvodnja obuće"
  },
  {
    "code": "16.11",
    "name": "Rezanje i obrada drveta"
  },
  {
    "code": "16.12",
    "name": "Prerada i dorada drveta"
  },
  {
    "code": "16.21",
    "name": "Proizvodnja furnira i ploča od drveta"
  },
  {
    "code": "16.22",
    "name": "Proizvodnja sastavljenih parketa"
  },
  {
    "code": "16.23",
    "name": "Proizvodnja ostale građevinske stolarije i elemenata"
  },
  {
    "code": "16.24",
    "name": "Proizvodnja ambalaže od drveta"
  },
  {
    "code": "16.25",
    "name": "Proizvodnja vrata i prozora od drveta"
  },
  {
    "code": "16.26",
    "name": "Proizvodnja čvrstih goriva od biljne biomase"
  },
  {
    "code": "16.27",
    "name": "Završna obrada drvenih proizvoda"
  },
  {
    "code": "16.28",
    "name": "Proizvodnja ostalih proizvoda od drveta, plute, slame i pletarskih materijala"
  },
  {
    "code": "17.11",
    "name": "Proizvodnja vlakana celuloze"
  },
  {
    "code": "17.12",
    "name": "Proizvodnja papira i kartona"
  },
  {
    "code": "17.21",
    "name": "Proizvodnja talasastog papira, kartona i ambalaže od papira i kartona"
  },
  {
    "code": "17.22",
    "name": "Proizvodnja predmeta od papira za domaćinstvo, higijenu i toaletne potrebe"
  },
  {
    "code": "17.23",
    "name": "Proizvodnja kancelarijskih predmeta od papira"
  },
  {
    "code": "17.24",
    "name": "Proizvodnja tapeta"
  },
  {
    "code": "17.25",
    "name": "Proizvodnja ostalih predmeta od papira i kartona"
  },
  {
    "code": "18.11",
    "name": "Štampanje novina"
  },
  {
    "code": "18.12",
    "name": "Ostalo štampanje"
  },
  {
    "code": "18.13",
    "name": "Usluge pripreme za štampu i objavljivanje"
  },
  {
    "code": "18.14",
    "name": "Knjigovezačke i srodne usluge"
  },
  {
    "code": "18.20",
    "name": "Umnožavanje snimljenih zapisa"
  },
  {
    "code": "19.10",
    "name": "Proizvodnja proizvoda koksovanja"
  },
  {
    "code": "19.20",
    "name": "Proizvodnja derivata nafte i proizvoda od fosilnih goriva"
  },
  {
    "code": "20.11",
    "name": "Proizvodnja industrijskih gasova"
  },
  {
    "code": "20.12",
    "name": "Proizvodnja sredstava za pripremanje boja i pigmenata"
  },
  {
    "code": "20.13",
    "name": "Proizvodnja ostalih osnovnih neorganskih hemikalija"
  },
  {
    "code": "20.14",
    "name": "Proizvodnja ostalih osnovnih organskih hemikalija"
  },
  {
    "code": "20.15",
    "name": "Proizvodnja veštačkih đubriva i azotnih jedinjenja"
  },
  {
    "code": "20.16",
    "name": "Proizvodnja plastičnih masa u primarnim oblicima"
  },
  {
    "code": "20.17",
    "name": "Proizvodnja sintetičkog kaučuka u primarnim oblicima"
  },
  {
    "code": "20.20",
    "name": "Proizvodnja pesticida, dezinfekcionih sredstava i ostalih hemijskih proizvoda za poljoprivredu"
  },
  {
    "code": "20.30",
    "name": "Proizvodnja boja, lakova i sličnih premaza, grafičkih boja i kitova"
  },
  {
    "code": "20.41",
    "name": "Proizvodnja sredstava za pranje, čišćenje i poliranje"
  },
  {
    "code": "20.42",
    "name": "Proizvodnja sredstava za ličnu negu"
  },
  {
    "code": "20.51",
    "name": "Proizvodnja tečnih biogoriva"
  },
  {
    "code": "20.59",
    "name": "Proizvodnja ostalih hemijskih proizvoda neklasifikovana na drugom mestu"
  },
  {
    "code": "20.60",
    "name": "Proizvodnja veštačkih vlakana"
  },
  {
    "code": "21.10",
    "name": "Proizvodnja osnovnih farmaceutskih proizvoda"
  },
  {
    "code": "21.20",
    "name": "Proizvodnja farmaceutskih preparata"
  },
  {
    "code": "22.11",
    "name": "Proizvodnja, obnova i protektiranje guma za vozila"
  },
  {
    "code": "22.12",
    "name": "Proizvodnja ostalih proizvoda od gume"
  },
  {
    "code": "22.21",
    "name": "Proizvodnja ploča, listova, cevi i profila od plastike"
  },
  {
    "code": "22.22",
    "name": "Proizvodnja ambalaže od plastike"
  },
  {
    "code": "22.23",
    "name": "Proizvodnja vrata i prozora od plastike"
  },
  {
    "code": "22.24",
    "name": "Proizvodnja predmeta od plastike za građevinarstvo"
  },
  {
    "code": "22.25",
    "name": "Prerada i dorada plastičnih proizvoda"
  },
  {
    "code": "22.26",
    "name": "Proizvodnja ostalih proizvoda od plastike"
  },
  {
    "code": "23.11",
    "name": "Proizvodnja ravnog stakla"
  },
  {
    "code": "23.12",
    "name": "Oblikovanje i obrada ravnog stakla"
  },
  {
    "code": "23.13",
    "name": "Proizvodnja šupljeg stakla"
  },
  {
    "code": "23.14",
    "name": "Proizvodnja staklenih vlakana"
  },
  {
    "code": "23.15",
    "name": "Proizvodnja i obrada ostalog stakla, uključujući tehničke staklene proizvode"
  },
  {
    "code": "23.20",
    "name": "Proizvodnja vatrostalnih proizvoda"
  },
  {
    "code": "23.31",
    "name": "Proizvodnja keramičkih pločica i ploča"
  },
  {
    "code": "23.32",
    "name": "Proizvodnja cigle, crepa i građevinskih proizvoda od pečene gline"
  },
  {
    "code": "23.41",
    "name": "Proizvodnja keramičkih predmeta za domaćinstvo i ukrasnih predmeta"
  },
  {
    "code": "23.42",
    "name": "Proizvodnja sanitarnih keramičkih proizvoda"
  },
  {
    "code": "23.43",
    "name": "Proizvodnja izolatora i izolacionog pribora od keramike"
  },
  {
    "code": "23.44",
    "name": "Proizvodnja ostalih tehničkih proizvoda od keramike"
  },
  {
    "code": "23.45",
    "name": "Proizvodnja ostalih keramičkih proizvoda"
  },
  {
    "code": "23.51",
    "name": "Proizvodnja cementa"
  },
  {
    "code": "23.52",
    "name": "Proizvodnja kreča i gipsa"
  },
  {
    "code": "23.61",
    "name": "Proizvodnja proizvoda od betona za građevinarstvo"
  },
  {
    "code": "23.62",
    "name": "Proizvodnja proizvoda od gipsa za građevinarstvo"
  },
  {
    "code": "23.63",
    "name": "Proizvodnja svežeg betona"
  },
  {
    "code": "23.64",
    "name": "Proizvodnja maltera"
  },
  {
    "code": "23.65",
    "name": "Proizvodnja proizvoda od cementa s vlaknima"
  },
  {
    "code": "23.66",
    "name": "Proizvodnja ostalih predmeta od betona, cementa i gipsa"
  },
  {
    "code": "23.70",
    "name": "Sečenje, oblikovanje i obrada kamena"
  },
  {
    "code": "23.91",
    "name": "Proizvodnja brusnih proizvoda"
  },
  {
    "code": "23.99",
    "name": "Proizvodnja ostalih proizvoda od nemetalnih minerala neklasifikovana na drugom mestu"
  },
  {
    "code": "24.10",
    "name": "Proizvodnja sirovog gvožđa, čelika i ferolegura"
  },
  {
    "code": "24.20",
    "name": "Proizvodnja čeličnih cevi, šupljih profila i fitinga"
  },
  {
    "code": "24.31",
    "name": "Hladno vučenje šipki"
  },
  {
    "code": "24.32",
    "name": "Hladno valjanje uskih traka"
  },
  {
    "code": "24.33",
    "name": "Hladno oblikovanje profila"
  },
  {
    "code": "24.34",
    "name": "Hladno vučenje žice"
  },
  {
    "code": "24.41",
    "name": "Proizvodnja plemenitih metala"
  },
  {
    "code": "24.42",
    "name": "Proizvodnja aluminijuma"
  },
  {
    "code": "24.43",
    "name": "Proizvodnja olova, cinka i kalaja"
  },
  {
    "code": "24.44",
    "name": "Proizvodnja bakra"
  },
  {
    "code": "24.45",
    "name": "Proizvodnja ostalih obojenih metala"
  },
  {
    "code": "24.46",
    "name": "Proizvodnja nuklearnog goriva"
  },
  {
    "code": "24.51",
    "name": "Livenje gvožđa"
  },
  {
    "code": "24.52",
    "name": "Livenje čelika"
  },
  {
    "code": "24.53",
    "name": "Livenje lakih metala"
  },
  {
    "code": "24.54",
    "name": "Livenje ostalih obojenih metala"
  },
  {
    "code": "25.11",
    "name": "Proizvodnja metalnih konstrukcija i delova konstrukcija"
  },
  {
    "code": "25.12",
    "name": "Proizvodnja metalnih vrata i prozora"
  },
  {
    "code": "25.21",
    "name": "Proizvodnja radijatora za centralno grejanje, parnih generatora i kotlova"
  },
  {
    "code": "25.22",
    "name": "Proizvodnja ostalih metalnih cisterni, rezervoara i kontejnera"
  },
  {
    "code": "25.30",
    "name": "Proizvodnja oružja i municije"
  },
  {
    "code": "25.40",
    "name": "Kovanje i oblikovanje metala i metalurgija praha"
  },
  {
    "code": "25.51",
    "name": "Prevlačenje metala"
  },
  {
    "code": "25.52",
    "name": "Toplotna obrada metala"
  },
  {
    "code": "25.53",
    "name": "Mašinska obrada metala"
  },
  {
    "code": "25.61",
    "name": "Proizvodnja pribora za jelo i sečiva"
  },
  {
    "code": "25.62",
    "name": "Proizvodnja brava i okova"
  },
  {
    "code": "25.63",
    "name": "Proizvodnja alata"
  },
  {
    "code": "25.91",
    "name": "Proizvodnja čeličnih buradi i slične ambalaže"
  },
  {
    "code": "25.92",
    "name": "Proizvodnja ambalaže od lakih metala"
  },
  {
    "code": "25.93",
    "name": "Proizvodnja žičanih proizvoda, lanaca i opruga"
  },
  {
    "code": "25.94",
    "name": "Proizvodnja veznih elemenata i vijčanih mašinskih proizvoda"
  },
  {
    "code": "25.99",
    "name": "Proizvodnja ostalih gotovih metalnih proizvoda neklasifikovana na drugom mestu"
  },
  {
    "code": "26.11",
    "name": "Proizvodnja elektronskih elemenata"
  },
  {
    "code": "26.12",
    "name": "Proizvodnja štampanih elektronskih ploča"
  },
  {
    "code": "26.20",
    "name": "Proizvodnja računara i periferne opreme"
  },
  {
    "code": "26.30",
    "name": "Proizvodnja komunikacione opreme"
  },
  {
    "code": "26.40",
    "name": "Proizvodnja elektronskih uređaja za široku potrošnju"
  },
  {
    "code": "26.51",
    "name": "Proizvodnja mernih, istraživačkih i navigacionih instrumenata i aparata"
  },
  {
    "code": "26.52",
    "name": "Proizvodnja satova"
  },
  {
    "code": "26.60",
    "name": "Proizvodnja opreme za zračenje, elektromedicinske i elektroterapeutske opreme"
  },
  {
    "code": "26.70",
    "name": "Proizvodnja optičkih instrumenata, magnetnih i optičkih medija i fotografske opreme"
  },
  {
    "code": "27.11",
    "name": "Proizvodnja elektromotora, generatora i transformatora"
  },
  {
    "code": "27.12",
    "name": "Proizvodnja aparata za distribuciju i kontrolu električne energije"
  },
  {
    "code": "27.20",
    "name": "Proizvodnja baterija i akumulatora"
  },
  {
    "code": "27.31",
    "name": "Proizvodnja kablova od optičkih vlakana"
  },
  {
    "code": "27.32",
    "name": "Proizvodnja ostalih elektronskih i električnih provodnika i kablova"
  },
  {
    "code": "27.33",
    "name": "Proizvodnja opreme za povezivanje žica i kablova"
  },
  {
    "code": "27.40",
    "name": "Proizvodnja opreme za osvetljenje"
  },
  {
    "code": "27.51",
    "name": "Proizvodnja električnih aparata za domaćinstvo"
  },
  {
    "code": "27.52",
    "name": "Proizvodnja neelektričnih aparata za domaćinstvo"
  },
  {
    "code": "27.90",
    "name": "Proizvodnja ostale električne opreme"
  },
  {
    "code": "28.11",
    "name": "Proizvodnja motora i turbina, osim motora za letelice i motorna vozila"
  },
  {
    "code": "28.12",
    "name": "Proizvodnja hidrauličnih pogonskih uređaja"
  },
  {
    "code": "28.13",
    "name": "Proizvodnja ostalih pumpi i kompresora"
  },
  {
    "code": "28.14",
    "name": "Proizvodnja ostalih slavina i ventila"
  },
  {
    "code": "28.15",
    "name": "Proizvodnja ležajeva, zupčanika i zupčastih pogonskih elemenata"
  },
  {
    "code": "28.21",
    "name": "Proizvodnja peći, gorionika i trajne opreme za grejanje domaćinstva"
  },
  {
    "code": "28.22",
    "name": "Proizvodnja opreme za podizanje i prenošenje"
  },
  {
    "code": "28.23",
    "name": "Proizvodnja kancelarijskih mašina i opreme, osim računara i periferne opreme"
  },
  {
    "code": "28.24",
    "name": "Proizvodnja ručnih alata sa motorom"
  },
  {
    "code": "28.25",
    "name": "Proizvodnja opreme za klimatizaciju, osim za domaćinstvo"
  },
  {
    "code": "28.29",
    "name": "Proizvodnja ostalih mašina opšte namene neklasifikovana na drugom mestu"
  },
  {
    "code": "28.30",
    "name": "Proizvodnja mašina za poljoprivredu i šumarstvo"
  },
  {
    "code": "28.41",
    "name": "Proizvodnja mašina za oblikovanje metala i alatnih mašina za obradu metala"
  },
  {
    "code": "28.42",
    "name": "Proizvodnja ostalih alatnih mašina"
  },
  {
    "code": "28.91",
    "name": "Proizvodnja mašina za metalurgiju"
  },
  {
    "code": "28.92",
    "name": "Proizvodnja mašina za rudarstvo, kamenolome i građevinarstvo"
  },
  {
    "code": "28.93",
    "name": "Proizvodnja mašina za industriju hrane, pića i duvana"
  },
  {
    "code": "28.94",
    "name": "Proizvodnja mašina za industriju tekstila, odevnih predmeta i kože"
  },
  {
    "code": "28.95",
    "name": "Proizvodnja mašina za industriju papira i kartona"
  },
  {
    "code": "28.96",
    "name": "Proizvodnja mašina za izradu plastike i gume"
  },
  {
    "code": "28.97",
    "name": "Proizvodnja mašina za aditivnu proizvodnju"
  },
  {
    "code": "28.99",
    "name": "Proizvodnja mašina za ostale specijalne namene neklasifikovana na drugom mestu"
  },
  {
    "code": "29.10",
    "name": "Proizvodnja motornih vozila"
  },
  {
    "code": "29.20",
    "name": "Proizvodnja karoserija za motorna vozila; proizvodnja prikolica i poluprikolica"
  },
  {
    "code": "29.31",
    "name": "Proizvodnja električne i elektronske opreme za motorna vozila"
  },
  {
    "code": "29.32",
    "name": "Proizvodnja ostalih delova i pribora za motorna vozila"
  },
  {
    "code": "30.11",
    "name": "Izgradnja civilnih brodova i plutajućih objekata"
  },
  {
    "code": "30.12",
    "name": "Izgradnja čamaca za sport i razonodu"
  },
  {
    "code": "30.13",
    "name": "Izgradnja vojnih brodova i plovila"
  },
  {
    "code": "30.20",
    "name": "Proizvodnja lokomotiva i šinskih vozila"
  },
  {
    "code": "30.31",
    "name": "Proizvodnja civilnih vazdušnih i svemirskih letelica i srodnih mašina"
  },
  {
    "code": "30.32",
    "name": "Proizvodnja vojnih vazdušnih i svemirskih letelica i srodnih mašina"
  },
  {
    "code": "30.40",
    "name": "Proizvodnja vojnih borbenih vozila"
  },
  {
    "code": "30.91",
    "name": "Proizvodnja motocikala"
  },
  {
    "code": "30.92",
    "name": "Proizvodnja bicikala i invalidskih kolica"
  },
  {
    "code": "30.99",
    "name": "Proizvodnja ostale transportne opreme neklasifikovana na drugom mestu"
  },
  {
    "code": "31.00",
    "name": "Proizvodnja nameštaja"
  },
  {
    "code": "32.11",
    "name": "Kovanje novca"
  },
  {
    "code": "32.12",
    "name": "Proizvodnja nakita i srodnih predmeta"
  },
  {
    "code": "32.13",
    "name": "Proizvodnja imitacije nakita (bižuterije) i srodnih predmeta"
  },
  {
    "code": "32.20",
    "name": "Proizvodnja muzičkih instrumenata"
  },
  {
    "code": "32.30",
    "name": "Proizvodnja sportske opreme"
  },
  {
    "code": "32.40",
    "name": "Proizvodnja igara i igračaka"
  },
  {
    "code": "32.50",
    "name": "Proizvodnja medicinskih i stomatoloških instrumenata i materijala"
  },
  {
    "code": "32.91",
    "name": "Proizvodnja metli i četki"
  },
  {
    "code": "32.99",
    "name": "Ostala prerađivačka industrija neklasifikovana na drugom mestu"
  },
  {
    "code": "33.11",
    "name": "Popravka i održavanje gotovih metalnih proizvoda"
  },
  {
    "code": "33.12",
    "name": "Popravka i održavanje mašina"
  },
  {
    "code": "33.13",
    "name": "Popravka i održavanje elektronske i optičke opreme"
  },
  {
    "code": "33.14",
    "name": "Popravka i održavanje električne opreme"
  },
  {
    "code": "33.15",
    "name": "Popravka i održavanje civilnih brodova i čamaca"
  },
  {
    "code": "33.16",
    "name": "Popravka i održavanje civilnih vazdušnih i svemirskih letelica"
  },
  {
    "code": "33.17",
    "name": "Popravka i održavanje ostale civilne transportne opreme"
  },
  {
    "code": "33.18",
    "name": "Popravka i održavanje vojnih borbenih vozila, brodova, čamaca, vazdušnih i svemirskih letelica"
  },
  {
    "code": "33.19",
    "name": "Popravka i održavanje ostale opreme"
  },
  {
    "code": "33.20",
    "name": "Montaža industrijskih mašina i opreme"
  },
  {
    "code": "35.11",
    "name": "Proizvodnja električne energije iz neobnovljivih izvora"
  },
  {
    "code": "35.12",
    "name": "Proizvodnja električne energije iz obnovljivih izvora"
  },
  {
    "code": "35.13",
    "name": "Prenos električne energije"
  },
  {
    "code": "35.14",
    "name": "Distribucija električne energije"
  },
  {
    "code": "35.15",
    "name": "Trgovina električnom energijom"
  },
  {
    "code": "35.16",
    "name": "Skladištenje električne energije"
  },
  {
    "code": "35.21",
    "name": "Proizvodnja gasa"
  },
  {
    "code": "35.22",
    "name": "Distribucija gasovitih goriva preko gasovoda"
  },
  {
    "code": "35.23",
    "name": "Trgovina gasovitim gorivima preko gasovoda"
  },
  {
    "code": "35.24",
    "name": "Skladištenje gasa kao deo usluga mrežnog snabdevanja"
  },
  {
    "code": "35.30",
    "name": "Snabdevanje parom i klimatizacija"
  },
  {
    "code": "35.40",
    "name": "Delatnosti zastupnika i posrednika za električnu energiju i prirodni gas"
  },
  {
    "code": "36.00",
    "name": "Sakupljanje, prečišćavanje i distribucija vode"
  },
  {
    "code": "37.00",
    "name": "Uklanjanje otpadnih voda"
  },
  {
    "code": "38.11",
    "name": "Sakupljanje otpada koji nije opasan"
  },
  {
    "code": "38.12",
    "name": "Sakupljanje opasnog otpada"
  },
  {
    "code": "38.21",
    "name": "Ponovno iskorišćenje materijala"
  },
  {
    "code": "38.22",
    "name": "Iskorišćenje energije iz otpada"
  },
  {
    "code": "38.23",
    "name": "Ostalo ponovno iskorišćenje otpada"
  },
  {
    "code": "38.31",
    "name": "Spaljivanje otpada bez iskorišćenja energije"
  },
  {
    "code": "38.32",
    "name": "Odlaganje na deponije ili trajno skladištenje otpada"
  },
  {
    "code": "38.33",
    "name": "Ostalo odlaganje otpada"
  },
  {
    "code": "39.00",
    "name": "Sanacija i ostale uslužne delatnosti upravljanja otpadom"
  },
  {
    "code": "41.00",
    "name": "Izgradnja stambenih i nestambenih zgrada"
  },
  {
    "code": "42.11",
    "name": "Izgradnja puteva i autoputeva"
  },
  {
    "code": "42.12",
    "name": "Izgradnja železničkih pruga i podzemnih železnica"
  },
  {
    "code": "42.13",
    "name": "Izgradnja mostova i tunela"
  },
  {
    "code": "42.21",
    "name": "Izgradnja cevovoda"
  },
  {
    "code": "42.22",
    "name": "Izgradnja električnih i telekomunikacionih vodova"
  },
  {
    "code": "42.91",
    "name": "Izgradnja hidrotehničkih objekata"
  },
  {
    "code": "42.99",
    "name": "Izgradnja ostalih građevinskih objekata neklasifikovana na drugom mestu"
  },
  {
    "code": "43.11",
    "name": "Rušenje objekata"
  },
  {
    "code": "43.12",
    "name": "Priprema gradilišta"
  },
  {
    "code": "43.13",
    "name": "Ispitivanje terena bušenjem i sondiranjem"
  },
  {
    "code": "43.21",
    "name": "Postavljanje električnih instalacija"
  },
  {
    "code": "43.22",
    "name": "Postavljanje vodovodnih, grejnih i klimatizacionih instalacija"
  },
  {
    "code": "43.23",
    "name": "Postavljanje izolacije"
  },
  {
    "code": "43.24",
    "name": "Ostali instalacioni radovi u građevinarstvu"
  },
  {
    "code": "43.31",
    "name": "Malterisanje"
  },
  {
    "code": "43.32",
    "name": "Ugradnja stolarije"
  },
  {
    "code": "43.33",
    "name": "Postavljanje podnih i zidnih obloga"
  },
  {
    "code": "43.34",
    "name": "Bojenje i zastakljivanje"
  },
  {
    "code": "43.35",
    "name": "Ostali završni građevinski radovi"
  },
  {
    "code": "43.41",
    "name": "Delatnosti izgradnje krovova"
  },
  {
    "code": "43.42",
    "name": "Ostale specijalizovane građevinske delatnosti u izgradnji zgrada"
  },
  {
    "code": "43.50",
    "name": "Specijalizovane građevinske delatnosti u izgradnji ostalih građevina"
  },
  {
    "code": "43.60",
    "name": "Uslužne delatnosti posredovanja u pružanju specijalizovanih građevinskih usluga"
  },
  {
    "code": "43.91",
    "name": "Delatnosti zidanja opekom i kamenom"
  },
  {
    "code": "43.99",
    "name": "Ostale specijalizovane građevinske delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "46.11",
    "name": "Posredovanje u trgovini na veliko poljoprivrednim sirovinama, živim životinjama, tekstilnim sirovinama i poluproizvodima"
  },
  {
    "code": "46.12",
    "name": "Posredovanje u trgovini na veliko gorivima, rudama, metalima i industrijskim hemikalijama"
  },
  {
    "code": "46.13",
    "name": "Posredovanje u trgovini na veliko drvnom građom i građevinskim materijalom"
  },
  {
    "code": "46.14",
    "name": "Posredovanje u trgovini na veliko mašinama, industrijskom opremom, brodovima i vazduhoplovima"
  },
  {
    "code": "46.15",
    "name": "Posredovanje u trgovini na veliko nameštajem, proizvodima za domaćinstvo i metalnom robom"
  },
  {
    "code": "46.16",
    "name": "Posredovanje u trgovini na veliko tekstilom, odećom, krznom, obućom i proizvodima od kože"
  },
  {
    "code": "46.17",
    "name": "Posredovanje u trgovini na veliko hranom, pićima i duvanom"
  },
  {
    "code": "46.18",
    "name": "Posredovanje u trgovini na veliko ostalim posebnim proizvodima"
  },
  {
    "code": "46.19",
    "name": "Posredovanje u nespecijalizovanoj trgovini na veliko"
  },
  {
    "code": "46.21",
    "name": "Trgovina na veliko žitaricama, sirovim duvanom, semenjem i hranom za životinje"
  },
  {
    "code": "46.22",
    "name": "Trgovina na veliko cvećem i sadnicama"
  },
  {
    "code": "46.23",
    "name": "Trgovina na veliko živim životinjama"
  },
  {
    "code": "46.24",
    "name": "Trgovina na veliko sirovom, nedovršenom i dovršenom kožom"
  },
  {
    "code": "46.31",
    "name": "Trgovina na veliko voćem i povrćem"
  },
  {
    "code": "46.32",
    "name": "Trgovina na veliko mesom, proizvodima od mesa, ribom i proizvodima od ribe"
  },
  {
    "code": "46.33",
    "name": "Trgovina na veliko mlečnim proizvodima, jajima i jestivim uljima i mastima"
  },
  {
    "code": "46.34",
    "name": "Trgovina na veliko pićima"
  },
  {
    "code": "46.35",
    "name": "Trgovina na veliko duvanskim proizvodima"
  },
  {
    "code": "46.36",
    "name": "Trgovina na veliko šećerom, čokoladom i slatkišima"
  },
  {
    "code": "46.37",
    "name": "Trgovina na veliko kafom, čajevima, kakaom i začinima"
  },
  {
    "code": "46.38",
    "name": "Trgovina na veliko ostalom hranom"
  },
  {
    "code": "46.39",
    "name": "Nespecijalizovana trgovina na veliko hranom, pićima i duvanom"
  },
  {
    "code": "46.41",
    "name": "Trgovina na veliko tekstilom"
  },
  {
    "code": "46.42",
    "name": "Trgovina na veliko odećom i obućom"
  },
  {
    "code": "46.43",
    "name": "Trgovina na veliko električnim aparatima za domaćinstvo"
  },
  {
    "code": "46.44",
    "name": "Trgovina na veliko porcelanom, staklenom robom i sredstvima za čišćenje"
  },
  {
    "code": "46.45",
    "name": "Trgovina na veliko parfemima i kozmetikom"
  },
  {
    "code": "46.46",
    "name": "Trgovina na veliko farmaceutskim i medicinskim proizvodima"
  },
  {
    "code": "46.47",
    "name": "Trgovina na veliko nameštajem, tepisima i opremom za osvetljenje"
  },
  {
    "code": "46.48",
    "name": "Trgovina na veliko satovima i nakitom"
  },
  {
    "code": "46.49",
    "name": "Trgovina na veliko ostalim proizvodima za domaćinstvo"
  },
  {
    "code": "46.50",
    "name": "Trgovina na veliko informaciono-komunikacionom opremom"
  },
  {
    "code": "46.61",
    "name": "Trgovina na veliko poljoprivrednim mašinama, opremom i priborom"
  },
  {
    "code": "46.62",
    "name": "Trgovina na veliko alatnim mašinama"
  },
  {
    "code": "46.63",
    "name": "Trgovina na veliko rudarskim i građevinskim mašinama"
  },
  {
    "code": "46.64",
    "name": "Trgovina na veliko ostalim mašinama i opremom"
  },
  {
    "code": "46.71",
    "name": "Trgovina na veliko motornim vozilima"
  },
  {
    "code": "46.72",
    "name": "Trgovina na veliko delovima i priborom za motorna vozila"
  },
  {
    "code": "46.73",
    "name": "Trgovina na veliko motociklima i delovima i priborom za motocikle"
  },
  {
    "code": "46.81",
    "name": "Trgovina na veliko čvrstim, tečnim i gasovitim gorivima i srodnim proizvodima"
  },
  {
    "code": "46.82",
    "name": "Trgovina na veliko metalima i metalnim rudama"
  },
  {
    "code": "46.83",
    "name": "Trgovina na veliko drvetom, građevinskim materijalom i sanitarnom opremom"
  },
  {
    "code": "46.84",
    "name": "Trgovina na veliko metalnom robom, instalacionim materijalima, opremom i priborom za vodovod i grejanje"
  },
  {
    "code": "46.85",
    "name": "Trgovina na veliko hemijskim proizvodima"
  },
  {
    "code": "46.86",
    "name": "Trgovina na veliko ostalim poluproizvodima"
  },
  {
    "code": "46.87",
    "name": "Trgovina na veliko otpadom i ostacima"
  },
  {
    "code": "46.89",
    "name": "Ostala specijalizovana trgovina na veliko neklasifikovana na drugom mestu"
  },
  {
    "code": "46.90",
    "name": "Nespecijalizovana trgovina na veliko"
  },
  {
    "code": "47.11",
    "name": "Nespecijalizovana trgovina na malo pretežno hranom, pićima i duvanom"
  },
  {
    "code": "47.12",
    "name": "Ostala nespecijalizovana trgovina na malo"
  },
  {
    "code": "47.21",
    "name": "Trgovina na malo voćem i povrćem"
  },
  {
    "code": "47.22",
    "name": "Trgovina na malo mesom i proizvodima od mesa"
  },
  {
    "code": "47.23",
    "name": "Trgovina na malo ribom, ljuskarima i mekušcima"
  },
  {
    "code": "47.24",
    "name": "Trgovina na malo hlebom, kolačima i slatkišima"
  },
  {
    "code": "47.25",
    "name": "Trgovina na malo pićima"
  },
  {
    "code": "47.26",
    "name": "Trgovina na malo proizvodima od duvana"
  },
  {
    "code": "47.27",
    "name": "Trgovina na malo ostalom hranom"
  },
  {
    "code": "47.30",
    "name": "Trgovina na malo motornim gorivima"
  },
  {
    "code": "47.40",
    "name": "Trgovina na malo informaciono-komunikacionom opremom"
  },
  {
    "code": "47.51",
    "name": "Trgovina na malo tekstilom"
  },
  {
    "code": "47.52",
    "name": "Trgovina na malo metalnom robom, građevinskim materijalom, bojama i staklom"
  },
  {
    "code": "47.53",
    "name": "Trgovina na malo tepisima i prostirkama za pod, zidnim i podnim oblogama"
  },
  {
    "code": "47.54",
    "name": "Trgovina na malo električnim aparatima za domaćinstvo"
  },
  {
    "code": "47.55",
    "name": "Trgovina na malo nameštajem, opremom za osvetljenje, stonim posuđem i ostalim proizvodima za domaćinstvo"
  },
  {
    "code": "47.61",
    "name": "Trgovina na malo knjigama"
  },
  {
    "code": "47.62",
    "name": "Trgovina na malo novinama, ostalim periodičnim publikacijama i kancelarijskim materijalom"
  },
  {
    "code": "47.63",
    "name": "Trgovina na malo sportskom opremom"
  },
  {
    "code": "47.64",
    "name": "Trgovina na malo igrama i igračkama"
  },
  {
    "code": "47.69",
    "name": "Trgovina na malo proizvodima za kulturu i rekreaciju neklasifikovana na drugom mestu"
  },
  {
    "code": "47.71",
    "name": "Trgovina na malo odećom"
  },
  {
    "code": "47.72",
    "name": "Trgovina na malo obućom i proizvodima od kože"
  },
  {
    "code": "47.73",
    "name": "Trgovina na malo farmaceutskim proizvodima"
  },
  {
    "code": "47.74",
    "name": "Trgovina na malo medicinskim i ortopedskim pomagalima"
  },
  {
    "code": "47.75",
    "name": "Trgovina na malo kozmetičkim i toaletnim proizvodima"
  },
  {
    "code": "47.76",
    "name": "Trgovina na malo cvećem, sadnicama, đubrivima, kućnim ljubimcima i hranom za kućne ljubimce"
  },
  {
    "code": "47.77",
    "name": "Trgovina na malo satovima i nakitom"
  },
  {
    "code": "47.78",
    "name": "Trgovina na malo ostalom novom robom"
  },
  {
    "code": "47.79",
    "name": "Trgovina na malo polovnom robom"
  },
  {
    "code": "47.81",
    "name": "Trgovina na malo motornim vozilima"
  },
  {
    "code": "47.82",
    "name": "Trgovina na malo delovima i priborom za motorna vozila"
  },
  {
    "code": "47.83",
    "name": "Trgovina na malo motociklima i delovima i priborom za motocikle"
  },
  {
    "code": "47.91",
    "name": "Uslužne delatnosti posredovanja u nespecijalizovanoj trgovini na malo"
  },
  {
    "code": "47.92",
    "name": "Uslužne delatnosti posredovanja u specijalizovanoj trgovini na malo"
  },
  {
    "code": "49.11",
    "name": "Prevoz putnika železnicom"
  },
  {
    "code": "49.12",
    "name": "Ostali železnički prevoz putnika"
  },
  {
    "code": "49.20",
    "name": "Železnički prevoz tereta"
  },
  {
    "code": "49.31",
    "name": "Redovni drumski prevoz putnika"
  },
  {
    "code": "49.32",
    "name": "Povremeni drumski prevoz putnika"
  },
  {
    "code": "49.33",
    "name": "Uslužne delatnosti prevoza putnika na zahtev vozilom sa vozačem"
  },
  {
    "code": "49.34",
    "name": "Prevoz putnika žičarama i ski-liftovima"
  },
  {
    "code": "49.39",
    "name": "Ostali kopneni prevoz putnika neklasifikovan na drugom mestu"
  },
  {
    "code": "49.41",
    "name": "Drumski prevoz tereta"
  },
  {
    "code": "49.42",
    "name": "Usluge selidbe"
  },
  {
    "code": "49.50",
    "name": "Cevovodni transport"
  },
  {
    "code": "50.10",
    "name": "Pomorski i priobalni prevoz putnika"
  },
  {
    "code": "50.20",
    "name": "Pomorski i priobalni prevoz tereta"
  },
  {
    "code": "50.30",
    "name": "Prevoz putnika unutrašnjim plovnim putevima"
  },
  {
    "code": "50.40",
    "name": "Prevoz tereta unutrašnjim plovnim putevima"
  },
  {
    "code": "51.10",
    "name": "Vazdušni prevoz putnika"
  },
  {
    "code": "51.21",
    "name": "Vazdušni prevoz tereta"
  },
  {
    "code": "51.22",
    "name": "Svemirski saobraćaj"
  },
  {
    "code": "52.10",
    "name": "Skladištenje"
  },
  {
    "code": "52.21",
    "name": "Uslužne delatnosti u kopnenom saobraćaju"
  },
  {
    "code": "52.22",
    "name": "Uslužne delatnosti u vodenom saobraćaju"
  },
  {
    "code": "52.23",
    "name": "Uslužne delatnosti u vazdušnom saobraćaju"
  },
  {
    "code": "52.24",
    "name": "Manipulacija teretom"
  },
  {
    "code": "52.25",
    "name": "Uslužne delatnosti logistike"
  },
  {
    "code": "52.26",
    "name": "Ostale delatnosti podrške saobraćaju"
  },
  {
    "code": "52.31",
    "name": "Uslužne delatnosti posredovanja u prevozu tereta"
  },
  {
    "code": "52.32",
    "name": "Uslužne delatnosti posredovanja u prevozu putnika"
  },
  {
    "code": "53.10",
    "name": "Poštanske delatnosti univerzalnog uslužnog servisa"
  },
  {
    "code": "53.20",
    "name": "Ostale poštanske i kurirske delatnosti"
  },
  {
    "code": "53.30",
    "name": "Uslužne delatnosti posredovanja u poštanskim i kurirskim delatnostima"
  },
  {
    "code": "55.10",
    "name": "Hoteli i sličan smeštaj"
  },
  {
    "code": "55.20",
    "name": "Odmarališta i slični objekti za kraći boravak"
  },
  {
    "code": "55.30",
    "name": "Kampovi i parkovi za rekreativna vozila"
  },
  {
    "code": "55.40",
    "name": "Uslužne delatnosti posredovanja u pružanju usluge smeštaja"
  },
  {
    "code": "55.90",
    "name": "Ostali smeštaj"
  },
  {
    "code": "56.11",
    "name": "Delatnosti restorana"
  },
  {
    "code": "56.12",
    "name": "Delatnosti pokretnih ugostiteljskih objekata"
  },
  {
    "code": "56.21",
    "name": "Delatnosti keteringa za razne događaje"
  },
  {
    "code": "56.22",
    "name": "Delatnosti keteringa po ugovoru i ostale usluge pripremanja i posluživanja hrane"
  },
  {
    "code": "56.30",
    "name": "Delatnosti pripremanja i posluživanja pića"
  },
  {
    "code": "56.40",
    "name": "Uslužne delatnosti posredovanja u pripremanju i posluživanju hrane i pića"
  },
  {
    "code": "58.11",
    "name": "Izdavanje knjiga"
  },
  {
    "code": "58.12",
    "name": "Izdavanje novina"
  },
  {
    "code": "58.13",
    "name": "Izdavanje časopisa i periodičnih izdanja"
  },
  {
    "code": "58.19",
    "name": "Ostale izdavačke delatnosti, osim izdavanja softvera"
  },
  {
    "code": "58.21",
    "name": "Izdavanje video-igara"
  },
  {
    "code": "58.29",
    "name": "Izdavanje ostalog softvera"
  },
  {
    "code": "59.11",
    "name": "Proizvodnja kinematografskih dela i televizijskog programa"
  },
  {
    "code": "59.12",
    "name": "Postprodukcija kinematografskih dela i televizijskog programa"
  },
  {
    "code": "59.13",
    "name": "Delatnosti distribucije filmova i videa"
  },
  {
    "code": "59.14",
    "name": "Delatnosti prikazivanja filmova"
  },
  {
    "code": "59.20",
    "name": "Delatnosti snimanja i izdavanja zvučnih zapisa i muzike"
  },
  {
    "code": "60.10",
    "name": "Delatnosti emitovanja radio programa i distribucije audio sadržaja"
  },
  {
    "code": "60.20",
    "name": "Proizvodnja i emitovanje televizijskog programa i video distribucija"
  },
  {
    "code": "60.31",
    "name": "Delatnosti novinskih agencija"
  },
  {
    "code": "60.39",
    "name": "Ostale delatnosti distribucije sadržaja"
  },
  {
    "code": "61.10",
    "name": "Kablovske, bežične i satelitske telekomunikacione delatnosti"
  },
  {
    "code": "61.20",
    "name": "Preprodaja telekomunikacija i uslužne delatnosti posredovanja u telekomunikacijama"
  },
  {
    "code": "61.90",
    "name": "Ostale telekomunikacione delatnosti"
  },
  {
    "code": "62.10",
    "name": "Delatnosti računarskog programiranja"
  },
  {
    "code": "62.20",
    "name": "Konsalting u računarstvu i upravljanje računarskom opremom"
  },
  {
    "code": "62.90",
    "name": "Ostale uslužne delatnosti informacionih tehnologija i računarstva"
  },
  {
    "code": "63.10",
    "name": "Računarska infrastruktura, obrada podataka, hosting i povezane delatnosti"
  },
  {
    "code": "63.91",
    "name": "Delatnosti portala za pretragu veba"
  },
  {
    "code": "63.92",
    "name": "Ostale informacione uslužne delatnosti"
  },
  {
    "code": "64.11",
    "name": "Centralna banka"
  },
  {
    "code": "64.19",
    "name": "Ostalo monetarno posredovanje"
  },
  {
    "code": "64.21",
    "name": "Delatnosti holding društava"
  },
  {
    "code": "64.22",
    "name": "Delatnosti protočnih finansijskih institucija"
  },
  {
    "code": "64.31",
    "name": "Delatnosti investicionih fondova tržišta novca i nenovčanog tržišta"
  },
  {
    "code": "64.32",
    "name": "Delatnosti trastova, ostavinskih i zastupničkih računa"
  },
  {
    "code": "64.91",
    "name": "Finansijski lizing"
  },
  {
    "code": "64.92",
    "name": "Ostalo odobravanje kredita"
  },
  {
    "code": "64.99",
    "name": "Ostale finansijske uslužne delatnosti, osim osiguranja i penzijskih fondova, neklasifikovane na drugom mestu"
  },
  {
    "code": "65.11",
    "name": "Životno osiguranje"
  },
  {
    "code": "65.12",
    "name": "Neživotno osiguranje"
  },
  {
    "code": "65.20",
    "name": "Reosiguranje"
  },
  {
    "code": "65.30",
    "name": "Penzijski fondovi"
  },
  {
    "code": "66.11",
    "name": "Upravljanje finansijskim tržištima"
  },
  {
    "code": "66.12",
    "name": "Brokerski poslovi s hartijama od vrednosti i berzanskom robom"
  },
  {
    "code": "66.19",
    "name": "Ostale pomoćne delatnosti u finansijskim uslugama, osim osiguranja i penzijskih fondova"
  },
  {
    "code": "66.21",
    "name": "Procenjivanje rizika i šteta"
  },
  {
    "code": "66.22",
    "name": "Delatnosti zastupnika i posrednika u osiguranju"
  },
  {
    "code": "66.29",
    "name": "Pomoćne delatnosti u osiguranju i penzijskim fondovima neklasifikovane na drugom mestu"
  },
  {
    "code": "66.30",
    "name": "Delatnosti upravljanja fondovima"
  },
  {
    "code": "68.11",
    "name": "Kupovina i prodaja vlastitih nepokretnosti"
  },
  {
    "code": "68.12",
    "name": "Razvoj projekata izgradnje"
  },
  {
    "code": "68.20",
    "name": "Iznajmljivanje i upravljanje sopstvenim ili iznajmljenim nepokretnostima"
  },
  {
    "code": "68.31",
    "name": "Delatnosti posredovanja u prometu i zakupu nepokretnosti"
  },
  {
    "code": "68.32",
    "name": "Ostale delatnosti poslovanja nepokretnostima uz naknadu"
  },
  {
    "code": "69.10",
    "name": "Pravne delatnosti"
  },
  {
    "code": "69.20",
    "name": "Računovodstvene, knjigovodstvene i revizorske delatnosti; poresko savetovanje"
  },
  {
    "code": "70.10",
    "name": "Delatnosti poslovnih sedišta"
  },
  {
    "code": "70.20",
    "name": "Poslovne i ostale menadžerske konsultantske delatnosti"
  },
  {
    "code": "71.11",
    "name": "Arhitektonske delatnosti"
  },
  {
    "code": "71.12",
    "name": "Inženjerske delatnosti i povezano tehničko savetovanje"
  },
  {
    "code": "71.20",
    "name": "Tehničko ispitivanje i analize"
  },
  {
    "code": "72.10",
    "name": "Istraživanje i eksperimentalni razvoj u prirodnim i tehničko-tehnološkim naukama"
  },
  {
    "code": "72.20",
    "name": "Istraživanje i razvoj u društvenim i humanističkim naukama"
  },
  {
    "code": "73.11",
    "name": "Delatnosti reklamnih agencija"
  },
  {
    "code": "73.12",
    "name": "Medijsko predstavljanje"
  },
  {
    "code": "73.20",
    "name": "Istraživanje tržišta i ispitivanje javnog mnjenja"
  },
  {
    "code": "73.30",
    "name": "Odnosi s javnošću i komunikacijske delatnosti"
  },
  {
    "code": "74.11",
    "name": "Delatnosti dizajna industrijskih proizvoda i modnog dizajna"
  },
  {
    "code": "74.12",
    "name": "Delatnosti grafičkog dizajna i vizuelne komunikacije"
  },
  {
    "code": "74.13",
    "name": "Delatnosti dizajna enterijera"
  },
  {
    "code": "74.14",
    "name": "Ostale specijalizovane dizajnerske delatnosti"
  },
  {
    "code": "74.20",
    "name": "Fotografske delatnosti"
  },
  {
    "code": "74.30",
    "name": "Delatnosti prevođenja i tumačenja"
  },
  {
    "code": "74.91",
    "name": "Posredovanje i marketinške uslužne delatnosti u vezi sa patentima"
  },
  {
    "code": "74.99",
    "name": "Ostale stručne, naučne i tehničke delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "75.00",
    "name": "Veterinarske delatnosti"
  },
  {
    "code": "77.11",
    "name": "Iznajmljivanje i lizing automobila i lakih motornih vozila"
  },
  {
    "code": "77.12",
    "name": "Iznajmljivanje i lizing kamiona"
  },
  {
    "code": "77.21",
    "name": "Iznajmljivanje i lizing opreme za rekreaciju i sport"
  },
  {
    "code": "77.22",
    "name": "Iznajmljivanje i lizing ostalih predmeta za ličnu upotrebu i upotrebu u domaćinstvu"
  },
  {
    "code": "77.31",
    "name": "Iznajmljivanje i lizing poljoprivrednih mašina i opreme"
  },
  {
    "code": "77.32",
    "name": "Iznajmljivanje i lizing mašina i opreme za građevinarstvo"
  },
  {
    "code": "77.33",
    "name": "Iznajmljivanje i lizing kancelarijskih mašina, opreme i računara"
  },
  {
    "code": "77.34",
    "name": "Iznajmljivanje i lizing opreme za vodeni saobraćaj"
  },
  {
    "code": "77.35",
    "name": "Iznajmljivanje i lizing opreme za vazdušni saobraćaj"
  },
  {
    "code": "77.39",
    "name": "Iznajmljivanje i lizing ostalih mašina, opreme i materijalnih dobara neklasifikovano na drugom mestu"
  },
  {
    "code": "77.40",
    "name": "Lizing intelektualne svojine i sličnih proizvoda, osim dela zaštićenih autorskim pravima"
  },
  {
    "code": "77.51",
    "name": "Uslužne delatnosti posredovanja u iznajmljivanju i lizingu automobila, kampera i prikolica"
  },
  {
    "code": "77.52",
    "name": "Uslužne delatnosti posredovanja u iznajmljivanju i lizingu ostalih materijalnih dobara i nefinansijskih nematerijalnih sredstava"
  },
  {
    "code": "78.10",
    "name": "Delatnosti agencija za zapošljavanje"
  },
  {
    "code": "78.20",
    "name": "Delatnosti agencija za privremeno zapošljavanje i ostalo ustupanje ljudskih resursa"
  },
  {
    "code": "79.11",
    "name": "Delatnosti turističkih agencija"
  },
  {
    "code": "79.12",
    "name": "Delatnosti turoperatora"
  },
  {
    "code": "79.90",
    "name": "Ostale usluge rezervacije i povezane delatnosti"
  },
  {
    "code": "80.01",
    "name": "Delatnosti istrage i privatnog obezbeđenja"
  },
  {
    "code": "80.09",
    "name": "Bezbednosne delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "81.10",
    "name": "Kombinovane usluge održavanja objekata"
  },
  {
    "code": "81.21",
    "name": "Opšte čišćenje zgrada"
  },
  {
    "code": "81.22",
    "name": "Ostale delatnosti čišćenja zgrada i objekata"
  },
  {
    "code": "81.23",
    "name": "Ostale delatnosti čišćenja"
  },
  {
    "code": "81.30",
    "name": "Uslužne delatnosti održavanja okoline"
  },
  {
    "code": "82.10",
    "name": "Kancelarijsko-administrativne delatnosti i delatnosti podrške"
  },
  {
    "code": "82.20",
    "name": "Delatnosti pozivnih centara"
  },
  {
    "code": "82.30",
    "name": "Organizovanje sastanaka i sajmova"
  },
  {
    "code": "82.40",
    "name": "Uslužne delatnosti posredovanja u delatnostima podrške poslovanju neklasifikovane na drugom mestu"
  },
  {
    "code": "82.91",
    "name": "Delatnosti agencija za naplatu potraživanja i kreditnih biroa"
  },
  {
    "code": "82.92",
    "name": "Delatnosti pakovanja"
  },
  {
    "code": "82.99",
    "name": "Ostale uslužne delatnosti podrške poslovanju neklasifikovane na drugom mestu"
  },
  {
    "code": "84.11",
    "name": "Delatnosti državnih organa"
  },
  {
    "code": "84.12",
    "name": "Regulisanje zdravstvene zaštite, obrazovanja, kulture i ostalih društvenih usluga"
  },
  {
    "code": "84.13",
    "name": "Regulisanje i doprinos efikasnijem poslovanju preduzeća"
  },
  {
    "code": "84.21",
    "name": "Spoljni poslovi"
  },
  {
    "code": "84.22",
    "name": "Poslovi odbrane"
  },
  {
    "code": "84.23",
    "name": "Sudske i pravosudne delatnosti"
  },
  {
    "code": "84.24",
    "name": "Obezbeđivanje javnog reda i bezbednosti"
  },
  {
    "code": "84.25",
    "name": "Delatnosti vatrogasnih jedinica"
  },
  {
    "code": "84.30",
    "name": "Obavezno socijalno osiguranje"
  },
  {
    "code": "85.10",
    "name": "Predškolsko vaspitanje i obrazovanje"
  },
  {
    "code": "85.20",
    "name": "Osnovno obrazovanje"
  },
  {
    "code": "85.31",
    "name": "Srednje opšte obrazovanje"
  },
  {
    "code": "85.32",
    "name": "Srednje stručno obrazovanje"
  },
  {
    "code": "85.33",
    "name": "Obrazovanje posle srednjeg koje nije visoko"
  },
  {
    "code": "85.40",
    "name": "Visoko obrazovanje"
  },
  {
    "code": "85.51",
    "name": "Obrazovanje u oblasti sporta i rekreacije"
  },
  {
    "code": "85.52",
    "name": "Obrazovanje u oblasti kulture"
  },
  {
    "code": "85.53",
    "name": "Delatnosti škola za vozače"
  },
  {
    "code": "85.59",
    "name": "Ostalo obrazovanje neklasifikovano na drugom mestu"
  },
  {
    "code": "85.61",
    "name": "Uslužne delatnosti posredovanja u obuci i podučavanju"
  },
  {
    "code": "85.69",
    "name": "Delatnosti podrške obrazovanju neklasifikovane na drugom mestu"
  },
  {
    "code": "86.10",
    "name": "Delatnosti bolnica"
  },
  {
    "code": "86.21",
    "name": "Delatnosti opšte medicinske prakse"
  },
  {
    "code": "86.22",
    "name": "Delatnosti specijalističke medicinske prakse"
  },
  {
    "code": "86.23",
    "name": "Delatnosti stomatološke prakse"
  },
  {
    "code": "86.91",
    "name": "Usluge dijagnostičkog snimanja i delatnosti medicinskih laboratorija"
  },
  {
    "code": "86.92",
    "name": "Prevoz pacijenata ambulantnim vozilima"
  },
  {
    "code": "86.93",
    "name": "Delatnosti psihologa i psihoterapeuta, osim lekara"
  },
  {
    "code": "86.94",
    "name": "Delatnosti medicinskih sestara i babica"
  },
  {
    "code": "86.95",
    "name": "Delatnosti fizioterapeuta"
  },
  {
    "code": "86.96",
    "name": "Delatnosti tradicionalne, komplementarne i alternativne medicine"
  },
  {
    "code": "86.97",
    "name": "Uslužne delatnosti posredovanja u medicinskim, stomatološkim i ostalim zdravstvenim uslugama"
  },
  {
    "code": "86.99",
    "name": "Ostale zdravstvene delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "87.10",
    "name": "Delatnosti socijalne zaštite sa smeštajem i medicinskom negom"
  },
  {
    "code": "87.20",
    "name": "Delatnosti socijalne zaštite sa smeštajem za osobe sa mentalnim i intelektualnim teškoćama ili bolestima zavisnosti"
  },
  {
    "code": "87.30",
    "name": "Delatnosti socijalne zaštite sa smeštajem za starije osobe ili osobe sa invaliditetom"
  },
  {
    "code": "87.91",
    "name": "Uslužne delatnosti posredovanja u delatnostima socijalne zaštite sa smeštajem"
  },
  {
    "code": "87.99",
    "name": "Ostale delatnosti socijalne zaštite sa smeštajem neklasifikovane na drugom mestu"
  },
  {
    "code": "88.10",
    "name": "Delatnosti socijalne zaštite bez smeštaja za starije osobe ili osobe sa invaliditetom"
  },
  {
    "code": "88.91",
    "name": "Delatnosti dnevne brige o deci"
  },
  {
    "code": "88.99",
    "name": "Ostale delatnosti socijalne zaštite bez smeštaja neklasifikovane na drugom mestu"
  },
  {
    "code": "90.11",
    "name": "Delatnosti književnog stvaralaštva i muzičkog komponovanja"
  },
  {
    "code": "90.12",
    "name": "Delatnosti stvaralaštva vizuelnih umetnosti"
  },
  {
    "code": "90.13",
    "name": "Delatnosti ostalog umetničkog stvaralaštva"
  },
  {
    "code": "90.20",
    "name": "Delatnosti izvođačkih umetnosti"
  },
  {
    "code": "90.31",
    "name": "Poslovanje umetničkih objekata i lokaliteta"
  },
  {
    "code": "90.39",
    "name": "Ostale delatnosti podrške umetnosti i izvođačkim umetnostima"
  },
  {
    "code": "91.11",
    "name": "Delatnosti biblioteka"
  },
  {
    "code": "91.12",
    "name": "Delatnosti arhiva"
  },
  {
    "code": "91.21",
    "name": "Delatnosti muzeja i zbirki"
  },
  {
    "code": "91.22",
    "name": "Delatnosti istorijskih lokaliteta i spomenika kulture"
  },
  {
    "code": "91.30",
    "name": "Konzervacija, restauracija i ostale delatnosti podrške kulturnom nasleđu"
  },
  {
    "code": "91.41",
    "name": "Delatnosti botaničkih i zooloških vrtova"
  },
  {
    "code": "91.42",
    "name": "Delatnosti rezervata prirode i zaštite prirodnih vrednosti"
  },
  {
    "code": "92.00",
    "name": "Delatnosti kockanja i klađenja"
  },
  {
    "code": "93.11",
    "name": "Poslovanje sportskih objekata"
  },
  {
    "code": "93.12",
    "name": "Delatnosti sportskih klubova"
  },
  {
    "code": "93.13",
    "name": "Delatnosti fitnes centara"
  },
  {
    "code": "93.19",
    "name": "Sportske delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "93.21",
    "name": "Delatnosti zabavnih i tematskih parkova"
  },
  {
    "code": "93.29",
    "name": "Zabavne i rekreativne delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "94.11",
    "name": "Delatnosti poslovnih organizacija i organizacija poslodavaca"
  },
  {
    "code": "94.12",
    "name": "Delatnosti profesionalnih članskih organizacija"
  },
  {
    "code": "94.20",
    "name": "Delatnosti sindikata"
  },
  {
    "code": "94.91",
    "name": "Delatnosti verskih organizacija"
  },
  {
    "code": "94.92",
    "name": "Delatnosti političkih organizacija"
  },
  {
    "code": "94.99",
    "name": "Delatnosti ostalih članskih organizacija neklasifikovane na drugom mestu"
  },
  {
    "code": "95.10",
    "name": "Popravka i održavanje računara i komunikacione opreme"
  },
  {
    "code": "95.21",
    "name": "Popravka i održavanje električnih uređaja za široku potrošnju"
  },
  {
    "code": "95.22",
    "name": "Popravka i održavanje aparata za domaćinstvo, kućne i baštenske opreme"
  },
  {
    "code": "95.23",
    "name": "Popravka i održavanje obuće i predmeta od kože"
  },
  {
    "code": "95.24",
    "name": "Popravka i održavanje nameštaja i opreme za opremanje doma"
  },
  {
    "code": "95.25",
    "name": "Popravka i održavanje satova i nakita"
  },
  {
    "code": "95.29",
    "name": "Popravka i održavanje predmeta za ličnu upotrebu i upotrebu u domaćinstvu neklasifikovana na drugom mestu"
  },
  {
    "code": "95.31",
    "name": "Popravka i održavanje motornih vozila"
  },
  {
    "code": "95.32",
    "name": "Popravka i održavanje motocikala"
  },
  {
    "code": "95.40",
    "name": "Uslužne delatnosti posredovanja u popravkama i održavanju računara, predmeta za ličnu upotrebu i upotrebu u domaćinstvu i motornih vozila i motocikala"
  },
  {
    "code": "96.10",
    "name": "Pranje i čišćenje tekstilnih i krznenih proizvoda"
  },
  {
    "code": "96.21",
    "name": "Frizerske i berberske delatnosti"
  },
  {
    "code": "96.22",
    "name": "Delatnosti nege lepote i ostali kozmetički tretmani"
  },
  {
    "code": "96.23",
    "name": "Delatnosti spa i velnes salona, saune i parnog kupatila"
  },
  {
    "code": "96.30",
    "name": "Pogrebne i povezane delatnosti"
  },
  {
    "code": "96.40",
    "name": "Uslužne delatnosti posredovanja u ličnim uslužnim delatnostima"
  },
  {
    "code": "96.91",
    "name": "Pružanje domaćih ličnih uslužnih delatnosti"
  },
  {
    "code": "96.99",
    "name": "Ostale lične uslužne delatnosti neklasifikovane na drugom mestu"
  },
  {
    "code": "97.00",
    "name": "Delatnosti domaćinstava kao poslodavaca kućnom pomoćnom osoblju"
  },
  {
    "code": "98.10",
    "name": "Proizvodnja nediferenciranih dobara od strane domaćinstava za sopstvene potrebe"
  },
  {
    "code": "98.20",
    "name": "Proizvodnja nediferenciranih usluga od strane domaćinstava za sopstvene potrebe"
  },
  {
    "code": "99.00",
    "name": "Delatnosti eksteritorijalnih organizacija i tela"
  }
];
