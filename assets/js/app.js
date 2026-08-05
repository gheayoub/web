(function () {
  const WHATSAPP_NUMBER = '6283870883885';

  const nav = document.querySelector('.nav-links');
  if (nav) {
    const links = [
      ['index.html', 'Home'],
      ['pricing.html', 'Pricing'],
      ['download.html', 'Download'],
      ['vps.html', 'Server VPS'],
      ['dashboard.html', 'Dashboard'],
      ['profile.html', 'Profile']
    ];

    nav.innerHTML = links
      .map(([href, label]) => `<a href="${href}">${label}</a>`)
      .join('');

    const currentPage = location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach((link) => {
      if (link.getAttribute('href') === currentPage) link.classList.add('active');
      link.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-wa-message]').forEach((link) => {
    const message = link.getAttribute('data-wa-message') || 'Halo Admin VMmo';
    link.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  document.querySelectorAll('[data-logout]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        if (window.VMMO_API) await VMMO_API.logout();
      } catch (error) {
        // Token tetap dibersihkan walaupun request logout gagal.
      }
      if (window.VMMO_API) VMMO_API.clearToken();
      location.href = 'login.html';
    });
  });

  const menu = document.querySelector('.mobile-toggle');
  if (menu && nav) {
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const isAuthenticated = Boolean(window.VMMO_API && VMMO_API.getToken());
  document.querySelectorAll('[data-auth-only]').forEach((element) => {
    element.style.display = isAuthenticated ? 'inline-flex' : 'none';
  });
  document.querySelectorAll('[data-guest-only]').forEach((element) => {
    element.style.display = isAuthenticated ? 'none' : 'inline-flex';
  });
})();
