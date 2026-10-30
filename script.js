(() => {
    "use strict";
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Nav state, progress bar, active link ---------- */
    const nav = $("#nav"), bar = $("#progress");
    const onScroll = () => {
        nav.classList.toggle("is-scrolled", scrollY > 8);
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                $$(".nav-links a").forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        ["about", "projects", "wish", "letter"].forEach(id => spy.observe(document.getElementById(id)));
    }

    /* ---------- Scroll reveal ---------- */
    if ("IntersectionObserver" in window && !reduce) {
        const rv = new IntersectionObserver((entries, o) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); o.unobserve(e.target); } });
        }, { threshold: 0.12 });
        $$(".reveal").forEach(el => rv.observe(el));
    } else {
        $$(".reveal").forEach(el => el.classList.add("visible"));
    }

    /* ---------- Photo fallbacks (shows a soft placeholder if an image is missing) ---------- */
    $$("img[data-fallback]").forEach(img => {
        const holder = img.closest(".ph");
        if (!holder) return;
        const mark = () => {
            const ok = img.complete && img.naturalWidth > 0;
            holder.classList.toggle("has-image", ok);
            holder.classList.toggle("no-photo", img.complete && !ok);
        };
        img.addEventListener("load", mark);
        img.addEventListener("error", () => { holder.classList.remove("has-image"); holder.classList.add("no-photo"); });
        mark();
    });

    /* ---------- Project filters ---------- */
    const chips = $$(".chip");
    const cards = $$(".project-card");
    chips.forEach(chip => chip.addEventListener("click", () => {
        const f = chip.dataset.filter;
        chips.forEach(c => c.classList.toggle("is-on", c === chip));
        cards.forEach(card => {
            const show = f === "all" || card.dataset.group === f;
            card.classList.toggle("is-hidden", !show);
        });
    }));

    /* ---------- Wish garden ---------- */
    const garden = $("#garden"), empty = $("#gardenEmpty");
    const counter = $("#wishCounter"), heroCount = $("#heroCount");
    const input = $("#wishInput");
    const flowers = ["✿", "❀", "✳", "✦", "☼", "❋"];
    const colors = ["#c76c4c", "#71856a", "#594052", "#d9a93a", "#b25a7a"];
    const MAX = 36;
    let total = 0;

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    function plant(text) {
        total++;
        counter.textContent = `Wishes planted: ${total}`;
        heroCount.textContent = total;
        empty.hidden = true;

        const bloom = document.createElement("span");
        bloom.className = "bloom";
        bloom.style.setProperty("--x", (5 + Math.random() * 88) + "%");
        bloom.style.setProperty("--h", (50 + Math.random() * 120) + "px");
        bloom.style.setProperty("--delay", (-Math.random() * 4) + "s");

        const flower = document.createElement("button");
        flower.type = "button";
        flower.className = "bloom__flower";
        flower.textContent = pick(flowers);
        flower.style.setProperty("--size", (24 + Math.random() * 16) + "px");
        flower.style.setProperty("--c", pick(colors));
        flower.setAttribute("aria-label", text ? "Wish: " + text : "A wish flower");
        bloom.appendChild(flower);

        if (text) {
            const tip = document.createElement("span");
            tip.className = "bloom__tip";
            tip.textContent = text; // plain text only, never HTML
            bloom.appendChild(tip);
            flower.addEventListener("click", e => {
                e.stopPropagation();
                $$(".bloom.is-open").forEach(b => b !== bloom && b.classList.remove("is-open"));
                bloom.classList.toggle("is-open");
            });
        }

        garden.appendChild(bloom);

        const all = $$(".bloom", garden);
        if (all.length > MAX) all[0].remove();
    }

    $("#wishForm").addEventListener("submit", e => {
        e.preventDefault();
        plant(input.value.trim());
        input.value = "";
    });
    document.addEventListener("click", () => $$(".bloom.is-open").forEach(b => b.classList.remove("is-open")));
})();
