(() => {
  "use strict";

  const header = document.getElementById("header");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const yearEl = document.getElementById("year");
  const formPago = document.getElementById("formPago");
  const formCita = document.getElementById("formCita");
  const pagoExito = document.getElementById("pagoExito");
  const citaExito = document.getElementById("citaExito");
  const fechaInput = document.getElementById("fecha");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Fecha mínima: hoy
  if (fechaInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    fechaInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Header sombra al scroll
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menú móvil
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  function clearInvalid(form) {
    form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  }

  function markInvalid(el) {
    el.classList.add("is-invalid");
  }

  function formatCurrency(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }

  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat("es-CR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  // Formulario de pago
  if (formPago && pagoExito) {
    formPago.addEventListener("submit", (e) => {
      e.preventDefault();
      clearInvalid(formPago);
      pagoExito.hidden = true;

      const proveedor = formPago.proveedor;
      const cuenta = formPago.cuenta;
      const nombre = formPago.nombrePago;
      const monto = formPago.monto;
      const email = formPago.emailPago;

      let ok = true;
      [proveedor, cuenta, nombre, monto, email].forEach((field) => {
        if (!field.checkValidity()) {
          markInvalid(field);
          ok = false;
        }
      });

      if (!ok) {
        formPago.querySelector(".is-invalid")?.focus();
        return;
      }

      const ref = "PF-" + Date.now().toString().slice(-8);
      const label = proveedor.options[proveedor.selectedIndex].text;

      pagoExito.innerHTML =
        `<strong>Solicitud registrada.</strong> ` +
        `Servicio: ${label}. Cuenta: ${cuenta.value.trim()}. ` +
        `Monto: ${formatCurrency(monto.value)}. ` +
        `Comprobante (demo) ref. <strong>${ref}</strong> para ${email.value.trim()}.`;
      pagoExito.hidden = false;
      formPago.reset();
      pagoExito.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // Formulario de citas
  if (formCita && citaExito) {
    formCita.addEventListener("submit", (e) => {
      e.preventDefault();
      clearInvalid(formCita);
      citaExito.hidden = true;

      const fields = [
        formCita.servicioCita,
        formCita.fecha,
        formCita.hora,
        formCita.nombreCita,
        formCita.telefono,
        formCita.emailCita,
      ];

      let ok = true;
      fields.forEach((field) => {
        if (!field.checkValidity()) {
          markInvalid(field);
          ok = false;
        }
      });

      if (!ok) {
        formCita.querySelector(".is-invalid")?.focus();
        return;
      }

      const servicioLabel = formCita.servicioCita.options[formCita.servicioCita.selectedIndex].text;
      const horaLabel = formCita.hora.options[formCita.hora.selectedIndex].text;
      const codigo = "CITA-" + Math.random().toString(36).slice(2, 8).toUpperCase();

      citaExito.innerHTML =
        `<strong>¡Cita confirmada!</strong> ` +
        `${formCita.nombreCita.value.trim()}, tu cita de <em>${servicioLabel}</em> ` +
        `quedó para el <strong>${formatDate(formCita.fecha.value)}</strong> a las <strong>${horaLabel}</strong>. ` +
        `Código: <strong>${codigo}</strong>. Te contactaremos al ${formCita.telefono.value.trim()}.`;
      citaExito.hidden = false;
      formCita.reset();
      citaExito.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }
})();
