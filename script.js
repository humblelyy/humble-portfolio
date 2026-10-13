(() => {
  // Loader counter
  const count = document.querySelector('.loader-count');
  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(100, n + Math.ceil(Math.random() * 12));
    count.textContent = n;
    if (n >= 100) { clearInterval(tick); setTimeout(() => document.body.classList.add('loaded'), 200); }
  }, 60);

  // Smooth scroll
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 }); window.__lenis = lenis;
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); lenis.scrollTo(a.getAttribute('href') === '#top' ? 0 : a.getAttribute('href'));
    }));
  }

  // Clock
  const clock = document.getElementById('clock');
  const setTime = () => clock.textContent = 'Kerala ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  setTime(); setInterval(setTime, 30000);
  document.getElementById('year').textContent = new Date().getFullYear();

  // Reel clip reveal + fade-ups
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.2 });
  document.querySelectorAll('.reel-inner').forEach(el => io.observe(el));
  document.querySelectorAll('.work-item, .about-cols > div, .contact-row').forEach(el => { el.classList.add('fadeup'); io.observe(el); });

  // Word-by-word scroll reveal
  const rt = document.querySelector('.reveal-text');
  rt.innerHTML = rt.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = [...rt.querySelectorAll('.w')];

  // Parallax
  const para = [...document.querySelectorAll('[data-speed]')];
  const onScroll = () => {
    const vh = innerHeight;
    para.forEach(el => {
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      el.firstElementChild.style.transform = `translateY(${-off}px)`;
    });
    const r = rt.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const k = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < k));
  };
  (lenis ? lenis.on('scroll', onScroll) : addEventListener('scroll', onScroll)); onScroll();

  // Hover media following cursor
  const hm = document.querySelector('.hover-media'), img = hm.querySelector('img'), vid = hm.querySelector('video');
  let mx = 0, my = 0, x = 0, y = 0;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const follow = () => {
    x += (mx - x) * 0.12; y += (my - y) * 0.12;
    hm.style.transform = `translate(${x - 170}px, ${y - 212}px) rotate(${(mx - x) * 0.04}deg)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.querySelectorAll('.work-item').forEach(a => {
    a.addEventListener('mouseenter', () => {
      img.src = a.dataset.poster;
      if (a.dataset.video) { vid.src = a.dataset.video; vid.style.display = 'block'; vid.play().catch(() => {}); }
      else { vid.pause(); vid.style.display = 'none'; }
      hm.classList.add('on');
    });
    a.addEventListener('mouseleave', () => { hm.classList.remove('on'); vid.pause(); });
  });

  // Video lightbox
  const lb = document.querySelector('.lightbox'), lbv = lb.querySelector('video');
  const close = () => { lb.classList.remove('open'); lbv.pause(); lenis && lenis.start(); };
  document.querySelectorAll('.open-video').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); lbv.src = a.dataset.video; lb.classList.add('open'); lbv.play().catch(() => {}); lenis && lenis.stop();
  }));
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => e.key === 'Escape' && close());
})();

(() => {
  const fine = matchMedia('(pointer:fine)').matches;

  // Tilt cards (reverse tilt, factor 8)
  document.querySelectorAll('.tilt').forEach(card => {
    const inner = card.querySelector('.card-in');
    if (!fine) return;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      inner.style.transition = 'transform .12s linear, box-shadow .5s';
      inner.style.transform = `rotateX(${py * 8}deg) rotateY(${-px * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => { inner.style.transition = ''; inner.style.transform = ''; });
  });

  // Morphing dialog (FLIP from card rect to centered panel)
  const m = document.querySelector('.morph'), panel = m.querySelector('.morph-panel');
  const mImg = panel.querySelector('img'), mT = panel.querySelector('h3'), mS = panel.querySelector('small'), mP = panel.querySelector('p'), cta = panel.querySelector('.morph-cta');
  let from = null;
  const spring = 'cubic-bezier(.32,1.15,.4,1)';
  const target = () => {
    const w = Math.min(560, innerWidth - 32), h = Math.min(innerHeight * 0.9, 680);
    return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h };
  };
  const place = r => Object.assign(panel.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  const open = card => {
    from = card;
    mImg.src = card.querySelector('img').src;
    mT.textContent = card.querySelector('b').textContent;
    mS.textContent = card.querySelector('small').textContent;
    mP.textContent = card.dataset.desc;
    const v = card.dataset.video, l = card.dataset.link;
    cta.textContent = v ? 'Play reel ▶' : l ? 'Visit project ↗' : '';
    cta.href = v || l || '#'; cta.target = l ? '_blank' : '';
    cta.dataset.video = v || '';
    const r = card.getBoundingClientRect();
    panel.style.transition = 'none'; place(r);
    card.style.visibility = 'hidden';
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false');
    window.__lenis && window.__lenis.stop();
    panel.offsetWidth;
    panel.style.transition = `all .6s ${spring}`;
    place(target());
    setTimeout(() => m.classList.add('ready'), 250);
    panel.querySelector('.morph-close').focus({ preventScroll: true });
  };
  const close = () => {
    if (!from || !m.classList.contains('open')) return;
    m.classList.remove('ready'); m.classList.add('closing'); m.classList.remove('open');
    panel.style.transition = `all .5s ${spring}`;
    place(from.getBoundingClientRect());
    const c = from;
    setTimeout(() => { m.classList.remove('closing'); c.style.visibility = ''; m.setAttribute('aria-hidden', 'true'); c.focus({ preventScroll: true }); }, 500);
    window.__lenis && window.__lenis.start();
    from = null;
  };
  document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => open(c)));
  m.querySelector('.morph-backdrop').addEventListener('click', close);
  m.querySelector('.morph-close').addEventListener('click', close);
  addEventListener('keydown', e => e.key === 'Escape' && close());
  addEventListener('resize', () => m.classList.contains('open') && place(target()));
  cta.addEventListener('click', e => {
    if (!cta.dataset.video) return;
    e.preventDefault(); close();
    const lb = document.querySelector('.lightbox'), lv = lb.querySelector('video');
    setTimeout(() => { lv.src = cta.dataset.video; lb.classList.add('open'); lv.play().catch(() => {}); }, 450);
  });

  // In-view staggered blur grid
  const items = [...document.querySelectorAll('.m-item')];
  const io = new IntersectionObserver(es => {
    if (es.some(e => e.isIntersecting)) {
      items.forEach((it, i) => setTimeout(() => it.classList.add('in'), i * 90));
      io.disconnect();
    }
  }, { rootMargin: '0px 0px -250px 0px' });
  if (items.length) io.observe(document.querySelector('.masonry'));
})();
