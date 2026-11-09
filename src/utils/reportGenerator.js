import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah, formatAngka, formatTanggalIndo } from './formatters';

// 1. Buat format teks Laporan Harian WhatsApp
export function generateWhatsAppReport(lunasList, tanggalReport, bulanLabel) {
  const totalPlg = lunasList.length;
  const totalRp = lunasList.reduce((acc, r) => acc + r.rptot, 0);
  const totalDaya = lunasList.reduce((acc, r) => acc + r.daya, 0);
  const jmlShuntrip = lunasList.filter((r) => r.eksekusi === 'Shuntrip').length;

  let text = `*REPORT HARIAN PELANGGAN SUDAH LUNAS*\n`;
  text += `📅 Tanggal: ${formatTanggalIndo(tanggalReport)} (${bulanLabel})\n`;
  text += `👥 Pelanggan Lunas: *${totalPlg} Pelanggan*\n`;
  text += `💰 Total Rupiah Lunas: *${formatRupiah(totalRp)}*\n`;
  text += `⚡ Total Daya: *${formatAngka(totalDaya)} VA* (${jmlShuntrip} Shuntrip)\n`;
  text += `----------------------------------------\n`;

  lunasList.forEach((item, idx) => {
    text += `${idx + 1}. *${item.nama}* (${item.idpel})\n`;
    text += `   • Tarif/Daya: ${item.tarif} / ${formatAngka(item.daya)} VA\n`;
    text += `   • Daerah: ${item.daerah}\n`;
    text += `   • Lunas: *${formatRupiah(item.rptot)}* | Eks: ${item.eksekusi}\n`;
  });

  return text;
}

// 2. Ekspor daftar data ke file Excel (.xlsx)
export function exportToExcel(dataList, fileName = 'Report_Piutang_PLN.xlsx') {
  const rows = dataList.map((item, idx) => ({
    NO: idx + 1,
    IDPEL: item.idpel,
    NAMA: item.nama,
    TARIF: item.tarif,
    DAYA: item.daya,
    ALAMAT: item.alamat,
    DAERAH: item.daerah,
    RBM: item.rbm,
    KDPEMDA: item.kdpemda,
    LEMBAR: item.lembar,
    RPTAG: item.rptag,
    RPBK: item.rpbk,
    'RP TOT': item.rptot,
    'JENIS METER': item.jenisMeter,
    KETERANGAN: item.ket || (item.statusLunas ? 'LUNAS' : 'BELUM LUNAS'),
    STATUS: item.statusLunas ? 'LUNAS' : 'BELUM LUNAS',
    'TANGGAL LUNAS': item.tanggalLunas || '',
    EKSEKUSI: item.eksekusi || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, fileName);
}

// 3. Ekspor Report Harian ke PDF
export function exportReportToPDF(lunasList, tanggalReport) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Report Harian Pelanggan Sudah Lunas - ${formatTanggalIndo(tanggalReport)}`, 14, 16);

  const totalRp = lunasList.reduce((a, b) => a + b.rptot, 0);
  const totalDaya = lunasList.reduce((a, b) => a + b.daya, 0);

  doc.setFontSize(10);
  doc.text(
    `Total Pelanggan: ${lunasList.length} | Total Lunas: ${formatRupiah(totalRp)} | Total Daya: ${formatAngka(totalDaya)} VA`,
    14,
    23
  );

  const tableRows = lunasList.map((r, i) => [
    i + 1,
    `${r.idpel}\n${r.nama}`,
    `${r.tarif} / ${formatAngka(r.daya)} VA`,
    r.daerah,
    formatRupiah(r.rptot),
    r.eksekusi,
    formatTanggalIndo(r.tanggalLunas),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['No', 'IDPEL & Nama', 'Tarif/Daya', 'Daerah', 'Rupiah Lunas', 'Eksekusi', 'Tgl Lunas']],
    body: tableRows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(`Report_Harian_Lunas_${tanggalReport}.pdf`);
}