/* ==========================================================
   The Skin Scientist: interactive "inside the course" phones
   Self-contained, no dependencies.
   ========================================================== */
(() => {
  const app = document.querySelector(".course-app");
  if (!app) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const stage = app.querySelector(".ca-stage");
  const phonesWrap = app.querySelector(".ca-phones");
  const phones = [...app.querySelectorAll(".ca-phone")];
  const features = [...app.querySelectorAll(".ca-feature")];
  const dots = [...app.querySelectorAll(".ca-dots i")];
  let active = 0;

  /* ---------- Phone carousel ---------- */
  const go = (i) => {
    active = (i + phones.length) % phones.length;
    phones.forEach((p, idx) => {
      const rel = (idx - active + phones.length) % phones.length;
      p.dataset.pos = rel === 0 ? "center" : rel === 1 ? "right" : "left";
      p.setAttribute("aria-hidden", rel === 0 ? "false" : "true");
    });
    features.forEach((f, idx) => {
      f.classList.toggle("active", idx === active);
      f.setAttribute("aria-selected", idx === active ? "true" : "false");
    });
    dots.forEach((d, idx) => d.classList.toggle("active", idx === active));
    if (active !== 2) video.pause();
    if (active === 1) acids.play();
  };

  phones.forEach((p, idx) => p.querySelector(".ca-cover").addEventListener("click", () => go(idx)));
  features.forEach((f) => f.addEventListener("click", () => go(+f.dataset.go)));
  app.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", (e) => { e.stopPropagation(); go(+b.dataset.open); })
  );

  // Swipe between phones on touch screens
  let sx = 0, sy = 0;
  stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Gentle 3D tilt following the mouse
  if (finePointer && !reduce) {
    phonesWrap.style.transition = "transform .8s cubic-bezier(.22,1,.36,1)";
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      phonesWrap.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 5}deg)`;
    });
    stage.addEventListener("mouseleave", () => { phonesWrap.style.transform = ""; });
  }

  /* ---------- Progress (shared across all phones) ---------- */
  const lessons = ["barrier-video", "barrier-what", "barrier-damage", "barrier-tell", "barrier-repair", "acids-how", "acids-choose"];
  const done = new Set(["barrier-what", "barrier-damage"]);
  const ring = app.querySelector("[data-ring]");
  const ringMini = app.querySelector("[data-ring-mini]");
  const C = 2 * Math.PI * 18, Cm = 2 * Math.PI * 15;
  ring.style.strokeDasharray = C;
  ringMini.style.strokeDasharray = Cm;

  const toast = (msg) => {
    const t = phones[active].querySelector(".ca-toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2200);
  };

  const render = () => {
    const pct = done.size / lessons.length;
    ring.style.strokeDashoffset = C * (1 - pct);
    ringMini.style.strokeDashoffset = Cm * (1 - pct);
    app.querySelector("[data-pct]").textContent = Math.round(pct * 100) + "%";
    app.querySelector("[data-count-label]").textContent = `${done.size} of ${lessons.length} lessons`;
    app.querySelector('[data-sec-count="barrier"]').textContent = lessons.slice(0, 5).filter((l) => done.has(l)).length;
    app.querySelector('[data-sec-count="acids"]').textContent = lessons.slice(5).filter((l) => done.has(l)).length;
    app.querySelectorAll("[data-lesson]").forEach((li) => li.classList.toggle("done", done.has(li.dataset.lesson)));
    app.querySelectorAll("[data-complete]").forEach((b) => {
      const isDone = done.has(b.dataset.complete);
      b.classList.toggle("is-done", isDone);
      b.querySelector("span").textContent = isDone ? "Lesson complete" : "Mark lesson complete";
    });
    const cont = app.querySelector(".ca-continue");
    const acidsDone = done.has("acids-how");
    cont.querySelector("b").textContent = acidsDone ? "Choosing the right acid for your client" : "How AHAs, BHAs and PHAs work";
    cont.querySelector(".bar i").style.width = acidsDone ? "8%" : "40%";
  };

  const setDone = (id, val) => {
    const was = done.has(id);
    val ? done.add(id) : done.delete(id);
    render();
    if (val && !was) toast(done.size === lessons.length ? "Module complete. Brilliant work!" : "Lesson complete ✓  Nice one");
  };

  app.querySelectorAll("[data-lesson] .tick").forEach((b) => {
    b.addEventListener("click", () => {
      const id = b.closest("[data-lesson]").dataset.lesson;
      setDone(id, !done.has(id));
    });
  });
  app.querySelectorAll("[data-complete]").forEach((b) =>
    b.addEventListener("click", () => setDone(b.dataset.complete, !done.has(b.dataset.complete)))
  );

  // Module accordions
  app.querySelectorAll(".ca-mod:not(.locked) .ca-mod-head").forEach((h) => {
    h.addEventListener("click", () => {
      const mod = h.closest(".ca-mod");
      mod.classList.toggle("open");
      h.setAttribute("aria-expanded", mod.classList.contains("open"));
    });
  });

  /* ---------- Acids lesson ---------- */
  const acids = (() => {
    const diagram = app.querySelector(".ca-diagram");
    const mols = [...diagram.querySelectorAll(".mol")];
    const label = diagram.querySelector("[data-mol-label]");
    const seg = app.querySelector(".ca-seg");
    const knob = seg.querySelector(".knob");
    const segBtns = [...seg.querySelectorAll("button")];
    const pills = [...app.querySelectorAll(".ca-pills button")];
    const pillText = app.querySelector(".ca-pill-text");
    let mode = "aha", pill = 0, timer;

    // [x, y] targets in SVG units, and molecule radius
    const targets = {
      aha: [
        { r: 6, pts: [[52, 60], [104, 62], [150, 58], [236, 61]] },  // glycolic: smallest, goes a touch deeper
        { r: 7, pts: [[52, 48], [104, 50], [150, 47], [236, 49]] },  // lactic
        { r: 9, pts: [[52, 42], [104, 44], [150, 41], [236, 43]] }   // mandelic: larger, slower, gentler
      ],
      bha: { r: 6, pts: [[206, 52], [206, 70], [206, 88], [206, 104]] },
      pha: { r: 12, pts: [[52, 24], [108, 24], [160, 24], [236, 24]] }
    };
    const start = [[52, -14], [108, -14], [160, -14], [236, -14]];

    const place = (pts, r, stagger) => {
      mols.forEach((m, i) => {
        m.style.transitionDelay = stagger ? `${i * 0.12}s` : "0s";
        m.style.transform = `translate(${pts[i][0]}px, ${pts[i][1]}px)`;
        m.querySelector("circle").setAttribute("r", r);
      });
    };

    const play = () => {
      clearTimeout(timer);
      diagram.classList.remove("working", "dissolve");
      const t = mode === "aha" ? targets.aha[pill] : targets[mode];
      mols.forEach((m) => { m.style.transitionDuration = "0s"; });
      place(start, t.r, false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        mols.forEach((m) => { m.style.transitionDuration = mode === "aha" && pill === 2 ? "1.8s" : ""; });
        place(t.pts, t.r, true);
        timer = setTimeout(() => diagram.classList.add("working", "dissolve"), reduce ? 0 : 1300);
      }));
    };

    segBtns.forEach((b, i) => b.addEventListener("click", () => {
      mode = b.dataset.acid;
      segBtns.forEach((x) => x.classList.toggle("active", x === b));
      knob.style.transform = `translateX(${i * 100}%)`;
      diagram.dataset.mode = mode;
      label.textContent = mode.toUpperCase();
      app.querySelectorAll("[data-acid-panel]").forEach((p) => { p.hidden = p.dataset.acidPanel !== mode; });
      play();
    }));

    pills.forEach((b, i) => b.addEventListener("click", () => {
      pill = i;
      pills.forEach((x) => x.classList.toggle("active", x === b));
      pillText.textContent = b.dataset.pill;
      label.textContent = b.textContent.toUpperCase();
      play();
    }));

    place(start, 6, false);
    return { play };
  })();

  /* ---------- Video lesson ---------- */
  const video = (() => {
    const player = app.querySelector(".ca-player");
    const svg = player.querySelector(".bricks");
    const playBtn = player.querySelector(".ca-play");
    const trackFill = player.querySelector("[data-track]");
    const track = player.querySelector(".track");
    const timeEl = player.querySelector("[data-time]");
    const tag = player.querySelector("[data-chapter-tag]");
    const chapterBtns = [...app.querySelectorAll("[data-seek]")];
    const DURATION = 990;       // 16:30
    const SPEED = 60;           // preview plays 60x real time
    let t = 0, playing = false, last = 0, raf;

    // Build the brick and mortar barrier
    const NS = "http://www.w3.org/2000/svg";
    const el = (name, attrs) => { const n = document.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
    svg.appendChild(el("rect", { class: "mortar", x: 0, y: 0, width: 240, height: 135 }));
    let seed = 7;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let row = 0; row < 6; row++) {
      const y = 6 + row * 22;
      for (let x = row % 2 ? -22 : 2; x < 240; x += 48) {
        const b = el("rect", { class: "brick", x, y, width: 44, height: 18, rx: 4 });
        if (rand() < 0.32) {
          b.classList.add("crack");
          b.style.setProperty("--rot", `${(rand() - 0.5) * 18}deg`);
          b.style.setProperty("--dx", `${(rand() - 0.5) * 8}px`);
          b.style.setProperty("--dy", `${(rand() - 0.5) * 6}px`);
        }
        svg.appendChild(b);
      }
    }
    [24, 72, 120, 168, 216, 96].forEach((x, i) => {
      const c = el("circle", { class: "irritant", cx: x, cy: 4, r: 3 });
      c.style.setProperty("--d", `${i * 0.4}s`);
      svg.appendChild(c);
    });

    const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    const chapterAt = (s) => chapterBtns.reduce((acc, b, i) => (s >= +b.dataset.seek ? i : acc), 0);

    const draw = () => {
      trackFill.style.width = `${(t / DURATION) * 100}%`;
      timeEl.textContent = fmt(t);
      const ch = chapterAt(t);
      player.classList.remove("ch0", "ch1", "ch2", "ch3");
      player.classList.add(`ch${ch}`);
      chapterBtns.forEach((b, i) => b.classList.toggle("active", i === ch));
      tag.textContent = chapterBtns[ch].dataset.label;
    };

    const loop = (now) => {
      if (!playing) return;
      t = Math.min(DURATION, t + ((now - last) / 1000) * SPEED);
      last = now;
      draw();
      if (t >= DURATION) {
        pause();
        setDone("barrier-video", true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const playV = () => {
      if (t >= DURATION) t = 0;
      playing = true;
      player.classList.add("playing");
      playBtn.setAttribute("aria-label", "Pause");
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    function pause() {
      playing = false;
      cancelAnimationFrame(raf);
      player.classList.remove("playing");
      playBtn.setAttribute("aria-label", "Play");
    }

    playBtn.addEventListener("click", () => (playing ? pause() : playV()));
    player.addEventListener("touchstart", () => {
      player.classList.add("show-ctrl");
      clearTimeout(player._h);
      player._h = setTimeout(() => player.classList.remove("show-ctrl"), 1800);
    }, { passive: true });
    track.addEventListener("click", (e) => {
      const r = track.getBoundingClientRect();
      t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * DURATION;
      draw();
    });
    chapterBtns.forEach((b) => b.addEventListener("click", () => {
      t = +b.dataset.seek;
      draw();
      if (!playing) playV();
    }));

    draw();
    return { pause };
  })();

  render();
  go(0);
})();
