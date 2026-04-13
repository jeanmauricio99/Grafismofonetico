// Minimal JS to replace Elementor/Swiper behaviors (carousel + FAQ accordion)

function setupCarousel() {
  const root = document.querySelector('.elementor-image-carousel-wrapper');
  if (!root) return;

  const track = root.querySelector('.swiper-wrapper');
  const slides = Array.from(root.querySelectorAll('.swiper-slide'));
  const prevBtn = root.querySelector('.elementor-swiper-button-prev');
  const nextBtn = root.querySelector('.elementor-swiper-button-next');
  const bullets = Array.from(root.querySelectorAll('.swiper-pagination-bullet'));

  if (!track || slides.length === 0) return;

  let index = 0;

  function slidesPerView() {
    const w = window.innerWidth;
    if (w >= 1025) return 3;
    if (w >= 768) return 2;
    return 1;
  }

  function slideGapPx() {
    const first = slides[0];
    const cs = window.getComputedStyle(first);
    const mr = parseFloat(cs.marginRight || '0') || 0;
    return mr;
  }

  function slideWidthPx() {
    const first = slides[0];
    return first.getBoundingClientRect().width;
  }

  function maxIndex() {
    return Math.max(0, slides.length - slidesPerView());
  }

  function clamp() {
    index = Math.min(Math.max(index, 0), maxIndex());
  }

  function setActiveBullet() {
    const active = Math.min(index, bullets.length - 1);
    bullets.forEach((b, i) => {
      b.classList.toggle('swiper-pagination-bullet-active', i === active);
      b.setAttribute('aria-current', i === active ? 'true' : 'false');
    });
  }

  function render() {
    clamp();
    const x = (slideWidthPx() + slideGapPx()) * index;
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
    track.style.transitionDuration = '300ms';
    setActiveBullet();
  }

  function go(delta) {
    index += delta;
    render();
  }

  prevBtn?.addEventListener('click', () => go(-1));
  nextBtn?.addEventListener('click', () => go(1));

  bullets.forEach((b, i) => {
    b.addEventListener('click', () => {
      index = i;
      render();
    });
  });

  // Touch swipe
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  root.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    dragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    track.style.transitionDuration = '0ms';
  }, { passive: true });

  root.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    const x = (slideWidthPx() + slideGapPx()) * index - dx;
    track.style.transform = `translate3d(${-x}px, 0, 0)`;
  }, { passive: true });

  root.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    const dx = currentX - startX;
    const threshold = 50;
    if (dx > threshold) index -= 1;
    else if (dx < -threshold) index += 1;
    render();
  });

  window.addEventListener('resize', render);
  render();
}

function setupFaqAccordion() {
  const titles = Array.from(document.querySelectorAll('[id^="elementor-tab-title-"]'));
  if (titles.length === 0) return;

  titles.forEach((title) => {
    const id = title.getAttribute('id');
    if (!id) return;
    const suffix = id.replace('elementor-tab-title-', '');
    const content = document.getElementById(`elementor-tab-content-${suffix}`);
    if (!content) return;

    // Ensure collapsed initially
    title.setAttribute('aria-expanded', 'false');
    content.style.display = 'none';

    title.addEventListener('click', (e) => {
      e.preventDefault();
      const expanded = title.getAttribute('aria-expanded') === 'true';
      titles.forEach((t) => {
        const tid = t.getAttribute('id');
        if (!tid) return;
        const s = tid.replace('elementor-tab-title-', '');
        const c = document.getElementById(`elementor-tab-content-${s}`);
        t.setAttribute('aria-expanded', 'false');
        if (c) c.style.display = 'none';
      });

      title.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      content.style.display = expanded ? 'none' : 'block';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCarousel();
  setupFaqAccordion();
});
