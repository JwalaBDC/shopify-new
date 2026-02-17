export default class QuickGlance {
	constructor({ element }) {
		this.container = element;
		this.statElements = this.container.querySelectorAll('[data-quickglance-motion-element="stat"]');
		this.persist = true;
		this.addEventListeners();
		this.onResize();
		this.setCardWidth();
	}
	init() {}
	addEventListeners() {
		window.resizeManager.subscribe(this.onResize.bind(this));
	}
	onResize(windowWidth, windowHeight) {
		this.containerWidth = this.container.closest(".ui-quickglance-modal") ? this.container.closest(".ui-quickglance-modal").offsetWidth : this.container.closest(".ui-quickglance").offsetWidth;
		this.incrementBy = this.containerWidth < 1024 ? 2 : this.containerWidth < 1280 ? 1 : 2;
		this.lastVisibleCardIndex = this.containerWidth < 1024 ? 1 : this.containerWidth < 1280 ? 2 : 3;
	}
	setCardWidth() {
		this.cardWidth = this.statElements[1].offsetLeft - this.statElements[0].offsetLeft;
	}
	animateIn() {
		if (this.containerWidth === 0) this.onResize();
		if (this.isAnimatedIn) return;
		this.isAnimatedIn = true;
		let animationIndex = -1;
		this.statElements.forEach((el, index) => {
			if (index <= this.lastVisibleCardIndex && !el.isAnimated) {
				animationIndex += 1;
				el.isAnimated = true;
				const statLine = el.querySelector('[data-quickglance-motion-element="stat-line"]');
				const statText = el.querySelectorAll('[data-quickglance-motion-element="stat-text"]');
				const tl = gsap.timeline({
					delay: 0.25 * animationIndex,
				});
				tl.fromTo(
					statText,
					{
						y: 20,
						opacity: 0,
					},
					{
						y: 0,
						opacity: 1,
						transformOrigin: "bottom center",
						duration: 0.3,
						ease: "standard-decelerate",
						stagger: 0.075,
					}
				);
				tl.fromTo(
					statLine,
					{
						scaleY: 0,
					},
					{
						scaleY: 1,
						transformOrigin: "bottom center",
						duration: 0.5,
						ease: "standard-decelerate",
					}
				);
			}
		});
		this.hasMoveLeftBeenCalled = false;
		setInterval(() => {
			if (this.hasMoveLeftBeenCalled) {
				let appendElements = [];
				this.statElements.forEach((el, index) => {
					if (index < this.incrementBy) {
						el.isAnimated = false;
						appendElements.push(el);
					}
				});
				appendElements.forEach((el) => {
					// console.log(el, el.isAnimated);
					this.container.appendChild(el);
				});
				this.statElements = this.container.querySelectorAll('[data-quickglance-motion-element="stat"]');
				gsap.set(this.statElements, {
					x: 0,
				});
			}
			this.hasMoveLeftBeenCalled = true;
			this.lastVisibleCardIndex = window.innerWidth < 1024 ? 1 : window.innerWidth < 1280 ? 2 : 3;
			this.moveLeft();
		}, 4000);
	}
	moveLeft() {
		gsap.to(this.statElements, {
			x: -this.cardWidth * this.incrementBy,
			duration: 0.5,
			ease: "emphasized-decelerate",
		});
		let animationIndex = -1;
		this.statElements.forEach((el, index) => {
			if (index <= 1) {
				const statLine = el.querySelector('[data-quickglance-motion-element="stat-line"]');
				const statText = el.querySelectorAll('[data-quickglance-motion-element="stat-text"]');
				if (window.innerWidth >= 1024) {
					/* const tl = gsap.timeline();
					tl.to(
						el,
						{
							opacity: 0,
							duration: 0.2,
							ease: "standard-decelerate",
						},
						0
					); */
				}
			} else if (index <= this.lastVisibleCardIndex + this.incrementBy && !el.isAnimated) {
				el.isAnimated = true;
				animationIndex += 1;
				const statLine = el.querySelector('[data-quickglance-motion-element="stat-line"]');
				const statText = el.querySelectorAll('[data-quickglance-motion-element="stat-text"]');
				const tl = gsap.timeline({
					delay: 0.25 * animationIndex,
				});
				/* tl.set(statLine, {
					scaleY: 1,
				}); */
				tl.to(el, {
					opacity: 1,
				});
				tl.fromTo(
					statText,
					{
						y: 20,
						opacity: 0,
					},
					{
						y: 0,
						opacity: 1,
						transformOrigin: "bottom center",
						duration: 0.3,
						ease: "standard-decelerate",
						stagger: 0.075,
					}
				);
				tl.fromTo(
					statLine,
					{
						opacity: 0,
						scaleY: 1,
					},
					{
						opacity: 1,
						scaleY: 1,
						transformOrigin: "bottom center",
						duration: 0.1,
						ease: "standard-decelerate",
					}
				);
			}
		});
	}
	animateOut() {
		if (this.isAnimatedIn) {
			if (this.persist) {
				this.container.dispatchEvent(new CustomEvent("unobserve"));
				return;
			}
		}
		this.isAnimatedIn = false;
		this.statElements.forEach((el, index) => {
			const statLine = el.querySelector('[data-quickglance-motion-element="stat-line"]');
			const statText = el.querySelectorAll('[data-quickglance-motion-element="stat-text"]');
			gsap.set(statLine, {
				scaleY: 0,
			});
			gsap.set(statText, {
				opacity: 0,
			});
		});
	}
}
