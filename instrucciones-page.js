(function () {
  "use strict";

  if (!PagoFacilAdminUI.initShell()) return;

  const listEl = document.getElementById("instruccionesList");
  const modal = document.getElementById("modalInstruccion");
  const form = document.getElementById("formInstruccion");
  const titleEl = document.getElementById("modalInstruccionTitle");
  const selectTramite = document.getElementById("instruccionTramite");
  const btnNueva = document.getElementById("btnNuevaInstruccion");

  PagoFacilAdminUI.bindModal(modal);

  function fillTramiteSelect(selectedId) {
    const tramites = PagoFacilStore.getTramites();
    selectTramite.innerHTML =
      '<option value="">— Sin vincular —</option>' +
      tramites
        .map(function (t) {
          const sel = t.id === selectedId ? " selected" : "";
          return (
            '<option value="' +
            PagoFacilAdminUI.escapeHtml(t.id) +
            '"' +
            sel +
            ">" +
            PagoFacilAdminUI.escapeHtml(t.nombre) +
            "</option>"
          );
        })
        .join("");
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Intl.DateTimeFormat("es-CR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  }

  function render() {
    const list = PagoFacilStore.getInstrucciones();
    const tramites = PagoFacilStore.getTramites();
    const map = {};
    tramites.forEach(function (t) {
      map[t.id] = t;
    });

    if (!list.length) {
      listEl.innerHTML =
        '<div class="empty-state">' +
        "<strong>No hay instrucciones</strong>" +
        "Crea una guía paso a paso con el botón “Nueva instrucción”." +
        "</div>";
      return;
    }

    // Más recientes primero
    const sorted = list.slice().sort(function (a, b) {
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });

    listEl.innerHTML = sorted
      .map(function (ins) {
        const tramite = ins.tramiteId ? map[ins.tramiteId] : null;
        const tag = tramite
          ? '<span class="tag">' +
            PagoFacilAdminUI.escapeHtml(tramite.icono || "🔗") +
            " " +
            PagoFacilAdminUI.escapeHtml(tramite.nombre) +
            "</span>"
          : '<span class="tag">General</span>';

        const linkHtml = tramite
          ? '<a class="tramite-card__link" href="' +
            PagoFacilAdminUI.escapeHtml(tramite.enlace) +
            '" target="_blank" rel="noopener noreferrer">Ir a web oficial ↗</a>'
          : "";

        return (
          '<article class="instruccion-card" data-id="' +
          PagoFacilAdminUI.escapeHtml(ins.id) +
          '">' +
          '<div class="instruccion-card__head">' +
          "<div>" +
          "<h3>" +
          PagoFacilAdminUI.escapeHtml(ins.titulo) +
          "</h3>" +
          '<div class="instruccion-meta">' +
          tag +
          "<span>Actualizado: " +
          PagoFacilAdminUI.escapeHtml(formatDate(ins.updatedAt)) +
          "</span>" +
          "</div>" +
          "</div>" +
          linkHtml +
          "</div>" +
          '<pre class="instruccion-body">' +
          PagoFacilAdminUI.escapeHtml(ins.contenido) +
          "</pre>" +
          '<div class="instruccion-card__actions">' +
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
    form.instruccionId.value = "";
    titleEl.textContent = "Nueva instrucción";
    fillTramiteSelect("");
    PagoFacilAdminUI.openModal(modal);
  }

  function openEdit(id) {
    const ins = PagoFacilStore.getInstrucciones().find(function (x) {
      return x.id === id;
    });
    if (!ins) return;
    form.instruccionId.value = ins.id;
    form.instruccionTitulo.value = ins.titulo;
    form.instruccionContenido.value = ins.contenido;
    fillTramiteSelect(ins.tramiteId || "");
    titleEl.textContent = "Editar instrucción";
    PagoFacilAdminUI.openModal(modal);
  }

  btnNueva.addEventListener("click", openCreate);

  listEl.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const card = btn.closest(".instruccion-card");
    if (!card) return;
    const id = card.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "edit") {
      openEdit(id);
      return;
    }

    if (action === "delete") {
      const ins = PagoFacilStore.getInstrucciones().find(function (x) {
        return x.id === id;
      });
      const name = ins ? ins.titulo : "esta instrucción";
      if (!confirm('¿Eliminar la instrucción "' + name + '"?')) return;
      PagoFacilStore.deleteInstruccion(id);
      render();
      PagoFacilAdminUI.showToast("Instrucción eliminada", "ok");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const titulo = form.instruccionTitulo.value.trim();
    const contenido = form.instruccionContenido.value.trim();
    const tramiteId = form.instruccionTramite.value;
    const id = form.instruccionId.value;

    if (!titulo) {
      form.instruccionTitulo.focus();
      PagoFacilAdminUI.showToast("El título es obligatorio", "err");
      return;
    }
    if (!contenido) {
      form.instruccionContenido.focus();
      PagoFacilAdminUI.showToast("Las instrucciones son obligatorias", "err");
      return;
    }

    const payload = { titulo: titulo, contenido: contenido, tramiteId: tramiteId };

    if (id) {
      PagoFacilStore.updateInstruccion(id, payload);
      PagoFacilAdminUI.showToast("Instrucción actualizada", "ok");
    } else {
      PagoFacilStore.addInstruccion(payload);
      PagoFacilAdminUI.showToast("Instrucción añadida", "ok");
    }

    PagoFacilAdminUI.closeModal(modal);
    render();
  });

  render();
})();
