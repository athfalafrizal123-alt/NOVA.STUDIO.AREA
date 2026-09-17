document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  const setActiveNav = () => {
    const scrollY = window.scrollY + 160;

    sections.forEach((section) => {
      const id = section.getAttribute('id');
      const offsetTop = section.offsetTop;
      const offsetHeight = section.offsetHeight;

      if (scrollY >= offsetTop && scrollY < offsetTop + offsetHeight) {
        sectionLinks.forEach((link) => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', isActive);
        });
      }
    });
  };

  if (sectionLinks.length && sections.length) {
    window.addEventListener('scroll', setActiveNav, { passive: true });
    setActiveNav();
  }

  const revealElements = document.querySelectorAll('.card, .section-header, .hero-visual, .project-card, .stat-box, .logo-pill');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element, index) => {
      element.classList.add('reveal');
      setTimeout(() => revealObserver.observe(element), index * 60);
    });
  } else {
    revealElements.forEach((element) => element.classList.add('visible'));
  }

  function animateCount(element, targetValue) {
    const duration = 1100;
    const start = performance.now();
    const from = 0;

    function step(currentTime) {
      const progress = Math.min(1, (currentTime - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(from + (targetValue - from) * eased);

      element.textContent = value + (element.dataset.suffix || '');

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  document.querySelectorAll('.stat-value').forEach((element) => {
    const raw = element.textContent.trim();
    const match = raw.match(/\d+[\d,.]*/);

    if (!match) return;

    const numericValue = parseInt(match[0].replace(/[.,]/g, ''), 10);
    element.dataset.suffix = raw.replace(match[0], '');
    element.textContent = '0' + (element.dataset.suffix || '');

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(element, numericValue);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    counterObserver.observe(element);
  });

  const testimonialGrid = document.querySelector('.testimonial-grid');
  if (testimonialGrid) {
    const items = Array.from(testimonialGrid.children);
    if (items.length > 0) {
      const wrapper = document.createElement('div');
      wrapper.className = 'testimonial-track';
      items.forEach((item) => wrapper.appendChild(item));

      testimonialGrid.innerHTML = '';

      const viewport = document.createElement('div');
      viewport.className = 'testimonial-carousel';
      viewport.appendChild(wrapper);
      testimonialGrid.appendChild(viewport);

      const controls = document.createElement('div');
      controls.className = 'testimonial-controls';
      const dots = [];

      items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `testimonial-dot${index === 0 ? ' active' : ''}`;
        dot.type = 'button';
        dot.addEventListener('click', () => moveTo(index));
        controls.appendChild(dot);
        dots.push(dot);
      });

      testimonialGrid.appendChild(controls);

      let currentIndex = 0;
      const moveTo = (index) => {
        currentIndex = (index + items.length) % items.length;
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle('active', dotIndex === currentIndex);
        });
      };

      let autoRotate = setInterval(() => moveTo(currentIndex + 1), 4500);
      testimonialGrid.addEventListener('mouseenter', () => clearInterval(autoRotate));
      testimonialGrid.addEventListener('mouseleave', () => {
        autoRotate = setInterval(() => moveTo(currentIndex + 1), 4500);
      });
    }
  }

  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards.length) {
    function createModal() {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      const modal = document.createElement('div');
      modal.className = 'modal';
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      const close = () => {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
      };

      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) close();
      });

      const open = (content) => {
        modal.innerHTML = content;
        backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
      };

      return { open, close };
    }

    const modalApi = createModal();

    projectCards.forEach((card) => {
      card.addEventListener('click', () => {
        const title = card.querySelector('.project-title')?.textContent || '';
        const meta = card.querySelector('.project-meta')?.textContent || '';
        const description = card.querySelector('p')?.textContent || '';
        const visual = card.querySelector('.project-visual')?.innerHTML || '';

        const content = `
          <div class="modal-grid">
            <div>
              <div style="border-radius: 12px; overflow: hidden; background: linear-gradient(135deg, rgba(84, 210, 255, 0.06), rgba(139, 255, 184, 0.04)); padding: 18px;">
                <div style="height: 220px; position: relative;">${visual}</div>
              </div>
              <div style="margin-top: 14px; color: var(--muted);">${description}</div>
            </div>
            <aside style="padding-left: 10px;">
              <div class="project-meta">${meta}</div>
              <h3>${title}</h3>
              <p style="color: var(--muted);">Teknologi: React · Node · AWS · Postgres</p>
              <div style="margin-top: 14px;">
                <a href="#contact" class="btn btn-primary">Diskusikan Proyek</a>
              </div>
            </aside>
          </div>
        `;

        modalApi.open(content);
      });
    });
  }

  const toTopButton = document.createElement('button');
  toTopButton.type = 'button';
  toTopButton.className = 'to-top';
  toTopButton.setAttribute('aria-label', 'Kembali ke atas');
  toTopButton.innerHTML = '↑';
  document.body.appendChild(toTopButton);

  const floatContact = document.createElement('a');
  floatContact.href = 'mailto:hello@berca.co';
  floatContact.className = 'float-contact';
  floatContact.textContent = 'Hubungi';
  document.body.appendChild(floatContact);

  const topbar = document.querySelector('.topbar');
  window.addEventListener(
    'scroll',
    () => {
      const hasScrolled = window.scrollY > 420;
      toTopButton.classList.toggle('visible', hasScrolled);
      if (topbar) {
        topbar.classList.toggle('shrink', window.scrollY > 60);
      }
    },
    { passive: true }
  );

  toTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.body.addEventListener(
    'keyup',
    (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    },
    { once: true }
  );
});
