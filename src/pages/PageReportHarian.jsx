import React, { useState } from 'react';
import { formatRupiah, formatAngka, formatTanggalIndo } from '../utils/formatters';
import {
  generateWhatsAppReport,
  exportToExcel,
  exportReportToPDF,
} from '../utils/reportGenerator';
import { Share2, FileSpreadsheet, FileText, Search } from 'lucide-react';

export default function PageReportHarian({
  datasets,
  selectedMonth,
  onMarkAsLunas,
  onUnmarkLunas,
}) {
  const [quickSearch, setQuickSearch] = useState('');
  const [selectedExec, setSelectedExec] = useState('Shuntrip');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [copiedWA, setCopiedWA] = useState(false);

  // Gabungkan semua pelanggan dari 3 sumber
  const allCustomers = [
    ...datasets.belum_lunas,
    ...datasets.dua_lembar,
    ...datasets.tiga_lembar,
  ];

  const allLunas = allCustomers.filter((r) => r.statusLunas);
  const allBelumLunas = allCustomers.filter((r) => !r.statusLunas);

  // Daftar tanggal unik pelunasan
  const uniqueDates = Array.from(new Set(allLunas.map((r) => r.tanggalLunas).filter(Boolean)));

  const filteredLunas =
    selectedDate === 'ALL'
      ? allLunas
      : allLunas.filter((r) => r.tanggalLunas === selectedDate);

  const totalLunasRp = filteredLunas.reduce((a, b) => a + b.rptot, 0);
  const totalLunasDaya = filteredLunas.reduce((a, b) => a + b.daya, 0);
  const totalShuntrip = filteredLunas.filter((r) => r.eksekusi === 'Shuntrip').length;

  // Filter untuk panel kanan "Update Cepat Pelanggan Baru Lunas"
  const quickCandidates = allBelumLunas
    .filter((r) => {
      if (!quickSearch) return true;
      const q = quickSearch.toLowerCase();
      return r.idpel.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q);
    })
    .slice(0, 12);

  const handleCopyWA = () => {
    const text = generateWhatsAppReport(
      filteredLunas,
      selectedDate === 'ALL' ? new Date().toISOString().slice(0, 10) : selectedDate,
      selectedMonth
    );
    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Kartu Atas: Pusat Report Harian Pelanggan Sudah Lunas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 mb-2">
              FITUR UNGGULAN REPORT HARIAN
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
              Pusat Report Harian Pelanggan Sudah Lunas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih tanggal pelunasan untuk melihat rincian harian, tandai pelanggan baru lunas, atau salin format laporan WhatsApp
            </p>
          </div>

          {/* Kontrol Kanan: Pilih Tanggal, Salin WA, Excel, PDF */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
              <span className="text-slate-400">Pilih Tanggal Lunas:</span>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-teal-700 dark:text-teal-300 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Tanggal ({allLunas.length} Lunas)</option>
                {uniqueDates.map((d) => (
                  <option key={d} value={d}>
                    {formatTanggalIndo(d)} ({allLunas.filter((x) => x.tanggalLunas === d).length} Lunas)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCopyWA}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedWA ? 'Tersalin ke WA!' : 'Salin Report WA'}</span>
            </button>

            <button
              onClick={() => exportToExcel(filteredLunas, 'Report_Harian_Sudah_Lunas.xlsx')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={() =>
                exportReportToPDF(
                  filteredLunas,
                  selectedDate === 'ALL' ? new Date().toISOString().slice(0, 10) : selectedDate
                )
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Kartu Indikator Sesuai Tangkapan Layar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400 font-semibold">Tanggal Report</p>
            <p className="text-xl font-extrabold text-teal-700 dark:text-teal-300 mt-1">
              {selectedDate === 'ALL'
                ? formatTanggalIndo(new Date())
                : formatTanggalIndo(selectedDate)}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400 font-semibold">Pelanggan Lunas</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {filteredLunas.length} Pelanggan
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400 font-semibold">Total Rupiah Lunas</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatRupiah(totalLunasRp)}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs text-slate-400 font-semibold">Daya & Eks. Shuntrip</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {formatAngka(totalLunasDaya)} VA ({totalShuntrip} Shuntrip)
            </p>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Tabel Daftar Pelanggan Sudah Lunas (Kiri) & Update Cepat (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri (2 Kolom): Daftar Pelanggan Sudah Lunas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            Daftar Pelanggan Sudah Lunas
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Rincian pelanggan yang melunasi tagihan pada tanggal terpilih (termasuk yang ditandai LUNAS dari Excel)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 px-3">IDPEL & NAMA</th>
                  <th className="py-2.5 px-3">TARIF / DAYA</th>
                  <th className="py-2.5 px-3">DAERAH</th>
                  <th className="py-2.5 px-3">RUPIAH LUNAS</th>
                  <th className="py-2.5 px-3">EKSEKUSI</th>
                  <th className="py-2.5 px-3">TANGGAL LUNAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLunas.map((item) => (
                  <tr key={item.idpel} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800 dark:text-white uppercase">
                        {item.nama}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.idpel} • <span className="text-teal-600">{selectedMonth.split(' ')[0]}</span>
                      </p>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-600">
                      {item.tarif} / {formatAngka(item.daya)} VA
                    </td>
                    <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.daerah}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(item.rptot)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {item.eksekusi || 'Shuntrip'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                          {formatTanggalIndo(item.tanggalLunas)}
                        </span>
                        <button
                          onClick={() => onUnmarkLunas(item.idpel, item.category)}
                          className="text-[10px] text-slate-400 hover:text-rose-500"
                          title="Batalkan status lunas"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanan (1 Kolom): Update Cepat Pelanggan Baru Lunas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
            Update Cepat Pelanggan Baru Lunas
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
            Daftar pelanggan yang masih belum lunas. Klik tombol <b>Tandai Lunas</b> untuk memasukkannya ke Report Harian.
          </p>

          {/* Pilihan Metode Eksekusi Default */}
          <div className="flex items-center gap-1.5 mb-3 text-[11px]">
            <span className="text-slate-400">Metode Eks:</span>
            {['Shuntrip', 'Modem Off', 'Mandiri'].map((eks) => (
              <button
                key={eks}
                onClick={() => setSelectedExec(eks)}
                className={`px-2 py-1 rounded-md font-bold ${
                  selectedExec === eks
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {eks}
              </button>
            ))}
          </div>

          {/* Kotak Pencarian Cepat Belum Lunas */}
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Cari IDPEL / Nama yang belum lunas..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Daftar Kandidat Belum Lunas */}
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {quickCandidates.map((item) => (
              <div
                key={`${item.category}-${item.idpel}`}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 flex items-center justify-between gap-2 transition"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate uppercase">
                    {item.nama}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.idpel} • {item.daerah}
                  </p>
                  <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    {formatRupiah(item.rptot)} ({formatAngka(item.daya)} VA)
                  </p>
                </div>

                <button
                  onClick={() => onMarkAsLunas(item.idpel, item.category, selectedExec)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold transition cursor-pointer"
                >
                  Tandai Lunas
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}