// --- GANTI URL INI DENGAN URL BACKEND ANDA (DARI RENDER ATAU RAILWAY) ---
const BACKEND_URL = 'magistory-backend-production.up.railway.app/process-video'; 
// Contoh: 'https://magistory-backend.onrender.com/process-video'
// Contoh: 'https://magistory-backend-production-xxxx.up.railway.app/process-video'


// --- Mengambil Elemen HTML ---
const videoUploader = document.getElementById('video-uploader');
const fileNameDisplay = document.getElementById('file-name-display');
const videoPlayerOriginal = document.getElementById('video-player-original');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const trimButton = document.getElementById('trim-button');
const logOutput = document.getElementById('log-output');

const loader = trimButton.querySelector('.loader');
const trimButtonIcon = trimButton.querySelector('.button-icon');
const trimButtonText = trimButton.querySelector('span');

const editStep = document.getElementById('edit-step');
const resultStep = document.getElementById('result-step');
const logSection = document.getElementById('log-section');
const downloadButton = document.getElementById('download-button'); // Meski tidak dipakai untuk menampilkan, elemennya masih ada

let videoFile = null;

// --- Fungsi Helper ---
function log(message) {
    logOutput.innerHTML += message + '\n';
    logOutput.scrollTop = logOutput.scrollHeight;
}

function showLoader(message = 'Memproses...') {
    loader.style.display = 'block';
    trimButtonIcon.style.display = 'none';
    trimButtonText.textContent = message;
    trimButton.disabled = true;
}

function hideLoader() {
    loader.style.display = 'none';
    trimButtonIcon.style.display = 'block';
    trimButtonText.textContent = 'Potong Video Sekarang';
    trimButton.disabled = false;
}

// --- Logika Utama ---
videoUploader.addEventListener('change', (event) => {
    videoFile = event.target.files[0];
    if (videoFile) {
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

    showLoader('Mengunggah & Memproses...');
    logOutput.innerHTML = '';
    log('Mempersiapkan data untuk dikirim ke server...');

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);

    log('Mengirim video ke server... Ini mungkin butuh waktu tergantung koneksi Anda.');
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server merespon dengan error: ${errorText}`);
        }

        log('Server selesai memproses. Mengunduh hasil...');
        const videoBlob = await response.blob();
        
        // Membuat link sementara untuk memicu download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(videoBlob);
        a.download = `magistory-trimmed-${videoFile.name}`;
        document.body.appendChild(a);

        log('Download akan dimulai...');
        a.click();
        
        // Membersihkan link sementara setelah di-klik
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        
        log('Proses selesai! 🎉 Cek file hasil download Anda.');

    } catch (error) {
        log('Terjadi kesalahan: ' + error.message);
        console.error(error);
        alert('Gagal berkomunikasi dengan server. Cek log untuk detail.');
    } finally {
        hideLoader();
    }
});
