const apiKey = "a58786c2c89acd6f0fa2d57fdee642cd";

const movieList = document.getElementById('movie-list');
const pageNumberDisplay = document.getElementById('page-number');
const loader = document.getElementById('loader');
const genreSelect = document.getElementById('genreSelect');
const perPageSelect = document.getElementById('perPage');
const pagination =document.getElementById('pagination');



let perPage = parseInt(perPageSelect.value, 10);
let selectedGenre = '';
let currentPage = 1;

async function fetchGenres() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=fr-FR`);
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

// select genre listener
genreSelect.addEventListener('change', () => {
  selectedGenre = genreSelect.value;
  currentPage = 1;
  fetchMovies(currentPage);
});

// films per page listener
perPageSelect.addEventListener('change', () => {
  perPage = parseInt(perPageSelect.value, 10);
  fetchMovies(currentPage);
});

async function fetchMovies(page = 1) {
  loader.style.display = 'block';
  movieList.innerHTML = ''; 

  let url = selectedGenre 
    ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=fr-FR&page=${page}&with_genres=${selectedGenre}`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=fr-FR&page=${page}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erreur dans le chargement des films');

    const data = await response.json();
    displayMovies(data.results);
    pageNumberDisplay.textContent = page;
    currentPage = page;

    renderPagination(page, data.total_pages);
    
  } catch (error) {
    movieList.innerHTML = `<p>Erreur de récupération des films : ${error.message}</p>`;
  } finally {
    loader.style.display = 'none';
  }
}

function displayMovies(movies) {
  movieList.innerHTML = '';
  movies.slice(0, perPage).forEach(movie => {
    const card = document.createElement('div');
    card.classList.add('movie-card');
    // on stocke l’id et le type pour la redirection
    card.dataset.id   = movie.id;
    card.dataset.type = 'movie';
    card.innerHTML = `
      <h3>${movie.title}</h3>
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
      <p>${movie.release_date}</p>
    `;
    // au clic, on va vers details.html?type=movie&id=xxx
    card.addEventListener('click', () => {
      const { type, id } = card.dataset;
      window.location.href = `details.html?type=${type}&id=${id}`;
    });
    movieList.appendChild(card);
  });
}

function renderPagination(current, total) {
  pagination.innerHTML = '';

  // Limit 7
  const maxPagesToShow = 7;
  let startPage = Math.max(1, current - 3);
  let endPage = Math.min(total, current + 3);

  if (current <= 4) endPage = Math.min(total, maxPagesToShow);
  if (current >= total - 3) startPage = Math.max(1, total - maxPagesToShow + 1);

  // Button "Précédent"
  if (current > 1) {
    const prev = createPageButton('«', current - 1);
    pagination.appendChild(prev);
  }

  // Page button
  for (let i = startPage; i <= endPage; i++) {
    const btn = createPageButton(i, i);
    if (i === current) btn.classList.add('active');
    pagination.appendChild(btn);
  }

  // Button "Suivant"
  if (current < total) {
    const next = createPageButton('»', current + 1);
    pagination.appendChild(next);
  }
}

function createPageButton(label, page) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    fetchMovies(page);
  });
  return btn;
}

fetchMovies();
fetchGenres();