/* ══════════════════════════════════════════════════════
   PWA Install Prompt — shared across all pages
   Shows a friendly bottom banner encouraging install,
   and exposes window.triggerPWAInstall() for a manual
   "Install App" button (used in Settings).
   ══════════════════════════════════════════════════════ */

// ── Register the service worker (this is what actually makes offline mode work) ──
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(reg => console.log("Service worker registered:", reg.scope))
      .catch(err => console.warn("Service worker registration failed:", err));
  });
}

(function () {
  let deferredPrompt = null;
  const DISMISS_KEY = "pwaInstallDismissedAt";
  const DISMISS_DAYS = 7;

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches ||
           window.navigator.standalone === true; // iOS Safari
  }

  function isIOS() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  function wasDismissedRecently() {
    const t = localStorage.getItem(DISMISS_KEY);
    if (!t) return false;
    const days = (Date.now() - parseInt(t, 10)) / 86400000;
    return days < DISMISS_DAYS;
  }

  function dismissBanner() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    const el = document.getElementById("pwaInstallBanner");
    if (el) el.remove();
  }

  function buildBanner(mode) {
    if (document.getElementById("pwaInstallBanner")) return;

    const banner = document.createElement("div");
    banner.id = "pwaInstallBanner";
    banner.style.cssText = `
      position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 5000;
      background: #1a1208; color: #f8f5f0; border-radius: 16px;
      padding: 14px 16px; display: flex; align-items: center; gap: 12px;
      box-shadow: 0 10px 34px rgba(0,0,0,0.28);
      font-family: 'DM Sans', sans-serif; animation: pwaSlideUp 0.4s cubic-bezier(0.22,1,0.36,1);
      max-width: 480px; margin: 0 auto;
    `;

    if (!document.getElementById("pwaInstallKeyframes")) {
      const style = document.createElement("style");
      style.id = "pwaInstallKeyframes";
      style.textContent = `@keyframes pwaSlideUp { from { transform: translateY(120%); opacity:0; } to { transform: translateY(0); opacity:1; } }`;
      document.head.appendChild(style);
    }

    const icon = document.createElement("div");
    icon.style.cssText = "font-size:26px; flex-shrink:0;";
    icon.textContent = "🥐";
    banner.appendChild(icon);

    const textWrap = document.createElement("div");
    textWrap.style.cssText = "flex:1; min-width:0;";
    const title = document.createElement("div");
    title.style.cssText = "font-size:13px; font-weight:800;";
    title.textContent = "App Install Karo";
    const sub = document.createElement("div");
    sub.style.cssText = "font-size:11.5px; color:#c9bfae; margin-top:2px; line-height:1.4;";
    sub.textContent = mode === "ios"
      ? "Share button → \"Add to Home Screen\" dabao"
      : "Fast access + offline mode ke liye home screen pe add karo";
    textWrap.appendChild(title);
    textWrap.appendChild(sub);
    banner.appendChild(textWrap);

    if (mode === "android") {
      const installBtn = document.createElement("button");
      installBtn.textContent = "Install";
      installBtn.style.cssText = "background:#c8860a; color:#fff; border:none; padding:9px 16px; border-radius:10px; font-weight:800; font-size:12.5px; cursor:pointer; font-family:'DM Sans',sans-serif; flex-shrink:0;";
      installBtn.onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choice.outcome === "accepted") dismissBanner();
      };
      banner.appendChild(installBtn);
    }

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = "background:transparent; border:none; color:#9c8e7a; font-size:20px; cursor:pointer; padding:0 4px; line-height:1; flex-shrink:0;";
    closeBtn.onclick = dismissBanner;
    banner.appendChild(closeBtn);

    document.body.appendChild(banner);
  }

  // Android / Chrome / Edge: capture the native prompt event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone() && !wasDismissedRecently()) {
      buildBanner("android");
    }
  });

  // iOS Safari has no beforeinstallprompt — show manual instructions instead
  document.addEventListener("DOMContentLoaded", () => {
    if (isIOS() && !isStandalone() && !wasDismissedRecently()) {
      setTimeout(() => buildBanner("ios"), 1500);
    }
  });

  window.addEventListener("appinstalled", dismissBanner);

  // Exposed for a manual "Install App" button (e.g. in Settings)
  window.triggerPWAInstall = async function () {
    if (isStandalone()) {
      alert("App pehle se hi install hai! 🎉");
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      return choice.outcome;
    }
    if (isIOS()) {
      alert("iPhone/iPad pe install karne ke liye:\n\n1. Share button (⬆️) dabao\n2. \"Add to Home Screen\" choose karo\n3. \"Add\" dabao");
    } else {
      alert("Is browser mein abhi install available nahi hai. Chrome ya Edge try karein.");
    }
  };

  window.isPWAInstalled = isStandalone;
})();
