async function fetchMovieDetails(movieId) {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=a58786c2c89acd6f0fa2d57fdee642cd`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur :', error)
      return null;
    }
}