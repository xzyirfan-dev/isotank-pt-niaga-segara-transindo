import { Lead, Issue, Asset } from '../types';

/**
 * Service to execute AI analysis via server-side proxy route (/api/gemini-insights)
 * ensuring browser never exposes API keys.
 */
export async function generateGeminiInsights(
  leads: Lead[],
  issues: Issue[],
  assets: Asset[]
): Promise<{
  executiveSummary: string;
  bottlenecks: string[];
  recommendations: { title: string; desc: string; priority: 'tinggi' | 'sedang' | 'rendah' }[];
  isAiGenerated: boolean;
}> {
  try {
    const res = await fetch('/api/gemini-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leads, issues, assets }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Server-side Gemini proxy call failed, falling back to rule-based engine:', err);
  }

  // Calculate statistics for fallback context
  const totalLeads = leads.length;
  const revisionCount = leads.filter(l => l.status === 'follow_up').length;
  const pendingReviewCount = leads.filter(l => l.status === 'submission' || l.status === 'review').length;
  const activeAssets = assets.filter(a => a.status === 'Beroperasi').length;
  const availableAssets = assets.filter(a => a.status === 'Tersedia').length;
  const maintenanceAssets = assets.filter(a => a.status === 'Perawatan' || a.status === 'Inspeksi').length;

  const fallbackBottlenecks: string[] = [];
  if (revisionCount > 0) {
    fallbackBottlenecks.push(`Terdapat ${revisionCount} lead yang tertahan di Tahap 6 (Follow-up / Revisi) akibat stempel/dokumen kurang jelas.`);
  }
  if (pendingReviewCount > 0) {
    fallbackBottlenecks.push(`Terdapat ${pendingReviewCount} pengajuan yang membutuhkan verifikasi Reviewer & Manager.`);
  }
  if (maintenanceAssets > 0) {
    fallbackBottlenecks.push(`${maintenanceAssets} unit Isotank sedang dalam perawatan/inspeksi, mengurangi kapasitas armada siap pakai.`);
  }

  return {
    executiveSummary: `Kinerja operasional PT Niaga Segara Trasindo menunjukkan tingkat aktivitas yang stabil dengan ${totalLeads} lead pengiriman terdaftar. Saat ini ${activeAssets} unit isotank sedang beroperasi penuh melayani rute strategis Jawa dan Sumatra (Tuban, Gresik, Cilegon, Jakarta, Semarang, Medan, Balikpapan).\n\nTingkat ketepatan waktu SLA terjaga di atas 92%, namun perhatian khusus diperlukan pada lead yang memerlukan kelengkapan bukti dokumen agar tahap akhir penutupan (Final Approval & Closed) dapat diselesaikan tanpa hambatan administrasi.`,
    bottlenecks: fallbackBottlenecks.length > 0 ? fallbackBottlenecks : [
      'Proses verifikasi dokumen fisik di gate penerima membutuhkan digitalisasi bukti instan.',
      'Antrean inspeksi tekanan valve isotank di depo Tuban dan Cilegon.'
    ],
    recommendations: [
      {
        title: 'Percepat Respon Verifikasi Dokumen Stage 5',
        desc: 'Tugaskan Reviewer untuk melakukan audit bukti digital dalam kurun 2 jam setelah pengajuan Submission.',
        priority: 'tinggi',
      },
      {
        title: 'Optimasi Perputaran Isotank Idle',
        desc: `Manfaatkan ${availableAssets} unit Isotank berstatus Tersedia untuk rute frekuensi tinggi Tuban - Surabaya.`,
        priority: 'sedang',
      },
      {
        title: 'Standardisasi Foto Bukti Pemuatan',
        desc: 'Wajibkan pengemudi mengunggah minimal 2 foto resolusi jernih dengan segel terpasang untuk menghindari revisi di Tahap 6.',
        priority: 'rendah',
      },
    ],
    isAiGenerated: false,
  };
}
