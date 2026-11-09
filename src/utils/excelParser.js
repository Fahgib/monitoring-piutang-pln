import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { detectDaerah } from './regionMapper';

export const DAFTAR_BULAN = [
  'Januari 2026',
  'Februari 2026',
  'Maret 2026',
  'April 2026',
  'Mei 2026',
  'Juni 2026',
  'Juli 2026',
  'Agustus 2026',
  'September 2026',
  'Oktober 2026',
  'November 2026',
  'Desember 2026',
];

export function detectMonthFromFileName(fileName = '', fallbackMonth = 'Agustus 2026') {
  const lower = fileName.toLowerCase();
  const mapBulan = [
    { keys: ['januari', 'jan', '2101', '21125', '0125', '0126'], label: 'Januari 2026' },
    { keys: ['februari', 'feb', '2102', '21225', '0225', '0226'], label: 'Februari 2026' },
    { keys: ['maret', 'mar', '2103', '21325', '0325', '0326'], label: 'Maret 2026' },
    { keys: ['april', 'apr', '2104', '21425', '0425', '0426'], label: 'April 2026' },
    { keys: ['mei', '2105', '21525', '0525', '0526'], label: 'Mei 2026' },
    { keys: ['juni', 'jun', '2106', '21625', '0625', '0626'], label: 'Juni 2026' },
    { keys: ['juli', 'jul', '2107', '21725', '0725', '725', '0726'], label: 'Juli 2026' },
    { keys: ['agustus', 'agu', 'aug', '2108', '210825', '21825', '0825', '825', '0826'], label: 'Agustus 2026' },
    { keys: ['september', 'sep', '2109', '21925', '0925', '0926'], label: 'September 2026' },
    { keys: ['oktober', 'okt', 'oct', '2110', '211025', '1025', '1026'], label: 'Oktober 2026' },
    { keys: ['november', 'nov', '2111', '1125', '1126'], label: 'November 2026' },
    { keys: ['desember', 'des', 'dec', '2112', '1225', '1226'], label: 'Desember 2026' },
  ];

  for (const item of mapBulan) {
    if (item.keys.some((k) => lower.includes(k))) {
      return item.label;
    }
  }
  return fallbackMonth;
}

export function detectFileCategory(fileName = '', sheetNames = []) {
  const lower = fileName.toLowerCase();
  if (lower.includes('3 lembar') || lower.includes('3lembar') || sheetNames.includes('FIX') || sheetNames.includes('TIKOR')) {
    return 'tiga_lembar';
  }
  if (lower.includes('2 lembar') || lower.includes('2lembar')) {
    return 'dua_lembar';
  }
  return 'belum_lunas';
}

function convertExcelDate(val) {
  if (!val) return null;
  const num = Number(val);
  if (!isNaN(num) && num > 35000 && num < 65000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + num * 86400000).toISOString().slice(0, 10);
  }
  return String(val).trim();
}

function extractRowsFromSheet(worksheet) {
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length === 0) return [];

  let headerIdx = -1;

  for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
    const rowStr = (rawRows[i] || []).map((c) => String(c).trim().toUpperCase());
    if (
      rowStr.includes('IDPEL') ||
      rowStr.includes('ID PELANGGAN') ||
      (rowStr.includes('NAMA') && rowStr.includes('TARIF')) ||
      (rowStr.includes('NAMA PELANGGAN') && rowStr.includes('TOTAL'))
    ) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) return [];

  const headers = (rawRows[headerIdx] || []).map((h) =>
    String(h).trim().toUpperCase().replace(/\s+/g, ' ')
  );
  const dataRows = [];
  const maxLimit = Math.min(rawRows.length, headerIdx + 25000);

  for (let r = headerIdx + 1; r < maxLimit; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (h) obj[h] = row[c];
    }
    const rawIdpel = obj['IDPEL'] ?? obj['ID PELANGGAN'] ?? '';
    const idpel = String(rawIdpel).trim().replace(/\.0$/, '');
    if (/^\d{6,15}$/.test(idpel)) {
      obj['IDPEL'] = idpel;
      dataRows.push(obj);
    }
  }
  return dataRows;
}

function parseNumberClean(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  return Number(cleaned) || 0;
}

function normalizeCustomerRow(raw, sheetName, category, bulanFile) {
  const idpel = String(raw['IDPEL'] || '').trim();
  const nama = String(raw['NAMA'] || raw['NAMA PELANGGAN'] || '-').trim();
  const tarif = String(raw['TARIF'] || raw['TRF'] || '-').trim();
  const daya = parseNumberClean(raw['DAYA']);
  const alamat = String(raw['ALAMAT'] || '-').trim();
  const rbm = String(raw['RBM'] || raw['NO RBM'] || '-').trim();
  const kdpemda = String(raw['KDPEMDA'] || '').trim();
  const gardu = String(raw['GARDU'] || '-').trim();
  const lembar =
    parseNumberClean(raw['LEMBAR'] || raw['LBR']) ||
    (category === 'tiga_lembar' ? 3 : category === 'dua_lembar' ? 2 : 1);

  const rptag = parseNumberClean(raw['RPTAG'] || raw['RP TAG'] || raw['TAGIHAN']);
  const rpbk = parseNumberClean(raw['RPBK'] || raw['RP BK'] || raw['BK']);
  const rptotRaw = parseNumberClean(
    raw['TOTAL'] || raw['RP TOT'] || raw['RPTOT'] || raw['TOT'] || raw['JUMLAH']
  );
  const rptot = rptotRaw > 0 ? rptotRaw : rptag + rpbk;

  const ketRaw = String(raw['KET'] || raw['KETERANGAN'] || raw['STATUS'] || '').trim();
  const tglLunasRaw = raw['TANGGAL LUNAS'] || raw['TGL LUNAS'] || raw['TGL LUNAS'] || '';
  const tglLunasParsed = convertExcelDate(tglLunasRaw);
  const eksekusiExcel = String(raw['EKSEKUSI'] || '').trim();

  const isLunasExcel =
    ketRaw.toUpperCase().includes('LUNAS') || Boolean(tglLunasParsed);

  // Penentuan jenis meter yang aman dan akurat
  let jenisMeter = 'NON AMR';
  const sUpper = sheetName.toUpperCase().trim();
  const rbmUpper = rbm.toUpperCase();

  if (sUpper.includes('NON') || (!sUpper.includes('AMI') && !sUpper.includes('AMR') && !rbmUpper.includes('AMI') && !rbmUpper.includes('AMR') && rptot < 1000000)) {
    // Jika file tidak menyebutkan AMR/AMI secara spesifik dan jumlah pelanggan besar tanpa penanda khusus, default ke NON AMR
    jenisMeter = 'NON AMR';
  }

  if (sUpper.includes('AMI') || rbmUpper.includes('AMI')) {
    jenisMeter = 'AMI';
  } else if (sUpper === 'AMR' || sUpper.includes('AMR') || rbmUpper.includes('AMR')) {
    jenisMeter = 'AMR';
  } else if (sUpper.includes('NON')) {
    jenisMeter = 'NON AMR';
  }

  return {
    idpel,
    nama,
    tarif,
    daya,
    alamat,
    rbm,
    kdpemda,
    gardu,
    lembar,
    rptag,
    rpbk,
    rptot,
    jenisMeter,
    daerah: detectDaerah(alamat, kdpemda, rbm),
    ket: ketRaw,
    statusLunas: isLunasExcel,
    tanggalLunas: isLunasExcel
      ? tglLunasParsed || new Date().toISOString().slice(0, 10)
      : null,
    eksekusi: eksekusiExcel || (jenisMeter === 'AMR' ? 'Modem Off' : 'Shuntrip'),
    lat: raw['LAT'] || '',
    lng: raw['LNG'] || '',
    sourceSheet: sheetName,
    category,
    bulan: bulanFile,
  };
}

export async function parseExcelFile(file, forcedCategory = null, chosenMonth = 'AUTO') {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetNames = workbook.SheetNames;
    const category = forcedCategory || detectFileCategory(file.name, sheetNames);
    const bulanFile =
      !chosenMonth || chosenMonth === 'AUTO'
        ? detectMonthFromFileName(file.name, 'Agustus 2026')
        : chosenMonth;

    const byIdpel = new Map();

    sheetNames.forEach((sheetName) => {
      const ws = workbook.Sheets[sheetName];
      if (!ws) return;
      const rows = extractRowsFromSheet(ws);

      rows.forEach((raw) => {
        const item = normalizeCustomerRow(raw, sheetName, category, bulanFile);
        if (!item.idpel) return;
        const existing = byIdpel.get(item.idpel);

        if (!existing) {
          byIdpel.set(item.idpel, item);
        } else {
          byIdpel.set(item.idpel, {
            ...existing,
            ket: item.ket || existing.ket,
            statusLunas: existing.statusLunas || item.statusLunas,
            tanggalLunas: item.tanggalLunas || existing.tanggalLunas,
            lat: item.lat || existing.lat,
            lng: item.lng || existing.lng,
            gardu: item.gardu !== '-' ? item.gardu : existing.gardu,
            rptag: item.rptag || existing.rptag,
            rpbk: item.rpbk || existing.rpbk,
            rptot: item.rptot || existing.rptot,
          });
        }
      });
    });

    const records = Array.from(byIdpel.values());
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category,
      bulan: bulanFile,
      fileName: file.name,
      uploadedAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sheetNames,
      totalRows: records.length,
      records,
    };
  } catch (err) {
    console.error('Error parsing excel:', err);
    throw new Error('Gagal memproses file Excel.');
  }
}

export async function parseGoogleSheetCsvUrl(
  csvUrl,
  category = 'belum_lunas',
  bulanFile = 'Agustus 2026'
) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const records = [];
        results.data.forEach((raw) => {
          const upperRaw = {};
          Object.keys(raw).forEach((k) => {
            upperRaw[k.trim().toUpperCase()] = raw[k];
          });
          if (upperRaw['IDPEL']) {
            records.push(
              normalizeCustomerRow(upperRaw, 'GoogleSheet', category, bulanFile)
            );
          }
        });
        resolve({
          id: `gsheet-${Date.now()}`,
          category,
          bulan: bulanFile,
          fileName: 'Google Spreadsheet (Live)',
          uploadedAt: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sheetNames: ['Live Sheet'],
          totalRows: records.length,
          records,
        });
      },
      error: (err) => reject(err),
    });
  });
}