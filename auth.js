/**
 * Autenticación simple de administrador (sesión en sessionStorage).
 * Credenciales de demo: Admin / Pago2026
 */
(function (global) {
  "use strict";

  const SESSION_KEY = "pagofacil_admin_session";
  const CREDENTIALS = {
    usuario: "Admin",
    contrasena: "Pago2026",
  };

  function login(usuario, contrasena) {
    const u = (usuario || "").trim();
    const p = contrasena || "";
    if (u === CREDENTIALS.usuario && p === CREDENTIALS.contrasena) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user: u, at: Date.now() })
      );
      return { ok: true };
    }
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isAuthenticated() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Boolean(data && data.user);
    } catch {
      return false;
    }
  }

  function getUser() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw).user || null;
    } catch {
      return null;
    }
  }

  /** Redirige a login si no hay sesión (usar en páginas admin). */
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.replace("login.html");
      return false;
    }
    return true;
  }

  global.PagoFacilAuth = {
    login,
    logout,
    isAuthenticated,
    getUser,
    requireAuth,
  };
})(window);
