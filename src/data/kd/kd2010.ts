// GENERISANO automatski skriptom scripts/generate-kd-data.ts, ne menjati ručno.
// Izvor: Republički zavod za statistiku Srbije (stat.gov.rs), stranica
// https://www.stat.gov.rs/istrazivanja/klasifikacije/, preuzeto 2026-11-23.
// Klasifikacija delatnosti 2010 (KD 2010), nivo "razred". Šifre su normalizovane na oblik sa tačkom (XX.XX) da budu dosledne KD 2025 i Tabeli veza; izvorni fajl ih ima bez tačke (npr. "6201").

import type { KDRazred } from "./kd2025";

export const KD2010: readonly KDRazred[] = [
  {
    "code": "01.11",
    "name": "Gajenje žita (osim pirinča), leguminoza i uljarica"
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
    "name": "Gajenje agruma"
  },
  {
    "code": "01.24",
    "name": "Gajenje jabučastog i koštičavog voća"
  },
  {
    "code": "01.25",
    "name": "Gajenje ostalog drvenastog, žbunastog i jezgrastog voća"
  },
  {
    "code": "01.26",
    "name": "Gajenje uljnih plodova"
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
    "name": "Uzgoj drugih goveda i bivola"
  },
  {
    "code": "01.43",
    "name": "Uzgoj konja i drugih kopitara"
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
    "code": "01.49",
    "name": "Uzgoj ostalih životinja"
  },
  {
    "code": "01.50",
    "name": "Mešovita poljoprivredna proizvodnja"
  },
  {
    "code": "01.61",
    "name": "Uslužne delatnosti u gajenju useva i zasada"
  },
  {
    "code": "01.62",
    "name": "Pomoćne delatnosti u uzgoju životinja"
  },
  {
    "code": "01.63",
    "name": "Aktivnosti posle žetve"
  },
  {
    "code": "01.64",
    "name": "Dorada semena"
  },
  {
    "code": "01.70",
    "name": "Lov, traperstvo i odgovarajuće uslužne delatnosti"
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
    "name": "Uslužne delatnosti u vezi sa šumarstvom"
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
    "name": "Morske akvakulture"
  },
  {
    "code": "03.22",
    "name": "Slatkovodne akvakulture"
  },
  {
    "code": "05.10",
    "name": "Eksploatacija kamenog uglja i antracita"
  },
  {
    "code": "05.20",
    "name": "Eksploatacija lignita i mrkog uglja"
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
    "name": "Eksploatacija ruda ostalih crnih, obojenih, plemenitih i drugih metala"
  },
  {
    "code": "08.11",
    "name": "Eksploatacija građevinskog i ukrasnog kamena, krečnjaka, gipsa, krede"
  },
  {
    "code": "08.12",
    "name": "Eksploatacija šljunka, peska, gline i kaolina"
  },
  {
    "code": "08.91",
    "name": "Eksploatacija minerala, proizvodnja mineralnih đubriva i hemikalija"
  },
  {
    "code": "08.92",
    "name": "Eksploatacija treseta"
  },
  {
    "code": "08.93",
    "name": "Eksploatacija natrijum-hlorida"
  },
  {
    "code": "08.99",
    "name": "Eksploatacija ostalih nemetaličnih ruda i minerala"
  },
  {
    "code": "09.10",
    "name": "Uslužne delatnosti u vezi sa istraživanjem i eksploatacijom nafte i gasa"
  },
  {
    "code": "09.90",
    "name": "Uslužne delatnosti u vezi sa istraživanjem i eksploatacijom ostalih ruda"
  },
  {
    "code": "10.11",
    "name": "Prerada i konzervisanje mesa"
  },
  {
    "code": "10.12",
    "name": "Prerada i konzervisanje živinskog mesa"
  },
  {
    "code": "10.13",
    "name": "Proizvodnja mesnih prerađevina"
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
    "name": "Prerada mleka i proizvodnja sireva"
  },
  {
    "code": "10.52",
    "name": "Proizvodnja sladoleda"
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
    "name": "Proizvodnja hleba, svežeg peciva i kolača"
  },
  {
    "code": "10.72",
    "name": "Proizvodnja dvopeka, keksa, trajnog peciva i kolača"
  },
  {
    "code": "10.73",
    "name": "Proizvodnja makarona, rezanaca i sličnih proizvoda od brašna"
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
    "name": "Proizvodnja začina i drugih dodataka hrani"
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
    "name": "Proizvodnja ostalih prehrambenih proizvoda"
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
    "name": "Destilacija, prečišćavanje i mešanje pića"
  },
  {
    "code": "11.02",
    "name": "Proizvodnja vina od grožđa"
  },
  {
    "code": "11.03",
    "name": "Proizvodnja pića i ostalih voćnih vina"
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
    "name": "Proizvodnja osvežavajućih pića, mineralne vode i ostale flaširane vode"
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
    "name": "Proizvodnja tkanina"
  },
  {
    "code": "13.30",
    "name": "Dovršavanje tekstila"
  },
  {
    "code": "13.91",
    "name": "Proizvodnja pletenih i kukičanih materijala"
  },
  {
    "code": "13.92",
    "name": "Proizvodnja gotovih tekstilnih proizvoda, osim odeće"
  },
  {
    "code": "13.93",
    "name": "Proizvodnja tepiha i prekrivača za pod"
  },
  {
    "code": "13.94",
    "name": "Proizvodnja užadi, kanapa, pletenica i mreža"
  },
  {
    "code": "13.95",
    "name": "Proizvodnja netkanog tekstila i predmeta od njega, osim odeće"
  },
  {
    "code": "13.96",
    "name": "Proizvodnja ostalog tehničkog i industrijskog tekstila"
  },
  {
    "code": "13.99",
    "name": "Proizvodnja ostalih tekstilnih predmeta"
  },
  {
    "code": "14.11",
    "name": "Proizvodnja kožne odeće"
  },
  {
    "code": "14.12",
    "name": "Proizvodnja radne odeće"
  },
  {
    "code": "14.13",
    "name": "Proizvodnja ostale odeće"
  },
  {
    "code": "14.14",
    "name": "Proizvodnja rublja"
  },
  {
    "code": "14.19",
    "name": "Proizvodnja ostalih odevnih predmeta i pribora"
  },
  {
    "code": "14.20",
    "name": "Proizvodnja proizvoda od krzna"
  },
  {
    "code": "14.31",
    "name": "Proizvodnja pletenih i kukičanih čarapa"
  },
  {
    "code": "14.39",
    "name": "Proizvodnja ostale pletene i kukičane odeće"
  },
  {
    "code": "15.11",
    "name": "Štavljenje i dorada kože; dorada i bojenje krzna"
  },
  {
    "code": "15.12",
    "name": "Proizvodnja putnih i ručnih torbi i sl., saračkih proizvoda i kaiševa"
  },
  {
    "code": "15.20",
    "name": "Proizvodnja obuće"
  },
  {
    "code": "16.10",
    "name": "Rezanje i obrada drveta"
  },
  {
    "code": "16.21",
    "name": "Proizvodnja furnira i ploča od drveta"
  },
  {
    "code": "16.22",
    "name": "Proizvodnja parketa"
  },
  {
    "code": "16.23",
    "name": "Proizvodnja ostale građevinske stolarije i elemenata"
  },
  {
    "code": "16.24",
    "name": "Proizvodnja drvne ambalaže"
  },
  {
    "code": "16.29",
    "name": "Proizvodnja ostalih proizvoda od drveta, plute, slame i pruća"
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
    "name": "Proizvodnja talasastog papira i kartona i ambalaže od papira i kartona"
  },
  {
    "code": "17.22",
    "name": "Proizvodnja predmeta od papira za ličnu upotrebu i upotrebu u domaćinstvu"
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
    "code": "17.29",
    "name": "Proizvodnja ostalih proizvoda od papira i kartona"
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
    "name": "Usluge pripreme za štampu"
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
    "name": "Proizvodnja produkata koksovanja"
  },
  {
    "code": "19.20",
    "name": "Proizvodnja derivata nafte"
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
    "name": "Proizvodnja pesticida i hemikalija za poljoprivredu"
  },
  {
    "code": "20.30",
    "name": "Proizvodnja boja, lakova i sličnih premaza, grafičkih boja i kitova"
  },
  {
    "code": "20.41",
    "name": "Proizvodnja deterdženata, sapuna sredstava za čišćenje i poliranje"
  },
  {
    "code": "20.42",
    "name": "Proizvodnja parfema i toaletnih preparata"
  },
  {
    "code": "20.51",
    "name": "Proizvodnja eksploziva"
  },
  {
    "code": "20.52",
    "name": "Proizvodnja sredstava za lepljenje"
  },
  {
    "code": "20.53",
    "name": "Proizvodnja eteričnih ulja"
  },
  {
    "code": "20.59",
    "name": "Proizvodnja ostalih hemijskih proizvoda"
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
    "name": "Proizvodnja guma za vozila, protektiranje guma za vozila"
  },
  {
    "code": "22.19",
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
    "name": "Proizvodnja predmeta od plastike za građevinarstvo"
  },
  {
    "code": "22.29",
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
    "code": "23.19",
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
    "name": "Proizvodnja opeke, crepa i građevinskih proizvoda od pečene gline"
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
    "code": "23.49",
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
    "name": "Proizvodnja proizvoda od betona namenjenih za građevinarstvo"
  },
  {
    "code": "23.62",
    "name": "Proizvodnja proizvoda od gipsa namenjenih za građevinarstvo"
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
    "code": "23.69",
    "name": "Proizvodnja ostalih proizvoda od betona, gipsa i cementa"
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
    "name": "Proizvodnja ostalih proizvoda od nemetalnih minerala"
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
    "name": "Hladno valjanje šipki"
  },
  {
    "code": "24.32",
    "name": "Hladno valjanje pljosnatih proizvoda"
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
    "name": "Proizvodnja kotlova i radijatora za centralno grejanje"
  },
  {
    "code": "25.29",
    "name": "Proizvodnja ostalih metalnih cisterni, rezervoara i kontejnera"
  },
  {
    "code": "25.30",
    "name": "Proizvodnja parnih kotlova, osim kotlova za centralno grejanje"
  },
  {
    "code": "25.40",
    "name": "Proizvodnja oružja i municije"
  },
  {
    "code": "25.50",
    "name": "Kovanje, presovanje, štancovanje i valjanje metala; metalurgija praha"
  },
  {
    "code": "25.61",
    "name": "Obrada i prevlačenje metala"
  },
  {
    "code": "25.62",
    "name": "Mašinska obrada metala"
  },
  {
    "code": "25.71",
    "name": "Proizvodnja sečiva"
  },
  {
    "code": "25.72",
    "name": "Proizvodnja brava i okova"
  },
  {
    "code": "25.73",
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
    "name": "Proizvodnja ostalih metalnih proizvoda"
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
    "name": "Proizvodnja optičkih instrumenata i fotografske opreme"
  },
  {
    "code": "26.80",
    "name": "Proizvodnja magnetnih i optičkih nosilaca zapisa"
  },
  {
    "code": "27.11",
    "name": "Proizvodnja elektromotora, generatora i transformatora"
  },
  {
    "code": "27.12",
    "name": "Proizvodnja opreme za distribuciju električne energije i opreme za upravljanje električnom energijom"
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
    "name": "Proizvodnja motora i turbina, osim za letelice i motorna vozila"
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
    "name": "Proizvodnja industrijskih peći i gorionika"
  },
  {
    "code": "28.22",
    "name": "Proizvodnja opreme za podizanje i prenošenje"
  },
  {
    "code": "28.23",
    "name": "Proizvodnja kancelarijskih mašina i opreme, osim računara i računarske opreme"
  },
  {
    "code": "28.24",
    "name": "Proizvodnja ručnih pogonskih aparata sa mehanizmima"
  },
  {
    "code": "28.25",
    "name": "Proizvodnja rashladne i ventilacione opreme, osim za domaćinstvo"
  },
  {
    "code": "28.29",
    "name": "Proizvodnja ostalih mašina i aparata opšte namene"
  },
  {
    "code": "28.30",
    "name": "Proizvodnja mašina za poljoprivredu i šumarstvo"
  },
  {
    "code": "28.41",
    "name": "Proizvodnja mašina za obradu metala"
  },
  {
    "code": "28.49",
    "name": "Proizvodnja ostalih alatnih mašina"
  },
  {
    "code": "28.91",
    "name": "Proizvodnja mašina za metalurgiju"
  },
  {
    "code": "28.92",
    "name": "Proizvodnja mašina za rudnike, kamenolome i građevinarstvo"
  },
  {
    "code": "28.93",
    "name": "Proizvodnja mašina za industriju hrane, pića i duvana"
  },
  {
    "code": "28.94",
    "name": "Proizvodnja mašina za industriju tekstila, odeće i kože"
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
    "code": "28.99",
    "name": "Proizvodnja mašina za ostale specijalne namene"
  },
  {
    "code": "29.10",
    "name": "Proizvodnja motornih vozila"
  },
  {
    "code": "29.20",
    "name": "Proizvodnja karoserija za motorna vozila, prikolice i poluprikolice"
  },
  {
    "code": "29.31",
    "name": "Proizvodnja električne i elektronske opreme za motorna vozila"
  },
  {
    "code": "29.32",
    "name": "Proizvodnja ostalih delova i dodatne opreme za motorna vozila"
  },
  {
    "code": "30.11",
    "name": "Izgradnja brodova i plovnih objekata"
  },
  {
    "code": "30.12",
    "name": "Izrada čamaca za sport i razonodu"
  },
  {
    "code": "30.20",
    "name": "Proizvodnja lokomotiva i šinskih vozila"
  },
  {
    "code": "30.30",
    "name": "Proizvodnja vazdušnih i svemirskih letelica i odgovarajuće opreme"
  },
  {
    "code": "30.40",
    "name": "Proizvodnja borbenih vojnih vozila"
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
    "name": "Proizvodnja ostale transportne opreme"
  },
  {
    "code": "31.01",
    "name": "Proizvodnja nameštaja za poslovne i prodajne prostore"
  },
  {
    "code": "31.02",
    "name": "Proizvodnja kuhinjskog nameštaja"
  },
  {
    "code": "31.03",
    "name": "Proizvodnja madraca"
  },
  {
    "code": "31.09",
    "name": "Proizvodnja ostalog nameštaja"
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
    "name": "Proizvodnja imitacije nakita i srodnih proizvoda"
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
    "name": "Proizvodnja ostalih predmeta"
  },
  {
    "code": "33.11",
    "name": "Popravka metalnih proizvoda"
  },
  {
    "code": "33.12",
    "name": "Popravka mašina"
  },
  {
    "code": "33.13",
    "name": "Popravka elektronske i optičke opreme"
  },
  {
    "code": "33.14",
    "name": "Popravka električne opreme"
  },
  {
    "code": "33.15",
    "name": "Popravka i održavanje brodova i čamaca"
  },
  {
    "code": "33.16",
    "name": "Popravka i održavanje letelica i svemirskih letelica"
  },
  {
    "code": "33.17",
    "name": "Popravka i održavanje druge transportne opreme"
  },
  {
    "code": "33.19",
    "name": "Popravka ostale opreme"
  },
  {
    "code": "33.20",
    "name": "Montaža industrijskih mašina i opreme"
  },
  {
    "code": "35.11",
    "name": "Proizvodnja električne energije"
  },
  {
    "code": "35.12",
    "name": "Prenos električne energije"
  },
  {
    "code": "35.13",
    "name": "Distribucija električne energije"
  },
  {
    "code": "35.14",
    "name": "Trgovina električnom energijom"
  },
  {
    "code": "35.21",
    "name": "Proizvodnja gasa"
  },
  {
    "code": "35.22",
    "name": "Distribucija gasovitih goriva gasovodom"
  },
  {
    "code": "35.23",
    "name": "Trgovina gasovitim gorivima preko gasovodne mreže"
  },
  {
    "code": "35.30",
    "name": "Snabdevanje parom i klimatizacija"
  },
  {
    "code": "36.00",
    "name": "Skupljanje, prečišćavanje i distribucija vode"
  },
  {
    "code": "37.00",
    "name": "Uklanjanje otpadnih voda"
  },
  {
    "code": "38.11",
    "name": "Skupljanje otpada koji nije opasan"
  },
  {
    "code": "38.12",
    "name": "Skupljanje opasnog otpada"
  },
  {
    "code": "38.21",
    "name": "Tretman i odlaganje otpada koji nije opasan"
  },
  {
    "code": "38.22",
    "name": "Tretman i odlaganje opasnog otpada"
  },
  {
    "code": "38.31",
    "name": "Demontaža olupina"
  },
  {
    "code": "38.32",
    "name": "Ponovna upotreba razvrstanih materijala"
  },
  {
    "code": "39.00",
    "name": "Sanacija, rekultivacija i druge usluge u oblasti upravljanja otpadom"
  },
  {
    "code": "41.10",
    "name": "Razrada građevinskih projekata"
  },
  {
    "code": "41.20",
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
    "name": "Izgradnja ostalih nepomenutih građevina"
  },
  {
    "code": "43.11",
    "name": "Rušenje objekata"
  },
  {
    "code": "43.12",
    "name": "Pripremna gradilišta"
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
    "name": "Postavljanje vodovodnih, kanalizacionih, grejnih i klimatizacionih sistema"
  },
  {
    "code": "43.29",
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
    "code": "43.39",
    "name": "Ostali završni radovi"
  },
  {
    "code": "43.91",
    "name": "Krovni radovi"
  },
  {
    "code": "43.99",
    "name": "Ostali nepomenuti specifični građevinski radovi"
  },
  {
    "code": "45.11",
    "name": "Trgovina automobilima i lakim motornim vozilima"
  },
  {
    "code": "45.19",
    "name": "Trgovina ostalim motornim vozilima"
  },
  {
    "code": "45.20",
    "name": "Održavanje i popravka motornih vozila"
  },
  {
    "code": "45.31",
    "name": "Trgovina na veliko delovima i opremom za motorna vozila"
  },
  {
    "code": "45.32",
    "name": "Trgovina na malo delovima i opremom za motorna vozila"
  },
  {
    "code": "45.40",
    "name": "Trgovina motociklima, delovima i priborom, održavanje i popravka motocikala"
  },
  {
    "code": "46.11",
    "name": "Posredovanje u prodaji poljoprivrednih sirovina, životinja, tekstilnih sirovina i poluproizvoda"
  },
  {
    "code": "46.12",
    "name": "Posredovanje u prodaji goriva, ruda, metala i industrijskih hemikalija"
  },
  {
    "code": "46.13",
    "name": "Posredovanje u prodaji drvne građe i građevinskog materijala"
  },
  {
    "code": "46.14",
    "name": "Posredovanje u prodaji mašina, industrijske opreme, brodova i aviona"
  },
  {
    "code": "46.15",
    "name": "Posredovanje u prodaji nameštaja, predmeta za domaćinstvo i metalne robe"
  },
  {
    "code": "46.16",
    "name": "Posredovanje u prodaji tekstila, odeće, krzna, obuće i predmeta od kože"
  },
  {
    "code": "46.17",
    "name": "Posredovanje u prodaji hrane, pića i duvana"
  },
  {
    "code": "46.18",
    "name": "Specijalizovano posredovanje u prodaji posebnih proizvoda"
  },
  {
    "code": "46.19",
    "name": "Posredovanje u prodaji raznovrsnih proizvoda"
  },
  {
    "code": "46.21",
    "name": "Trgovina na veliko žitom, sirovim duvanom, semenjem i hranom za životinje"
  },
  {
    "code": "46.22",
    "name": "Trgovina na veliko cvećem i sadnicama"
  },
  {
    "code": "46.23",
    "name": "Trgovina na veliko životinjama"
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
    "name": "Trgovina na veliko mesom i proizvodima od mesa"
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
    "name": "Trgovina na veliko ostalom hranom, uključujući ribu, ljuskare i mekušce"
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
    "name": "Trgovina na veliko porculanom, staklenom robom i sredstvima za čišćenje"
  },
  {
    "code": "46.45",
    "name": "Trgovina na veliko parfimerijskim i kozmetičkim proizvodima"
  },
  {
    "code": "46.46",
    "name": "Trgovina na veliko farmaceutskim proizvodima"
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
    "code": "46.51",
    "name": "Trgovina na veliko računarima, računarskom opremom i softverima"
  },
  {
    "code": "46.52",
    "name": "Trgovina na veliko elektronskim i telekomunikacionim delovima i opremom"
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
    "name": "Trgovina na veliko mašinama za tekstilnu industriju i mašinama za šivenje i pletenje"
  },
  {
    "code": "46.65",
    "name": "Trgovina na veliko kancelarijskim nameštajem"
  },
  {
    "code": "46.66",
    "name": "Trgovina na veliko ostalim kancelarijskim mašinama i opremom"
  },
  {
    "code": "46.69",
    "name": "Trgovina na veliko ostalim mašinama i opremom"
  },
  {
    "code": "46.71",
    "name": "Trgovina na veliko čvrstim, tečnim i gasovitim gorivima i sličnim proizvodima"
  },
  {
    "code": "46.72",
    "name": "Trgovina na veliko metalima i metalnim rudama"
  },
  {
    "code": "46.73",
    "name": "Trgovina na veliko drvetom, građevinskim materijalom i sanitarnom opremom"
  },
  {
    "code": "46.74",
    "name": "Trgovina na veliko metalnom robom, instalacionim materijalima, opremom i priborom za grejanje"
  },
  {
    "code": "46.75",
    "name": "Trgovina na veliko hemijskim proizvodima"
  },
  {
    "code": "46.76",
    "name": "Trgovina na veliko ostalim poluproizvodima"
  },
  {
    "code": "46.77",
    "name": "Trgovina na veliko otpacima i ostacima"
  },
  {
    "code": "46.90",
    "name": "Nespecijalizovana trgovina na veliko"
  },
  {
    "code": "47.11",
    "name": "Trgovina na malo u nespecijalizovanim prodavnicama, pretežno hranom, pićima i duvanom"
  },
  {
    "code": "47.19",
    "name": "Ostala trgovina na malo u nespecijalizovanim prodavnicama"
  },
  {
    "code": "47.21",
    "name": "Trgovina na malo voćem i povrćem u specijalizovanim prodavnicama"
  },
  {
    "code": "47.22",
    "name": "Trgovina na malo mesom i proizvodima od mesa u specijalizovanim prodavnicama"
  },
  {
    "code": "47.23",
    "name": "Trgovina na malo ribom, ljuskarima i mekušcima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.24",
    "name": "Trgovina na malo hlebom, testeninom, kolačima i slatkišima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.25",
    "name": "Trgovina na malo pićima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.26",
    "name": "Trgovina na malo proizvodima od duvana u specijalizovanim prodavnicama"
  },
  {
    "code": "47.29",
    "name": "Ostala trgovina na malo hranom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.30",
    "name": "Trgovina na malo motornim gorivima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.41",
    "name": "Trgovina na malo računarima, perifernim jedinicama i softverom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.42",
    "name": "Trgovina na malo telekomunikacionom opremom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.43",
    "name": "Trgovina na malo audio i video opremom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.51",
    "name": "Trgovina na malo tekstilom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.52",
    "name": "Trgovina na malo metalnom robom, bojama i staklom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.53",
    "name": "Trgovina na malo tepisima, zidnim i podnim oblogama u specijalizovanim prodavnicama"
  },
  {
    "code": "47.54",
    "name": "Trgovina na malo električnim aparatima za domaćinstvo u specijalizovanim prodavnicama"
  },
  {
    "code": "47.59",
    "name": "Trgovina na malo nameštajem, opremom za osvetljenje i ostalim predmetima za domaćinstvo u specijalizovanim prodavnicama"
  },
  {
    "code": "47.61",
    "name": "Trgovina na malo knjigama u specijalizovanim prodavnicama"
  },
  {
    "code": "47.62",
    "name": "Trgovina na malo novinama i kancelarijskim materijalom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.63",
    "name": "Trgovina na malo muzičkim i video zapisima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.64",
    "name": "Trgovina na malo sportskom opremom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.65",
    "name": "Trgovina na malo igrama i igračkama u specijalizovanim prodavnicama"
  },
  {
    "code": "47.71",
    "name": "Trgovina na malo odećom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.72",
    "name": "Trgovina na malo obućom i predmetima od kože u specijalizovanim prodavnicama"
  },
  {
    "code": "47.73",
    "name": "Trgovina na malo farmaceutskim proizvodima u specijalizovanim prodavnicama – apotekama"
  },
  {
    "code": "47.74",
    "name": "Trgovina na malo medicinskim i ortopedskim pomagalima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.75",
    "name": "Trgovina na malo kozmetičkim i toaletnim proizvodima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.76",
    "name": "Trgovina na malo cvećem, sadnicama, semenjem, đubrivima, kućnim ljubimcima i hranom za kućne ljubimce u specijalizovanim prodavnicama"
  },
  {
    "code": "47.77",
    "name": "Trgovina na malo satovima i nakitom u specijalizovanim prodavnicama"
  },
  {
    "code": "47.78",
    "name": "Ostala trgovina na malo novim proizvodima u specijalizovanim prodavnicama"
  },
  {
    "code": "47.79",
    "name": "Trgovina na malo polovnom robom u prodavnicama"
  },
  {
    "code": "47.81",
    "name": "Trgovina na malo hranom, pićima i duvanskim proizvodima na tezgama i pijacama"
  },
  {
    "code": "47.82",
    "name": "Trgovina na malo tekstilom, odećom i obućom na tezgama i pijacama"
  },
  {
    "code": "47.89",
    "name": "Trgovina na malo ostalom robom na tezgama i pijacama"
  },
  {
    "code": "47.91",
    "name": "Trgovina na malo posredstvom pošte ili preko interneta"
  },
  {
    "code": "47.99",
    "name": "Ostala trgovina na malo izvan prodavnica, tezgi i pijaca"
  },
  {
    "code": "49.10",
    "name": "Železnički prevoz putnika, daljinski i regionalni"
  },
  {
    "code": "49.20",
    "name": "Železnički prevoz tereta"
  },
  {
    "code": "49.31",
    "name": "Gradski i prigradski kopneni prevoz putnika"
  },
  {
    "code": "49.32",
    "name": "Taksi prevoz"
  },
  {
    "code": "49.39",
    "name": "Ostali prevoz putnika u kopnenom saobraćaju"
  },
  {
    "code": "49.41",
    "name": "Drumski prevoz tereta"
  },
  {
    "code": "49.42",
    "name": "Usluge preseljenja"
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
    "name": "Vasionski saobraćaj"
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
    "code": "52.29",
    "name": "Ostale prateće delatnosti u saobraćaju"
  },
  {
    "code": "53.10",
    "name": "Poštanske aktivnosti javnog servisa"
  },
  {
    "code": "53.20",
    "name": "Poštanske aktivnosti komercijalnog servisa"
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
    "name": "Delatnost kampova, auto-kampova i kampova za turističke prikolice"
  },
  {
    "code": "55.90",
    "name": "Ostali smeštaj"
  },
  {
    "code": "56.10",
    "name": "Delatnosti restorana i pokretnih ugostiteljskih objekta"
  },
  {
    "code": "56.21",
    "name": "Ketering"
  },
  {
    "code": "56.29",
    "name": "Ostale usluge pripremanja i posluživanja hrane"
  },
  {
    "code": "56.30",
    "name": "Usluge pripremanja i posluživanja pića"
  },
  {
    "code": "58.11",
    "name": "Izdavanje knjiga"
  },
  {
    "code": "58.12",
    "name": "Izdavanje imenika i adresara"
  },
  {
    "code": "58.13",
    "name": "Izdavanje novina"
  },
  {
    "code": "58.14",
    "name": "Izdavanje časopisa i periodičnih izdanja"
  },
  {
    "code": "58.19",
    "name": "Ostala izdavačka delatnost"
  },
  {
    "code": "58.21",
    "name": "Izdavanje računarskih igara"
  },
  {
    "code": "58.29",
    "name": "Izdavanje ostalih softvera"
  },
  {
    "code": "59.11",
    "name": "Proizvodnja kinematografskih dela, audio-vizuelnih proizvoda i televizijskog programa"
  },
  {
    "code": "59.12",
    "name": "Delatnosti koje slede nakon faze snimanja u proizvodnji kinematografskih dela i televizijskog programa"
  },
  {
    "code": "59.13",
    "name": "Distribucija kinematografskih dela, audio-vizuelnih dela i televizijskog programa"
  },
  {
    "code": "59.14",
    "name": "Delatnost prikazivanja kinematografskih dela"
  },
  {
    "code": "59.20",
    "name": "Snimanje i izdavanje zvučnih zapisa i muzike"
  },
  {
    "code": "60.10",
    "name": "Emitovanje radio-programa"
  },
  {
    "code": "60.20",
    "name": "Proizvodnja i emitovanje televizijskog programa"
  },
  {
    "code": "61.10",
    "name": "Kablovske telekomunikacije"
  },
  {
    "code": "61.20",
    "name": "Bežične telekomunikacije"
  },
  {
    "code": "61.30",
    "name": "Satelitske telekomunikacije"
  },
  {
    "code": "61.90",
    "name": "Ostale telekomunikacione delatnosti"
  },
  {
    "code": "62.01",
    "name": "Računarsko programiranje"
  },
  {
    "code": "62.02",
    "name": "Konsultantske delatnosti u oblasti informacione tehnologije"
  },
  {
    "code": "62.03",
    "name": "Upravljanje računarskom opremom"
  },
  {
    "code": "62.09",
    "name": "Ostale usluge informacione tehnologije"
  },
  {
    "code": "63.11",
    "name": "Obrada podataka, hosting i sl."
  },
  {
    "code": "63.12",
    "name": "Veb portali"
  },
  {
    "code": "63.91",
    "name": "Delatnosti novinskih agencija"
  },
  {
    "code": "63.99",
    "name": "Informacione uslužne delatnosti na drugom mestu nepomenute"
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
    "code": "64.20",
    "name": "Delatnost holding kompanija"
  },
  {
    "code": "64.30",
    "name": "Poverenički fondovi (trastovi), investicioni fondovi i slični finansijski entiteti"
  },
  {
    "code": "64.91",
    "name": "Finansijski lizing"
  },
  {
    "code": "64.92",
    "name": "Ostale usluge kreditiranja"
  },
  {
    "code": "64.99",
    "name": "Ostale nepomenute finansijske usluge, osim osiguranja i penzijskih fondova"
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
    "name": "Finansijske i robne berze"
  },
  {
    "code": "66.12",
    "name": "Brokerski poslovi s hartijama od vrednosti i berzanskom robom"
  },
  {
    "code": "66.19",
    "name": "Ostale pomoćne delatnosti u pružanju finansijskih usluga, osim osiguranja i penzijskih fondova"
  },
  {
    "code": "66.21",
    "name": "Obrada odštetnih zahteva i procenjivanje rizika i šteta"
  },
  {
    "code": "66.22",
    "name": "Delatnost zastupnika i posrednika u osiguranju"
  },
  {
    "code": "66.29",
    "name": "Ostale pomoćne delatnosti u osiguranju i penzijskim fondovima"
  },
  {
    "code": "66.30",
    "name": "Upravljanje fondovima"
  },
  {
    "code": "68.10",
    "name": "Kupovina i prodaja vlastitih nekretnina"
  },
  {
    "code": "68.20",
    "name": "Iznajmljivanje vlastitih ili iznajmljenih nekretnina i upravljanje njima"
  },
  {
    "code": "68.31",
    "name": "Delatnost agencija za nekretnine"
  },
  {
    "code": "68.32",
    "name": "Upravljanje nekretninama za naknadu"
  },
  {
    "code": "69.10",
    "name": "Pravni poslovi"
  },
  {
    "code": "69.20",
    "name": "Računovodstveni, knjigovodstveni i revizorski poslovi; poresko savetovanje"
  },
  {
    "code": "70.10",
    "name": "Upravljanje ekonomskim subjektom"
  },
  {
    "code": "70.21",
    "name": "Delatnost komunikacija i odnosa s javnošću"
  },
  {
    "code": "70.22",
    "name": "Konsultantske aktivnosti u vezi s poslovanjem i ostalim upravljanjem"
  },
  {
    "code": "71.11",
    "name": "Arhitektonska delatnost"
  },
  {
    "code": "71.12",
    "name": "Inženjerske delatnosti i tehničko savetovanje"
  },
  {
    "code": "71.20",
    "name": "Tehničko ispitivanje i analize"
  },
  {
    "code": "72.11",
    "name": "Istraživanje i eksperimentalni razvoj u biotehnologiji"
  },
  {
    "code": "72.19",
    "name": "Istraživanje i razvoj u ostalim prirodnim i tehničko-tehnološkim naukama"
  },
  {
    "code": "72.20",
    "name": "Istraživanje i razvoj u društvenim i humanističkim naukama"
  },
  {
    "code": "73.11",
    "name": "Delatnost reklamnih agencija"
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
    "code": "74.10",
    "name": "Specijalizovane dizajnerske delatnosti"
  },
  {
    "code": "74.20",
    "name": "Fotografske usluge"
  },
  {
    "code": "74.30",
    "name": "Prevođenje i usluge tumača"
  },
  {
    "code": "74.90",
    "name": "Ostale stručne, naučne i tehničke delatnosti"
  },
  {
    "code": "75.00",
    "name": "Veterinarska delatnost"
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
    "name": "Iznajmljivanje video-kaseta i kompakt-diskova"
  },
  {
    "code": "77.29",
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
    "name": "Iznajmljivanje i lizing kancelarijskih mašina i kancelarijske opreme (uključujući računare)"
  },
  {
    "code": "77.34",
    "name": "Iznajmljivanje i lizing opreme za vodeni transport"
  },
  {
    "code": "77.35",
    "name": "Iznajmljivanje i lizing opreme za vazdušni transport"
  },
  {
    "code": "77.39",
    "name": "Iznajmljivanje i lizing ostalih mašina, opreme i materijalnih dobara"
  },
  {
    "code": "77.40",
    "name": "Lizing intelektualne svojine i sličnih proizvoda, autorskih dela i predmeta srodnih prava"
  },
  {
    "code": "78.10",
    "name": "Delatnost agencija za zapošljavanje"
  },
  {
    "code": "78.20",
    "name": "Delatnost agencija za privremeno zapošljavanje"
  },
  {
    "code": "78.30",
    "name": "Ostalo ustupanje ljudskih resursa"
  },
  {
    "code": "79.11",
    "name": "Delatnost putničkih agencija"
  },
  {
    "code": "79.12",
    "name": "Delatnost tur-operatora"
  },
  {
    "code": "79.90",
    "name": "Ostale usluge rezervacije i delatnosti povezane s njima"
  },
  {
    "code": "80.10",
    "name": "Delatnost privatnog obezbeđenja"
  },
  {
    "code": "80.20",
    "name": "Usluge sistema obezbeđenja"
  },
  {
    "code": "80.30",
    "name": "Istražne delatnosti"
  },
  {
    "code": "81.10",
    "name": "Usluge održavanja objekata"
  },
  {
    "code": "81.21",
    "name": "Usluge redovnog čišćenja zgrada"
  },
  {
    "code": "81.22",
    "name": "Usluge ostalog čišćenja zgrada i opreme"
  },
  {
    "code": "81.29",
    "name": "Usluge ostalog čišćenja"
  },
  {
    "code": "81.30",
    "name": "Usluge uređenja i održavanja okoline"
  },
  {
    "code": "82.11",
    "name": "Kombinovane kancelarijsko-administrativne usluge"
  },
  {
    "code": "82.19",
    "name": "Fotokopiranje, pripremanje dokumenata i druga specijalizovana kancelarijska podrška"
  },
  {
    "code": "82.20",
    "name": "Delatnost pozivnih centara"
  },
  {
    "code": "82.30",
    "name": "Organizovanje sastanaka i sajmova"
  },
  {
    "code": "82.91",
    "name": "Delatnost agencija za naplatu potraživanja i kreditnih biroa"
  },
  {
    "code": "82.92",
    "name": "Usluge pakovanja"
  },
  {
    "code": "82.99",
    "name": "Ostale uslužne aktivnosti podrške poslovanju"
  },
  {
    "code": "84.11",
    "name": "Delatnost državnih organa"
  },
  {
    "code": "84.12",
    "name": "Uređivanje delatnosti subjekata koji pružaju zdravstvenu zaštitu, usluge u obrazovanju i kulturi i druge društvene usluge, osim obaveznog socijalnog osiguranja"
  },
  {
    "code": "84.13",
    "name": "Uređenje poslovanja i doprinos uspešnijem poslovanju u oblasti ekonomije"
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
    "name": "Delatnost vatrogasnih jedinica"
  },
  {
    "code": "84.30",
    "name": "Obavezno socijalno osiguranje"
  },
  {
    "code": "85.10",
    "name": "Predškolsko obrazovanje"
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
    "code": "85.41",
    "name": "Obrazovanje posle srednjeg koje nije visoko"
  },
  {
    "code": "85.42",
    "name": "Visoko obrazovanje"
  },
  {
    "code": "85.51",
    "name": "Sportsko i rekreativno obrazovanje"
  },
  {
    "code": "85.52",
    "name": "Umetničko obrazovanje"
  },
  {
    "code": "85.53",
    "name": "Delatnost škola za vozače"
  },
  {
    "code": "85.59",
    "name": "Ostalo obrazovanje"
  },
  {
    "code": "85.60",
    "name": "Pomoćne obrazovne delatnosti"
  },
  {
    "code": "86.10",
    "name": "Delatnost bolnica"
  },
  {
    "code": "86.21",
    "name": "Opšta medicinska praksa"
  },
  {
    "code": "86.22",
    "name": "Specijalistička medicinska praksa"
  },
  {
    "code": "86.23",
    "name": "Stomatološka praksa"
  },
  {
    "code": "86.90",
    "name": "Ostala zdravstvena zaštita"
  },
  {
    "code": "87.10",
    "name": "Delatnosti smeštajnih ustanova s medicinskom negom"
  },
  {
    "code": "87.20",
    "name": "Socijalno staranje u smeštajnim ustanovama za lica s teškoćama u razvoju, duševno obolele osobe i osobe s bolestima zavisnosti"
  },
  {
    "code": "87.30",
    "name": "Rad ustanova za stara lica i lica s posebnim potrebama"
  },
  {
    "code": "87.90",
    "name": "Ostali oblici socijalne zaštite sa smeštajem"
  },
  {
    "code": "88.10",
    "name": "Socijalna zaštita bez smeštaja za stara lica i lica s posebnim potrebama"
  },
  {
    "code": "88.91",
    "name": "Delatnost dnevne brige o deci"
  },
  {
    "code": "88.99",
    "name": "Ostala nepomenuta socijalna zaštita bez smeštaja"
  },
  {
    "code": "90.01",
    "name": "Izvođačka umetnost"
  },
  {
    "code": "90.02",
    "name": "Druge umetničke delatnosti u okviru izvođačke umetnosti"
  },
  {
    "code": "90.03",
    "name": "Umetničko stvaralaštvo"
  },
  {
    "code": "90.04",
    "name": "Rad umetničkih ustanova"
  },
  {
    "code": "91.01",
    "name": "Delatnosti biblioteka i arhiva"
  },
  {
    "code": "91.02",
    "name": "Delatnost muzeja galerija i zbirki"
  },
  {
    "code": "91.03",
    "name": "Zaštita i održavanje nepokretnih kulturnih dobara, kulturno-istorijskih lokacija, zgrada i sličnih turističkih spomenika"
  },
  {
    "code": "91.04",
    "name": "Delatnost botaničkih i zooloških vrtova i zaštita prirodnih vrednosti"
  },
  {
    "code": "92.00",
    "name": "Kockanje i klađenje"
  },
  {
    "code": "93.11",
    "name": "Delatnost sportskih objekata"
  },
  {
    "code": "93.12",
    "name": "Delatnost sportskih klubova"
  },
  {
    "code": "93.13",
    "name": "Delatnost fitnes klubova"
  },
  {
    "code": "93.19",
    "name": "Ostale sportske delatnosti"
  },
  {
    "code": "93.21",
    "name": "Delatnost zabavnih i tematskih parkova"
  },
  {
    "code": "93.29",
    "name": "Ostale zabavne i rekreativne delatnosti"
  },
  {
    "code": "94.11",
    "name": "Delatnosti poslovnih udruženja i udruženja poslodavaca"
  },
  {
    "code": "94.12",
    "name": "Delatnosti strukovnih udruženja"
  },
  {
    "code": "94.20",
    "name": "Delatnost sindikata"
  },
  {
    "code": "94.91",
    "name": "Delatnost verskih organizacija"
  },
  {
    "code": "94.92",
    "name": "Delatnost političkih organizacija"
  },
  {
    "code": "94.99",
    "name": "Delatnost ostalih organizacija na bazi učlanjenja"
  },
  {
    "code": "95.11",
    "name": "Popravka računara i periferne opreme"
  },
  {
    "code": "95.12",
    "name": "Popravka komunikacione opreme"
  },
  {
    "code": "95.21",
    "name": "Popravka elektronskih aparata za široku upotrebu"
  },
  {
    "code": "95.22",
    "name": "Popravka aparata za domaćinstvo i kućne i baštenske opreme"
  },
  {
    "code": "95.23",
    "name": "Popravka obuće i predmeta od kože"
  },
  {
    "code": "95.24",
    "name": "Održavanje i popravka nameštaja"
  },
  {
    "code": "95.25",
    "name": "Popravka satova i nakita"
  },
  {
    "code": "95.29",
    "name": "Popravka ostalih ličnih predmeta i predmeta za domaćinstvo"
  },
  {
    "code": "96.01",
    "name": "Pranje i hemijsko čišćenje tekstilnih i krznenih proizvoda"
  },
  {
    "code": "96.02",
    "name": "Delatnost frizerskih i kozmetičkih salona"
  },
  {
    "code": "96.03",
    "name": "Pogrebne i srodne delatnosti"
  },
  {
    "code": "96.04",
    "name": "Delatnost nege i održavanja tela"
  },
  {
    "code": "96.09",
    "name": "Ostale nepomenute lične uslužne delatnosti"
  },
  {
    "code": "97.00",
    "name": "Delatnost domaćinstava koja zapošljavaju poslugu"
  },
  {
    "code": "98.10",
    "name": "Delatnost domaćinstava koja proizvode robu za sopstvene potrebe"
  },
  {
    "code": "98.20",
    "name": "Delatnost domaćinstava koja obezbeđuju usluge za sopstvene potrebe"
  },
  {
    "code": "99.00",
    "name": "Delatnost eksteritorijalnih organizacija i tela"
  }
];
