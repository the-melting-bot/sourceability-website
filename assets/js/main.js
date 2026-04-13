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
        const resumeInput = contactForm.querySelector('input[type="file"][name="attachment"]');
        if (resumeInput && (!resumeInput.files || resumeInput.files.length === 0)) {
          formData.delete('attachment');
        } else if (resumeInput && resumeInput.files && resumeInput.files.length > 0) {
          const maxBytes = 5 * 1024 * 1024;
          if (resumeInput.files[0].size > maxBytes) {
            if (errorEl) {
              errorEl.textContent = 'Resume must be 5 MB or smaller. Please choose a smaller file or email us directly.';
              errorEl.classList.add('show');
            }
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
            return;
          }
        }

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
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

  // --- CRELATE RSS (Vercel /api/crelate-rss — server-side, no browser CORS) ---
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function fetchCrelateRssXml() {
    const res = await fetch('/api/crelate-rss', { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Feed HTTP error');
    const text = await res.text();
    const t = text.trim();
    if (t.startsWith('{') && t.includes('"error"')) throw new Error('Feed proxy error');
    return text;
  }

  const CRELATE_NS = 'https://jobs.crelate.com/portal/sourceabilityinc';

  function parseRssItems(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    if (xml.querySelector('parsererror')) throw new Error('Invalid XML');
    const items = xml.querySelectorAll('item');
    return Array.from(items).map((item) => {
      const title = item.querySelector('title')?.textContent?.trim() || 'Untitled Position';
      const link = item.querySelector('link')?.textContent?.trim() || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';

      let location = '';
      const locEls = item.getElementsByTagNameNS(CRELATE_NS, 'location');
      if (locEls.length) {
        location = locEls[0].textContent.trim();
      } else {
        const locationMatch = description.match(/Location:\s*([^<\n]+)/i);
        location = locationMatch ? locationMatch[1].trim() : '';
      }

      let jobNumber = '';
      const numEls = item.getElementsByTagNameNS(CRELATE_NS, 'jobNumber');
      if (numEls.length) jobNumber = numEls[0].textContent.trim();

      return { title, link, pubDate, location, jobNumber };
    });
  }

  /**
   * Crelate emits pubDate like "Mon, 23 Mar 2026 23:52:11 Z" — trailing " Z" is not
   * reliably parsed by Date(); normalize to GMT and validate before formatting.
   */
  function formatJobDate(pubDate) {
    const raw = String(pubDate || '').trim();
    if (!raw) return '';
    const normalized = raw.replace(/\s+Z$/i, ' GMT');
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return '';
    try {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  async function loadJobs() {
    const jobsList = document.getElementById('jobs-list');
    const jobsLoading = document.getElementById('jobs-loading');
    const jobsFallback = document.getElementById('jobs-fallback');

    if (!jobsList) return;

    try {
      const xmlText = await fetchCrelateRssXml();
      const items = parseRssItems(xmlText);

      if (items.length === 0) throw new Error('No jobs found');

      if (jobsLoading) jobsLoading.style.display = 'none';

      let html = '';
      items.forEach((job) => {
        const dateStr = formatJobDate(job.pubDate);
        const title = escapeHtml(job.title);
        const link = escapeHtml(job.link);
        const loc = escapeHtml(job.location);

        html += `
          <div class="job-card reveal visible">
            <div class="job-card__info">
              <div class="job-card__title">${title}</div>
              <div class="job-card__meta">
                ${loc ? `<span>${loc}</span>` : ''}
                ${dateStr ? `<span>Posted ${dateStr}</span>` : ''}
              </div>
            </div>
            <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--primary">Apply Now</a>
          </div>
        `;
      });

      jobsList.innerHTML = html;
    } catch (err) {
      console.log('RSS feed unavailable, showing fallback.', err);
      if (jobsLoading) jobsLoading.style.display = 'none';
      if (jobsFallback) jobsFallback.style.display = 'block';
    }
  }

  async function loadHomeJobs() {
    const listEl = document.getElementById('jobs-home-list');
    const fallbackEl = document.getElementById('jobs-home-fallback');

    if (!listEl) return;

    try {
      const xmlText = await fetchCrelateRssXml();
      const items = parseRssItems(xmlText);

      if (items.length === 0) throw new Error('No jobs');

      const max = Math.min(items.length, 3);
      let html = '';
      for (let i = 0; i < max; i++) {
        const job = items[i];
        const dateStr = formatJobDate(job.pubDate);
        const title = escapeHtml(job.title);
        const link = escapeHtml(job.link);

        const sub = [];
        if (dateStr) sub.push(`<span class="job-card__date">Posted ${dateStr}</span>`);
        if (job.location) sub.push(`<span class="job-card__location">${escapeHtml(job.location)}</span>`);
        if (sub.length === 0 && job.jobNumber) {
          sub.push(`<span class="job-card__date">Job #${escapeHtml(job.jobNumber)}</span>`);
        }
        if (sub.length === 0) {
          sub.push('<span class="job-card__location">Open position · view details</span>');
        }

        html += `
          <a href="${link}" target="_blank" rel="noopener noreferrer" class="job-card job-card--tile reveal visible">
            <span class="job-card__title">${title}</span>
            <span class="job-card__meta job-card__meta--tile">${sub.join('')}</span>
          </a>
        `;
      }
      listEl.innerHTML = html;
    } catch (err) {
      console.log('Home jobs feed unavailable', err);
      listEl.innerHTML = '';
      if (fallbackEl) fallbackEl.style.display = 'block';
    }
  }

  if (document.getElementById('jobs-list')) {
    loadJobs();
  }

  if (document.getElementById('jobs-home-list')) {
    loadHomeJobs();
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
