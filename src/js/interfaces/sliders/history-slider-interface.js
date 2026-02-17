/* class: HsitorySliderInterface */
if (typeof HsitorySliderInterface === "undefined") {
	class HsitorySliderInterface extends HTMLElement {
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
			this.observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						const target = entry.target;
						const isCard = target.hasAttribute("slider-card");
						const isCardList = target.hasAttribute("slider-card-list");
						const isIntersecting = entry.isIntersecting;
						if (isCard) {
							target.setAttribute("aria-hidden", isIntersecting ? "false" : "true");
							this.setSliderBtnState();
						}
						if (isCardList) {
							// console.log("isCardList: ", isCardList);
							// console.log("target: ", target);
							target.classList.toggle("is-visible", isIntersecting);
							if(target.scrollWidth > target.offsetWidth) this.setSliderNavVisibility();
						}
					});
				},
				// { root: null, threshold: 0.5 }, //0.99 seems to work and 1 doesn't on iOS when the parent is overflow:auto
				{ root: null, threshold: 0.1 }, //0.99 seems to work and 1 doesn't on iOS when the parent is overflow:auto
			);
		}
		observeElements(elements) {
			for (const element of elements) {
				this.observer.observe(element);
			}
		}
		unobserveElements(elements) {
			for (const element of elements) {
				this.observer.unobserve(element);
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
			const visibleCardLists = Array.from(this.cardLists).filter((cardList) => cardList.classList.contains("is-visible"));
			// visibleCardLists.forEach((list) => {
			// 	const cards = list.querySelectorAll("[slider-card]");
			// 	const allCardsVisible = Array.from(cards).every((card) => card.getAttribute("aria-hidden") === "false");
			// 	const navEle = list.closest("history-slider-interface").querySelector("[slider-nav]");
			// 	console.log("checking visibility and setting Nav: ", cards, allCardsVisible, navEle);
			// 	navEle.hidden = allCardsVisible;
			// });
			const allCardsVisible =
				visibleCardLists.length === 0 ||
				visibleCardLists.some((cardList) => {
					const cards = cardList.querySelectorAll("[slider-card]");
					return Array.from(cards).every((card) => card.getAttribute("aria-hidden") === "false");
				});
			for (const sliderNav of this.sliderNavs) {
				sliderNav.hidden = allCardsVisible;
			}
		}
		createScrollHandler() {
			return (e) => {
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
			this.observeElements(this.cards);
			this.observeElements(this.cardLists);
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
			this.unobserveElements(this.cards);
			this.unobserveElements(this.cardLists);
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
	customElements.define("history-slider-interface", HsitorySliderInterface);
}
