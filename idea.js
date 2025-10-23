// --- GANTI URL INI DENGAN URL BACKEND ANDA ---
const BASE_BACKEND_URL = 'https://magistory-backend-production.up.railway.app'; 
// Contoh: 'https://magistory-backend.onrender.com' (TANPA / di akhir)

// --- Elemen Utama ---
const ideaInput = document.getElementById('idea-input');
const btnGenerateIdea = document.getElementById('btn-generate-idea'); // Tombol utama
const timelineEditor = document.getElementById('timeline-editor');
const timelineContainer = document.getElementById('timeline-container');
const ideaInputContainer = document.getElementById('idea-input-container');

// --- Elemen Modal Konfigurasi (BARU) ---
const configModal = document.getElementById('config-modal');
const configDurationSlider = document.getElementById('config-duration');
const durationLabel = document.getElementById('duration-label');
const configStyleSelect = document.getElementById('config-style');
const btnGenerateFromModal = document.getElementById('btn-generate-from-modal'); // Tombol di dalam modal
const configModalCloseButton = document.getElementById('config-modal-close-button');

// --- Elemen Modal Pengganti Video (Lama) ---
const replaceModal = document.getElementById('replace-modal');
const modalSceneNumber = document.getElementById('modal-scene-number');
const modalVideoUploader = document.getElementById('modal-video-uploader');
const modalPexelsInput = document.getElementById('modal-pexels-search-input');
const modalBtnSearchPexels = document.getElementById('modal-btn-search-pexels');
const modalPexelsResults = document.getElementById('modal-pexels-results');
const modalCloseButton = document.getElementById('modal-close-button');

// --- Variabel Global ---
let currentEditingSceneCard = null; // Menyimpan kartu adegan yang sedang diedit
let currentAspectRatio = '16:9'; // Menyimpan aspect ratio pilihan pengguna

// --- Fungsi untuk Membangun Timeline ---
function buildTimeline(scenes) {
    timelineContainer.innerHTML = ''; // Kosongkan timeline
    
    if (!scenes || scenes.length === 0) {
        timelineContainer.innerHTML = '<p>Gagal membuat skrip. Coba ide lain.</p>';
        return;
    }

    scenes.forEach((scene, index) => {
        const sceneCard = document.createElement('div');
        sceneCard.className = 'scene-card';
        sceneCard.dataset.sceneIndex = index; 

        // Gunakan videoPreview dari backend, atau placeholder jika null
        const videoPreview = scene.videoPreview || 'https://via.placeholder.com/160x90.png?text=No+Video';
        
        sceneCard.innerHTML = `
            <h4>Adegan ${scene.scene}</h4>
            <textarea class="scene-narration" data-key="narration">${scene.narration}</textarea>
            <img src="${videoPreview}" class="scene-video-preview" data-key="videoPreview">
            <button class="btn-replace-video">Ganti Video</button>
        `;
        timelineContainer.appendChild(sceneCard);
    });

    timelineEditor.style.display = 'block';
    ideaInputContainer.style.display = 'none'; // Sembunyikan input ide
}

// --- Event Listener Tombol Generate (UTAMA) ---
// Tombol ini sekarang HANYA membuka modal
btnGenerateIdea.addEventListener('click', () => {
    if (!ideaInput.value) {
        alert('Harap masukkan ide video Anda.');
        return;
    }
    configModal.style.display = 'flex'; // Tampilkan modal konfigurasi
});

// --- Event Listener Modal Konfigurasi ---

// Update label durasi saat slider digerakkan
configDurationSlider.addEventListener('input', (e) => {
    durationLabel.textContent = `${e.target.value} menit`;
});

// Tombol Batal di modal konfigurasi
configModalCloseButton.addEventListener('click', () => {
    configModal.style.display = 'none';
});

// Tombol GENERATE di dalam modal (Logika Utama)
btnGenerateFromModal.addEventListener('click', async () => {
    const idea = ideaInput.value;
    
    // 1. Kumpulkan semua data dari modal
    const duration = configDurationSlider.value;
    const style = configStyleSelect.value;
    // Dapatkan nilai aspect ratio yang dipilih
    const aspectRatioRadio = document.querySelector('input[name="aspectRatio"]:checked');
    currentAspectRatio = aspectRatioRadio ? aspectRatioRadio.value : '16:9'; // Simpan secara global

    const loader = btnGenerateFromModal.querySelector('.loader');
    loader.style.display = 'block';
    btnGenerateFromModal.disabled = true;

    try {
        // 2. Panggil backend dengan semua data
        const response = await fetch(`${BASE_BACKEND_URL}/idea-to-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                idea: idea,
                duration: duration,
                aspectRatio: currentAspectRatio,
                style: style
            })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const scenes = await response.json();
        buildTimeline(scenes); // Bangun timeline
        configModal.style.display = 'none'; // Sembunyikan modal

    } catch (error) {
        alert('Gagal memproses ide: ' + error.message);
    } finally {
        loader.style.display = 'none';
        btnGenerateFromModal.disabled = false;
    }
});


// --- Logika Modal Pengganti Video (Lama, sedikit modifikasi) ---

// Membuka Modal
timelineContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-replace-video')) {
        currentEditingSceneCard = e.target.closest('.scene-card');
        const sceneIndex = currentEditingSceneCard.dataset.sceneIndex;
        modalSceneNumber.textContent = parseInt(sceneIndex) + 1;
        replaceModal.style.display = 'flex';
    }
});

// Menutup Modal
modalCloseButton.addEventListener('click', () => {
    replaceModal.style.display = 'none';
    currentEditingSceneCard = null;
    modalPexelsResults.innerHTML = '';
    modalPexelsInput.value = '';
});

// Fungsi untuk mengganti video di kartu adegan
function replaceSceneVideo(newVideoUrl, newVideoFile = null) {
    if (!currentEditingSceneCard) return;
    const previewImage = currentEditingSceneCard.querySelector('.scene-video-preview');
    if (newVideoFile) {
        previewImage.src = URL.createObjectURL(newVideoFile);
        console.log("File galeri dipilih:", newVideoFile.name);
    } else {
        previewImage.src = newVideoUrl;
        console.log("Video Pexels dipilih:", newVideoUrl);
    }
    replaceModal.style.display = 'none';
}

// Pengganti dari Galeri (Upload)
modalVideoUploader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        replaceSceneVideo(null, file);
    }
});

// Pengganti dari Pencarian Pexels (MODIFIKASI)
modalBtnSearchPexels.addEventListener('click', async () => {
    const query = modalPexelsInput.value;
    if (!query) return;

    modalPexelsResults.innerHTML = '<p>Mencari...</p>';
    try {
        // Kirim query DAN aspect ratio saat ini
        const response = await fetch(`${BASE_BACKEND_URL}/search-pexels?query=${encodeURIComponent(query)}&orientation=${currentAspectRatio}`);
        if (!response.ok) throw new Error(await response.text());
        
        const videos = await response.json();
        modalPexelsResults.innerHTML = '';
        
        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'video-result-item';
            item.innerHTML = `<img src="${video.image}" alt="${video.user.name}">`;
            item.addEventListener('click', () => {
                replaceSceneVideo(video.image);
            });
            modalPexelsResults.appendChild(item);
        });

    } catch (error) {
        modalPexelsResults.innerHTML = '<p>Gagal mencari video.</p>';
    }
});
