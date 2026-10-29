(() => {
  const heading = document.querySelector('#hero h1');
  const brand = document.querySelector('.brand-link');
  const cards = [...document.querySelectorAll('.hero-card-shell')];
  if (!heading || !brand || !cards.length || typeof matchMedia !== 'function' ||
      typeof MutationObserver !== 'function' || typeof Element.prototype.animate !== 'function') return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;
  const lines = [...heading.querySelectorAll('.hero-line')];
  const running = new Set();
  let scheduled = false;
  let completed = false;
  let delay;
  let cleanup;
  function stop() {
    completed = true;
    clearTimeout(delay);
    clearTimeout(cleanup);
    observer.disconnect();
    running.forEach(animation => animation.cancel());
    running.clear();
    brand.classList.remove('is-gleaming');
  }
  function polish() {
    if (completed || preference.matches) return;
    completed = true;
    // A colour/shine pass only: the identity never moves or fades in.
    brand.classList.add('is-gleaming');
    cleanup = setTimeout(() => brand.classList.remove('is-gleaming'), 1300);
    cards.forEach((card, index) => {
      if (card.contains(document.activeElement) || card.matches(':hover')) return;
      try {
        const tilt = index % 2 ? .6 : -.6;
        const animation = card.animate([
          {transform:`translateY(5px) rotate(${tilt}deg)`},
          {transform:`translateY(-1px) rotate(${-tilt / 4}deg)`,offset:.72},
          {transform:'none'}
        ],{duration:680,delay:index * 90,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
        running.add(animation);
        const finish = () => { running.delete(animation); animation.cancel(); };
        animation.onfinish = finish;
        animation.oncancel = () => running.delete(animation);
      } catch {
        // Static cards are the fallback; no hidden state needs clearing.
      }
    });
  }
  function checkHeading() {
    if (scheduled || completed || preference.matches) return;
    const finished = lines.every(line => line.classList.contains('is-revealed'));
    const staticHeading = !document.documentElement.classList.contains('motion-enabled');
    if (!finished && !staticHeading) return;
    scheduled = true;
    observer.disconnect();
    delay = setTimeout(polish, 250);
  }
  const observer = new MutationObserver(checkHeading);
  observer.observe(heading, {attributes:true,attributeFilter:['class'],subtree:true});
  observer.observe(document.documentElement, {attributes:true,attributeFilter:['class']});
  preference.addEventListener('change', event => { if (event.matches) stop(); });
  document.addEventListener('focusin', event => {
    running.forEach(animation => {
      if (animation.effect.target.contains(event.target)) animation.cancel();
    });
  });
  checkHeading();
})();
