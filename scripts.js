// Simple accessible carousel + lazy-loading + scroll animations
document.addEventListener('DOMContentLoaded', function(){
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const nextBtn = document.querySelector('.carousel-btn.next');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const dotsNav = document.querySelector('.carousel-dots');
  let currentIndex = 0;
  let autoPlayTimer = null;
  const interval = 4000;

  // build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${i+1}`);
    dot.addEventListener('click', () => { goToSlide(i); resetAutoPlay(); });
    dotsNav.appendChild(dot);
  });
  const dots = Array.from(dotsNav.children);

  function update(){
    const amount = -currentIndex * 100;
    track.style.transform = `translateX(${amount}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
  }

  function loadSlideImage(index){
    const img = slides[index].querySelector('img.lazy');
    if(img && img.dataset.src){
      img.src = img.dataset.src;
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.removeAttribute('data-src');
    }
  }

  function goToSlide(i){
    currentIndex = (i + slides.length) % slides.length;
    loadSlideImage(currentIndex);
    update();
  }

  nextBtn.addEventListener('click', () => { goToSlide(currentIndex + 1); resetAutoPlay(); });
  prevBtn.addEventListener('click', () => { goToSlide(currentIndex - 1); resetAutoPlay(); });

  // autoplay
  function startAutoPlay(){
    stopAutoPlay();
    autoPlayTimer = setInterval(() => { goToSlide(currentIndex + 1); }, interval);
  }
  function stopAutoPlay(){ if(autoPlayTimer) clearInterval(autoPlayTimer); }
  function resetAutoPlay(){ stopAutoPlay(); startAutoPlay(); }

  // pause on hover/focus
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);
  carousel.addEventListener('focusin', stopAutoPlay);
  carousel.addEventListener('focusout', startAutoPlay);

  // Apply low-quality placeholders from data-placeholder on wrappers
  const wrappers = document.querySelectorAll('.img-wrap[data-placeholder]');
  wrappers.forEach(w => { w.style.backgroundImage = `url(${w.dataset.placeholder})`; });

  // Lazy-load images when they approach viewport
  const lazyImages = document.querySelectorAll('img.lazy');
  const imgObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const img = entry.target;
        if(img.dataset.src){
          img.src = img.dataset.src;
          img.addEventListener('load', () => {
            img.classList.add('loaded');
            const wrap = img.closest('.img-wrap'); if(wrap) wrap.classList.add('loaded');
          });
          img.removeAttribute('data-src');
        }
        obs.unobserve(img);
      }
    });
  }, {rootMargin: '200px 0px'});

  lazyImages.forEach(img => imgObserver.observe(img));

  // Animate elements into view
  const animatedEls = document.querySelectorAll('.animate-on-scroll');
  const animObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  animatedEls.forEach(el => animObserver.observe(el));

  // initialize
  goToSlide(0);
  startAutoPlay();

  // Optional: keyboard support
  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') { goToSlide(currentIndex + 1); resetAutoPlay(); }
    if(e.key === 'ArrowLeft') { goToSlide(currentIndex - 1); resetAutoPlay(); }
  });
});