const apiKey = "a58786c2c89acd6f0fa2d57fdee642cd";

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM ready — on lance fetchPopular");
  fetchPopular('movie', 'popular-movies');
  fetchPopular('tv',    'popular-tv');
});

async function fetchPopular(type, sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    console.error(`Section #${sectionId} introuvable`);
    return;
  }

  const url = `https://api.themoviedb.org/3/${type}/popular?api_key=${apiKey}&language=fr-FR&page=1`;
  try {
    console.log(`Fetching ${type} populaires…`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const results = data.results.slice(0, 3);
    console.log(`${results.length} ${type} reçus :`, results);

    // Container .movie-list
    const movieList = document.createElement('div');
    movieList.className = 'movie-list';

    results.forEach(item => {
      const title = item.title || item.name;
      const posterPath = item.poster_path
        ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
        : '';

      // Création de la carte
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = `details.html?type=${type}&id=${item.id}`;
      });

      // Titre
      const h3 = document.createElement('h3');
      h3.textContent = title;
      card.appendChild(h3);

      // Image (si dispo)
      if (posterPath) {
        const img = document.createElement('img');
        img.src = posterPath;
        img.alt = title;
        card.appendChild(img);
      }

      movieList.appendChild(card);
    });

    section.appendChild(movieList);

  } catch (err) {
    console.error(err);
    section.innerHTML += `<p style="color:red;">Erreur : ${err.message}</p>`;
  }
}
