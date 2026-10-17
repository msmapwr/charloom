// Animation is progressive enhancement: nothing is hidden until the local engine is ready.
export async function initMotion() {
    // The upstream distribution is UMD and must run as a classic script.
    for (const name of ["gsap.min.js", "ScrollTrigger.min.js"]) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = new URL(`./vendor/${name}`, import.meta.url).href;
            script.onload = () => resolve(undefined);
            script.onerror = () => reject(new Error(`Cannot load ${name}`));
            document.head.append(script);
        });
    }
    const gsap = globalThis["gsap"];
    const ScrollTrigger = globalThis["ScrollTrigger"];
    gsap.registerPlugin(ScrollTrigger);
    const root = document.documentElement;
    const hero = document.querySelector(".hero");
    const heading = document.querySelector(".hero-copy h1");
    if (heading) {
        heading.setAttribute("aria-label", heading.textContent);
        const letters = Array.from(heading.textContent, (letter) => {
            const span = document.createElement("span");
            span.className = "motion-letter";
            span.setAttribute("aria-hidden", "true");
            span.textContent = letter;
            return span;
        });
        heading.replaceChildren(...letters);
    }
    if (hero) {
        const weave = document.createElement("div");
        weave.className = "motion-weave";
        weave.setAttribute("aria-hidden", "true");
        for (let row = 0; row < 7; row++) {
            const thread = document.createElement("span");
            thread.textContent = ["· ─ ┼ ─ · ─ ┼ ─ ", "░ ▒ ▓ █ ▓ ▒ ░ · "][
                row % 2
            ].repeat(3);
            weave.append(thread);
        }
        hero.prepend(weave);
    }
    const media = gsap.matchMedia();
    media.add(
        {
            desktop: "(min-width: 1001px)",
            reduce: "(prefers-reduced-motion: reduce)",
            contrast: "(forced-colors: active)",
            fine: "(hover: hover) and (pointer: fine)",
            all: "all",
        },
        (context) => {
            const { desktop, reduce, contrast, fine } = context.conditions;
            if (reduce || contrast) {
                root.dataset.motion = "reduced";
                return;
            }
            root.dataset.motion = "ready";
            const events = new AbortController();
            const distance = desktop ? 48 : 18;
            const intro = gsap.timeline({
                defaults: { duration: 0.9, ease: "power3.out" },
            });
            document.addEventListener("focusin", () => intro.progress(1), {
                signal: events.signal,
            });
            // Restored scroll positions and deep links must never replay a hidden hero.
            if (scrollY < 80 && !location.hash) {
                if (heading)
                    intro.from(
                        ".motion-letter",
                        {
                            yPercent: (index) => (index % 2 ? -110 : 110),
                            rotation: (index) => (index % 2 ? -6 : 6),
                            opacity: 0,
                            stagger: 0.045,
                            clearProps: "all",
                        },
                        0,
                    );
                const copy = document.querySelectorAll(
                    ".hero-copy > p, .hero-copy > .local-note, .hero-copy > .actions, .history-hero > :not(h1)",
                );
                if (copy.length)
                    intro.from(
                        copy,
                        { y: 22, opacity: 0, stagger: 0.08, clearProps: "all" },
                        0.22,
                    );
                const title = document.querySelector(".history-hero h1");
                if (title)
                    intro.from(
                        title,
                        { y: 34, opacity: 0, clearProps: "all" },
                        0,
                    );
                const preview = document.querySelector(".hero-figure");
                if (preview)
                    intro.from(
                        preview,
                        {
                            y: distance,
                            rotationY: desktop ? -9 : 0,
                            rotationX: desktop ? 5 : 0,
                            transformPerspective: 1200,
                            scale: 0.94,
                            opacity: 0,
                            duration: 1.35,
                            clearProps: "all",
                        },
                        0.12,
                    );
                const threads = document.querySelectorAll(".motion-weave span");
                if (threads.length)
                    intro.from(
                        threads,
                        {
                            x: (index) => (index % 2 ? -70 : 70),
                            opacity: 0,
                            stagger: 0.06,
                            duration: 1.2,
                            clearProps: "all",
                        },
                        0.2,
                    );
            }
            // Do not animate documentation paragraphs, dynamic logs or gallery controls.
            const groups = document.querySelectorAll(
                ".section-heading, .example, .feature-grid, .workflow-grid, .download-panel, .gallery-work, .guide-section, .download-section, .format-section, .roadmap-section",
            );
            groups.forEach((group) => {
                if (group.getBoundingClientRect().top < innerHeight * 0.92)
                    return;
                const children = group.matches(".feature-grid, .workflow-grid")
                    ? Array.from(group.children)
                    : [group];
                const reveal = gsap.from(children, {
                    y: distance,
                    opacity: 0,
                    duration: desktop ? 0.85 : 0.55,
                    stagger: 0.09,
                    ease: "power3.out",
                    clearProps: "all",
                    scrollTrigger: {
                        trigger: group,
                        start: "top 92%",
                        once: true,
                    },
                });
                // Keyboard and find-in-page navigation expose content immediately.
                group.addEventListener("focusin", () => reveal.progress(1), {
                    signal: events.signal,
                });
                group.addEventListener(
                    "beforematch",
                    () => reveal.progress(1),
                    { signal: events.signal },
                );
                addEventListener("hashchange", () => reveal.progress(1), {
                    signal: events.signal,
                });
            });
            if (desktop && hero) {
                gsap.to(".motion-weave", {
                    y: 100,
                    x: -45,
                    ease: "none",
                    scrollTrigger: {
                        trigger: hero,
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.6,
                    },
                });
                gsap.to(".hero-figure .app-frame", {
                    y: -42,
                    ease: "none",
                    scrollTrigger: {
                        trigger: hero,
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.6,
                    },
                });
                document
                    .querySelectorAll(".example-figure")
                    .forEach((figure) => {
                        gsap.fromTo(
                            figure.querySelector("img"),
                            { scale: 1.06 },
                            {
                                scale: 1,
                                ease: "none",
                                scrollTrigger: {
                                    trigger: figure,
                                    start: "top bottom",
                                    end: "bottom top",
                                    scrub: 0.5,
                                },
                            },
                        );
                    });
            }
            const frame = document.querySelector(".hero-figure .app-frame");
            if (desktop && fine && frame) {
                const xTo = gsap.quickTo(frame, "rotationX", {
                    duration: 0.7,
                    ease: "power3.out",
                });
                const yTo = gsap.quickTo(frame, "rotationY", {
                    duration: 0.7,
                    ease: "power3.out",
                });
                gsap.set(frame, { transformPerspective: 1200 });
                let bounds;
                frame.addEventListener(
                    "pointerenter",
                    () => {
                        bounds = frame.getBoundingClientRect();
                    },
                    { signal: events.signal },
                );
                frame.addEventListener(
                    "pointermove",
                    (event) => {
                        if (!bounds) return;
                        const pointer = /** @type {PointerEvent} */ (event);
                        xTo(
                            gsap.utils.clamp(
                                -3,
                                3,
                                (0.5 -
                                    (pointer.clientY - bounds.top) /
                                        bounds.height) *
                                    6,
                            ),
                        );
                        yTo(
                            gsap.utils.clamp(
                                -3,
                                3,
                                ((pointer.clientX - bounds.left) /
                                    bounds.width -
                                    0.5) *
                                    6,
                            ),
                        );
                    },
                    { signal: events.signal },
                );
                frame.addEventListener(
                    "pointerleave",
                    () => {
                        xTo(0);
                        yTo(0);
                    },
                    { signal: events.signal },
                );
            }
            const refresh = () => ScrollTrigger.refresh();
            document.querySelectorAll("img").forEach((image) => {
                if (!image.complete)
                    image.addEventListener("load", refresh, {
                        once: true,
                        signal: events.signal,
                    });
            });
            addEventListener("history-refreshed", refresh, {
                signal: events.signal,
            });
            document.addEventListener("toggle", refresh, {
                capture: true,
                signal: events.signal,
            });
            document
                .querySelector("#gallery-filters")
                ?.addEventListener("click", refresh, { signal: events.signal });
            document.fonts.ready.then(() => {
                if (!events.signal.aborted) refresh();
            });
            return () => events.abort();
        },
    );
}
