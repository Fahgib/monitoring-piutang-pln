import React, { useState } from 'react';
import {
  LayoutGrid,
  Users,
  MapPin,
  FileCheck2,
  Flame,
  AlertTriangle,
  UserX,
  FolderCheck,
  MapPinned,
  CheckCircle2,
  Repeat,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  uploadedFiles,
  counts,
}) {
  const [imgError, setImgError] = useState(false);

  const menuGroups = [
    {
      groupTitle: '1. PUSAT DATA & MONITORING',
      items: [
        { id: 'cek_file', label: 'Cek & Upload File Excel', icon: FolderCheck, badge: uploadedFiles.length },
        { id: 'ringkasan', label: 'Ringkasan & Grafik', icon: LayoutGrid },
        { id: 'report_harian', label: 'Report Harian Lunas', icon: FileCheck2, live: true },
        { id: 'langganan_nunggak', label: 'Langganan Menunggak', icon: Repeat, isHabit: true, badge: counts.langgananNunggak },
      ],
    },
    {
      groupTitle: '2. KATEGORI TUNGGAKAN',
      items: [
        { id: 'belum_lunas_20', label: 'Tunggakan > Tgl 20', icon: Users, badge: counts.belumLunas },
        { id: 'habit_2', label: 'Habit 2 Lembar', icon: Flame, badge: counts.duaLembar },
        { id: 'tiga_lembar', label: 'Tunggakan 3 Lembar', icon: AlertTriangle, badge: counts.tigaLembar },
        { id: 'mutasi_n', label: 'Pelanggan Mutasi N', icon: UserX, isNew: true, badge: counts.mutasiN },
      ],
    },
    {
      groupTitle: '3. KEWILAYAHAN & PETA',
      items: [
        { id: 'lingkup_daerah', label: 'Lingkup Daerah', icon: MapPin },
        { id: 'peta_lapangan', label: 'Cari & Lihat Maps', icon: MapPinned, isMap: true },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-screen select-none transition-colors">
      <div>
        <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          {!imgError ? (
            <img
              src="/LOGO PLN.jpeg"
              onError={(e) => {
                if (e.target.src.endsWith('.jpeg')) e.target.src = '/LOGO PLN.png';
                else if (e.target.src.endsWith('.png')) e.target.src = '/LOGO PLN.jpg';
                else setImgError(true);
              }}
              alt="Logo PLN"
              className="w-11 h-11 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-0.5 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-amber-300 flex flex-col items-center justify-center font-extrabold text-cyan-700 text-xs border border-amber-400 shrink-0">
              <span className="text-red-600 text-base leading-none">⚡</span>
              <span className="text-[10px]">PLN</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-extrabold text-slate-900 dark:text-white text-xs leading-tight">
              PT PLN (PERSERO)
            </h1>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold truncate">
              Dashboard Piutang JTN
            </p>
          </div>
        </div>

        <div className="px-3 py-3 space-y-4">
          {menuGroups.map((group) => (
            <div key={group.groupTitle}>
              <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1.5">
                {group.groupTitle}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.live && (
                        <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${isActive ? 'bg-white text-cyan-700' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                          LIVE
                        </span>
                      )}
                      {item.isHabit && (
                        <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${isActive ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                          {item.badge || 'HABIT'}
                        </span>
                      )}
                      {item.isNew && (
                        <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${isActive ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'}`}>
                          {item.badge || 'MUTASI'}
                        </span>
                      )}
                      {item.isMap && (
                        <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${isActive ? 'bg-white text-cyan-700' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                          MAPS
                        </span>
                      )}
                      {!item.live && !item.isHabit && !item.isNew && !item.isMap && item.badge !== undefined && (
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isActive ? 'bg-cyan-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Ringkasan File Masuk di Sidebar Bawah */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              File Masuk ({uploadedFiles.length})
            </span>
            <button
              onClick={() => setActiveTab('cek_file')}
              className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              + Tambah File
            </button>
          </div>

          {uploadedFiles.length === 0 ? (
            <p className="text-[11px] text-slate-400">Belum ada file Excel masuk.</p>
          ) : (
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {uploadedFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                      {f.fileName}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 shrink-0 ml-1">
                    {f.bulan.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}