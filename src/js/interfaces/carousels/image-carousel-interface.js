/* class: ImageCarouselInterface */
class ImageCarouselInterface extends HTMLElement {
	constructor() {
		super();
		this.container = this.querySelector(".ui-image-carousel");
		this.cardLists = [...this.querySelectorAll("[slider-card-list]")];
		this.cards = [...this.querySelectorAll("[slider-card]")];
		this.sliderNavs = [...this.querySelectorAll("[slider-nav]")];
		this.prevBtns = [...this.querySelectorAll("[slider-prev]")];
		this.nextBtns = [...this.querySelectorAll("[slider-next]")];
		this.sliderDots = [...this.querySelectorAll("[slider-dots]")];
		this.playBtns = [...this.querySelectorAll(".ui-image-carousel__play-btn")];
		this.pauseBtns = [...this.querySelectorAll(".ui-image-carousel__pause-btn")];
		this.prevClickHandler = this.createPrevClickHandler();
		this.nextClickHandler = this.createNextClickHandler();
		this.playClickHandler = this.createPlayClickHandler();
		this.pauseClickHandler = this.createPauseClickHandler();
		this.scrollHandler = this.createScrollHandler();
	}
	setupComponentObserver() {
		this.componentObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const isIntersecting = entry.isIntersecting;
					if (isIntersecting) {
						this.continueAutoplay();
					} else {
						this.pauseAutoplay();
					}
				});
			},
			{ root: null, threshold: 0.5 }
		);
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
						target.classList.toggle("is-visible", isIntersecting);
						this.setSliderNavVisibility();
					}
				});
			},
			{ root: document.documentElement, threshold: 0.99 } //0.99 seems to work and 1 doesn't on iOS when the parent is overflow:auto
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
			clearTimeout(this.scrollTimer);
			this.scrollTimer = setTimeout(() => {
				cardList.disableSliderBtnClicks = false;
			}, 100);
		};
	}
	getCardsPerSlide(cardList) {
		let cardsPerSlide = 1;
		if (window.innerWidth > 767) {
			cardsPerSlide = cardList.hasAttribute("data-cards-per-slide") ? parseInt(cardList.dataset.cardsPerSlide) : 1;
		}
		return cardsPerSlide;
	}
	createNextClickHandler() {
		return () => {
			const visibleCardList = this.cardLists.find((cardList) => cardList.classList.contains("is-visible"));
			if (!visibleCardList) return;
			const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
			let visibleCardIndex = cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
			let firstVisibleCard = cards[visibleCardIndex];
			let nextCard = cards[visibleCardIndex + 1];
			let lastCard = cards[cards.length - 1];
			if (visibleCardList.disableSliderBtnClicks) return;
			if (this.classList.contains("is-slider-animating")) return;
			this.pauseAutoplay();
			if (nextCard) {
				this.setActiveSliderDot(visibleCardList, visibleCardIndex + 1);
				const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
				//this.scrollToCardList(visibleCardList);
				const left = nextCard.getBoundingClientRect().width * (visibleCardIndex + 1); //1 is the cardsPerSlide
				visibleCardList.classList.add("disable-scroll-snapping");
				this.classList.add("is-slider-animating");
				const nextTl = gsap.timeline({
					onComplete: () => {
						gsap.set([firstVisibleCard, nextCard], {
							clearProps: "all",
							onComplete: () => {
								visibleCardList.scrollTo({
									left: left,
									behavior: "instant",
								});
								this.continueAutoplay();
							},
						});
						visibleCardList.classList.remove("disable-scroll-snapping");
						this.classList.remove("is-slider-animating");
					},
				});
				nextTl.fromTo(
					firstVisibleCard,
					{
						xPercent: 0,
					},
					{
						xPercent: -30,
						duration: 0.4,
						ease: "emphasized-accelerate",
					},
					0
				);
				nextTl.fromTo(
					nextCard,
					{
						xPercent: 0,
					},
					{
						xPercent: -100,
						duration: 0.4,
						ease: "emphasized",
					},
					0
				);
			} else {
				visibleCardIndex = -1;
				let firstVisibleCard = cards[cards.length - 1];
				nextCard = cards[0];
				this.setActiveSliderDot(visibleCardList, visibleCardIndex + 1);
				const left = nextCard.getBoundingClientRect().width * (visibleCardIndex + 1); //1 is the cardsPerSlide
				visibleCardList.classList.add("disable-scroll-snapping");
				this.classList.add("is-slider-animating");
				const nextTl = gsap.timeline({
					onComplete: () => {
						gsap.set([firstVisibleCard, nextCard], {
							clearProps: "all",
							onComplete: () => {
								visibleCardList.scrollTo({
									left: left,
									behavior: "instant",
								});
								this.continueAutoplay();
							},
						});
						visibleCardList.classList.remove("disable-scroll-snapping");
						this.classList.remove("is-slider-animating");
					},
				});
				nextTl.set(firstVisibleCard, {
					zIndex: 0,
				});
				nextTl.set(nextCard, {
					xPercent: (cards.length - 1) * 100,
					zIndex: 1,
				});
				nextTl.fromTo(
					firstVisibleCard,
					{
						xPercent: 0,
					},
					{
						xPercent: -30,
						duration: 0.4,
						ease: "emphasized-accelerate",
					},
					0
				);
				nextTl.fromTo(
					nextCard,
					{
						xPercent: cards.length * 100,
					},
					{
						xPercent: (cards.length - 1) * 100,
						duration: 0.4,
						ease: "emphasized",
					},
					0
				);
			}
		};
	}
	createPrevClickHandler() {
		return () => {
			const visibleCardList = this.cardLists.find((cardList) => cardList.classList.contains("is-visible"));
			if (!visibleCardList) return;
			const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
			const visibleCardIndex = cards.findIndex((card) => card.getAttribute("aria-hidden") === "false");
			const firstVisibleCard = cards[visibleCardIndex];
			const prevCard = cards[visibleCardIndex - 1];
			if (visibleCardList.disableSliderBtnClicks) return;
			if (this.classList.contains("is-slider-animating")) return;
			this.pauseAutoplay();
			if (prevCard) {
				this.setActiveSliderDot(visibleCardList, visibleCardIndex - 1);
				const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
				//this.scrollToCardList(visibleCardList);
				const left = prevCard.getBoundingClientRect().width * (visibleCardIndex - cardsPerSlide);
				visibleCardList.classList.add("disable-scroll-snapping");
				this.classList.add("is-slider-animating");
				const previousTl = gsap.timeline({
					onComplete: () => {
						visibleCardList.scrollTo({
							left: left,
							behavior: "instant",
						});
						gsap.set([firstVisibleCard, prevCard], { clearProps: "all" });
						visibleCardList.classList.remove("disable-scroll-snapping");
						this.continueAutoplay();
						this.classList.remove("is-slider-animating");
					},
				});
				previousTl.fromTo(
					firstVisibleCard,
					{
						xPercent: 0,
					},
					{
						xPercent: 30,
						duration: 0.4,
						ease: "emphasized-accelerate",
					},
					0
				);
				previousTl.fromTo(
					prevCard,
					{
						xPercent: 0,
					},
					{
						xPercent: 100,
						zIndex: 1,
						duration: 0.4,
						ease: "emphasized",
					},
					0
				);
			}
		};
	}
	/* scrollToCardList */
	scrollToCardList(cardList) {
		let top;
		const cardListBoundingBox = cardList.getBoundingClientRect();
		const windowHeight = window.innerHeight;
		if (cardListBoundingBox.bottom > windowHeight) {
			top = cardListBoundingBox.bottom - windowHeight;
		}
		window.scrollBy({
			top: top,
			behavior: "smooth",
		});
	}
	setActiveSliderDot(cardList, activeCardIndex) {
		const sliderDots = cardList.querySelector("[slider-dots]").querySelectorAll("span");
		sliderDots.forEach((dot, index) => {
			dot.classList.remove("is-active");
			if (index === activeCardIndex) {
				dot.classList.add("is-active");
			}
		});
	}
	createPlayClickHandler() {
		return (e) => {
			this.isAutoplayPaused = false;
			clearInterval(this.nextClickInterval);
			this.nextClickInterval = setInterval(this.nextClickHandler, 4000);
			for (const btn of this.playBtns) {
				btn.hidden = true;
			}
			for (const btn of this.pauseBtns) {
				btn.removeAttribute("hidden");
			}
		};
	}
	createPauseClickHandler() {
		return (e) => {
			this.isAutoplayPaused = true;
			clearInterval(this.nextClickInterval);
			for (const btn of this.playBtns) {
				btn.removeAttribute("hidden");
			}
			for (const btn of this.pauseBtns) {
				btn.hidden = true;
			}
		};
	}
	pauseAutoplay() {
		clearInterval(this.nextClickInterval);
	}
	continueAutoplay() {
		if (this.isAutoplayPaused) return;
		clearInterval(this.nextClickInterval);
		this.nextClickInterval = setInterval(this.nextClickHandler, 4000);
	}
	/* add listeners */
	connectedCallback() {
		this.setupCardObserver();
		this.setupComponentObserver();
		this.componentObserver.observe(this);
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
		for (const btn of this.playBtns) {
			btn.addEventListener("click", this.playClickHandler);
		}
		for (const btn of this.pauseBtns) {
			btn.addEventListener("click", this.pauseClickHandler);
		}
	}
	/* remove listeners */
	disconnectedCallback() {
		this.componentObserver.unobserve(this);
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
		for (const btn of this.playBtns) {
			btn.removeEventListener("click", this.playClickHandler);
		}
		for (const btn of this.pauseBtns) {
			btn.removeEventListener("click", this.pauseClickHandler);
		}
		clearInterval(this.nextClickInterval);
	}
}
customElements.define("image-carousel-interface", ImageCarouselInterface);
