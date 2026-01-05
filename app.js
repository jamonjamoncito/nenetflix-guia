const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
if(conn && (conn.saveData || (conn.effectiveType && /2g/.test(conn.effectiveType)))){ document.body.classList.add('save-data'); }

/* NENETFLIX guide: single page, PDF-complete, premium */
const pages = window.NENETFLIX_PAGES || [];
const grid = document.querySelector(".pdf-grid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const toTop = document.getElementById("toTop");
const posterWall = document.getElementById("posterWall");
let currentIndex = -1;
const pageSrcs = pages.slice();

function buildPages(){
  if(!grid) return;
  const titles = [
    "Todo en un solo lugar (precio y comparación)",
    "Qué es NENETFLIX (Plex)",
    "Qué contenido hay",
    "Cómo funciona (3 pasos)",
    "Dónde puedes usarlo",
    "Inicio de sesión (web)",
    "Inicio de sesión en TV (con móvil)",
    "Primer inicio y limpieza del menú",
    "Ordenar bibliotecas (pelis/series)",
    ];

  pages.forEach((src, idx) => {
    const card = document.createElement("article");
    card.className = "page reveal";
    card.innerHTML = `
      <div class="page-actions solo">Toca para ampliar</div>
      <img src="${src}" alt="Guía NENETFLIX - página ${idx+1}" loading="lazy"/>
    `;
    const img = card.querySelector("img");
    img.addEventListener("click", () => openLightbox(src, idx));
    card.dataset.idx = String(idx);
    grid.appendChild(card);
  });
}

function openLightbox(src, idx){
  document.body.style.overflow = "hidden";
  if(typeof idx === "number") currentIndex = idx;
  else currentIndex = pageSrcs.indexOf(src);
  lightboxImg.src = src;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
}

function closeLightbox(){
  document.body.style.overflow = "";
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden","true");
  lightboxImg.src = "";
}

lightbox.addEventListener("click", (e)=>{
  if(e.target === lightbox) closeLightbox();
});
lightboxClose.addEventListener("click", closeLightbox);

const lbPrev = document.getElementById("lightboxPrev");
const lbNext = document.getElementById("lightboxNext");

function showAt(i){
  if(i < 0) i = pageSrcs.length - 1;
  if(i >= pageSrcs.length) i = 0;
  currentIndex = i;
  openLightbox(pageSrcs[currentIndex], currentIndex);
}
if(lbPrev) lbPrev.addEventListener("click", (e)=>{ e.stopPropagation(); showAt(currentIndex-1); });
if(lbNext) lbNext.addEventListener("click", (e)=>{ e.stopPropagation(); showAt(currentIndex+1); });


document.addEventListener("keydown", (e)=>{
  if(e.key === "Escape") closeLightbox();
  if(lightbox.classList.contains("open")){
    if(e.key === "ArrowLeft") showAt(currentIndex-1);
    if(e.key === "ArrowRight") showAt(currentIndex+1);
  }
});


const progress = document.getElementById("progress");

function onScroll(){
  const y = window.scrollY || 0;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  if(progress && docH>0){ progress.style.width = (y/docH*100).toFixed(2) + "%"; }
  updateGlow();
  if(y > 600) toTop.classList.add("show");
  else toTop.classList.remove("show");

  // subtle parallax for hero posters
  if(posterWall){
    posterWall.style.transform = `perspective(900px) rotateY(-8deg) rotateX(4deg) translateY(${Math.min(0, -y*0.03)}px)`;
  }
}
window.addEventListener("scroll", onScroll, {passive:true});
toTop.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));

/* Reveal animation */
const io = new IntersectionObserver((entries)=>{
  for(const en of entries){
    if(en.isIntersecting) en.target.classList.add("show");
  }
},{threshold: 0.12});

function watchReveals(){
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* Drawer (mobile) */
const drawer = document.getElementById("drawer");
const hamburger = document.getElementById("hamburger");
const drawerClose = document.getElementById("drawerClose");

function openDrawer(){
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden","false");
}
function closeDrawer(){
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden","true");
}
hamburger.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
drawer.addEventListener("click", (e)=>{
  if(e.target === drawer) closeDrawer();
});

/* init */
buildPages();
watchReveals();
if(posterWall) posterWall.classList.add("float");


// v7: subtle hero glow parallax + button ripple (mobile-friendly)
const heroEl = document.querySelector(".hero");
function updateGlow(){
  if(!heroEl) return;
  const y = window.scrollY || 0;
  const xOff = Math.sin(y/420) * 12;
  const yOff = (y/18) * 0.35;
  heroEl.style.setProperty("--glowX", xOff.toFixed(2) + "px");
  heroEl.style.setProperty("--glowY", yOff.toFixed(2) + "px");
}
updateGlow();

document.querySelectorAll(".btn").forEach(btn=>{
  btn.addEventListener("pointerdown", (e)=>{
    const r = btn.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    btn.style.setProperty("--rx", x.toFixed(2) + "%");
    btn.style.setProperty("--ry", y.toFixed(2) + "%");
    btn.classList.remove("ripple");
    // force reflow
    void btn.offsetWidth;
    btn.classList.add("ripple");
  }, {passive:true});
});


// v8RevealFallback: ensure reveal never stays hidden/blurred
window.addEventListener("load", ()=>{
  setTimeout(()=>{
    document.querySelectorAll(".reveal").forEach(el=>el.classList.add("in"));
  }, 600);
});

// v10: mark images loaded (remove shimmer)
document.querySelectorAll("img").forEach(img=>{
  if(img.complete) img.classList.add("is-loaded");
  img.addEventListener("load", ()=>img.classList.add("is-loaded"), {passive:true});
});

// v10: share button (Web Share API + WhatsApp fallback)
const shareBtn = document.getElementById("shareBtn");
if(shareBtn){
  shareBtn.addEventListener("click", async ()=>{
    const url = window.location.href;
    const title = "NENETFLIX · Guía";
    const text = "🎬 NENETFLIX: streaming privado tipo Netflix en Plex. 50€ al año · 2 pantallas · Peticiones incluidas.";
    try{
      if(navigator.share){
        await navigator.share({title, text, url});
      }else{
        const w = "https://wa.me/?text=" + encodeURIComponent(text + " " + url);
        window.open(w, "_blank", "noreferrer");
      }
    }catch(e){}
  });
}

// v10: mode toggle (Guía vs Modo fácil)
const modeFull = document.getElementById("modeFull");
const modeEasy = document.getElementById("modeEasy");
const easyMode = document.getElementById("easyMode");
const fullGuide = document.getElementById("fullGuide");

function setMode(mode){
  const isEasy = mode === "easy";
  if(easyMode) easyMode.classList.toggle("active", isEasy);
  if(fullGuide) fullGuide.classList.toggle("hidden", isEasy);
  if(modeFull){ modeFull.classList.toggle("active", !isEasy); modeFull.setAttribute("aria-selected", String(!isEasy)); }
  if(modeEasy){ modeEasy.classList.toggle("active", isEasy); modeEasy.setAttribute("aria-selected", String(isEasy)); }
  localStorage.setItem("nenetflix_mode", mode);
}

const savedMode = localStorage.getItem("nenetflix_mode");
if(savedMode) setMode(savedMode);

modeFull?.addEventListener("click", ()=> setMode("full"));
modeEasy?.addEventListener("click", ()=> setMode("easy"));

// v10: FAQ accordion
document.querySelectorAll(".faq-q").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    btn.classList.toggle("open");
  });
});

// v10: sound toggle (tiny UI click)
const soundBtn = document.getElementById("soundBtn");
const soundIcon = document.getElementById("soundIcon");
let soundOn = localStorage.getItem("nenetflix_sound") === "1";

function updateSoundUI(){
  if(soundIcon) soundIcon.textContent = soundOn ? "🔊" : "🔇";
}
updateSoundUI();

function uiClick(){
  if(!soundOn) return;
  try{
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = 520;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    o.stop(ctx.currentTime + 0.09);
    o.onended = ()=> ctx.close();
  }catch(e){}
}

// Attach click sound to buttons/links
document.addEventListener("click", (e)=>{
  const t = e.target.closest("button, a");
  if(t) uiClick();
}, {passive:true});

soundBtn?.addEventListener("click", ()=>{
  soundOn = !soundOn;
  localStorage.setItem("nenetflix_sound", soundOn ? "1" : "0");
  updateSoundUI();
});


// v10: lightbox pinch-to-zoom + swipe
let lbScale = 1;
let lbStartDist = 0;
let lbStartScale = 1;
let lbStartX = 0;
let lbStartY = 0;
let lbTranslateX = 0;
let lbTranslateY = 0;

function applyLbTransform(){
  if(!lightboxImg) return;
  lightboxImg.style.transform = `translate(${lbTranslateX}px, ${lbTranslateY}px) scale(${lbScale})`;
}

function resetLbTransform(){
  lbScale = 1; lbTranslateX = 0; lbTranslateY = 0;
  applyLbTransform();
}

if(lightboxImg){
  lightboxImg.style.transformOrigin = "center";
  lightboxImg.style.transition = "transform .12s ease";
  lightboxImg.addEventListener("dblclick", ()=>{
    lbScale = lbScale > 1 ? 1 : 2;
    lbTranslateX = 0; lbTranslateY = 0;
    applyLbTransform();
  });

  let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

  lightbox.addEventListener("touchstart", (e)=>{
    if(e.touches.length === 1){
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      lbStartX = touchStartX - lbTranslateX;
      lbStartY = touchStartY - lbTranslateY;
    }
    if(e.touches.length === 2){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lbStartDist = Math.hypot(dx,dy);
      lbStartScale = lbScale;
    }
  }, {passive:true});

  lightbox.addEventListener("touchmove", (e)=>{
    if(!lightbox.classList.contains("open")) return;
    if(e.touches.length === 1 && lbScale > 1.01){
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      lbTranslateX = x - lbStartX;
      lbTranslateY = y - lbStartY;
      applyLbTransform();
    }
    if(e.touches.length === 2){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx,dy);
      const ratio = dist / (lbStartDist || dist);
      lbScale = Math.min(3.5, Math.max(1, lbStartScale * ratio));
      applyLbTransform();
    }
  }, {passive:true});

  lightbox.addEventListener("touchend", (e)=>{
    if(e.touches.length === 0){
      // swipe nav only when not zoomed
      touchEndX = (e.changedTouches[0]?.clientX) || touchStartX;
      touchEndY = (e.changedTouches[0]?.clientY) || touchStartY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      if(Math.abs(dx) > 70 && Math.abs(dy) < 60 && lbScale <= 1.05){
        if(dx < 0) showAt(currentIndex+1);
        else showAt(currentIndex-1);
      }
    }
  }, {passive:true});
}

// Hook reset when opening/closing
const _openLightbox = openLightbox;
openLightbox = function(src, idx){
  resetLbTransform();
  _openLightbox(src, idx);
}
const _closeLightbox = closeLightbox;
closeLightbox = function(){
  resetLbTransform();
  _closeLightbox();
}

// v12: Sticky WhatsApp behavior + haptic
const sticky = document.getElementById("stickyWhatsApp");
let shown = false;
window.addEventListener("scroll", ()=>{
  if(!sticky) return;
  if(window.scrollY > 220 && !shown){
    sticky.style.opacity = "1";
    shown = true;
  }
},{passive:true});

document.querySelectorAll('a[href*="wa.me"]').forEach(a=>{
  a.addEventListener("click", ()=>{
    if(navigator.vibrate) navigator.vibrate(10);
  }, {passive:true});
});

// v13: one-time logo animation + dynamic sticky CTA label
(function(){
  const key = "nenetflix_logo_once";
  const h1 = document.getElementById("heroTitle");
  if(h1){
    const done = localStorage.getItem(key) === "1";
    if(!done){
      h1.classList.add("logo-once");
      localStorage.setItem(key, "1");
    }
  }

  const stickyBtn = document.querySelector(".sticky-wa-btn");
  function updateStickyCopy(){
    if(!stickyBtn) return;
    const y = window.scrollY || 0;
    // After user scrolls deeper, make CTA more direct
    if(y > 1200){
      stickyBtn.textContent = "🎬 Quiero mi acceso";
    }else{
      stickyBtn.textContent = "💬 Más info por WhatsApp";
    }
  }
  updateStickyCopy();
  window.addEventListener("scroll", updateStickyCopy, {passive:true});
})();
