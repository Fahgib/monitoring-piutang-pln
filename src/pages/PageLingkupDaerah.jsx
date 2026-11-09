import React from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { MapPin } from 'lucide-react';

export default function PageLingkupDaerah({ datasets }) {
  const allActive = [
    ...datasets.belum_lunas,
    ...datasets.dua_lembar,
    ...datasets.tiga_lembar,
  ].filter((r) => !r.statusLunas);

  const grouped = {};
  allActive.forEach((r) => {
    if (!grouped[r.daerah]) {
      grouped[r.daerah] = { daerah: r.daerah, plg: 0, daya: 0, rp: 0, kdpemda0D: 0, kdpemda0E: 0 };
    }
    grouped[r.daerah].plg += 1;
    grouped[r.daerah].daya += r.daya;
    grouped[r.daerah].rp += r.rptot;
    if (r.kdpemda === '0D') grouped[r.daerah].kdpemda0D += 1;
    if (r.kdpemda === '0E') grouped[r.daerah].kdpemda0E += 1;
  });

  const regionList = Object.values(grouped).sort((a, b) => b.rp - a.rp);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regionList.map((reg) => (
          <div
            key={reg.daerah}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <MapPin className="w-4 h-4" />
                  {reg.daerah}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  0D: {reg.kdpemda0D} | 0E: {reg.kdpemda0E}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 dark:text-white mt-3">
                {formatRupiah(reg.rp)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>👥 <b>{formatAngka(reg.plg)}</b> Pelanggan</span>
              <span>⚡ <b>{formatAngka(reg.daya)}</b> VA</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}