document.addEventListener('DOMContentLoaded', adminidtration);
function adminidtration(){
    const info = document.getElementById('info');
    const mod = document.getElementById('gestion');
    const closeBtn = document.querySelector('.close_ad');

    info.addEventListener('click', () => mod.style.display = 'block');
  closeBtn.addEventListener('click', () => mod.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === mod) mod.style.display = 'none';
  });
}