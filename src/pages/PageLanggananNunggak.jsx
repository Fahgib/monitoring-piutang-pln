import React, { useState, useMemo } from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { DAFTAR_BULAN } from '../utils/excelParser';
import { exportToExcel } from '../utils/reportGenerator';
import {
  Repeat,
  MapPin,
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
  FileSearch,
  Share2,
  HelpCircle,
} from 'lucide-react';

export default function PageLanggananNunggak({
  uploadedFiles,
  tindakLanjutMap,
  onUpdateTindakLanjut,
  onMarkAsLunas,
  globalSearchQuery,
}) {
  const [filterFrekuensi, setFilterFrekuensi] = useState('BERULANG_2_PLUS');
  const [filterDaerah, setFilterDaerah] = useState('ALL');
  const [filterTindakLanjut, setFilterTindakLanjut] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');
  const [copiedIdpel, setCopiedIdpel] = useState(null);

  // 1. Susun Bukti Riwayat Menunggak Per Bulan untuk Setiap IDPEL
  const habitualCustomers = useMemo(() => {
    const mapByIdpel = new Map();

    uploadedFiles.forEach((file) => {
      const bulanLabel = file.bulan || 'Juli 2026';
      const katLabel =
        file.category === 'tiga_lembar'
          ? 'Nunggak 3 Lembar'
          : file.category === 'dua_lembar'
          ? 'Nunggak 2 Lembar'
          : 'Lewat Tgl 20';

      (file.records || []).forEach((rec) => {
        const existing = mapByIdpel.get(rec.idpel);
        const buktiItem = {
          bulan: bulanLabel,
          kategori: katLabel,
          fileName: file.fileName,
          lembar: rec.lembar || (file.category === 'tiga_lembar' ? 3 : file.category === 'dua_lembar' ? 2 : 1),
          rptot: rec.rptot,
          ket: rec.ket || '',
        };

        if (!existing) {
          mapByIdpel.set(rec.idpel, {
            ...rec,
            maxLembar: buktiItem.lembar,
            buktiMap: new Map([[`${bulanLabel}-${katLabel}`, buktiItem]]),
            bulanSet: new Set([bulanLabel]),
          });
        } else {
          existing.maxLembar = Math.max(existing.maxLembar, buktiItem.lembar);
          existing.bulanSet.add(bulanLabel);
          existing.buktiMap.set(`${bulanLabel}-${katLabel}`, buktiItem);

          if (rec.rptot > existing.rptot) {
            existing.rptot = rec.rptot;
            existing.rptag = rec.rptag;
            existing.rpbk = rec.rpbk;
          }
          existing.lat = existing.lat || rec.lat;
          existing.lng = existing.lng || rec.lng;
          existing.ket = rec.ket || existing.ket;
          existing.statusLunas = existing.statusLunas && rec.statusLunas;
        }
      });
    });

    const result = [];
    mapByIdpel.forEach((item) => {
      // Urutkan bukti sesuai urutan kalender Januari -> Desember
      const buktiList = Array.from(item.buktiMap.values()).sort(
        (a, b) => DAFTAR_BULAN.indexOf(a.bulan) - DAFTAR_BULAN.indexOf(b.bulan)
      );

      const bulanTerurut = Array.from(item.bulanSet).sort(
        (a, b) => DAFTAR_BULAN.indexOf(a) - DAFTAR_BULAN.indexOf(b)
      );

      const jmlBulan = bulanTerurut.length;
      const jmlCatatan = buktiList.length;

      // Masukkan jika muncul di >= 2 bulan/catatan ATAU menunggak >= 2 lembar
      if (jmlBulan >= 2 || jmlCatatan >= 2 || item.maxLembar >= 2) {
        let alasanText = '';
        let badgeLevel = 'SEDANG';

        if (jmlBulan >= 3) {
          alasanText = `Langganan menunggak di ${jmlBulan} bulan berbeda (${bulanTerurut.map((b) => b.split(' ')[0]).join(', ')})`;
          badgeLevel = 'KRITIS';
        } else if (jmlBulan === 2) {
          alasanText = `Tercatat menunggak di 2 bulan (${bulanTerurut.map((b) => b.split(' ')[0]).join(' & ')})`;
          badgeLevel = 'TINGGI';
        } else if (item.maxLembar >= 3) {
          alasanText = `Menunggak hingga 3 bulan tagihan (3 Lembar) pada ${bulanTerurut[0]}`;
          badgeLevel = 'KRITIS';
        } else {
          alasanText = `Kebiasaan bayar 2 bulan sekali (2 Lembar) pada ${bulanTerurut[0]}`;
          badgeLevel = 'SEDANG';
        }

        result.push({
          ...item,
          jmlBulan,
          jmlCatatan,
          bulanTerurut,
          buktiList,
          alasanText,
          badgeLevel,
          statusTindakLanjut: tindakLanjutMap[item.idpel] || 'Belum Ditindaklanjuti',
        });
      }
    });

    // Urutkan dari yang paling banyak bulan menunggaknya, lalu nilai Rupiah tertinggi
    return result.sort((a, b) => {
      if (b.jmlBulan !== a.jmlBulan) return b.jmlBulan - a.jmlBulan;
      if (b.maxLembar !== a.maxLembar) return b.maxLembar - a.maxLembar;
      return b.rptot - a.rptot;
    });
  }, [uploadedFiles, tindakLanjutMap]);

  // Daftar daerah unik untuk dropdown filter mudah
  const daftarDaerah = useMemo(() => {
    const s = new Set(habitualCustomers.map((r) => r.daerah).filter(Boolean));
    return Array.from(s).sort();
  }, [habitualCustomers]);

  const query = (localSearch || globalSearchQuery || '').trim().toLowerCase();

  // Filter data sesuai pilihan pengguna
  const filtered = habitualCustomers.filter((item) => {
    if (filterFrekuensi === 'BERULANG_3_PLUS' && item.jmlBulan < 3) return false;
    if (filterFrekuensi === 'BERULANG_2_PLUS' && item.jmlBulan < 2) return false;
    if (filterFrekuensi === 'LEMBAR_3' && item.maxLembar < 3) return false;
    if (filterFrekuensi === 'LEMBAR_2' && item.maxLembar !== 2) return false;

    if (filterDaerah !== 'ALL' && item.daerah !== filterDaerah) return false;
    if (filterTindakLanjut !== 'ALL' && item.statusTindakLanjut !== filterTindakLanjut) return false;

    if (query) {
      return (
        item.idpel.toLowerCase().includes(query) ||
        item.nama.toLowerCase().includes(query) ||
        item.alamat.toLowerCase().includes(query) ||
        item.daerah.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const [selectedTarget, setSelectedTarget] = useState(null);
  const activeTarget =
    (selectedTarget && filtered.find((x) => x.idpel === selectedTarget.idpel)) ||
    filtered[0] ||
    null;

  const getMapUrl = (cust) => {
    if (!cust) {
      return 'https://maps.google.com/maps?q=Jatinegara,Jakarta+Timur&t=&z=14&ie=UTF8&iwloc=&output=embed';
    }
    if (cust.lat && cust.lng) {
      return `https://maps.google.com/maps?q=${cust.lat},${cust.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
    }
    const q = encodeURIComponent(`${cust.alamat}, ${cust.daerah}, Jakarta Timur`);
    return `https://maps.google.com/maps?q=${q}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  // Fungsi salin bukti menunggak & lokasi map untuk dikirim ke WhatsApp petugas
  const handleCopyBuktiWA = (cust) => {
    if (!cust) return;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      cust.alamat + ' ' + cust.daerah + ' Jakarta Timur'
    )}`;
    let text = `*TARGET TINDAK LANJUT PELANGGAN SERING MENUNGGAK*\n`;
    text += `👤 Nama: *${cust.nama}*\n`;
    text += `🆔 IDPEL: *${cust.idpel}* (${cust.tarif} / ${formatAngka(cust.daya)} VA)\n`;
    text += `📍 Alamat: ${cust.alamat} (${cust.daerah})\n`;
    text += `💰 Tagihan: *${formatRupiah(cust.rptot)}*\n\n`;
    text += `*📌 BUKTI RIWAYAT MENUNGGAK (${cust.jmlBulan} Bulan):*\n`;
    cust.buktiList.forEach((b, i) => {
      text += `${i + 1}. *${b.bulan}* — ${b.kategori} (${formatRupiah(b.rptot)}) [File: ${b.fileName}]\n`;
    });
    text += `\n🗺️ *Link Lokasi Google Maps:*\n${mapLink}`;

    navigator.clipboard.writeText(text);
    setCopiedIdpel(cust.idpel);
    setTimeout(() => setCopiedIdpel(null), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Panduan 3 Langkah Mudah untuk Pemula */}
      <div className="bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/70 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300 font-extrabold text-xs mb-2">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>CARA MUDAH MELACAK PELANGGAN SERING MENUNGGAK (PANDUAN PEMULA):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-cyan-100 dark:border-slate-800">
            <b className="text-cyan-700 dark:text-cyan-400">1. Pilih / Cari Pelanggan:</b> Gunakan tombol filter bulan di bawah atau ketik Nama/IDPEL/Daerah di kotak pencarian.
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-cyan-100 dark:border-slate-800">
            <b className="text-amber-600 dark:text-amber-400">2. Cek Bukti Bulan Menunggak:</b> Lihat lencana bulan pada kolom <b>&quot;Bukti Bulan Menunggak&quot;</b> untuk mengetahui di bulan apa saja dia terlambat bayar.
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-cyan-100 dark:border-slate-800">
            <b className="text-emerald-600 dark:text-emerald-400">3. Klik &quot;Lihat Bukti &amp; Map&quot;:</b> Klik pelanggan untuk melihat rincian file Excel per bulan, peta rumah pelanggan, atau salin ke WA.
          </div>
        </div>
      </div>

      {/* Kotak Pencarian Besar & Filter Mudah */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-amber-500" />
              <span>Filter & Pencarian Cepat Pelanggan Sering Menunggak</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan <b>{formatAngka(filtered.length)} pelanggan</b> dengan bukti riwayat menunggak yang jelas.
            </p>
          </div>

          <button
            onClick={() => exportToExcel(filtered, 'Bukti_Langganan_Menunggak_PLN.xlsx')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Rekap Excel</span>
          </button>
        </div>

        {/* Baris 1: Tombol Filter Berapa Kali Menunggak */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Filter Kriteria:</span>
          {[
            { id: 'BERULANG_2_PLUS', label: '🔥 Nunggak di 2+ Bulan Berbeda' },
            { id: 'BERULANG_3_PLUS', label: '🚨 Kritis: Nunggak di 3+ Bulan Berbeda' },
            { id: 'LEMBAR_3', label: '📄 Nunggak 3 Lembar (3 Bulan)' },
            { id: 'LEMBAR_2', label: '📄 Nunggak 2 Lembar (2 Bulan)' },
            { id: 'ALL', label: 'Tampilkan Semua' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterFrekuensi(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterFrekuensi === btn.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Baris 2: Pencarian Nama/IDPEL + Filter Daerah + Status Tindak Lanjut */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Kotak Cari Nama / IDPEL */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Ketik IDPEL / Nama / Jalan di sini..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border-2 border-cyan-500/40 focus:border-cyan-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          {/* Filter Daerah */}
          <select
            value={filterDaerah}
            onChange={(e) => setFilterDaerah(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">📍 Semua Lingkup Daerah ({daftarDaerah.length} Wilayah)</option>
            {daftarDaerah.map((d) => (
              <option key={d} value={d}>
                📍 Daerah: {d}
              </option>
            ))}
          </select>

          {/* Filter Status Tindak Lanjut */}
          <select
            value={filterTindakLanjut}
            onChange={(e) => setFilterTindakLanjut(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">📋 Semua Status Tindak Lanjut</option>
            <option value="Belum Ditindaklanjuti">⏳ Belum Ditindaklanjuti</option>
            <option value="Surat Peringatan / WA">📨 Sudah Dikirim WA / Peringatan</option>
            <option value="Janji Bayar">🤝 Janji Bayar</option>
            <option value="Eksekusi Shuntrip / Bongkar">⚡ Eksekusi Shuntrip / Bongkar</option>
          </select>
        </div>
      </div>

      {/* Layout Utama: Daftar Pelanggan & Bukti Singkat (Kiri) + Rincian Bukti File & Map (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* KIRI (7 Kolom): Tabel Pelanggan & Bukti Bulan Menunggak */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <span className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-200">
              Daftar Pelanggan ({formatAngka(filtered.length)} Ditemukan)
            </span>
            <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              Klik pelanggan untuk melihat bukti detail & peta di kanan 👉
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[620px] overflow-y-auto">
            {filtered.slice(0, 120).map((item, idx) => {
              const isSelected = activeTarget?.idpel === item.idpel;
              return (
                <div
                  key={item.idpel}
                  onClick={() => setSelectedTarget(item)}
                  className={`p-4 transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-50/90 dark:bg-cyan-950/50 border-l-4 border-l-cyan-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-200">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase">
                          {item.nama}
                        </h4>
                        <span className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                          ({item.idpel})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        📍 {item.alamat} — <b className="text-indigo-600 dark:text-indigo-400">{item.daerah}</b>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        {formatRupiah(item.rptot)}
                      </p>
                      <p className="text-[10px] font-bold text-amber-600">
                        {item.tarif} / {formatAngka(item.daya)} VA • {item.jenisMeter}
                      </p>
                    </div>
                  </div>

                  {/* KOTAK BUKTI KENAPA DISEBUT SERING MENUNGGAK */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60">
                    <p className="text-[11px] font-extrabold text-amber-900 dark:text-amber-200">
                      📌 Bukti: {item.alasanText}
                    </p>
                    {/* Deretan Badge Bulan secara berurutan */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.buktiList.map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-700 dark:text-slate-200 shadow-2xs"
                        >
                          <b className="text-cyan-700 dark:text-cyan-300">{b.bulan.split(' ')[0]}:</b> {b.kategori}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Baris Aksi Bawah */}
                  <div
                    className="mt-2.5 flex flex-wrap items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">Tindak Lanjut:</span>
                      <select
                        value={item.statusTindakLanjut}
                        onChange={(e) => onUpdateTindakLanjut(item.idpel, e.target.value)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <option value="Belum Ditindaklanjuti">⏳ Belum Ditindaklanjuti</option>
                        <option value="Surat Peringatan / WA">📨 Sudah Dikirim WA / SP</option>
                        <option value="Janji Bayar">🤝 Janji Bayar</option>
                        <option value="Eksekusi Shuntrip / Bongkar">⚡ Eksekusi Shuntrip / Bongkar</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setSelectedTarget(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Lihat Bukti &amp; Lacak Map</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KANAN (5 Kolom): Kartu Bukti Riwayat Per Bulan + Peta Google Maps */}
        <div className="lg:col-span-5 space-y-4">
          {activeTarget ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 sticky top-4">
              {/* Judul Target Pelanggan */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    BUKTI &amp; LOKASI PELANGGAN ({activeTarget.jmlBulan} BULAN MENUNGGAK)
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                    {activeTarget.nama} ({activeTarget.idpel})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {activeTarget.alamat} — <b>{activeTarget.daerah}</b>
                  </p>
                </div>

                <button
                  onClick={() => handleCopyBuktiWA(activeTarget)}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedIdpel === activeTarget.idpel ? 'Tersalin!' : 'Salin ke WA'}</span>
                </button>
              </div>

              {/* TABEL BUKTI RIWAYAT MENUNGGAK PER BULAN & FILE EXCEL */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-white mb-2">
                  <FileSearch className="w-4 h-4 text-cyan-600" />
                  <span>Rincian Bukti Bulan Apa Saja Dia Menunggak:</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[10px]">
                        <th className="py-1.5 px-2">Bulan</th>
                        <th className="py-1.5 px-2">Jenis Tunggakan</th>
                        <th className="py-1.5 px-2">Tagihan</th>
                        <th className="py-1.5 px-2">Bukti File Excel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                      {activeTarget.buktiList.map((b, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 px-2 font-extrabold text-cyan-700 dark:text-cyan-300">
                            {b.bulan}
                          </td>
                          <td className="py-1.5 px-2 font-bold text-amber-700 dark:text-amber-300">
                            {b.kategori}
                          </td>
                          <td className="py-1.5 px-2 font-bold text-rose-600 dark:text-rose-400">
                            {formatRupiah(b.rptot)}
                          </td>
                          <td className="py-1.5 px-2 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                            📄 {b.fileName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PETA INTERAKTIF LANGSUNG */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    🗺️ Peta Lokasi Pelanggan:
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      activeTarget.alamat + ' ' + activeTarget.daerah + ' Jakarta Timur'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Rute di Google Maps Penuh
                  </a>
                </div>
                <div className="w-full h-[290px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <iframe
                    title="Peta Lacak Pelanggan"
                    src={getMapUrl(activeTarget)}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Tombol Tandai Lunas */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Status: <b>{activeTarget.statusTindakLanjut}</b>
                </span>
                {!activeTarget.statusLunas ? (
                  <button
                    onClick={() =>
                      onMarkAsLunas(activeTarget.idpel, activeTarget.category, 'Shuntrip')
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    ✓ Tandai Sudah Lunas
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Sudah Lunas
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              Pilih salah satu pelanggan di sebelah kiri untuk melihat tabel bukti bulan menunggak dan peta lokasinya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}