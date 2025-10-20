// --- Mengambil Elemen HTML ---
const videoUploader = document.getElementById('video-uploader');
const fileNameDisplay = document.getElementById('file-name-display');
const videoPlayerOriginal = document.getElementById('video-player-original');
const videoPlayerResult = document.getElementById('video-player-result');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const trimButton = document.getElementById('trim-button');
const downloadButton = document.getElementById('download-button');
const logOutput = document.getElementById('log-output');

const loader = trimButton.querySelector('.loader');
const trimButtonIcon = trimButton.querySelector('.button-icon');
const trimButtonText = trimButton.querySelector('span');

const editStep = document.getElementById('edit-step');
const resultStep = document.getElementById('result-step');
const logSection = document.getElementById('log-section');

// Mengambil Elemen Baru untuk Progress Bar
const loaderContainer = document.getElementById('loader-container');
const loaderStatus = document.getElementById('loader-status');
const progressBarInner = document.getElementById('progress-bar-inner');

let videoFile = null;

// --- Fungsi Helper ---
function log(message) {
    logOutput.innerHTML += message + '\n';
    logOutput.scrollTop = logOutput.scrollHeight;
}

function showLoader() {
    loader.style.display = 'block';
    trimButtonIcon.style.display = 'none';
    trimButtonText.textContent = 'Memproses...';
    trimButton.disabled = true;
}

function hideLoader() {
    loader.style.display = 'none';
    trimButtonIcon.style.display = 'block';
    trimButtonText.textContent = 'Potong Video Sekarang';
    trimButton.disabled = false;
}

// --- Inisialisasi FFmpeg dengan Progress Handler ---
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: true,
    logger: ({ message }) => { log(message); },
    progress: (p) => {
        const progress = (p.ratio * 100).toFixed(0);
        progressBarInner.style.width = `${progress}%`;
        loaderStatus.textContent = `Mengunduh mesin... ${progress}%`;
    },
});

// --- Logika Utama ---
async function loadFFmpeg() {
    try {
        log('Mulai memuat FFmpeg...');
        await ffmpeg.load();
        log('✅ FFmpeg siap digunakan!');
        // Sembunyikan loader jika berhasil
        loaderContainer.style.display = 'none';

    } catch (error) {
        log('❌ Gagal memuat FFmpeg. Coba muat ulang halaman dengan koneksi internet yang lebih baik.');
        loaderStatus.textContent = 'Gagal memuat mesin editor. Mohon muat ulang halaman.';
        // Beri warna merah jika gagal
        progressBarInner.style.backgroundColor = '#e74c3c';
        console.error(error);
    }
}

// Panggil fungsi load saat halaman pertama kali dibuka
loadFFmpeg();

videoUploader.addEventListener('change', (event) => {
    videoFile = event.target.files[0];
    if (videoFile) {
        videoPlayerOriginal.onerror = () => {
            alert(`Error: Browser tidak dapat memutar video ini. Kemungkinan format atau codec tidak didukung.`);
            console.error("Video player error:", videoPlayerOriginal.error);
        };
        const fileURL = URL.createObjectURL(videoFile);
        videoPlayerOriginal.src = fileURL;
        fileNameDisplay.textContent = `File: ${videoFile.name}`;

        editStep.style.display = 'block';
        logSection.style.display = 'block';
        resultStep.style.display = 'none';
        log(`Video "${videoFile.name}" dipilih.`);
    }
});

trimButton.addEventListener('click', async () => {
    if (!videoFile) {
        alert('Silakan pilih file video terlebih dahulu!');
        return;
    }
    if (!ffmpeg.isLoaded()) {
        alert('FFmpeg belum siap. Coba muat ulang halaman.');
        return;
    }

    showLoader();
    logOutput.innerHTML = '';
    log('Proses pemotongan dimulai...');

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (parseFloat(startTime) >= parseFloat(endTime)) {
        alert('Waktu mulai harus lebih kecil dari waktu selesai!');
        hideLoader();
        return;
    }

    try {
        ffmpeg.FS('writeFile', videoFile.name, await fetchFile(videoFile));
        await ffmpeg.run('-i', videoFile.name, '-ss', startTime, '-to', endTime, '-c', 'copy', 'output.mp4');
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const resultURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

        videoPlayerResult.src = resultURL;
        downloadButton.href = resultURL;
        resultStep.style.display = 'block';
        log('Proses pemotongan berhasil! 🎉');

    } catch (error) Caching Cerdas dengan Service Worker (Solusi Terbaik)
        log('Terjadi kesalahan saat memproses:');
        log(error);
        alert('Gagal memproses video. Cek log untuk detail.');
    } finally {
        hideLoader();
    }
});
