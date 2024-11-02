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
        const query = document.getElementById('searchInput').value;
        search(query);
    });
}

function initDetails() {
    document.getElementById('backToSearch').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('readChapterButton').addEventListener('click', () => {
        const chapter = document.getElementById('chapterSelect').value;
        const mangaTitle = currentManga.mangaTitle.toLowerCase().replace(/\s+/g, '-');
        window.location.href = `chapter.html?title=${mangaTitle}&chapter=${chapter}`;
    });

    const urlParams = new URLSearchParams(window.location.search);
    const mangaTitle = urlParams.get('title');
    getMangaDetails(`https://manhwa-clan.vercel.app/api/${encodeURIComponent(mangaTitle)}/details`);
}

function initChapter() {
    document.getElementById('backToDetails').addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const mangaTitle = urlParams.get('title');
        window.location.href = `details.html?title=${mangaTitle}`;
    });

    document.getElementById('prevChapterButton').addEventListener('click', prevChapter);
    document.getElementById('nextChapterButton').addEventListener('click', nextChapter);
    document.getElementById('prevChapterButtonBottom').addEventListener('click', prevChapter);
    document.getElementById('nextChapterButtonBottom').addEventListener('click', nextChapter);

    document.getElementById('chapterDropdown').addEventListener('change', () => {
        const chapter = document.getElementById('chapterDropdown').value;
        updateChapter(chapter);
    });

    document.getElementById('chapterDropdownBottom').addEventListener('change', () => {
        const chapter = document.getElementById('chapterDropdownBottom').value;
        updateChapter(chapter);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const mangaTitle = urlParams.get('title');
    const chapter = urlParams.get('chapter');
    getChapterDetails(mangaTitle, chapter);
}

async function search(query) {
    const response = await fetch(`https://manhwa-clan.vercel.app/api/search/${encodeURIComponent(query)}`);
    const data = await response.json();
    showResults(data.results);
}

function showResults(results) {
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = '';
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

async function getMangaDetails(apiUrl) {
    const response = await fetch(apiUrl);
    const data = await response.json();
    showMangaDetails(data);
}

async function showMangaDetails(details) {
    currentManga = details;
    const imageUrl = await getHighQualityImage(details.imageUrl); 
    document.getElementById('mangaTitle').textContent = details.mangaTitle;
    document.getElementById('mangaCover').src = imageUrl;
    document.getElementById('mangaSummary').textContent = details.summary || "No summary available.";
    document.getElementById('mangaGenres').textContent = details.genres.join(', ');
    document.getElementById('mangaRating').textContent = details.rating;
    document.getElementById('mangaStatus').textContent = details.status;

    const chapterSelect = document.getElementById('chapterSelect');
    chapterSelect.innerHTML = '';
    for (let i = 1; i <= details.chapters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Chapter ${i}`;
        chapterSelect.appendChild(option);
    }
}

async function getHighQualityImage(imageUrl) {
    const response = await fetch(`https://manhwa-clan.vercel.app/api/image?url=${encodeURIComponent(imageUrl)}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

async function getChapterDetails(name, chapter) {
    const detailsResponse = await fetch(`https://manhwa-clan.vercel.app/api/${encodeURIComponent(name)}/details`);
    const detailsData = await detailsResponse.json();
    updateChapterDropdowns(detailsData.chapters);

    getChapterImages(name, chapter);
}

async function getChapterImages(name, chapter) {
    const response = await fetch(`https://manhwa-clan.vercel.app/api/${encodeURIComponent(name)}/${chapter}/images`);
    if (!response.ok) {
        console.error(`Failed to fetch chapter images: ${response.statusText}`);
        return;
    }
    const data = await response.json();
    showChapterImages(data.images);
}

async function showChapterImages(images) {
    const imagesContainer = document.getElementById('chapterImages');
    if (!imagesContainer) {
        console.error('Images container not found');
        return;
    }
    imagesContainer.innerHTML = '';
    for (const url of images) {
        const imgUrl = await getImage(url);
        const img = document.createElement('img');
        img.src = imgUrl;
        imagesContainer.appendChild(img);
    }
}

function prevChapter() {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaTitle = urlParams.get('title');
    let chapter = parseInt(urlParams.get('chapter'));
    if (chapter > 1) {
        chapter--;
        window.location.href = `chapter.html?title=${mangaTitle}&chapter=${chapter}`;
    }
}

function nextChapter() {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaTitle = urlParams.get('title');
    let chapter = parseInt(urlParams.get('chapter'));
    chapter++;
    window.location.href = `chapter.html?title=${mangaTitle}&chapter=${chapter}`;
}

function updateChapter(chapter) {
    const urlParams = new URLSearchParams(window.location.search);
    const mangaTitle = urlParams.get('title');
    window.location.href = `chapter.html?title=${mangaTitle}&chapter=${chapter}`;
}

function updateChapterDropdowns(totalChapters) {
    const urlParams = new URLSearchParams(window.location.search);
    const chapter = urlParams.get('chapter');
    const chapterDropdown = document.getElementById('chapterDropdown');
    const chapterDropdownBottom = document.getElementById('chapterDropdownBottom');
    chapterDropdown.innerHTML = '';
    chapterDropdownBottom.innerHTML = '';

    for (let i = 1; i <= totalChapters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Chapter ${i}`;
        chapterDropdown.appendChild(option);
        chapterDropdownBottom.appendChild(option.cloneNode(true));
    }

    chapterDropdown.value = chapter;
    chapterDropdownBottom.value = chapter;
}

async function getImage(imageUrl) {
    const response = await fetch(`https://manhwa-clan.vercel.app/api/image?url=${encodeURIComponent(imageUrl)}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
