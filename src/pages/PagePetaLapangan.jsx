import React, { useState } from 'react';
import { formatRupiah, formatAngka } from '../utils/formatters';
import { MapPinned, Search, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function PagePetaLapangan({ datasets, globalSearchQuery, onMarkAsLunas }) {
  const [localSearch, setLocalSearch] = useState(globalSearchQuery || '');
  const allCustomers = [
    ...datasets.tiga_lembar,
    ...datasets.dua_lembar,
    ...datasets.belum_lunas,
  ];

  const activeQuery = (localSearch || globalSearchQuery || '').trim().toLowerCase();

  const filteredList = allCustomers
    .filter((r) => {
      if (!activeQuery) return true;
      return (
        r.idpel.toLowerCase().includes(activeQuery) ||
        r.nama.toLowerCase().includes(activeQuery) ||
        r.alamat.toLowerCase().includes(activeQuery) ||
        r.daerah.toLowerCase().includes(activeQuery)
      );
    })
    .slice(0, 40);

  const [selectedCustomer, setSelectedCustomer] = useState(filteredList[0] || null);
  const currentTarget = selectedCustomer || filteredList[0];

  const getMapEmbedUrl = (cust) => {
    if (!cust) return 'https://maps.google.com/maps?q=Jatinegara,Jakarta+Timur&t=&z=14&ie=UTF8&iwloc=&output=embed';
    if (cust.lat && cust.lng) {
      return `https://maps.google.com/maps?q=${cust.lat},${cust.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
    }
    const query = encodeURIComponent(`${cust.alamat}, ${cust.daerah}, Jakarta Timur`);
    return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="space-y-4">
      {/* Bar Pencarian Peta Langsung */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
            <MapPinned className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              Pencarian Lokasi & Peta Pelanggan Langsung (Live Maps)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ketik IDPEL, Nama, atau Alamat pelanggan—peta lokasi akan langsung muncul di layar kanan.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              setSelectedCustomer(null);
            }}
            placeholder="Ketik IDPEL / Nama / Jalan untuk lihat Map..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Layout Kiri (Daftar Pelanggan) & Kanan (Peta Interaktif) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Hasil Pencarian */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 max-h-[540px] overflow-y-auto space-y-2.5">
          <p className="text-xs font-bold text-slate-400 uppercase px-1">
            Pilih Pelanggan ({filteredList.length} ditampilkan)
          </p>
          {filteredList.map((item) => {
            const isSelected = currentTarget?.idpel === item.idpel;
            return (
              <div
                key={`${item.category}-${item.idpel}`}
                onClick={() => setSelectedCustomer(item)}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                    {item.nama}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.tarif}/{formatAngka(item.daya)} VA
                  </span>
                </div>
                <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                  IDPEL: {item.idpel} • {item.daerah}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  📍 {item.alamat}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    {formatRupiah(item.rptot)}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    Lihat di Peta →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tampilan Peta Langsung */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          {currentTarget ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    LOKASI TARGET PELANGGAN
                  </span>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                    {currentTarget.nama} ({currentTarget.idpel})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    📍 {currentTarget.alamat} — <b>{currentTarget.daerah}</b>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!currentTarget.statusLunas ? (
                    <button
                      onClick={() => onMarkAsLunas(currentTarget.idpel, currentTarget.category, 'Shuntrip')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Tandai Lunas
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Sudah Lunas
                    </span>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      currentTarget.alamat + ' Jakarta Timur'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Rute Navigasi
                  </a>
                </div>
              </div>

              <div className="w-full h-[420px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <iframe
                  title="Peta Lokasi Pelanggan PLN"
                  src={getMapEmbedUrl(currentTarget)}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </>
          ) : (
            <div className="h-[460px] flex items-center justify-center text-slate-400 text-xs">
              Ketik atau pilih pelanggan di sebelah kiri untuk menampilkan peta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}