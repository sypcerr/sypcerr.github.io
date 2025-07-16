const apiKey = 'AIzaSyCsH9yBSAdjtgLoktHoFBoRftmR-ymjKek';
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const countrySelect = document.getElementById('country-select');
const trendingVideosDiv = document.getElementById('trending-videos');
const countryNameSpan = document.getElementById('country-name');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const themes = ['dark-mode', 'oled-mode', 'light-mode'];
let currentThemeIndex = 0;

// Theme Toggle
themeToggle.addEventListener('click', function() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const nextTheme = themes[currentThemeIndex];

    body.classList.remove('light-mode', 'oled-mode', 'dark-mode'); // Remove all themes
    body.classList.add(nextTheme); // Add the next theme

    // Update button text
    if (nextTheme === 'light-mode') {
        themeToggle.textContent = 'Light Mode';
    } else if (nextTheme === 'oled-mode') {
        themeToggle.textContent = 'OLED Mode';
    } else {
        themeToggle.textContent = 'Dark Mode';
    }
});

// Search Functionality
searchButton.addEventListener('click', function() {
    const searchTerm = searchInput.value;
    searchVideos(searchTerm);
});

async function searchVideos(searchTerm) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchTerm}&type=video&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayVideos(data.items, trendingVideosDiv); // Reuse display function for search results
    } catch (error) {
        console.error('Error fetching search videos:', error);
        trendingVideosDiv.innerHTML = `<p>Error fetching search videos: ${error.message}. Please try again.</p>`;
    }
}

// Function to fetch trending videos
async function fetchTrendingVideos(countryCode) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=10&regionCode=${countryCode}&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        displayVideos(data.items, trendingVideosDiv);
    } catch (error) {
        console.error('Error fetching trending videos:', error);
        trendingVideosDiv.innerHTML = `<p>Error fetching trending videos: ${error.message}. Please try again.</p>`;
    }
}

// Function to display videos
function displayVideos(videos, targetDiv) {
    targetDiv.innerHTML = '';
    const fragment = document.createDocumentFragment();

    videos.forEach(video => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const thumbnailUrl = video.snippet.thumbnails.medium.url;
        const videoDescription = video.snippet.description;

        const videoDiv = document.createElement('div');
        videoDiv.classList.add('video-item');
        videoDiv.style.cursor = 'pointer'; // Add cursor pointer

        videoDiv.innerHTML = `
            <img src="${thumbnailUrl}" alt="Trending video: ${title} - ${videoDescription}">
            <h3>${title}</h3>
        `;

        videoDiv.addEventListener('click', function() {
            loadVideo(videoId);
        });

        fragment.appendChild(videoDiv);
    });

    targetDiv.appendChild(fragment);
}

// Function to load video in the player
function loadVideo(videoId) {
    // Open the video in a new tab
    window.open(`video.html?videoId=${videoId}`, '_blank');
}

// Country Selection
countrySelect.addEventListener('change', function() {
    const countryCode = countrySelect.value;
    const countryName = countrySelect.options[countrySelect.selectedIndex].text;
    countryNameSpan.textContent = countryName;
    fetchTrendingVideos(countryCode);
});

// Initial fetch for Germany
fetchTrendingVideos('DE');