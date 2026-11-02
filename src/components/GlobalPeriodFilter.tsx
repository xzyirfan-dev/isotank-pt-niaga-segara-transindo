import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DatePreset } from '../types';

export const GlobalPeriodFilter: React.FC = () => {
  const { periodFilter, setPeriodFilter } = useApp();
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
    if (periodFilter.preset === 'all') return 'Semua Data Riwayat';
    if (periodFilter.preset === 'month_this') return 'Oktober 2026';
    if (periodFilter.preset === 'month_prev') return 'September 2026';
    if (periodFilter.preset === 'quarter_4') return 'Kuartal IV (Okt-Des 2026)';
    if (periodFilter.preset === 'year_2026') return 'Tahun Buku 2026';
    if (periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate) {
      return `${periodFilter.startDate} s/d ${periodFilter.endDate}`;
    }
    return 'Oktober 2026';
  };

  return (
    <>
      {/* Sleek, Transparent, Borderless Global Filter Bar */}
      <div className="bg-slate-900/40 border border-transparent rounded-2xl p-3 flex items-center justify-between gap-3 text-xs mb-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-2.5 text-slate-200 font-bold">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-transparent flex items-center justify-center text-teal-300">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-200 font-bold">Filter Periode Analisis</span>
              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-transparent text-[11px] font-mono font-bold">
                {getActiveLabel()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal block">
              Menampilkan data transaksi & laporan sesuai rentang waktu aktif.
            </span>
          </div>
        </div>

        {/* Clean 'Pilih by Kalender' Trigger Button */}
        <button
          type="button"
          onClick={() => setShowCustomPicker(true)}
          className="px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-2 bg-slate-950/60 text-slate-100 hover:bg-slate-900 border border-transparent transition-all shadow-sm active:scale-95"
        >
          <Calendar className="w-5 h-5 text-white" />
          <span>Pilih by Kalender</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Non-clipping High Z-Index Backdrop Modal for Calendar Picker */}
      {showCustomPicker && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl text-xs relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-teal-500/30 text-white flex items-center justify-center shadow-inner">
                  <Calendar className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Pilih Rentang Kalender</h3>
                  <p className="text-[10px] text-slate-400">Atur periode transaksi berdasarkan tanggal atau preset cepat</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Inside Modal */}
            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-400 font-semibold">Preset Periode Cepat:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreset('month_this')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                    periodFilter.preset === 'month_this'
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Okt 2026
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('month_prev')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                    periodFilter.preset === 'month_prev'
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Sep 2026
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('quarter_4')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                    periodFilter.preset === 'quarter_4'
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Q4 2026
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('year_2026')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                    periodFilter.preset === 'year_2026'
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Tahun 2026
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('all')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all col-span-2 ${
                    periodFilter.preset === 'all'
                      ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Semua Riwayat Data
                </button>
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-[11px] text-slate-400 font-semibold">Atur Rentang Tanggal Custom:</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCustomPicker(false)}
                className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={applyCustomDates}
                className="px-4 py-2 text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Terapkan Kalender</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
