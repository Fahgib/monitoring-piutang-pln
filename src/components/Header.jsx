import React from 'react';
import { Search, Calendar, Moon, Sun, RotateCw, MapPinned } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  searchQuery,
  setSearchQuery,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  darkMode,
  setDarkMode,
  onResetDemo,
  onQuickSearchMap,
}) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition-colors">
      <div>
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Cari Cepat IDPEL / Nama + Tombol Langsung Lihat Map */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari IDPEL / Nama / Alamat..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-56"
            />
          </div>
          {searchQuery && (
            <button
              onClick={onQuickSearchMap}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              title="Langsung lihat lokasi pencarian ini di Peta"
            >
              <MapPinned className="w-3.5 h-3.5" />
              <span>Lihat Map</span>
            </button>
          )}
        </div>

        {/* Filter Bulan (Hanya aktif untuk bulan yang ada file-nya) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-slate-400">Filter Bulan:</span>
          {availableMonths.length === 0 ? (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              Belum Ada File
            </span>
          ) : (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="font-bold text-cyan-700 dark:text-cyan-300 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="dark:bg-slate-800 dark:text-white">
                Semua Bulan ({availableMonths.length} Bulan Aktif)
              </option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="dark:bg-slate-800 dark:text-white">
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Tombol Mode Cerah / Gelap */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Mode Cerah</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Mode Gelap</span>
            </>
          )}
        </button>

        {/* Tombol Reset */}
        <button
          onClick={onResetDemo}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
          title="Reset Data ke Awal"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}