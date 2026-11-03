import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DatePreset } from '../types';

export const GlobalPeriodFilter: React.FC = () => {
  const { periodFilter, setPeriodFilter, activeView } = useApp();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(periodFilter.startDate || '2026-10-01');
  const [customEnd, setCustomEnd] = useState(periodFilter.endDate || '2026-10-31');

  const setPreset = (preset: DatePreset) => {
    let start = '';
    let end = '';

    if (preset === 'month_this') {
      start = '2026-10-01';
      end = '2026-10-31';
    } else if (preset === 'month_prev') {
      start = '2026-09-01';
      end = '2026-09-30';
    } else if (preset === 'quarter_4') {
      start = '2026-10-01';
      end = '2026-12-31';
    } else if (preset === 'year_2026') {
      start = '2026-01-01';
      end = '2026-12-31';
    }

    setPeriodFilter(prev => ({
      ...prev,
      preset,
      startDate: start,
      endDate: end,
    }));
    setShowCustomPicker(false);
  };

  const applyCustomDates = () => {
    if (customStart && customEnd) {
      setPeriodFilter({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
      setShowCustomPicker(false);
    }
  };

  const getActiveLabel = () => {
    if (periodFilter.preset === 'all') return 'All Historical Data';
    if (periodFilter.preset === 'month_this') return 'January 2026 - May 2026';
    if (periodFilter.preset === 'month_prev') return 'September 2026';
    if (periodFilter.preset === 'quarter_4') return 'Q4 (Oct - Dec 2026)';
    if (periodFilter.preset === 'year_2026') return 'Full Year 2026';
    if (periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate) {
      return `${periodFilter.startDate} - ${periodFilter.endDate}`;
    }
    return 'January 2026 - May 2026';
  };

  const getViewDetails = () => {
    switch (activeView) {
      case 'dashboard':
      case 'new_lead':
        return {
          title: 'Dashboard',
          subtitle: 'An airy way to manage sales with care and precision.',
        };
      case 'my_tasks':
        return {
          title: 'Tugas & Antrean PIC',
          subtitle: 'Daftar penugasan, verifikasi dokumen, dan tindak lanjut transaksi aktif.',
        };
      case 'leads':
        return {
          title: 'Transaksi Lead & Muatan',
          subtitle: 'Pemantauan komprehensif alur 8-tahap pengiriman isotank.',
        };
      case 'reports':
        return {
          title: 'Laporan & Statistik',
          subtitle: 'Analisis tonase, performa SLA, utilisasi depo, dan nilai kontrak.',
        };
      case 'ai_recommendations':
        return {
          title: 'Rekomendasi Cerdas AI',
          subtitle: 'Deteksi dini bottleneck armada, efisiensi rute, dan mitigasi risiko logistik.',
        };
      case 'system_log':
        return {
          title: 'Log Sistem & Audit Trail',
          subtitle: 'Rekam jejak transaksi, kepatuhan segel kontainer, dan keamanan data.',
        };
      case 'admin':
      case 'employee_control':
        return {
          title: 'Pengaturan & Master Data',
          subtitle: 'Konfigurasi akun personil, armada isotank, dan tarif rute.',
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'An airy way to manage sales with care and precision.',
        };
    }
  };

  const viewInfo = getViewDetails();

  return (
    <>
      {/* Siohioma Style Top Title & Period Dropdown Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {viewInfo.title}
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
            {viewInfo.subtitle}
          </p>
        </div>

        {/* Clean Siohioma Style Date Range Pill Dropdown */}
        <button
          type="button"
          onClick={() => setShowCustomPicker(true)}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all shadow-sm active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
          <span>{getActiveLabel()}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Non-clipping High Z-Index Modal for Calendar Picker */}
      {showCustomPicker && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-xs relative text-gray-900 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-[#bef264]/20 text-[#0a1c13] dark:text-[#bef264] flex items-center justify-center">
                  <Calendar className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Pilih Rentang Waktu</h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400">Filter transaksi berdasarkan periode atau tanggal tertentu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomPicker(false)}
                className="w-7 h-7 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Preset Cepat:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreset('month_this')}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    periodFilter.preset === 'month_this'
                      ? 'bg-[#0a1c13] text-[#bef264] shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Jan 2026 - Mei 2026
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('quarter_4')}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    periodFilter.preset === 'quarter_4'
                      ? 'bg-[#0a1c13] text-[#bef264] shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Kuartal IV (Okt-Des)
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('year_2026')}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    periodFilter.preset === 'year_2026'
                      ? 'bg-[#0a1c13] text-[#bef264] shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Tahun Buku 2026
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('all')}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    periodFilter.preset === 'all'
                      ? 'bg-[#0a1c13] text-[#bef264] shadow-sm'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Semua Riwayat
                </button>
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <label className="block text-[11px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Rentang Kustom:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1 font-medium">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#bef264] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 dark:text-slate-400 mb-1 font-medium">Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono focus:border-[#bef264] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 text-xs bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-full transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={applyCustomDates}
                className="px-5 py-2 text-xs bg-[#0a1c13] hover:bg-[#142c1f] dark:bg-[#bef264] dark:hover:bg-[#a3e635] text-white dark:text-[#0a1c13] font-black rounded-full shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Terapkan</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
