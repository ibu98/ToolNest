// DOM Elements
const youtubeUrlInput = document.getElementById('youtubeUrl');
const extractBtn = document.getElementById('extractBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const results = document.getElementById('results');
const highQualityThumbnail = document.getElementById('highQualityThumbnail');
const standardThumbnail = document.getElementById('standardThumbnail');
const downloadHighQuality = document.getElementById('downloadHighQuality');
const downloadStandard = document.getElementById('downloadStandard');
const videoDetails = document.getElementById('videoDetails');

// Event Listeners
extractBtn.addEventListener('click', extractThumbnails);
youtubeUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        extractThumbnails();
    }
});

downloadHighQuality.addEventListener('click', () => downloadImage('highQuality'));
downloadStandard.addEventListener('click', () => downloadImage('standard'));

// YouTube URL patterns
const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
];

// Extract video ID from YouTube URL
function extractVideoId(url) {
    for (const pattern of youtubePatterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Generate thumbnail URLs
function generateThumbnailUrls(videoId) {
    return {
        highQuality: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        standard: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        default: `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
}

// Check if image exists
async function imageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

// Get the best available thumbnail
async function getBestThumbnail(videoId) {
    const urls = generateThumbnailUrls(videoId);
    
    // Try high quality first
    if (await imageExists(urls.highQuality)) {
        return { highQuality: urls.highQuality, standard: urls.standard };
    }
    
    // Fallback to standard quality
    if (await imageExists(urls.standard)) {
        return { highQuality: urls.standard, standard: urls.standard };
    }
    
    // Fallback to medium quality
    if (await imageExists(urls.medium)) {
        return { highQuality: urls.medium, standard: urls.medium };
    }
    
    // Final fallback to default
    return { highQuality: urls.default, standard: urls.default };
}

// Extract thumbnails from YouTube URL
async function extractThumbnails() {
    const url = youtubeUrlInput.value.trim();
    
    // Clear previous results and errors
    hideError();
    hideResults();
    
    // Validate input
    if (!url) {
        showError('Please enter a YouTube URL');
        return;
    }
    
    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
        showError('Invalid YouTube URL. Please check the URL and try again.');
        return;
    }
    
    // Show loading
    showLoading();
    
    try {
        // Get thumbnail URLs
        const thumbnails = await getBestThumbnail(videoId);
        
        // Set image sources
        highQualityThumbnail.src = thumbnails.highQuality;
        standardThumbnail.src = thumbnails.standard;
        
        // Store video ID for downloads
        highQualityThumbnail.dataset.videoId = videoId;
        standardThumbnail.dataset.videoId = videoId;
        
        // Show video information
        showVideoInfo(videoId);
        
        // Show results
        hideLoading();
        showResults();
        
    } catch (error) {
        hideLoading();
        showError('Failed to extract thumbnails. Please check the URL and try again.');
        console.error('Error extracting thumbnails:', error);
    }
}

// Show video information
async function showVideoInfo(videoId) {
    try {
        videoDetails.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p><strong>Video ID:</strong> ${videoId}</p>
                    <p><strong>Thumbnail URLs:</strong></p>
                    <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li><a href="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" target="_blank" class="text-blue-500 hover:underline">High Quality (1280x720)</a></li>
                        <li><a href="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" target="_blank" class="text-blue-500 hover:underline">Standard (480x360)</a></li>
                        <li><a href="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" target="_blank" class="text-blue-500 hover:underline">Medium (320x180)</a></li>
                    </ul>
                </div>
                <div>
                    <p><strong>Direct Links:</strong></p>
                    <div class="mt-2 space-y-2">
                        <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                            <i class="fab fa-youtube mr-1"></i>Watch on YouTube
                        </a>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        videoDetails.innerHTML = '<p class="text-red-500">Failed to load video information</p>';
    }
}

// Prevent images from opening fullscreen or being clickable
highQualityThumbnail.style.pointerEvents = 'none';
standardThumbnail.style.pointerEvents = 'none';
highQualityThumbnail.onclick = null;
standardThumbnail.onclick = null;

// Download image function
async function downloadImage(quality) {
    const img = quality === 'highQuality' ? highQualityThumbnail : standardThumbnail;
    const videoId = img.dataset.videoId;
    if (!videoId) {
        showError('No video selected. Please extract thumbnails first.');
        return;
    }
    try {
        // Fetch the image as a blob to ensure download works everywhere
        const response = await fetch(img.src);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `youtube-thumbnail-${videoId}-${quality}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showSuccessMessage(`Downloading ${quality === 'highQuality' ? 'High Quality' : 'Standard'} thumbnail...`);
    } catch (error) {
        showError('Failed to download image. Please try again.');
        console.error('Download error:', error);
    }
}

// UI Helper Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    extractBtn.disabled = true;
    extractBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    extractBtn.disabled = false;
    extractBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

function showResults() {
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideResults() {
    results.classList.add('hidden');
}

function showSuccessMessage(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-check-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input field
    youtubeUrlInput.focus();
    
    // Add some example URLs for testing
    console.log('YouTube Thumbnail Downloader loaded!');
    console.log('Example URLs you can test with:');
    console.log('- https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('- https://youtu.be/dQw4w9WgXcQ');
}); 