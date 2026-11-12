(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Nav gets a background once you scroll */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!window.gsap || !window.ScrollTrigger || reduce) { root.classList.remove('motion'); return; }
  window.__motionReady = true;
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scrolling */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.4, offset: target ? -60 : 0 });
    else window.scrollTo({ top: target ? target.getBoundingClientRect().top + scrollY - 60 : 0, behavior: 'smooth' });
  }));

  /* Intro: lines rise, highlighter swipes in, details fade up */
  gsap.set('.hl', { backgroundSize: '0% 80%' });
  gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15, onComplete: () => root.classList.remove('motion') })
    .to('.nav', { opacity: 1, duration: 0.8 }, 0)
    .to('.hero-title .line > span', { y: 0, duration: 1.3, stagger: 0.1 }, 0.1)
    .to('.hl', { backgroundSize: '100% 80%', duration: 0.9, ease: 'expo.inOut' }, 0.8)
    .fromTo('.hero-sub', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.6)
    .fromTo('.facts', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 0.75)
    .from('.facts > div', { y: 12, duration: 1, stagger: 0.06 }, 0.75);

  /* Hero drifts slower than the page as you scroll away */
  gsap.to('.hero-title', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Projects heading line */
  gsap.from('.projects .h2', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.projects .h2', start: 'top 85%', once: true } });

  /* Projects: fade up on entry, artwork moves with parallax */
  $$('.project').forEach((p, i) => {
    gsap.from(p, {
      opacity: 0, y: 60, duration: 1.2, delay: (i % 2) * 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: p, start: 'top 88%', once: true },
    });
    gsap.fromTo($('.art-inner', p), { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: $('.art', p), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* Footer email slides in */
  gsap.from('.footer-email', { xPercent: -6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%', once: true } });

  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
