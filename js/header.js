document.addEventListener('DOMContentLoaded', () => {
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
  });
