document.addEventListener("DOMContentLoaded", async () => {
  const headerElement = document.querySelector("header");
  if (!headerElement) return;

  try {
    const response = await fetch("header.html");
    if (!response.ok) throw new Error("Header non chargé");

    const headerHTML = await response.text();
    headerElement.innerHTML = headerHTML;

    const burgerBtn = document.getElementById('burger-button');
    const nav = document.getElementById('nav');
    const navLinks = nav.querySelectorAll('a');

    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      nav.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burgerBtn.classList.remove('active');
      });
    });

    const logo = document.getElementById('logo');
    if (logo) {
      logo.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

  } catch (error) {
    console.error("Erreur lors du chargement du header :", error);
  }
});
