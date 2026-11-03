import express from 'express';
import type { ViteDevServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export async function registerServerRoutes(app: express.Express, vite?: ViteDevServer) {
  // API router for server-side Gemini AI proxy
  const router = express.Router();
  router.use(express.json());

  router.post('/gemini-insights', async (req, res) => {
    try {
      const { leads, issues, assets } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(400).json({ error: 'Gemini API key not configured on server.' });
      }

      // Calculate statistics for context
      const totalLeads = leads?.length || 0;
      const inProgressCount = leads?.filter((l: any) => l.status === 'in_progress').length || 0;
      const pendingReviewCount = leads?.filter((l: any) => l.status === 'submission' || l.status === 'review').length || 0;
      const revisionCount = leads?.filter((l: any) => l.status === 'follow_up').length || 0;
      const closedCount = leads?.filter((l: any) => l.status === 'closed').length || 0;
      const openIssuesCount = issues?.filter((i: any) => i.status === 'open').length || 0;

      const activeAssets = assets?.filter((a: any) => a.status === 'Beroperasi').length || 0;
      const availableAssets = assets?.filter((a: any) => a.status === 'Tersedia').length || 0;
      const maintenanceAssets = assets?.filter((a: any) => a.status === 'Perawatan' || a.status === 'Inspeksi').length || 0;

      const promptText = `
Anda adalah Principal AI Logistics Consultant untuk PT Niaga Segara Trasindo (Sistem IsoTrack).
Analisis data operasional isotank berikut secara tajam, profesional, dan dapat ditindaklanjuti (actionable):

Data Ringkasan Operasional:
- Total Lead Pengiriman: ${totalLeads}
- Lead Dalam Perjalanan (In Progress): ${inProgressCount}
- Lead Menunggu Review/Approval: ${pendingReviewCount}
- Lead Dalam Tahap Revisi (Follow-up): ${revisionCount}
- Lead Ditutup (Closed): ${closedCount}
- Kendala Terbuka (Open Issues): ${openIssuesCount}
- Status Isotank: Beroperasi (${activeAssets}), Tersedia (${availableAssets}), Perawatan/Inspeksi (${maintenanceAssets})

Detail Lead Aktif:
${leads?.map((l: any) => `- SJ: ${l.no_surat_jalan} | Rute: ${l.asal} -> ${l.tujuan} | Muatan: ${l.muatan} | Tahap: ${l.current_step}/8 (${l.status}) | Revisi: ${l.total_revisions}`).join('\n') || ''}

Berikan keluaran dalam format JSON yang valid:
{
  "executiveSummary": "Naratif ringkasan eksekutif 2-3 paragraf berbahasa Indonesia yang sangat profesional dan mendalam.",
  "bottlenecks": ["Titik kemacetan 1", "Titik kemacetan 2", "Titik kemacetan 3"],
  "recommendations": [
    { "title": "Judul Rekomendasi 1", "desc": "Deskripsi aksi konkret", "priority": "tinggi" },
    { "title": "Judul Rekomendasi 2", "desc": "Deskripsi aksi konkret", "priority": "sedang" },
    { "title": "Judul Rekomendasi 3", "desc": "Deskripsi aksi konkret", "priority": "rendah" }
  ]
}
      `;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          executiveSummary: parsed.executiveSummary || 'Analisis operasional berhasil digenerate oleh Gemini AI.',
          bottlenecks: parsed.bottlenecks || [],
          recommendations: parsed.recommendations || [],
          isAiGenerated: true,
        });
      } else {
        return res.status(500).json({ error: 'Empty response from Gemini model.' });
      }
    } catch (error: any) {
      console.error('Server Gemini AI Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error during Gemini analysis.' });
    }
  });

  app.use('/api', router);
}
