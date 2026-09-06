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

// Nav scroll state + mobile toggle
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
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
  a.addEventListener('click', (e) => {
    const hash = a.getAttribute('href');
    if (['#cocktails', '#hookah'].includes(hash)) {
      openTabByHash(hash);
    }
  });
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
