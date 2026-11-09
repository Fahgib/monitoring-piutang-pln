import React from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { Users, Zap, Wallet, CheckCircle, ArrowRight, PieChart, BarChart3 } from 'lucide-react';

export default function PageRingkasan({ datasets, setActiveTab }) {
  const allData = [
    ...datasets.belum_lunas,
    ...datasets.dua_lembar,
    ...datasets.tiga_lembar,
  ];

  const belumLunasList = allData.filter((r) => !r.statusLunas);
  const sudahLunasList = allData.filter((r) => r.statusLunas);

  const totalPlg = belumLunasList.length;
  const totalDaya = belumLunasList.reduce((a, b) => a + b.daya, 0);
  const totalRp = belumLunasList.reduce((a, b) => a + b.rptot, 0);

  const totalLunasPlg = sudahLunasList.length;
  const totalLunasRp = sudahLunasList.reduce((a, b) => a + b.rptot, 0);

  // Data untuk Diagram Bulat (Donut Chart) berdasarkan Jenis Meter
  const meterGroups = [
    { label: 'NON AMR', color: '#0284c7', rp: belumLunasList.filter((r) => r.jenisMeter === 'NON AMR').reduce((a, b) => a + b.rptot, 0) },
    { label: 'AMR', color: '#f59e0b', rp: belumLunasList.filter((r) => r.jenisMeter === 'AMR').reduce((a, b) => a + b.rptot, 0) },
    { label: 'AMI', color: '#10b981', rp: belumLunasList.filter((r) => r.jenisMeter === 'AMI').reduce((a, b) => a + b.rptot, 0) },
  ];
  const sumMeterRp = meterGroups.reduce((a, b) => a + b.rp, 0) || 1;

  // Data untuk Diagram Batang (Bar Chart) Top 6 Lingkup Daerah
  const regionMap = {};
  belumLunasList.forEach((r) => {
    regionMap[r.daerah] = (regionMap[r.daerah] || 0) + r.rptot;
  });
  const topRegions = Object.entries(regionMap)
    .map(([daerah, rp]) => ({ daerah, rp }))
    .sort((a, b) => b.rp - a.rp)
    .slice(0, 6);
  const maxRegionRp = topRegions[0]?.rp || 1;

  // Hitung stroke-dasharray SVG Donut
  let cumulativePercent = 0;

  return (
    <div className="space-y-6">
      {/* 4 Kartu KPI Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Pelanggan Menunggak</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {formatAngka(totalPlg)} <span className="text-sm font-semibold text-slate-400">Plg</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Daya Menunggak</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatAngka(totalDaya)} <span className="text-sm font-semibold">VA</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Total Piutang (Belum Lunas)</span>
            <Wallet className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {formatRupiah(totalRp)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-1">
            <span>Sudah Lunas (Report Harian)</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatRupiah(totalLunasRp)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{formatAngka(totalLunasPlg)} Pelanggan Lunas</p>
        </div>
      </div>

      {/* BAGIAN VISUALISASI: DIAGRAM BULAT (DONUT) & DIAGRAM BATANG (BAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Diagram Bulat (Donut Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Diagram Bulat: Proporsi Piutang per Jenis Meter
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="3.8"
                />
                {meterGroups.map((g) => {
                  const pct = (g.rp / sumMeterRp) * 100;
                  const dashArray = `${pct} ${100 - pct}`;
                  const dashOffset = 100 - cumulativePercent;
                  cumulativePercent += pct;
                  return (
                    <circle
                      key={g.label}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke={g.color}
                      strokeWidth="3.8"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                <span className="text-[10px] font-bold text-slate-400">TOTAL</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                  {formatAngka(totalPlg)} Plg
                </span>
              </div>
            </div>

            <div className="space-y-3 flex-1 w-full">
              {meterGroups.map((g) => {
                const pct = ((g.rp / sumMeterRp) * 100).toFixed(1);
                return (
                  <div key={g.label} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{g.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 dark:text-white">{formatRupiah(g.rp)}</span>
                      <span className="ml-2 text-[11px] text-slate-400">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Diagram Batang (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Diagram Batang: Nilai Tunggakan per Lingkup Daerah
            </h3>
          </div>

          <div className="space-y-3">
            {topRegions.map((item) => {
              const widthPct = Math.max(8, Math.round((item.rp / maxRegionRp) * 100));
              return (
                <div key={item.daerah} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                      {item.daerah}
                    </span>
                    <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                      {formatRupiah(item.rp)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ringkasan 3 Menu Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: '1. Tunggakan > Tgl 20 (Belum Lunas)',
            count: datasets.belum_lunas.filter((r) => !r.statusLunas).length,
            rp: datasets.belum_lunas.filter((r) => !r.statusLunas).reduce((a, b) => a + b.rptot, 0),
            daya: datasets.belum_lunas.filter((r) => !r.statusLunas).reduce((a, b) => a + b.daya, 0),
            tab: 'belum_lunas_20',
            color: 'border-l-4 border-l-blue-500',
          },
          {
            title: '2. Pelanggan Habit (2 Lembar)',
            count: datasets.dua_lembar.filter((r) => !r.statusLunas).length,
            rp: datasets.dua_lembar.filter((r) => !r.statusLunas).reduce((a, b) => a + b.rptot, 0),
            daya: datasets.dua_lembar.filter((r) => !r.statusLunas).reduce((a, b) => a + b.daya, 0),
            tab: 'habit_2',
            color: 'border-l-4 border-l-amber-500',
          },
          {
            title: '3. Pelanggan Mutasi N (Sisa 3 Lembar)',
            count: datasets.tiga_lembar.filter((r) => !r.statusLunas).length,
            rp: datasets.tiga_lembar.filter((r) => !r.statusLunas).reduce((a, b) => a + b.rptot, 0),
            daya: datasets.tiga_lembar.filter((r) => !r.statusLunas).reduce((a, b) => a + b.daya, 0),
            tab: 'mutasi_n',
            color: 'border-l-4 border-l-rose-500',
          },
        ].map((c) => (
          <div
            key={c.title}
            className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 ${c.color} flex flex-col justify-between`}
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">{c.title}</h4>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                {formatRupiah(c.rp)}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>👥 <b>{formatAngka(c.count)}</b> Pelanggan</span>
                <span>⚡ <b>{formatAngka(c.daya)}</b> VA</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab(c.tab)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              <span>Buka Daftar Pelanggan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}