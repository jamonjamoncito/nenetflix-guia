(function(){
  const burger = document.querySelector('.burger');
  const mobile = document.getElementById('mobileNav');

  function setMobile(open){
    burger.setAttribute('aria-expanded', String(open));
    mobile.hidden = !open;
  }
  burger?.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    setMobile(open);
  });
  mobile?.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if(a) setMobile(false);
  });

  // Tabs
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach(t => t.addEventListener('click', () => {
    const key = t.dataset.tab;
    tabs.forEach(x => x.classList.toggle('is-active', x === t));
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === key));
  }));

  // Progress bar
  const bar = document.getElementById('progressBar');
  function updateProgress(){
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const scrollHeight = (doc.scrollHeight - doc.clientHeight);
    const pct = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
    if(bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const shots = document.querySelectorAll('img[data-lightbox]');
  shots.forEach(img => img.addEventListener('click', () => {
    if(!lightbox || !lightboxImg) return;
    lightboxImg.src = img.getAttribute('src');
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }));

  function close(){
    if(!lightbox) return;
    lightbox.hidden = true;
    if(lightboxImg) lightboxImg.src = '';
    document.body.style.overflow = '';
  }
  lightbox?.addEventListener('click', (e) => {
    if(e.target && (e.target.hasAttribute('data-close'))) close();
  });
  window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && lightbox && !lightbox.hidden) close();
  });
})();