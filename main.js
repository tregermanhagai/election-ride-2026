// Election day, 27.10.2026 at 21:00 Israel time (IST, UTC+2 after the clocks change on 25.10)
const TARGET = new Date("2026-10-27T21:00:00+02:00").getTime();
const PHONE = "972545966296";
const MESSAGE = "היי חגי, אשמח לעזרה בהגעה לקלפי ביום הבחירות (27.10).\nכתובת איסוף: \nשעה מועדפת: \nמספר נוסעים: ";

document.documentElement.classList.add("js");

// Prefilled WhatsApp message on every contact link
const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;
document.querySelectorAll(".js-wa").forEach((a) => { a.href = waUrl; });

// Countdown
// Every [data-u] cell (the small clock in the hero and the big one below) shows the same unit
const cells = { d: [], h: [], m: [], s: [] };
document.querySelectorAll("[data-u]").forEach((el) => { cells[el.dataset.u].push(el); });
const set = (u, v) => cells[u].forEach((el) => { el.textContent = v; });
let timer;
const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const left = TARGET - Date.now();
  if (left <= 0) {
    const clock = document.getElementById("countdown");
    clock.setAttribute("dir", "rtl");
    clock.textContent = "הקלפיות נסגרו. תודה שהצבעתם!";
    clearInterval(timer);
    return;
  }
  const s = Math.floor(left / 1000);
  set("d", pad(Math.floor(s / 86400)));
  set("h", pad(Math.floor((s % 86400) / 3600)));
  set("m", pad(Math.floor((s % 3600) / 60)));
  set("s", pad(s % 60));
}
timer = setInterval(tick, 1000);
tick();

// Hero slideshow: a slow crossfade to the next picture every 7 seconds
const slides = [...document.querySelectorAll(".hero__bg .slide")];
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (slides.length > 1 && !calm) {
  let current = 0;
  const imgOf = (i) => slides[i].querySelector("img");
  setInterval(async () => {
    if (document.hidden) return;
    const next = (current + 1) % slides.length;
    const img = imgOf(next);
    img.loading = "eager";
    try { await img.decode(); } catch { return; } // not loaded yet: try again next round
    slides[current].classList.remove("is-on");
    slides[next].classList.add("is-on");
    current = next;
  }, 7000);
  imgOf(1).loading = "eager"; // fetch the second picture early
}

// Staggered entrances, once per element
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll(":scope > .reveal")];
    entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 80}ms`;
    entry.target.classList.add("in");
    io.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
