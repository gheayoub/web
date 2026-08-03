# VMmo Website

Website frontend statis untuk `vmmo-license-server`.

## Halaman

- Home
- Login
- Register
- Pricing
- Dashboard
- Forgot Password
- Reset Password
- Profile

## 1. Atur alamat API

Buka `assets/js/config.js` lalu ubah:

```js
API_BASE_URL: "http://127.0.0.1:8765"
```

menjadi URL HTTPS publik backend Windows, misalnya:

```js
API_BASE_URL: "https://api.domainanda.com"
```

Jangan memakai `127.0.0.1` ketika website sudah berada di Vercel.

## 2. Tes lokal

Jalankan server statis dari folder website:

```bash
python -m http.server 5500
```

Lalu buka `http://127.0.0.1:5500`.

## 3. CORS backend

Setelah Vercel memberikan domain, izinkan origin website pada Windows server, misalnya:

```bat
setx WEBSITE_ORIGIN "https://nama-proyek.vercel.app" /M
```

Restart backend setelah mengubah environment variable.

## 4. Upload GitHub dan deploy Vercel

Upload seluruh isi folder ini ke repository GitHub. Di Vercel pilih **Add New > Project**, impor repository, pilih Framework Preset **Other**, lalu Deploy.

## Catatan

- Pricing adalah tampilan; backend belum memiliki endpoint pembayaran otomatis.
- Profile bersifat read-only; backend belum memiliki endpoint edit profile.
- Forgot Password membutuhkan konfigurasi SMTP pada backend.
