// --- GANTI URL INI DENGAN URL BACKEND ANDA ---
const BASE_BACKEND_URL = 'https://magistory-backend-production.up.railway.app'; 
// Contoh: 'https://magistory-backend.onrender.com' (TANPA / di akhir)

// --- Elemen "Manual Editing" ---
const videoUploader = document.getElementById('video-uploader');
const fileNameDisplay = document.getElementById('file-name-display');
const videoPlayerOriginal = document.getElementById('video-player-original');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const editStep = document.getElementById('edit-step');
const logSection = document.getElementById('log-section');
const logOutput = document.getElementById('log-output');

// --- Elemen Pexels (Manual) ---
const pexelsSearchInput = document.getElementById('pexels-search-input');
const btnSearchPexels = document.getElementById('btn-search-pexels');
const pexelsResultsGrid = document.getElementById('pexels-results');

// --- Elemen Tombol Potong ---
const trimButton = document.getElementById('trim-button');
const trimLoader = trimButton.querySelector('.loader');
const trimButtonSpan = trimButton.querySelector('span'); // Ambil span untuk teks

let videoFile = null;

// --- Fungsi Helper ---
function log(message) {
    if(logOutput) {
        logSection.style.display = 'block';
        logOutput.innerHTML += message + '\n';
        logOutput.scrollTop = logOutput.scrollHeight;
    }
}

function showTrimLoader(message = 'Memproses...') {
    trimLoader.style.display = 'block';
    if(trimButtonSpan) trimButtonSpan.textContent = message;
    trimButton.disabled = true;
}

function hideTrimLoader() {
    trimLoader.style.display = 'none';
    if(trimButtonSpan) trimButtonSpan.textContent = 'Potong Video Sekarang';
    trimButton.disabled = false;
}

// Fungsi untuk menyiapkan editor setelah file dipilih (baik manual/pexels)
function setupVideoEditor(file) {
    const fileURL = URL.createObjectURL(file);
    videoPlayerOriginal.src = fileURL;
    fileNameDisplay.textContent = `File: ${file.name}`;
    editStep.style.display = 'block';
    logSection.style.display = 'block';
    log(`Video "${file.name}" siap untuk diedit.`);
    editStep.scrollIntoView({ behavior: 'smooth' });
}

// Fungsi untuk mengunduh video Pexels ke browser dan menyiapkannya
async function preparePexelsVideo(videoUrl, fileName) {
    log('Mengunduh video Pexels ke browser... (mungkin butuh waktu)');
    try {
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error('Gagal mengunduh video dari Pexels');
        const videoBlob = await response.blob();
        videoFile = new File([videoBlob], fileName, { type: videoBlob.type });
        setupVideoEditor(videoFile); // Panggil fungsi setup
    } catch (error) {
        log(`Error: ${error.message}`);
        alert('Gagal mengambil video dari Pexels.');
    }
}

// --- Event Listeners ---

// 1. Logika "Manual Editing" - Upload
videoUploader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        videoFile = file;
        setupVideoEditor(videoFile);
    }
});

// 2. Logika "Manual Editing" - Pexels Search
btnSearchPexels.addEventListener('click', async () => {
    const query = pexelsSearchInput.value;
    if (!query) {
        alert('Harap masukkan kata kunci pencarian.');
        return;
    }
    
    log(`Mencari di Pexels: "${query}"...`);
    pexelsResultsGrid.innerHTML = '<p>Mencari...</p>';
    
    try {
        const response = await fetch(`${BASE_BACKEND_URL}/search-pexels?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(await response.text());
        
        const videos = await response.json();
        pexelsResultsGrid.innerHTML = ''; // Kosongkan
        
        videos.forEach(video => {
            const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files.find(f => f.quality === 'sd');
            if (videoFile) {
                const item = document.createElement('div');
                item.className = 'video-result-item';
                item.innerHTML = `<img src="${video.image}" alt="${video.user.name}">`;
                item.addEventListener('click', () => {
                    log(`Memilih video Pexels: ${video.id}`);
                    preparePexelsVideo(videoFile.link, `pexels-video-${video.id}.mp4`);
                });
                pexelsResultsGrid.appendChild(item);
            }
        });

    } catch (error) {
        log(`Error: ${error.message}`);
        alert('Gagal mencari video di Pexels.');
    }
});

// 3. Logika Tombol Potong
trimButton.addEventListener('click', async () => {
    if (!videoFile) {
        alert('Silakan pilih file video terlebih dahulu!');
        return;
    }

    showTrimLoader('Mengunggah & Memproses...');
    logOutput.innerHTML = '';
    log('Mempersiapkan data untuk dikirim ke server...');

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);

    log('Mengirim video ke server... Ini mungkin butuh waktu.');
    
    try {
        const response = await fetch(`${BASE_BACKEND_URL}/process-video`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server merespon dengan error: ${await response.text()}`);
        }

        log('Server selesai memproses. Mengunduh hasil...');
        const videoBlob = await response.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(videoBlob);
        a.download = `magistory-trimmed-${videoFile.name}`;
        document.body.appendChild(a);
        log('Download akan dimulai...');
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        log('Proses selesai! 🎉 Cek file hasil download Anda.');

    } catch (error) {
        log('Terjadi kesalahan: ' + error.message);
    } finally {
        hideTrimLoader();
    }
});
