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
			const trackWidth = track.offsetWidth;
			const scrollWidth = this.cardLists[index].scrollWidth;
			const offsetWidth = this.cardLists[index].offsetWidth;
			const percentOfVisibleArea = (offsetWidth * 100) / scrollWidth;
			const thumbWidth = percentOfVisibleArea < 100 ? (percentOfVisibleArea * trackWidth) / 100 : 0;
			if (!this.scrollMapRangeObjects) {
				this.scrollMapRangeObjects = [];
				this.scrollMapRangeObjects.push({
					inMin: 0,
					inMax: 0,
					outMin: 0,
					outMax: 0,
				});
			}
			this.scrollMapRangeObjects[index] = {
				inMin: 0,
				inMax: scrollWidth - offsetWidth,
				outMin: 0,
				outMax: trackWidth - thumbWidth,
			};
			thumb.style.width = `${thumbWidth}px`;

			if (scrollWidth <= offsetWidth) {
				track.parentElement.parentElement.style.display = 'none';
			} else {
				track.parentElement.parentElement.style.display = 'flex';

				requestAnimationFrame(() => {
					this.setScrollIndicatorThumbDimensions();
				});
			}


		});
	}
	updateScrollIndicatorThumbPositions() {
		this.sliderScrollIndicatorThumbs.forEach((thumb, index) => {
			const { inMin, inMax, outMin, outMax } = this.scrollMapRangeObjects[index];
			const scrollLeft = this.cardLists[index].scrollLeft;
			let thumbX = 0;
			if (scrollLeft === 0) {
				thumbX = 0;
			} else {
				thumbX = gsap.utils.mapRange(inMin, inMax, outMin, outMax, scrollLeft);
				thumbX = gsap.utils.clamp(outMin, outMax, thumbX);
			}
			thumb.style.transform = `translate3d(${thumbX}px, 0, 0)`;
		});
	}
	reinitialize() {
		this.unobserveElements(this.cards);
		this.unobserveElements(this.cardLists);
		this.cardLists = [...this.querySelectorAll("[slider-card-list]")];
		this.cards = [...this.querySelectorAll("[slider-card]")];
		this.observeElements(this.cards);
		this.observeElements(this.cardLists);
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
				root: document.documentElement,
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
				root: document.documentElement,
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
		//if in any of the card lists,  the first card is visible, the previous button can be disabled
		let isFirstCardVisible = this.cardLists.some((cardList) => {
			const firstCard = cardList.querySelector("[slider-card]");
			return firstCard && firstCard.getAttribute("aria-hidden") === "false";
		});
		for (const btn of this.prevBtns) {
			btn.disabled = isFirstCardVisible;
		}
		//if the last card in the set is visible, the next button can be disabled
		let isLastCardVisible = this.cardLists.some((cardList) => {
			const cards = cardList.querySelectorAll("[slider-card]");
			const lastCard = cards[cards.length - 1];
			return lastCard && lastCard.getAttribute("aria-hidden") === "false";
		});
		for (const btn of this.nextBtns) {
			btn.disabled = isLastCardVisible;
		}
	}
	setSliderNavVisibility() {
		//if there are no visible card lists (if the active tabpanel does not have any card lists) and
		//if all cards are visible for the visible card list => btns not required, therefore hide buttons, else show buttons
		setTimeout(() => {
			const visibleCardLists = Array.from(this.cardLists).filter((cardList) => cardList.classList.contains("is-visible"));
			const allCardsVisible =
				visibleCardLists.length === 0 ||
				visibleCardLists.some((cardList) => {
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
	createNextClickHandler() {
		return () => {
			const visibleCardList = this.cardLists.find((cardList) => cardList.classList.contains("is-visible"));
			if (!visibleCardList) return;
			const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
			const visibleCardIndex = cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
			const nextCard = cards[visibleCardIndex + 1];
			if (visibleCardList.disableSliderBtnClicks) return;
			if (nextCard) {
				const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
				this.scrollToCardList(visibleCardList);
				visibleCardList.scrollTo({
					left: nextCard.getBoundingClientRect().width * (visibleCardIndex + cardsPerSlide),
					behavior: "smooth",
				});
			}
		};
	}

	createPrevClickHandler() {
		return () => {
			const visibleCardList = this.cardLists.find((cardList) => cardList.classList.contains("is-visible"));
			if (!visibleCardList) return;
			const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
			const visibleCardIndex = cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
			const prevCard = cards[visibleCardIndex - 1];
			if (visibleCardList.disableSliderBtnClicks) return;
			if (prevCard) {
				const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
				this.scrollToCardList(visibleCardList);
				visibleCardList.scrollTo({
					left: prevCard.getBoundingClientRect().width * (visibleCardIndex - cardsPerSlide),
					behavior: "smooth",
				});
			}
		};
	}
	/* scrollToCardList */
	scrollToCardList(cardList) {
		let top;
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



