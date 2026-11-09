import React, { useState, useRef } from 'react';
import { DAFTAR_BULAN } from '../utils/excelParser';
import { formatAngka } from '../utils/formatters';
import { UploadCloud, Trash2, CheckCircle2, FileSpreadsheet, FolderPlus } from 'lucide-react';

export default function PageCekFile({
  uploadedFiles,
  onUploadFile,
  onRemoveFileById,
  onChangeFileMonth,
  onConnectGSh,
}) {
  const [chosenMonth, setChosenMonth] = useState('AUTO');
  const [chosenCategory, setChosenCategory] = useState('AUTO');
  const fileInputRef = useRef(null);

  const categoryLabels = {
    belum_lunas: '1. Belum Lunas (> Tgl 20)',
    dua_lembar: '2. Pelanggan Habit (2 Lembar)',
    tiga_lembar: '3. Tunggakan 3 Lembar & Mutasi N',
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      await onUploadFile(
        file,
        chosenCategory === 'AUTO' ? null : chosenCategory,
        chosenMonth
      );
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              PUSAT INPUT DATA MULTI-BULAN (JANUARI - DESEMBER)
            </span>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
              Tambah & Cek File Excel yang Sudah Dimasukkan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anda bebas memasukkan banyak file sekaligus (Januari–Desember). Sistem otomatis mengenali bulan dari nama file atau bisa Anda ubah per kartu di bawah.
            </p>
          </div>
          <button
            onClick={() => onConnectGSh(chosenMonth === 'AUTO' ? 'Juli 2026' : chosenMonth)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Hubungkan Link Google Sheet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Langkah 1: Pilih Bulan Data
            </label>
            <select
              value={chosenMonth}
              onChange={(e) => setChosenMonth(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="AUTO">✨ Deteksi Otomatis dari Nama File</option>
              {DAFTAR_BULAN.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Langkah 2: Jenis File Excel
            </label>
            <select
              value={chosenCategory}
              onChange={(e) => setChosenCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
            >
              <option value="AUTO">✨ Deteksi Otomatis dari Nama File</option>
              <option value="belum_lunas">File Belum Lunas (&gt; Tgl 20)</option>
              <option value="dua_lembar">File Habit 2 Lembar</option>
              <option value="tiga_lembar">File 3 Lembar & Mutasi N</option>
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Langkah 3: Pilih & Masukan File Excel (Bisa Banyak)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daftar Semua File yang Sudah Masuk */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-cyan-600" />
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Daftar Semua File yang Sudah Masuk ({uploadedFiles.length} File)
            </h4>
          </div>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Belum ada file yang dimasukkan. Silakan klik tombol Pilih & Masukan File Excel di atas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {/* Dropdown Ubah Bulan Langsung di Kartu */}
                    <select
                      value={file.bulan}
                      onChange={(e) => onChangeFileMonth(file.id, e.target.value)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-600 text-white cursor-pointer focus:outline-none"
                      title="Klik untuk mengubah bulan file ini"
                    >
                      {DAFTAR_BULAN.map((b) => (
                        <option key={b} value={b} className="bg-slate-800 text-white">
                          {b}
                        </option>
                      ))}
                    </select>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Masuk
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-white truncate">
                    📄 {file.fileName}
                  </p>
                  <p className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 mt-1">
                    Kategori: {categoryLabels[file.category] || file.category}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    • Jumlah Data: <b>{formatAngka(file.totalRows)} pelanggan</b> (Jam {file.uploadedAt})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    • Sheet: {file.sheetNames.join(', ')}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => onRemoveFileById(file.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[11px] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus File
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}