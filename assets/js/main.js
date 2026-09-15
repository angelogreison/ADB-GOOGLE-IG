/* ==========================================================================
   main.js — Artesana del Barro v20260915a
   ========================================================================== */

/* ---------- 1. Deferred analytics (GA4 + Meta Pixel) ----------
   Loaded on first user interaction OR after 4s fallback. */
(function () {
  var loaded = false;
  var events = ['scroll', 'click', 'touchstart', 'mousemove', 'keydown'];

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    clearTimeout(fallbackTimer);
    events.forEach(function (evt) { window.removeEventListener(evt, loadAnalytics); });

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', 'G-9HD0M84T4R');
    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-9HD0M84T4R';
    document.head.appendChild(gtagScript);

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1002053692646882');
    fbq('track', 'PageView');
  }

  var fallbackTimer = setTimeout(loadAnalytics, 4000);
  events.forEach(function (evt) { window.addEventListener(evt, loadAnalytics, { passive: true }); });
})();

/* ---------- 2. Elfsight lazy load ----------
   El script (~550 KB) se inyecta SOLO cuando la seccion de reviews
   entra en viewport. Elimina ese peso del payload inicial. */
(function () {
  var elfsightLoaded = false;
  var container = document.getElementById('elfsight-reviews-container');
  if (!container) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !elfsightLoaded) {
        elfsightLoaded = true;
        observer.disconnect();
        var s = document.createElement('script');
        s.src = 'https://elfsightcdn.com/platform.js';
        s.async = true;
        document.head.appendChild(s);
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(container);
})();

/* ---------- 3. Hero Video lazy load ----------
   preload="none" en el HTML evita descargar el video en el load critico.
   Se activa cuando el video entra en viewport (mejora LCP). */
(function () {
  var video = document.getElementById('heroVideo');
  if (!video) return;

  var videoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        video.preload = 'auto';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.load();
        video.play().catch(function () {});
        videoObserver.disconnect();
      }
    });
  }, { threshold: 0.1 });

  videoObserver.observe(video);

  video.addEventListener('loadeddata', function () {
    video.classList.add('ready');
  });
})();

(function () {
  /* ---------- 4. Nav scroll + sticky CTA (rAF-throttled) ---------- */
  var nav = document.getElementById('navbar');
  var stickyCta = document.querySelector('.sticky-cta');
  var heroEl = document.getElementById('scroll-hero') || document.querySelector('.page-hero') || document.querySelector('.error-page');
  var scrollTicking = false;

  var onScrollFrame = function () {
    scrollTicking = false;
    // Batch: lecturas primero, escrituras despues (evita forced reflow)
    var scrollY = window.scrollY;
    var heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : 0;
    if (nav) nav.classList.toggle('scrolled', scrollY > 40);
    if (stickyCta && heroEl) stickyCta.classList.toggle('visible', heroBottom <= 0);
  };

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });
  onScrollFrame();

  /* ---------- 5. Mobile menu con aria-expanded ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ---------- 6. Reveal on scroll (IntersectionObserver) ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .reveal-scale, .stagger').forEach(function (el) { io.observe(el); });

  /* ---------- 7. Counter animation ---------- */
  var counters = document.querySelectorAll('.num[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var decimals = parseInt(el.getAttribute('data-decimal') || '0');
        var dur = 1600;
        var start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = decimals ? val.toFixed(decimals) : Math.round(val);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = decimals ? target.toFixed(decimals) : target;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- 8. Testimonials carousel ---------- */
  var testTrack = document.getElementById('testTrack');
  if (testTrack) {
    var testCards = testTrack.querySelectorAll('.test-card');
    var testDotsWrap = document.getElementById('testDots');
    var testIndex = 0;

    testCards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'test-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir a la resena ' + (i + 1));
      dot.addEventListener('click', function () { goToTest(i); });
      testDotsWrap.appendChild(dot);
    });
    var testDots = testDotsWrap.querySelectorAll('.test-dot');

    function goToTest(i) {
      testIndex = (i + testCards.length) % testCards.length;
      testTrack.style.transform = 'translateX(-' + (testIndex * 100) + '%)';
      testDots.forEach(function (d, di) { d.classList.toggle('active', di === testIndex); });
    }

    var prevBtn = document.getElementById('testPrev');
    var nextBtn = document.getElementById('testNext');
    if (prevBtn) prevBtn.addEventListener('click', function () { goToTest(testIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToTest(testIndex + 1); });
    setInterval(function () { goToTest(testIndex + 1); }, 7000);
  }

  /* ---------- 9. FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- 10. Schedule Booking Modal ---------- */
  var selectedSchedule = null;
  var modal = document.getElementById('schedule-modal');

  window.openScheduleModal = function (el) {
    if (!modal) return;
    selectedSchedule = {
      category: el.getAttribute('data-category'),
      day: el.getAttribute('data-day'),
      start: el.getAttribute('data-start'),
      end: el.getAttribute('data-end')
    };

    // .textContent en lugar de .innerText evita forzar layout
    document.getElementById('m-title').textContent = selectedSchedule.category;
    document.getElementById('m-subtitle').textContent = selectedSchedule.day + ' de ' + selectedSchedule.start + ' - ' + selectedSchedule.end + 'hs';

    var planDisplay = document.getElementById('m-plan-display');
    var cat = selectedSchedule.category.toLowerCase();
    if (cat.indexOf('modelado') !== -1) {
      planDisplay.textContent = 'Plan Modelado ($79.000)';
    } else if (cat.indexOf('alfarer') !== -1) {
      planDisplay.textContent = 'Plan Torno ($90.000)';
    } else {
      planDisplay.textContent = 'Consultar Plan';
    }

    document.getElementById('modal-form').reset();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    var firstInput = modal.querySelector('input');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
  };

  window.closeModal = function () {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  window.handleBooking = function (event) {
    event.preventDefault();
    var name = document.getElementById('m-name').value;
    var email = document.getElementById('m-email').value;
    var whatsapp = document.getElementById('m-whatsapp').value;
    var plan = document.getElementById('m-plan-display').textContent;

    if (!selectedSchedule) return;

    var message = 'Hola! Me gustaria reservar un lugar:\n\n'
      + 'Nombre: ' + name + '\n'
      + 'Email: ' + email + '\n'
      + 'WhatsApp: ' + whatsapp + '\n'
      + 'Clase: ' + selectedSchedule.category + '\n'
      + 'Dia: ' + selectedSchedule.day + '\n'
      + 'Horario: ' + selectedSchedule.start + ' - ' + selectedSchedule.end + 'hs\n'
      + 'Plan: ' + plan;

    var waUrl = 'https://wa.me/5491156206435?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    closeModal();
  };

  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  document.addEventListener('click', function (e) {
    if (modal && e.target === modal) closeModal();
  });
})();

