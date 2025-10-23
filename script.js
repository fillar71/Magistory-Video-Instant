// --- GANTI URL INI DENGAN URL BACKEND ANDA ---
const BASE_BACKEND_URL = 'https://magistory-backend-production.up.railway.app'; 
// Contoh: 'https://magistory-backend.onrender.com' (TANPA / di akhir)

// --- Variabel Global ---
let videoFile = null;

// --- Mengambil Elemen UI Utama ---
const appTitle = document.getElementById('app-title');
const appSubtitle = document.getElementById('app-subtitle');
const mainMenu = document.getElementById('main-menu');
const btnBackToMenu = document.getElementById('btn-back-to-menu');

// --- Elemen Menu ---
const btnShowIdea = document.getElementById('btn-show-idea');
const btnShowManual = document.getElementById('btn-show-manual');

// --- Elemen Section ---
const ideaSection = document.getElementById('idea-to-video-section');
const manualSection = document.getElementById('manual-editing-section');

// --- Elemen "Idea to Video" ---
const ideaInput = document.getElementById('idea-input');
const btnGenerateIdea = document.getElementById('btn-generate-idea');
const ideaResultsContainer = document.getElementById('idea-results-container');
const ideaResultsGrid = document.getElementById('idea-results');

// --- Elemen "Manual Editing" ---
const videoUploader = document.getElementById('video-uploader');
const fileNameDisplay = document.getElementById('file-name-display');
const videoPlayerOriginal = document.getElementById('video-player-original');
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
const trimButtonIcon = trimButton.querySelector('.button-icon');
const trimButtonText = trimButton.querySelector('span');

// --- Fungsi Helper Navigasi ---
function showSection(sectionElement) {
    mainMenu.style.display = 'none';
    ideaSection.style.display = 'none';
    manualSection.style.display = 'none';
    
    sectionElement.style.display = 'block';
    btnBackToMenu.style.display = 'block';
}

function showMainMenu() {
    mainMenu.style.display = 'flex';
    ideaSection.style.display = 'none';
    manualSection.style.display = 'none';
    btnBackToMenu.style.display = 'none';
    appTitle.textContent = 'Magistory ✨';
    appSubtitle.textContent = 'Pilih mode untuk memulai';
}

// --- Fungsi Helper UI ---
function log(message) {
    if(logOutput) {
        logSection.style.display = 'block';
        logOutput.innerHTML += message + '\n';
        logOutput.scrollTop = logOutput.scrollHeight;
    }
}

function showTrimLoader(message = 'Memproses...') {
    trimLoader.style.display = 'block';
    trimButtonIcon.style.display = 'none';
    trimButtonText.textContent = message;
    trimButton.disabled = true;
}

function hideTrimLoader() {
    trimLoader.style.display = 'none';
    trimButtonIcon.style.display = 'block';
    trimButtonText.textContent = 'Potong Video Sekarang';
    trimButton.disabled = false;
}

// Fungsi untuk menampilkan hasil video Pexels
function displayVideoResults(videos, gridElement) {
    gridElement.innerHTML = ''; // Bersihkan hasil lama
    if (videos.length === 0) {
        gridElement.innerHTML = '<p>Tidak ada video yang ditemukan.</p>';
        return;
    }
    
    videos.forEach(video => {
        // Cari file video dengan kualitas terbaik (HD atau SD)
        const videoFile = video.video_files.find(f => f.quality === 'hd') || 
                          video.video_files.find(f => f.quality === 'sd');

        if (videoFile) {
            const item = document.createElement('div');
            item.className = 'video-result-item';
            item.innerHTML = `<img src="${video.image}" alt="${video.user.name}">`;
            
            // Tambahkan event listener untuk memilih video ini
            item.addEventListener('click', () => {
                log(`Memilih video dari Pexels: ${videoFile.link}`);
                // Ambil video ini dan siapkan untuk editor
                preparePexelsVideo(videoFile.link, `pexels-video-${video.id}.mp4`);
            });
            gridElement.appendChild(item);
        }
    });
}

// Fungsi untuk mengunduh video Pexels ke browser dan menyiapkannya
async function preparePexelsVideo(videoUrl, fileName) {
    log('Mengunduh video Pexels ke browser... (mungkin butuh waktu)');
    try {
        // Gunakan fetch untuk mengunduh video sebagai blob
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error('Gagal mengunduh video dari Pexels');
        
        const videoBlob = await response.blob();
        
        // Buat objek File dari blob
        videoFile = new File([videoBlob], fileName, { type: videoBlob.type });
        
        // Panggil fungsi yang sama seperti upload manual
        setupVideoEditor(videoFile);
    } catch (error) {
        log(`Error: ${error.message}`);
        alert('Gagal mengambil video dari Pexels.');
    }
}

// Fungsi untuk menyiapkan editor setelah file dipilih (baik manual/pexels)
function setupVideoEditor(file) {
    const fileURL = URL.createObjectURL(file);
    videoPlayerOriginal.src = fileURL;
    fileNameDisplay.textContent = `File: ${file.name}`;
    
    // Tampilkan bagian editor
    editStep.style.display = 'block';
    logSection.style.display = 'block';
    log(`Video "${file.name}" siap untuk diedit.`);
    
    // Gulir ke editor
    editStep.scrollIntoView({ behavior: 'smooth' });
}


// --- Event Listeners Utama ---

// 1. Navigasi Menu
btnShowIdea.addEventListener('click', () => {
    showSection(ideaSection);
    appTitle.textContent = '💡 Idea to Video';
    appSubtitle.textContent = 'Ubah ide Anda menjadi video';
});

btnShowManual.addEventListener('click', () => {
    showSection(manualSection);
    appTitle.textContent = '✂️ Manual Editing';
    appSubtitle.textContent = 'Unggah atau cari video untuk diedit';
});

btnBackToMenu.addEventListener('click', showMainMenu);


// 2. Logika "Idea to Video"
btnGenerateIdea.addEventListener('click', async () => {
    const idea = ideaInput.value;
    if (!idea) {
        alert('Harap masukkan ide video Anda.');
        return;
    }
    
    // Tampilkan loader di tombol generate (jika ada)
    log('Menghubungi Gemini untuk mendapatkan ide...');
    ideaResultsContainer.style.display = 'none';

    try {
        const response = await fetch(`${BASE_BACKEND_URL}/idea-to-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea: idea })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const videos = await response.json();
        log('Gemini & Pexels berhasil merespon. Menampilkan video...');
        ideaResultsContainer.style.display = 'block';
        displayVideoResults(videos, ideaResultsGrid);

    } catch (error) {
        log(`Error: ${error.message}`);
        alert('Gagal memproses ide Anda.');
    }
});

// 3. Logika "Manual Editing" - Upload
videoUploader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        videoFile = file;
        setupVideoEditor(videoFile);
    }
});

// 4. Logika "Manual Editing" - Pexels Search
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
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const videos = await response.json();
        log('Pencarian Pexels berhasil.');
        displayVideoResults(videos, pexelsResultsGrid);

    } catch (error) {
        log(`Error: ${error.message}`);
        alert('Gagal mencari video di Pexels.');
    }
});

// 5. Logika Tombol Potong (Sama seperti sebelumnya)
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
        console.error(error);
        alert('Gagal berkomunikasi dengan server.');
    } finally {
        hideTrimLoader();
    }
});

// Inisialisasi: Tampilkan menu utama saat halaman dimuat
showMainMenu();
