import { OperationalSubStageItem } from '../types';

export const createDefaultOperationalSubStages = (currentStep: number = 1): OperationalSubStageItem[] => {
  const isClosed = currentStep >= 8;
  const isAtFinal = currentStep >= 7;
  const isAtReview = currentStep >= 4;
  const isMobilizing = currentStep >= 3;

  return [
    {
      id: `ops-1-${Math.random().toString(36).substring(2, 9)}`,
      stepNumber: 1,
      title: '1. Persiapan Isotank (Cleaning & PTI)',
      status: currentStep >= 2 ? 'selesai' : 'berjalan',
      startTime: '2026-10-28T07:00:00Z',
      endTime: currentStep >= 2 ? '2026-10-28T09:30:00Z' : undefined,
      estimatedEndTime: '2026-10-28T10:00:00Z',
      fieldPic: 'Rian Utomo (Depo Lead)',
      internalNotes: 'Pencucian tangki steril dan pemeriksaan valve tekanan bertekanan tinggi tuntas.',
      attachmentName: 'Sertifikat_Cleaning_PTI.pdf',
    },
    {
      id: `ops-2-${Math.random().toString(36).substring(2, 9)}`,
      stepNumber: 2,
      title: '2. Pengiriman ke Pelabuhan / Depo Muat',
      status: currentStep >= 3 ? 'selesai' : (currentStep === 2 ? 'berjalan' : 'belum'),
      startTime: currentStep >= 2 ? '2026-10-28T10:00:00Z' : undefined,
      endTime: currentStep >= 3 ? '2026-10-28T15:00:00Z' : undefined,
      estimatedEndTime: '2026-10-28T16:00:00Z',
      fieldPic: 'Bambang Susanto (Driver)',
      internalNotes: currentStep >= 3
        ? 'Armada truk telah menyelesaikan perjalanan ke pelabuhan / depo muat.'
        : 'Armada truk dalam perjalanan menuju pelabuhan muat.',
      attachmentName: 'Surat_Jalan_Logistik.pdf',
    },
    {
      id: `ops-3-${Math.random().toString(36).substring(2, 9)}`,
      stepNumber: 3,
      title: '3. Proses di Pelabuhan (Gate-In & Clearance)',
      status: currentStep >= 4 ? 'selesai' : (currentStep === 3 ? 'berjalan' : 'belum'),
      startTime: currentStep >= 3 ? '2026-10-29T08:00:00Z' : undefined,
      endTime: currentStep >= 4 ? '2026-10-29T14:30:00Z' : undefined,
      estimatedEndTime: '2026-10-29T14:00:00Z',
      fieldPic: 'Slamet Riyadi (Port Coordinator)',
      internalNotes: currentStep >= 4
        ? 'Pemeriksaan dokumen hazmat B3 dan gate-in pelabuhan telah selesai disetujui.'
        : 'Pemeriksaan dokumen hazmat B3 dan gate-in pelabuhan sedang berlangsung.',
      attachmentName: 'Manifest_B3_Pelabuhan.pdf',
    },
    {
      id: `ops-4-${Math.random().toString(36).substring(2, 9)}`,
      stepNumber: 4,
      title: '4. Pelayaran / Transportasi Laut',
      status: currentStep >= 5 ? 'selesai' : (currentStep === 4 ? 'berjalan' : 'belum'),
      startTime: currentStep >= 4 ? '2026-10-29T18:00:00Z' : undefined,
      endTime: currentStep >= 5 ? '2026-10-31T06:00:00Z' : undefined,
      estimatedEndTime: '2026-10-31T12:00:00Z',
      fieldPic: 'Capt. Harun (Kapal Kargo)',
      internalNotes: currentStep >= 5
        ? 'Kapal kargo penyeberangan telah tiba dan sandar di pelabuhan tujuan.'
        : 'Kapal kargo dalam jadwal pelayaran / penyeberangan antar-pulau.',
    },
    {
      id: `ops-5-${Math.random().toString(36).substring(2, 9)}`,
      stepNumber: 5,
      title: '5. Tiba di Tujuan / Serah Terima & BASTP',
      status: isClosed ? 'selesai' : (isAtFinal ? 'berjalan' : 'belum'),
      startTime: isAtFinal ? '2026-11-01T08:00:00Z' : undefined,
      endTime: isClosed ? '2026-11-02T10:00:00Z' : undefined,
      estimatedEndTime: '2026-11-02T16:00:00Z',
      fieldPic: 'Ahmad Fauzi (Site Receiver)',
      internalNotes: isClosed
        ? 'Pengecekan akhir di lokasi pabrik klien tuntas, BASTP resmi telah ditandatangani dan diarsipkan.'
        : isAtFinal
        ? 'Isotank telah tiba di lokasi pabrik penerima, proses pembongkaran dan penandatanganan BASTP sedang berlangsung.'
        : 'Menunggu ketibaan isotank di lokasi penerima.',
      attachmentName: isClosed ? 'BASTP_Serah_Terima_Resmi.pdf' : undefined,
    },
  ];
};

/**
 * Synchronize operational sub-stages so that whenever the main transactional stage changes,
 * the operational field sub-stages are strictly logical and never contradictory (e.g. stage 8 finished
 * but sub-stages showing in-progress/pending).
 */
export const syncOperationalSubStages = (
  existingStages: OperationalSubStageItem[] | undefined,
  targetStep: number
): OperationalSubStageItem[] => {
  const baseStages = existingStages && existingStages.length === 5
    ? existingStages
    : createDefaultOperationalSubStages(targetStep);

  return baseStages.map(sub => {
    // When Lead is Closed (Stage 8), ALL 5 operational sub-stages MUST be finished!
    if (targetStep >= 8) {
      return {
        ...sub,
        status: 'selesai',
        endTime: sub.endTime || '2026-11-02T10:00:00Z',
        internalNotes: sub.stepNumber === 5
          ? 'Pengecekan akhir di lokasi pabrik klien tuntas, BASTP resmi telah ditandatangani dan diarsipkan.'
          : sub.internalNotes,
      };
    }

    // When Lead is at Final Approval (Stage 7)
    if (targetStep === 7) {
      if (sub.stepNumber < 5) {
        return { ...sub, status: 'selesai', endTime: sub.endTime || '2026-11-01T14:00:00Z' };
      }
      return {
        ...sub,
        status: sub.status === 'selesai' ? 'selesai' : 'berjalan',
        startTime: sub.startTime || '2026-11-01T15:00:00Z',
      };
    }

    // When Lead is at Review QA (Stage 5) or Revision (Stage 6)
    if (targetStep === 5 || targetStep === 6) {
      if (sub.stepNumber <= 4) {
        return { ...sub, status: 'selesai', endTime: sub.endTime || '2026-10-31T06:00:00Z' };
      }
      return { ...sub, status: sub.status === 'selesai' ? 'selesai' : 'berjalan' };
    }

    // When Lead is at Submission (Stage 4)
    if (targetStep === 4) {
      if (sub.stepNumber <= 3) {
        return { ...sub, status: 'selesai', endTime: sub.endTime || '2026-10-29T14:30:00Z' };
      }
      if (sub.stepNumber === 4) {
        return { ...sub, status: 'selesai' };
      }
      return { ...sub, status: 'berjalan' };
    }

    // When Lead is In Progress (Stage 3)
    if (targetStep === 3) {
      if (sub.stepNumber <= 2) {
        return { ...sub, status: 'selesai', endTime: sub.endTime || '2026-10-28T15:00:00Z' };
      }
      if (sub.stepNumber === 3) {
        return { ...sub, status: 'berjalan', startTime: sub.startTime || '2026-10-29T08:00:00Z' };
      }
      return { ...sub, status: 'belum' };
    }

    // When Lead is Stage 2 (Approval)
    if (targetStep === 2) {
      if (sub.stepNumber === 1) {
        return { ...sub, status: 'selesai', endTime: sub.endTime || '2026-10-28T09:30:00Z' };
      }
      return { ...sub, status: 'belum' };
    }

    // Stage 1
    if (sub.stepNumber === 1) {
      return { ...sub, status: 'berjalan' };
    }
    return { ...sub, status: 'belum' };
  });
};
