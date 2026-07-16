/**
 * Persistencia local de trámites e instrucciones (localStorage).
 */
(function (global) {
  "use strict";

  const KEYS = {
    tramites: "pagofacil_tramites",
    instrucciones: "pagofacil_instrucciones",
  };

  const DEFAULT_TRAMITES = [
    {
      id: "t1",
      nombre: "Electricidad (ICE / CNFL)",
      descripcion: "Consulta y pago de facturas de electricidad.",
      enlace: "https://www.grupoice.com/",
      icono: "⚡",
    },
    {
      id: "t2",
      nombre: "Agua (AyA)",
      descripcion: "Pago de recibos de agua potable.",
      enlace: "https://www.aya.go.cr/",
      icono: "💧",
    },
    {
      id: "t3",
      nombre: "CCSS — Citas de salud",
      descripcion: "Agenda y consulta citas médicas en línea.",
      enlace: "https://www.ccss.sa.cr/",
      icono: "🏥",
    },
    {
      id: "t4",
      nombre: "Tributación / Hacienda",
      descripcion: "Trámites fiscales y declaración en línea.",
      enlace: "https://www.hacienda.go.cr/",
      icono: "📋",
    },
  ];

  const DEFAULT_INSTRUCCIONES = [
    {
      id: "i1",
      titulo: "Cómo pagar electricidad en línea",
      tramiteId: "t1",
      contenido:
        "1. Entra al sitio oficial del proveedor (ICE o CNFL).\n2. Ubica la opción de pagos en línea o consulta de facturas.\n3. Ingresa el número de contrato o medidor.\n4. Verifica el monto y elige el método de pago.\n5. Guarda o descarga el comprobante digital.",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "i2",
      titulo: "Cómo agendar una cita en la CCSS",
      tramiteId: "t3",
      contenido:
        "1. Ingresa al portal oficial de la CCSS.\n2. Inicia sesión o regístrate con tu cédula.\n3. Selecciona “Citas” o el servicio de salud que necesitas.\n4. Elige establecimiento, especialidad, fecha y hora.\n5. Confirma y anota el número de cita o código de confirmación.",
      updatedAt: new Date().toISOString(),
    },
  ];

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return structuredClone(fallback);
      }
      return JSON.parse(raw);
    } catch {
      return structuredClone(fallback);
    }
  }

  function write(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getTramites() {
    return read(KEYS.tramites, DEFAULT_TRAMITES);
  }

  function saveTramites(list) {
    write(KEYS.tramites, list);
  }

  function addTramite(data) {
    const list = getTramites();
    const item = {
      id: uid("t"),
      nombre: data.nombre.trim(),
      descripcion: (data.descripcion || "").trim(),
      enlace: data.enlace.trim(),
      icono: (data.icono || "🔗").trim() || "🔗",
    };
    list.push(item);
    saveTramites(list);
    return item;
  }

  function updateTramite(id, data) {
    const list = getTramites();
    const i = list.findIndex((t) => t.id === id);
    if (i === -1) return null;
    list[i] = {
      ...list[i],
      nombre: data.nombre.trim(),
      descripcion: (data.descripcion || "").trim(),
      enlace: data.enlace.trim(),
      icono: (data.icono || list[i].icono || "🔗").trim() || "🔗",
    };
    saveTramites(list);
    return list[i];
  }

  function deleteTramite(id) {
    const list = getTramites().filter((t) => t.id !== id);
    saveTramites(list);
    // Desvincular instrucciones
    const instrucciones = getInstrucciones().map((ins) =>
      ins.tramiteId === id ? { ...ins, tramiteId: "" } : ins
    );
    saveInstrucciones(instrucciones);
    return true;
  }

  function getInstrucciones() {
    return read(KEYS.instrucciones, DEFAULT_INSTRUCCIONES);
  }

  function saveInstrucciones(list) {
    write(KEYS.instrucciones, list);
  }

  function addInstruccion(data) {
    const list = getInstrucciones();
    const item = {
      id: uid("i"),
      titulo: data.titulo.trim(),
      tramiteId: data.tramiteId || "",
      contenido: data.contenido.trim(),
      updatedAt: new Date().toISOString(),
    };
    list.push(item);
    saveInstrucciones(list);
    return item;
  }

  function updateInstruccion(id, data) {
    const list = getInstrucciones();
    const i = list.findIndex((x) => x.id === id);
    if (i === -1) return null;
    list[i] = {
      ...list[i],
      titulo: data.titulo.trim(),
      tramiteId: data.tramiteId || "",
      contenido: data.contenido.trim(),
      updatedAt: new Date().toISOString(),
    };
    saveInstrucciones(list);
    return list[i];
  }

  function deleteInstruccion(id) {
    saveInstrucciones(getInstrucciones().filter((x) => x.id !== id));
    return true;
  }

  function getTramiteById(id) {
    return getTramites().find((t) => t.id === id) || null;
  }

  global.PagoFacilStore = {
    getTramites,
    addTramite,
    updateTramite,
    deleteTramite,
    getInstrucciones,
    addInstruccion,
    updateInstruccion,
    deleteInstruccion,
    getTramiteById,
  };
})(window);
