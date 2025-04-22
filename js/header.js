document.addEventListener("DOMContentLoaded", async () => {
  const headerElement = document.querySelector("header");
  if (!headerElement) {
    console.error("Élément header non trouvé dans le document");
    return;
  }

  try {
    const response = await fetch("header.html");
    if (!response.ok) throw new Error("Header non chargé");

    const headerHTML = await response.text();
    headerElement.innerHTML = headerHTML;

    const burgerBtn = document.getElementById('burger-button');
    const nav = document.getElementById('nav');
    
    if (!burgerBtn) {
      console.error("Élément 'burger-button' non trouvé dans le header");
    }
    
    if (!nav) {
      console.error("Élément 'nav' non trouvé dans le header");
    }
    
    if (burgerBtn && nav) {
      
      burgerBtn.addEventListener('click', () => {
        console.log("Clic sur le bouton burger détecté");
        burgerBtn.classList.toggle('active');
        nav.classList.toggle('open');
        console.log("État du menu:", nav.classList.contains('open') ? "ouvert" : "fermé");
      });

      const navLinks = nav.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          nav.classList.remove('open');
          burgerBtn.classList.remove('active');
        });
      });
    }

    const logo = document.getElementById('logo');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      const resultsContainer = document.createElement("div");
      resultsContainer.id = "autocomplete-results";
      searchInput.parentElement.appendChild(resultsContainer);

      searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            const results = await searchMovies(query);
            displaySearchResults(results);
          }
        }
      });

      let debounceTimeout = null;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        const query = searchInput.value.trim();

        if (query.length < 2) {
          resultsContainer.innerHTML = '';
          return;
        }

        debounceTimeout = setTimeout(async () => {
          const results = await searchMovies(query);
          displayAutocompleteResults(results, resultsContainer);
        }, 300);
      });
    } else {
      console.error("Élément '.search-input' non trouvé dans le header");
    }

  } catch (error) {
    console.error("Erreur lors du chargement du header :", error);
  }
});

async function searchMovies(query) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=a58786c2c89acd6f0fa2d57fdee642cd&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Erreur API");
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur de recherche :", error);
    return [];
  }
}

function displayAutocompleteResults(movies, container) {
  container.innerHTML = '';
  container.classList.add('autocomplete-box');

  if (!movies.length) {
    container.innerHTML = '<p class="no-results">Aucun résultat</p>';
    return;
  }

  movies.slice(0, 5).forEach(movie => {
    const item = document.createElement("div");
    item.className = "autocomplete-item";
    
    const imgSrc = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` 
      : 'placeholder.jpg';
    
    item.innerHTML = `
      <img src="${imgSrc}" alt="${movie.title}">
      <span>${movie.title}</span>
    `;
    item.addEventListener("click", () => {
      window.location.href = `details.html?id=${movie.id}`;
    });

    container.appendChild(item);
  });
}

function displaySearchResults(movies) {
  console.log("Résultats de recherche:", movies);
  
  if (movies.length > 0) {
    window.location.href = `search-results.html?query=${encodeURIComponent(document.querySelector('.search-input').value)}`;
  }
}