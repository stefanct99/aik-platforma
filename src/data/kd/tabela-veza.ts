// GENERISANO automatski skriptom scripts/generate-kd-data.ts, ne menjati ručno.
// Izvor: Republički zavod za statistiku Srbije (stat.gov.rs), stranica
// https://www.stat.gov.rs/istrazivanja/klasifikacije/, preuzeto 2026-11-23.
// Prilog 2 Uredbe: Tabela veza KD 2010 -> KD 2025. 615 starih šifara ukupno, od toga 159 se deli na više novih (jedna stara šifra -> više novih redova ovde).

export type KDPreslikavanje = { staraSifra: string; novaSifra: string };

export const TABELA_VEZA_KD2010_KD2025: readonly KDPreslikavanje[] = [
  {
    "staraSifra": "01.11",
    "novaSifra": "01.11"
  },
  {
    "staraSifra": "01.12",
    "novaSifra": "01.12"
  },
  {
    "staraSifra": "01.13",
    "novaSifra": "01.13"
  },
  {
    "staraSifra": "01.14",
    "novaSifra": "01.14"
  },
  {
    "staraSifra": "01.15",
    "novaSifra": "01.15"
  },
  {
    "staraSifra": "01.16",
    "novaSifra": "01.16"
  },
  {
    "staraSifra": "01.19",
    "novaSifra": "01.13"
  },
  {
    "staraSifra": "01.19",
    "novaSifra": "01.19"
  },
  {
    "staraSifra": "01.21",
    "novaSifra": "01.21"
  },
  {
    "staraSifra": "01.22",
    "novaSifra": "01.22"
  },
  {
    "staraSifra": "01.23",
    "novaSifra": "01.23"
  },
  {
    "staraSifra": "01.24",
    "novaSifra": "01.24"
  },
  {
    "staraSifra": "01.25",
    "novaSifra": "01.25"
  },
  {
    "staraSifra": "01.26",
    "novaSifra": "01.26"
  },
  {
    "staraSifra": "01.27",
    "novaSifra": "01.27"
  },
  {
    "staraSifra": "01.28",
    "novaSifra": "01.13"
  },
  {
    "staraSifra": "01.28",
    "novaSifra": "01.28"
  },
  {
    "staraSifra": "01.29",
    "novaSifra": "01.29"
  },
  {
    "staraSifra": "01.30",
    "novaSifra": "01.30"
  },
  {
    "staraSifra": "01.41",
    "novaSifra": "01.41"
  },
  {
    "staraSifra": "01.42",
    "novaSifra": "01.41"
  },
  {
    "staraSifra": "01.42",
    "novaSifra": "01.42"
  },
  {
    "staraSifra": "01.43",
    "novaSifra": "01.43"
  },
  {
    "staraSifra": "01.44",
    "novaSifra": "01.44"
  },
  {
    "staraSifra": "01.45",
    "novaSifra": "01.45"
  },
  {
    "staraSifra": "01.46",
    "novaSifra": "01.46"
  },
  {
    "staraSifra": "01.47",
    "novaSifra": "01.47"
  },
  {
    "staraSifra": "01.49",
    "novaSifra": "01.47"
  },
  {
    "staraSifra": "01.49",
    "novaSifra": "01.48"
  },
  {
    "staraSifra": "01.50",
    "novaSifra": "01.50"
  },
  {
    "staraSifra": "01.61",
    "novaSifra": "01.61"
  },
  {
    "staraSifra": "01.62",
    "novaSifra": "01.47"
  },
  {
    "staraSifra": "01.62",
    "novaSifra": "01.62"
  },
  {
    "staraSifra": "01.63",
    "novaSifra": "01.63"
  },
  {
    "staraSifra": "01.64",
    "novaSifra": "01.63"
  },
  {
    "staraSifra": "01.70",
    "novaSifra": "01.70"
  },
  {
    "staraSifra": "02.10",
    "novaSifra": "02.10"
  },
  {
    "staraSifra": "02.20",
    "novaSifra": "02.20"
  },
  {
    "staraSifra": "02.30",
    "novaSifra": "02.30"
  },
  {
    "staraSifra": "02.40",
    "novaSifra": "02.40"
  },
  {
    "staraSifra": "03.11",
    "novaSifra": "03.11"
  },
  {
    "staraSifra": "03.11",
    "novaSifra": "03.30"
  },
  {
    "staraSifra": "03.12",
    "novaSifra": "03.12"
  },
  {
    "staraSifra": "03.12",
    "novaSifra": "03.30"
  },
  {
    "staraSifra": "03.21",
    "novaSifra": "03.21"
  },
  {
    "staraSifra": "03.21",
    "novaSifra": "03.30"
  },
  {
    "staraSifra": "03.22",
    "novaSifra": "01.48"
  },
  {
    "staraSifra": "03.22",
    "novaSifra": "03.22"
  },
  {
    "staraSifra": "03.22",
    "novaSifra": "03.30"
  },
  {
    "staraSifra": "05.10",
    "novaSifra": "05.10"
  },
  {
    "staraSifra": "05.20",
    "novaSifra": "05.20"
  },
  {
    "staraSifra": "06.10",
    "novaSifra": "06.10"
  },
  {
    "staraSifra": "06.20",
    "novaSifra": "06.20"
  },
  {
    "staraSifra": "07.10",
    "novaSifra": "07.10"
  },
  {
    "staraSifra": "07.21",
    "novaSifra": "07.21"
  },
  {
    "staraSifra": "07.29",
    "novaSifra": "07.29"
  },
  {
    "staraSifra": "08.11",
    "novaSifra": "08.11"
  },
  {
    "staraSifra": "08.12",
    "novaSifra": "08.12"
  },
  {
    "staraSifra": "08.91",
    "novaSifra": "08.91"
  },
  {
    "staraSifra": "08.92",
    "novaSifra": "08.92"
  },
  {
    "staraSifra": "08.93",
    "novaSifra": "08.93"
  },
  {
    "staraSifra": "08.99",
    "novaSifra": "08.99"
  },
  {
    "staraSifra": "09.10",
    "novaSifra": "09.10"
  },
  {
    "staraSifra": "09.90",
    "novaSifra": "09.90"
  },
  {
    "staraSifra": "10.11",
    "novaSifra": "10.11"
  },
  {
    "staraSifra": "10.12",
    "novaSifra": "10.12"
  },
  {
    "staraSifra": "10.13",
    "novaSifra": "10.13"
  },
  {
    "staraSifra": "10.20",
    "novaSifra": "10.20"
  },
  {
    "staraSifra": "10.31",
    "novaSifra": "10.31"
  },
  {
    "staraSifra": "10.32",
    "novaSifra": "10.32"
  },
  {
    "staraSifra": "10.39",
    "novaSifra": "10.39"
  },
  {
    "staraSifra": "10.41",
    "novaSifra": "10.41"
  },
  {
    "staraSifra": "10.42",
    "novaSifra": "10.42"
  },
  {
    "staraSifra": "10.51",
    "novaSifra": "10.51"
  },
  {
    "staraSifra": "10.52",
    "novaSifra": "10.52"
  },
  {
    "staraSifra": "10.61",
    "novaSifra": "10.61"
  },
  {
    "staraSifra": "10.62",
    "novaSifra": "10.62"
  },
  {
    "staraSifra": "10.71",
    "novaSifra": "10.71"
  },
  {
    "staraSifra": "10.72",
    "novaSifra": "10.72"
  },
  {
    "staraSifra": "10.73",
    "novaSifra": "10.73"
  },
  {
    "staraSifra": "10.81",
    "novaSifra": "10.81"
  },
  {
    "staraSifra": "10.82",
    "novaSifra": "10.82"
  },
  {
    "staraSifra": "10.83",
    "novaSifra": "10.83"
  },
  {
    "staraSifra": "10.84",
    "novaSifra": "10.84"
  },
  {
    "staraSifra": "10.85",
    "novaSifra": "10.85"
  },
  {
    "staraSifra": "10.86",
    "novaSifra": "10.61"
  },
  {
    "staraSifra": "10.86",
    "novaSifra": "10.62"
  },
  {
    "staraSifra": "10.86",
    "novaSifra": "10.71"
  },
  {
    "staraSifra": "10.86",
    "novaSifra": "10.72"
  },
  {
    "staraSifra": "10.86",
    "novaSifra": "10.73"
  },
  {
    "staraSifra": "10.86",
    "novaSifra": "10.86"
  },
  {
    "staraSifra": "10.89",
    "novaSifra": "10.89"
  },
  {
    "staraSifra": "10.89",
    "novaSifra": "11.07"
  },
  {
    "staraSifra": "10.91",
    "novaSifra": "10.91"
  },
  {
    "staraSifra": "10.92",
    "novaSifra": "10.92"
  },
  {
    "staraSifra": "11.01",
    "novaSifra": "11.01"
  },
  {
    "staraSifra": "11.02",
    "novaSifra": "11.02"
  },
  {
    "staraSifra": "11.03",
    "novaSifra": "11.03"
  },
  {
    "staraSifra": "11.04",
    "novaSifra": "11.04"
  },
  {
    "staraSifra": "11.05",
    "novaSifra": "11.05"
  },
  {
    "staraSifra": "11.06",
    "novaSifra": "11.06"
  },
  {
    "staraSifra": "11.07",
    "novaSifra": "11.07"
  },
  {
    "staraSifra": "12.00",
    "novaSifra": "12.00"
  },
  {
    "staraSifra": "13.10",
    "novaSifra": "13.10"
  },
  {
    "staraSifra": "13.20",
    "novaSifra": "13.20"
  },
  {
    "staraSifra": "13.20",
    "novaSifra": "13.96"
  },
  {
    "staraSifra": "13.20",
    "novaSifra": "23.99"
  },
  {
    "staraSifra": "13.30",
    "novaSifra": "13.30"
  },
  {
    "staraSifra": "13.91",
    "novaSifra": "13.91"
  },
  {
    "staraSifra": "13.92",
    "novaSifra": "13.92"
  },
  {
    "staraSifra": "13.92",
    "novaSifra": "13.96"
  },
  {
    "staraSifra": "13.93",
    "novaSifra": "13.93"
  },
  {
    "staraSifra": "13.94",
    "novaSifra": "13.94"
  },
  {
    "staraSifra": "13.95",
    "novaSifra": "13.95"
  },
  {
    "staraSifra": "13.96",
    "novaSifra": "13.96"
  },
  {
    "staraSifra": "13.99",
    "novaSifra": "13.99"
  },
  {
    "staraSifra": "14.11",
    "novaSifra": "14.24"
  },
  {
    "staraSifra": "14.12",
    "novaSifra": "14.23"
  },
  {
    "staraSifra": "14.13",
    "novaSifra": "14.10"
  },
  {
    "staraSifra": "14.13",
    "novaSifra": "14.21"
  },
  {
    "staraSifra": "14.14",
    "novaSifra": "14.10"
  },
  {
    "staraSifra": "14.14",
    "novaSifra": "14.21"
  },
  {
    "staraSifra": "14.14",
    "novaSifra": "14.22"
  },
  {
    "staraSifra": "14.19",
    "novaSifra": "14.10"
  },
  {
    "staraSifra": "14.19",
    "novaSifra": "14.21"
  },
  {
    "staraSifra": "14.19",
    "novaSifra": "14.22"
  },
  {
    "staraSifra": "14.19",
    "novaSifra": "14.29"
  },
  {
    "staraSifra": "14.20",
    "novaSifra": "14.24"
  },
  {
    "staraSifra": "14.31",
    "novaSifra": "14.10"
  },
  {
    "staraSifra": "14.39",
    "novaSifra": "14.10"
  },
  {
    "staraSifra": "15.11",
    "novaSifra": "15.11"
  },
  {
    "staraSifra": "15.12",
    "novaSifra": "15.12"
  },
  {
    "staraSifra": "15.20",
    "novaSifra": "15.20"
  },
  {
    "staraSifra": "16.10",
    "novaSifra": "16.11"
  },
  {
    "staraSifra": "16.10",
    "novaSifra": "16.12"
  },
  {
    "staraSifra": "16.21",
    "novaSifra": "16.21"
  },
  {
    "staraSifra": "16.21",
    "novaSifra": "16.27"
  },
  {
    "staraSifra": "16.22",
    "novaSifra": "16.22"
  },
  {
    "staraSifra": "16.22",
    "novaSifra": "16.27"
  },
  {
    "staraSifra": "16.23",
    "novaSifra": "16.23"
  },
  {
    "staraSifra": "16.23",
    "novaSifra": "16.25"
  },
  {
    "staraSifra": "16.23",
    "novaSifra": "16.27"
  },
  {
    "staraSifra": "16.24",
    "novaSifra": "16.24"
  },
  {
    "staraSifra": "16.24",
    "novaSifra": "16.27"
  },
  {
    "staraSifra": "16.29",
    "novaSifra": "15.20"
  },
  {
    "staraSifra": "16.29",
    "novaSifra": "16.26"
  },
  {
    "staraSifra": "16.29",
    "novaSifra": "16.27"
  },
  {
    "staraSifra": "16.29",
    "novaSifra": "16.28"
  },
  {
    "staraSifra": "17.11",
    "novaSifra": "17.11"
  },
  {
    "staraSifra": "17.12",
    "novaSifra": "17.12"
  },
  {
    "staraSifra": "17.21",
    "novaSifra": "17.21"
  },
  {
    "staraSifra": "17.22",
    "novaSifra": "17.22"
  },
  {
    "staraSifra": "17.23",
    "novaSifra": "17.23"
  },
  {
    "staraSifra": "17.24",
    "novaSifra": "17.24"
  },
  {
    "staraSifra": "17.29",
    "novaSifra": "17.25"
  },
  {
    "staraSifra": "18.11",
    "novaSifra": "18.11"
  },
  {
    "staraSifra": "18.12",
    "novaSifra": "13.30"
  },
  {
    "staraSifra": "18.12",
    "novaSifra": "18.12"
  },
  {
    "staraSifra": "18.13",
    "novaSifra": "18.13"
  },
  {
    "staraSifra": "18.14",
    "novaSifra": "18.14"
  },
  {
    "staraSifra": "18.20",
    "novaSifra": "18.20"
  },
  {
    "staraSifra": "19.10",
    "novaSifra": "19.10"
  },
  {
    "staraSifra": "19.20",
    "novaSifra": "19.20"
  },
  {
    "staraSifra": "20.11",
    "novaSifra": "20.11"
  },
  {
    "staraSifra": "20.11",
    "novaSifra": "20.14"
  },
  {
    "staraSifra": "20.12",
    "novaSifra": "20.12"
  },
  {
    "staraSifra": "20.13",
    "novaSifra": "20.13"
  },
  {
    "staraSifra": "20.14",
    "novaSifra": "20.14"
  },
  {
    "staraSifra": "20.14",
    "novaSifra": "20.51"
  },
  {
    "staraSifra": "20.15",
    "novaSifra": "20.15"
  },
  {
    "staraSifra": "20.16",
    "novaSifra": "20.16"
  },
  {
    "staraSifra": "20.17",
    "novaSifra": "20.17"
  },
  {
    "staraSifra": "20.20",
    "novaSifra": "20.20"
  },
  {
    "staraSifra": "20.30",
    "novaSifra": "20.30"
  },
  {
    "staraSifra": "20.41",
    "novaSifra": "20.41"
  },
  {
    "staraSifra": "20.42",
    "novaSifra": "20.42"
  },
  {
    "staraSifra": "20.51",
    "novaSifra": "20.59"
  },
  {
    "staraSifra": "20.52",
    "novaSifra": "20.59"
  },
  {
    "staraSifra": "20.53",
    "novaSifra": "20.59"
  },
  {
    "staraSifra": "20.59",
    "novaSifra": "20.51"
  },
  {
    "staraSifra": "20.59",
    "novaSifra": "20.59"
  },
  {
    "staraSifra": "20.60",
    "novaSifra": "20.60"
  },
  {
    "staraSifra": "21.10",
    "novaSifra": "21.10"
  },
  {
    "staraSifra": "21.20",
    "novaSifra": "21.20"
  },
  {
    "staraSifra": "22.11",
    "novaSifra": "22.11"
  },
  {
    "staraSifra": "22.19",
    "novaSifra": "15.20"
  },
  {
    "staraSifra": "22.19",
    "novaSifra": "22.12"
  },
  {
    "staraSifra": "22.21",
    "novaSifra": "22.21"
  },
  {
    "staraSifra": "22.21",
    "novaSifra": "22.25"
  },
  {
    "staraSifra": "22.22",
    "novaSifra": "22.22"
  },
  {
    "staraSifra": "22.22",
    "novaSifra": "22.25"
  },
  {
    "staraSifra": "22.23",
    "novaSifra": "22.23"
  },
  {
    "staraSifra": "22.23",
    "novaSifra": "22.24"
  },
  {
    "staraSifra": "22.23",
    "novaSifra": "22.25"
  },
  {
    "staraSifra": "22.23",
    "novaSifra": "23.66"
  },
  {
    "staraSifra": "22.29",
    "novaSifra": "15.20"
  },
  {
    "staraSifra": "22.29",
    "novaSifra": "22.21"
  },
  {
    "staraSifra": "22.29",
    "novaSifra": "22.25"
  },
  {
    "staraSifra": "22.29",
    "novaSifra": "22.26"
  },
  {
    "staraSifra": "23.11",
    "novaSifra": "23.11"
  },
  {
    "staraSifra": "23.12",
    "novaSifra": "23.12"
  },
  {
    "staraSifra": "23.12",
    "novaSifra": "29.32"
  },
  {
    "staraSifra": "23.13",
    "novaSifra": "23.13"
  },
  {
    "staraSifra": "23.14",
    "novaSifra": "23.14"
  },
  {
    "staraSifra": "23.19",
    "novaSifra": "23.15"
  },
  {
    "staraSifra": "23.20",
    "novaSifra": "23.20"
  },
  {
    "staraSifra": "23.31",
    "novaSifra": "23.31"
  },
  {
    "staraSifra": "23.32",
    "novaSifra": "23.32"
  },
  {
    "staraSifra": "23.41",
    "novaSifra": "23.41"
  },
  {
    "staraSifra": "23.42",
    "novaSifra": "23.42"
  },
  {
    "staraSifra": "23.42",
    "novaSifra": "31.00"
  },
  {
    "staraSifra": "23.43",
    "novaSifra": "23.43"
  },
  {
    "staraSifra": "23.44",
    "novaSifra": "23.44"
  },
  {
    "staraSifra": "23.49",
    "novaSifra": "23.45"
  },
  {
    "staraSifra": "23.51",
    "novaSifra": "23.51"
  },
  {
    "staraSifra": "23.52",
    "novaSifra": "23.52"
  },
  {
    "staraSifra": "23.61",
    "novaSifra": "23.61"
  },
  {
    "staraSifra": "23.62",
    "novaSifra": "23.62"
  },
  {
    "staraSifra": "23.63",
    "novaSifra": "23.63"
  },
  {
    "staraSifra": "23.64",
    "novaSifra": "23.64"
  },
  {
    "staraSifra": "23.65",
    "novaSifra": "23.65"
  },
  {
    "staraSifra": "23.69",
    "novaSifra": "23.66"
  },
  {
    "staraSifra": "23.70",
    "novaSifra": "23.70"
  },
  {
    "staraSifra": "23.91",
    "novaSifra": "23.91"
  },
  {
    "staraSifra": "23.99",
    "novaSifra": "23.99"
  },
  {
    "staraSifra": "24.10",
    "novaSifra": "24.10"
  },
  {
    "staraSifra": "24.20",
    "novaSifra": "24.20"
  },
  {
    "staraSifra": "24.31",
    "novaSifra": "24.31"
  },
  {
    "staraSifra": "24.32",
    "novaSifra": "24.32"
  },
  {
    "staraSifra": "24.33",
    "novaSifra": "24.33"
  },
  {
    "staraSifra": "24.34",
    "novaSifra": "24.34"
  },
  {
    "staraSifra": "24.41",
    "novaSifra": "24.41"
  },
  {
    "staraSifra": "24.42",
    "novaSifra": "24.42"
  },
  {
    "staraSifra": "24.43",
    "novaSifra": "24.43"
  },
  {
    "staraSifra": "24.44",
    "novaSifra": "24.44"
  },
  {
    "staraSifra": "24.45",
    "novaSifra": "24.45"
  },
  {
    "staraSifra": "24.46",
    "novaSifra": "24.46"
  },
  {
    "staraSifra": "24.51",
    "novaSifra": "24.51"
  },
  {
    "staraSifra": "24.52",
    "novaSifra": "24.52"
  },
  {
    "staraSifra": "24.53",
    "novaSifra": "24.53"
  },
  {
    "staraSifra": "24.53",
    "novaSifra": "24.54"
  },
  {
    "staraSifra": "24.54",
    "novaSifra": "24.54"
  },
  {
    "staraSifra": "25.11",
    "novaSifra": "25.11"
  },
  {
    "staraSifra": "25.12",
    "novaSifra": "25.12"
  },
  {
    "staraSifra": "25.21",
    "novaSifra": "25.21"
  },
  {
    "staraSifra": "25.21",
    "novaSifra": "28.21"
  },
  {
    "staraSifra": "25.29",
    "novaSifra": "25.22"
  },
  {
    "staraSifra": "25.30",
    "novaSifra": "25.21"
  },
  {
    "staraSifra": "25.40",
    "novaSifra": "25.30"
  },
  {
    "staraSifra": "25.50",
    "novaSifra": "25.40"
  },
  {
    "staraSifra": "25.61",
    "novaSifra": "25.51"
  },
  {
    "staraSifra": "25.61",
    "novaSifra": "25.52"
  },
  {
    "staraSifra": "25.61",
    "novaSifra": "25.53"
  },
  {
    "staraSifra": "25.62",
    "novaSifra": "25.53"
  },
  {
    "staraSifra": "25.71",
    "novaSifra": "25.61"
  },
  {
    "staraSifra": "25.72",
    "novaSifra": "25.62"
  },
  {
    "staraSifra": "25.73",
    "novaSifra": "25.63"
  },
  {
    "staraSifra": "25.91",
    "novaSifra": "25.91"
  },
  {
    "staraSifra": "25.92",
    "novaSifra": "25.92"
  },
  {
    "staraSifra": "25.93",
    "novaSifra": "25.93"
  },
  {
    "staraSifra": "25.94",
    "novaSifra": "25.94"
  },
  {
    "staraSifra": "25.99",
    "novaSifra": "25.99"
  },
  {
    "staraSifra": "26.11",
    "novaSifra": "26.11"
  },
  {
    "staraSifra": "26.12",
    "novaSifra": "26.12"
  },
  {
    "staraSifra": "26.20",
    "novaSifra": "26.20"
  },
  {
    "staraSifra": "26.20",
    "novaSifra": "26.40"
  },
  {
    "staraSifra": "26.30",
    "novaSifra": "26.30"
  },
  {
    "staraSifra": "26.30",
    "novaSifra": "26.51"
  },
  {
    "staraSifra": "26.40",
    "novaSifra": "26.40"
  },
  {
    "staraSifra": "26.51",
    "novaSifra": "26.51"
  },
  {
    "staraSifra": "26.52",
    "novaSifra": "26.52"
  },
  {
    "staraSifra": "26.60",
    "novaSifra": "26.60"
  },
  {
    "staraSifra": "26.70",
    "novaSifra": "26.70"
  },
  {
    "staraSifra": "26.80",
    "novaSifra": "26.70"
  },
  {
    "staraSifra": "27.11",
    "novaSifra": "27.11"
  },
  {
    "staraSifra": "27.11",
    "novaSifra": "29.10"
  },
  {
    "staraSifra": "27.12",
    "novaSifra": "27.11"
  },
  {
    "staraSifra": "27.12",
    "novaSifra": "27.12"
  },
  {
    "staraSifra": "27.20",
    "novaSifra": "27.20"
  },
  {
    "staraSifra": "27.31",
    "novaSifra": "27.31"
  },
  {
    "staraSifra": "27.32",
    "novaSifra": "27.32"
  },
  {
    "staraSifra": "27.33",
    "novaSifra": "27.33"
  },
  {
    "staraSifra": "27.40",
    "novaSifra": "27.40"
  },
  {
    "staraSifra": "27.51",
    "novaSifra": "27.51"
  },
  {
    "staraSifra": "27.52",
    "novaSifra": "27.52"
  },
  {
    "staraSifra": "27.90",
    "novaSifra": "27.11"
  },
  {
    "staraSifra": "27.90",
    "novaSifra": "27.90"
  },
  {
    "staraSifra": "27.90",
    "novaSifra": "29.31"
  },
  {
    "staraSifra": "27.90",
    "novaSifra": "32.99"
  },
  {
    "staraSifra": "28.11",
    "novaSifra": "28.11"
  },
  {
    "staraSifra": "28.11",
    "novaSifra": "29.32"
  },
  {
    "staraSifra": "28.11",
    "novaSifra": "30.91"
  },
  {
    "staraSifra": "28.12",
    "novaSifra": "28.12"
  },
  {
    "staraSifra": "28.13",
    "novaSifra": "28.13"
  },
  {
    "staraSifra": "28.14",
    "novaSifra": "28.14"
  },
  {
    "staraSifra": "28.15",
    "novaSifra": "28.15"
  },
  {
    "staraSifra": "28.21",
    "novaSifra": "28.21"
  },
  {
    "staraSifra": "28.21",
    "novaSifra": "28.25"
  },
  {
    "staraSifra": "28.22",
    "novaSifra": "28.22"
  },
  {
    "staraSifra": "28.23",
    "novaSifra": "26.20"
  },
  {
    "staraSifra": "28.23",
    "novaSifra": "28.23"
  },
  {
    "staraSifra": "28.24",
    "novaSifra": "28.24"
  },
  {
    "staraSifra": "28.25",
    "novaSifra": "28.25"
  },
  {
    "staraSifra": "28.25",
    "novaSifra": "29.32"
  },
  {
    "staraSifra": "28.29",
    "novaSifra": "28.29"
  },
  {
    "staraSifra": "28.29",
    "novaSifra": "28.93"
  },
  {
    "staraSifra": "28.30",
    "novaSifra": "28.30"
  },
  {
    "staraSifra": "28.41",
    "novaSifra": "28.41"
  },
  {
    "staraSifra": "28.49",
    "novaSifra": "27.90"
  },
  {
    "staraSifra": "28.49",
    "novaSifra": "28.41"
  },
  {
    "staraSifra": "28.49",
    "novaSifra": "28.42"
  },
  {
    "staraSifra": "28.91",
    "novaSifra": "28.91"
  },
  {
    "staraSifra": "28.92",
    "novaSifra": "28.30"
  },
  {
    "staraSifra": "28.92",
    "novaSifra": "28.92"
  },
  {
    "staraSifra": "28.93",
    "novaSifra": "28.93"
  },
  {
    "staraSifra": "28.94",
    "novaSifra": "28.94"
  },
  {
    "staraSifra": "28.95",
    "novaSifra": "28.95"
  },
  {
    "staraSifra": "28.96",
    "novaSifra": "28.96"
  },
  {
    "staraSifra": "28.96",
    "novaSifra": "28.97"
  },
  {
    "staraSifra": "28.99",
    "novaSifra": "28.97"
  },
  {
    "staraSifra": "28.99",
    "novaSifra": "28.99"
  },
  {
    "staraSifra": "29.10",
    "novaSifra": "29.10"
  },
  {
    "staraSifra": "29.20",
    "novaSifra": "29.20"
  },
  {
    "staraSifra": "29.31",
    "novaSifra": "29.31"
  },
  {
    "staraSifra": "29.32",
    "novaSifra": "29.32"
  },
  {
    "staraSifra": "30.11",
    "novaSifra": "30.11"
  },
  {
    "staraSifra": "30.11",
    "novaSifra": "30.13"
  },
  {
    "staraSifra": "30.12",
    "novaSifra": "30.12"
  },
  {
    "staraSifra": "30.20",
    "novaSifra": "30.20"
  },
  {
    "staraSifra": "30.30",
    "novaSifra": "30.31"
  },
  {
    "staraSifra": "30.30",
    "novaSifra": "30.32"
  },
  {
    "staraSifra": "30.40",
    "novaSifra": "30.40"
  },
  {
    "staraSifra": "30.40",
    "novaSifra": "33.18"
  },
  {
    "staraSifra": "30.91",
    "novaSifra": "30.91"
  },
  {
    "staraSifra": "30.91",
    "novaSifra": "30.92"
  },
  {
    "staraSifra": "30.92",
    "novaSifra": "30.92"
  },
  {
    "staraSifra": "30.99",
    "novaSifra": "30.99"
  },
  {
    "staraSifra": "31.01",
    "novaSifra": "31.00"
  },
  {
    "staraSifra": "31.02",
    "novaSifra": "31.00"
  },
  {
    "staraSifra": "31.03",
    "novaSifra": "31.00"
  },
  {
    "staraSifra": "31.09",
    "novaSifra": "31.00"
  },
  {
    "staraSifra": "32.11",
    "novaSifra": "32.11"
  },
  {
    "staraSifra": "32.12",
    "novaSifra": "32.12"
  },
  {
    "staraSifra": "32.13",
    "novaSifra": "32.13"
  },
  {
    "staraSifra": "32.20",
    "novaSifra": "32.20"
  },
  {
    "staraSifra": "32.30",
    "novaSifra": "32.30"
  },
  {
    "staraSifra": "32.30",
    "novaSifra": "32.99"
  },
  {
    "staraSifra": "32.40",
    "novaSifra": "32.40"
  },
  {
    "staraSifra": "32.50",
    "novaSifra": "26.60"
  },
  {
    "staraSifra": "32.50",
    "novaSifra": "32.50"
  },
  {
    "staraSifra": "32.91",
    "novaSifra": "32.91"
  },
  {
    "staraSifra": "32.99",
    "novaSifra": "32.50"
  },
  {
    "staraSifra": "32.99",
    "novaSifra": "32.99"
  },
  {
    "staraSifra": "33.11",
    "novaSifra": "03.30"
  },
  {
    "staraSifra": "33.11",
    "novaSifra": "33.11"
  },
  {
    "staraSifra": "33.11",
    "novaSifra": "33.17"
  },
  {
    "staraSifra": "33.12",
    "novaSifra": "33.12"
  },
  {
    "staraSifra": "33.12",
    "novaSifra": "33.15"
  },
  {
    "staraSifra": "33.12",
    "novaSifra": "33.18"
  },
  {
    "staraSifra": "33.13",
    "novaSifra": "33.13"
  },
  {
    "staraSifra": "33.14",
    "novaSifra": "33.14"
  },
  {
    "staraSifra": "33.15",
    "novaSifra": "33.15"
  },
  {
    "staraSifra": "33.15",
    "novaSifra": "33.18"
  },
  {
    "staraSifra": "33.16",
    "novaSifra": "33.16"
  },
  {
    "staraSifra": "33.16",
    "novaSifra": "33.18"
  },
  {
    "staraSifra": "33.17",
    "novaSifra": "33.17"
  },
  {
    "staraSifra": "33.19",
    "novaSifra": "33.19"
  },
  {
    "staraSifra": "33.19",
    "novaSifra": "91.30"
  },
  {
    "staraSifra": "33.20",
    "novaSifra": "33.20"
  },
  {
    "staraSifra": "35.11",
    "novaSifra": "35.11"
  },
  {
    "staraSifra": "35.11",
    "novaSifra": "35.12"
  },
  {
    "staraSifra": "35.11",
    "novaSifra": "35.16"
  },
  {
    "staraSifra": "35.12",
    "novaSifra": "35.13"
  },
  {
    "staraSifra": "35.13",
    "novaSifra": "35.14"
  },
  {
    "staraSifra": "35.14",
    "novaSifra": "35.15"
  },
  {
    "staraSifra": "35.14",
    "novaSifra": "35.40"
  },
  {
    "staraSifra": "35.21",
    "novaSifra": "35.21"
  },
  {
    "staraSifra": "35.22",
    "novaSifra": "35.22"
  },
  {
    "staraSifra": "35.23",
    "novaSifra": "35.23"
  },
  {
    "staraSifra": "35.23",
    "novaSifra": "35.40"
  },
  {
    "staraSifra": "35.30",
    "novaSifra": "35.30"
  },
  {
    "staraSifra": "36.00",
    "novaSifra": "36.00"
  },
  {
    "staraSifra": "37.00",
    "novaSifra": "37.00"
  },
  {
    "staraSifra": "38.11",
    "novaSifra": "38.11"
  },
  {
    "staraSifra": "38.12",
    "novaSifra": "38.12"
  },
  {
    "staraSifra": "38.21",
    "novaSifra": "38.21"
  },
  {
    "staraSifra": "38.21",
    "novaSifra": "38.22"
  },
  {
    "staraSifra": "38.21",
    "novaSifra": "38.23"
  },
  {
    "staraSifra": "38.21",
    "novaSifra": "38.31"
  },
  {
    "staraSifra": "38.21",
    "novaSifra": "38.32"
  },
  {
    "staraSifra": "38.21",
    "novaSifra": "38.33"
  },
  {
    "staraSifra": "38.22",
    "novaSifra": "38.22"
  },
  {
    "staraSifra": "38.22",
    "novaSifra": "38.23"
  },
  {
    "staraSifra": "38.22",
    "novaSifra": "38.31"
  },
  {
    "staraSifra": "38.22",
    "novaSifra": "38.32"
  },
  {
    "staraSifra": "38.22",
    "novaSifra": "38.33"
  },
  {
    "staraSifra": "38.31",
    "novaSifra": "38.21"
  },
  {
    "staraSifra": "38.32",
    "novaSifra": "20.16"
  },
  {
    "staraSifra": "38.32",
    "novaSifra": "38.21"
  },
  {
    "staraSifra": "39.00",
    "novaSifra": "39.00"
  },
  {
    "staraSifra": "41.10",
    "novaSifra": "68.12"
  },
  {
    "staraSifra": "41.20",
    "novaSifra": "41.00"
  },
  {
    "staraSifra": "41.20",
    "novaSifra": "43.99"
  },
  {
    "staraSifra": "41.20",
    "novaSifra": "91.30"
  },
  {
    "staraSifra": "42.11",
    "novaSifra": "42.11"
  },
  {
    "staraSifra": "42.11",
    "novaSifra": "43.50"
  },
  {
    "staraSifra": "42.12",
    "novaSifra": "42.12"
  },
  {
    "staraSifra": "42.13",
    "novaSifra": "42.13"
  },
  {
    "staraSifra": "42.21",
    "novaSifra": "42.21"
  },
  {
    "staraSifra": "42.22",
    "novaSifra": "42.22"
  },
  {
    "staraSifra": "42.91",
    "novaSifra": "42.91"
  },
  {
    "staraSifra": "42.99",
    "novaSifra": "42.99"
  },
  {
    "staraSifra": "42.99",
    "novaSifra": "68.12"
  },
  {
    "staraSifra": "43.11",
    "novaSifra": "43.11"
  },
  {
    "staraSifra": "43.12",
    "novaSifra": "43.12"
  },
  {
    "staraSifra": "43.13",
    "novaSifra": "43.13"
  },
  {
    "staraSifra": "43.21",
    "novaSifra": "43.21"
  },
  {
    "staraSifra": "43.22",
    "novaSifra": "43.22"
  },
  {
    "staraSifra": "43.29",
    "novaSifra": "43.23"
  },
  {
    "staraSifra": "43.29",
    "novaSifra": "43.24"
  },
  {
    "staraSifra": "43.31",
    "novaSifra": "43.31"
  },
  {
    "staraSifra": "43.32",
    "novaSifra": "43.32"
  },
  {
    "staraSifra": "43.33",
    "novaSifra": "43.33"
  },
  {
    "staraSifra": "43.34",
    "novaSifra": "43.34"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "43.23"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "43.31"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "43.32"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "43.33"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "43.34"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "43.35"
  },
  {
    "staraSifra": "43.39",
    "novaSifra": "81.22"
  },
  {
    "staraSifra": "43.91",
    "novaSifra": "43.41"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "42.99"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.22"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.23"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.35"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.41"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.42"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.50"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.91"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "43.99"
  },
  {
    "staraSifra": "43.99",
    "novaSifra": "81.22"
  },
  {
    "staraSifra": "45.11",
    "novaSifra": "46.18"
  },
  {
    "staraSifra": "45.11",
    "novaSifra": "46.71"
  },
  {
    "staraSifra": "45.11",
    "novaSifra": "47.81"
  },
  {
    "staraSifra": "45.11",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "45.19",
    "novaSifra": "46.18"
  },
  {
    "staraSifra": "45.19",
    "novaSifra": "46.71"
  },
  {
    "staraSifra": "45.19",
    "novaSifra": "47.81"
  },
  {
    "staraSifra": "45.19",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "45.20",
    "novaSifra": "95.31"
  },
  {
    "staraSifra": "45.31",
    "novaSifra": "46.18"
  },
  {
    "staraSifra": "45.31",
    "novaSifra": "46.72"
  },
  {
    "staraSifra": "45.32",
    "novaSifra": "47.82"
  },
  {
    "staraSifra": "45.32",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "45.40",
    "novaSifra": "46.18"
  },
  {
    "staraSifra": "45.40",
    "novaSifra": "46.73"
  },
  {
    "staraSifra": "45.40",
    "novaSifra": "47.83"
  },
  {
    "staraSifra": "45.40",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "45.40",
    "novaSifra": "95.32"
  },
  {
    "staraSifra": "46.11",
    "novaSifra": "46.11"
  },
  {
    "staraSifra": "46.12",
    "novaSifra": "46.12"
  },
  {
    "staraSifra": "46.13",
    "novaSifra": "46.13"
  },
  {
    "staraSifra": "46.14",
    "novaSifra": "46.14"
  },
  {
    "staraSifra": "46.15",
    "novaSifra": "46.15"
  },
  {
    "staraSifra": "46.16",
    "novaSifra": "46.16"
  },
  {
    "staraSifra": "46.17",
    "novaSifra": "46.17"
  },
  {
    "staraSifra": "46.18",
    "novaSifra": "46.18"
  },
  {
    "staraSifra": "46.19",
    "novaSifra": "46.19"
  },
  {
    "staraSifra": "46.21",
    "novaSifra": "46.21"
  },
  {
    "staraSifra": "46.22",
    "novaSifra": "46.22"
  },
  {
    "staraSifra": "46.23",
    "novaSifra": "46.23"
  },
  {
    "staraSifra": "46.24",
    "novaSifra": "46.24"
  },
  {
    "staraSifra": "46.31",
    "novaSifra": "46.31"
  },
  {
    "staraSifra": "46.32",
    "novaSifra": "46.32"
  },
  {
    "staraSifra": "46.33",
    "novaSifra": "46.33"
  },
  {
    "staraSifra": "46.34",
    "novaSifra": "46.34"
  },
  {
    "staraSifra": "46.35",
    "novaSifra": "46.35"
  },
  {
    "staraSifra": "46.36",
    "novaSifra": "46.36"
  },
  {
    "staraSifra": "46.37",
    "novaSifra": "46.37"
  },
  {
    "staraSifra": "46.38",
    "novaSifra": "46.32"
  },
  {
    "staraSifra": "46.38",
    "novaSifra": "46.38"
  },
  {
    "staraSifra": "46.39",
    "novaSifra": "46.39"
  },
  {
    "staraSifra": "46.41",
    "novaSifra": "46.41"
  },
  {
    "staraSifra": "46.42",
    "novaSifra": "46.42"
  },
  {
    "staraSifra": "46.43",
    "novaSifra": "46.43"
  },
  {
    "staraSifra": "46.43",
    "novaSifra": "46.49"
  },
  {
    "staraSifra": "46.43",
    "novaSifra": "46.64"
  },
  {
    "staraSifra": "46.44",
    "novaSifra": "46.44"
  },
  {
    "staraSifra": "46.45",
    "novaSifra": "46.45"
  },
  {
    "staraSifra": "46.46",
    "novaSifra": "46.46"
  },
  {
    "staraSifra": "46.47",
    "novaSifra": "46.47"
  },
  {
    "staraSifra": "46.48",
    "novaSifra": "46.48"
  },
  {
    "staraSifra": "46.49",
    "novaSifra": "46.49"
  },
  {
    "staraSifra": "46.51",
    "novaSifra": "46.50"
  },
  {
    "staraSifra": "46.52",
    "novaSifra": "46.50"
  },
  {
    "staraSifra": "46.61",
    "novaSifra": "46.61"
  },
  {
    "staraSifra": "46.62",
    "novaSifra": "46.62"
  },
  {
    "staraSifra": "46.63",
    "novaSifra": "46.63"
  },
  {
    "staraSifra": "46.64",
    "novaSifra": "46.64"
  },
  {
    "staraSifra": "46.65",
    "novaSifra": "46.47"
  },
  {
    "staraSifra": "46.66",
    "novaSifra": "46.50"
  },
  {
    "staraSifra": "46.69",
    "novaSifra": "46.64"
  },
  {
    "staraSifra": "46.71",
    "novaSifra": "46.81"
  },
  {
    "staraSifra": "46.72",
    "novaSifra": "46.82"
  },
  {
    "staraSifra": "46.73",
    "novaSifra": "46.83"
  },
  {
    "staraSifra": "46.74",
    "novaSifra": "46.84"
  },
  {
    "staraSifra": "46.75",
    "novaSifra": "46.85"
  },
  {
    "staraSifra": "46.76",
    "novaSifra": "46.86"
  },
  {
    "staraSifra": "46.77",
    "novaSifra": "46.87"
  },
  {
    "staraSifra": "46.90",
    "novaSifra": "46.90"
  },
  {
    "staraSifra": "47.11",
    "novaSifra": "47.11"
  },
  {
    "staraSifra": "47.11",
    "novaSifra": "47.91"
  },
  {
    "staraSifra": "47.19",
    "novaSifra": "47.12"
  },
  {
    "staraSifra": "47.19",
    "novaSifra": "47.91"
  },
  {
    "staraSifra": "47.21",
    "novaSifra": "47.21"
  },
  {
    "staraSifra": "47.21",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.22",
    "novaSifra": "47.22"
  },
  {
    "staraSifra": "47.22",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.23",
    "novaSifra": "47.23"
  },
  {
    "staraSifra": "47.23",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.24",
    "novaSifra": "47.24"
  },
  {
    "staraSifra": "47.24",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.25",
    "novaSifra": "47.25"
  },
  {
    "staraSifra": "47.25",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.26",
    "novaSifra": "47.26"
  },
  {
    "staraSifra": "47.26",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.29",
    "novaSifra": "47.27"
  },
  {
    "staraSifra": "47.29",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.30",
    "novaSifra": "47.30"
  },
  {
    "staraSifra": "47.30",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.41",
    "novaSifra": "47.40"
  },
  {
    "staraSifra": "47.41",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.42",
    "novaSifra": "47.40"
  },
  {
    "staraSifra": "47.42",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.43",
    "novaSifra": "47.40"
  },
  {
    "staraSifra": "47.43",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.51",
    "novaSifra": "47.51"
  },
  {
    "staraSifra": "47.51",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.52",
    "novaSifra": "47.52"
  },
  {
    "staraSifra": "47.52",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.53",
    "novaSifra": "47.53"
  },
  {
    "staraSifra": "47.53",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.54",
    "novaSifra": "47.54"
  },
  {
    "staraSifra": "47.54",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.59",
    "novaSifra": "47.52"
  },
  {
    "staraSifra": "47.59",
    "novaSifra": "47.55"
  },
  {
    "staraSifra": "47.59",
    "novaSifra": "47.69"
  },
  {
    "staraSifra": "47.59",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.61",
    "novaSifra": "47.61"
  },
  {
    "staraSifra": "47.61",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.62",
    "novaSifra": "47.62"
  },
  {
    "staraSifra": "47.62",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.63",
    "novaSifra": "47.69"
  },
  {
    "staraSifra": "47.63",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.64",
    "novaSifra": "47.63"
  },
  {
    "staraSifra": "47.64",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.65",
    "novaSifra": "47.64"
  },
  {
    "staraSifra": "47.65",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.71",
    "novaSifra": "47.71"
  },
  {
    "staraSifra": "47.71",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.72",
    "novaSifra": "47.72"
  },
  {
    "staraSifra": "47.72",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.73",
    "novaSifra": "47.73"
  },
  {
    "staraSifra": "47.73",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.74",
    "novaSifra": "47.74"
  },
  {
    "staraSifra": "47.74",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.75",
    "novaSifra": "47.75"
  },
  {
    "staraSifra": "47.75",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.76",
    "novaSifra": "47.76"
  },
  {
    "staraSifra": "47.76",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.77",
    "novaSifra": "47.77"
  },
  {
    "staraSifra": "47.77",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.78",
    "novaSifra": "47.55"
  },
  {
    "staraSifra": "47.78",
    "novaSifra": "47.63"
  },
  {
    "staraSifra": "47.78",
    "novaSifra": "47.69"
  },
  {
    "staraSifra": "47.78",
    "novaSifra": "47.74"
  },
  {
    "staraSifra": "47.78",
    "novaSifra": "47.78"
  },
  {
    "staraSifra": "47.78",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.79",
    "novaSifra": "47.79"
  },
  {
    "staraSifra": "47.79",
    "novaSifra": "47.91"
  },
  {
    "staraSifra": "47.79",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.11"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.21"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.22"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.23"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.24"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.25"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.26"
  },
  {
    "staraSifra": "47.81",
    "novaSifra": "47.27"
  },
  {
    "staraSifra": "47.82",
    "novaSifra": "47.12"
  },
  {
    "staraSifra": "47.82",
    "novaSifra": "47.51"
  },
  {
    "staraSifra": "47.82",
    "novaSifra": "47.71"
  },
  {
    "staraSifra": "47.82",
    "novaSifra": "47.72"
  },
  {
    "staraSifra": "47.82",
    "novaSifra": "47.79"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.12"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.40"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.52"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.53"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.54"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.55"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.61"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.62"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.63"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.64"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.69"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.74"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.75"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.76"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.77"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.78"
  },
  {
    "staraSifra": "47.89",
    "novaSifra": "47.79"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.11"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.12"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.21"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.22"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.23"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.24"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.25"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.26"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.27"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.40"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.51"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.52"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.53"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.54"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.55"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.61"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.62"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.63"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.64"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.69"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.71"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.72"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.73"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.74"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.75"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.76"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.77"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.78"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.79"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.91"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "47.91",
    "novaSifra": "60.39"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.11"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.12"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.21"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.22"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.23"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.24"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.25"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.26"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.27"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.40"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.51"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.52"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.53"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.54"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.55"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.61"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.62"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.63"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.64"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.69"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.71"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.72"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.74"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.75"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.76"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.77"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.78"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.79"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.91"
  },
  {
    "staraSifra": "47.99",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "49.10",
    "novaSifra": "49.11"
  },
  {
    "staraSifra": "49.10",
    "novaSifra": "49.12"
  },
  {
    "staraSifra": "49.20",
    "novaSifra": "49.20"
  },
  {
    "staraSifra": "49.31",
    "novaSifra": "49.12"
  },
  {
    "staraSifra": "49.31",
    "novaSifra": "49.31"
  },
  {
    "staraSifra": "49.31",
    "novaSifra": "49.34"
  },
  {
    "staraSifra": "49.32",
    "novaSifra": "49.33"
  },
  {
    "staraSifra": "49.32",
    "novaSifra": "52.32"
  },
  {
    "staraSifra": "49.39",
    "novaSifra": "49.31"
  },
  {
    "staraSifra": "49.39",
    "novaSifra": "49.32"
  },
  {
    "staraSifra": "49.39",
    "novaSifra": "49.34"
  },
  {
    "staraSifra": "49.39",
    "novaSifra": "49.39"
  },
  {
    "staraSifra": "49.41",
    "novaSifra": "49.41"
  },
  {
    "staraSifra": "49.41",
    "novaSifra": "52.24"
  },
  {
    "staraSifra": "49.42",
    "novaSifra": "49.42"
  },
  {
    "staraSifra": "49.50",
    "novaSifra": "49.50"
  },
  {
    "staraSifra": "50.10",
    "novaSifra": "50.10"
  },
  {
    "staraSifra": "50.20",
    "novaSifra": "50.20"
  },
  {
    "staraSifra": "50.30",
    "novaSifra": "50.30"
  },
  {
    "staraSifra": "50.40",
    "novaSifra": "50.40"
  },
  {
    "staraSifra": "51.10",
    "novaSifra": "51.10"
  },
  {
    "staraSifra": "51.21",
    "novaSifra": "51.21"
  },
  {
    "staraSifra": "51.22",
    "novaSifra": "51.22"
  },
  {
    "staraSifra": "52.10",
    "novaSifra": "35.24"
  },
  {
    "staraSifra": "52.10",
    "novaSifra": "52.10"
  },
  {
    "staraSifra": "52.10",
    "novaSifra": "63.10"
  },
  {
    "staraSifra": "52.21",
    "novaSifra": "52.21"
  },
  {
    "staraSifra": "52.22",
    "novaSifra": "52.22"
  },
  {
    "staraSifra": "52.23",
    "novaSifra": "52.23"
  },
  {
    "staraSifra": "52.24",
    "novaSifra": "52.24"
  },
  {
    "staraSifra": "52.29",
    "novaSifra": "52.25"
  },
  {
    "staraSifra": "52.29",
    "novaSifra": "52.26"
  },
  {
    "staraSifra": "52.29",
    "novaSifra": "52.31"
  },
  {
    "staraSifra": "52.29",
    "novaSifra": "52.32"
  },
  {
    "staraSifra": "53.10",
    "novaSifra": "53.10"
  },
  {
    "staraSifra": "53.20",
    "novaSifra": "53.20"
  },
  {
    "staraSifra": "55.10",
    "novaSifra": "55.10"
  },
  {
    "staraSifra": "55.20",
    "novaSifra": "55.20"
  },
  {
    "staraSifra": "55.30",
    "novaSifra": "55.30"
  },
  {
    "staraSifra": "55.90",
    "novaSifra": "55.90"
  },
  {
    "staraSifra": "56.10",
    "novaSifra": "56.11"
  },
  {
    "staraSifra": "56.10",
    "novaSifra": "56.12"
  },
  {
    "staraSifra": "56.21",
    "novaSifra": "56.21"
  },
  {
    "staraSifra": "56.29",
    "novaSifra": "56.22"
  },
  {
    "staraSifra": "56.30",
    "novaSifra": "56.30"
  },
  {
    "staraSifra": "58.11",
    "novaSifra": "58.11"
  },
  {
    "staraSifra": "58.12",
    "novaSifra": "58.19"
  },
  {
    "staraSifra": "58.13",
    "novaSifra": "58.12"
  },
  {
    "staraSifra": "58.14",
    "novaSifra": "58.13"
  },
  {
    "staraSifra": "58.19",
    "novaSifra": "58.19"
  },
  {
    "staraSifra": "58.21",
    "novaSifra": "58.21"
  },
  {
    "staraSifra": "58.29",
    "novaSifra": "58.29"
  },
  {
    "staraSifra": "59.11",
    "novaSifra": "59.11"
  },
  {
    "staraSifra": "59.12",
    "novaSifra": "59.12"
  },
  {
    "staraSifra": "59.13",
    "novaSifra": "59.13"
  },
  {
    "staraSifra": "59.14",
    "novaSifra": "59.14"
  },
  {
    "staraSifra": "59.20",
    "novaSifra": "59.20"
  },
  {
    "staraSifra": "60.10",
    "novaSifra": "60.10"
  },
  {
    "staraSifra": "60.20",
    "novaSifra": "60.20"
  },
  {
    "staraSifra": "61.10",
    "novaSifra": "61.10"
  },
  {
    "staraSifra": "61.20",
    "novaSifra": "61.10"
  },
  {
    "staraSifra": "61.20",
    "novaSifra": "61.90"
  },
  {
    "staraSifra": "61.30",
    "novaSifra": "61.10"
  },
  {
    "staraSifra": "61.90",
    "novaSifra": "61.20"
  },
  {
    "staraSifra": "61.90",
    "novaSifra": "61.90"
  },
  {
    "staraSifra": "62.01",
    "novaSifra": "62.10"
  },
  {
    "staraSifra": "62.02",
    "novaSifra": "62.20"
  },
  {
    "staraSifra": "62.03",
    "novaSifra": "62.20"
  },
  {
    "staraSifra": "62.09",
    "novaSifra": "62.90"
  },
  {
    "staraSifra": "63.11",
    "novaSifra": "60.20"
  },
  {
    "staraSifra": "63.11",
    "novaSifra": "60.39"
  },
  {
    "staraSifra": "63.11",
    "novaSifra": "63.10"
  },
  {
    "staraSifra": "63.12",
    "novaSifra": "60.39"
  },
  {
    "staraSifra": "63.12",
    "novaSifra": "63.91"
  },
  {
    "staraSifra": "63.91",
    "novaSifra": "60.31"
  },
  {
    "staraSifra": "63.99",
    "novaSifra": "63.92"
  },
  {
    "staraSifra": "64.11",
    "novaSifra": "64.11"
  },
  {
    "staraSifra": "64.19",
    "novaSifra": "64.19"
  },
  {
    "staraSifra": "64.20",
    "novaSifra": "64.21"
  },
  {
    "staraSifra": "64.20",
    "novaSifra": "64.22"
  },
  {
    "staraSifra": "64.30",
    "novaSifra": "64.31"
  },
  {
    "staraSifra": "64.30",
    "novaSifra": "64.32"
  },
  {
    "staraSifra": "64.91",
    "novaSifra": "64.91"
  },
  {
    "staraSifra": "64.92",
    "novaSifra": "64.92"
  },
  {
    "staraSifra": "64.99",
    "novaSifra": "64.22"
  },
  {
    "staraSifra": "64.99",
    "novaSifra": "64.92"
  },
  {
    "staraSifra": "64.99",
    "novaSifra": "64.99"
  },
  {
    "staraSifra": "65.11",
    "novaSifra": "65.11"
  },
  {
    "staraSifra": "65.12",
    "novaSifra": "65.12"
  },
  {
    "staraSifra": "65.20",
    "novaSifra": "65.20"
  },
  {
    "staraSifra": "65.30",
    "novaSifra": "65.30"
  },
  {
    "staraSifra": "66.11",
    "novaSifra": "66.11"
  },
  {
    "staraSifra": "66.12",
    "novaSifra": "66.12"
  },
  {
    "staraSifra": "66.19",
    "novaSifra": "66.19"
  },
  {
    "staraSifra": "66.19",
    "novaSifra": "66.30"
  },
  {
    "staraSifra": "66.21",
    "novaSifra": "66.21"
  },
  {
    "staraSifra": "66.22",
    "novaSifra": "66.22"
  },
  {
    "staraSifra": "66.29",
    "novaSifra": "66.29"
  },
  {
    "staraSifra": "66.30",
    "novaSifra": "66.30"
  },
  {
    "staraSifra": "68.10",
    "novaSifra": "68.11"
  },
  {
    "staraSifra": "68.20",
    "novaSifra": "55.90"
  },
  {
    "staraSifra": "68.20",
    "novaSifra": "68.20"
  },
  {
    "staraSifra": "68.31",
    "novaSifra": "68.31"
  },
  {
    "staraSifra": "68.31",
    "novaSifra": "68.32"
  },
  {
    "staraSifra": "68.32",
    "novaSifra": "68.32"
  },
  {
    "staraSifra": "69.10",
    "novaSifra": "69.10"
  },
  {
    "staraSifra": "69.20",
    "novaSifra": "69.20"
  },
  {
    "staraSifra": "70.10",
    "novaSifra": "70.10"
  },
  {
    "staraSifra": "70.21",
    "novaSifra": "73.30"
  },
  {
    "staraSifra": "70.22",
    "novaSifra": "70.20"
  },
  {
    "staraSifra": "71.11",
    "novaSifra": "71.11"
  },
  {
    "staraSifra": "71.12",
    "novaSifra": "71.12"
  },
  {
    "staraSifra": "71.20",
    "novaSifra": "71.20"
  },
  {
    "staraSifra": "72.11",
    "novaSifra": "72.10"
  },
  {
    "staraSifra": "72.19",
    "novaSifra": "72.10"
  },
  {
    "staraSifra": "72.20",
    "novaSifra": "72.20"
  },
  {
    "staraSifra": "73.11",
    "novaSifra": "73.11"
  },
  {
    "staraSifra": "73.12",
    "novaSifra": "73.12"
  },
  {
    "staraSifra": "73.20",
    "novaSifra": "73.20"
  },
  {
    "staraSifra": "74.10",
    "novaSifra": "74.11"
  },
  {
    "staraSifra": "74.10",
    "novaSifra": "74.12"
  },
  {
    "staraSifra": "74.10",
    "novaSifra": "74.13"
  },
  {
    "staraSifra": "74.10",
    "novaSifra": "74.14"
  },
  {
    "staraSifra": "74.20",
    "novaSifra": "18.12"
  },
  {
    "staraSifra": "74.20",
    "novaSifra": "74.20"
  },
  {
    "staraSifra": "74.30",
    "novaSifra": "74.30"
  },
  {
    "staraSifra": "74.90",
    "novaSifra": "74.91"
  },
  {
    "staraSifra": "74.90",
    "novaSifra": "74.99"
  },
  {
    "staraSifra": "74.90",
    "novaSifra": "80.09"
  },
  {
    "staraSifra": "75.00",
    "novaSifra": "75.00"
  },
  {
    "staraSifra": "77.11",
    "novaSifra": "77.11"
  },
  {
    "staraSifra": "77.12",
    "novaSifra": "77.11"
  },
  {
    "staraSifra": "77.12",
    "novaSifra": "77.12"
  },
  {
    "staraSifra": "77.21",
    "novaSifra": "77.21"
  },
  {
    "staraSifra": "77.22",
    "novaSifra": "77.22"
  },
  {
    "staraSifra": "77.29",
    "novaSifra": "77.22"
  },
  {
    "staraSifra": "77.31",
    "novaSifra": "77.31"
  },
  {
    "staraSifra": "77.32",
    "novaSifra": "77.32"
  },
  {
    "staraSifra": "77.33",
    "novaSifra": "77.33"
  },
  {
    "staraSifra": "77.34",
    "novaSifra": "77.34"
  },
  {
    "staraSifra": "77.35",
    "novaSifra": "77.35"
  },
  {
    "staraSifra": "77.39",
    "novaSifra": "77.11"
  },
  {
    "staraSifra": "77.39",
    "novaSifra": "77.12"
  },
  {
    "staraSifra": "77.39",
    "novaSifra": "77.39"
  },
  {
    "staraSifra": "77.40",
    "novaSifra": "77.40"
  },
  {
    "staraSifra": "78.10",
    "novaSifra": "78.10"
  },
  {
    "staraSifra": "78.20",
    "novaSifra": "78.20"
  },
  {
    "staraSifra": "78.30",
    "novaSifra": "78.20"
  },
  {
    "staraSifra": "79.11",
    "novaSifra": "52.32"
  },
  {
    "staraSifra": "79.11",
    "novaSifra": "55.40"
  },
  {
    "staraSifra": "79.11",
    "novaSifra": "77.51"
  },
  {
    "staraSifra": "79.11",
    "novaSifra": "79.11"
  },
  {
    "staraSifra": "79.12",
    "novaSifra": "79.12"
  },
  {
    "staraSifra": "79.90",
    "novaSifra": "52.32"
  },
  {
    "staraSifra": "79.90",
    "novaSifra": "55.40"
  },
  {
    "staraSifra": "79.90",
    "novaSifra": "56.40"
  },
  {
    "staraSifra": "79.90",
    "novaSifra": "77.51"
  },
  {
    "staraSifra": "79.90",
    "novaSifra": "79.90"
  },
  {
    "staraSifra": "79.90",
    "novaSifra": "82.40"
  },
  {
    "staraSifra": "80.10",
    "novaSifra": "80.01"
  },
  {
    "staraSifra": "80.20",
    "novaSifra": "80.09"
  },
  {
    "staraSifra": "80.30",
    "novaSifra": "80.01"
  },
  {
    "staraSifra": "81.10",
    "novaSifra": "81.10"
  },
  {
    "staraSifra": "81.21",
    "novaSifra": "81.21"
  },
  {
    "staraSifra": "81.21",
    "novaSifra": "96.91"
  },
  {
    "staraSifra": "81.22",
    "novaSifra": "81.22"
  },
  {
    "staraSifra": "81.29",
    "novaSifra": "81.23"
  },
  {
    "staraSifra": "81.30",
    "novaSifra": "81.30"
  },
  {
    "staraSifra": "82.11",
    "novaSifra": "82.10"
  },
  {
    "staraSifra": "82.19",
    "novaSifra": "18.12"
  },
  {
    "staraSifra": "82.19",
    "novaSifra": "82.10"
  },
  {
    "staraSifra": "82.20",
    "novaSifra": "82.20"
  },
  {
    "staraSifra": "82.30",
    "novaSifra": "82.30"
  },
  {
    "staraSifra": "82.30",
    "novaSifra": "93.29"
  },
  {
    "staraSifra": "82.91",
    "novaSifra": "82.91"
  },
  {
    "staraSifra": "82.92",
    "novaSifra": "82.92"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "43.60"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.11"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.12"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.13"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.14"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.15"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.16"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.17"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.18"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "46.19"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "47.91"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "47.92"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "53.30"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "61.20"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "77.51"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "77.52"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "82.40"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "82.91"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "82.99"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "85.61"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "86.97"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "87.91"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "95.40"
  },
  {
    "staraSifra": "82.99",
    "novaSifra": "96.40"
  },
  {
    "staraSifra": "84.11",
    "novaSifra": "84.11"
  },
  {
    "staraSifra": "84.12",
    "novaSifra": "84.12"
  },
  {
    "staraSifra": "84.13",
    "novaSifra": "84.13"
  },
  {
    "staraSifra": "84.21",
    "novaSifra": "84.21"
  },
  {
    "staraSifra": "84.22",
    "novaSifra": "84.22"
  },
  {
    "staraSifra": "84.23",
    "novaSifra": "84.23"
  },
  {
    "staraSifra": "84.24",
    "novaSifra": "84.24"
  },
  {
    "staraSifra": "84.25",
    "novaSifra": "84.25"
  },
  {
    "staraSifra": "84.30",
    "novaSifra": "84.30"
  },
  {
    "staraSifra": "85.10",
    "novaSifra": "85.10"
  },
  {
    "staraSifra": "85.20",
    "novaSifra": "85.20"
  },
  {
    "staraSifra": "85.31",
    "novaSifra": "85.31"
  },
  {
    "staraSifra": "85.32",
    "novaSifra": "85.32"
  },
  {
    "staraSifra": "85.41",
    "novaSifra": "85.33"
  },
  {
    "staraSifra": "85.42",
    "novaSifra": "85.40"
  },
  {
    "staraSifra": "85.51",
    "novaSifra": "85.51"
  },
  {
    "staraSifra": "85.51",
    "novaSifra": "93.13"
  },
  {
    "staraSifra": "85.52",
    "novaSifra": "85.52"
  },
  {
    "staraSifra": "85.53",
    "novaSifra": "85.53"
  },
  {
    "staraSifra": "85.59",
    "novaSifra": "85.59"
  },
  {
    "staraSifra": "85.60",
    "novaSifra": "85.69"
  },
  {
    "staraSifra": "86.10",
    "novaSifra": "86.10"
  },
  {
    "staraSifra": "86.21",
    "novaSifra": "86.21"
  },
  {
    "staraSifra": "86.22",
    "novaSifra": "86.22"
  },
  {
    "staraSifra": "86.23",
    "novaSifra": "86.23"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.91"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.92"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.93"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.94"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.95"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.96"
  },
  {
    "staraSifra": "86.90",
    "novaSifra": "86.99"
  },
  {
    "staraSifra": "87.10",
    "novaSifra": "87.10"
  },
  {
    "staraSifra": "87.20",
    "novaSifra": "87.20"
  },
  {
    "staraSifra": "87.30",
    "novaSifra": "87.30"
  },
  {
    "staraSifra": "87.90",
    "novaSifra": "87.99"
  },
  {
    "staraSifra": "88.10",
    "novaSifra": "88.10"
  },
  {
    "staraSifra": "88.91",
    "novaSifra": "85.10"
  },
  {
    "staraSifra": "88.91",
    "novaSifra": "88.91"
  },
  {
    "staraSifra": "88.99",
    "novaSifra": "88.99"
  },
  {
    "staraSifra": "90.01",
    "novaSifra": "90.20"
  },
  {
    "staraSifra": "90.02",
    "novaSifra": "90.39"
  },
  {
    "staraSifra": "90.03",
    "novaSifra": "90.11"
  },
  {
    "staraSifra": "90.03",
    "novaSifra": "90.12"
  },
  {
    "staraSifra": "90.03",
    "novaSifra": "90.13"
  },
  {
    "staraSifra": "90.03",
    "novaSifra": "91.30"
  },
  {
    "staraSifra": "90.04",
    "novaSifra": "90.31"
  },
  {
    "staraSifra": "91.01",
    "novaSifra": "91.11"
  },
  {
    "staraSifra": "91.01",
    "novaSifra": "91.12"
  },
  {
    "staraSifra": "91.02",
    "novaSifra": "91.21"
  },
  {
    "staraSifra": "91.03",
    "novaSifra": "91.22"
  },
  {
    "staraSifra": "91.04",
    "novaSifra": "91.41"
  },
  {
    "staraSifra": "91.04",
    "novaSifra": "91.42"
  },
  {
    "staraSifra": "92.00",
    "novaSifra": "92.00"
  },
  {
    "staraSifra": "93.11",
    "novaSifra": "93.11"
  },
  {
    "staraSifra": "93.11",
    "novaSifra": "93.12"
  },
  {
    "staraSifra": "93.11",
    "novaSifra": "93.29"
  },
  {
    "staraSifra": "93.12",
    "novaSifra": "93.12"
  },
  {
    "staraSifra": "93.13",
    "novaSifra": "93.13"
  },
  {
    "staraSifra": "93.19",
    "novaSifra": "93.19"
  },
  {
    "staraSifra": "93.19",
    "novaSifra": "93.29"
  },
  {
    "staraSifra": "93.21",
    "novaSifra": "93.21"
  },
  {
    "staraSifra": "93.21",
    "novaSifra": "93.29"
  },
  {
    "staraSifra": "93.29",
    "novaSifra": "84.25"
  },
  {
    "staraSifra": "93.29",
    "novaSifra": "93.11"
  },
  {
    "staraSifra": "93.29",
    "novaSifra": "93.12"
  },
  {
    "staraSifra": "93.29",
    "novaSifra": "93.19"
  },
  {
    "staraSifra": "93.29",
    "novaSifra": "93.29"
  },
  {
    "staraSifra": "94.11",
    "novaSifra": "94.11"
  },
  {
    "staraSifra": "94.12",
    "novaSifra": "94.12"
  },
  {
    "staraSifra": "94.20",
    "novaSifra": "94.20"
  },
  {
    "staraSifra": "94.91",
    "novaSifra": "94.91"
  },
  {
    "staraSifra": "94.92",
    "novaSifra": "94.92"
  },
  {
    "staraSifra": "94.99",
    "novaSifra": "94.99"
  },
  {
    "staraSifra": "95.11",
    "novaSifra": "95.10"
  },
  {
    "staraSifra": "95.12",
    "novaSifra": "95.10"
  },
  {
    "staraSifra": "95.21",
    "novaSifra": "95.21"
  },
  {
    "staraSifra": "95.22",
    "novaSifra": "95.22"
  },
  {
    "staraSifra": "95.23",
    "novaSifra": "95.23"
  },
  {
    "staraSifra": "95.24",
    "novaSifra": "95.24"
  },
  {
    "staraSifra": "95.25",
    "novaSifra": "95.25"
  },
  {
    "staraSifra": "95.29",
    "novaSifra": "95.29"
  },
  {
    "staraSifra": "96.01",
    "novaSifra": "53.20"
  },
  {
    "staraSifra": "96.01",
    "novaSifra": "96.10"
  },
  {
    "staraSifra": "96.01",
    "novaSifra": "96.91"
  },
  {
    "staraSifra": "96.02",
    "novaSifra": "96.21"
  },
  {
    "staraSifra": "96.02",
    "novaSifra": "96.22"
  },
  {
    "staraSifra": "96.03",
    "novaSifra": "96.30"
  },
  {
    "staraSifra": "96.04",
    "novaSifra": "96.23"
  },
  {
    "staraSifra": "96.09",
    "novaSifra": "96.99"
  },
  {
    "staraSifra": "97.00",
    "novaSifra": "97.00"
  },
  {
    "staraSifra": "98.10",
    "novaSifra": "98.10"
  },
  {
    "staraSifra": "98.20",
    "novaSifra": "98.20"
  },
  {
    "staraSifra": "99.00",
    "novaSifra": "99.00"
  }
];
