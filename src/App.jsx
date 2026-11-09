import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import PageCekFile from './pages/PageCekFile';
import PageRingkasan from './pages/PageRingkasan';
import PageBelumLunas20 from './pages/PageBelumLunas20';
import PageHabit2Lembar from './pages/PageHabit2Lembar';
import PageTigaLembar from './pages/PageTigaLembar';
import PageMutasiN from './pages/PageMutasiN';
import PageLingkupDaerah from './pages/PageLingkupDaerah';
import PageReportHarian from './pages/PageReportHarian';
import PagePetaLapangan from './pages/PagePetaLapangan';
import PageLanggananNunggak from './pages/PageLanggananNunggak';

import {
  parseExcelFile,
  parseGoogleSheetCsvUrl,
  detectMonthFromFileName,
  DAFTAR_BULAN,
} from './utils/excelParser';
import { saveDataToDB, loadDataFromDB } from './utils/dbStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState('langganan_nunggak');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // Menyimpan status tindak lanjut per IDPEL
  const [tindakLanjutMap, setTindakLanjutMap] = useState(() => {
    const saved = localStorage.getItem('pln_tindak_lanjut_v1');
    return saved ? JSON.parse(saved) : {};
  });

  // Muat seluruh file dari IndexedDB saat aplikasi dibuka
  useEffect(() => {
    async function initData() {
      const fromIdb = await loadDataFromDB('uploaded_files', null);
      if (fromIdb && fromIdb.length > 0) {
        const fixed = fromIdb.map((f) => {
          const detected = detectMonthFromFileName(f.fileName, f.bulan);
          return {
            ...f,
            bulan: detected,
            records: (f.records || []).map((r) => ({ ...r, bulan: detected })),
          };
        });
        setUploadedFiles(fixed);
      } else {
        // Fallback jika masih ada di localStorage lama
        const oldLocal = localStorage.getItem('pln_multi_files_v2');
        if (oldLocal) {
          try {
            const parsed = JSON.parse(oldLocal);
            setUploadedFiles(parsed);
            await saveDataToDB('uploaded_files', parsed);
          } catch (e) {
            console.error(e);
          }
        }
      }
      setIsDbLoaded(true);
    }
    initData();
  }, []);

  // Simpan otomatis ke IndexedDB setiap kali ada penambahan/perubahan file
  useEffect(() => {
    if (isDbLoaded) {
      saveDataToDB('uploaded_files', uploadedFiles);
    }
  }, [uploadedFiles, isDbLoaded]);

  useEffect(() => {
    localStorage.setItem('pln_tindak_lanjut_v1', JSON.stringify(tindakLanjutMap));
  }, [tindakLanjutMap]);

  // Daftar bulan aktif sesuai file yang sudah dimasukkan (Januari - Desember)
  const availableMonths = useMemo(() => {
    const setB = new Set(uploadedFiles.map((f) => f.bulan));
    return DAFTAR_BULAN.filter((b) => setB.has(b));
  }, [uploadedFiles]);

  // Gabungkan data berdasarkan Filter Bulan yang sedang dipilih
  const datasets = useMemo(() => {
    const result = { belum_lunas: [], dua_lembar: [], tiga_lembar: [] };
    const filteredFiles =
      selectedMonth === 'ALL'
        ? uploadedFiles
        : uploadedFiles.filter((f) => f.bulan === selectedMonth);

    filteredFiles.forEach((f) => {
      if (result[f.category]) {
        result[f.category].push(...f.records);
      }
    });
    return result;
  }, [uploadedFiles, selectedMonth]);

  const handleUploadFile = async (file, forcedCategory = null, chosenMonth = 'AUTO') => {
    try {
      const parsed = await parseExcelFile(file, forcedCategory, chosenMonth);
      setUploadedFiles((prev) => {
        const filtered = prev.filter(
          (x) => !(x.fileName === parsed.fileName && x.bulan === parsed.bulan)
        );
        return [...filtered, parsed];
      });
      setSelectedMonth('ALL');
    } catch (err) {
      alert('Gagal membaca file Excel: ' + err.message);
    }
  };

  const handleChangeFileMonth = (fileId, newMonth) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              bulan: newMonth,
              records: f.records.map((r) => ({ ...r, bulan: newMonth })),
            }
          : f
      )
    );
  };

  const handleRemoveFileById = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUpdateTindakLanjut = (idpel, statusBaru) => {
    setTindakLanjutMap((prev) => ({
      ...prev,
      [idpel]: statusBaru,
    }));
  };

  const handleMarkAsLunas = (idpel, category, eksekusi = 'Shuntrip') => {
    const today = new Date().toISOString().slice(0, 10);
    setUploadedFiles((prev) =>
      prev.map((file) => ({
        ...file,
        records: file.records.map((item) =>
          item.idpel === idpel
            ? { ...item, statusLunas: true, ket: 'LUNAS', tanggalLunas: today, eksekusi }
            : item
        ),
      }))
    );
  };

  const handleUnmarkLunas = (idpel) => {
    setUploadedFiles((prev) =>
      prev.map((file) => ({
        ...file,
        records: file.records.map((item) =>
          item.idpel === idpel
            ? { ...item, statusLunas: false, ket: '', tanggalLunas: null }
            : item
        ),
      }))
    );
  };

  const handleConnectGoogleSheet = async (bulanTarget = 'Juli 2026') => {
    const url = window.prompt(
      'Masukkan Link CSV Google Spreadsheet (File > Bagikan > Publikasikan ke web > CSV):'
    );
    if (!url) return;
    try {
      const parsed = await parseGoogleSheetCsvUrl(url, 'belum_lunas', bulanTarget);
      setUploadedFiles((prev) => [...prev, parsed]);
      setSelectedMonth('ALL');
    } catch (e) {
      alert('Gagal memuat Google Sheet: ' + e.message);
    }
  };

  const counts = {
    belumLunas: datasets.belum_lunas.filter((r) => !r.statusLunas).length,
    duaLembar: datasets.dua_lembar.filter((r) => !r.statusLunas).length,
    tigaLembar: datasets.tiga_lembar.length,
    mutasiN: datasets.tiga_lembar.filter((r) => !r.statusLunas).length,
    langgananNunggak: datasets.dua_lembar.length + datasets.tiga_lembar.length,
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          uploadedFiles={uploadedFiles}
          counts={counts}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            title="Dashboard Monitoring Piutang & Langganan Menunggak PLN"
            subtitle="Pantau pelanggan sering menunggak (2-3 bulan sekali / lewat tgl 20), tindak lanjut & pelacakan peta langsung"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            availableMonths={availableMonths}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onQuickSearchMap={() => setActiveTab('langganan_nunggak')}
            onResetDemo={async () => {
              localStorage.clear();
              await saveDataToDB('uploaded_files', []);
              window.location.reload();
            }}
          />

          <main className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'cek_file' && (
              <PageCekFile
                uploadedFiles={uploadedFiles}
                onUploadFile={handleUploadFile}
                onRemoveFileById={handleRemoveFileById}
                onChangeFileMonth={handleChangeFileMonth}
                onConnectGSh={handleConnectGoogleSheet}
              />
            )}
            {activeTab === 'ringkasan' && (
              <PageRingkasan datasets={datasets} setActiveTab={setActiveTab} />
            )}
            {activeTab === 'langganan_nunggak' && (
              <PageLanggananNunggak
                uploadedFiles={uploadedFiles}
                tindakLanjutMap={tindakLanjutMap}
                onUpdateTindakLanjut={handleUpdateTindakLanjut}
                onMarkAsLunas={handleMarkAsLunas}
                globalSearchQuery={searchQuery}
              />
            )}
            {activeTab === 'belum_lunas_20' && (
              <PageBelumLunas20
                data={datasets.belum_lunas}
                searchQuery={searchQuery}
                onMarkAsLunas={handleMarkAsLunas}
              />
            )}
            {activeTab === 'habit_2' && (
              <PageHabit2Lembar
                data={datasets.dua_lembar}
                belumLunasData={datasets.belum_lunas}
                searchQuery={searchQuery}
                onMarkAsLunas={handleMarkAsLunas}
              />
            )}
            {activeTab === 'tiga_lembar' && (
              <PageTigaLembar
                data={datasets.tiga_lembar}
                searchQuery={searchQuery}
                onMarkAsLunas={handleMarkAsLunas}
                setActiveTab={setActiveTab}
              />
            )}
            {activeTab === 'mutasi_n' && (
              <PageMutasiN
                data={datasets.tiga_lembar}
                searchQuery={searchQuery}
                onMarkAsLunas={handleMarkAsLunas}
              />
            )}
            {activeTab === 'lingkup_daerah' && <PageLingkupDaerah datasets={datasets} />}
            {activeTab === 'report_harian' && (
              <PageReportHarian
                datasets={datasets}
                selectedMonth={selectedMonth === 'ALL' ? 'Semua Bulan' : selectedMonth}
                onMarkAsLunas={handleMarkAsLunas}
                onUnmarkLunas={handleUnmarkLunas}
              />
            )}
            {activeTab === 'peta_lapangan' && (
              <PagePetaLapangan
                datasets={datasets}
                globalSearchQuery={searchQuery}
                onMarkAsLunas={handleMarkAsLunas}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}