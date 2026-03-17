(function () {
    'use strict';

    /* ── PAGE LOADER ─────────────────────────────── */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => { loader.classList.add('hide'); }, 1500);
    });

    /* ── SCROLL PROGRESS ─────────────────────────── */
    const bar = document.getElementById('progressBar');
    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        bar.style.width = pct + '%';
    }, { passive: true });

    /* ── HEADER SCROLL ───────────────────────────── */
    const hdr = document.getElementById('hdr');
    const backTop = document.getElementById('backTop');
    window.addEventListener('scroll', () => {
        hdr.classList.toggle('scrolled', window.scrollY > 60);
        backTop.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ── HAMBURGER ───────────────────────────────── */
    const hbg = document.getElementById('hbg');
    const mob = document.getElementById('mobMenu');
    hbg.addEventListener('click', () => {
        const open = hbg.classList.toggle('open');
        hbg.setAttribute('aria-expanded', String(open));
        mob.style.display = open ? 'flex' : 'none';
    });
    document.addEventListener('click', e => {
        if (!hdr.contains(e.target) && hbg.classList.contains('open')) {
            hbg.classList.remove('open');
            hbg.setAttribute('aria-expanded', 'false');
            mob.style.display = 'none';
        }
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        hbg.classList.remove('open');
        hbg.setAttribute('aria-expanded', 'false');
        mob.style.display = 'none';
    }));

    /* ── SMOOTH SCROLL ───────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const offset = hdr.offsetHeight + 8;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });

    /* ── SCROLL REVEAL ───────────────────────────── */
    const ro = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting) { en.target.classList.add('on'); ro.unobserve(en.target); }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-r]').forEach(el => ro.observe(el));

    /* ── COUNTER ANIMATION ───────────────────────── */
    const countTargets = [18, 4000, 99];
    const countSuffixes = ['', '', ''];

    function formatCount(val, target) {
        if (target >= 1000) return (val / 1000).toFixed(0) + 'k';
        return String(val);
    }

    function animateCounter(el, target, duration) {
        let start = null;
        function step(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = Math.floor(ease * target);
            el.textContent = formatCount(val, target);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = formatCount(target, target);
        }
        requestAnimationFrame(step);
    }

    const statsEl = document.querySelector('.hero-stats');
    const countEls = document.querySelectorAll('.count-num');
    const statsObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        countEls.forEach((el, i) => animateCounter(el, countTargets[i], 2000));
        statsObs.disconnect();
    }, { threshold: 0.5 });
    if (statsEl) statsObs.observe(statsEl);

    /* ── GALLERY FILTER ──────────────────────────── */
    document.querySelectorAll('.gtab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.gtab').forEach(b => b.classList.remove('on'));
            btn.classList.add('on');
            const cat = btn.dataset.cat;
            document.querySelectorAll('.gcard').forEach((card, i) => {
                const cats = card.dataset.cat || '';
                const show = cat === 'all' || cats.split(' ').includes(cat);
                if (show) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(16px)';
                    setTimeout(() => {
                        card.style.transition = 'opacity .45s ease, transform .45s ease';
                        card.style.opacity = '1';
                        card.style.transform = '';
                    }, i * 70);
                } else {
                    card.style.transition = 'opacity .25s ease';
                    card.style.opacity = '0';
                    setTimeout(() => { card.style.display = 'none'; }, 260);
                }
            });
        });
    });

    /* ── TESTIMONIALS SLIDER ─────────────────────── */
    const track = document.getElementById('testiTrack');
    const dotsWrap = document.getElementById('tDots');
    const cards = track.querySelectorAll('.testi-card');
    let cur = 0, autoTimer;

    cards.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'tdot' + (i === 0 ? ' on' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
    });

    function getCardW() { return cards[0].offsetWidth + 24; }
    function goTo(n) {
        cur = ((n % cards.length) + cards.length) % cards.length;
        track.style.transform = `translateX(-${cur * getCardW()}px)`;
        dotsWrap.querySelectorAll('.tdot').forEach((d, i) => d.classList.toggle('on', i === cur));
    }

    document.getElementById('tPrev').addEventListener('click', () => { goTo(cur - 1); resetTimer(); });
    document.getElementById('tNext').addEventListener('click', () => { goTo(cur + 1); resetTimer(); });

    let tsX = 0;
    track.addEventListener('touchstart', e => tsX = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend', e => {
        if (Math.abs(tsX - e.changedTouches[0].clientX) > 50)
            goTo(tsX > e.changedTouches[0].clientX ? cur + 1 : cur - 1);
    }, { passive: true });
    window.addEventListener('resize', () => goTo(cur), { passive: true });

    function resetTimer() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(cur + 1), 5500); }
    resetTimer();

    /* ── FAQ ACCORDION ───────────────────────────── */
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-q').addEventListener('click', () => {
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    /* ── BOOKING FORM ────────────────────────────── */
    document.getElementById('bookForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('bName').value.trim();
        const email = document.getElementById('bEmail').value.trim();
        const status = document.getElementById('fStatus');
        if (!name || !email) {
            status.style.color = 'var(--red)';
            status.textContent = '⚠ Please fill in your name and email.';
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            status.style.color = 'var(--red)';
            status.textContent = '⚠ Please enter a valid email address.';
            return;
        }
        const btn = e.target.querySelector('.f-submit');
        btn.textContent = 'Sending…';
        btn.disabled = true;
        setTimeout(() => {
            status.style.color = 'var(--gold-2)';
            status.textContent = '✓ Received! We\'ll confirm within 2 hours.';
            e.target.reset();
            btn.innerHTML = 'Request My Appointment <i class="fas fa-arrow-right"></i>';
            btn.disabled = false;
        }, 1500);
    });

    /* ── ACTIVE NAV LINK ─────────────────────────── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navObs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (en.isIntersecting)
                navLinks.forEach(l => l.classList.toggle('active-nav', l.getAttribute('href') === '#' + en.target.id));
        });
    }, { rootMargin: '-50% 0px -50% 0px' });
    sections.forEach(s => navObs.observe(s));

    /* ── COOKIE BANNER ───────────────────────────── */
    const cookieBanner = document.getElementById('cookieBanner');
    if (!localStorage.getItem('cookie-consent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 2500);
    }
    document.getElementById('cookieAccept').addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'accepted');
        cookieBanner.classList.remove('show');
    });
    document.getElementById('cookieDecline').addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'declined');
        cookieBanner.classList.remove('show');
    });

})();