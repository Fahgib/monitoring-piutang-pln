import React, { useState } from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { exportToExcel } from '../utils/reportGenerator';
import { Download } from 'lucide-react';

export default function PageTigaLembar({ data, searchQuery, onMarkAsLunas, setActiveTab }) {
  const [ketFilter, setKetFilter] = useState('ALL');

  const filtered = data.filter((item) => {
    if (ketFilter === 'LUNAS' && !item.statusLunas) return false;
    if (ketFilter === 'BELUM_LUNAS' && item.statusLunas) return false;
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

  const lunasCount = data.filter((r) => r.statusLunas).length;
  const sisaBelumLunas = data.filter((r) => !r.statusLunas).length;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setKetFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              ketFilter === 'ALL' ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            Semua 3 Lembar ({data.length})
          </button>
          <button
            onClick={() => setKetFilter('LUNAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              ketFilter === 'LUNAS' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            Sudah Lunas ({lunasCount})
          </button>
          <button
            onClick={() => setActiveTab('mutasi_n')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            Lihat Sisa Belum Lunas di Menu Mutasi N ({sisaBelumLunas}) →
          </button>
        </div>

        <button
          onClick={() => exportToExcel(filtered, 'Rekap_3_Lembar.xlsx')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Excel</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">IDPEL & Nama</th>
                <th className="py-3 px-4">Tarif / Daya</th>
                <th className="py-3 px-4">Gardu & Alamat</th>
                <th className="py-3 px-4">Keterangan Lapangan (Sheet FIX)</th>
                <th className="py-3 px-4">Total Tagihan</th>
                <th className="py-3 px-4 text-right">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.idpel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-white">{r.nama}</p>
                    <p className="text-[11px] text-slate-400">{r.idpel}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-600">
                    {r.tarif} / {formatAngka(r.daya)} VA
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{r.gardu}</p>
                    <p className="text-[11px] text-slate-500">{r.alamat}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.statusLunas
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {r.ket || (r.statusLunas ? 'LUNAS' : 'BELUM LUNAS')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                    {formatRupiah(r.rptot)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.statusLunas ? (
                      <span className="text-emerald-600 font-bold text-[11px]">✓ Sudah Lunas</span>
                    ) : (
                      <button
                        onClick={() => onMarkAsLunas(r.idpel, 'tiga_lembar', 'Bongkar')}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] border border-teal-200 cursor-pointer"
                      >
                        Tandai Lunas
                      </button>
                    )}
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