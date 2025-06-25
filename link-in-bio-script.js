// DOM Elements
const profilePicture = document.getElementById('profilePicture');
const profilePreview = document.getElementById('profilePreview');
const previewProfilePic = document.getElementById('previewProfilePic');
const profileName = document.getElementById('profileName');
const profileBio = document.getElementById('profileBio');
const addLinkBtn = document.getElementById('addLinkBtn');
const linksContainer = document.getElementById('linksContainer');
const saveBtn = document.getElementById('saveBtn');
const previewBtn = document.getElementById('previewBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Preview elements
const previewName = document.getElementById('previewName');
const previewBio = document.getElementById('previewBio');
const previewLinks = document.getElementById('previewLinks');

// Data structure
let bioData = {
    name: '',
    bio: '',
    profileImage: '',
    links: []
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updatePreview();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Profile picture upload
    profilePicture.addEventListener('change', handleProfilePictureUpload);
    
    // Profile info changes
    profileName.addEventListener('input', updatePreview);
    profileBio.addEventListener('input', updatePreview);
    
    // Buttons
    addLinkBtn.addEventListener('click', addNewLink);
    saveBtn.addEventListener('click', saveToLocalStorage);
    previewBtn.addEventListener('click', updatePreview);
    copyLinkBtn.addEventListener('click', copyBioLink);
    downloadBtn.addEventListener('click', downloadBioPage);
}

// Handle profile picture upload
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            profilePreview.src = imageData;
            previewProfilePic.src = imageData;
            bioData.profileImage = imageData;
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
}

// Add new link
function addNewLink() {
    const linkId = Date.now();
    const linkData = {
        id: linkId,
        title: '',
        url: '',
        icon: 'fas fa-link'
    };
    
    bioData.links.push(linkData);
    renderLink(linkData);
    updatePreview();
}

// Render a single link in the editor
function renderLink(linkData) {
    const linkElement = document.createElement('div');
    linkElement.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
    linkElement.id = `link-${linkData.id}`;
    
    linkElement.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-gray-700">Link ${bioData.links.indexOf(linkData) + 1}</h4>
            <button onclick="removeLink(${linkData.id})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="space-y-3">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" 
                       placeholder="Link title" 
                       value="${linkData.title}"
                       onchange="updateLink(${linkData.id}, 'title', this.value)"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input type="url" 
                       placeholder="https://example.com" 
                       value="${linkData.url}"
                       onchange="updateLink(${linkData.id}, 'url', this.value)"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select onchange="updateLink(${linkData.id}, 'icon', this.value)" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="fas fa-link" ${linkData.icon === 'fas fa-link' ? 'selected' : ''}>🔗 Link</option>
                    <option value="fab fa-instagram" ${linkData.icon === 'fab fa-instagram' ? 'selected' : ''}>📷 Instagram</option>
                    <option value="fab fa-youtube" ${linkData.icon === 'fab fa-youtube' ? 'selected' : ''}>📺 YouTube</option>
                    <option value="fab fa-twitter" ${linkData.icon === 'fab fa-twitter' ? 'selected' : ''}>🐦 Twitter</option>
                    <option value="fab fa-tiktok" ${linkData.icon === 'fab fa-tiktok' ? 'selected' : ''}>🎵 TikTok</option>
                    <option value="fab fa-facebook" ${linkData.icon === 'fab fa-facebook' ? 'selected' : ''}>📘 Facebook</option>
                    <option value="fab fa-linkedin" ${linkData.icon === 'fab fa-linkedin' ? 'selected' : ''}>💼 LinkedIn</option>
                    <option value="fas fa-globe" ${linkData.icon === 'fas fa-globe' ? 'selected' : ''}>🌐 Website</option>
                    <option value="fas fa-envelope" ${linkData.icon === 'fas fa-envelope' ? 'selected' : ''}>✉️ Email</option>
                    <option value="fas fa-phone" ${linkData.icon === 'fas fa-phone' ? 'selected' : ''}>📞 Phone</option>
                    <option value="fas fa-map-marker-alt" ${linkData.icon === 'fas fa-map-marker-alt' ? 'selected' : ''}>📍 Location</option>
                    <option value="fas fa-shopping-cart" ${linkData.icon === 'fas fa-shopping-cart' ? 'selected' : ''}>🛒 Shop</option>
                </select>
            </div>
        </div>
    `;
    
    linksContainer.appendChild(linkElement);
}

// Update link data
function updateLink(id, field, value) {
    const link = bioData.links.find(l => l.id === id);
    if (link) {
        link[field] = value;
        updatePreview();
        saveToLocalStorage();
    }
}

// Remove link
function removeLink(id) {
    bioData.links = bioData.links.filter(l => l.id !== id);
    const linkElement = document.getElementById(`link-${id}`);
    if (linkElement) {
        linkElement.remove();
    }
    updatePreview();
    saveToLocalStorage();
}

// Update preview
function updatePreview() {
    // Update profile info
    bioData.name = profileName.value;
    bioData.bio = profileBio.value;
    
    previewName.textContent = bioData.name || 'Your Name';
    previewBio.textContent = bioData.bio || 'Your bio will appear here...';
    
    // Update links preview
    previewLinks.innerHTML = '';
    
    if (bioData.links.length === 0) {
        previewLinks.innerHTML = `
            <div class="bg-gray-100 rounded-lg p-3 text-center text-gray-500 text-sm">
                Your links will appear here...
            </div>
        `;
    } else {
        bioData.links.forEach(link => {
            if (link.title && link.url) {
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.target = '_blank';
                linkElement.className = 'block bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-3 text-center transition-all duration-200 transform hover:scale-105';
                linkElement.innerHTML = `
                    <i class="${link.icon} mr-2"></i>
                    ${link.title}
                `;
                previewLinks.appendChild(linkElement);
            }
        });
    }
}

// Save to local storage
function saveToLocalStorage() {
    try {
        localStorage.setItem('bioData', JSON.stringify(bioData));
        showNotification('Changes saved successfully!', 'success');
    } catch (error) {
        showNotification('Failed to save changes.', 'error');
    }
}

// Load from local storage
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('bioData');
        if (saved) {
            bioData = JSON.parse(saved);
            
            // Load profile info
            profileName.value = bioData.name || '';
            profileBio.value = bioData.bio || '';
            
            if (bioData.profileImage) {
                profilePreview.src = bioData.profileImage;
                previewProfilePic.src = bioData.profileImage;
            }
            
            // Load links
            linksContainer.innerHTML = '';
            bioData.links.forEach(link => renderLink(link));
            
            updatePreview();
        }
    } catch (error) {
        console.error('Failed to load saved data:', error);
    }
}

// Copy bio link
function copyBioLink() {
    const bioUrl = window.location.href;
    navigator.clipboard.writeText(bioUrl).then(() => {
        showNotification('Bio page link copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy link.', 'error');
    });
}

// Download bio page
function downloadBioPage() {
    const bioPageHTML = generateBioPageHTML();
    const blob = new Blob([bioPageHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-bio-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Bio page downloaded successfully!', 'success');
}

// Generate standalone bio page HTML
function generateBioPageHTML() {
    const linksHTML = bioData.links
        .filter(link => link.title && link.url)
        .map(link => `
            <a href="${link.url}" target="_blank" class="block bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 mb-3">
                <i class="${link.icon} mr-2"></i>
                ${link.title}
            </a>
        `).join('');
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bioData.name || 'My Bio Page'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-md">
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <!-- Profile Section -->
            <div class="text-center mb-8">
                <div class="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                    <img src="${bioData.profileImage || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%239CA3AF\'%3E%3Cpath d=\'M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9 11a1 1 0 0 1-2 0v-2a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v2a1 1 0 1 1-2 0v-2a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2z\'/%3E%3C/svg%3E'}" alt="Profile" class="w-full h-full object-cover">
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-2">${bioData.name || 'Your Name'}</h1>
                <p class="text-gray-600">${bioData.bio || 'Your bio will appear here...'}</p>
            </div>
            
            <!-- Links -->
            <div class="space-y-3">
                ${linksHTML || '<p class="text-center text-gray-500">No links added yet.</p>'}
            </div>
            
            <!-- Footer -->
            <div class="text-center mt-8 pt-6 border-t border-gray-200">
                <p class="text-gray-500 text-sm">Created with Link in Bio Generator</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    if (type === 'success') {
        notification.className += ' bg-green-500 text-white';
    } else if (type === 'error') {
        notification.className += ' bg-red-500 text-white';
    } else {
        notification.className += ' bg-blue-500 text-white';
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Auto-save on input changes
profileName.addEventListener('input', () => {
    setTimeout(saveToLocalStorage, 1000);
});

profileBio.addEventListener('input', () => {
    setTimeout(saveToLocalStorage, 1000);
});

// Initialize with a sample link if no data exists
if (bioData.links.length === 0 && !localStorage.getItem('bioData')) {
    addNewLink();
} 