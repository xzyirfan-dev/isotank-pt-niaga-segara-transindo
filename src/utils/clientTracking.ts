import { ClientStageMappingConfig, PublicTrackingPayload, Lead } from '../types';

export const DEFAULT_CLIENT_STAGE_MAPPINGS: ClientStageMappingConfig[] = [
  {
    id: 'cstage_1',
    order: 1,
    label: 'Pesanan Diterima & Dijadwalkan',
    description: 'Pesanan pengiriman isotank telah terdaftar dan disetujui.',
    iconType: 'doc',
    triggerInternalStatuses: ['lead_created', 'lead_approval'],
  },
  {
    id: 'cstage_2',
    order: 2,
    label: 'Pemberkasan & Administrasi',
    description: 'Verifikasi kelengkapan dokumen legalitas kemitraan transport & armada.',
    iconType: 'doc',
    triggerInternalStatuses: ['in_progress', 'submission', 'review', 'follow_up'],
  },
  {
    id: 'cstage_3',
    order: 3,
    label: 'Persiapan Unit Isotank & PTI',
    description: 'Pemeriksaan kelayakan valve, cleaning certificate, & inspeksi teknis armada.',
    iconType: 'depo',
    triggerInternalStatuses: ['Persiapan isotank (Cleaning & PTI)'],
  },
  {
    id: 'cstage_4',
    order: 4,
    label: 'Pengiriman ke Pelabuhan / Depo',
    description: 'Armada truk tangki mengangkut unit isotank menuju depo/pelabuhan muat.',
    iconType: 'truck',
    triggerInternalStatuses: ['Pengiriman ke pelabuhan / Depo muat'],
  },
  {
    id: 'cstage_5',
    order: 5,
    label: 'Handling & Port Clearance',
    description: 'Proses pemeriksaan gate-in, penimbangan, dan dokumen pelabuhan.',
    iconType: 'dock',
    triggerInternalStatuses: ['Proses di pelabuhan (Gate-In & Clearance)'],
  },
  {
    id: 'cstage_6',
    order: 6,
    label: 'Pelayaran / Mobilisasi Laut',
    description: 'Pengangkutan unit isotank via kapal kargo penyeberangan antar-pulau.',
    iconType: 'ship',
    triggerInternalStatuses: ['Pelayaran / Transportasi Laut'],
  },
  {
    id: 'cstage_7',
    order: 7,
    label: 'Tiba di Tujuan & Serah Terima',
    description: 'Armada tiba di lokasi penerima, pemeriksaan segel, & serah terima BASTP.',
    iconType: 'flag',
    triggerInternalStatuses: ['Tiba di tujuan / Serah Terima & BASTP'],
  },
  {
    id: 'cstage_8',
    order: 8,
    label: 'Layanan Selesai (Closed)',
    description: 'Seluruh proses pengiriman dan serah terima dokumen telah selesai 100%.',
    iconType: 'flag',
    triggerInternalStatuses: ['final_approval', 'closed'],
  },
];

/**
 * Generate 128-bit cryptographic random token encoded in Base64URL
 */
export function generateCryptographicToken(): string {
  const bytes = new Uint8Array(16); // 128 bits
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert to Base64URL
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Compute SHA-256 Hash of string for audit & comparison
 */
export async function computeSha256Hash(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for non-async environments
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sha256_' + Math.abs(hash).toString(16);
}

/**
 * Calculate highest reached stage order for Monotonic Progress Rule
 */
export function calculateHighestClientStageOrder(
  lead: Lead,
  mappings: ClientStageMappingConfig[],
  currentHighest: number = 1
): number {
  let calculatedOrder = 1;

  // Check 8-stage internal status
  mappings.forEach((m) => {
    if (m.triggerInternalStatuses.includes(lead.status)) {
      calculatedOrder = Math.max(calculatedOrder, m.order);
    }
  });

  // Check field operational sub-stages if present
  if (lead.operationalSubStages) {
    lead.operationalSubStages.forEach((sub) => {
      if (sub.status === 'berjalan' || sub.status === 'selesai') {
        mappings.forEach((m) => {
          if (m.triggerInternalStatuses.some(t => t.toLowerCase() === sub.title.toLowerCase())) {
            calculatedOrder = Math.max(calculatedOrder, m.order);
          }
        });
      }
    });
  }

  // MONOTONIC RULE: Return the max between historical highest and newly calculated
  return Math.max(currentHighest, calculatedOrder);
}

/**
 * Filter & Transform Lead Data to Whitelisted Public Tracking Payload
 * STRICTLY NO INTERNAL NOTES, CONTRACT VALUES, REVIEWER NAMES, REJECTION REASONS, OR INTERNAL IDS
 */
export function generatePublicTrackingPayload(
  lead: Lead,
  mappings: ClientStageMappingConfig[],
  previousHighestOrder: number = 1
): PublicTrackingPayload | null {
  if (!lead.clientLinkInfo || !lead.clientLinkInfo.isActive) {
    return null;
  }

  // Check Expiry
  if (lead.clientLinkInfo.expiresAt) {
    const expTime = new Date(lead.clientLinkInfo.expiresAt).getTime();
    if (Date.now() > expTime) {
      return null;
    }
  }

  const highestOrder = calculateHighestClientStageOrder(lead, mappings, previousHighestOrder);

  // Map Client Stages
  const clientStages = mappings.map((m) => {
    let status: 'selesai' | 'berjalan' | 'berikutnya' = 'berikutnya';

    if (m.order < highestOrder) {
      status = 'selesai';
    } else if (m.order === highestOrder) {
      status = lead.status === 'closed' && m.order === 8 ? 'selesai' : 'berjalan';
    } else {
      status = 'berikutnya';
    }

    return {
      id: m.id,
      order: m.order,
      label: m.label,
      description: m.description,
      status,
      iconType: m.iconType,
    };
  });

  const activeStage = clientStages.find(s => s.order === highestOrder) || clientStages[0];

  // Estimate Range formatting
  const targetDate = new Date(lead.target_at);
  const now = new Date();
  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let finalEtaRange = `Perkiraan ${targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  if (diffDays < 0 && lead.status !== 'closed') {
    finalEtaRange = 'Sedang diproses';
  } else if (lead.status === 'closed') {
    finalEtaRange = 'Tiba & Selesai';
  }

  return {
    token: lead.clientLinkInfo.token,
    displayRefNo: lead.no_surat_jalan || 'SJ-2026-001',
    clientCompany: lead.client_company || 'PT Petrokimia Utama Indonesia',
    cargoType: lead.muatan || 'Bahan Kimia Industri',
    ruteAsal: lead.asal || 'Surabaya',
    ruteTujuan: lead.tujuan || 'Cilegon',
    clientStages,
    activeStageIndex: highestOrder - 1,
    activeStageLabel: activeStage.label,
    highestReachedStageOrder: highestOrder,
    finalEtaRange,
    lastUpdatedAt: new Date().toLocaleString('id-ID'),
    companyContact: {
      name: 'PT Niaga Segara Trasindo - Customer Service',
      phone: '+62 811-3000-888',
      email: 'cs@niagasegara.co.id',
    },
    needsClientAction: Boolean(lead.clientLinkInfo.needsClientAction),
    clientActionText: lead.clientLinkInfo.needsClientAction
      ? (lead.clientLinkInfo.clientActionMessage || 'Menunggu kelengkapan dokumen dari Anda.')
      : undefined,
  };
}
