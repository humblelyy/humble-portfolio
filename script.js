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
    lenis = new Lenis({ lerp: 0.09 });
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
