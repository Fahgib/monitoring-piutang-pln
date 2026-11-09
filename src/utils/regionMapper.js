// Mendeteksi Lingkup Daerah dari Alamat, KDPEMDA, dan RBM sesuai UI referensi
export function detectDaerah(alamat = '', kdpemda = '', rbm = '') {
  const teks = String(alamat).toUpperCase();

  if (teks.includes('MATRAMAN') || teks.includes('PALMERIAM') || teks.includes('PALMARIAM') || teks.includes('KBUNMANGGIS') || teks.includes('UTAN KAYU') || teks.includes('PISANGAN')) {
    return 'MATRAMAN';
  }
  if (teks.includes('BIDARA CINA') || teks.includes('BID CINA') || teks.includes('OTISTA') || teks.includes('CAWANG')) {
    return 'BIDARA CINA / OTISTA';
  }
  if (teks.includes('MENTENG DLM') || teks.includes('MENTENG DALAM') || teks.includes('MENT DLM') || teks.includes('SAHARJO') || teks.includes('PAL BATU')) {
    return 'MENTENG DALAM / SAHARJO';
  }
  if (teks.includes('CIPINANG') || teks.includes('CIP ') || teks.includes('CIPC') || teks.includes('BEKASI TIMUR') || teks.includes('BEKASI TMR')) {
    return 'CIPINANG';
  }
  if (teks.includes('GUDANG PELURU') || teks.includes('GD PELURU') || teks.includes('KEBON BARU') || teks.includes('KB BARU')) {
    return 'KEBON BARU / GD PELURU';
  }
  if (teks.includes('TEBET') || teks.includes('TBT') || teks.includes('BUKIT DURI') || teks.includes('BK DURI') || teks.includes('MANGGARAI')) {
    return 'TEBET';
  }
  if (teks.includes('HALIM') || teks.includes('BUGEL') || teks.includes('NGARBINGAN')) {
    return 'HALIM / MAKASAR';
  }

  // Fallback jika alamat singkat, gunakan KDPEMDA (0D = Sektor Tebet/Selatan, 0E = Sektor Matraman/Cipinang)
  if (String(kdpemda).trim().toUpperCase() === '0D') return 'WILAYAH 0D (TEBET & SEKITAR)';
  if (String(kdpemda).trim().toUpperCase() === '0E') return 'WILAYAH 0E (MATRAMAN / CIPINANG)';

  return 'LAINNYA';
}