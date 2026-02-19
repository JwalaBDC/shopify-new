/* class: ProductSliderInterface */
class ProductSliderInterface extends HTMLElement {
  constructor() {
    super();
    this.cardLists = [...this.querySelectorAll("[slider-card-list]")];
    this.cards = [...this.querySelectorAll("[slider-card]")];
    this.sliderNavs = [...this.querySelectorAll("[slider-nav]")];
    this.prevBtns = [...this.querySelectorAll("[slider-prev]")];
    this.nextBtns = [...this.querySelectorAll("[slider-next]")];
    this.prevClickHandler = this.createPrevClickHandler();
    this.nextClickHandler = this.createNextClickHandler();
    this.scrollHandler = this.createScrollHandler();
  }
  setupCardObserver() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
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
    }, {
      root: document.documentElement,
      threshold: 0.99
    } //0.99 seems to work and 1 doesn't on iOS when the parent is overflow:auto
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
    let isFirstCardVisible = this.cardLists.some(cardList => {
      const firstCard = cardList.querySelector("[slider-card]");
      return firstCard && firstCard.getAttribute("aria-hidden") === "false";
    });
    for (const btn of this.prevBtns) {
      btn.disabled = isFirstCardVisible;
    }
    //if the last card in the set is visible, the next button can be disabled
    let isLastCardVisible = this.cardLists.some(cardList => {
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
    const visibleCardLists = Array.from(this.cardLists).filter(cardList => cardList.classList.contains("is-visible"));
    const allCardsVisible = visibleCardLists.length === 0 || visibleCardLists.some(cardList => {
      const cards = cardList.querySelectorAll("[slider-card]");
      return Array.from(cards).every(card => card.getAttribute("aria-hidden") === "false");
    });
    for (const sliderNav of this.sliderNavs) {
      sliderNav.hidden = allCardsVisible;
    }
  }
  createScrollHandler() {
    return e => {
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
      cardsPerSlide = cardList.hasAttribute("data-cards-per-slide") ? parseInt(cardList.dataset.cardsPerSlide) : 1;
    }
    return cardsPerSlide;
  }
  createNextClickHandler() {
    return () => {
      const visibleCardList = this.cardLists.find(cardList => cardList.classList.contains("is-visible"));
      if (!visibleCardList) return;
      if (visibleCardList.classList.contains("disable-scroll-snapping")) return;
      const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
      const visibleCardIndex = cards.findIndex(card => card.getAttribute("aria-hidden") === "false");
      const firstVisibleCard = cards[visibleCardIndex];
      const nextCard = cards[visibleCardIndex + 1];
      const lastCard = cards[cards.length - 1];
      if (visibleCardList.disableSliderBtnClicks) return;
      if (nextCard) {
        const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
        //this.scrollToCardList(visibleCardList);
        const left = nextCard.getBoundingClientRect().width * (visibleCardIndex + 1); //1 is the cardsPerSlide
        visibleCardList.classList.add("disable-scroll-snapping");
        const nextTl = gsap.timeline({
          onComplete: () => {
            gsap.set([firstVisibleCard, nextCard], {
              clearProps: "all",
              onComplete: () => {
                visibleCardList.scrollTo({
                  left: left,
                  behavior: "instant"
                });
              }
            });
            visibleCardList.classList.remove("disable-scroll-snapping");
          }
        });
        nextTl.fromTo(firstVisibleCard, {
          opacity: 1
        }, {
          opacity: 0,
          duration: 0.3,
          ease: "emphasized-decelerate"
        }, 0);
        nextTl.fromTo(nextCard, {
          xPercent: 0,
          opacity: 0
        }, {
          xPercent: -100,
          opacity: 1,
          duration: 0.5,
          ease: "emphasized-decelerate"
        }, 0.1);
      }
    };
  }
  createPrevClickHandler() {
    return () => {
      const visibleCardList = this.cardLists.find(cardList => cardList.classList.contains("is-visible"));
      if (!visibleCardList) return;
      if (visibleCardList.classList.contains("disable-scroll-snapping")) return;
      const cards = [...visibleCardList.querySelectorAll("[slider-card]")];
      const visibleCardIndex = cards.findIndex(card => card.getAttribute("aria-hidden") === "false");
      const firstVisibleCard = cards[visibleCardIndex];
      const prevCard = cards[visibleCardIndex - 1];
      if (visibleCardList.disableSliderBtnClicks) return;
      if (prevCard) {
        const cardsPerSlide = this.getCardsPerSlide(visibleCardList);
        //this.scrollToCardList(visibleCardList);
        const left = prevCard.getBoundingClientRect().width * (visibleCardIndex - cardsPerSlide);
        visibleCardList.classList.add("disable-scroll-snapping");
        const previousTl = gsap.timeline({
          onComplete: () => {
            visibleCardList.scrollTo({
              left: left,
              behavior: "instant"
            });
            gsap.set([firstVisibleCard, prevCard], {
              clearProps: "all"
            });
            visibleCardList.classList.remove("disable-scroll-snapping");
          }
        });
        previousTl.fromTo(firstVisibleCard, {
          opacity: 1
        }, {
          opacity: 0,
          duration: 0.3,
          ease: "emphasized-decelerate"
        }, 0);
        previousTl.fromTo(prevCard, {
          xPercent: 0,
          opacity: 0
        }, {
          xPercent: 100,
          opacity: 1,
          zIndex: 1,
          duration: 0.5,
          ease: "emphasized-decelerate"
        }, 0.1);
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
      behavior: "smooth"
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
customElements.define("product-slider-interface", ProductSliderInterface);