// Mengambil elemen-elemen dari HTML untuk dimanipulasi
const videoUploader = document.getElementById('video-uploader');
const videoPlayerOriginal = document.getElementById('video-player-original');
const videoPlayerResult = document.getElementById('video-player-result');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const trimButton = document.getElementById('trim-button');
const logOutput = document.getElementById('log-output');

// Mengambil elemen container untuk menyembunyikan/menampilkan
const originalPreviewContainer = document.getElementById('video-preview-original-container');
const editingControls = document.getElementById('editing-controls');
const outputArea = document.getElementById('output-area');
const resultPreviewContainer = document.getElementById('video-preview-result-container');

let videoFile = null; // Variabel untuk menyimpan file video yang diupload

// Inisialisasi FFmpeg
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ 
    log: true, // Mengaktifkan log untuk melihat proses di console
    // Menambahkan fungsi untuk menampilkan log di UI
    logger: ({ message }) => {
        log(message);
    },
});

// Fungsi untuk menampilkan pesan di area log
function log(message) {
    logOutput.innerHTML += message + '\n';
    logOutput.scrollTop = logOutput.scrollHeight; // Auto scroll ke bawah
}

// Fungsi untuk memuat FFmpeg.wasm (ini bisa memakan waktu)
async function loadFFmpeg() {
    log('Memuat FFmpeg-core.js...');
    await ffmpeg.load();
    log('FFmpeg berhasil dimuat!');
    trimButton.disabled = false; // Mengaktifkan tombol setelah FFmpeg siap
}

// Panggil fungsi untuk memuat FFmpeg saat halaman dimuat
loadFFmpeg();

// Event listener ketika pengguna memilih file video
videoUploader.addEventListener('change', (event) => {
    videoFile = event.target.files[0];
    if (videoFile) {
        const fileURL = URL.createObjectURL(videoFile);
        videoPlayerOriginal.src = fileURL;
        originalPreviewContainer.style.display = 'block';
        editingControls.style.display = 'block';
        outputArea.style.display = 'block';
        log(`Video "${videoFile.name}" telah dipilih.`);
    }
});

// Event listener ketika tombol "Potong Video!" diklik
trimButton.addEventListener('click', async () => {
    if (!videoFile) {
        alert('Silakan pilih file video terlebih dahulu!');
        return;
    }
    if (!ffmpeg.isLoaded()) {
        alert('FFmpeg belum siap, mohon tunggu sebentar.');
        return;
    }

    trimButton.disabled = true; // Nonaktifkan tombol selama proses
    trimButton.textContent = 'Memproses...';
    logOutput.innerHTML = ''; // Bersihkan log sebelumnya
    log('Proses pemotongan dimulai...');

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (parseFloat(startTime) >= parseFloat(endTime)) {
        alert('Waktu mulai harus lebih kecil dari waktu akhir!');
        trimButton.disabled = false;
        trimButton.textContent = 'Potong Video!';
        return;
    }

    try {
        // 1. Tulis file video ke memori virtual FFmpeg
        log('Menulis file ke memori virtual FFmpeg...');
        ffmpeg.FS('writeFile', videoFile.name, await fetchFile(videoFile));

        // 2. Jalankan perintah FFmpeg untuk memotong video
        log(`Menjalankan perintah: -i "${videoFile.name}" -ss ${startTime} -to ${endTime} -c copy output.mp4`);
        await ffmpeg.run(
            '-i', videoFile.name,
            '-ss', startTime, // Waktu mulai
            '-to', endTime,   // Waktu akhir
            '-c', 'copy',     // Menyalin codec (sangat cepat, tanpa re-encoding)
            'output.mp4'
        );

        // 3. Baca file hasil (output.mp4) dari memori virtual FFmpeg
        log('Membaca hasil video...');
        const data = ffmpeg.FS('readFile', 'output.mp4');

        // 4. Buat URL dari data biner hasil video dan tampilkan
        const resultURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        videoPlayerResult.src = resultURL;
        resultPreviewContainer.style.display = 'block';
        log('Proses pemotongan berhasil! Video hasil ada di bawah.');

    } catch (error) {
        log('Terjadi kesalahan saat pemrosesan:');
        log(error);
        alert('Gagal memproses video. Cek log untuk detail.');
    } finally {
        // Aktifkan kembali tombol setelah proses selesai (baik berhasil maupun gagal)
        trimButton.disabled = false;
        trimButton.textContent = 'Potong Video!';
    }
});
