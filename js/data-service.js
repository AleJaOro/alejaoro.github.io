/**
 * Capa de datos Firestore (tiempo real).
 * No usa Firebase Storage (requiere plan Blaze/facturación).
 * Los archivos de citas se guardan como enlace (Drive, Dropbox, etc.).
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { normalizeUrl } from "./utils.js";

/* ---------- Trámites (catálogo global) ---------- */

export function watchTramites(cb) {
  const q = query(collection(db, "tramites"), orderBy("nombre"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(list);
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

export async function addTramite(data) {
  return addDoc(collection(db, "tramites"), {
    nombre: data.nombre.trim(),
    descripcion: (data.descripcion || "").trim(),
    enlace: normalizeUrl(data.enlace),
    icono: (data.icono || "🔗").trim() || "🔗",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTramite(id, data) {
  await updateDoc(doc(db, "tramites", id), {
    nombre: data.nombre.trim(),
    descripcion: (data.descripcion || "").trim(),
    enlace: normalizeUrl(data.enlace),
    icono: (data.icono || "🔗").trim() || "🔗",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTramite(id) {
  await deleteDoc(doc(db, "tramites", id));
}

/* ---------- Instrucciones ---------- */

export function watchInstrucciones(cb) {
  // Sin orderBy en servidor para evitar índice compuesto en proyectos nuevos;
  // ordenamos en el cliente.
  return onSnapshot(
    collection(db, "instrucciones"),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.updatedAt?.toMillis?.() || 0;
          const tb = b.updatedAt?.toMillis?.() || 0;
          return tb - ta;
        });
      cb(list);
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

export async function addInstruccion(data) {
  return addDoc(collection(db, "instrucciones"), {
    titulo: data.titulo.trim(),
    contenido: data.contenido.trim(),
    tramiteId: data.tramiteId || "",
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
}

export async function updateInstruccion(id, data) {
  await updateDoc(doc(db, "instrucciones", id), {
    titulo: data.titulo.trim(),
    contenido: data.contenido.trim(),
    tramiteId: data.tramiteId || "",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInstruccion(id) {
  await deleteDoc(doc(db, "instrucciones", id));
}

/* ---------- Clientes (users role=client) ---------- */

export function watchClients(cb) {
  const q = query(collection(db, "users"), where("role", "==", "client"));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
      cb(list);
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

export async function updateClient(id, data) {
  await updateDoc(doc(db, "users", id), {
    nombre: (data.nombre || "").trim(),
    telefono: (data.telefono || "").trim(),
    notas: (data.notas || "").trim(),
    activo: data.activo !== false,
    updatedAt: serverTimestamp(),
  });
}

/** Soft delete: desactiva el cliente (no borra Auth) */
export async function deactivateClient(id) {
  await updateDoc(doc(db, "users", id), {
    activo: false,
    updatedAt: serverTimestamp(),
  });
}

export async function getClient(id) {
  const snap = await getDoc(doc(db, "users", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function watchClient(id, cb) {
  return onSnapshot(doc(db, "users", id), (snap) => {
    if (!snap.exists()) cb(null);
    else cb({ id: snap.id, ...snap.data() });
  });
}

/* ---------- Servicios del cliente (facturas / recibos) ---------- */

export function watchClientServices(clientId, cb) {
  const q = query(
    collection(db, "clientServices"),
    where("clientId", "==", clientId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
      cb(list);
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

export function watchAllClientServices(cb) {
  return onSnapshot(
    collection(db, "clientServices"),
    (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

export async function addClientService(data) {
  const monto = Number(data.monto) || 0;
  const comision = Number(data.comision) || 0;
  return addDoc(collection(db, "clientServices"), {
    clientId: data.clientId,
    tramiteId: data.tramiteId || "",
    nombre: data.nombre.trim(),
    icono: data.icono || "📄",
    monto,
    comision,
    total: monto + comision,
    diaCorte: Number(data.diaCorte) || null,
    estado: data.estado || "pendiente",
    notas: (data.notas || "").trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateClientService(id, data) {
  const monto = Number(data.monto) || 0;
  const comision = Number(data.comision) || 0;
  await updateDoc(doc(db, "clientServices", id), {
    tramiteId: data.tramiteId || "",
    nombre: data.nombre.trim(),
    icono: data.icono || "📄",
    monto,
    comision,
    total: monto + comision,
    diaCorte: Number(data.diaCorte) || null,
    estado: data.estado || "pendiente",
    notas: (data.notas || "").trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClientService(id) {
  await deleteDoc(doc(db, "clientServices", id));
}

/**
 * Marca servicio como pagado y registra historial.
 */
export async function registerPayment({ service, adminUid, notas }) {
  const pago = {
    clientId: service.clientId,
    clientServiceId: service.id,
    servicioNombre: service.nombre,
    monto: service.monto,
    comision: service.comision,
    total: service.total,
    notas: (notas || "").trim(),
    registeredBy: adminUid || "",
    pagadoAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  const refPago = await addDoc(collection(db, "payments"), pago);
  await updateDoc(doc(db, "clientServices", service.id), {
    estado: "pagado",
    lastPaidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return refPago.id;
}

/* ---------- Historial de pagos ---------- */

export function watchPayments(clientId, cb) {
  const q = query(collection(db, "payments"), where("clientId", "==", clientId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const ta = a.pagadoAt?.toMillis?.() || 0;
          const tb = b.pagadoAt?.toMillis?.() || 0;
          return tb - ta;
        });
      cb(list);
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

/* ---------- Citas ---------- */

export function watchClientCitas(clientId, cb) {
  const q = query(collection(db, "citas"), where("clientId", "==", clientId));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
      cb(list);
    },
    (err) => {
      console.error(err);
      cb([], err);
    }
  );
}

/**
 * Citas: archivo opcional = enlace externo (Drive/Dropbox/WhatsApp file link).
 * No requiere Firebase Storage ni plan de facturación.
 */
export async function addCita(data) {
  const archivoUrl = data.archivoUrl ? normalizeUrl(data.archivoUrl) : "";
  return addDoc(collection(db, "citas"), {
    clientId: data.clientId,
    tramiteId: data.tramiteId || "",
    titulo: data.titulo.trim(),
    icono: data.icono || "📅",
    fecha: data.fecha || "",
    hora: data.hora || "",
    notas: (data.notas || "").trim(),
    estado: data.estado || "confirmada",
    archivoUrl,
    archivoNombre: (data.archivoNombre || (archivoUrl ? "Ver documento" : "")).trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCita(id, data) {
  const archivoUrl = data.archivoUrl ? normalizeUrl(data.archivoUrl) : "";
  await updateDoc(doc(db, "citas", id), {
    tramiteId: data.tramiteId || "",
    titulo: data.titulo.trim(),
    icono: data.icono || "📅",
    fecha: data.fecha || "",
    hora: data.hora || "",
    notas: (data.notas || "").trim(),
    estado: data.estado || "confirmada",
    archivoUrl,
    archivoNombre: (data.archivoNombre || (archivoUrl ? "Ver documento" : "")).trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCita(id) {
  await deleteDoc(doc(db, "citas", id));
}

/* ---------- Seed trámites iniciales (si vacío) ---------- */

export async function seedTramitesIfEmpty() {
  const snap = await getDocs(collection(db, "tramites"));
  if (!snap.empty) return false;
  const defaults = [
    {
      nombre: "Electricidad (ICE / CNFL)",
      descripcion: "Consulta y pago de facturas de electricidad.",
      enlace: "https://www.grupoice.com/",
      icono: "⚡",
    },
    {
      nombre: "Agua (AyA)",
      descripcion: "Pago de recibos de agua potable.",
      enlace: "https://www.aya.go.cr/",
      icono: "💧",
    },
    {
      nombre: "CCSS — Citas de salud",
      descripcion: "Agenda y consulta citas médicas en línea.",
      enlace: "https://www.ccss.sa.cr/",
      icono: "🏥",
    },
    {
      nombre: "Tributación / Hacienda",
      descripcion: "Trámites fiscales y declaración en línea.",
      enlace: "https://www.hacienda.go.cr/",
      icono: "📋",
    },
  ];
  for (const t of defaults) {
    await addTramite(t);
  }
  return true;
}

export { Timestamp, serverTimestamp };
