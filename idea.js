// --- GANTI URL INI DENGAN URL BACKEND ANDA ---
const BASE_BACKEND_URL = 'https://magistory-backend-production.up.railway.app'; 
// Contoh: 'https://magistory-backend.onrender.com' (TANPA / di akhir)

// --- Elemen Utama ---
const ideaInput = document.getElementById('idea-input');
const btnGenerateIdea = document.getElementById('btn-generate-idea');
const timelineEditor = document.getElementById('timeline-editor');
const timelineContainer = document.getElementById('timeline-container');
const ideaInputContainer = document.getElementById('idea-input-container');

// --- Elemen Modal ---
const replaceModal = document.getElementById('replace-modal');
const modalSceneNumber = document.getElementById('modal-scene-number');
const modalVideoUploader = document.getElementById('modal-video-uploader');
const modalPexelsInput = document.getElementById('modal-pexels-search-input');
const modalBtnSearchPexels = document.getElementById('modal-btn-search-pexels');
const modalPexelsResults = document.getElementById('modal-pexels-results');
const modalCloseButton = document.getElementById('modal-close-button');

let currentEditingSceneCard = null; // Menyimpan kartu adegan yang sedang diedit

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
        sceneCard.dataset.sceneIndex = index; // Menyimpan index adegan

        const videoPreview = scene.video ? scene.video.image : 'https://via.placeholder.com/160x90.png?text=No+Video';
        
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

// --- Event Listener Tombol Generate ---
btnGenerateIdea.addEventListener('click', async () => {
    const idea = ideaInput.value;
    if (!idea) {
        alert('Harap masukkan ide video Anda.');
        return;
    }

    const loader = btnGenerateIdea.querySelector('.loader');
    loader.style.display = 'block';
    btnGenerateIdea.disabled = true;

    try {
        const response = await fetch(`${BASE_BACKEND_URL}/idea-to-video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea: idea })
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const scenes = await response.json();
        buildTimeline(scenes);

    } catch (error) {
        alert('Gagal memproses ide: ' + error.message);
    } finally {
        loader.style.display = 'none';
        btnGenerateIdea.disabled = false;
    }
});

// --- Logika Modal Pengganti Video ---

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
        // Jika dari galeri, buat URL objek untuk pratinjau
        previewImage.src = URL.createObjectURL(newVideoFile);
        // Di sini Anda akan menyimpan `newVideoFile` untuk di-upload/proses nanti
        console.log("File galeri dipilih:", newVideoFile.name);
    } else {
        // Jika dari Pexels (hanya gambar pratinjau saat ini)
        previewImage.src = newVideoUrl;
        // Di sini Anda akan menyimpan URL video Pexels untuk di-download/proses nanti
        console.log("Video Pexels dipilih:", newVideoUrl);
    }
    
    replaceModal.style.display = 'none'; // Tutup modal
}

// Pengganti dari Galeri (Upload)
modalVideoUploader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        replaceSceneVideo(null, file);
    }
});

// Pengganti dari Pencarian Pexels
modalBtnSearchPexels.addEventListener('click', async () => {
    const query = modalPexelsInput.value;
    if (!query) return;

    modalPexelsResults.innerHTML = '<p>Mencari...</p>';
    try {
        const response = await fetch(`${BASE_BACKEND_URL}/search-pexels?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(await response.text());
        
        const videos = await response.json();
        modalPexelsResults.innerHTML = ''; // Kosongkan
        
        videos.forEach(video => {
            const item = document.createElement('div');
            item.className = 'video-result-item';
            item.innerHTML = `<img src="${video.image}" alt="${video.user.name}">`;
            item.addEventListener('click', () => {
                // Saat ini kita ganti dengan gambar pratinjau Pexels
                replaceSceneVideo(video.image);
            });
            modalPexelsResults.appendChild(item);
        });

    } catch (error) {
        modalPexelsResults.innerHTML = '<p>Gagal mencari video.</p>';
    }
});
