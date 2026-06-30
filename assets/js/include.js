/* Loads modular HTML partials and then initializes the original Strata scripts. */
(function () {
    const includes = Array.from(document.querySelectorAll("[data-include]"));

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    function bindSmoothScroll() {
        if (!window.jQuery) return;

        $(document).on("click", "a", function (event) {
            if (this.hash !== "" && $(this.hash).length) {
                event.preventDefault();

                const hash = this.hash;

                $("html, body").animate({
                    scrollTop: $(hash).offset().top
                }, 800, function () {
                    window.location.hash = hash;
                });
            }
        });
    }

    function initTimelineToggle() {
        const button = document.getElementById("toggleTimeline");
        const moreTimeline = document.getElementById("moreTimeline");

        if (!button || !moreTimeline) return;

        button.addEventListener("click", function () {
            moreTimeline.classList.toggle("timeline-hidden");

            button.textContent = moreTimeline.classList.contains("timeline-hidden")
                ? "See more"
                : "See less";
        });
    }

    function initPublicationControls() {
        const filterButtons = document.querySelectorAll(".pub-filter");
        const yearBlocks = document.querySelectorAll(".pub-year-block");

        function applyDefaultLimit() {
            yearBlocks.forEach(function (block) {
                const cards = Array.from(block.querySelectorAll(".pub-card"));
                const button = block.querySelector(".pub-show-more");

                cards.forEach(function (card, index) {
                    card.classList.toggle("is-hidden", index >= 2);
                });

                if (button) {
                    button.style.display = cards.length > 2 ? "inline-block" : "none";
                    button.textContent = "Show more publications";
                }
            });
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const filter = button.getAttribute("data-filter");

                filterButtons.forEach(function (btn) {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                if (filter === "all") {
                    applyDefaultLimit();
                    return;
                }

                document.querySelectorAll(".pub-card").forEach(function (card) {
                    const type = card.getAttribute("data-type");
                    card.classList.toggle("is-hidden", type !== filter);
                });

                document.querySelectorAll(".pub-show-more").forEach(function (btn) {
                    btn.style.display = "none";
                });
            });
        });

        document.querySelectorAll(".pub-show-more").forEach(function (button) {
            button.addEventListener("click", function () {
                const block = button.closest(".pub-year-block");
                const cards = Array.from(block.querySelectorAll(".pub-card"));
                const isExpanded = button.textContent.includes("fewer");

                cards.forEach(function (card, index) {
                    card.classList.toggle("is-hidden", !isExpanded && index >= 2);
                });

                button.textContent = isExpanded
                    ? "Show more publications"
                    : "Show fewer publications";
            });
        });

        applyDefaultLimit();
    }

    Promise.all(includes.map(function (el) {
        const file = el.getAttribute("data-include");

        return fetch(file)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Unable to load " + file);
                }

                return response.text();
            })
            .then(function (html) {
                el.outerHTML = html;
            });
    }))
        .then(function () {
            initTimelineToggle();
            initPublicationControls();

            return loadScript("assets/js/jquery.min.js")
                .then(function () { return loadScript("assets/js/jquery.poptrox.min.js"); })
                .then(function () { return loadScript("assets/js/browser.min.js"); })
                .then(function () { return loadScript("assets/js/breakpoints.min.js"); })
                .then(function () { return loadScript("assets/js/util.js"); })
                .then(function () { return loadScript("assets/js/main.js"); })
                .then(function () { return loadScript("assets/js/jquery.scrolly.min.js"); })
                .then(bindSmoothScroll);
        })
        .catch(function (error) {
            console.error(error);
        });
})();
