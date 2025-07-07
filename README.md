LensTrack Pro
Deskripsi Proyek
LensTrack Pro adalah aplikasi web yang dirancang untuk menyederhanakan manajemen klien, proyek, dan komunikasi tim dalam satu platform yang terintegrasi. Dibangun dengan Firebase Studio, aplikasi ini menyediakan solusi komprehensif bagi tim untuk melacak proyek aktif, mengelola informasi klien, dan mencatat semua komunikasi penting melalui fitur "Comm. Logs". Dengan dashboard interaktif, LensTrack Pro membantu Anda tetap terorganisir dan efisien, memastikan tidak ada detail yang terlewat.

Fitur Utama:
Dashboard Interaktif: Dapatkan gambaran umum yang jelas tentang status proyek, klien, dan aktivitas terbaru.

Manajemen Klien: Simpan dan kelola informasi detail klien dengan mudah.

Proyek Aktif: Lacak kemajuan proyek, tenggat waktu, dan tugas yang terkait.

Catatan Komunikasi (Comm. Logs): Dokumentasikan semua interaksi dan keputusan penting dengan klien atau tim.

Akses Berbasis Cloud: Akses data Anda kapan saja, di mana saja, berkat integrasi Firebase.

Instalasi
Untuk menjalankan LensTrack Pro secara lokal atau menyebarkannya:

Kloning Repositori:

git clone https://github.com/your-username/lenstrack-pro.git
cd lenstrack-pro

Inisialisasi Firebase:
LensTrack Pro dibangun di atas Firebase. Anda perlu menyiapkan proyek Firebase Anda sendiri.

Kunjungi Firebase Console.

Buat proyek baru.

Daftarkan aplikasi web baru di proyek Anda. Anda akan mendapatkan objek konfigurasi Firebase (misalnya, firebaseConfig).

Konfigurasi Lingkungan:

Buat file .env di root direktori proyek Anda.

Tambahkan variabel lingkungan Firebase Anda ke file .env ini:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

Pastikan untuk mengaktifkan Firestore Database dan Authentication di proyek Firebase Anda.

Instal Dependensi:

npm install
# atau
yarn install

Jalankan Aplikasi:

npm run dev
# atau
yarn dev

Aplikasi akan berjalan di http://localhost:5173 (atau port lain yang tersedia).

Cara Penggunaan
Setelah aplikasi berjalan, Anda dapat:

Login/Daftar: Gunakan sistem autentikasi Firebase untuk masuk atau membuat akun baru.

Dashboard: Jelajahi dashboard untuk melihat ringkasan proyek dan klien Anda.

Manajemen Klien:

Navigasi ke bagian "Klien".

Tambahkan klien baru dengan detail kontak dan informasi relevan lainnya.

Edit atau hapus data klien yang sudah ada.

Manajemen Proyek:

Buka bagian "Proyek".

Buat proyek baru, kaitkan dengan klien yang sudah ada, dan tetapkan status atau tenggat waktu.

Perbarui status proyek saat kemajuan dicapai.

Catatan Komunikasi (Comm. Logs):

Di dalam detail klien atau proyek, tambahkan catatan komunikasi baru.

Catat tanggal, waktu, partisipan, dan ringkasan diskusi.

Teknologi yang Digunakan
Frontend: HTML, CSS (Tailwind CSS), JavaScript

Framework/Library: React.js

Backend & Database: Google Firebase (Firestore, Authentication)

Styling: Tailwind CSS

Lisensi
Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file LICENSE untuk detail lebih lanjut.

Catatan: Pastikan Anda telah menginstal Node.js dan npm/yarn di sistem Anda sebelum memulai.
