# IsoTrack — PT Niaga Segara Trasindo
> **Sistem Manajemen Transaksional Logistik Chemical & Gas Industri Terpadu (8-Tahap Internal, Sub-Tahap Lapangan, & Portal Tracking Klien)**

---

## 📌 1. PERAN DAN IZIN AKSES (RBAC)

Aplikasi mengimplementasikan kontrol akses berbasis peran (*Role-Based Access Control*) dengan satu sumber kebenaran data (`ROLE_PERMISSIONS` dalam `src/types/index.ts`):

| Peran | Hak Akses Utama | Tanggung Jawab Operasional |
| :--- | :--- | :--- |
| **Karyawan (Sales/Ops)** | Create Lead, View Reports, Manage Own Leads | Membuat lead transaksi baru, melengkapi surat jalan, mengunggah bukti pemuatan & BASTP, serta menindaklanjuti revisi pada Tahap 6. |
| **Manager Operasional** | Approve Lead (Stage 2 & 7), View Reports | Otorisasi awal kelayakan rute, pengawasan batas SLA, dan kelulusan approval final sebelum penutupan arsip. |
| **Reviewer / QC** | Review & Verification (Stage 5), Request Revision | Memeriksa kelengkapan berkas fisik BASTP, menguji keabsahan dokumen, dan meminta revisi dengan alasan wajib jika ditemukan kendala. |
| **Operasional Lapangan** | Manage Field Sub-Stages | Mencatat real-time 5 sub-tahap kejadian fisik armada & isotank di depo/pelabuhan/pelayaran dengan tombol 1-ketuk mobile-friendly. |
| **Admin System** | Master Data, User Management, Full Audit, Security Settings | Mengendalikan konfigurasi tanpa-kode (tipe isotank, daftar PIC, kriteria penutupan, SLA koridor, pemetaan klien), manajemen akun, & audit trail. |

---

## 🔄 2. ALUR KINERJA INTERNAL (8-TAHAP STATE MACHINE)

Setiap transaksi lead wajib melewati alur 8-tahap transaksional secara berurutan. Transisi tidak valid ditolak oleh logika `isValidTransition()` dalam `src/utils/stateMachine.ts`:

```
[1. Lead Created] ➔ [2. Lead Approval] ➔ [3. In Progress] ➔ [4. Submission for Review]
                                                                        │
                                                                        ▼
[8. Closed / Done] ◄─ [7. Final Approval] ◄─ [6. Follow-up & Issue] ◄─ [5. Review & Verification]
```

1. **Stage 1 — Lead Created**: Pendaftaran transaksi awal, pengisian surat jalan, unit isotank, dan dokumen transporter.
2. **Stage 2 — Lead Approval**: Verifikasi kelayakan rute dan persetujuan Manager Operasional.
3. **Stage 3 — In Progress**: Pelaksanaan pemuatan (*loading*) dan pengangkutan armada di jalan.
4. **Stage 4 — Submission for Review**: Pengajuan berkas pengiriman oleh Karyawan PIC untuk diperiksa.
5. **Stage 5 — Review & Verification**: Pengujian kelengkapan dokumen BASTP oleh Reviewer QA/QC.
6. **Stage 6 — Follow-up & Issue Resolution**: Penanganan revisi/perbaikan oleh Karyawan PIC bila ditemukan kendala pada Stage 5.
7. **Stage 7 — Final Approval**: Verifikasi akhir oleh Manager sebelum penutupan transaksi.
8. **Stage 8 — Closed / Done**: Transaksi selesai 100%, terkunci *read-only*, dan masuk arsip permanen.

---

## 🚛 3. SUB-TAHAP OPERASIONAL LAPANGAN (SESI 7)

Lapisan pencatatan kejadian fisik di lapangan yang berjalan beriringan tanpa mengubah alur 8-tahap internal:

1. **Persiapan Isotank (Cleaning & PTI)** — SLA: 4 Jam (Pemeriksaan valve, segel, dan sertifikat pembersihan).
2. **Pengiriman ke Pelabuhan / Depo Muat** — SLA: 6 Jam (Mobilisasi armada truk tangki).
3. **Proses di Pelabuhan (Gate-In & Clearance)** — SLA: 8 Jam (Penimbangan, gate-in, & dokumen kepabeanan).
4. **Pelayaran / Transportasi Laut** — SLA: 48 Jam (Pengangkutan via kapal kargo/Ro-Ro penyeberangan).
5. **Tiba di Tujuan / Serah Terima & BASTP** — SLA: 6 Jam (Serah terima di lokasi penerima & penandatanganan BASTP).

*Aturan Konsistensi Berurutan*: Sub-tahap $N$ tidak dapat diselesaikan sebelum sub-tahap $N-1$ selesai. Catatan lapangan disimpan dalam bidang `internalNotes` dan **tidak pernah dikirim ke portal klien**.

---

## 🌐 4. PEMETAAN TAHAP KLIEN (MANY-TO-ONE) & KEAMANAN LINK

Aturan pemetaan pemicu status internal ke 8 tahap tampilan publik klien:

| Ordo | Label Tampilan Klien | Pemicu Status Internal / Lapangan | Keterangan & Privasi |
| :---: | :--- | :--- | :--- |
| **1** | Pesanan Diterima & Dijadwalkan | `lead_created`, `lead_approval` | Konfirmasi pendaftaran awal |
| **2** | Pemberkasan & Administrasi | `in_progress`, `submission`, `review`, `follow_up` | Teks netral *"Sedang diproses"* (tanpa kata revisi/ditolak) |
| **3** | Persiapan Unit Isotank & PTI | Sub-tahap Lapangan 1 (`Persiapan isotank`) | Inspeksi teknik depo |
| **4** | Pengiriman ke Pelabuhan / Depo | Sub-tahap Lapangan 2 (`Pengiriman ke pelabuhan`) | Perjalanan darat armada |
| **5** | Handling & Port Clearance | Sub-tahap Lapangan 3 (`Proses di pelabuhan`) | Gate-in & clearance |
| **6** | Pelayaran / Mobilisasi Laut | Sub-tahap Lapangan 4 (`Pelayaran`) | Penyeberangan kapal kargo |
| **7** | Tiba di Tujuan & Serah Terima | Sub-tahap Lapangan 5 (`Tiba di tujuan`) | Pemeriksaan segel & BASTP |
| **8** | Layanan Selesai (Closed) | `final_approval`, `closed` | Layanan tuntas 100% |

### 🔒 Arsitektur Link & Token Klien:
- **Generasi Token**: `crypto.getRandomValues(16 byte)` $\rightarrow$ **Base64URL 128-bit (~22 karakter)** acak tanpa ID internal.
- **Rute Publik Mandiri**: `/t/<token>` (tanpa login, tanpa sidebar/menu internal).
- **Progres Monotonik**: Tahap aktif klien memperhitungkan `highestReachedStageOrder` sehingga **tidak pernah mundur** di UI publik jika ada revisi internal.
- **Whitelist Filtering**: Menyaring ketat payload. *Catatan internal, nilai kontrak, nama reviewer, dan alasan penolakan 100% dibuang*.
- **SEO & Privacy**: Menggunakan tag `<meta name="robots" content="noindex, nofollow">` & `referrer-policy: no-referrer`.

---

## ⏱️ 5. ATURAN SLA DAN REKOMENDASI OTOMATIS

- **Baseline SLA Koridor**: Rute Darat Jawa-Bali Default **48 Jam**; Rute Laut Antarpulau Default **120 Jam**.
- **Indikator Urgensi SLA**:
  - `Normal`: Sisa waktu > 12 jam.
  - `Hampir Jatuh Tempo`: Sisa waktu $\le 12$ jam (Badge Amber).
  - `Terlambat SLA`: Waktu aktual melebihi target SLA (Badge Rose Beranimasi).
- **Rekomendasi Berbasis Aturan Transparan**:
  - Lead tertahan di suatu tahap $> N$ hari $\rightarrow$ Usulan eskalasi ke Manager.
  - Beban kerja PIC $> 1.5\times$ rata-rata tim $\rightarrow$ Usulan redistribusi lead.
  - Lead tanpa aktivitas $> N$ hari $\rightarrow$ Usulan peninjauan kembali.

---

## 🎨 6. DESIGN TOKENS & SKALA DESAIN

- **Skala Warna**:
  - *Netral*: Slate-950 (Background Utama), Slate-900 (Panel Card), Slate-800 (Border & Divider), Slate-100 (Teks Utama).
  - *Primer / Aksensuasi*: Teal-500 (`#14b8a6`), Cyan-500 (`#06b6d4`).
  - *Status*: Emerald-500 (Sukses), Amber-400 (Peringatan/Proses), Rose-500 (Bahaya/Terlambat), Purple-500 (Review).
- **Skala Spacing**: 4px, 8px, 12px, 16px, 24px, 32px (`p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`).
- **Radius**: `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px).
- **Bayangan**: `shadow-sm` (Chip/Badge), `shadow-xl`/`shadow-2xl` (Modal & Panel Utama).
- **Tipografi**: `font-sans` (system-ui, -apple-system, Segoe UI, sans-serif), `font-mono` dengan `tabular-nums` untuk angka & ID.
- **Transisi**: Animasi terbatas pada `transform` dan `opacity` (spring damping 1.0, 0.2s–0.3s).

---

## 🔌 7. CARA MENYAMBUNGKAN BACKEND (PRODUCTION BACKEND INTEGRATION GUIDE)

Aplikasi dirancang dengan **Centralized Data Access Layer** (`AppContext.tsx` & `clientTracking.ts`) sehingga penyambungan ke database backend nyata dapat dilakukan tanpa merombak komponen UI:

### Langkah Integrasi Firebase Firestore / Supabase:
1. **Autentikasi (Firebase Auth / Supabase Auth)**:
   Ganti state `currentUser` di `AppContext.tsx` dengan pemicu status autentikasi JWT token dari server.
2. **Koleksi Firestore / Tabel Supabase**:
   - `leads`: Menyimpan data transaksi utama.
   - `publicTracking`: Document ID = `token` (Menyimpan payload tersaring *Whitelist Only* untuk akses tanpa login).
   - `auditLogs`: Append-only collection (Aturan keamanan: `allow create: if true; allow update, delete: if false;`).
3. **Firestore Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Public Tracking Document Read Rule
       match /publicTracking/{token} {
         allow get: if true; // Baca 1 dokumen berdasarkan Token
         allow list, write: if false; // Tolak list/query/tulis dari publik
       }
       // Lead Internal Read/Write Rule
       match /leads/{leadId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

---

## 🛠️ 8. DAFTAR UTANG TEKNIS DAN PRIORITAS PENGEMBANGAN (MAX 10)

| No | Komponen / Area | Deskripsi Utang Teknis | Dampak & Alasan Prioritas |
| :---: | :--- | :--- | :--- |
| **1** | **Server-Side Security** | Data persisten saat ini disimpan di `localStorage` klien SPA. | **Tinggi**: Memerlukan penyambungan Firestore/Supabase RLS untuk menjamin keamanan di tingkat database. |
| **2** | **Google Workspace OAuth 1P** | Autentikasi Google saat ini berupa simulasi login akun Google SSO. | **Sedang**: Siap dipasang via tool `set_up_oauth` bila integrasi Drive/Gmail diaktifkan. |
| **3** | **Real-Time WebSockets** | Pembaruan status antar-pengguna menggunakan re-render React state. | **Sedang**: Cocok ditingkatkan ke Firestore Realtime Snapshot / Socket.io untuk kolaborasi multi-user. |
| **4** | **PWA Service Worker Cache** | Manifest PWA telah disiapkan, namun Service Worker *offline fallback* belum didaftarkan. | **Sedang**: Berguna untuk staf lapangan saat area *blind-spot* sinyal seluler. |
| **5** | **Dynamic OCR Surat Jalan** | Pengunggahan dokumen surat jalan saat ini berbasis file PDF/Foto manual. | **Rendah**: Ekstraksi teks otomatis nomor surat jalan via OCR API dapat mempercepat pembuatan lead. |
| **6** | **Automated Rate Limiting** | Rate limit rute publik `/t/` saat ini disimulasikan di memori frontend. | **Rendah**: Memerlukan Cloudflare / Express `express-rate-limit` saat backend API dinyalakan. |
| **7** | **Push Notification Browser** | Notifikasi saat ini berupa in-app bell & toast. | **Rendah**: Mendorong pembaruan instan ke HP supir/staf lapangan via Web Push API. |
| **8** | **Gantt Chart Timeline** | Tampilan jadwal kapal kargo & rute darat berupa tabel & list. | **Rendah**: Visualisasi Gantt chart akan memperjelas overlapping jadwal armada isotank. |
| **9** | **Integrasi GPS Telematika** | Posisi posisi armada saat ini merupakan data catatan teks manual. | **Rendah**: Integrasi API GPS OBD2 truk dapat memperbarui koordinat posisi secara otomatis. |
| **10** | **Multi-Language (EN/ID)** | UI disesuaikan dengan bahasa Indonesia bisnis logistik. | **Rendah**: Struktur `language` state telah ada untuk ekspansi ekspor eksternal. |

---

## 🏁 KESIMPULAN VERIFIKASI AKHIR

- **Kompilasi TypeScript (`compile_applet`)**: **LULUS (Build Succeeded)**
- **Kualitas Kode (`lint_applet`)**: **LULUS (0 Lint Error)**
- **Regresi Alur 8-Tahap & Sub-Tahap Operasional**: **LULUS**
- **Keamanan Data Publik & Token Base64URL 128-bit**: **LULUS**
