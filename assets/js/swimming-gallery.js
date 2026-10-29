(() => {
  const galleries = [...document.querySelectorAll('[data-swimming-gallery]')];
  const stops = [];
  let serial = 0;
  galleries.forEach(gallery => {
    const image = gallery.querySelector('.swim-stage img');
    const video = gallery.querySelector('video');
    const caption = gallery.querySelector('.swim-caption');
    const status = gallery.querySelector('.swim-status');
    const button = gallery.querySelector('.swim-playback');
    const thumbs = [...gallery.querySelectorAll('.swim-thumb')];
    let selected = thumbs.find(link => link.getAttribute('aria-current') === 'true');
    let playing = false;
    let hasPlayed = false;
    const stop = () => {
      serial++;
      video.pause();
      video.hidden = true;
      video.removeAttribute('src');
      video.load();
      image.hidden = false;
      image.src = selected.dataset.poster;
      playing = false;
      button.textContent = hasPlayed ? 'Replay animation' : 'Play animation';
      button.setAttribute('aria-pressed', 'false');
    };
    stops.push(stop);
    const select = (link, autoplay = true) => {
      stop();
      selected = link;
      hasPlayed = false;
      // An explicitly selected example must load even if its stage is off screen.
      if (autoplay) image.loading = 'eager';
      image.src = link.dataset.poster;
      image.alt = link.dataset.alt;
      image.width = Number(link.dataset.width);
      image.height = Number(link.dataset.height);
      caption.textContent = link.dataset.caption;
      status.textContent = '';
      thumbs.forEach(thumb => thumb.setAttribute('aria-current', String(thumb === link)));
      button.hidden = !link.dataset.animated;
      button.textContent = 'Play animation';
      if (autoplay && link.dataset.animated) play();
    };
    thumbs.forEach((link, index) => {
      link.addEventListener('click', event => {
        if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        select(link);
      });
      link.addEventListener('keydown', event => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? thumbs[0] : event.key === 'End' ? thumbs.at(-1) : thumbs[(index + (event.key === 'ArrowRight' ? 1 : -1) + thumbs.length) % thumbs.length];
        select(next);
        next.focus();
      });
    });
    const failed = () => {
      if (!playing) return;
      stop();
      status.textContent = 'This example could not be loaded. You can still view its preview or choose another example.';
    };
    image.addEventListener('error', failed);
    video.addEventListener('error', failed);
    video.addEventListener('ended', () => { stop(); status.textContent = 'Recording finished.'; });
    const play = async () => {
      stops.forEach(otherStop => otherStop());
      const token = ++serial;
      playing = true;
      hasPlayed = true;
      status.textContent = '';
      button.textContent = 'Stop animation';
      button.setAttribute('aria-pressed', 'true');
      if (selected.dataset.kind === 'video') {
        video.width = Number(selected.dataset.width);
        video.height = Number(selected.dataset.height);
        video.setAttribute('aria-label', selected.dataset.alt);
        video.poster = selected.dataset.poster;
        video.src = selected.dataset.src;
        image.hidden = true;
        video.hidden = false;
        try { await video.play(); } catch { if (token === serial) failed(); }
      } else image.src = selected.dataset.src + '?play=' + token;
    };
    button.addEventListener('click', () => {
      if (playing) { stop(); status.textContent = 'Animation stopped.'; }
      else play();
    });
    gallery.classList.add('is-enhanced');
    gallery.querySelector('.swim-controls').hidden = false;
    select(selected, false);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stops.forEach(stop => stop()); });
})();
