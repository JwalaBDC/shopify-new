/* class: SliderInterface */
class SliderInterface extends HTMLElement {
	constructor() {
		super();
		this.cardLists = [...this.querySelectorAll("[slider-card-list]")];
		this.cards = [...this.querySelectorAll("[slider-card]")];
		this.sliderNavs = [...this.querySelectorAll("[slider-nav]")];
		this.prevBtns = [...this.querySelectorAll("[slider-prev]")];
		this.nextBtns = [...this.querySelectorAll("[slider-next]")];
		this.header = document.querySelector("header");
		this.headerheight = parseInt((this.header && this.header.offsetHeight) || 0);
		this.prevClickHandler = this.createPrevClickHandler();
		this.nextClickHandler = this.createNextClickHandler();
		this.scrollHandler = this.createScrollHandler();
		this.sliderScrollIndicatorTracks = [...this.querySelectorAll("[slider-scroll-indicator-track]")];
		this.sliderScrollIndicatorThumbs = [...this.querySelectorAll("[slider-scroll-indicator-thumb]")];
		this.tables = [...this.querySelectorAll("table[slider-card]")];
		this.setupTableSlider();
	}

	setupTableSlider() {
		const parent = document.querySelector("slider-interface[slider-table]");
		if (!parent) return;

		const cardList = parent.querySelector("[slider-card-list]");
		const prevBtn = parent.querySelector("[slider-prev]");
		const nextBtn = parent.querySelector("[slider-next]");
		const sliderNav = parent.querySelector("[slider-nav]");

		setTimeout(() => {
			if (sliderNav) {
				sliderNav.removeAttribute("hidden");
			}
		}, 100);

		if (!cardList || !prevBtn || !nextBtn) {
			console.warn("Required slider elements not found!");
			return;
		}

		const scrollAmount = cardList.clientWidth * 1; // Scroll 90% of visible width

		const updateButtonState = () => {
			const maxScrollLeft = cardList.scrollWidth - cardList.clientWidth;
			const scrollLeft = Math.round(cardList.scrollLeft); // Round to avoid precision issues

			prevBtn.disabled = scrollLeft <= 0;
			nextBtn.disabled = scrollLeft >= maxScrollLeft;
		};

		const smoothScroll = (direction) => {
			const maxScrollLeft = cardList.scrollWidth - cardList.clientWidth;
			let targetScroll = direction === "prev"
				? cardList.scrollLeft - scrollAmount
				: cardList.scrollLeft + scrollAmount;

			// Ensure scroll doesn't go beyond limits
			targetScroll = Math.max(0, Math.min(targetScroll, maxScrollLeft));

			cardList.scrollTo({
				left: targetScroll,
				behavior: "smooth",
			});

			setTimeout(updateButtonState, 300); // Ensure update after animation
		};

		prevBtn.addEventListener("click", () => smoothScroll("prev"));
		nextBtn.addEventListener("click", () => smoothScroll("next"));
		cardList.addEventListener("scroll", updateButtonState);

		updateButtonState(); // Initial state update
	}


	setScrollIndicatorThumbDimensions() {
		this.sliderScrollIndicatorThumbs.forEach((thumb, index) => {
			const track = this.sliderScrollIndicatorTracks[index];
			const cardList = this.cardLists[index];
			if (!track || !thumb || !cardList) return;
			const trackWidth = track.offsetWidth;
			const scrollWidth = cardList.scrollWidth;
			const offsetWidth = cardList.offsetWidth;
			const indicatorContainer = track.closest(".m-slider-scroll-indicator") || track.parentElement;
			const percentOfVisibleArea = (offsetWidth * 100) / scrollWidth;
			const thumbWidth = percentOfVisibleArea < 100 ? Math.max(20, (percentOfVisibleArea * trackWidth) / 100) : 0;
			if (!this.scrollMapRangeObjects) {
				this.scrollMapRangeObjects = [];
			}
			this.scrollMapRangeObjects[index] = {
				inMin: 0,
				inMax: Math.max(0, scrollWidth - offsetWidth),
				outMin: 0,
				outMax: Math.max(0, trackWidth - thumbWidth),
			};
			thumb.style.width = `${thumbWidth}px`;

			if (indicatorContainer) {
				indicatorContainer.style.display = scrollWidth <= offsetWidth ? "none" : "block";
			}

			if (scrollWidth <= offsetWidth || trackWidth <= 0) {
				thumb.style.transform = "translate3d(0, 0, 0)";
			} else {
				this.updateScrollIndicatorThumbPositions();
			}
		});
	}
	updateScrollIndicatorThumbPositions() {
		this.sliderScrollIndicatorThumbs.forEach((thumb, index) => {
			const range = this.scrollMapRangeObjects && this.scrollMapRangeObjects[index];
			const cardList = this.cardLists[index];
			if (!range || !cardList) return;
			const { inMin, inMax, outMin, outMax } = this.scrollMapRangeObjects[index];
			const scrollLeft = cardList.scrollLeft;
			const progress = inMax <= inMin ? 0 : (scrollLeft - inMin) / (inMax - inMin);
			const clampedProgress = Math.max(0, Math.min(1, progress));
			const thumbX = outMin + (outMax - outMin) * clampedProgress;
			thumb.style.transform = `translate3d(${thumbX}px, 0, 0)`;
		});
	}
	reinitialize() {
		this.unobserveCards(this.cards);
		this.unobserveCardLists(this.cardLists);
		this.cardLists = [...this.querySelectorAll("[slider-card-list]")];
		this.cards = [...this.querySelectorAll("[slider-card]")];
		this.observeCards(this.cards);
		this.observeCardLists(this.cardLists);
	}
	setupCardObserver() {
		this.cardObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;
					const isCard = target.hasAttribute("slider-card");
					const isIntersecting = entry.isIntersecting;
					if (isCard) {
						target.setAttribute("aria-hidden", isIntersecting ? "false" : "true");
						// target.toggleAttribute("inert", !isIntersecting);
						if (isIntersecting) {
							target.removeAttribute("tabindex");
						} else {
							target.setAttribute("tabindex", "-1");
						}
						this.setSliderBtnState();
					}
				});
			},
			{
				root: null,
				threshold: 0.99,
			} //0.99 seems to work and 1 doesn't on iOS when the parent is overflow:auto
		);
	}
	setupCardListObserver() {
		this.cardListObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;
					const isCardList = target.hasAttribute("slider-card-list");
					const isIntersecting = entry.isIntersecting;
					if (isCardList) {
						target.classList.toggle("is-visible", isIntersecting);
						this.setSliderNavVisibility();
						this.setScrollIndicatorThumbDimensions();
					}
				});
			},
			{
				root: null,
				threshold: 0.1,
			}
		);
	}
	observeCards(elements) {
		for (const element of elements) {
			this.cardObserver.observe(element);
		}
	}
	unobserveCards(elements) {
		for (const element of elements) {
			this.cardObserver.unobserve(element);
		}
	}
	observeCardLists(elements) {
		for (const element of elements) {
			this.cardListObserver.observe(element);
		}
	}
	unobserveCardLists(elements) {
		for (const element of elements) {
			this.cardListObserver.unobserve(element);
		}
	}
	setSliderBtnState() {
		const activeCardList = this.getActiveCardList();
		if (!activeCardList) return;

		const maxScrollLeft = activeCardList.scrollWidth - activeCardList.clientWidth;
		const isAtStart = activeCardList.scrollLeft <= 1;
		const isAtEnd = maxScrollLeft <= 1 || activeCardList.scrollLeft >= maxScrollLeft - 1;

		for (const btn of this.prevBtns) {
			btn.disabled = isAtStart;
		}
		for (const btn of this.nextBtns) {
			btn.disabled = isAtEnd;
		}
	}
	setSliderNavVisibility() {
		//if there are no visible card lists (if the active tabpanel does not have any card lists) and
		//if all cards are visible for the visible card list => btns not required, therefore hide buttons, else show buttons
		setTimeout(() => {
			const visibleCardLists = Array.from(this.cardLists).filter((cardList) => cardList.classList.contains("is-visible"));
			const activeCardLists = visibleCardLists.length > 0 ? visibleCardLists : this.cardLists.slice(0, 1);
			const allCardsVisible =
				activeCardLists.length === 0 ||
				activeCardLists.some((cardList) => {
					const cards = cardList.querySelectorAll("[slider-card]");
					return Array.from(cards).every((card) => card.getAttribute("aria-hidden") === "false");
				});
			for (const sliderNav of this.sliderNavs) {
				sliderNav.hidden = allCardsVisible;
			}
		}, 100);
	}
	createScrollHandler() {
		return (e) => {
			this.updateScrollIndicatorThumbPositions();
			this.setSliderBtnState();
			const cardList = e.currentTarget;
			cardList.disableSliderBtnClicks = true;
			for (const btn of this.nextBtns) {
				btn.classList.add("is-pressed-state-blocked");
			}
			for (const btn of this.prevBtns) {
				btn.classList.add("is-pressed-state-blocked");
			}
			clearTimeout(this.scrollTimer);
			this.scrollTimer = setTimeout(() => {
				cardList.disableSliderBtnClicks = false;
				for (const btn of this.nextBtns) {
					btn.classList.remove("is-pressed-state-blocked");
				}
				for (const btn of this.prevBtns) {
					btn.classList.remove("is-pressed-state-blocked");
				}
			}, 100);
		};
	}
	getCardsPerSlide(cardList) {
		let cardsPerSlide = 1;
		if (window.innerWidth > 767) {
			cardsPerSlide = cardList.hasAttribute("data-cards-per-slide") ? parseInt(cardList.dataset.cardsPerSlide) : 2;
		}
		return cardsPerSlide;
	}
	getActiveCardList() {
		return this.cardLists.find((cardList) => cardList.classList.contains("is-visible")) || this.cardLists[0] || null;
	}
	getCurrentCardIndex(cardList, cards) {
		const observerIndex = cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
		if (observerIndex >= 0) return observerIndex;

		const scrollLeft = cardList.scrollLeft;
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		cards.forEach((card, index) => {
			const distance = Math.abs(card.offsetLeft - scrollLeft);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		return closestIndex;
	}
	getScrollStep(cardList, cardsPerSlide) {
		const firstCard = cardList.querySelector("[slider-card]");
		if (!firstCard) return cardList.clientWidth * 0.9;
		const firstCardStyles = window.getComputedStyle(firstCard);
		const cardWidth = firstCard.getBoundingClientRect().width;
		const marginRight = parseFloat(firstCardStyles.marginRight || "0");
		return (cardWidth + marginRight) * Math.max(cardsPerSlide, 1);
	}
	createNextClickHandler() {
		return () => {
			const visibleCardList = this.getActiveCardList();
			if (!visibleCardList) return;
			const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
			if (cards.length === 0) return;
			if (visibleCardList.disableSliderBtnClicks) return;

			const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
			const step = this.getScrollStep(visibleCardList, cardsPerSlide);
			const maxScrollLeft = Math.max(0, visibleCardList.scrollWidth - visibleCardList.clientWidth);
			const targetLeft = Math.min(maxScrollLeft, visibleCardList.scrollLeft + step);
			if (Math.abs(targetLeft - visibleCardList.scrollLeft) < 1) return;

			this.scrollToCardList(visibleCardList);
			visibleCardList.scrollTo({
				left: targetLeft,
				behavior: "smooth",
			});
		};
	}

	createPrevClickHandler() {
		return () => {
			const visibleCardList = this.getActiveCardList();
			if (!visibleCardList) return;
			const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
			if (cards.length === 0) return;
			if (visibleCardList.disableSliderBtnClicks) return;

			const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
			const step = this.getScrollStep(visibleCardList, cardsPerSlide);
			const targetLeft = Math.max(0, visibleCardList.scrollLeft - step);
			if (Math.abs(targetLeft - visibleCardList.scrollLeft) < 1) return;

			this.scrollToCardList(visibleCardList);
			visibleCardList.scrollTo({
				left: targetLeft,
				behavior: "smooth",
			});
		};
	}
	/* scrollToCardList */
	scrollToCardList(cardList) {
		let top = 0;
		const cardListBoundingBox = this.getBoundingClientRect();
		const windowHeight = window.innerHeight;
		const hiddenFromBottom = cardListBoundingBox.bottom - windowHeight;
		const topAfterMoving = cardListBoundingBox.top - hiddenFromBottom;
		if (cardListBoundingBox.bottom > windowHeight) {
			if (topAfterMoving > this.headerheight) {
				top = cardListBoundingBox.bottom - windowHeight;
			} else {
				//top = this.headerheight;
			}
		}
		window.scrollBy({
			top: top,
			behavior: "smooth",
		});
	}



	/* add listeners */
	connectedCallback() {
		this.setupCardObserver();
		this.setupCardListObserver();
		this.setScrollIndicatorThumbDimensions();
		this.observeCards(this.cards);
		this.observeCardLists(this.cardLists);
		if (this.cardLists.length > 0 && !this.cardLists.some((cardList) => cardList.classList.contains("is-visible"))) {
			this.cardLists[0].classList.add("is-visible");
		}
		this.setSliderBtnState();
		this.setSliderNavVisibility();
		this.resizeHandler = () => this.setScrollIndicatorThumbDimensions();
		window.addEventListener("resize", this.resizeHandler);
		for (const cardList of this.cardLists) {
			cardList.addEventListener("scroll", this.scrollHandler);
		}
		for (const btn of this.nextBtns) {
			btn.addEventListener("click", this.nextClickHandler);
		}
		for (const btn of this.prevBtns) {
			btn.addEventListener("click", this.prevClickHandler);
		}

	}
	/* remove listeners */
	disconnectedCallback() {
		window.removeEventListener("resize", this.resizeHandler);
		this.unobserveCards(this.cards);
		this.unobserveCardLists(this.cardLists);
		for (const cardList of this.cardLists) {
			cardList.removeEventListener("scroll", this.scrollHandler);
		}
		for (const btn of this.nextBtns) {
			btn.removeEventListener("click", this.nextClickHandler);
		}
		for (const btn of this.prevBtns) {
			btn.removeEventListener("click", this.prevClickHandler);
		}
	}
}
customElements.define("slider-interface", SliderInterface);

console.log('::Slider Interface loaded::');




