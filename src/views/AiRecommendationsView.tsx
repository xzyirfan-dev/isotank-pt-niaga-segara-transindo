import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateGeminiInsights } from '../services/geminiService';

export const AiRecommendationsView: React.FC = () => {
  const { filteredLeads, issues, assets } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<{
    executiveSummary: string;
    bottlenecks: string[];
    recommendations: { title: string; desc: string; priority: 'tinggi' | 'sedang' | 'rendah' }[];
    isAiGenerated: boolean;
  } | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await generateGeminiInsights(filteredLeads, issues, assets);
      setInsights(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [filteredLeads.length]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-teal-500/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] uppercase font-bold tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>POWERED BY GEMINI AI 2.5 FLASH</span>
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center space-x-2">
            <span>Rekomendasi Cerdas Optimasi Operasional & SLA</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analisis preskriptif kecerdasan buatan untuk identifikasi kemacetan alur 8-tahap dan perputaran armada isotank.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Menganalisis dengan Gemini AI...' : 'Analisis dengan Gemini AI'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center space-y-4 bg-slate-900/60 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-bold text-slate-200">Gemini AI Sedang Mengolah Metrik Operasional...</div>
          <p className="text-[11px] text-slate-400">Memeriksa 15 Lead, 15 Unit Isotank, dan Riwayat Log Sistem.</p>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          
          {/* Executive Summary Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Ringkasan Eksekutif Analisis AI</span>
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                insights.isAiGenerated
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {insights.isAiGenerated ? 'Gemini 2.5 Live Model' : 'Rule Engine Fallback'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {insights.executiveSummary}
            </p>
          </div>

          {/* Identified Bottlenecks */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Titik Kemacetan Terdeteksi (Bottlenecks)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.bottlenecks.map((btn, idx) => (
                <div key={`btn-${idx}`} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start space-x-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{btn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Prescriptive Recommendations */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              Rekomendasi Tindakan Preskriptif Prioritas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.recommendations.map((rec) => (
                <div key={rec.title} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition-all shadow-md space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        rec.priority === 'tinggi'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : rec.priority === 'sedang'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      }`}>
                        PRIORITAS {rec.priority.toUpperCase()}
                      </span>
                      <Zap className="w-4 h-4 text-teal-400" />
                    </div>
                    <h4 className="font-bold text-slate-100 text-xs">{rec.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{rec.desc}</p>
                  </div>

                  <button className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 transition-colors">
                    Terapkan Rekomendasi
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
