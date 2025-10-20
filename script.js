// --- Inisialisasi FFmpeg (Sama seperti sebelumnya) ---
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
    log: true,
    logger: ({ message }) => {
        log(message);
    },
});

// --- Mengambil Elemen HTML Baru ---
const videoUploader = document.getElementById('video-uploader');
const fileNameDisplay = document.getElementById('file-name-display');
const videoPlayerOriginal = document.getElementById('video-player-original');
const videoPlayerResult = document.getElementById('video-player-result');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const trimButton = document.getElementById('trim-button');
const downloadButton = document.getElementById('download-button');
const logOutput = document.getElementById('log-output');

// Mengambil elemen Loader dan Ikon di dalam tombol
const loader = trimButton.querySelector('.loader');
const trimButtonIcon = trimButton.querySelector('.button-icon');
const trimButtonText = trimButton.querySelector('span');

// Mengambil elemen Section/Card
const editStep = document.getElementById('edit-step');
const resultStep = document.getElementById('result-step');
const logSection = document.getElementById('log-section');

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

// --- Logika Utama ---
async function loadFFmpeg() {
    try {
        await ffmpeg.load();
        log('FFmpeg siap digunakan!');
    } catch (error) {
        log('Gagal memuat FFmpeg. Coba muat ulang halaman.');
        console.error(error);
    }
}

loadFFmpeg();

videoUploader.addEventListener('change', (event) => {
    videoFile = event.target.files[0];
    if (videoFile) {
        const fileURL = URL.createObjectURL(videoFile);
        videoPlayerOriginal.src = fileURL;
        fileNameDisplay.textContent = `File: ${videoFile.name}`;
        
        // Tampilkan langkah berikutnya
        editStep.style.display = 'block';
        logSection.style.display = 'block';
        resultStep.style.display = 'none'; // Sembunyikan hasil lama jika ada
        log(`Video "${videoFile.name}" dipilih.`);
    }
});

trimButton.addEventListener('click', async () => {
    if (!videoFile) {
        alert('Silakan pilih file video terlebih dahulu!');
        return;
    }
    if (!ffmpeg.isLoaded()) {
        alert('FFmpeg belum siap, mohon tunggu.');
        return;
    }

    showLoader();
    logOutput.innerHTML = ''; // Bersihkan log
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

        log(`Menjalankan perintah: -i "${videoFile.name}" -ss ${startTime} -to ${endTime} -c copy output.mp4`);
        await ffmpeg.run('-i', videoFile.name, '-ss', startTime, '-to', endTime, '-c', 'copy', 'output.mp4');

        const data = ffmpeg.FS('readFile', 'output.mp4');
        const resultURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
        
        videoPlayerResult.src = resultURL;
        downloadButton.href = resultURL;

        resultStep.style.display = 'block'; // Tampilkan kartu hasil
        log('Proses pemotongan berhasil! 🎉');

    } catch (error) {
        log('Terjadi kesalahan saat memproses:');
        log(error);
        alert('Gagal memproses video. Cek log untuk detail.');
    } finally {
        hideLoader();
    }
});
