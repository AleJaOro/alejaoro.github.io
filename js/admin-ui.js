/**
 * Utilidades compartidas del panel admin (toast, sidebar, logout).
 */
(function (global) {
  "use strict";

  function showToast(message, type) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.className = "toast is-visible" + (type === "err" ? " toast--err" : " toast--ok");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2800);
  }

  function openModal(overlay) {
    if (!overlay) return;
    overlay.classList.add("is-open");
    const first = overlay.querySelector("input, select, textarea, button");
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove("is-open");
  }

  function bindModal(overlay) {
    if (!overlay) return;
    overlay.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeModal(overlay);
      });
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeModal(overlay);
      }
    });
  }

  function initShell() {
    if (!PagoFacilAuth.requireAuth()) return false;

    const userEl = document.getElementById("adminUserName");
    if (userEl) userEl.textContent = PagoFacilAuth.getUser() || "Admin";

    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", function () {
        PagoFacilAuth.logout();
        window.location.href = "login.html";
      });
    }

    const sidebar = document.getElementById("adminSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    const btnMenu = document.getElementById("btnMenu");

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove("is-open");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.hidden = true;
      }
    }

    function openSidebar() {
      if (sidebar) sidebar.classList.add("is-open");
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.classList.add("is-open");
      }
    }

    if (btnMenu) {
      btnMenu.addEventListener("click", function () {
        if (sidebar && sidebar.classList.contains("is-open")) closeSidebar();
        else openSidebar();
      });
    }
    if (backdrop) backdrop.addEventListener("click", closeSidebar);

    return true;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeUrl(url) {
    const u = (url || "").trim();
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    return "https://" + u;
  }

  global.PagoFacilAdminUI = {
    showToast,
    openModal,
    closeModal,
    bindModal,
    initShell,
    escapeHtml,
    normalizeUrl,
  };
})(window);
