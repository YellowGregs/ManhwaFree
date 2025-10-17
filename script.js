let currentPage = 1;
let totalPages = 1;
let currentQuery = '';
let currentManga = {};

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.id;
    switch (page) {
        case 'search':
            initSearch();
            break;
        case 'details':
            initDetails();
            break;
        case 'chapter':
            initChapter();
            break;
    }
});

function initSearch() {
    document.getElementById('searchButton').addEventListener('click', () => {
        currentQuery = document.getElementById('searchInput').value.trim();
        if (!currentQuery) return alert('Please enter a search query.');
        currentPage = 1;
        search(currentQuery, currentPage);
    });
}

async function search(query, page = 1) {
    try {
        const apiUrl = `/api/search?s=${encodeURIComponent(query)}&page=${page}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(`Search API error: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        const results = data.results || [];
        const pagination = data.pagination || { currentPage: 1, totalPages: 1 };

        currentPage = pagination.currentPage || 1;
        totalPages = pagination.totalPages || 1;

        showResults(results);
        updatePaginationControls();
    } catch (err) {
        console.error('Search failed:', err);
    }
}

function showResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    if (results.length === 0) {
        resultsList.innerHTML = '<li>No results found</li>';
        document.getElementById('searchResults').classList.remove('hidden');
        return;
    }

    results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.textContent = result.title;
        listItem.addEventListener('click', () => {
            const mangaTitle = result.title.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `details.html?title=${mangaTitle}`;
        });
        resultsList.appendChild(listItem);
    });
    document.getElementById('searchResults').classList.remove('hidden');
}

function updatePaginationControls() {
    const prevButton = document.getElementById('prevPageButton');
    const nextButton = document.getElementById('nextPageButton');

    prevButton.classList.toggle('hidden', currentPage === 1);
    nextButton.classList.toggle('hidden', currentPage >= totalPages);

    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            search(currentQuery, currentPage);
        }
    };

    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            search(currentQuery, currentPage);
        }
    };
}
