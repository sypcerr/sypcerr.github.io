document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');
    // const darkModeToggle = document.getElementById('dark-mode-toggle'); // Removed as it's not used
    const videoPlayerModal = document.getElementById('video-player-modal');
    const youtubePlayer = document.getElementById('youtube-player');
    const closeButton = document.querySelector('.close-button');

    // Global variables for pagination and state
    let nextPageToken = null;
    let currentSearchTerm = '';
    let isLoading = false; // To prevent multiple simultaneous fetches
    let noMoreResults = false; // Flag to indicate if all results are loaded
    let responseDataGlobal = null; // To store search API response globally

    // Cache for search results
 
    // Password protection elements
    const passwordProtectionDiv = document.getElementById('password-protection');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmitButton = document.getElementById('password-submit-button');
    const passwordError = document.getElementById('password-error');
    const mainContentWrapper = document.getElementById('main-content-wrapper');

    const correctPassword = '1161';

    // Load More Button
    let loadMoreButton = null;

    // Function to get video ID from URL parameters
    function getVideoIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('videoId');
    }

    // Function to show the video player modal
    function showPlayer(videoId) {
        if (videoId) {
            youtubePlayer.src = `https://www.youtube.com/embed/${videoId}`;
            videoPlayerModal.style.display = 'flex'; // Use flex to center
            searchResults.style.display = 'none'; // Hide search results
        }
    }

    // Function to close the video player modal
    function closePlayer() {
        videoPlayerModal.style.display = 'none';
        searchResults.style.display = 'grid'; // Show search results again
        youtubePlayer.src = ''; // Clear the iframe source
        // Optionally, remove the videoId from the URL without reloading
        window.history.pushState({}, document.title, window.location.pathname);
    }

    // Event listener for the close button
    if (closeButton) {
        closeButton.addEventListener('click', closePlayer);
    }

    // Check if videoId is in the URL on page load
    const initialVideoId = getVideoIdFromUrl();
    if (initialVideoId) {
        showPlayer(initialVideoId);
    }

    // Function to show main content and hide password protection
    function showMainContent() {
        if (passwordProtectionDiv && mainContentWrapper) {
            passwordProtectionDiv.style.display = 'none';
            mainContentWrapper.style.display = 'flex'; // Or 'block' depending on layout
            passwordProtectionDiv.style.display = 'none';
            mainContentWrapper.style.display = 'flex'; // Or 'block' depending on layout
        } else {
            // console.log('Error: passwordProtectionDiv or mainContentWrapper not found in showMainContent.'); // Keep this for potential future debugging
        }
    }

    // Function to handle incorrect password
    function showPasswordError(message) {
        if (passwordError) {
            passwordError.textContent = message;
            passwordError.textContent = message;
        } else {
            // console.log('Error: passwordError element not found in showPasswordError.'); // Keep this for potential future debugging
        }
    }

    // Event listener for password submission
    if (passwordSubmitButton) {
        passwordSubmitButton.addEventListener('click', () => {
            if (passwordInput.value === correctPassword) {
                showMainContent();
            } else {
                showPasswordError('Incorrect password. Please try again.');
            }
        });
    }

    // Initial check on load (if password protection is visible)
    // The HTML sets initial display, so we just need to ensure the event listener is set up.
    // If the user enters the correct password, showMainContent will be called.

    // If the page loads and password protection is visible, we don't need to do anything else here.
    // The user will interact with the password input.

    // If the password protection div is not present (e.g., if it was bypassed or removed),
    // we should ensure the main content is visible. This is a fallback.
    if (!passwordProtectionDiv && mainContentWrapper) {
        mainContentWrapper.style.display = 'flex'; // Or 'block'
    } else if (passwordProtectionDiv) {
        // console.log('Password protection div is present on load.'); // Keep this for potential future debugging
    }


    // Function to save data to localStorage
    function saveToCache(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            // console.log(`Saved to cache: ${key}`); // Keep this for potential future debugging
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            // Optionally, clear cache if it's full
            if (e.name === 'QuotaExceededError') {
                console.warn("LocalStorage quota exceeded. Clearing cache.");
                localStorage.clear();
            }
        }
    }

    // Function to load data from localStorage
    function loadFromCache(key) {
        try {
            const cachedData = localStorage.getItem(key);
            if (cachedData) {
                // console.log(`Loaded from cache: ${key}`); // Keep this for potential future debugging
                return JSON.parse(cachedData);
            }
        } catch (e) {
            console.error("Error loading from localStorage:", e);
        }
        return null;
    }

    searchButton.addEventListener('click', () => {
        currentSearchTerm = searchInput.value;
        if (currentSearchTerm) {
            // Reset state for a new search
            nextPageToken = null;
            noMoreResults = false;
            searchResults.innerHTML = ''; // Clear previous results
            // Remove existing load more button if any
            if (loadMoreButton) {
                loadMoreButton.remove();
                loadMoreButton = null;
            }
            searchYouTube(currentSearchTerm, nextPageToken);
        } else {
            searchResults.innerHTML = '<p>Please enter a search term.</p>';
        }
    });

    // Event listener for "Enter" key on search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission
            searchButton.click(); // Simulate a click on the search button
        }
    });

    function searchYouTube(searchTerm, token) {
        if (isLoading || noMoreResults) return; // Prevent multiple fetches or if no more results
        isLoading = true;

        const apiKey = 'AIzaSyCsH9yBSAdjtgLoktHoFBoRftmR-ymjKek';
        // Construct URL with token if available, and set maxResults to 24
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchTerm}&key=${apiKey}&maxResults=50&type=video${token ? `&pageToken=${token}` : ''}`;

        // Construct a unique cache key for the current search term and page token
        const cacheKey = `youtube_search_${searchTerm}_${token || 'initial'}`;

        // Load from localStorage cache if available
        const cachedData = loadFromCache(cacheKey);
        if (cachedData) {
            // console.log(`Using cached results for: ${cacheKey}`); // Keep this for potential future debugging
            responseDataGlobal = { items: cachedData.searchItems };
            displayResults(cachedData.searchItems, cachedData.videoDetails || null, token === null);
            nextPageToken = cachedData.nextPageToken;

            if (!nextPageToken) {
                noMoreResults = true;
                if (searchResults.innerHTML.indexOf('<p>No more Results!</p>') === -1) {
                    searchResults.innerHTML += '<p>No more Results!</p>';
                }
                if (loadMoreButton) {
                    loadMoreButton.remove();
                    loadMoreButton = null;
                }
            } else {
                if (!loadMoreButton) {
                    loadMoreButton = document.createElement('button');
                    loadMoreButton.textContent = 'Load More';
                    loadMoreButton.classList.add('load-more-button');
                    searchResults.appendChild(loadMoreButton);
                    loadMoreButton.addEventListener('click', () => {
                        searchYouTube(currentSearchTerm, nextPageToken);
                    });
                }
            }
            isLoading = false;
            return; // Exit function after using cache
        }

        fetch(url)
            .then(response => {
                console.log('Search API URL:', url);
                console.log('Search API response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => { // Renamed responseData to data for clarity within this block
                responseDataGlobal = data; // Store in global variable
                console.log('Search API data:', responseDataGlobal);

                // Handle "No Results!" case for initial search
                if (!responseDataGlobal.items || responseDataGlobal.items.length === 0) {
                    if (token === null) { // Only show "No Results!" on the initial search
                        searchResults.innerHTML = '<p>No Results!</p>';
                    } else { // If it's a subsequent load and no items, it means no more results
                        searchResults.innerHTML += '<p>No more Results!</p>';
                        noMoreResults = true;
                    }
                    isLoading = false;
                    // Remove load more button if it exists
                    if (loadMoreButton) {
                        loadMoreButton.remove();
                        loadMoreButton = null;
                    }
                    return;
                }

                const videoIds = responseDataGlobal.items.map(item => item.id.videoId).join(',');
                return fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`);
            })
            .then(response => {
                console.log('Videos API response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(videoData => {
                console.log('Videos API data:', videoData);
                
                // Save results to localStorage cache for the current page
                saveToCache(cacheKey, {
                    searchItems: responseDataGlobal.items,
                    videoDetails: videoData.items,
                    nextPageToken: responseDataGlobal.nextPageToken
                });

                // Use responseDataGlobal.items for search results and videoData.items for statistics
                displayResults(responseDataGlobal.items, videoData.items, token === null);
                nextPageToken = responseDataGlobal.nextPageToken; // Store the next page token

                if (!nextPageToken) {
                    noMoreResults = true; // Set flag if no next page token
                    // Append "No more Results!" if it's not already there and it's the end of all results
                    if (searchResults.innerHTML.indexOf('<p>No more Results!</p>') === -1) {
                        searchResults.innerHTML += '<p>No more Results!</p>';
                    }
                    // Remove load more button if it exists
                    if (loadMoreButton) {
                        loadMoreButton.remove();
                        loadMoreButton = null;
                    }
                } else {
                    // Show load more button if there are more results
                    if (!loadMoreButton) {
                        loadMoreButton = document.createElement('button');
                        loadMoreButton.textContent = 'Load More';
                        loadMoreButton.classList.add('load-more-button'); // Add a class for styling
                        searchResults.appendChild(loadMoreButton);

                        loadMoreButton.addEventListener('click', () => {
                            searchYouTube(currentSearchTerm, nextPageToken);
                        });
                    }
                }
                isLoading = false;
            })
            .catch(error => {
                console.error('Error:', error);
                // Display error message, potentially appending if it's not the first load
                if (token === null) {
                    searchResults.innerHTML = `<p>Error fetching results: ${error.message}</p>`;
                } else {
                    searchResults.innerHTML += `<p>Error fetching more results: ${error.message}</p>`;
                }
                isLoading = false;
                // Remove load more button if it exists and an error occurs
                if (loadMoreButton) {
                    loadMoreButton.remove();
                    loadMoreButton = null;
                }
            });
    }

    function displayResults(searchResults, videoDetails, isFirstLoad) {
        const searchResultsElement = document.getElementById('search-results');
        // If it's the first load, clear the element. Otherwise, append.
        if (isFirstLoad) {
            searchResultsElement.innerHTML = '';
        }

        searchResults.forEach((item, index) => {
            const videoId = item.id.videoId;
            let title = item.snippet.title;
            if (title.length > 41) { // Truncate titles longer than 41 characters
                title = title.substring(0, 38) + '...'; // Truncate to 38 characters and add ellipsis
            }
            const channelName = item.snippet.channelTitle;
            const thumbnail = item.snippet.thumbnails.high.url;
            let viewCount = 'N/A';
            // Ensure videoDetails and statistics exist before accessing viewCount
            if (videoDetails && videoDetails[index] && videoDetails[index].statistics) {
                viewCount = videoDetails[index].statistics.viewCount;
            } else {
                console.warn('View count not found for video ID:', videoId);
            }

            const videoItemDiv = document.createElement('div');
            videoItemDiv.classList.add('video-item');
            videoItemDiv.onclick = () => showPlayer(videoId);
            videoItemDiv.innerHTML = `
                <img src="${thumbnail}" alt="${title}">
                <h3>${title}</h3>
                <p>${channelName} - ${formatViewCount(viewCount)} views</p>
            `;
            searchResultsElement.appendChild(videoItemDiv);
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
 
 });

// Removed scroll event listener as we are using a button for lazy loading
// window.addEventListener('scroll', () => { ... });