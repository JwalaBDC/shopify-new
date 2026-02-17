class Header {
    constructor(element) {
        this.element = element;
        this.menuButton = this.element.querySelector(".ui-header__search-btn");
        this.searchCancelBtn = this.element.querySelector(".ui-header__search-cancel");
        this.searchFetchButton = this.element.querySelector(".ui-header__search-searchBtn");
        this.searchButton = this.element.querySelector(".ui-header__search-btn");
        this.searchCloseButton = this.element.querySelector(".ui-header__search-btn--close");
        this.searchDialoge = this.element.querySelector(".ui-header__search");
        this.searchContainer = this.searchDialoge.querySelector(".ui-header__search-container");
        this.searchForm = this.searchContainer.querySelector(".ui-header__search-form");
        this.searchInput = this.searchForm.querySelector(".ui-header__search-input");
        this.searchClear = this.searchForm.querySelectorAll(".ui-header__search--clear");
        this.quickLinks = this.searchContainer.querySelector(".ui-header__search-quick");
        this.quickLinkListItems = this.quickLinks.querySelectorAll(".ui-header__search-quick-links-btn");
        this.searchInputIcon = this.element.querySelector(".ui-header__search-icon");
        this.headerNav = this.element.querySelector(".ui-header__nav");
        this.regionDropdown = this.element.querySelector(".ui-header__rhs .ui-header__region");
        this.regionSeperator = this.element.querySelector(".ui-header__rhs-separator");
        this.searchWhiteBackdrop = document.querySelector(".ui-header__search-fullwidth-bg");
        this.regionSubDropdown = this.regionDropdown.querySelectorAll('.has-submenu');

        this.headerHeight = this.element ? this.element.offsetHeight : 0;

        this.addListener();
    }

    toggleSearch(e) {
        e.preventDefault();
        const isOpen = this.element.classList.contains("ui-header--search-open");
        if (!isOpen) {
            this.element.classList.remove("is-closing");
            this.element.classList.add("ui-header--search-open");
            this.element.classList.remove("ui-header--transparent");
            this.searchInput.focus();
            document.documentElement.classList.add("is-search-menu-open");
            this.animateSearchWhiteBackdropEntry();

            /* header navegation hide */
            gsap.fromTo(
                [this.headerNav, this.regionSeperator, this.regionDropdown],
                {
                    opacity: 1,
                    visibility: "visible",
                },
                {
                    opacity: 0,
                    visibility: "hidden",
                    duration: 0.2,
                    ease: "emphasized-decelerate",
                }
            );

            this.animateSearchQuickLinks();
        } else {
            this.element.classList.add("is-closing");
            this.element.classList.add("ui-header--transparent");
            this.animateSearchWhiteBackdropExit();
            document.documentElement.classList.remove("is-search-menu-open");

            /* header navegation show */
            gsap.fromTo(
                [this.headerNav, this.regionSeperator, this.regionDropdown],
                {
                    opacity: 0,
                    visibility: "hidden",
                },
                {
                    opacity: 1,
                    visibility: "visible",
                    duration: 0.2,
                    ease: "emphasized-decelerate",
                }
            );
        }
    }

    /* Animate Search Menu White Backdrop Entry */
    animateSearchWhiteBackdropEntry() {
        this.searchContainer.style.opacity = "1";
        gsap.fromTo(
            this.searchContainer,
            {
                opacity: 0,
                height: 0,
            },
            {
                opacity: 1,
                height: this.searchContainer.scrollHeight,
                duration: 0.2,
                ease: "emphasized-decelerate",
            }
        );
        window.disableScroll();
    }
    /* Animate Search Menu White Backdrop Exit */
    animateSearchWhiteBackdropExit() {
        this.searchContainer.style.opacity = "1";
        gsap.to(this.searchContainer, {
            height: 0,
            duration: 0.2,
            ease: "emphasized",
            onComplete: () => {
                this.element.classList.remove("ui-header--search-open");
                window.enableScroll();
                this.searchClear.forEach((el) => {
                    el.click();
                });
            },
        });
        window.enableScroll();
    }

    animateSearchQuickLinks() {
        if (this.quickLinkItemsAnimationTl) {
            this.quickLinkItemsAnimationTl.kill();
        }

        let tl = gsap.timeline();

        tl.fromTo(
            this.quickLinkListItems,
            {
                opacity: 0,
                y: -8,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: 0.03,
                ease: "standard-decelerate",
                overwrite: true,
            }
        );
    }

    //please do not touch this function. it's being called from the menu
    closeSearch() {
        this.element.classList.remove("ui-header--search-open");
        this.searchClear.forEach((el) => {
            el.click();
        });
    }
    cancelSearch() {
        window.enableScroll();
        document.documentElement.classList.remove("is-search-menu-open");
        this.element.classList.remove("ui-header--search-open");
        this.searchClear.forEach((el) => {
            el.click();
        });

        /* header navegation show */
        gsap.fromTo(
            [this.headerNav, this.regionSeperator, this.regionDropdown],
            {
                opacity: 0,
                visibility: "hidden",
            },
            {
                opacity: 1,
                visibility: "visible",
                duration: 0.2,
                ease: "emphasized-decelerate",
            }
        );
    }

    sanitizeInput(value) {
        return value.replace(/\s+/g, " ").trim();
    }

    handleSearch(e) {
        // Sanitize the input value to allow only one space between words
        let value = e.currentTarget.value;
        value = value.replace(/\s{2,}/g, " "); // Replace multiple spaces with a single space

        // Update the input field with the sanitized value
        e.currentTarget.value = value;

        // Update the search form state
        this.searchForm.classList.toggle("is-filled", value !== "");

        if (window.innerWidth > 768) {
            this.searchInputIcon.style.display = value === "" ? "block" : "none";
        }

        this.quickLinks.style.display = "block";
    }

    handleSearchSubmit(e) {
        if (e) e.preventDefault();

        let rawSearchValue = this.searchInput.value.trim();
        if (rawSearchValue === "") return;

        //  Decode URL-encoded characters and strip HTML tags
        let decodedSearchValue = decodeURIComponent(rawSearchValue);
        let searchValue = this.stripHTMLTagsRemove(decodedSearchValue).trim();

        if (searchValue === "") return;

        //  Update input field with sanitized value
        this.searchInput.value = searchValue;

        //  Redirect with sanitized search value
        this.updateURIWithParams({ search: searchValue });
    }

    updateURIWithParams(params) {
        const currentUrl = window.location;
        const urlParams = new URLSearchParams(params);

        let basePath = "";
        let regionRegex;

        // Define environment-specific base paths and regex for region detection
        if (currentUrl.hostname === "localhost") {
            basePath = "/tata-chemicals/dist";
            // Matches '/dist/' followed by a segment (the region)
            regionRegex = /\/dist\/([^\/]+)/;
        } else if (currentUrl.hostname === "bdcdev.in") {
            basePath = "/work/tata-chemicals.com/latest";
            // Matches '/latest/' followed by a segment (the region)
            regionRegex = /\/latest\/([^\/]+)/;
        } else {
            basePath = "";
            // Matches the start of the path '/' followed by a segment (the region)
            regionRegex = /^\/([^\/]+)/;
        }

        // Attempt to extract the region from the current pathname
        const regionMatch = currentUrl.pathname.match(regionRegex);
        let region = "";

        // Check if a match was found and if it's a valid region segment (i.e., not 'global-search')
        // if (regionMatch && regionMatch[1] && regionMatch[1] !== "global-search") {
        // 	region = regionMatch[1];
        // }
        if (
            regionMatch &&
            regionMatch[1] &&
            ["north-america", "kenya","europe"].includes(regionMatch[1])
        ) {
            region = regionMatch[1];
        }


        const regionPath = region ? `/${region}` : "";
        const newUrl = `${currentUrl.origin}${basePath}${regionPath}/global-search?${urlParams.toString()}`;

        // Redirect to the new URL to perform the search
        window.location.href = newUrl;
    }

    stripHTMLTagsRemove(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    handleClearSearch(e) {
        e.preventDefault();

        this.searchInput.value = "";
        this.searchForm.classList.remove("is-filled");
        this.searchDialoge.classList.remove("ui-header__search--no-result", "ui-header__search--result");
        this.quickLinks.style.display = "block";
        this.searchInputIcon.style.display = "block";
    }

    handleCloseOutside(event) {
        const isOpen = this.element.classList.contains("ui-header--search-open");
        if (!this.searchContainer.contains(event.target) && isOpen) {
            this.toggleSearch(event);
        }
    }

    onScroll() {
        if (window.scrollY > 0) {
            this.element.classList.add("allow-transitions", "has-scrolled");
        } else {
            this.element.classList.remove("has-scrolled");
        }
        this.element.classList[window.scrollY > this.element.offsetHeight ? "add" : "remove"]("ui-header--sticky");

        if (window.innerWidth > 1024) {
            if (!document.documentElement.classList.contains("is-flyout-menu-open")) {
                this.element.classList[window.scrollY > 0 ? "remove" : "add"]("ui-header--transparent");
            }

            if (document.documentElement.classList.contains("is-search-menu-open")) {
                this.element.classList[window.scrollY > 0 ? "add" : "remove"]("ui-header--transparent");
            }
        }
    }

    handleSticky() {
        const scrollPosition = window.scrollY;

        if (this.lastScrollPosition === undefined) {
            this.lastScrollPosition = scrollPosition;
        }
        const isScrollingDown = scrollPosition > this.lastScrollPosition;
        const isScrollingUp = scrollPosition < this.lastScrollPosition;

        if (isScrollingDown) {
            this.element.classList.add("ui-header--hide");
        } else if (isScrollingUp) {
            this.element.classList.remove("ui-header--hide");
        }
        this.lastScrollPosition = scrollPosition;
    }

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    toggleRegionDropdown(e) {
        e.preventDefault();
        const subdrop = e.currentTarget;
        const submenu = subdrop.querySelector(".ui-header__region-submenu");
        const dropdown = subdrop.closest("[dropdown-popup]");
        const isOpen = subdrop.classList.contains("is-open");
        const dropdownHeight = dropdown.offsetHeight;
        const submenuHeight = submenu.scrollHeight;
        let subMenuItems = submenu.querySelectorAll(".ui-header__region-dropdown-link");

        subMenuItems.forEach((item) => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        });

        if (isOpen) {
            gsap.to(submenu, {
                duration: 0.4,
                height: 0,
                opacity: 0,
                autoAlpha: 0,
                onUpdate: () => {
                    dropdown.style.height = `${dropdownHeight + submenu.offsetHeight}px`;
                },
                onComplete: () => {
                    subdrop.classList.remove("is-open");
                    dropdown.style.height = "auto";
                }
            });
        } else {
            subdrop.classList.add("is-open");
            gsap.set(submenu, { height: 0, opacity: 0 });

            gsap.to(submenu, {
                duration: 0.4,
                height: submenuHeight,
                opacity: 1,
                autoAlpha: 1,
                ease: "power2.out",
                onUpdate: () => {
                    dropdown.style.height = `${dropdownHeight + submenu.offsetHeight}px`;
                },
                onComplete: () => {
                    dropdown.style.height = "auto";
                }
            });
        }
    }

    addListener() {
        this.onScroll();
        window.addEventListener("scroll", this.onScroll.bind(this));
        this.searchContainer.addEventListener(
            "touchstart",
            (e) => {
                const isOpen = this.element.classList.contains("ui-header--search-open");
                if (isOpen) this.searchInput.blur();
            },
            {
                passive: true,
            }
        );
        this.searchButton.addEventListener("click", this.toggleSearch.bind(this));
        this.searchCloseButton.addEventListener("click", this.toggleSearch.bind(this));
        this.searchCancelBtn.addEventListener("click", this.cancelSearch.bind(this));
        this.searchInput.addEventListener("input", this.handleSearch.bind(this));
        this.searchInput.addEventListener("paste", this.handleSearch.bind(this));
        this.searchClear.forEach((el) => {
            el.addEventListener("click", this.handleClearSearch.bind(this));
        });
        this.searchDialoge.addEventListener("click", this.handleCloseOutside.bind(this));

        this.searchFetchButton.addEventListener("click", this.handleSearchSubmit.bind(this));

        // Handle 'Enter' key
        this.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.handleSearchSubmit(e);
            }
        });
        this.regionSubDropdown.forEach((el) => el.addEventListener("click", this.toggleRegionDropdown.bind(this)));
    }
}

const headerElem = document.querySelector("header");
if (headerElem) {
    window.header = new Header(headerElem);
}