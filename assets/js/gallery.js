(() => {
  const image = document.querySelector('.media-stage img');
  const caption = document.querySelector('.media-caption');
  const thumbs = [...document.querySelectorAll('.media-thumb')];
  const playback = document.querySelector('.media-playback');
  if (!image || !thumbs.length) return;
  let selected = thumbs.find(link => link.getAttribute('aria-current') === 'true') || thumbs[0];
  let playing = false;
  let replay = 0;
  function showAnimation() {
    // A fresh URL starts this WebP again even when it was selected before.
    image.src = selected.dataset.src + '?play=' + (++replay);
    playing = true;
    playback.textContent = 'Stop animation';
  }
  function select(link) {
    selected = link;
    image.src = link.dataset.src;
    image.alt = link.dataset.alt;
    image.width = Number(link.dataset.width) || image.width;
    image.height = Number(link.dataset.height) || image.height;
    if (caption) caption.textContent = link.dataset.caption;
    thumbs.forEach(thumb => thumb.setAttribute('aria-current', String(thumb === link)));
    if (playback) {
      playback.hidden = !link.dataset.still;
      playing = false;
      if (link.dataset.still) showAnimation();
    }
  }
  if (playback) playback.addEventListener('click', () => {
    if (playing) {
      image.src = selected.dataset.still;
      playing = false;
      playback.textContent = 'Replay animation';
    } else showAnimation();
  });
  thumbs.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(link);
    });
    link.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const next = thumbs[(index + (event.key === 'ArrowRight' ? 1 : -1) + thumbs.length) % thumbs.length];
      select(next);
      next.focus();
    });
  });
})();
