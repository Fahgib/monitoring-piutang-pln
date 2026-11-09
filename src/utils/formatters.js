export function formatRupiah(angka) {
  const nilai = Number(angka) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nilai);
}

export function formatAngka(angka) {
  const nilai = Number(angka) || 0;
  return new Intl.NumberFormat('id-ID').format(nilai);
}

// Mendukung konversi angka seri tanggal Excel (contoh: 45890) menjadi tanggal normal
export function formatTanggalIndo(dateInput) {
  if (!dateInput) return '-';

  // Jika berupa angka seri Excel (antara 40000 s/d 60000)
  const num = Number(dateInput);
  if (!isNaN(num) && num > 35000 && num < 65000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(excelEpoch.getTime() + num * 86400000);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}