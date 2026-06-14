/* ═══════════════════════════════════════════
   SURJYA BAKERY — Bakery Animation JS 🍞
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Bakery Loader (bread rising) ── */
  function injectLoader() {
    const loader = document.createElement('div');
    loader.className = 'bakery-loader';
    loader.id = 'bakeryLoader';
    loader.innerHTML = `
      <div class="bread-loader">
        <div class="steam steam-1"></div>
        <div class="steam steam-2"></div>
        <div class="steam steam-3"></div>
        <div class="bread-body">
          <div class="bread-shine"></div>
        </div>
      </div>
      <div class="loader-text">
        Baking
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
        <div class="loader-dot"></div>
      </div>`;
    document.body.prepend(loader);

    // Hide after page is ready
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 450);
      }, 600);
    });
    // Fallback
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 450);
    }, 2200);
  }

  /* ── 2. Flour particles on load ── */
  const BAKERY_EMOJIS = ['🍞', '🥐', '🧁', '🍩', '🥖', '🎂', '🍪', '🧇'];
  function spawnFlourParticles() {
    const count = 8;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'flour-particle';
        el.innerText = BAKERY_EMOJIS[Math.floor(Math.random() * BAKERY_EMOJIS.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top  = '-30px';
        const dur = 2.2 + Math.random() * 1.8;
        el.style.animationDuration = dur + 's';
        el.style.fontSize = (14 + Math.random() * 14) + 'px';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), dur * 1000 + 200);
      }, i * 130);
    }
  }

  /* ── 3. Page exit transition ── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href], [onclick]');
    if (!link) return;
    const onclickAttr = link.getAttribute('onclick') || '';
    const hrefAttr    = link.getAttribute('href') || '';
    const isPageNav   = onclickAttr.includes('goPage') || onclickAttr.includes('location.href') ||
                        (hrefAttr.endsWith('.html') && !hrefAttr.startsWith('http'));
    if (!isPageNav) return;
    requestAnimationFrame(() => {
      document.body.classList.add('page-exit');
    });
  });

  /* ── 4. Warm button ripple ── */
  function addRipple(e) {
    const btn    = e.currentTarget;
    const circle = document.createElement('span');
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const x      = e.clientX - rect.left - size / 2;
    const y      = e.clientY - rect.top  - size / 2;
    circle.className = 'ripple-circle';
    circle.style.cssText = `width:${size}px; height:${size}px; left:${x}px; top:${y}px;`;
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  }

  function attachRipples() {
    const selectors = [
      '.btn-primary', '.btn-save', '.btn-submit', '.btn-create',
      '.checkout-btn', '.btn-print', '.btn-add-item', '.btn-add-staff',
      '.btn-gave', '.btn-got', '.conf-ok', '.conf-no', '.modal-btn',
      '.action-chip', '.act-btn', '.btn-record', '.btn-danger', '.btn-add-client'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(btn => {
      if (btn.dataset.ripple) return;
      btn.dataset.ripple = '1';
      btn.classList.add('btn-ripple');
      btn.addEventListener('click', addRipple);
    });
  }

  /* ── 5. Bread emoji burst on sale ── */
  function breadBurst(x, y) {
    const emojis = ['🍞', '✅', '🥐', '💰', '🎉'];
    emojis.forEach((emoji, i) => {
      const el = document.createElement('div');
      el.className = 'emoji-burst';
      el.innerText = emoji;
      el.style.left = (x + (i - 2) * 28) + 'px';
      el.style.top  = y + 'px';
      el.style.animationDelay = (i * 0.07) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    });
  }

  // Hook onto sale record buttons
  function hookSaleButton() {
    const btn = document.getElementById('recordBtn');
    if (!btn || btn.dataset.burstHooked) return;
    btn.dataset.burstHooked = '1';
    btn.addEventListener('click', (e) => {
      if (!btn.disabled) {
        const r = btn.getBoundingClientRect();
        breadBurst(r.left + r.width / 2, r.top);
      }
    });
  }

  /* ── 6. Number count-up ── */
  function countUp(el, target, duration) {
    const start   = performance.now();
    const prefix  = el.innerText.match(/^[^0-9]*/)?.[0] || '';
    const suffix  = el.innerText.match(/[^0-9.]*$/)?.[0] || '';
    el.classList.add('num-pop');
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const value    = target * ease;
      el.innerText   = prefix + Math.floor(value).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.innerText = prefix + Math.round(target).toLocaleString() + suffix;
    }
    requestAnimationFrame(step);
  }

  function animateStatCards() {
    document.querySelectorAll('.stat-card h3, .sum-amount, .total-amount').forEach(el => {
      if (el.dataset.animated) return;
      el.dataset.animated = '1';
      const text   = el.innerText.replace(/[₹,\s]/g, '');
      const number = parseFloat(text);
      if (!isNaN(number) && number > 0) {
        el.innerText = el.innerText.replace(text, '0');
        setTimeout(() => countUp(el, number, 900), 200);
      }
    });
  }

  /* ── 7. Scroll reveal ── */
  function setupScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    const selectors = [
      '.inv-card', '.emp-card', '.order-card', '.customer-card',
      '.record-card', '.item-card', '.settings-card',
      '.delivery-card', '.client-card'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el, i) => {
      el.style.animationPlayState = 'paused';
      el.style.animationDelay    = `${Math.min(i * 0.06, 0.4)}s`;
      observer.observe(el);
    });
  }

  /* ── 8. Stat number watcher (Firebase realtime) ── */
  function watchStatUpdates() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        const el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
        if (el && (el.matches('.stat-card h3') || el.matches('.sum-amount'))) {
          el.classList.remove('num-pop');
          void el.offsetWidth;
          el.classList.add('num-pop');
        }
      });
    });
    document.querySelectorAll('.stat-card h3, .sum-amount').forEach(el => {
      observer.observe(el, { characterData: true, childList: true, subtree: true });
    });
  }

  /* ── 9. Dark mode smooth transition ── */
  function enhanceDarkMode() {
    const toggle = document.getElementById('darkToggle');
    if (!toggle) return;
    const orig = toggle.onclick;
    toggle.onclick = function (e) {
      document.documentElement.style.transition = 'background 0.4s, color 0.3s';
      if (orig) orig.call(this, e);
      setTimeout(() => document.documentElement.style.transition = '', 500);
    };
  }

  /* ── 10. Item tile add-to-cart bounce ── */
  function hookItemTiles() {
    document.querySelectorAll('.item-tile').forEach(tile => {
      if (tile.dataset.bounceHooked) return;
      tile.dataset.bounceHooked = '1';
      tile.addEventListener('click', function () {
        this.style.animation = 'none';
        void this.offsetWidth;
        this.style.animation = 'ovenBake 0.3s cubic-bezier(0.34,1.4,0.64,1)';
        if (navigator.vibrate) navigator.vibrate(30);
      });
    });
  }

  /* ── 11. DOM mutation observer ── */
  const domObserver = new MutationObserver(() => {
    attachRipples();
    setupScrollReveal();
    hookItemTiles();
    hookSaleButton();
  });

  /* ── INIT ── */
  function init() {
    injectLoader();
    spawnFlourParticles();
    attachRipples();
    animateStatCards();
    setupScrollReveal();
    watchStatUpdates();
    enhanceDarkMode();
    hookItemTiles();
    hookSaleButton();
    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  setTimeout(animateStatCards, 1200);
  setTimeout(animateStatCards, 2500);

})();
