/** Utilidades compartidas UI y formato */

export function $(sel, root = document) {
  return root.querySelector(sel);
}

export function $$(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatCRC(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(isoOrDate) {
  if (!isoOrDate) return "—";
  const d = isoOrDate?.toDate ? isoOrDate.toDate() : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
  }).format(d);
}

export function formatDateTime(isoOrDate) {
  if (!isoOrDate) return "—";
  const d = isoOrDate?.toDate ? isoOrDate.toDate() : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function normalizeUrl(url) {
  const u = (url || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return "https://" + u;
}

export function uid() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function showToast(message, type = "ok") {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast is-visible toast--${type === "err" ? "err" : "ok"}`;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("is-visible"), 3200);
}

export function openModal(overlay) {
  if (!overlay) return;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  const focusable = overlay.querySelector("input, select, textarea, button");
  if (focusable) setTimeout(() => focusable.focus(), 40);
}

export function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
}

export function bindModal(overlay) {
  if (!overlay || overlay.dataset.bound) return;
  overlay.dataset.bound = "1";
  overlay.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(overlay));
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal(overlay);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal(overlay);
  });
}

export function initAdminShell({ user, onLogout }) {
  const nameEl = document.getElementById("adminUserName");
  if (nameEl) nameEl.textContent = user?.nombre || user?.email || "Admin";

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => onLogout());
  }

  const sidebar = document.getElementById("adminSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const btnMenu = document.getElementById("btnMenu");

  const close = () => {
    sidebar?.classList.remove("is-open");
    if (backdrop) {
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
    }
  };
  const open = () => {
    sidebar?.classList.add("is-open");
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add("is-open");
    }
  };

  btnMenu?.addEventListener("click", () => {
    sidebar?.classList.contains("is-open") ? close() : open();
  });
  backdrop?.addEventListener("click", close);
}

/** Días restantes hasta el próximo día de corte (1–31) */
export function daysUntilCutoff(diaCorte) {
  const day = Number(diaCorte);
  if (!day || day < 1 || day > 31) return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  let target = new Date(y, m, Math.min(day, daysInMonth(y, m)));
  target.setHours(23, 59, 59, 999);
  if (target < now) {
    const nm = m + 1;
    target = new Date(y, nm, Math.min(day, daysInMonth(y, nm)));
    target.setHours(23, 59, 59, 999);
  }
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function cutoffStatus(diaCorte) {
  const days = daysUntilCutoff(diaCorte);
  if (days === null) return { days: null, label: "Sin corte", tone: "muted" };
  if (days <= 0) return { days, label: "Vence hoy", tone: "danger" };
  if (days <= 3) return { days, label: `Vence en ${days} día${days === 1 ? "" : "s"}`, tone: "warn" };
  if (days <= 7) return { days, label: `Corte en ${days} días`, tone: "info" };
  return { days, label: `Corte día ${diaCorte}`, tone: "ok" };
}

export function whatsappReminderUrl({ telefono, clienteNombre, servicio, monto, comision, total, diaCorte }) {
  let phone = String(telefono || "").replace(/\D/g, "");
  if (phone.length === 8) phone = "506" + phone;
  if (!phone) return null;

  const msg = [
    `Hola ${clienteNombre || ""}, te escribe PagoFácil.`.trim(),
    ``,
    `Recordatorio de pago del servicio: *${servicio}*`,
    `• Monto del recibo: ${formatCRC(monto)}`,
    `• Nuestra comisión: ${formatCRC(comision)}`,
    `• Total a cancelar: *${formatCRC(total)}*`,
    diaCorte ? `• Día de corte: ${diaCorte}` : null,
    ``,
    `Cuando desees, contáctanos y gestionamos el pago por ti (no es pago en línea automático).`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
