// Storage keys
const STORAGE_KEYS = {
    TWIBBONS: 'twibbonApp_twibbons',
    CURRENT_USER: 'twibbonApp_user'
};

// Credentials
const VALID_USERNAME = 'user';
const VALID_PASSWORD = '#selaluamanah';

// Initialize storage
if (!localStorage.getItem(STORAGE_KEYS.TWIBBONS)) {
    localStorage.setItem(STORAGE_KEYS.TWIBBONS, JSON.stringify([]));
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, 'true');
                showToast('Login berhasil! Mengalihkan...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast('Username atau password salah!', 'error');
            }
        });
    }
    
    // Check authentication
    const currentPage = window.location.pathname.split('/').pop();
    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (currentPage !== 'login.html' && currentPage !== 'index.html' && currentPage !== 'generate.html') {
        if (!isLoggedIn && currentPage !== '') {
            window.location.href = 'login.html';
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            showToast('Logout berhasil!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
    
    // Upload area functionality
    const uploadArea = document.getElementById('uploadArea');
    const twibbonFile = document.getElementById('twibbonFile');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    
    if (uploadArea && twibbonFile) {
        uploadArea.addEventListener('click', () => {
            twibbonFile.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'image/png') {
                handleFileUpload(file);
            } else {
                showToast('Harap upload file PNG!', 'error');
            }
        });
        
        twibbonFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileUpload(file);
            }
        });
    }
    
    function handleFileUpload(file) {
        if (file.type !== 'image/png') {
            showToast('Harap upload file PNG dengan background transparan!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            uploadArea.style.display = 'none';
            previewContainer.style.display = 'block';
            
            // Store the image data for later use
            window.uploadedTwibbonData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // Change image button
    const changeImageBtn = document.getElementById('changeImageBtn');
    if (changeImageBtn) {
        changeImageBtn.addEventListener('click', () => {
            uploadArea.style.display = 'block';
            previewContainer.style.display = 'none';
            twibbonFile.value = '';
            window.uploadedTwibbonData = null;
        });
    }
    
    // Create form submission
    const createForm = document.getElementById('createForm');
    if (createForm) {
        createForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('twibbonName').value;
            const description = document.getElementById('twibbonDescription').value;
            
            if (!window.uploadedTwibbonData) {
                showToast('Harap upload template twibbon terlebih dahulu!', 'error');
                return;
            }
            
            // Generate unique ID and link
            const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const link = `${window.location.origin}${window.location.pathname.replace('create.html', '')}generate.html?id=${id}`;
            
            // Save to storage
            const twibbons = JSON.parse(localStorage.getItem(STORAGE_KEYS.TWIBBONS));
            twibbons.push({
                id: id,
                name: name,
                description: description,
                image: window.uploadedTwibbonData,
                createdAt: new Date().toISOString(),
                link: link
            });
            
            localStorage.setItem(STORAGE_KEYS.TWIBBONS, JSON.stringify(twibbons));
            
            // Show result
            document.getElementById('generatedLink').value = link;
            document.getElementById('resultLink').style.display = 'block';
            
            showToast('Twibbon berhasil dibuat!');
        });
    }
    
    // Copy link button
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            const linkInput = document.getElementById('generatedLink');
            linkInput.select();
            document.execCommand('copy');
            showToast('Link berhasil disalin!');
        });
    }
    
    // Load twibbons in dashboard
    const twibbonList = document.getElementById('twibbonList');
    if (twibbonList) {
        const twibbons = JSON.parse(localStorage.getItem(STORAGE_KEYS.TWIBBONS));
        
        if (twibbons.length === 0) {
            twibbonList.innerHTML = '<p class="no-data">Belum ada twibbon yang dibuat. Buat twibbon pertama Anda!</p>';
        } else {
            twibbonList.innerHTML = twibbons.map(twibbon => `
                <div class="twibbon-item animate-pop-in">
                    <img src="${twibbon.image}" alt="${twibbon.name}" class="twibbon-preview">
                    <div class="twibbon-info">
                        <h3>${twibbon.name}</h3>
                        <p>${twibbon.description || 'Tidak ada deskripsi'}</p>
                        <div class="twibbon-link">
                            <input type="text" value="${twibbon.link}" readonly>
                            <button class="btn btn-small copy-dashboard-link" data-link="${twibbon.link}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Add copy functionality for dashboard links
            document.querySelectorAll('.copy-dashboard-link').forEach(btn => {
                btn.addEventListener('click', function() {
                    const link = this.dataset.link;
                    navigator.clipboard.writeText(link).then(() => {
                        showToast('Link berhasil disalin!');
                    });
                });
            });
        }
    }
    
    // Generate page functionality
    const urlParams = new URLSearchParams(window.location.search);
    const twibbonId = urlParams.get('id');
    
    if (window.location.pathname.includes('generate.html') && twibbonId) {
        const twibbons = JSON.parse(localStorage.getItem(STORAGE_KEYS.TWIBBONS));
        const twibbon = twibbons.find(t => t.id === twibbonId);
        
        if (twibbon) {
            // Display twibbon info
            const twibbonInfo = document.getElementById('twibbonInfo');
            twibbonInfo.innerHTML = `
                <h3>${twibbon.name}</h3>
                <p>${twibbon.description || ''}</p>
            `;
            
            // Setup canvas
            const canvas = document.getElementById('previewCanvas');
            const ctx = canvas.getContext('2d');
            
            // Load twibbon image
            const twibbonImg = new Image();
            twibbonImg.src = twibbon.image;
            
            let userImg = null;
            let userImgElement = null;
            
            // Upload photo area
            const uploadPhotoArea = document.getElementById('uploadPhotoArea');
            const userPhoto = document.getElementById('userPhoto');
            const photoControls = document.querySelector('.photo-controls');
            
            uploadPhotoArea.addEventListener('click', () => {
                userPhoto.click();
            });
            
            userPhoto.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        userImg = new Image();
                        userImg.src = e.target.result;
                        userImg.onload = function() {
                            userImgElement = userImg;
                            uploadPhotoArea.style.display = 'none';
                            photoControls.style.display = 'block';
                            drawPreview();
                        };
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Position controls
            let posX = 0, posY = 0, zoom = 1;
            
            document.getElementById('posX').addEventListener('input', (e) => {
                posX = parseInt(e.target.value);
                drawPreview();
            });
            
            document.getElementById('posY').addEventListener('input', (e) => {
                posY = parseInt(e.target.value);
                drawPreview();
            });
            
            document.getElementById('zoom').addEventListener('input', (e) => {
                zoom = parseFloat(e.target.value);
                drawPreview();
            });
            
            function drawPreview() {
                if (!twibbonImg.complete || (userImgElement && !userImgElement.complete)) {
                    setTimeout(drawPreview, 100);
                    return;
                }
                
                // Set canvas size to match twibbon
                canvas.width = twibbonImg.width;
                canvas.height = twibbonImg.height;
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw user photo if available
                if (userImgElement) {
                    const scaledWidth = userImgElement.width * zoom;
                    const scaledHeight = userImgElement.height * zoom;
                    
                    const x = (canvas.width - scaledWidth) / 2 + posX;
                    const y = (canvas.height - scaledHeight) / 2 + posY;
                    
                    ctx.drawImage(userImgElement, x, y, scaledWidth, scaledHeight);
                }
                
                // Draw twibbon on top
                ctx.drawImage(twibbonImg, 0, 0, canvas.width, canvas.height);
            }
            
            twibbonImg.onload = () => {
                drawPreview();
            };
            
            // Download functionality
            document.getElementById('downloadBtn').addEventListener('click', function() {
                if (!userImgElement) {
                    showToast('Harap upload foto terlebih dahulu!', 'error');
                    return;
                }
                
                // Create download link
                const link = document.createElement('a');
                link.download = `twibbon-${twibbon.name}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                showToast('Foto berhasil didownload!');
            });
            
        } else {
            // Twibbon not found
            document.querySelector('.generate-card').innerHTML = `
                <h2>Twibbon Tidak Ditemukan</h2>
                <p>Maaf, twibbon yang Anda cari tidak ada atau telah dihapus.</p>
                <a href="index.html" class="btn btn-primary">Kembali ke Beranda</a>
            `;
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading state to forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.classList.add('loading');
            setTimeout(() => {
                submitBtn.classList.remove('loading');
            }, 2000);
        }
    });
});