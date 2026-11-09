import React, { useState } from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { exportToExcel } from '../utils/reportGenerator';
import { Flame, Download } from 'lucide-react';

export default function PageHabit2Lembar({ data, belumLunasData, searchQuery, onMarkAsLunas }) {
  const [meterFilter, setMeterFilter] = useState('ALL');
  const setBelumLunasIdpel = new Set(belumLunasData.map((r) => r.idpel));

  const filtered = data.filter((item) => {
    if (meterFilter !== 'ALL' && item.jenisMeter !== meterFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.idpel.toLowerCase().includes(q) ||
        item.nama.toLowerCase().includes(q) ||
        item.daerah.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const belumLunasOnly = filtered.filter((r) => !r.statusLunas);
  const totalRp = belumLunasOnly.reduce((a, b) => a + b.rptot, 0);
  const totalDaya = belumLunasOnly.reduce((a, b) => a + b.daya, 0);

  return (
    <div className="space-y-4">
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Monitoring Pelanggan Habit Menunggak 2 Lembar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prioritas penagihan sebelum masuk ke tagihan 3 lembar / bongkar rampung.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Belum Lunas: <b>{formatAngka(belumLunasOnly.length)} Plg</b></span>
          <span>Daya: <b>{formatAngka(totalDaya)} VA</b></span>
          <span>Total: <b className="text-amber-700 dark:text-amber-400">{formatRupiah(totalRp)}</b></span>
          <button
            onClick={() => exportToExcel(filtered, 'Data_Habit_2_Lembar.xlsx')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Meter */}
      <div className="flex gap-2">
        {['ALL', 'NON AMR', 'AMI', 'AMR'].map((m) => (
          <button
            key={m}
            onClick={() => setMeterFilter(m)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              meterFilter === m
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {m === 'ALL' ? 'Semua Meter' : m}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">IDPEL & Nama</th>
                <th className="py-3 px-4">Tarif / Daya</th>
                <th className="py-3 px-4">Daerah & Alamat</th>
                <th className="py-3 px-4">Status Habit</th>
                <th className="py-3 px-4">Total 2 Lembar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => {
                const isHabitBerulang = setBelumLunasIdpel.has(r.idpel);
                return (
                  <tr key={r.idpel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800 dark:text-white">{r.nama}</p>
                      <p className="text-[11px] text-slate-400">{r.idpel} • {r.jenisMeter}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-600">
                      {r.tarif} / {formatAngka(r.daya)} VA
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400">{r.daerah}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{r.alamat}</p>
                    </td>
                    <td className="py-3 px-4">
                      {isHabitBerulang ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                          Habit Berulang (&gt;Tgl 20)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                          Tunggakan 2 Lembar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                      {formatRupiah(r.rptot)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.statusLunas ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                          Sudah Lunas
                        </span>
                      ) : (
                        <button
                          onClick={() => onMarkAsLunas(r.idpel, 'dua_lembar', 'Shuntrip')}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] border border-teal-200 cursor-pointer"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}