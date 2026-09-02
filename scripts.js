const hero = document.querySelector('.hero');
const solveWord = document.querySelector('.solve-word');
const note = document.querySelector('.hero-note');
const scrollPath = document.querySelector('.hero-scroll-path');

if (solveWord) {
  const words = ['SOLVES', 'EXPLORES', 'CREATES', 'MAKES'];
  let wordIndex = 0;

  window.setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    solveWord.animate([
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(8px) scale(.94)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ], { duration: 620, easing: 'cubic-bezier(.2,.8,.25,1)' });
    window.setTimeout(() => { solveWord.textContent = words[wordIndex]; }, 250);
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
