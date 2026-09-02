const hero = document.querySelector('.hero');
const solveWord = document.querySelector('.solve-word');
const note = document.querySelector('.hero-note');
const scrollPath = document.querySelector('.hero-scroll-path');

if (solveWord) {
  const words = ['SOLVES', 'EXPLORES', 'CREATES', 'MAKES'];
  let wordIndex = 0;
  const solvesScrap = solveWord.closest('.solves-scrap');

  window.setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    if (!solvesScrap) return;

    solvesScrap.classList.remove('is-replacing');
    void solvesScrap.offsetWidth;
    solvesScrap.classList.add('is-replacing');
    window.setTimeout(() => { solveWord.textContent = words[wordIndex]; }, 320);
  }, 3600);
}

if (note) {
  note.addEventListener('click', () => {
    const flipped = note.getAttribute('aria-pressed') === 'true';
    note.setAttribute('aria-pressed', String(!flipped));
    note.querySelector('span').textContent = flipped
      ? 'WATCH, YOU’LL SEE IT.'
      : 'DESIGN IS ALL AROUND.';
    note.classList.remove('is-flipped');
    void note.offsetWidth;
    note.classList.add('is-flipped');
  });
}

if (hero && scrollPath) {
  const updateScrollPath = () => {
    const start = hero.offsetTop + hero.offsetHeight * 0.55;
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / (hero.offsetHeight * 0.65)));
    scrollPath.style.opacity = progress > 0 ? '1' : '0';
    scrollPath.style.clipPath = `inset(${(1 - progress) * 100}% 0 0)`;
  };

  window.addEventListener('scroll', updateScrollPath, { passive: true });
  updateScrollPath();
}
