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
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', () => {
        currentQuery = searchInput.value.trim();
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

        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;

        showResults(results);
        updatePaginationControls();
    } catch (err) {
        console.error('Search failed:', err);
    }
}

function showResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
    if (!results.length) {
        resultsList.innerHTML = '<li>No results found</li>';
        document.getElementById('searchResults').classList.remove('hidden');
        return;
    }

    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result.title;
        li.addEventListener('click', () => {
            const mangaSlug = result.url.split('/').pop();
            window.location.href = `details.html?slug=${mangaSlug}`;
        });
        resultsList.appendChild(li);
    });

    document.getElementById('searchResults').classList.remove('hidden');
}

function updatePaginationControls() {
    const prevButton = document.getElementById('prevPageButton');
    const nextButton = document.getElementById('nextPageButton');

    prevButton.classList.toggle('hidden', currentPage <= 1);
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

function initDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    if (!slug) return alert('No manga selected.');

    document.getElementById('backToSearch').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('readChapterButton').addEventListener('click', () => {
        const chapter = document.getElementById('chapterSelect').value;
        window.location.href = `chapter.html?slug=${slug}&chapter=${chapter}`;
    });

    getMangaDetails(slug);
}

async function getMangaDetails(slug) {
    try {
        const response = await fetch(`/manga/${slug}`);
        if (!response.ok) throw new Error(`Failed to fetch manga details: ${response.status}`);

        const data = await response.json();
        currentManga = data;
        showMangaDetails(data);
    } catch (err) {
        console.error(err);
        alert('Failed to load manga details.');
    }
}

async function showMangaDetails(details) {
    document.getElementById('mangaTitle').textContent = details.mangaTitle || 'Title not available';
    const imageUrl = details.image ? await getImage(details.image) : 'https://via.placeholder.com/150';
    document.getElementById('mangaCover').src = imageUrl;
    document.getElementById('mangaSummary').textContent = details.summary || 'No summary available';
    document.getElementById('mangaGenres').textContent = details.genres?.join(', ') || 'No genres available';
    document.getElementById('mangaRating').textContent = details.rating || 'No rating available';
    document.getElementById('mangaStatus').textContent = details.status || 'Status unknown';

    const chapterSelect = document.getElementById('chapterSelect');
    chapterSelect.innerHTML = '';
    (details.chapters || []).forEach(ch => {
        const option = document.createElement('option');
        option.value = ch.chapterUrl.split('/').pop();
        option.textContent = ch.chapterTitle;
        chapterSelect.appendChild(option);
    });
}

function initChapter() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const chapter = urlParams.get('chapter');
    if (!slug || !chapter) return alert('Missing chapter info.');

    document.getElementById('backToDetails').addEventListener('click', () => {
        window.location.href = `details.html?slug=${slug}`;
    });

    document.getElementById('prevChapterButton').addEventListener('click', () => navigateChapter(slug, chapter, -1));
    document.getElementById('nextChapterButton').addEventListener('click', () => navigateChapter(slug, chapter, 1));

    document.getElementById('chapterDropdown').addEventListener('change', (e) => {
        window.location.href = `chapter.html?slug=${slug}&chapter=${e.target.value}`;
    });

    getChapterDetails(slug, chapter);
}

async function getChapterDetails(slug, chapter) {
    try {
        const response = await fetch(`/manga/${slug}/${chapter}`);
        if (!response.ok) throw new Error(`Failed to fetch chapter: ${response.status}`);
        const data = await response.json();

        updateChapterDropdowns(slug, data);
        showChapterImages(data.images);
    } catch (err) {
        console.error(err);
        alert('Failed to load chapter images.');
    }
}

function updateChapterDropdowns(slug, data) {
    const chapterDropdown = document.getElementById('chapterDropdown');
    chapterDropdown.innerHTML = '';
    (data.chaptersList || []).forEach(ch => {
        const option = document.createElement('option');
        option.value = ch;
        option.textContent = ch;
        chapterDropdown.appendChild(option);
    });
    chapterDropdown.value = new URLSearchParams(window.location.search).get('chapter');
}

async function showChapterImages(images) {
    const container = document.getElementById('chapterImages');
    container.innerHTML = '';
    for (const img of images) {
        const imgEl = document.createElement('img');
        imgEl.src = await getImage(img);
        container.appendChild(imgEl);
    }
}

async function getImage(url) {
    try {
        const res = await fetch(`/api/image?url=${encodeURIComponent(url)}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error('Failed to fetch image:', err);
        return '';
    }
}

function navigateChapter(slug, currentChapter, direction) {
    let chapters = Object.keys(currentManga.chapters || {});
    let index = chapters.indexOf(currentChapter);
    if (index === -1) return;
    index += direction;
    if (index >= 0 && index < chapters.length) {
        window.location.href = `chapter.html?slug=${slug}&chapter=${chapters[index]}`;
    }
}
