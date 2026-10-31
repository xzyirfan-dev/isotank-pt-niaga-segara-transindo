import React, { useState } from 'react';
import { Calendar, Filter, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DatePreset } from '../types';

export const GlobalPeriodFilter: React.FC = () => {
  const { periodFilter, setPeriodFilter } = useApp();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(periodFilter.startDate || '');
  const [customEnd, setCustomEnd] = useState(periodFilter.endDate || '');

  const setPreset = (preset: DatePreset) => {
    setPeriodFilter(prev => ({
      ...prev,
      preset,
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
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs mb-6">
      <div className="flex items-center space-x-2 text-slate-300 font-semibold">
        <Filter className="w-4 h-4 text-teal-400" />
        <span>Periode Waktu Operasional:</span>
      </div>

      <div className="flex items-center space-x-1.5 flex-wrap">
        <button
          onClick={() => setPreset('30d')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            periodFilter.preset === '30d'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          30 Hari Terakhir
        </button>

        <button
          onClick={() => setPreset('90d')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            periodFilter.preset === '90d'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          90 Hari Terakhir
        </button>

        <button
          onClick={() => setPreset('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            periodFilter.preset === 'all'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Semua Riwayat
        </button>

        {/* Custom Date Picker Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition-all ${
              periodFilter.preset === 'custom'
                ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {periodFilter.preset === 'custom' && periodFilter.startDate && periodFilter.endDate
                ? `${periodFilter.startDate} s/d ${periodFilter.endDate}`
                : 'Pilih Tanggal'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showCustomPicker && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-50">
              <div className="text-xs font-bold text-slate-200 mb-3 border-b border-slate-800 pb-2">
                Filter Kalender Kustom
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Dari Tanggal:</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Sampai Tanggal:</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={applyCustomDates}
                  className="px-3 py-1.5 text-xs bg-teal-500 text-slate-950 font-bold rounded-lg hover:bg-teal-400"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
