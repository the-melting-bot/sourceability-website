/* ============================================
   MAIN.JS — SourceAbility, Inc.
   Navigation, scroll effects, form handling
   ============================================ */

(function () {
  'use strict';

  // --- SCROLL-AWARE HEADER ---
  const header = document.querySelector('.site-header');
  let lastScroll = 0;
  let ticking = false;

  function onScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }

    if (currentScroll > 300) {
      if (currentScroll > lastScroll + 5) {
        header.classList.add('site-header--hidden');
      } else if (currentScroll < lastScroll - 5) {
        header.classList.remove('site-header--hidden');
      }
    } else {
      header.classList.remove('site-header--hidden');
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // --- MOBILE NAV ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileClose = document.querySelector('.mobile-nav-close');

  function openMobileNav() {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('active');
    mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('active');
    mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

  // Close mobile nav on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- SCROLL REVEAL ---
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      revealElements.forEach(el => {
        el.classList.add('visible');
      });
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      revealElements.forEach(el => revealObserver.observe(el));
    }
  }

  // --- HERO GSAP ANIMATION ---
  if (typeof gsap !== 'undefined' && document.querySelector('.hero')) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      gsap.set('.hero__content > *', { opacity: 0, y: 30 });

      gsap.to('.hero__content > *', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
      });
    }
  }

  // --- STAT COUNTER ---
  const statNumbers = document.querySelectorAll('.stat__number[data-count]');

  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            let current = 0;
            const duration = 1500;
            const step = target / (duration / 16);

            function tick() {
              current += step;
              if (current >= target) {
                el.textContent = prefix + target.toLocaleString() + suffix;
              } else {
                el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
                requestAnimationFrame(tick);
              }
            }

            tick();
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  // --- TESTIMONIAL CAROUSEL (home) ---
  const testimonialCarousel = document.querySelector('[data-testimonial-carousel]');

  if (testimonialCarousel) {
    const slides = testimonialCarousel.querySelectorAll('.testimonial-carousel__slide');
    const dots = testimonialCarousel.querySelectorAll('.testimonial-carousel__dot');
    const intervalMs = parseInt(testimonialCarousel.dataset.interval || '6000', 10);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeIndex = 0;
    let timerId = null;

    function goTo(i) {
      const idx = ((i % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, j) => {
        const on = j === idx;
        slide.classList.toggle('is-active', on);
        slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach((dot, j) => {
        const on = j === idx;
        dot.classList.toggle('is-active', on);
        if (on) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      activeIndex = idx;
      testimonialCarousel.setAttribute('aria-label', `Client testimonials, ${idx + 1} of ${slides.length}`);
    }

    function next() {
      goTo(activeIndex + 1);
    }

    function startAuto() {
      if (reduceMotion || slides.length < 2) return;
      clearInterval(timerId);
      timerId = setInterval(next, intervalMs);
    }

    function stopAuto() {
      clearInterval(timerId);
      timerId = null;
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const i = parseInt(dot.dataset.slideTo, 10);
        if (!Number.isNaN(i)) {
          goTo(i);
          stopAuto();
          startAuto();
        }
      });
    });

    testimonialCarousel.addEventListener('mouseenter', stopAuto);
    testimonialCarousel.addEventListener('mouseleave', startAuto);
    testimonialCarousel.addEventListener('focusin', stopAuto);
    testimonialCarousel.addEventListener('focusout', (e) => {
      if (!testimonialCarousel.contains(e.relatedTarget)) startAuto();
    });

    goTo(0);
    startAuto();
  }

  // --- CONTACT FORM (Web3Forms) ---
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const successEl = document.getElementById('form-success');
      const errorEl = document.getElementById('form-error');

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      if (successEl) successEl.classList.remove('show');
      if (errorEl) errorEl.classList.remove('show');

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          contactForm.reset();
          if (successEl) successEl.classList.add('show');
          contactForm.style.display = 'none';
        } else {
          if (errorEl) {
            errorEl.textContent = 'Something went wrong. Please try again or call us directly.';
            errorEl.classList.add('show');
          }
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = 'Network error. Please try again or call us directly.';
          errorEl.classList.add('show');
        }
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    });
  }

  // --- RSS FEED PARSER (for Jobs page) ---
  async function loadJobs() {
    const jobsList = document.getElementById('jobs-list');
    const jobsLoading = document.getElementById('jobs-loading');
    const jobsFallback = document.getElementById('jobs-fallback');

    if (!jobsList) return;

    try {
      // Use a CORS proxy approach or try directly
      const rssUrl = 'https://jobs.crelate.com/portal/sourceabilityinc/rss';
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rssUrl);

      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error('Feed unavailable');

      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');

      if (items.length === 0) throw new Error('No jobs found');

      if (jobsLoading) jobsLoading.style.display = 'none';

      let html = '';
      items.forEach((item) => {
        const title = item.querySelector('title')?.textContent || 'Untitled Position';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent;
        const description = item.querySelector('description')?.textContent || '';

        // Extract location from description if available
        const locationMatch = description.match(/Location:\s*([^<\n]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : '';

        const dateStr = pubDate ? new Date(pubDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : '';

        html += `
          <div class="job-card reveal visible">
            <div class="job-card__info">
              <div class="job-card__title">${title}</div>
              <div class="job-card__meta">
                ${location ? `<span>${location}</span>` : ''}
                ${dateStr ? `<span>Posted ${dateStr}</span>` : ''}
              </div>
            </div>
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--primary">Apply Now</a>
          </div>
        `;
      });

      jobsList.innerHTML = html;

    } catch (err) {
      console.log('RSS feed unavailable, showing fallback.');
      if (jobsLoading) jobsLoading.style.display = 'none';
      if (jobsFallback) jobsFallback.style.display = 'block';
    }
  }

  // Init jobs on page load if the element exists
  if (document.getElementById('jobs-list')) {
    loadJobs();
  }

  // --- ACTIVE NAV LINK ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav-link--active');
    }
  });

})();
