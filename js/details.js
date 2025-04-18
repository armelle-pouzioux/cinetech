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

    // Fallback vers EN si aucun résultat en FR
    if (results.length === 0) {
      url = `https://api.themoviedb.org/3/${type}/${id}/reviews?api_key=${apiKey}&language=en-US&page=1`;
      res = await fetch(url);
      if (!res.ok) throw new Error('Impossible de charger les commentaires');
      ({ results } = await res.json());
    }

    renderReviews(results);
    setupAddReviewForm(type, id, results); // <- formulaire ici
  } catch (err) {
    reviewsSection.innerHTML = `<p>${err.message}</p>`;
  }
}

function renderReviews(comments) {
  reviewsSection.innerHTML = '<h2>Commentaires</h2>';
  const ul = document.createElement('ul');

  if (comments && comments.length > 0) {
    comments.forEach(c => {
      const date = new Date(c.created_at).toLocaleDateString('fr-FR');
      const li = document.createElement('li');
      const pAuthor = document.createElement('p');
      pAuthor.innerHTML = `<strong>${c.author}</strong> <em>(${date})</em>`;
      const pContent = document.createElement('p');
      pContent.textContent = c.content;
      li.appendChild(pAuthor);
      li.appendChild(pContent);
      ul.appendChild(li);
    });
  } else {
    reviewsSection.innerHTML += '<p>Aucun commentaire disponible.</p>';
  }

  // Ajoute les commentaires locaux
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const id = params.get('id');
  const localComments = getLocalComments(type, id);

  localComments.forEach(c => {
    const li = document.createElement('li');
    const pAuthor = document.createElement('p');
    pAuthor.innerHTML = `<strong>${c.author}</strong> <em>(${c.date})</em>`;
    const pContent = document.createElement('p');
    pContent.textContent = c.content;
    li.appendChild(pAuthor);
    li.appendChild(pContent);
    ul.appendChild(li);
  });

  reviewsSection.appendChild(ul);
}

function setupAddReviewForm(type, id, existingComments = []) {
  const addReviewSection = document.getElementById('add-review');
  addReviewSection.innerHTML = ''; // Clear previous form if any

  const form = document.createElement('form');
  const h3 = document.createElement('h3');
  h3.textContent = 'Laisser un commentaire';

  const inputAuthor = document.createElement('input');
  inputAuthor.type = 'text';
  inputAuthor.name = 'author';
  inputAuthor.placeholder = 'Votre nom';
  inputAuthor.required = true;

  const br1 = document.createElement('br');

  const textarea = document.createElement('textarea');
  textarea.name = 'content';
  textarea.placeholder = 'Votre commentaire';
  textarea.required = true;

  const br2 = document.createElement('br');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Envoyer';

  form.appendChild(h3);
  form.appendChild(inputAuthor);
  form.appendChild(br1);
  form.appendChild(textarea);
  form.appendChild(br2);
  form.appendChild(submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const author = inputAuthor.value.trim();
    const content = textarea.value.trim();
    if (!author || !content) return;

    const newComment = {
      author,
      content,
      date: new Date().toLocaleDateString('fr-FR')
    };

    saveLocalComment(type, id, newComment);
    form.reset();
    renderReviews(existingComments); // reaffiche les TMDb + commentaires locaux
  });

  addReviewSection.appendChild(form);
}




function getLocalComments(type, id) {
  const key = `comments-${type}-${id}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveLocalComment(type, id, comment) {
  const key = `comments-${type}-${id}`;
  const comments = getLocalComments(type, id);
  comments.push(comment);
  localStorage.setItem(key, JSON.stringify(comments));
}
