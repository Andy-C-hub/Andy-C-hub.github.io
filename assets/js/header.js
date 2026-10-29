(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('.site-nav');
  if (!toggle || !nav) return;
  const mobile = matchMedia('(max-width: 900px)');
  let navHadFocus = false;
  document.addEventListener('focusin', event => { navHadFocus = nav.contains(event.target); });
  const setOpen = (open, restoreFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', open);
    if (restoreFocus && mobile.matches) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !mobile.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const destination = new URL(link.href);
    if (destination.pathname === location.pathname && destination.hash) {
      const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        setOpen(false);
        target.focus({preventScroll:true});
        return;
      }
    }
    setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (mobile.matches && !header.contains(event.target)) setOpen(false, nav.contains(document.activeElement));
  });
  mobile.addEventListener('change', () => {
    const moveFocus = mobile.matches && (navHadFocus || nav.contains(document.activeElement));
    setOpen(false, moveFocus);
  });
  header.classList.add('is-menu-ready');
})();
