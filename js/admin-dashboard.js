(function () {
  "use strict";

  if (!PagoFacilAdminUI.initShell()) return;

  const grid = document.getElementById("tramitesGrid");
  const modal = document.getElementById("modalTramite");
  const form = document.getElementById("formTramite");
  const titleEl = document.getElementById("modalTramiteTitle");
  const btnNuevo = document.getElementById("btnNuevoTramite");

  PagoFacilAdminUI.bindModal(modal);

  function updateStats() {
    const tramites = PagoFacilStore.getTramites();
    const instrucciones = PagoFacilStore.getInstrucciones();
    const elT = document.getElementById("statTramites");
    const elI = document.getElementById("statInstrucciones");
    const elE = document.getElementById("statEnlaces");
    if (elT) elT.textContent = String(tramites.length);
    if (elI) elI.textContent = String(instrucciones.length);
    if (elE) elE.textContent = String(tramites.filter(function (t) { return t.enlace; }).length);
  }

  function render() {
    const list = PagoFacilStore.getTramites();
    updateStats();

    if (!list.length) {
      grid.innerHTML =
        '<div class="empty-state" style="grid-column:1/-1">' +
        "<strong>No hay trámites todavía</strong>" +
        "Pulsa “Nuevo trámite” para agregar el primero." +
        "</div>";
      return;
    }

    grid.innerHTML = list
      .map(function (t) {
        const nombre = PagoFacilAdminUI.escapeHtml(t.nombre);
        const desc = PagoFacilAdminUI.escapeHtml(t.descripcion || "Sin descripción");
        const enlace = PagoFacilAdminUI.escapeHtml(t.enlace);
        const icono = PagoFacilAdminUI.escapeHtml(t.icono || "🔗");
        const href = PagoFacilAdminUI.escapeHtml(t.enlace);
        return (
          '<article class="tramite-card" data-id="' + PagoFacilAdminUI.escapeHtml(t.id) + '">' +
          '<div class="tramite-card__head">' +
          '<div class="tramite-card__icon" aria-hidden="true">' + icono + "</div>" +
          "<div><h3>" + nombre + "</h3></div>" +
          "</div>" +
          '<p class="tramite-card__desc">' + desc + "</p>" +
          '<a class="tramite-card__link" href="' + href + '" target="_blank" rel="noopener noreferrer">' +
          "Abrir web oficial ↗</a>" +
          '<p class="tramite-card__desc" style="font-size:0.8rem;margin:0">' + enlace + "</p>" +
          '<div class="tramite-card__actions">' +
          '<button type="button" class="btn btn--primary btn--sm-admin" data-action="edit">Editar</button>' +
          '<button type="button" class="btn--danger btn--sm-admin" data-action="delete">Eliminar</button>' +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function openCreate() {
    form.reset();
    form.tramiteId.value = "";
    titleEl.textContent = "Nuevo trámite";
    form.tramiteIcono.value = "🔗";
    PagoFacilAdminUI.openModal(modal);
  }

  function openEdit(id) {
    const t = PagoFacilStore.getTramites().find(function (x) { return x.id === id; });
    if (!t) return;
    form.tramiteId.value = t.id;
    form.tramiteNombre.value = t.nombre;
    form.tramiteIcono.value = t.icono || "";
    form.tramiteDescripcion.value = t.descripcion || "";
    form.tramiteEnlace.value = t.enlace || "";
    titleEl.textContent = "Editar trámite";
    PagoFacilAdminUI.openModal(modal);
  }

  btnNuevo.addEventListener("click", openCreate);

  grid.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const card = btn.closest(".tramite-card");
    if (!card) return;
    const id = card.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "edit") {
      openEdit(id);
      return;
    }

    if (action === "delete") {
      const t = PagoFacilStore.getTramites().find(function (x) { return x.id === id; });
      const name = t ? t.nombre : "este trámite";
      if (!confirm('¿Eliminar el trámite "' + name + '"? Esta acción no se puede deshacer.')) return;
      PagoFacilStore.deleteTramite(id);
      render();
      PagoFacilAdminUI.showToast("Trámite eliminado", "ok");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = form.tramiteNombre.value.trim();
    let enlace = form.tramiteEnlace.value.trim();
    const descripcion = form.tramiteDescripcion.value.trim();
    const icono = form.tramiteIcono.value.trim();
    const id = form.tramiteId.value;

    if (!nombre) {
      form.tramiteNombre.focus();
      PagoFacilAdminUI.showToast("El nombre es obligatorio", "err");
      return;
    }
    if (!enlace) {
      form.tramiteEnlace.focus();
      PagoFacilAdminUI.showToast("El enlace es obligatorio", "err");
      return;
    }

    enlace = PagoFacilAdminUI.normalizeUrl(enlace);

    const payload = { nombre: nombre, enlace: enlace, descripcion: descripcion, icono: icono };

    if (id) {
      PagoFacilStore.updateTramite(id, payload);
      PagoFacilAdminUI.showToast("Trámite actualizado", "ok");
    } else {
      PagoFacilStore.addTramite(payload);
      PagoFacilAdminUI.showToast("Trámite añadido", "ok");
    }

    PagoFacilAdminUI.closeModal(modal);
    render();
  });

  render();
})();
