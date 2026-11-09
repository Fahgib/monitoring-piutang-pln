import React, { useState } from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { exportToExcel } from '../utils/reportGenerator';
import { Download, CheckCircle2 } from 'lucide-react';

export default function PageBelumLunas20({ data, searchQuery, onMarkAsLunas }) {
  const [meterFilter, setMeterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('BELUM_LUNAS');

  const filtered = data.filter((item) => {
    if (meterFilter !== 'ALL' && item.jenisMeter !== meterFilter) return false;
    if (statusFilter === 'BELUM_LUNAS' && item.statusLunas) return false;
    if (statusFilter === 'LUNAS' && !item.statusLunas) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.idpel.toLowerCase().includes(q) ||
        item.nama.toLowerCase().includes(q) ||
        item.alamat.toLowerCase().includes(q) ||
        item.daerah.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRp = filtered.reduce((acc, r) => acc + r.rptot, 0);
  const totalDaya = filtered.reduce((acc, r) => acc + r.daya, 0);

  return (
    <div className="space-y-4">
      {/* Bar Filter & Ringkasan */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'NON AMR', 'AMI', 'AMR'].map((m) => (
            <button
              key={m}
              onClick={() => setMeterFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                meterFilter === m
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m === 'ALL' ? 'Semua Meter' : m}
            </button>
          ))}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="BELUM_LUNAS">Belum Lunas</option>
            <option value="LUNAS">Sudah Lunas</option>
            <option value="ALL">Semua Status</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Pelanggan: <b>{formatAngka(filtered.length)}</b></span>
          <span>Total Daya: <b>{formatAngka(totalDaya)} VA</b></span>
          <span>Total Rupiah: <b className="text-rose-600 dark:text-rose-400">{formatRupiah(totalRp)}</b></span>
          <button
            onClick={() => exportToExcel(filtered, 'Tunggakan_Lewat_Tgl20.xlsx')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>
        </div>
      </div>

      {/* Tabel Data (Menampilkan 150 baris teratas agar tetap ringan untuk 13.000+ baris) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4">IDPEL & Nama</th>
                <th className="py-3 px-4">Tarif / Daya</th>
                <th className="py-3 px-4">Meter</th>
                <th className="py-3 px-4">Lingkup Daerah & Alamat</th>
                <th className="py-3 px-4">RPTAG + RPBK</th>
                <th className="py-3 px-4 text-right">Aksi Pelunasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.slice(0, 150).map((r) => (
                <tr key={r.idpel} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800 dark:text-white">{r.nama}</p>
                    <p className="text-[11px] text-slate-400">{r.idpel} • RBM: {r.rbm}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400">
                    {r.tarif} / {formatAngka(r.daya)} VA
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {r.jenisMeter}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{r.daerah}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{r.alamat}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                    {formatRupiah(r.rptot)}
                    <p className="text-[10px] font-normal text-slate-400">
                      Tag: {formatRupiah(r.rptag)} | BK: {formatRupiah(r.rpbk)}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.statusLunas ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lunas ({r.tanggalLunas})
                      </span>
                    ) : (
                      <button
                        onClick={() => onMarkAsLunas(r.idpel, 'belum_lunas', 'Shuntrip')}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold text-[11px] border border-teal-200 dark:border-teal-800 transition cursor-pointer"
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
        {filtered.length > 150 && (
          <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Menampilkan 150 dari {formatAngka(filtered.length)} pelanggan. Gunakan kotak pencarian di atas untuk mencari IDPEL tertentu.
          </div>
        )}
      </div>
    </div>
  );
}