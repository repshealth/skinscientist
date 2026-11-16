/* ==========================================================
   By The Molecule / The Skin Scientist
   Site script v2 (GSAP + ScrollTrigger)
   ========================================================== */

/* ----------------------------------------------------------
   SETTINGS: fill these in before going live
   ---------------------------------------------------------- */
const SITE_CONFIG = {
  // Klaviyo public key (site ID) for the By The Molecule account
  klaviyoPublicKey: "StzVdH",

  // Klaviyo list ID for the Black Friday VIP register page
  klaviyoVipListId: "REPLACE_WITH_BLACK_FRIDAY_LIST_ID",

  // Klaviyo list ID for the footer newsletter sign up
  klaviyoNewsletterListId: "TPcwRC",

  // Where the Skin Scientist enrol form posts to (CRM / Zapier / Make webhook). Sent as JSON.
  enrolWebhookUrl: "REPLACE_WITH_ENROL_FORM_WEBHOOK_URL",

  // Optional: send people here after the enrol form submits (e.g. Acuity booking link)
  enrolRedirectUrl: ""
};

(() => {
  const root = document.documentElement;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Split text into words ---------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "split-word";
            const inner = document.createElement("span");
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    };
    walk(el);
  });

  /* Statement words (fill on scroll) */
  document.querySelectorAll("[data-fill]").forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "fill-word";
            w.textContent = part;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
  });

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  const header = document.querySelector(".site-header");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle("scrolled", y > 40);
      header.classList.toggle("hidden", y > 500 && y > lastY && !document.body.classList.contains("nav-open"));
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  document.querySelectorAll(".nav-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.querySelectorAll(".mobile-menu a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );

  /* ---------- Image fallbacks: hide images not uploaded yet ---------- */
  document.querySelectorAll(".media img, .hero-bg img").forEach((img) => {
    const hide = () => (img.style.visibility = "hidden");
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener("error", hide);
  });

  /* ---------- YouTube facade ---------- */
  document.querySelectorAll(".video[data-youtube-id]").forEach((wrap) => {
    const id = wrap.dataset.youtubeId;
    const valid = id && !id.startsWith("REPLACE");
    if (valid) {
      wrap.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/maxresdefault.jpg)`;
      wrap.classList.add("has-poster");
    }
    wrap.addEventListener("click", () => {
      if (!valid) return;
      wrap.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="The Skin Scientist" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open);
    });
  });

  /* ---------- Skin layer explorer ---------- */
  const skin = document.querySelector(".skin");
  if (skin) {
    const layers = skin.querySelectorAll(".skin-layer");
    const infos = document.querySelectorAll(".layer-info");
    const pulse = skin.querySelector(".skin-pulse");
    const select = (key) => {
      layers.forEach((l) => l.classList.toggle("active", l.dataset.layer === key));
      infos.forEach((i) => i.classList.toggle("active", i.dataset.layer === key));
      const active = skin.querySelector(`.skin-layer[data-layer="${key}"]`);
      if (pulse && active) {
        const x = key === "follicle" ? skin.offsetWidth * 0.62 + 15 : skin.offsetWidth - 46;
        pulse.style.left = x + "px";
        pulse.style.top = active.offsetTop + active.offsetHeight / 2 - 8 + "px";
      }
    };
    layers.forEach((l) => {
      l.addEventListener("click", () => select(l.dataset.layer));
      if (finePointer) l.addEventListener("mouseenter", () => select(l.dataset.layer));
    });
    select(layers[0].dataset.layer);
    window.addEventListener("resize", () => {
      const a = skin.querySelector(".skin-layer.active");
      if (a) select(a.dataset.layer);
    });
  }

  /* ---------- Fit toggle ---------- */
  document.querySelectorAll(".fit").forEach((fit) => {
    const sw = fit.querySelector(".fit-switch");
    const btns = sw.querySelectorAll("button");
    const lists = fit.querySelectorAll(".fit-list");
    btns.forEach((b) => b.addEventListener("click", () => {
      const key = b.dataset.fit;
      btns.forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-selected", x === b); });
      sw.classList.toggle("no", key === "no");
      lists.forEach((l) => {
        const show = l.dataset.fit === key;
        l.hidden = !show;
        if (show && hasGsap && !reduce) {
          gsap.fromTo(l.children, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: "power3.out" });
        }
      });
    }));
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && hasGsap && !reduce) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Cursor follower ---------- */
  const cursor = document.querySelector(".cursor");
  if (cursor && finePointer && hasGsap && !reduce) {
    const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", (e) => { cursor.classList.add("on"); cx(e.clientX); cy(e.clientY); });
    document.querySelectorAll("a, button, .video, .skin-layer, .m-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("big"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("big"));
    });
  }

  /* ---------- Countdown ---------- */
  document.querySelectorAll("[data-countdown]").forEach((el) => {
    const target = new Date(el.dataset.countdown).getTime();
    const q = (k) => el.querySelector(`[data-${k}]`);
    const parts = { d: q("d"), h: q("h"), m: q("m"), s: q("s") };
    const caption = document.querySelector("[data-countdown-caption]");
    const pad = (n) => String(n).padStart(2, "0");
    let timer;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        Object.values(parts).forEach((p) => p && (p.textContent = "00"));
        if (caption) caption.textContent = "The link is live. Check your inbox now.";
        clearInterval(timer);
        return;
      }
      parts.d.textContent = pad(Math.floor(diff / 864e5));
      parts.h.textContent = pad(Math.floor((diff % 864e5) / 36e5));
      parts.m.textContent = pad(Math.floor((diff % 36e5) / 6e4));
      parts.s.textContent = pad(Math.floor((diff % 6e4) / 1e3));
    };
    tick();
    timer = setInterval(tick, 1000);
  });

  /* ---------- Sticky CTA ---------- */
  const sticky = document.querySelector(".sticky-cta");
  const stickyHide = document.querySelectorAll("[data-hide-sticky]");
  if (sticky && stickyHide.length) {
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      sticky.classList.toggle("show", visible.size === 0);
    });
    stickyHide.forEach((el) => io.observe(el));
  }

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ==========================================================
     GSAP animations
     ========================================================== */
  if (!hasGsap || reduce) {
    root.classList.remove("anim");
    document.querySelectorAll(".h-progress i").forEach((i) => (i.style.transform = "scaleX(1)"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
  heroTl
    .to(".hero [data-split] .split-word > span, .reg-hero [data-split] .split-word > span", { y: 0, duration: 1.4, stagger: 0.08 }, 0.15)
    .fromTo(".hero-bg, .reg-hero .hero-bg", { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "power3.out" }, 0)
    .to(".hero [data-reveal], .reg-hero [data-reveal]", { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.6);

  // Hero molecule: draw then float
  const mol = document.querySelector(".hero-molecule");
  if (mol) {
    const strokes = mol.querySelectorAll("path, line");
    strokes.forEach((p) => {
      const len = p.getTotalLength ? p.getTotalLength() : 300;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    heroTl.to(strokes, { strokeDashoffset: 0, duration: 2.4, stagger: 0.05, ease: "power2.inOut" }, 0.3)
      .from(mol.querySelectorAll("circle"), { scale: 0, transformOrigin: "center", duration: 0.8, stagger: 0.04, ease: "back.out(2)" }, 1.4);
    gsap.to(mol, { yPercent: 25, rotate: 12, ease: "none", scrollTrigger: { trigger: ".hero, .reg-hero", start: "top top", end: "bottom top", scrub: true } });
  }

  // Hero parallax
  document.querySelectorAll(".hero-bg").forEach((bg) => {
    gsap.to(bg, { yPercent: 14, ease: "none", scrollTrigger: { trigger: bg.parentElement, start: "top top", end: "bottom top", scrub: true } });
  });

  // Video grows as it scrolls in
  const video = document.querySelector(".video-section .video");
  if (video) {
    gsap.fromTo(video, { scale: 0.86, borderRadius: 40 }, {
      scale: 1, borderRadius: 22, ease: "none",
      scrollTrigger: { trigger: video, start: "top 95%", end: "top 25%", scrub: true }
    });
  }

  // Generic reveals (outside hero)
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    if (el.closest(".hero, .reg-hero")) return;
    gsap.to(el, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  gsap.utils.toArray("[data-stagger]").forEach((wrap) => {
    gsap.to(wrap.children, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09, ease: "expo.out", scrollTrigger: { trigger: wrap, start: "top 85%" } });
  });

  // Split headings outside hero
  gsap.utils.toArray("[data-split]").forEach((el) => {
    if (el.closest(".hero, .reg-hero")) return;
    gsap.to(el.querySelectorAll(".split-word > span"), { y: 0, duration: 1.2, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });

  // Clip reveals + inner parallax for media
  gsap.utils.toArray("[data-clip]").forEach((el) => {
    gsap.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 82%" } });
    const img = el.querySelector("img");
    if (img) gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Statement fill
  gsap.utils.toArray("[data-fill]").forEach((el) => {
    gsap.to(el.querySelectorAll(".fill-word"), {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
    });
  });

  // Counters
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => (el.textContent = Math.round(obj.v))
    });
  });

  // Floating cards
  gsap.utils.toArray(".media-float").forEach((el) => {
    gsap.to(el, { y: -40, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Timeline line draw
  document.querySelectorAll(".timeline-line i").forEach((line) => {
    gsap.to(line, { scaleX: 1, ease: "none", scrollTrigger: { trigger: line.closest(".timeline"), start: "top 75%", end: "bottom 55%", scrub: true } });
  });

  // Horizontal modules (desktop only)
  const mm = gsap.matchMedia();
  mm.add("(min-width: 721px)", () => {
    const section = document.querySelector(".modules-section");
    const track = document.querySelector(".h-track");
    if (!section || !track) return;
    const bar = section.querySelector(".h-progress i");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 24);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top", end: () => "+=" + dist(),
        pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress })
      }
    });
    return () => tween.kill();
  });
  mm.add("(max-width: 720px)", () => {
    const track = document.querySelector(".h-track");
    const bar = document.querySelector(".h-progress i");
    if (!track || !bar) return;
    const upd = () => gsap.set(bar, { scaleX: track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth) });
    track.addEventListener("scroll", upd, { passive: true });
    upd();
  });

  // Places dots light up
  gsap.utils.toArray(".places-dots").forEach((wrap) => {
    gsap.from(wrap.children, { scaleX: 0, transformOrigin: "left", duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 1.2 });
  });

  // Footer word
  gsap.utils.toArray(".footer-word").forEach((el) => {
    gsap.fromTo(el, { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

/* ==========================================================
   Forms
   ========================================================== */
function setMsg(form, text, type) {
  const msg = form.querySelector(".form-msg");
  if (!msg) return;
  msg.textContent = text;
  msg.className = "form-msg " + (type || "");
}

function showSuccess(form) {
  const card = form.closest(".form-card");
  const s = card && card.querySelector(".form-success");
  if (s) s.classList.add("show");
}

async function klaviyoSubscribe({ listId, email, firstName, lastName, phone, properties, source }) {
  if (!listId || listId.startsWith("REPLACE")) throw new Error("Klaviyo list ID not set in SITE_CONFIG");
  const profile = { email };
  if (firstName) profile.first_name = firstName;
  if (lastName) profile.last_name = lastName;
  if (phone) profile.phone_number = phone;
  if (properties) profile.properties = properties;
  const res = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${SITE_CONFIG.klaviyoPublicKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/vnd.api+json", revision: "2024-10-15" },
    body: JSON.stringify({
      data: {
        type: "subscription",
        attributes: { custom_source: source || "Website", profile: { data: { type: "profile", attributes: profile } } },
        relationships: { list: { data: { type: "list", id: listId } } }
      }
    })
  });
  if (!res.ok && res.status !== 202) throw new Error("Klaviyo error " + res.status);
}

document.querySelectorAll("form[data-form='vip']").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const d = new FormData(form);
    btn.disabled = true;
    setMsg(form, "Saving your place on the list...", "");
    try {
      await klaviyoSubscribe({
        listId: SITE_CONFIG.klaviyoVipListId,
        email: d.get("email"),
        firstName: d.get("first_name"),
        phone: d.get("phone") || undefined,
        properties: { instagram_handle: d.get("instagram") || "", bf_vip_2026: true, role: d.get("role") || "" },
        source: "Black Friday VIP register page"
      });
      form.reset();
      setMsg(form, "", "");
      showSuccess(form);
    } catch (err) {
      console.error(err);
      setMsg(form, "Something went wrong there. Please try again or DM me on Instagram.", "err");
    } finally {
      btn.disabled = false;
    }
  });
});

document.querySelectorAll("form[data-form='newsletter']").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form);
    setMsg(form, "Signing you up...", "");
    try {
      await klaviyoSubscribe({
        listId: SITE_CONFIG.klaviyoNewsletterListId,
        email: d.get("email"),
        firstName: d.get("first_name"),
        lastName: d.get("last_name"),
        source: "Website footer"
      });
      form.reset();
      setMsg(form, "Thank you, you're signed up.", "ok");
    } catch (err) {
      console.error(err);
      setMsg(form, "Something went wrong. Please try again.", "err");
    }
  });
});

document.querySelectorAll("form[data-form='enrol']").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const data = Object.fromEntries(new FormData(form).entries());
    data.page = location.pathname;
    data.submitted_at = new Date().toISOString();
    btn.disabled = true;
    setMsg(form, "Sending...", "");
    try {
      if (SITE_CONFIG.enrolWebhookUrl.startsWith("REPLACE")) throw new Error("enrolWebhookUrl not set in SITE_CONFIG");
      const res = await fetch(SITE_CONFIG.enrolWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Webhook error " + res.status);
      if (SITE_CONFIG.enrolRedirectUrl) { location.href = SITE_CONFIG.enrolRedirectUrl; return; }
      form.reset();
      setMsg(form, "", "");
      showSuccess(form);
    } catch (err) {
      console.error(err);
      setMsg(form, "Something went wrong there. Please try again or DM me on Instagram.", "err");
    } finally {
      btn.disabled = false;
    }
  });
});
