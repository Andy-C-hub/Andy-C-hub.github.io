(() => {
  const gallery = document.querySelector('.photo-gallery');
  if (!gallery) return;
  const stack = gallery.querySelector('.photo-stack');
  const next = gallery.querySelector('.photo-next');
  const counter = gallery.querySelector('.photo-count');
  const photos = [...stack.querySelectorAll('.about-photo')];
  if (photos.length < 2) return;
  const order = [...photos];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let busy = false;
  let animation = null;
  function render() {
    order.forEach((photo, slot) => {
      photo.dataset.slot = String(slot);
      photo.hidden = slot >= 3;
      if (slot) photo.setAttribute('aria-hidden', 'true');
      else photo.removeAttribute('aria-hidden');
      // Prepare the next visible cards before a user cycles the stack.
      if (slot < 3) photo.querySelector('img').loading = 'eager';
    });
    counter.textContent = `Photo ${photos.indexOf(order[0]) + 1} of ${photos.length}`;
  }
  async function shuffle() {
    if (busy) return;
    busy = true;
    next.setAttribute('aria-disabled', 'true');
    const front = order[0];
    try {
      if (!motion.matches && typeof front.animate === 'function') {
        const style = getComputedStyle(front);
        // Scale the outward movement to the space available on a small screen.
        const room = Math.max(12, Math.min(58, document.documentElement.clientWidth - front.getBoundingClientRect().right - 12));
        animation = front.animate([
          {transform:style.transform,opacity:1},
          {transform:`translate(${room}px, -12px) rotate(12deg)`,opacity:1,offset:.55},
          {transform:'translate(20px, -16px) rotate(6deg)',opacity:0}
        ],{duration:560,easing:'cubic-bezier(.25,.65,.25,1)',fill:'forwards'});
        await animation.finished;
      }
    } catch {
      // A cancelled or unsupported effect still advances the photograph.
    } finally {
      order.push(order.shift());
      render();
      if (animation) animation.cancel();
      animation = null;
      busy = false;
      next.setAttribute('aria-disabled', 'false');
    }
  }
  next.addEventListener('click', shuffle);
  motion.addEventListener('change', () => { if (motion.matches && animation) animation.finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && animation) animation.finish(); });
  render();
  stack.classList.add('is-ready');
  gallery.querySelector('.photo-controls').hidden = false;
})();
