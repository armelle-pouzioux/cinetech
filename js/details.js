const apiKey = "a58786c2c89acd6f0fa2d57fdee642cd";

const detailsSection = document.getElementById('details');
const reviewsSection = document.getElementById('reviews');

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id   = params.get('id');
  
  if (!type || !id || !['movie','tv'].includes(type)) {
    detailsSection.innerHTML = '<p>Erreur : contenu non spécifié ou invalide.</p>';
    return;
  }

  fetchDetails(type, id);
  fetchReviews(type, id);
});

async function fetchDetails(type, id) {
  const url = `https://api.themoviedb.org/3/${type}/${id}` +
              `?api_key=${apiKey}&language=fr-FR&append_to_response=credits`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Impossible de charger les détails');
    const data = await res.json();
    renderDetails(data, type);
  } catch (err) {
    detailsSection.innerHTML = `<p>${err.message}</p>`;
  }
}

function renderDetails(data, type) {
  const title        = data.title || data.name;
  const date         = data.release_date || data.first_air_date || 'Date inconnue';
  const overview     = data.overview || 'Pas de résumé disponible.';
  const genres       = (data.genres || []).map(g => g.name).join(', ');
  const posterPath   = data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : '';
  // Récupérer le réalisateur si movie, ou créateur si séries
  let crewInfo = '';
  if (data.credits && data.credits.crew) {
    if (type === 'movie') {
      const director = data.credits.crew.find(m => m.job === 'Director');
      crewInfo = director ? `Réalisateur : ${director.name}` : '';
    } else {
      const creators = data.created_by.map(c => c.name).join(', ');
      crewInfo = creators ? `Créateur·rice·s : ${creators}` : '';
    }
  }

  detailsSection.innerHTML = `
    <h1>${title}</h1>
    ${posterPath ? `<img src="${posterPath}" alt="${title}">` : ''}
    <p><strong>Date :</strong> ${date}</p>
    <p><strong>Genres :</strong> ${genres}</p>
    ${crewInfo ? `<p><strong>${crewInfo}</strong></p>` : ''}
    <p><strong>Résumé :</strong> ${overview}</p>
  `;
}

async function fetchReviews(type, id) {
    let url = `https://api.themoviedb.org/3/${type}/${id}/reviews?api_key=${apiKey}&language=fr-FR&page=1`;
    try {
      let res = await fetch(url);
      if (!res.ok) throw new Error('Impossible de charger les commentaires');
      let { results } = await res.json();
  
      // Si aucun commentaire en FR, essaie en EN
      if (results.length === 0) {
        url = `https://api.themoviedb.org/3/${type}/${id}/reviews?api_key=${apiKey}&language=en-US&page=1`;
        res = await fetch(url);
        if (!res.ok) throw new Error('Impossible de charger les commentaires');
        ({ results } = await res.json());
      }
  
      renderReviews(results);
    } catch (err) {
      reviewsSection.innerHTML = `<p>${err.message}</p>`;
    }
}

function renderReviews(comments) {
  reviewsSection.innerHTML = '<h2>Commentaires</h2>';
  if (!comments || comments.length === 0) {
    reviewsSection.innerHTML += '<p>Aucun commentaire disponible.</p>';
    return;
  }
  const ul = document.createElement('ul');
  comments.forEach(c => {
    const date = new Date(c.created_at).toLocaleDateString('fr-FR');
    const li = document.createElement('li');
    li.innerHTML = `
      <p><strong>${c.author}</strong> <em>(${date})</em></p>
      <p>${c.content}</p>
    `;
    ul.appendChild(li);
  });
  reviewsSection.appendChild(ul);
}