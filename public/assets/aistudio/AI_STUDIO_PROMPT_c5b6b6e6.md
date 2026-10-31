# Prompt Build untuk Google AI Studio – IsoTrack

Tempel seluruh isi file ini ke Google AI Studio (mode Build). Lampirkan juga `index.html` sebagai referensi tampilan.

## Peran
Anda adalah senior full-stack engineer dan UI designer. Bangun web app **IsoTrack**: monitoring aset isotank dan aktivitas karyawan PT Niaga Segara Trasindo.

## Stack
React + TypeScript + Vite, Tailwind CSS, Recharts, lucide-react. Data demo disimpan di state/localStorage. Rekomendasi AI opsional memakai Gemini API (kunci dari environment, jangan hardcode).


## PRINSIP UTAMA (prioritas tertinggi)
Ini adalah aplikasi **transaksional end-to-end**, bukan sekadar monitoring. Lead **dibuat oleh karyawan** dan didorong sampai Closed lewat aksi nyata tiap peran. Dasbor, laporan, dan rekomendasi dihitung dari data transaksi tersebut.

## Matriks Transisi Status
| Tahap saat ini | Aksi | Pelaku | Tahap berikutnya | Syarat |
|---|---|---|---|---|
| 1 Lead Created | Ajukan ke Approval | Karyawan pembuat | 2 Approval | field wajib lengkap |
| 2 Approval | Setujui / Tolak | Manager | 3 In Progress / kembali ke 1 | komentar wajib saat tolak |
| 3 In Progress | Update progres, unggah bukti, Submit for Review | Karyawan pembuat | 4 Submission | minimal 1 bukti (surat jalan) |
| 4 Submission | Mulai Review | Reviewer | 5 Review | - |
| 5 Review | Review OK / Minta Perbaikan | Reviewer | 7 Final Approval / 6 Follow-up | komentar wajib saat minta perbaikan, revisi +1 |
| 6 Follow-up | Revisi, unggah ulang, Ajukan Ulang | Karyawan pembuat | 4 Submission | komentar wajib |
| 7 Final Approval | Finalize / Kembalikan | Manager | 8 Closed / 6 Follow-up | komentar wajib saat kembalikan |
| 8 Closed | read-only, diarsipkan | - | - | - |

Setiap transisi menulis AuditLog (append-only). Halaman "Tugas Saya" menampilkan lead yang menunggu aksi pengguna. Karyawan hanya melihat lead miliknya; manager, reviewer, dan admin melihat semua. Sediakan form Buat Lead (No. SJ otomatis, ID isotank, asal, tujuan, muatan, target tiba, manager) dan switcher peran untuk demo.

## Definisi Tahap dari Client
1. Lead Created: karyawan membuat lead dan mengisi informasi awal.
2. Lead Approval: manager memeriksa kelayakan, ruang lingkup, penanggung jawab (PIC), dan target. Manager dapat menetapkan ulang PIC dan target. Checklist 4 butir wajib dicentang sebelum Setujui.
3. In Progress: karyawan (PIC) melaksanakan pekerjaan, memperbarui progres, mengunggah bukti, dan dapat melaporkan kendala.
4. Submission for Review: karyawan mengajukan hasil beserta bukti (minimal 1 bukti, semua kendala terselesaikan).
5. Review and Verification: manager atau reviewer memeriksa kelengkapan, kebenaran, dan kesesuaian hasil (checklist 3 butir wajib untuk Review OK).
6. Follow-up and Issue Resolution: karyawan menangani revisi atau kendala jika ada, lalu mengajukan ulang.
7. Final Approval: manager menyetujui berdasarkan kriteria penutupan (bukti terverifikasi, tidak ada kendala terbuka, kriteria terpenuhi).
8. Done / Closed: sistem mencatat penutupan dan menyimpan arsip final (ringkasan siklus, bukti, revisi, kendala, ketepatan waktu) yang read-only.

Entitas tambahan: Issue(id, lead_id, deskripsi, pelapor, status, resolved_at) dan ClosureArchive(lead_id, closed_at, closed_by, ringkasan).

## Alur 8 Tahap
Lead Created → Approval → In Progress → Submission → Review → Follow-up → Final Approval → Closed. Reject pada Approval mengembalikan ke pembuat. Follow-up berulang ke Submission sampai tidak ada isu. Closed bersifat read-only.

## Peran Pengguna (RBAC)
- Karyawan: buat/edit lead sendiri, update progres, unggah bukti.
- Manager: lihat semua lead, approve/reject awal dan final, minta revisi.
- Reviewer: periksa kelengkapan bukti, beri komentar/request change.
- Admin: CRUD penuh, kelola pengguna dan konfigurasi.

## Model Data
User(id, name, role, email) · Asset(id, code, type, capacity) · Lead(id, no_surat_jalan, asset_id, creator_id, manager_id, asal, tujuan, muatan, target_at, status, created_at, updated_at) · Evidence(id, lead_id, file_type, file_path, uploaded_at) · Comment(id, lead_id, user_id, message, created_at) · AuditLog(id, user_id, action, entity, at) append-only.

## Halaman
1. **Dasbor**: KPI card (total lead, on-time %, waktu siklus, revisi %), pipeline 8 tahap, donut status, rekomendasi teratas.
2. **Daftar Lead**: filter status/tanggal/PIC, detail lead, timeline, komentar, lampiran, tombol aksi sesuai peran.
3. **Form**: Lead baru, Progress Update, Submission (unggah PDF/foto).
4. **Laporan**: ringkasan naratif, tabel produktivitas per karyawan, ekspor CSV dan cetak PDF.
5. **Rekomendasi**: insight berbasis aturan (lead melewati SLA, bottleneck tahap, revisi tinggi per PIC, isotank idle, on-time di bawah target). Tambahkan tombol "Analisis dengan Gemini" yang mengirim ringkasan KPI dan menampilkan saran tindakan.
6. **Admin**: pengguna, peran, parameter SLA, retensi data.

## KPI
Waktu siklus, waktu persetujuan, on-time delivery, revision rate, utilisasi isotank, produktivitas karyawan.

## Desain
Navy `#0b1f3a`, aksen teal `#0ea5a4`, biru `#2563eb`; status hijau/kuning/merah. Kartu rounded 14px, sidebar gelap, tipografi system sans, mendukung mode terang dan gelap, responsif mobile-first, kontras WCAG AA.

## Keamanan
Validasi input, hindari XSS, role guard di setiap aksi, audit log setiap perubahan status.

## Keluaran
Aplikasi berjalan lengkap dengan 15 data contoh realistis (rute Tuban, Gresik, Surabaya, Semarang, Jakarta, Malang), seluruh teks antarmuka berbahasa Indonesia.

## Kebutuhan Tambahan (wajib)
- **Bukti per tahap:** setiap tahap punya bukti sendiri. Unggah foto (kompres otomatis ke maks 1000 px) atau dokumen (PDF, DOC, XLS) dengan jenis bukti (Surat Jalan, Foto Muatan, Foto Bongkar Muat, Laporan Kerja, Dokumen Lain). Submit dan Ajukan Ulang wajib punya minimal 1 bukti pada tahap tersebut. Halaman detail menampilkan "Jejak Tahap dan Bukti Selesai": status tiap tahap, waktu selesai, pengguna, nomor log, dan thumbnail bukti.
- **Log sistem:** setiap input (lead, progres, bukti, kendala, komentar, perubahan status) menyimpan tanggal, jam (detik), nomor log (LOG-0001 dan seterusnya), nama dan peran pengguna. Tampilkan di setiap entri, plus jam sistem live di header.
- **Periode:** setiap menu (Dasbor, Tugas Saya, Daftar Lead, Laporan, Rekomendasi, Log Sistem) punya filter periode dengan input kalender popup (date picker, Dari dan Sampai) serta tombol cepat 30 hari, 90 hari, Semua.
- **Jenis laporan:** Ringkasan Eksekutif, Produktivitas Karyawan, Ketepatan Waktu (SLA), Utilisasi Isotank, Revisi dan Kendala, Rekap Bukti per Tahap, Audit Trail Sistem. Semua bisa dicetak/PDF dan diekspor CSV.
- **Daftar Lead:** tombol filter tahap bernama singkat: 1 Baru, 2 Approval, 3 Proses, 4 Ajukan, 5 Review, 6 Revisi, 7 Final, 8 Selesai (plus Semua), lengkap dengan jumlah, pencarian, kartu lead berisi progress bar dan sisa waktu.
- **Layout:** pas di layar tanpa scroll horizontal di desktop maupun HP (grid responsif, tabel membungkus teks).
- **Validasi:** No. Surat Jalan unik; satu isotank tidak boleh dipakai dua lead aktif.
- **Tema:** 4 warna aksen (Teal, Langit, Zamrud, Ambar) dan mode terang/gelap.
- Implementasikan juga seluruh item di `ROADMAP.md` yang bertanda aktif, dan siapkan struktur untuk yang masih usulan.
