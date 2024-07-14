// Add an event listener for the DOMContentLoaded event to ensure the script runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get references to various HTML elements by their IDs
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const firstPageButton = document.getElementById('first-page');
    const lastPageButton = document.getElementById('last-page');
    const resultsContainer = document.getElementById('results');
    const pageNumbersContainer = document.getElementById('page-numbers');
    let currentPage = 1; // Variable to keep track of the current page
    let currentQuery = ''; // Variable to store the current search query
    let totalResults = 0; // Variable to store the total number of search results
    let totalPages = 0; // Variable to store the total number of pages
    let allResults = {}; // Object to cache the search results for each page

    // Replace with your actual client-side ID for LaunchDarkly
    const clientSideId = '<your-client-side-ID>';

    // Initialize the LaunchDarkly client with a static user key for testing
    const ldclient = LDClient.initialize(clientSideId, {
        key: 'user1' // Static user key for testing
        // key: 'user2' // Static user key for testing-- the last page button == false
        // key: 'user3' // Static user key for testing-- in beta segment
    });

    // Event handler for when the LaunchDarkly client is ready
    ldclient.on('ready', () => {
        console.log('LaunchDarkly client ready');
        handleFlagUpdates(ldclient); // Update UI based on feature flags

        // Listen for changes to any feature flags and update UI accordingly
        ldclient.on('change', (changes) => {
            console.log('LaunchDarkly Flags Changed:', changes);
            handleFlagUpdates(ldclient);
        });
    });

    // Function to handle updates based on LaunchDarkly feature flags
    function handleFlagUpdates(ldclient) {
        const firstPageFlag = ldclient.variation('first-button', false); // Get the value of the 'first-button' feature flag
        const lastPageFlag = ldclient.variation('last-button', false); // Get the value of the 'last-button' feature flag

        console.log('LaunchDarkly Flags:', { firstPageFlag, lastPageFlag });

        // Show or hide the first page button based on the feature flag
        if (firstPageFlag) {
            console.log('Displaying first-page button');
            firstPageButton.style.display = 'block';
        } else {
            console.log('Hiding first-page button');
            firstPageButton.style.display = 'none';
        }

        // Show or hide the last page button based on the feature flag
        if (lastPageFlag) {
            console.log('Displaying last-page button');
            lastPageButton.style.display = 'block';
        } else {
            console.log('Hiding last-page button');
            lastPageButton.style.display = 'none';
        }
    }

    // Event listener for search button click
    searchButton.addEventListener('click', () => {
        currentPage = 1; // Reset to the first page
        currentQuery = searchInput.value; // Get the current search query from the input
        fetchInitialResults(); // Fetch search results for the initial query
    });

    // Event listener for pressing Enter in the search input
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') { // Check if the Enter key was pressed
            currentPage = 1; // Reset to the first page
            currentQuery = searchInput.value; // Get the current search query from the input
            fetchInitialResults(); // Fetch search results for the initial query
        }
    });

    // Event listener for previous page button click
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) { // Check if there is a previous page
            currentPage--; // Decrement the current page number
            fetchPageResults(currentPage); // Fetch search results for the previous page
        }
    });

    // Event listener for next page button click
    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) { // Check if there is a next page
            currentPage++; // Increment the current page number
            fetchPageResults(currentPage); // Fetch search results for the next page
        }
    });

    // Event listener for first page button click
    firstPageButton.addEventListener('click', () => {
        if (currentPage > 1) { // Check if the current page is not the first page
            currentPage = 1; // Set to the first page
            fetchPageResults(currentPage); // Fetch search results for the first page
        }
    });

    // Event listener for last page button click
    lastPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) { // Check if the current page is not the last page
            currentPage = totalPages; // Set to the last page
            fetchPageResults(currentPage, true); // Fetch search results for the last page, flagging it as such
        }
    });

    // Event listener for clicking page numbers
    pageNumbersContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') { // Check if the clicked element is a span
            currentPage = parseInt(event.target.textContent); // Get the page number from the clicked span
            fetchPageResults(currentPage); // Fetch search results for the specified page
        }
    });

    // Function to fetch initial search results
    function fetchInitialResults() {
        console.log(`Fetching initial results for: ${currentQuery}`);
        const startTime = performance.now(); // Record the start time for performance measurement
        fetch(`http://127.0.0.1:5000/search?q=${encodeURIComponent(currentQuery)}`) // Make a fetch request to the search endpoint
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    throw new Error('Network response was not ok'); // Throw an error
                }
                return response.json(); // Parse the response as JSON
            })
            .then(data => {
                const endTime = performance.now(); // Record the end time for performance measurement
                console.log('Data received:', data);

                allResults[currentPage] = data.books; // Cache the results for the current page
                totalResults = data.totalItems; // Store the total number of results
                totalPages = Math.ceil(totalResults / 10); // Calculate the total number of pages

                console.log(`Total results: ${totalResults}, Total pages: ${totalPages}`);

                // Update UI elements with the received data
                document.getElementById('total-results').textContent = totalResults;
                document.getElementById('common-author').textContent = data.mostCommonAuthor;
                document.getElementById('earliest-date').textContent = data.earliestPubDate;
                document.getElementById('latest-date').textContent = data.latestPubDate;
                document.getElementById('response-time').textContent = ((endTime - startTime) / 1000).toFixed(2);

                displayResults(); // Display the search results
                updatePagination(); // Update the pagination controls
            })
            .catch(error => {
                console.error('Error fetching results:', error); // Log any errors
            });
    }

    // Function to fetch results for a specific page
    function fetchPageResults(page, isLastPage = false) {
        const startIndex = (page - 1) * 10; // Calculate the starting index for the results
        if (allResults[page]) { // Check if results for the page are already cached
            displayResults(); // Display the cached results
            updatePagination(); // Update the pagination controls
            return;
        }
        console.log(`Fetching results for page ${page}, start index ${startIndex}`);
        fetch(`http://127.0.0.1:5000/fetch_page?q=${encodeURIComponent(currentQuery)}&startIndex=${startIndex}`) // Fetch results for the specific page
            .then(response => {
                if (!response.ok) { // Check if the response is not OK
                    if (response.status === 500 && isLastPage) { // Special handling for 500 error on the last page
                        console.log('Tracking fetch-page-error for last page');
                        sendSlackMessage(`500 error occurred on last page fetch: Page ${page}, Start Index ${startIndex}`); // Send a Slack message for the error
                        ldclient.track('fetch-page-error', { // Track the error in LaunchDarkly
                            page: page,
                            startIndex: startIndex,
                            query: currentQuery,
                            error: '500 Internal Server Error'
                        });
                    }
                    throw new Error('Network response was not ok'); // Throw an error
                }
                return response.json(); // Parse the response as JSON
            })
            .then(data => {
                console.log(`Data received for page ${page}:`, data);
                allResults[page] = data.books; // Cache the results for the page
                displayResults();
