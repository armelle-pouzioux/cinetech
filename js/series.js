const apiKey = "a58786c2c89acd6f0fa2d57fdee642cd";

const seriesList     = document.getElementById('movie-list'); // si tu préfères, renomme en "series-list" et mets à jour le HTML
const pageNumberDisplay = document.getElementById('page-number'); // facultatif, voir explications précédentes
const loader         = document.getElementById('loader');
const genreSelect    = document.getElementById('genreSelect');
const perPageSelect  = document.getElementById('perPage');
const pagination     = document.getElementById('pagination');

let perPage = parseInt(perPageSelect.value, 10);
let selectedGenre = '';
let currentPage = 1;

async function fetchGenres() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=fr-FR`);
    const data = await res.json();

    data.genres.forEach(genre => {
      const option = document.createElement('option');
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Erreur récupération genres :', err);
  }
}

// Select genre listener
genreSelect.addEventListener('change', () => {
  selectedGenre = genreSelect.value;
  currentPage = 1;
  fetchSeries(currentPage);
});

// Listener series per page
perPageSelect.addEventListener('change', () => {
  perPage = parseInt(perPageSelect.value, 10);
  fetchSeries(currentPage);
});

async function fetchSeries(page = 1) {
  loader.style.display = 'block';
  seriesList.innerHTML = '';
  pagination.innerHTML = ''; // Réinitialise la pagination

  // Utilise l’endpoint Discover si un genre est sélectionné, sinon l’endpoint Popular
  let url = selectedGenre 
    ? `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&language=fr-FR&page=${page}&with_genres=${selectedGenre}`
    : `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=fr-FR&page=${page}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur dans le chargement des séries');

    const data = await response.json();
    displaySeries(data.results);
    // Si tu souhaites afficher le numéro de page, assure-toi d'avoir un élément dans le HTML avec id "page-number"
    if(pageNumberDisplay) {
      pageNumberDisplay.textContent = page;
    }
    currentPage = page;

    renderPagination(page, data.total_pages);
    
  } catch (error) {
    seriesList.innerHTML = `<p>Erreur de récupération des séries : ${error.message}</p>`;
  } finally {
    loader.style.display = 'none';
  }
}

function displaySeries(seriesArray) {
  seriesList.innerHTML = '';
  seriesArray.slice(0, perPage).forEach(series => {
    const div = document.createElement('div');
    div.classList.add('movie-card');
    div.innerHTML = `
      <h3>${series.name}</h3>
      <img src="https://image.tmdb.org/t/p/w300${series.poster_path}" alt="${series.name}">
      <p>${series.first_air_date || 'Date inconnue'}</p>
    `;
    seriesList.appendChild(div);
  });
}

function renderPagination(current, total) {
  pagination.innerHTML = '';

  const maxPagesToShow = 7;
  let startPage = Math.max(1, current - 3);
  let endPage = Math.min(total, current + 3);

  if (current <= 4) endPage = Math.min(total, maxPagesToShow);
  if (current >= total - 3) startPage = Math.max(1, total - maxPagesToShow + 1);


  if (current > 1) {
    const prev = createPageButton('«', current - 1);
    pagination.appendChild(prev);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = createPageButton(i, i);
    if (i === current) btn.classList.add('active');
    pagination.appendChild(btn);
  }

  if (current < total) {
    const next = createPageButton('»', current + 1);
    pagination.appendChild(next);
  }
}

function createPageButton(label, page) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    fetchSeries(page);
  });
  return btn;
}

fetchSeries();
fetchGenres();
