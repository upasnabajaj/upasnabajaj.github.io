const hero = document.querySelector('.hero');
const isMobileLayout = window.matchMedia('(max-width: 900px)').matches;
const solveWord = document.querySelector('.fixed-solve-word');
const note = document.querySelector('.interactive-note');
const scrollPath = document.querySelector('.hero-scroll-path');
const pageDoodle = document.querySelector('.scroll-doodle');
const pageDoodlePath = document.querySelector('.scroll-doodle-path');
const pageDoodleMaskPath = document.querySelector('.scroll-doodle-mask-path');
const pageDoodleArrow = document.querySelector('.scroll-doodle-arrow');
const themeToggle = document.querySelector('.theme-toggle');
const artworkPreview = document.querySelector('.figma-preview');

if (themeToggle) {
  const savedTheme = window.localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
  const originalArtworkSrc = artworkPreview?.src;
  const lightArtworkSrc = 'assets/figma-full/website-light.png';

  const setTheme = (isLight) => {
    document.body.classList.toggle('light-mode', isLight);
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggle.querySelector('.theme-toggle-label').textContent = isLight ? 'Dark mode' : 'Light mode';
    window.dispatchEvent(new Event('themechange'));
    if (isLight) {
      if (artworkPreview) artworkPreview.src = lightArtworkSrc;
    } else if (artworkPreview && originalArtworkSrc) {
      artworkPreview.src = originalArtworkSrc;
    }
  };

  setTheme(savedTheme ? savedTheme === 'light' : systemTheme.matches);
  systemTheme.addEventListener('change', (event) => {
    if (!window.localStorage.getItem('theme')) setTheme(event.matches);
  });
  themeToggle.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('light-mode');
    setTheme(isLight);
    window.localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

if (solveWord) {
  const words = ['Solves', 'Explores', 'Creates', 'Makes'];
  let wordIndex = 0;

  window.setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    solveWord.classList.remove('is-changing');
    void solveWord.offsetWidth;
    solveWord.classList.add('is-changing');
    window.setTimeout(() => { solveWord.textContent = words[wordIndex]; }, 260);
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

if (pageDoodle && pageDoodlePath && pageDoodleMaskPath && pageDoodleArrow) {
  const mobileDoodlePath = 'M22 235 C112 305 292 360 346 470 C365 510 350 545 305 570 C220 618 72 640 28 760 C3 830 48 890 126 915 C208 942 316 950 346 1060 C370 1150 320 1215 246 1240 C170 1265 63 1275 29 1390 C4 1475 52 1538 132 1565 C217 1594 319 1597 343 1708 C365 1810 307 1864 228 1886 C150 1908 64 1920 30 2035 C7 2110 56 2178 131 2208 C210 2240 304 2252 337 2345 C360 2415 318 2478 258 2500 C205 2520 155 2535 128 2606';
  if (isMobileLayout) {
    pageDoodle.setAttribute('viewBox', '0 0 375 2871');
    pageDoodlePath.setAttribute('d', mobileDoodlePath);
    pageDoodleMaskPath.setAttribute('d', mobileDoodlePath);
  }
  const pathLength = pageDoodlePath.getTotalLength();
  const finishProgress = 0.86;
  pageDoodleMaskPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
  pageDoodleMaskPath.style.strokeDashoffset = pathLength;

  const updatePageDoodle = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 0;
    const progress = Math.min(1, scrollProgress / finishProgress);
    const drawnLength = pathLength * progress;
    pageDoodleMaskPath.style.strokeDashoffset = pathLength - drawnLength;

    if (progress === 0 || progress >= 1) {
      pageDoodle.style.opacity = '0';
      pageDoodleArrow.style.display = 'none';
      return;
    }

    pageDoodle.style.opacity = '1';
    const point = pageDoodlePath.getPointAtLength(drawnLength);
    const previousPoint = pageDoodlePath.getPointAtLength(Math.max(0, drawnLength - 2));
    const angle = Math.atan2(point.y - previousPoint.y, point.x - previousPoint.x) * 180 / Math.PI;
    pageDoodleArrow.style.display = 'block';
    pageDoodleArrow.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
  };

  window.addEventListener('scroll', updatePageDoodle, { passive: true });
  window.addEventListener('resize', updatePageDoodle);
  updatePageDoodle();
}

const scratchSurface = document.querySelector(isMobileLayout ? '.mobile-scratch-surface' : '.scratch-surface');

if (scratchSurface) {
  const scratchContext = scratchSurface.getContext('2d', { willReadFrequently: true });

  if (scratchContext) {
    let scratching = false;
    let lastPoint = null;

    const resizeScratchSurface = () => {
      const rect = scratchSurface.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      scratchSurface.width = Math.round(rect.width * ratio);
      scratchSurface.height = Math.round(rect.height * ratio);
      scratchContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      scratchContext.globalCompositeOperation = 'source-over';
      scratchContext.fillStyle = document.body.classList.contains('light-mode') ? '#202020' : '#fce3ca';
      scratchContext.fillRect(0, 0, rect.width, rect.height);
    };

    const pointFromEvent = (event) => {
      const rect = scratchSurface.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const eraseBetween = (from, to) => {
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(distance / 10));
      scratchContext.globalCompositeOperation = 'destination-out';
      for (let index = 1; index <= steps; index += 1) {
        const progress = index / steps;
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        scratchContext.beginPath();
        scratchContext.arc(x, y, 17, 0, Math.PI * 2);
        scratchContext.fill();
      }
    };

    scratchSurface.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      scratching = true;
      lastPoint = pointFromEvent(event);
      scratchSurface.setPointerCapture?.(event.pointerId);
      eraseBetween(lastPoint, lastPoint);
    });

    scratchSurface.addEventListener('pointermove', (event) => {
      if (!scratching) return;
      event.preventDefault();
      const nextPoint = pointFromEvent(event);
      eraseBetween(lastPoint, nextPoint);
      lastPoint = nextPoint;
    });

    const stopScratching = (event) => {
      if (!scratching) return;
      event.preventDefault();
      scratching = false;
      lastPoint = null;
    };

    scratchSurface.addEventListener('pointerup', stopScratching);
    scratchSurface.addEventListener('pointercancel', stopScratching);
    scratchSurface.addEventListener('contextmenu', (event) => event.preventDefault());
    window.addEventListener('resize', resizeScratchSurface);
    window.addEventListener('themechange', resizeScratchSurface);
    window.addEventListener('load', resizeScratchSurface, { once: true });
    window.requestAnimationFrame(resizeScratchSurface);
  }
}
