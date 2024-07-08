document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const firstPageButton = document.getElementById('first-page');
    const lastPageButton = document.getElementById('last-page');
    const resultsContainer = document.getElementById('results');
    const pageNumbersContainer = document.getElementById('page-numbers');
    let currentPage = 1;
    let currentQuery = '';
    let totalResults = 0;
    let totalPages = 0;
    let allResults = {};

    const clientSideId = '66887848f36a691031574107';  // Replace with your actual client-side ID

    // Toggle between user1 and user2 for demonstration by commenting/uncommenting the appropriate line
    const ldclient = LDClient.initialize(clientSideId, {
        key: 'user1' // Static user key for testing
        // key: 'user2' // Static user key for testing-- the last page button == false
        // key: 'user3' // Static user key for testing-- in beta segment
    });

    ldclient.on('ready', () => {
        console.log('LaunchDarkly client ready');
        handleFlagUpdates(ldclient);

        // Listen for changes to any flags
        ldclient.on('change', (changes) => {
            console.log('LaunchDarkly Flags Changed:', changes);
            handleFlagUpdates(ldclient);
        });
    });

    function handleFlagUpdates(ldclient) {
        const firstPageFlag = ldclient.variation('first-button', false);
        const lastPageFlag = ldclient.variation('last-button', false);

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
        currentPage = 1;
        currentQuery = searchInput.value;
        fetchInitialResults();
    });

    // Event listener for pressing Enter in the search input
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            currentPage = 1;
            currentQuery = searchInput.value;
            fetchInitialResults();
        }
    });

    // Event listener for previous page button click
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchPageResults(currentPage);
        }
    });

    // Event listener for next page button click
    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchPageResults(currentPage);
        }
    });

    // Event listener for first page button click
    firstPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage = 1;
            fetchPageResults(currentPage);
        }
    });

    // Event listener for last page button click
    lastPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage = totalPages;
            fetchPageResults(currentPage, true);
        }
    });

    // Event listener for clicking page numbers
    pageNumbersContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') {
            currentPage = parseInt(event.target.textContent);
            fetchPageResults(currentPage);
        }
    });

    // Function to fetch initial search results
    function fetchInitialResults() {
        console.log(`Fetching initial results for: ${currentQuery}`);
        const startTime = performance.now();
        fetch(`http://127.0.0.1:5000/search?q=${encodeURIComponent(currentQuery)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const endTime = performance.now();
                console.log('Data received:', data);

                allResults[currentPage] = data.books;
                totalResults = data.totalItems;
                totalPages = Math.ceil(totalResults / 10);

                console.log(`Total results: ${totalResults}, Total pages: ${totalPages}`);

                document.getElementById('total-results').textContent = totalResults;
                document.getElementById('common-author').textContent = data.mostCommonAuthor;
                document.getElementById('earliest-date').textContent = data.earliestPubDate;
                document.getElementById('latest-date').textContent = data.latestPubDate;
                document.getElementById('response-time').textContent = ((endTime - startTime) / 1000).toFixed(2);

                displayResults();
                updatePagination();
            })
            .catch(error => {
                console.error('Error fetching results:', error);
            });
    }

    // Function to fetch results for a specific page
    function fetchPageResults(page, isLastPage = false) {
        const startIndex = (page - 1) * 10;
        if (allResults[page]) {
            displayResults();
            updatePagination();
            return;
        }
        console.log(`Fetching results for page ${page}, start index ${startIndex}`);
        fetch(`http://127.0.0.1:5000/fetch_page?q=${encodeURIComponent(currentQuery)}&startIndex=${startIndex}`)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 500 && isLastPage) {
                        console.log('Tracking fetch-page-error for last page');
                        sendSlackMessage(`500 error occurred on last page fetch: Page ${page}, Start Index ${startIndex}`);
                    }
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(`Data received for page ${page}:`, data);
                allResults[page] = data.books;
                displayResults();
                updatePagination();
            })
            .catch(error => {
                console.error('Error fetching page results:', error);
                if (isLastPage) {
                    console.log('Tracking fetch-page-error for last page');
                    sendSlackMessage(`500 error occurred on last page fetch: Page ${page}, Start Index ${startIndex}, Error: ${error.message}`);
                }
            });
    }

    // Function to send a message to Slack via the server-side proxy
    function sendSlackMessage(message) {
        fetch('http://127.0.0.1:5000/send_slack_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: message
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send Slack message');
            }
            console.log('Slack message sent successfully');
        })
        .catch(error => {
            console.error('Error sending Slack message:', error);
        });
    }

    // Function to display search results
    function displayResults() {
        console.log(`Displaying results for page: ${currentPage}`);
        resultsContainer.innerHTML = '';

        const books = allResults[currentPage];
        for (let book of books) {
            const li = document.createElement('li');
            li.textContent = `${book.authors} - ${book.title}`;

            const description = document.createElement('div');
            description.className = 'description';
            description.textContent = book.description ? book.description : 'No description available.';
            description.style.display = 'none';

            li.appendChild(description);
            li.addEventListener('click', () => {
                description.style.display = description.style.display === 'none' ? 'block' : 'none';
            });

            resultsContainer.appendChild(li);
        }
    }

    // Function to update pagination controls
    function updatePagination() {
        console.log('Updating pagination:', { currentPage, totalPages });
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        pageNumbersContainer.innerHTML = '';
        const pageRange = getPageRange(currentPage, totalPages, 7);

        console.log('Page range:', pageRange);

        pageRange.forEach(page => {
            const span = document.createElement('span');
            span.textContent = page;
            if (page === currentPage) {
                span.classList.add('active');
            }
            pageNumbersContainer.appendChild(span);
        });
    }

    // Function to get the range of pages to display in the pagination
    function getPageRange(currentPage, totalPages, maxPages) {
        const half = Math.floor(maxPages / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, currentPage + half);

        if (end - start < maxPages - 1) {
            if (start === 1) {
                end = Math.min(totalPages, start + maxPages - 1);
            } else if (end === totalPages) {
                start = Math.max(1, end - maxPages + 1);
            }
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }
});
