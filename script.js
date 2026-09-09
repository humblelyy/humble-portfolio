(() => {
  const nav = document.querySelector('.nav');
  const menu = document.querySelector('.menu');
  const mobile = document.querySelector('.mobile-nav');
  const cursor = document.querySelector('.cursor');

  // Desktop custom cursor.
  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function cursorLoop() {
      cx += (mx - cx) * .18;
      cy += (my - cy) * .18;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(cursorLoop);
    })();

    document.querySelectorAll('a, button, .magnetic').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform =
          `translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // Header.
  addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', scrollY > 20);
  }, { passive: true });

  // Mobile menu.
  if (menu && mobile) {
    menu.addEventListener('click', () => mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobile.classList.remove('open')));
  }

  // Video hover previews.
  document.querySelectorAll('.work-card').forEach(card => {
    const v = card.querySelector('.project-video');
    if (!v) return;
    card.addEventListener('mouseenter', () => v.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      v.pause();
      try { v.currentTime = 0; } catch {}
    });
  });

  // Fullscreen controls.
  document.querySelectorAll('.expand').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const v = btn.closest('.media')?.querySelector('video');
      if (!v) return;
      if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    });
  });

  // Smooth anchor navigation.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Scroll reveal.
  const revealItems = document.querySelectorAll('.reveal-section');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(el => io.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('in-view'));
  }

  // Hero video: desktop/tablet autoplay; small mobile avoids forced playback.
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const small = matchMedia('(max-width:640px)');
    const setHero = () => {
      if (small.matches) {
        heroVideo.removeAttribute('autoplay');
        heroVideo.pause();
      } else {
        heroVideo.setAttribute('autoplay', '');
        heroVideo.play().catch(() => {});
      }
    };
    setHero();
    small.addEventListener?.('change', setHero);
  }

  // Optional Lenis: use it only when the CDN/library is actually available.
  // This fallback keeps the site fully functional if the network/CDN is unavailable.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ smoothWheel: true, syncTouch: false, lerp: 0.085 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Subtle hero parallax.
  const hero = document.querySelector('.hero');
  if (hero && heroVideo) {
    addEventListener('scroll', () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const progress = Math.min(scrollY / Math.max(hero.offsetHeight, 1), 1);
      heroVideo.style.transform = `translate3d(0, ${progress * 45}px, 0) scale(${1.02 + progress * .035})`;
    }, { passive: true });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();