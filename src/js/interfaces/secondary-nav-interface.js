class SecondaryNavInterface extends HTMLElement {
	constructor() {
		super();
		this.cards = [...this.querySelectorAll("[nav-slider-card]")];
		this.cardLists = this.querySelector("[nav-slider-card-list]");
		this.navButton = this.querySelector(".ui-secondary-nav__action");
		// this.sections = [...document.querySelectorAll("main > section[id]")];
		this.sections = [...document.querySelectorAll("main > section[id] , [modal-interface-content] > section[id]")];
		this.sliderNavs = [...this.querySelectorAll("[nav-slider-nav]")];
		this.prevBtns = [...this.querySelectorAll("[nav-slider-prev]")];
		this.nextBtns = [...this.querySelectorAll("[nav-slider-next]")];
		this.linkClickHandler = this.createLinkClickHandler();
		this.prevClickHandler = this.createPrevClickHandler();
		this.nextClickHandler = this.createNextClickHandler();
		this.secondaryNav = document.querySelector("secondary-nav-interface");
		this.header = document.querySelector("header");
		this.headerHeight = this.header ? this.header.offsetHeight : 0;
		// this.isScrolling = false;
		// requestAnimationFrame(this.animateHeader.bind(this));
		// this.cards.forEach((card) => card.setAttribute("aria-hidden", true));
		this.currentSectionInView = null;

		if (window.innerWidth < 1024 && this.navButton) {
			this.nextBtns.forEach((btn) => {
				btn.style.right = this.navButton.getBoundingClientRect().width + 10 + "px";
			});
		}

		// console.log(":: SecondaryNavInterface ::");
	}

	setupObservers() {
		this.sectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;
					const sectionId = target.id;
					const navLink = this.cards.find((card) => card.querySelector("[nav-link]").getAttribute("href") === `#${sectionId}`);
					if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
						this.setLinkActive(navLink);
					} else {
						this.removeLinkActive(navLink);
					}
				});
			},
			{
				root: null,
				threshold: 0.3,
			}
		);

		this.cardObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;

					if (target.hasAttribute("nav-slider-card")) {
						const isVisible = entry.isIntersecting;

						// Set aria-hidden based on visibility
						target.setAttribute("aria-hidden", isVisible ? "false" : "true");

						// Handle tabindex for focusable elements
						const focusableElements = target.querySelectorAll("a, button, [tabindex]");
						focusableElements.forEach((element) => {
							if (isVisible) {
								element.removeAttribute("tabindex"); // Remove tabindex when visible
							} else {
								element.setAttribute("tabindex", "-1"); // Set tabindex="-1" when hidden
							}
						});

						this.setSliderBtnState();
					}

					if (target.hasAttribute("nav-slider-card-list")) {
						target.classList.toggle("is-visible", entry.isIntersecting);
						this.setSliderNavVisibility();
					}
				});
			},
			{
				root: document.documentElement,
				threshold: 0.75,
			}
		);

		this.sections.forEach((section) => this.sectionObserver.observe(section));

		this.cards.forEach((card) => this.cardObserver.observe(card));
		this.cardObserver.observe(this.cardLists);
	}

	removeObservers() {
		if (this.sectionObserver) {
			this.sections.forEach((section) => this.sectionObserver.unobserve(section));
			this.sectionObserver.disconnect();
			this.sectionObserver = null;
		}

		if (this.cardObserver) {
			this.cards.forEach((card) => this.cardObserver.unobserve(card));
			this.cardObserver.unobserve(this.cardLists);
			this.cardObserver.disconnect();
			this.cardObserver = null;
		}
	}

	setLinkActive(link) {
		if (!link) return;
		this.cards.forEach((card) => card.classList.remove("is-active"));
		const card = link.closest("[nav-slider-card]");

		if (card) {
			card.classList.add("is-active");
			this.smoothScrollTo(card);
			this.setSliderBtnState();
		}
	}

	removeLinkActive(link) {
		if (link) {
			link.closest("[nav-slider-card]").classList.remove("is-active");
		}
	}

	setSliderBtnState() {
		const scrollLeft = this.cardLists.scrollLeft;
		const cardListsWidth = this.cardLists.offsetWidth;
		const scrollWidth = this.cardLists.scrollWidth;
		const lastCardVisible = scrollLeft + cardListsWidth >= scrollWidth - 2;
		this.prevBtns.forEach((btn) => (btn.disabled = scrollLeft <= 1));
		this.nextBtns.forEach((btn) => (btn.disabled = lastCardVisible));
	}

	setSliderNavVisibility() {
		const allCardsVisible = this.cards.every((card) => card.getAttribute("aria-hidden") === "false");
		this.sliderNavs.forEach((nav) => (nav.hidden = allCardsVisible));
	}

	smoothScrollTo(element) {
		const parent = this.cardLists;
		const index = this.cards.indexOf(element);
		const scrollPosition = element.offsetLeft;
		parent.scrollTo({
			left: scrollPosition,
			behavior: "smooth",
		});
	}

	createNextClickHandler() {
		return () => {
			const visibleIndex = this.cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
			console.log("next", this.cards[visibleIndex + 1]);

			if (visibleIndex < this.cards.length - 1) {
				this.smoothScrollTo(this.cards[visibleIndex + 1]);
			}
		};
	}

	createPrevClickHandler() {
		return () => {
			const visibleIndex = this.cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
			console.log("prev", this.cards[visibleIndex - 1]);
			if (visibleIndex > 0) {
				this.smoothScrollTo(this.cards[visibleIndex - 1]);
			}
		};
	}

	onScroll() {
		const scrollPosition = window.scrollY;

		this.handleSticky();

		// if (this.isClick) return;
		this.cards.forEach((card) => {
			card.classList.remove("is-active");
			const link = card.querySelector("[nav-link]");
			if (!link.href) return;
			const targetHash = new URL(link.href).hash;

			const section = document.querySelector(targetHash);
			if (section) {
				const sectionTop = section.offsetTop - this.header.offsetHeight; // Adjust this offset as needed
				const sectionBottom = sectionTop + section.offsetHeight;
				if (scrollPosition > sectionTop && scrollPosition < sectionBottom) {
					card.classList.add("is-active");
					this.cardLists.scrollLeft = card.offsetLeft - 12;
				}
			}
		});

		this.setSliderBtnState();
	}

	handleSticky() {
		const scrollPosition = window.scrollY;
		this.secondaryOffsetTop = this.getBoundingClientRect().top;

		// Initialize last scroll position if not set
		if (this.lastScrollPosition === undefined) {
			this.lastScrollPosition = scrollPosition;
		}

		// Determine scroll direction
		const isScrollingDown = scrollPosition > this.lastScrollPosition;
		const isScrollingUp = scrollPosition < this.lastScrollPosition;

		if (isScrollingDown) {
			// Hide the header when scrolling down
			if (scrollPosition >= this.secondaryOffsetTop + window.scrollY || this.secondaryOffsetTop <= 0) {
				this.header.classList.add("ui-header--hide");
			}

			// Adjust header position based on its height and offset
			if (this.headerHeight > this.secondaryOffsetTop) {
				const yValue = this.headerHeight - this.secondaryOffsetTop;
				this.header.style.transform = `translate(0px, -${yValue}px)`;
			} else {
				this.header.removeAttribute("style");
			}
			this.secondaryNav.style.top = `-1px`;
		} else if (isScrollingUp) {
			this.header.classList.remove("ui-header--hide");

			if (this.headerHeight < this.secondaryOffsetTop) {
				const yValue = this.headerHeight - this.secondaryOffsetTop;
				this.header.style.transform = `translate(0px, 0px)`;
			} else {
				this.header.removeAttribute("style");
			}
			this.secondaryNav.style.top = `${this.headerHeight - 1}px`;
			this.header.style.transition = "transform 0.15s ease-in-out";
			this.secondaryNav.style.transition = "top 0.15s ease-in-out";
		}

		// Update last scroll position
		this.lastScrollPosition = scrollPosition;
	}

	// handleSticky2() {
	// 	const scrollPosition = window.scrollY;
	// 	this.secondaryOffsetTop = this.getBoundingClientRect().top;

	// 	// if(!this.isScrolling) return;
	// 	const isHide =
	// 		scrollPosition >= this.secondaryOffsetTop + window.scrollY ||
	// 		this.secondaryOffsetTop <= 0;
	// 	this.header.classList[isHide ? "add" : "remove"]("ui-header--hide");
	// 	if (this.headerHeight > this.secondaryOffsetTop) {
	// 		const yValue = this.headerHeight - this.secondaryOffsetTop;
	// 		this.header.style.transform = `translate(0px , -${yValue}px)`;
	// 	} else {
	// 		this.header.removeAttribute("style");
	// 	}
	// 	this.isScrolling = false;

	// 	// requestAnimationFrame(this.animateHeader.bind(this));
	// }

	debounce(func, wait, immediate) {
		let timeout;
		return function executedFunction(...args) {
			const context = this;
			const later = () => {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	createLinkClickHandler() {
		return (e) => {
			e.preventDefault();
			//   const targetSection = document.querySelector(
			//     e.target.getAttribute("href")
			//   );
			//   if (targetSection) {
			//     setTimeout(() => {
			//       targetSection.scrollIntoView({
			//         behavior: "smooth",
			//         block: "start",
			//         inline: "start",
			//       });
			//     }, 10);
			//     this.setLinkActive(e.target);
			//   }
			const sectionID = e.target.getAttribute("href");
			const section = document.querySelector(`${sectionID}`);

			if (!section) return;
			var sectionOffset = section.getBoundingClientRect().top;

			let meagMenu = document.querySelector(".ui-flyout-menu__level-nav.is-visible");
			let checkerMenu = meagMenu ? this.header.offsetHeight - 60 : this.header.offsetHeight;

			// Scroll to the section
			var offsetPosition = sectionOffset + window.pageYOffset - checkerMenu;
			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		};
	}

	connectedCallback() {
		this.setupObservers();
		window.addEventListener("scroll", this.onScroll.bind(this));
		this.cardLists.addEventListener("scroll", this.setSliderBtnState.bind(this));

		this.cards.forEach((card) => {
			const cardLink = card.querySelector("[nav-link]");
			if (cardLink) {
				cardLink.addEventListener("click", this.linkClickHandler);
			}
		});

		this.prevBtns.forEach((btn) => {
			btn.addEventListener("click", this.prevClickHandler);
		});

		this.nextBtns.forEach((btn) => {
			btn.addEventListener("click", this.nextClickHandler);
		});
	}

	disconnectedCallback() {
		this.removeObservers();
		window.removeEventListener("scroll", this.onScroll.bind(this));
		this.cardLists.removeEventListener("scroll", this.setSliderBtnState.bind(this));

		this.cards.forEach((card) => {
			const cardLink = card.querySelector("[nav-link]");
			if (cardLink) {
				cardLink.removeEventListener("click", this.linkClickHandler);
			}
		});

		this.prevBtns.forEach((btn) => {
			btn.removeEventListener("click", this.prevClickHandler);
		});

		this.nextBtns.forEach((btn) => {
			btn.removeEventListener("click", this.nextClickHandler);
		});
	}
}

customElements.define("secondary-nav-interface", SecondaryNavInterface);
