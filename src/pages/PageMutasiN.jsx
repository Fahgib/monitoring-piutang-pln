import React, { useState } from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { exportToExcel } from '../utils/reportGenerator';
import { UserX, Download, MapPin } from 'lucide-react';

export default function PageMutasiN({ data, searchQuery, onMarkAsLunas }) {
  const [subFilter, setSubFilter] = useState('ALL');

  // Hanya ambil pelanggan 3 lembar yang BELUM LUNAS
  const mutasiList = data.filter((r) => !r.statusLunas);

  const filtered = mutasiList.filter((item) => {
    const ketUpper = (item.ket || '').toUpperCase();
    if (subFilter === 'BONGKAR' && !ketUpper.includes('BONGKAR') && !ketUpper.includes('KWH')) return false;
    if (subFilter === 'LAPANGAN' && (ketUpper.includes('BONGKAR') || ketUpper.includes('KWH'))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.idpel.toLowerCase().includes(q) ||
        item.nama.toLowerCase().includes(q) ||
        (item.ket || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRp = filtered.reduce((a, b) => a + b.rptot, 0);
  const totalDaya = filtered.reduce((a, b) => a + b.daya, 0);

  return (
    <div className="space-y-4">
      {/* Header Banner Mutasi N */}
      <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-600">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white uppercase">
              Menu Khusus Mutasi N
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1">
              Daftar Pelanggan Kandidat Mutasi N (Sisa 3 Lembar Belum Lunas)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Berisi pelanggan 3 lembar yang belum lunas (Bongkar Rampung, KWH Tidak Ada, SR Bongkar, Padam, dll).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <p className="text-slate-400">Total Kandidat Mutasi N</p>
            <p className="text-base font-extrabold text-slate-800 dark:text-white">
              {formatAngka(filtered.length)} Pelanggan ({formatAngka(totalDaya)} VA)
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Total Piutang Mutasi N</p>
            <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">
              {formatRupiah(totalRp)}
            </p>
          </div>
          <button
            onClick={() => exportToExcel(filtered, 'Daftar_Pelanggan_Mutasi_N.xlsx')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Mutasi N</span>
          </button>
        </div>
      </div>

      {/* Sub-filter Keterangan */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            subFilter === 'ALL' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Semua Sisa Tidak Lunas ({mutasiList.length})
        </button>
        <button
          onClick={() => setSubFilter('BONGKAR')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            subFilter === 'BONGKAR' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Bongkar Rampung / KWH Tidak Ada
        </button>
        <button
          onClick={() => setSubFilter('LAPANGAN')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            subFilter === 'LAPANGAN' ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Kendala Lapangan / Janji Bayar
        </button>
      </div>

      {/* Tabel Mutasi N */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">IDPEL & Nama</th>
                <th className="py-3 px-4">Tarif / Daya</th>
                <th className="py-3 px-4">Daerah & Alamat</th>
                <th className="py-3 px-4">Status Lapangan (Ket)</th>
                <th className="py-3 px-4">Rupiah Mutasi N</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.idpel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-white">{r.nama}</p>
                    <p className="text-[11px] text-slate-400">{r.idpel} • RBM: {r.rbm}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-600">
                    {r.tarif} / {formatAngka(r.daya)} VA
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{r.daerah}</p>
                    <p className="text-[11px] text-slate-500">{r.alamat}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                      {r.ket || 'BELUM LUNAS (MUTASI N)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">
                    {formatRupiah(r.rptot)}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.alamat)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold"
                    >
                      <MapPin className="w-3 h-3" /> Maps
                    </a>
                    <button
                      onClick={() => onMarkAsLunas(r.idpel, 'tiga_lembar', 'Bongkar')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Tandai Lunas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}