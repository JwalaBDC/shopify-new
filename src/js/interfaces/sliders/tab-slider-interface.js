class TabSliderInterface extends HTMLElement {
	constructor() {
		super();
		this.cards = [...this.querySelectorAll("[tab-slider-card]")];
		this.cardList = this.querySelector("[tab-slider-list]");
		this.prevButtons = [...this.querySelectorAll("[tab-slider-prev]")];
		this.nextButtons = [...this.querySelectorAll("[tab-slider-next]")];
		this.cardsLength = this.cards.length;
		this.prevClickHandler = this.createPrevClickHandler();
		this.nextClickHandler = this.createNextClickHandler();
		this.cards.forEach((card, index) => {
			card.setAttribute("data-card-number", index);
		});
	}

	setupObservers() {
		this.cardObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;
					if (target.hasAttribute("tab-slider-card")) {
						target.setAttribute(
							"aria-hidden",
							entry.isIntersecting ? "false" : "true"
						);
					}
				});
				this.setSliderBtnState();
			},
			{ root: this, threshold: 0.8 }
		);

		this.cards.forEach((card) => this.cardObserver.observe(card));
	}

	removeObservers() {
		if (this.cardObserver) {
			this.cards.forEach((card) => this.cardObserver.unobserve(card));
			this.cardObserver.disconnect();
			this.cardObserver = null;
		}
	}

	setSliderBtnState() {
		const firstCardVisible = this.cards[0].getAttribute("aria-hidden") === "false";
		const lastCardVisible = this.cards[this.cardsLength - 1].getAttribute("aria-hidden") === "false";

		this.prevButtons.forEach((btn) => (btn.hidden = firstCardVisible));
		this.nextButtons.forEach((btn) => (btn.hidden = lastCardVisible));
	}

	createNextClickHandler() {
		return () => {
			const lastVisibleCardIndex = this.cards.findIndex(
				(card) => card.getAttribute("aria-hidden") === "false"
			);
			const nextCard = this.cards[lastVisibleCardIndex + 1];

			if (!nextCard) {
				this.smoothScrollTo(null, "last");
			} else {
				this.smoothScrollTo(nextCard);
			}
		};
	}

	createPrevClickHandler() {
		return () => {
			const firstVisibleCardIndex = this.cards.findIndex(
				(card) => card.getAttribute("aria-hidden") === "false"
			);
			const prevCard = this.cards[firstVisibleCardIndex - 1];

			if (!prevCard) {
				this.smoothScrollTo(null, "first");
			} else {
				this.smoothScrollTo(prevCard);
			}
		};
	}

	smoothScrollTo(card, goto = "") {
		if (goto === "first") {
			this.cardList.scrollTo({ left: 0, behavior: "smooth" });
		} else if (goto === "last") {
			this.cardList.scrollTo({ left: this.cardList.scrollWidth, behavior: "smooth" });
		} else if (card) {
			this.cardList.scrollTo({
				left: card.offsetLeft,
				behavior: "smooth",
			});
		}
		setTimeout(() => this.setSliderBtnState(), 300); // Update button states after scroll animation
	}

	connectedCallback() {
		this.setupObservers();
		this.cardList.addEventListener("scroll", this.setSliderBtnState.bind(this));

		this.prevButtons.forEach((btn) => {
			btn.addEventListener("click", this.prevClickHandler);
		});

		this.nextButtons.forEach((btn) => {
			btn.addEventListener("click", this.nextClickHandler);
		});
	}

	disconnectedCallback() {
		this.removeObservers();
		this.cardList.removeEventListener("scroll", this.setSliderBtnState.bind(this));

		this.prevButtons.forEach((btn) => {
			btn.removeEventListener("click", this.prevClickHandler);
		});

		this.nextButtons.forEach((btn) => {
			btn.removeEventListener("click", this.nextClickHandler);
		});
	}
}

customElements.define("tab-slider-interface", TabSliderInterface);
