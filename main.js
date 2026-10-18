// Election day, 27.10.2026 at 21:00 Israel time (IST, UTC+2 after the clocks change on 25.10)
const TARGET = new Date("2026-10-27T21:00:00+02:00").getTime();
// A page can set its own WhatsApp number with data-wa-phone on <body>
const PHONE = document.body.dataset.waPhone || "972545966296";
// A page can set its own prefilled message with data-wa-message on <body>
const MESSAGE = document.body.dataset.waMessage || "היי חגי, אשמח לעזרה בהגעה לקלפי ביום הבחירות (27.10).\nכתובת איסוף: \nשעה מועדפת: \nמספר נוסעים: ";

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

// Hero: every 5 seconds the background picture crossfades and the city name changes
// A page can list its own places with data-places="a|b|c" on <body>
const CITIES = document.body.dataset.places?.split("|") || ["ירושלים", "תל אביב-יפו", "חיפה", "ראשון לציון", "פתח תקווה", "אשדוד", "נתניה", "באר שבע", "בני ברק", "חולון", "רמת גן"];
const slides = [...document.querySelectorAll(".hero__bg .slide")];
const cityEl = document.getElementById("city");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STEP = 5000;
const LETTER_DELAY = 35;

// Each letter is its own span so it can move with its own delay (spaces kept as no-break spaces)
const lettersOf = (word) => [...`${word},`].map((ch) => {
  const span = document.createElement("span");
  span.textContent = ch === " " ? " " : ch;
  return span;
});

function showCity(word) {
  const old = [...cityEl.children];
  old.forEach((span, i) => { span.style.transitionDelay = `${i * LETTER_DELAY}ms`; span.classList.add("out"); });
  const outTime = old.length * LETTER_DELAY + 450;
  setTimeout(() => {
    const fresh = lettersOf(word);
    fresh.forEach((span) => span.classList.add("pre"));
    cityEl.replaceChildren(...fresh);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fresh.forEach((span, i) => { span.style.transitionDelay = `${i * LETTER_DELAY}ms`; span.classList.remove("pre"); });
    }));
  }, outTime);
}

if (!calm) {
  let slide = 0, city = 0;
  const imgOf = (i) => slides[i].querySelector("img");
  cityEl.replaceChildren(...lettersOf(CITIES[0]));
  setInterval(async () => {
    if (document.hidden) return;
    city = (city + 1) % CITIES.length;
    showCity(CITIES[city]);
    if (slides.length < 2) return;
    const next = (slide + 1) % slides.length;
    const img = imgOf(next);
    img.loading = "eager";
    try { await img.decode(); } catch { return; } // not loaded yet: try again next round
    slides[slide].classList.remove("is-on");
    slides[next].classList.add("is-on");
    slide = next;
  }, STEP);
  if (slides.length > 1) imgOf(1).loading = "eager"; // fetch the second picture early
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
