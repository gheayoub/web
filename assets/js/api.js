(function () {
  const cfg = window.VMMO_CONFIG || {};
  const base = String(cfg.API_BASE_URL || "").replace(/\/$/, "");

  const tokenKey = "vmmo_access_token";
  const persistentKey = "vmmo_access_token_persistent";

  function getToken() {
    return (
      sessionStorage.getItem(tokenKey) ||
      localStorage.getItem(persistentKey) ||
      ""
    );
  }

  function saveToken(token, remember) {
    clearToken();

    if (remember) {
      localStorage.setItem(persistentKey, token);
    } else {
      sessionStorage.setItem(tokenKey, token);
    }
  }

  function clearToken() {
    sessionStorage.removeItem(tokenKey);
    localStorage.removeItem(persistentKey);
  }

  function humanError(code) {
    return (
      {
        invalid_credentials: "Username/email atau password salah.",
        account_disabled: "Akun dinonaktifkan.",
        invalid_session: "Sesi tidak valid. Silakan login kembali.",
        session_expired: "Sesi telah berakhir. Silakan login kembali.",
        too_many_requests:
          "Terlalu banyak percobaan. Coba beberapa saat lagi.",
        email_delivery_failed: "Email reset belum dapat dikirim.",
        reset_token_expired: "Tautan reset sudah kedaluwarsa.",
        invalid_reset_token: "Tautan reset tidak valid.",
        bearer_token_required: "Anda harus login terlebih dahulu.",
        registration_failed: "Pendaftaran gagal.",
        invalid_server_response: "Respons server tidak valid.",
      }[code] ||
      code ||
      "Terjadi kesalahan."
    );
  }

  async function request(path, options = {}) {
    if (!base) {
      throw new Error(
        "API_BASE_URL belum diatur. Periksa file assets/js/config.js."
      );
    }

    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "1",
      ...(options.headers || {}),
    };

    const token = options.auth === false ? "" : getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
      response = await fetch(base + path, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error("VMmo API connection error:", error);

      throw new Error(
        "Tidak dapat terhubung ke server API. Pastikan server Python dan ngrok masih berjalan."
      );
    }

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {
        ok: false,
        error: "invalid_server_response",
      };
    }

    if (!response.ok) {
      const message =
        data.message ||
        humanError(data.error) ||
        `Server error (${response.status})`;

      const error = new Error(message);
      error.status = response.status;
      error.data = data;

      if (response.status === 401) {
        clearToken();
      }

      throw error;
    }

    return data;
  }

  window.VMMO_API = {
    base,

    getToken,
    saveToken,
    clearToken,
    humanError,

    register(body) {
      return request("/api/v2/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
        auth: false,
      });
    },

    login(body) {
      return request("/api/v2/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
        auth: false,
      });
    },

    me() {
      return request("/api/v2/account/me", {
        method: "GET",
      });
    },

    validate() {
      return request("/api/v2/auth/validate", {
        method: "POST",
        body: JSON.stringify({
          token: getToken(),
        }),
      });
    },

    logout() {
      return request("/api/v2/auth/logout", {
        method: "POST",
        body: JSON.stringify({
          token: getToken(),
        }),
      });
    },

    forgot(email) {
      return request("/api/v2/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
        auth: false,
      });
    },

    reset(token, new_password) {
      return request("/api/v2/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          new_password,
        }),
        auth: false,
      });
    },
  };
})();
