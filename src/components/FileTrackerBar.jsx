import React, { useRef } from 'react';
import { CheckCircle2, FileWarning, UploadCloud, Trash2 } from 'lucide-react';
import { formatAngka } from '../utils/formatters';

export default function FileTrackerBar({ fileRegistry, onUploadSpecificFile, onRemoveFile }) {
  const inputRefs = {
    belum_lunas: useRef(null),
    dua_lembar: useRef(null),
    tiga_lembar: useRef(null),
  };

  const slots = [
    {
      key: 'belum_lunas',
      title: '1. File Belum Lunas (> Tgl 20)',
      desc: 'Contoh: belum lunas 21725.xls (NON AMR, AMI, AMR)',
    },
    {
      key: 'dua_lembar',
      title: '2. File Pelanggan Habit (2 Lembar)',
      desc: 'Contoh: 2 lembar juli.xls (Master, AMI, AMR)',
    },
    {
      key: 'tiga_lembar',
      title: '3. File 3 Lembar & Mutasi N',
      desc: 'Contoh: 3 lembar juli.xls (Master, FIX, TIKOR)',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Status Pengecekan File Masuk (File Checker)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau file Excel mana saja yang sudah masuk ke sistem. Jika Anda menambah ket &quot;LUNAS&quot; di Excel, unggah ulang di sini untuk update otomatis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {slots.map((slot) => {
          const info = fileRegistry[slot.key];
          const isLoaded = Boolean(info && info.totalRows > 0);

          return (
            <div
              key={slot.key}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isLoaded
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {slot.title}
                  </span>
                  {isLoaded ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                      <CheckCircle2 className="w-3 h-3" /> Sudah Masuk
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      <FileWarning className="w-3 h-3" /> Belum Diisi
                    </span>
                  )}
                </div>

                {isLoaded ? (
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                      📄 {info.fileName}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      • Jumlah Data: <b>{formatAngka(info.totalRows)} pelanggan</b> (Jam {info.uploadedAt})
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      • Sheet Terbaca: {info.sheetNames.join(', ')}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {slot.desc}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                <input
                  ref={inputRefs[slot.key]}
                  type="file"
                  accept=".xls,.xlsx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onUploadSpecificFile(e.target.files[0], slot.key);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => inputRefs[slot.key].current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isLoaded ? 'Update / Ganti File' : 'Pilih File Excel'}</span>
                </button>
                {isLoaded && (
                  <button
                    onClick={() => onRemoveFile(slot.key)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 transition"
                    title="Hapus File Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}