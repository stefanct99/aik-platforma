// Minimalan ZIP pisac (Korak 7, izvoz podataka): format "store" (bez kompresije - fajlovi su mali JSON
// tekstovi, veličina nije bitna), bez spoljašnje biblioteke (Node već ima zlib.crc32 ugrađen od v20).
// Dovoljno da Windows/macOS/Linux i svi uobičajeni raspakivači ispravno otvore paket.

import { crc32 } from "node:zlib";

type ZipUlaz = { ime: string; sadrzaj: Buffer };

const POTPIS_LOKALNOG_ZAGLAVLJA = 0x04034b50;
const POTPIS_CENTRALNOG_ZAPISA = 0x02014b50;
const POTPIS_KRAJA_CENTRALNOG_DIREKTORIJUMA = 0x06054b50;

function datumVremeDos(datum: Date): { vreme: number; datumDos: number } {
  const godina = Math.max(0, datum.getFullYear() - 1980);
  const datumDos = (godina << 9) | ((datum.getMonth() + 1) << 5) | datum.getDate();
  const vreme = (datum.getHours() << 11) | (datum.getMinutes() << 5) | Math.floor(datum.getSeconds() / 2);
  return { vreme, datumDos };
}

export function createZip(ulazi: ZipUlaz[], datum: Date = new Date()): Buffer {
  const { vreme, datumDos } = datumVremeDos(datum);
  const lokalniDelovi: Buffer[] = [];
  const centralniDelovi: Buffer[] = [];
  let pomak = 0;

  for (const ulaz of ulazi) {
    const imeBuf = Buffer.from(ulaz.ime, "utf8");
    const kontrolnaSuma = crc32(ulaz.sadrzaj) >>> 0;
    const velicina = ulaz.sadrzaj.length;

    const lokalnoZaglavlje = Buffer.alloc(30);
    lokalnoZaglavlje.writeUInt32LE(POTPIS_LOKALNOG_ZAGLAVLJA, 0);
    lokalnoZaglavlje.writeUInt16LE(20, 4); // verzija potrebna
    lokalnoZaglavlje.writeUInt16LE(0, 6); // oznake
    lokalnoZaglavlje.writeUInt16LE(0, 8); // metod (0 = bez kompresije)
    lokalnoZaglavlje.writeUInt16LE(vreme, 10);
    lokalnoZaglavlje.writeUInt16LE(datumDos, 12);
    lokalnoZaglavlje.writeUInt32LE(kontrolnaSuma, 14);
    lokalnoZaglavlje.writeUInt32LE(velicina, 18); // sabijena veličina
    lokalnoZaglavlje.writeUInt32LE(velicina, 22); // prava veličina
    lokalnoZaglavlje.writeUInt16LE(imeBuf.length, 26);
    lokalnoZaglavlje.writeUInt16LE(0, 28); // dodatno polje

    lokalniDelovi.push(lokalnoZaglavlje, imeBuf, ulaz.sadrzaj);

    const centralniZapis = Buffer.alloc(46);
    centralniZapis.writeUInt32LE(POTPIS_CENTRALNOG_ZAPISA, 0);
    centralniZapis.writeUInt16LE(20, 4); // verzija koja je napravila
    centralniZapis.writeUInt16LE(20, 6); // verzija potrebna
    centralniZapis.writeUInt16LE(0, 8);
    centralniZapis.writeUInt16LE(0, 10);
    centralniZapis.writeUInt16LE(vreme, 12);
    centralniZapis.writeUInt16LE(datumDos, 14);
    centralniZapis.writeUInt32LE(kontrolnaSuma, 16);
    centralniZapis.writeUInt32LE(velicina, 20);
    centralniZapis.writeUInt32LE(velicina, 24);
    centralniZapis.writeUInt16LE(imeBuf.length, 28);
    centralniZapis.writeUInt16LE(0, 30); // dodatno polje
    centralniZapis.writeUInt16LE(0, 32); // komentar
    centralniZapis.writeUInt16LE(0, 34); // broj diska
    centralniZapis.writeUInt16LE(0, 36); // unutrašnji atributi
    centralniZapis.writeUInt32LE((0o100644 << 16) >>> 0, 38); // spoljašnji atributi (unix -rw-r--r--)
    centralniZapis.writeUInt32LE(pomak, 42);

    centralniDelovi.push(centralniZapis, imeBuf);

    pomak += lokalnoZaglavlje.length + imeBuf.length + ulaz.sadrzaj.length;
  }

  const lokalniDeo = Buffer.concat(lokalniDelovi);
  const centralniDeo = Buffer.concat(centralniDelovi);

  const krajZapisa = Buffer.alloc(22);
  krajZapisa.writeUInt32LE(POTPIS_KRAJA_CENTRALNOG_DIREKTORIJUMA, 0);
  krajZapisa.writeUInt16LE(0, 4);
  krajZapisa.writeUInt16LE(0, 6);
  krajZapisa.writeUInt16LE(ulazi.length, 8);
  krajZapisa.writeUInt16LE(ulazi.length, 10);
  krajZapisa.writeUInt32LE(centralniDeo.length, 12);
  krajZapisa.writeUInt32LE(lokalniDeo.length, 16);
  krajZapisa.writeUInt16LE(0, 20);

  return Buffer.concat([lokalniDeo, centralniDeo, krajZapisa]);
}
