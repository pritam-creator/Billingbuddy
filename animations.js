/* ═══════════════════════════════════════════
   SURJYA BAKERY — Animation JS
   Handles: page transitions, ripple, number
   count-up, scroll reveal
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Page exit transition on link clicks ── */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href], [onclick]');
    if (!link) return;

    // Only intercept same-origin .html navigations
    const onclickAttr = link.getAttribute('onclick') || '';
    const hrefAttr    = link.getAttribute('href') || '';
    const isPageNav   = onclickAttr.includes('goPage') || onclickAttr.includes('location.href') ||
                        (hrefAttr.endsWith('.html') && !hrefAttr.startsWith('http'));

    if (!isPageNav) return;

    // Let the click execute, but add exit class immediately
    requestAnimationFrame(() => {
      document.body.classList.add('page-exit');
    });
  });

  /* ── 2. Button ripple effect ── */
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
      '.action-chip', '.act-btn'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(btn => {
      if (btn.dataset.ripple) return;
      btn.dataset.ripple = '1';
      btn.classList.add('btn-ripple');
      btn.addEventListener('click', addRipple);
    });
  }

  /* ── 3. Number count-up for stat cards ── */
  function countUp(el, target, duration) {
    const start    = performance.now();
    const isFloat  = String(target).includes('.');
    const prefix   = el.innerText.match(/^[^0-9]*/)?.[0] || '';
    const suffix   = el.innerText.match(/[^0-9.]*$/)?.[0] || '';

    el.classList.add('num-pop');

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value    = target * ease;
      el.innerText   = prefix + (isFloat ? value.toFixed(2) : Math.floor(value).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.innerText = prefix + (isFloat ? target.toFixed(2) : Math.round(target).toLocaleString()) + suffix;
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

  /* ── 4. Scroll reveal for cards ── */
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

    const revealSelectors = [
      '.inv-card', '.emp-card', '.order-card', '.customer-card',
      '.record-card', '.item-card', '.settings-card'
    ];

    document.querySelectorAll(revealSelectors.join(',')).forEach((el, i) => {
      el.style.animationPlayState = 'paused';
      el.style.animationDelay    = `${Math.min(i * 0.06, 0.4)}s`;
      observer.observe(el);
    });
  }

  /* ── 5. Smooth number update observer (for Firebase real-time) ── */
  function watchStatUpdates() {
    const target = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'characterData' || m.type === 'childList') {
          const el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
          if (el && (el.matches('.stat-card h3') || el.matches('.sum-amount'))) {
            el.classList.remove('num-pop');
            void el.offsetWidth; // reflow
            el.classList.add('num-pop');
          }
        }
      });
    });

    document.querySelectorAll('.stat-card h3, .sum-amount').forEach(el => {
      target.observe(el, { characterData: true, childList: true, subtree: true });
    });
  }

  /* ── 6. Smooth dark mode transition ── */
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

  /* ── 7. Re-run on DOM mutations (for dynamically rendered cards) ── */
  const domObserver = new MutationObserver(() => {
    attachRipples();
    setupScrollReveal();
  });

  /* ── Init ── */
  function init() {
    attachRipples();
    animateStatCards();
    setupScrollReveal();
    watchStatUpdates();
    enhanceDarkMode();

    domObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-animate stat cards after Firebase data loads
  setTimeout(animateStatCards, 1200);
  setTimeout(animateStatCards, 2500);

})();
