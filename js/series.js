const apiKey = "a58786c2c89acd6f0fa2d57fdee642cd";

// Récupération des éléments du DOM
const seriesList     = document.getElementById('movie-list'); // si tu préfères, renomme en "series-list" et mets à jour le HTML
const pageNumberDisplay = document.getElementById('page-number'); // facultatif, voir explications précédentes
const loader         = document.getElementById('loader');
const genreSelect    = document.getElementById('genreSelect');
const perPageSelect  = document.getElementById('perPage');
const pagination     = document.getElementById('pagination');

let perPage = parseInt(perPageSelect.value, 10);
let selectedGenre = '';
let currentPage = 1;

// --------------------------
// 1. Chargement des genres pour les séries
// --------------------------
async function fetchGenres() {
  try {
    // Pour les séries, on utilise le endpoint genre tv
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

// Écouteur sur changement du select des genres
genreSelect.addEventListener('change', () => {
  selectedGenre = genreSelect.value;
  currentPage = 1;
  fetchSeries(currentPage);
});

// Écouteur sur le select du nombre de séries par page
perPageSelect.addEventListener('change', () => {
  perPage = parseInt(perPageSelect.value, 10);
  fetchSeries(currentPage);
});

// --------------------------
// 2. Récupération des séries (fetchSeries)
// --------------------------
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

// --------------------------
// 3. Affichage des séries dans la page
// --------------------------
function displaySeries(seriesArray) {
  seriesList.innerHTML = '';
  // On n'affiche que le nombre défini par perPage
  seriesArray.slice(0, perPage).forEach(series => {
    const card = document.createElement('div');
    card.classList.add('movie-card'); // ou "series-card" si tu préfères
    // stocke l'id et le type pour la redirection
    card.dataset.id   = series.id;
    card.dataset.type = 'tv';
    card.innerHTML = `
      <h3>${series.name}</h3>
      <img src="https://image.tmdb.org/t/p/w300${series.poster_path}" alt="${series.name}">
      <p>${series.first_air_date || 'Date inconnue'}</p>
    `;
    // au clic, on va vers details.html?type=tv&id=xxx
    card.addEventListener('click', () => {
      const { type, id } = card.dataset;
      window.location.href = `details.html?type=${type}&id=${id}`;
    });
    seriesList.appendChild(card);
  });
}


// --------------------------
// 4. Pagination numérotée dynamique
// --------------------------
function renderPagination(current, total) {
  pagination.innerHTML = '';

  const maxPagesToShow = 7;
  let startPage = Math.max(1, current - 3);
  let endPage = Math.min(total, current + 3);

  if (current <= 4) endPage = Math.min(total, maxPagesToShow);
  if (current >= total - 3) startPage = Math.max(1, total - maxPagesToShow + 1);

  // Bouton "Précédent"
  if (current > 1) {
    const prev = createPageButton('«', current - 1);
    pagination.appendChild(prev);
  }

  // Boutons numérotés
  for (let i = startPage; i <= endPage; i++) {
    const btn = createPageButton(i, i);
    if (i === current) btn.classList.add('active');
    pagination.appendChild(btn);
  }

  // Bouton "Suivant"
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

// --------------------------
// 5. Appels initiaux
// --------------------------
fetchSeries();
fetchGenres();
