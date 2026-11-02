/**
 * Security & Masking Utility for IsoTrack (PT Niaga Segara Trasindo)
 * Fase 3: Keamanan Data Lead, Masking Sensitif, Sanitasi Input, dan Validasi Berkas.
 */

/**
 * Masks an email address: budi.santoso@niagasegara.co.id -> b***o@niagasegara.co.id
 */
export const maskEmail = (email?: string): string => {
  if (!email || !email.includes('@')) return '••••••@••••••';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}***${last}@${domain}`;
};

/**
 * Masks a telephone number: 0812-3456-7890 -> 0812-****-7890
 */
export const maskPhone = (phone?: string): string => {
  if (!phone) return '••••-••••-••••';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 8) return '••••-••••-••••';
  const prefix = digitsOnly.slice(0, 4);
  const suffix = digitsOnly.slice(-4);
  return `${prefix}-****-${suffix}`;
};

/**
 * Masks financial/contract value: Rp 185.000.000 -> Rp •••.•••.•••
 */
export const maskCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return 'Rp •••.•••.•••';
  return 'Rp •••.•••.•••';
};

/**
 * Masks company or client name: PT Petrokimia Gresik -> PT Petr••••••
 */
export const maskCompanyName = (name?: string): string => {
  if (!name) return 'PT •••••••••••';
  if (name.length <= 6) return `${name.slice(0, 2)}••••`;
  return `${name.slice(0, 7)}••••••••`;
};

/**
 * Sanitizes user input to prevent XSS (Cross-Site Scripting) and script injection.
 * Strips script tags, onload/onerror hooks, and html tags.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .trim();
};

/**
 * Whitelist for accepted file MIME types and extensions.
 * Strict upload restriction: only PDF and high-res inspection images allowed.
 * Maximum file size: 10 MB.
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Megabytes

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  cleanFileName?: string;
  fileSizeBytes?: number;
}

export const validateUploadedFile = (file: File): FileValidationResult => {
  if (!file) {
    return { valid: false, error: 'Tidak ada berkas yang dipilih.' };
  }

  // 1. Check File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimal 10 MB sesuai standar keamanan ISO 27001.`
    };
  }

  // 2. Check File Extension
  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  if (!hasAllowedExt) {
    return {
      valid: false,
      error: 'Format berkas tidak diizinkan. Hanya dokumen PDF dan gambar (JPG, PNG, WEBP) yang diterima.'
    };
  }

  // 3. Check MIME Type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipe MIME "${file.type}" diblokir oleh filter keamanan sistem IsoTrack.`
    };
  }

  // 4. Sanitize File Name
  const cleanFileName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);

  return {
    valid: true,
    cleanFileName,
    fileSizeBytes: file.size
  };
};
