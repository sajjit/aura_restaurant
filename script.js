// Reservation via SMS
const RESERVE_PHONE = '+590690530577';
const RESERVE_MESSAGE = "Bonjour Aura, je souhaite reserver une table. Nous serons ... personnes le ... a ... Merci !";

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function buildSmsHref(phone, message) {
  const separator = isIOSDevice() ? '&' : '?';
  return `sms:${phone}${separator}body=${encodeURIComponent(message)}`;
}

document.querySelectorAll('.js-reserve').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = buildSmsHref(RESERVE_PHONE, RESERVE_MESSAGE);
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Nav: scroll state + full-screen mobile menu
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
}
navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

// Menu tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.menu-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.menu-panel[data-panel="${target}"]`).classList.add('active');
  });
});

// Allow highlight links (#cocktails, #hookah) to open the right tab
function openTabByHash(hash) {
  const id = hash.replace('#', '');
  const btn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
  if (btn) btn.click();
}
document.querySelectorAll('a[href^="#cocktails"], a[href^="#hookah"]').forEach(a => {
  a.addEventListener('click', () => {
    const hash = a.getAttribute('href');
    if (['#cocktails', '#hookah'].includes(hash)) {
      openTabByHash(hash);
    }
  });
});

// Midi / Soir rows open their matching menu tab
document.querySelectorAll('[data-tab-link]').forEach(a => {
  a.addEventListener('click', () => openTabByHash(a.dataset.tabLink));
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Hero mouse-follow glow
const heroGlow = document.getElementById('heroMouseGlow');
if (heroGlow && window.matchMedia('(hover: hover)').matches) {
  const hero = document.getElementById('top');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroGlow.style.setProperty('--mx', `${x}%`);
    heroGlow.style.setProperty('--my', `${y}%`);
  });
}

// Midi / Soir / Night: photo preview that follows the cursor (desktop only)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
  const preview = document.createElement('div');
  preview.className = 'cursor-preview';
  const previewImg = document.createElement('img');
  previewImg.alt = '';
  preview.appendChild(previewImg);
  document.body.appendChild(preview);

  let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
  const loop = () => {
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    preview.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(-4deg)`;
    if (running) requestAnimationFrame(loop);
  };

  document.querySelectorAll('.time-row[data-preview]').forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      previewImg.src = row.dataset.preview;
      tx = cx = e.clientX + 30;
      ty = cy = e.clientY - 150;
      preview.classList.add('show');
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    row.addEventListener('mousemove', (e) => {
      tx = e.clientX + 30;
      ty = e.clientY - 150;
    });
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('show');
      running = false;
    });
  });
}

// Spotlight quote: words light up as the section scrolls into view
const spotlight = document.querySelector('.spotlight');
const quote = document.getElementById('spotlightQuote');
let quoteWords = [];
if (quote && !reducedMotion.matches) {
  const words = quote.textContent.trim().split(/\s+/);
  quote.textContent = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.textContent = word + (i < words.length - 1 ? ' ' : '');
    quote.appendChild(span);
    quoteWords.push(span);
  });
}

// Pinned horizontal gallery (desktop): vertical scroll drives the strip
const galleryPin = document.getElementById('galleryPin');
const galleryTrack = document.getElementById('galleryTrack');
const galleryBar = document.getElementById('galleryBar');
const desktopQuery = window.matchMedia('(min-width: 901px)');
let galleryMax = 0;

const galleryPinned = () => desktopQuery.matches && !reducedMotion.matches;

function layoutGallery() {
  if (!galleryPin || !galleryTrack) return;
  if (!galleryPinned()) {
    galleryPin.style.removeProperty('--pin-h');
    galleryTrack.style.removeProperty('--tx');
    galleryMax = 0;
    return;
  }
  galleryMax = Math.max(0, galleryTrack.scrollWidth - window.innerWidth);
  galleryPin.style.setProperty('--pin-h', `${galleryMax + window.innerHeight}px`);
}

// One rAF-throttled scroll handler for everything scroll-linked
const scrollProgress = document.getElementById('scrollProgress');
const heroVisual = document.getElementById('heroVisual');
let ticking = false;

function onScroll() {
  ticking = false;
  const y = window.scrollY;
  const vh = window.innerHeight;

  nav.classList.toggle('scrolled', y > 40);

  const docH = document.documentElement.scrollHeight - vh;
  if (scrollProgress && docH > 0) {
    scrollProgress.style.transform = `scaleX(${clamp01(y / docH)})`;
  }

  if (heroVisual && !reducedMotion.matches && y < vh * 1.3) {
    heroVisual.style.setProperty('--py', `${(y * 0.09).toFixed(1)}px`);
  }

  if (spotlight && quoteWords.length) {
    const rect = spotlight.getBoundingClientRect();
    const t = clamp01((vh * 0.85 - rect.top) / (vh * 0.7));
    const lit = Math.round(t * quoteWords.length);
    quoteWords.forEach((w, i) => w.classList.toggle('on', i < lit));
  }

  if (galleryPin && galleryMax > 0) {
    const rect = galleryPin.getBoundingClientRect();
    const span = galleryPin.offsetHeight - vh;
    const p = span > 0 ? clamp01(-rect.top / span) : 0;
    galleryTrack.style.setProperty('--tx', `${(-p * galleryMax).toFixed(1)}px`);
    if (galleryBar) galleryBar.style.transform = `scaleX(${p})`;
  }
}

function requestTick() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}

window.addEventListener('scroll', requestTick, { passive: true });
window.addEventListener('resize', () => { layoutGallery(); requestTick(); });
window.addEventListener('load', () => { layoutGallery(); onScroll(); });
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => { layoutGallery(); onScroll(); });
}
layoutGallery();
onScroll();
