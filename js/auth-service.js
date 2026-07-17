/**
 * Autenticación y roles (admin | client)
 */
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, secondaryAuth } from "./firebase-init.js";

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }
    try {
      const profile = await getUserProfile(user.uid);
      if (!profile || profile.activo === false) {
        await signOut(auth);
        callback(null, "Cuenta inactiva o sin perfil.");
        return;
      }
      callback({
        uid: user.uid,
        email: user.email,
        ...profile,
      });
    } catch (err) {
      console.error(err);
      callback(null, err.message || "Error al cargar perfil");
    }
  });
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    await signOut(auth);
    throw new Error("Tu cuenta no tiene perfil. Contacta al administrador.");
  }
  if (profile.activo === false) {
    await signOut(auth);
    throw new Error("Tu cuenta está desactivada.");
  }
  return { uid: cred.user.uid, email: cred.user.email, ...profile };
}

export async function logout() {
  await signOut(auth);
}

/**
 * Guarda el perfil del cliente en Firestore usando la sesión del ADMIN
 * (la app principal). Auth se crea con secondaryApp para no cerrar al admin.
 */
async function saveClientProfile(uid, { email, nombre, telefono, notas }) {
  const profile = {
    email: String(email || "").trim().toLowerCase(),
    nombre: (nombre || "").trim(),
    telefono: (telefono || "").trim(),
    notas: (notas || "").trim(),
    role: "client",
    activo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  // merge: true por si reparamos un perfil a medias
  await setDoc(doc(db, "users", uid), profile, { merge: true });
  return { id: uid, ...profile };
}

/**
 * Crea un cliente (Auth + perfil) sin cerrar la sesión del admin.
 * Si Auth ya existía pero falló el perfil, lo repara con la misma contraseña.
 */
export async function createClientAccount({ email, password, nombre, telefono, notas }) {
  const mail = email.trim();
  const pass = password;
  let uid = null;
  let repaired = false;

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, mail, pass);
    uid = cred.user.uid;
  } catch (err) {
    // Cuenta huérfana: Auth existe pero no hay (o falló) el doc en Firestore
    if (err.code === "auth/email-already-in-use") {
      try {
        const existing = await signInWithEmailAndPassword(secondaryAuth, mail, pass);
        uid = existing.user.uid;
        repaired = true;
      } catch (signErr) {
        await signOut(secondaryAuth).catch(() => {});
        if (signErr.code === "auth/wrong-password" || signErr.code === "auth/invalid-credential") {
          throw new Error(
            "Ese correo ya está en Authentication, pero la contraseña no coincide. " +
              "En Firebase Console → Authentication borra ese usuario y créalo de nuevo, " +
              "o usa la contraseña original del cliente."
          );
        }
        throw signErr;
      }
    } else {
      await signOut(secondaryAuth).catch(() => {});
      throw err;
    }
  }

  // Importante: cerrar secondary ANTES de escribir en Firestore con el admin
  await signOut(secondaryAuth).catch(() => {});

  if (!auth.currentUser) {
    throw new Error(
      "Se perdió la sesión de administrador. Vuelve a iniciar sesión e intenta de nuevo."
    );
  }

  try {
    const profile = await saveClientProfile(uid, { email: mail, nombre, telefono, notas });
    return {
      id: uid,
      ...profile,
      repaired,
      message: repaired
        ? "Cliente reparado: la cuenta de Auth ya existía y se creó el perfil que faltaba."
        : "Cliente creado correctamente.",
    };
  } catch (fsErr) {
    console.error("Firestore profile error:", fsErr);
    const code = fsErr.code || "";
    if (code.includes("permission-denied") || String(fsErr.message).includes("permission")) {
      throw new Error(
        "Auth se creó, pero Firestore rechazó el perfil (permission-denied). " +
          "Actualiza las reglas de Firestore (el admin debe poder crear en /users). " +
          "Luego vuelve a guardar el mismo cliente con la misma contraseña para repararlo."
      );
    }
    throw new Error(
      "La cuenta de acceso se creó, pero falló el perfil en la base de datos: " +
        (fsErr.message || code || "error desconocido")
    );
  }
}

export function requireRole(profile, roles, redirect = "login.html") {
  if (!profile || !roles.includes(profile.role)) {
    window.location.replace(redirect);
    return false;
  }
  return true;
}

export function redirectByRole(profile) {
  if (!profile) {
    window.location.replace("login.html");
    return;
  }
  if (profile.role === "admin") {
    window.location.replace("admin.html");
  } else if (profile.role === "client") {
    window.location.replace("cliente.html");
  } else {
    window.location.replace("login.html");
  }
}
