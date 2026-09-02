const hero = document.querySelector('.hero');
const solveWord = document.querySelector('.fixed-solve-word');
const note = document.querySelector('.interactive-note');
const scrollPath = document.querySelector('.hero-scroll-path');
const pageDoodle = document.querySelector('.scroll-doodle');
const pageDoodlePath = document.querySelector('.scroll-doodle-path');
const pageDoodleMaskPath = document.querySelector('.scroll-doodle-mask-path');
const pageDoodleArrow = document.querySelector('.scroll-doodle-arrow');

if (solveWord) {
  const words = ['Solves', 'Explores', 'Creates', 'Builds'];
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
      pageDoodle.style.opacity = progress >= 1 ? '0' : '1';
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

const scratchSurface = document.querySelector('.scratch-surface');

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
      scratchContext.fillStyle = '#fce3ca';
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
    window.addEventListener('load', resizeScratchSurface, { once: true });
    window.requestAnimationFrame(resizeScratchSurface);
  }
}
