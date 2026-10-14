// Election day, 27.10.2026 at 21:00 Israel time (IST, UTC+2 after the clocks change on 25.10)
const TARGET = new Date("2026-10-27T21:00:00+02:00").getTime();
const PHONE = "972545966296";
const MESSAGE = "היי חגי, אשמח לעזרה בהגעה לקלפי ביום הבחירות (27.10).\nכתובת איסוף: \nשעה מועדפת: \nמספר נוסעים: ";

document.documentElement.classList.add("js");

// Prefilled WhatsApp message on every contact link
const waUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;
document.querySelectorAll(".js-wa").forEach((a) => { a.href = waUrl; });

// Countdown
const units = {};
document.querySelectorAll("#countdown [data-u]").forEach((el) => { units[el.dataset.u] = el; });
let timer;
const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const left = TARGET - Date.now();
  if (left <= 0) {
    document.getElementById("clock-title").textContent = "הקלפיות נסגרו. תודה שהצבעתם!";
    Object.values(units).forEach((el) => { el.textContent = "00"; });
    clearInterval(timer);
    return;
  }
  const s = Math.floor(left / 1000);
  units.d.textContent = pad(Math.floor(s / 86400));
  units.h.textContent = pad(Math.floor((s % 86400) / 3600));
  units.m.textContent = pad(Math.floor((s % 3600) / 60));
  units.s.textContent = pad(s % 60);
}
timer = setInterval(tick, 1000);
tick();

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
