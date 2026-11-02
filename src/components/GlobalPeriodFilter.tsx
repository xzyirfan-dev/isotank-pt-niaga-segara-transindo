import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, Check, Clock } from 'lucide-react';
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs mb-6 shadow-md backdrop-blur-md">
      <div className="flex items-center space-x-2 text-slate-200 font-bold">
        <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Filter className="w-4 h-4" />
        </div>
        <div>
          <span>Filter Periode Analisis:</span>
          <span className="text-[10px] text-slate-400 font-normal block">
            {periodFilter.preset === 'all' && 'Seluruh Riwayat Pengiriman'}
            {periodFilter.preset === 'month_this' && 'Bulan Ini: Oktober 2026'}
            {periodFilter.preset === 'month_prev' && 'Bulan Lalu: September 2026'}
            {periodFilter.preset === 'quarter_4' && 'Kuartal IV: Okt - Des 2026'}
            {periodFilter.preset === 'year_2026' && 'Tahun Buku 2026'}
            {periodFilter.preset === '30d' && '30 Hari Terakhir'}
            {periodFilter.preset === '90d' && '90 Hari Terakhir'}
            {periodFilter.preset === 'custom' && `Kalender: ${periodFilter.startDate} s/d ${periodFilter.endDate}`}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
        <button
          onClick={() => setPreset('month_this')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodFilter.preset === 'month_this'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Okt 2026 (Bulan Ini)
        </button>

        <button
          onClick={() => setPreset('month_prev')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodFilter.preset === 'month_prev'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Sep 2026 (Bulan Lalu)
        </button>

        <button
          onClick={() => setPreset('quarter_4')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodFilter.preset === 'quarter_4'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Q4 2026
        </button>

        <button
          onClick={() => setPreset('year_2026')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodFilter.preset === 'year_2026'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Tahun 2026
        </button>

        <button
          onClick={() => setPreset('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            periodFilter.preset === 'all'
              ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Semua Data
        </button>

        {/* Custom Date Picker Trigger by Calendar */}
        <div className="relative">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
              periodFilter.preset === 'custom'
                ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate
                ? `${periodFilter.startDate} s/d ${periodFilter.endDate}`
                : 'Pilih by Kalender'}
            </span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {showCustomPicker && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span className="font-bold text-slate-100 text-xs">Pilih Rentang Kalender</span>
                </div>
                <span className="text-[10px] text-teal-400 font-mono">Date Range</span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                    Tanggal Mulai (Start Date):
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">
                    Tanggal Selesai (End Date):
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={applyCustomDates}
                  className="px-4 py-1.5 text-xs bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 shadow-md"
                >
                  Terapkan Kalender
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
