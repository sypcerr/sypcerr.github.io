document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value;
        searchYouTube(searchTerm);
    });

    function searchYouTube(searchTerm) {
        // Replace with your API key
        const apiKey = 'AIzaSyCsH9yBSAdjtgLoktHoFBoRftmR-ymjKek';
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&key=${apiKey}&maxResults=10&type=video`;
        let data;
        fetch(url)
            .then(response => {
                console.log('Search API URL:', url);
                console.log('Search API response status:', response.status);
                console.log('Search API response:', response);
                return response.json();
            })
            .then(responseData => {
                data = responseData;
                console.log('Search API data:', data);
                if (!data.items) {
                    throw new Error('No items found in search results');
                }
                const videoIds = data.items.map(item => item.id.videoId).join(',');
                return fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`);
            })
            .then(response => {
                console.log('Videos API response status:', response.status);
                console.log('Videos API response:', response);
                return response.json();
            })
            .then(videoData => {
                console.log('Videos API data:', videoData);
                displayResults(data.items, videoData.items);
            })
            .catch(error => {
                console.error('Error:', error);
                searchResults.innerHTML = '<p>Error fetching results.</p>';
            });
    }

    function displayResults(searchResults, videoDetails) {
        const searchResultsElement = document.getElementById('search-results');
        searchResultsElement.innerHTML = '';
        searchResults.forEach((item, index) => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const channelName = item.snippet.channelTitle;
            const thumbnail = item.snippet.thumbnails.high.url;
            let viewCount = 'N/A';
            if (videoDetails && videoDetails[index] && videoDetails[index].statistics) {
                viewCount = videoDetails[index].statistics.viewCount;
            } else {
                console.warn('View count not found for video ID:', videoId);
            }

            const videoItemDiv = document.createElement('div');
            videoItemDiv.classList.add('video-item');
            // Open in a new tab on the website, using a local route for the player
            videoItemDiv.onclick = () => window.open(`/watch?v=${videoId}`, '_blank');
            videoItemDiv.innerHTML = `
                <img src="${thumbnail}" alt="${title}" style="width: 160%; height: 180%;">
                <h3>${title}</h3>
                <p>${channelName} - ${formatViewCount(viewCount)} views</p>
            `;
            searchResultsElement.appendChild(videoItemDiv); // Append the div directly
         });
     }

    function formatViewCount(viewCount) {
        const num = parseInt(viewCount);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }

    function addToHistory(videoId) {
        let history = localStorage.getItem('history');
        history = history ? JSON.parse(history) : [];
        if (!history.includes(videoId)) {
            history.push(videoId);
            localStorage.setItem('history', JSON.stringify(history));
        }
        displayHistory();
    }

    function displayHistory() {
        console.log('Displaying history...');
        const historyDropdown = document.getElementById('history-dropdown');
        historyDropdown.innerHTML = '<option value="">-- Select a video --</option>';
        let history = localStorage.getItem('history');
        history = history ? JSON.parse(history) : [];
        history.forEach(videoId => {
            const option = document.createElement('option');
            option.value = videoId;
            option.textContent = videoId;
            historyDropdown.appendChild(option);
        });
    }

    document.getElementById('history-dropdown').addEventListener('change', function(event) {
        const videoId = event.target.value;
        if (videoId) {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
        }
    });

    document.getElementById('clear-history').addEventListener('click', function() {
        localStorage.removeItem('history');
        displayHistory();
    });

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fas', 'fa-sun');
            icon.classList.add('fas', 'fa-moon');
        } else {
            icon.classList.remove('fas', 'fa-moon');
            icon.classList.add('fas', 'fa-sun');
        }
    });

    displayHistory();
});