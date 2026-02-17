export default class Stagger {
	constructor({ element }) {
		this.container = element;
		this.staggerElements = [...this.container.querySelectorAll("[data-stagger-motion-index]")].filter((element) => {
			//Check if the closest parent with 'data-motion-observer=stagger' is the container itself
			return element.closest("[data-stagger-motion-observer]") === this.container;
		});
		this.persist = true;
		if (this.container.hasAttribute("data-stagger-motion-persist")) {
			if (this.container.getAttribute("data-stagger-motion-persist") === "false") {
				this.persist = false;
			}
		}
		this.isAnimatedIn = false;
		this.init();
		this.animateOut();
		this.addEventListeners();
	}
	reQueryDOM() {
		this.staggerElements = [...this.container.querySelectorAll("[data-stagger-motion-index]")].filter((element) => {
			//Check if the closest parent with 'data-motion-observer=stagger' is the container itself
			return element.closest("[data-stagger-motion-observer]") === this.container;
		});
		this.isAnimatedIn = false;
		this.animateOut();
	}
	init() {
		this.setTataChemAnimationConfig();
		// To invoke animation immediately
		this.isInvokedImmediate = this.container.getAttribute("data-motion-invoke-immediate") === "true";
		if (this.isInvokedImmediate) {
			this.isAnimatedIn = false;
			this.animateOut();
			this.animateIn();
		}
	}
	setTataChemAnimationConfig() {
		const userAgent = navigator.userAgent.toLowerCase();
		const isSafari = (userAgent.includes("safari") && !userAgent.includes("chrome")) || !!window.ApplePaySetupFeature || !!window.safari;
		let duration = isSafari ? 500 : 450;
		this.easingToken = "custom-cubic-easing";
		//this.easingToken = "power2.inOut";
		this.stagger = "0.06";
		this.animationConfig = {
			xxs: { y: 20, duration: duration, ease: this.easingToken },
			xs: { y: 60, duration: duration, ease: this.easingToken },
			sm: { y: 60, duration: duration, ease: this.easingToken },
			md: { y: 80, duration: duration, ease: this.easingToken },
			lg: { y: 100, duration: duration, ease: this.easingToken },
		};
		if (window.innerWidth < 768) {
			this.stagger = "0.05";
			this.easingToken = "power2.out";
			this.animationConfig = {
				xxs: { y: 20, duration: duration, ease: this.easingToken },
				xs: { y: 40, duration: duration, ease: this.easingToken },
				sm: { y: 40, duration: duration, ease: this.easingToken },
				md: { y: 40, duration: duration, ease: this.easingToken },
				lg: { y: 40, duration: duration, ease: this.easingToken },
			};
		}
	}
	setGodrejAnimationConfig() {
		this.easingToken = "standard-decelerate";
		this.stagger = "0.05";
		this.animationConfig = {
			xxs: { y: 0, duration: 350, ease: this.easingToken },
			xs: { y: 20, duration: 350, ease: this.easingToken },
			sm: { y: 40, duration: 350, ease: this.easingToken },
			md: { y: 80, duration: 350, ease: this.easingToken },
			lg: { y: 120, duration: 350, ease: this.easingToken },
		};
		if (window.innerWidth < 768) {
			this.animationConfig = {
				xxs: { y: 0, duration: 350, ease: this.easingToken },
				xs: { y: 20, duration: 350, ease: this.easingToken },
				sm: { y: 40, duration: 350, ease: this.easingToken },
				md: { y: 60, duration: 350, ease: this.easingToken },
				lg: { y: 90, duration: 350, ease: this.easingToken },
			};
		}
	}
	animateIn() {
		if (this.isAnimatedIn) return;
		this.isAnimatedIn = true;
		for (const staggerElement of this.staggerElements) {
			if (this.persist && this.container.classList.contains("has-staggered-in")) {
				if (!staggerElement.hasAttribute("data-stagger-motion-retrigger-target")) continue;
			}
			const staggerMotionType = staggerElement.dataset.staggerMotionType ?? "sm";
			const elementAnimationOrder = parseInt(staggerElement.dataset.staggerMotionIndex) - 1;
			let { duration, ease } = this.animationConfig[staggerMotionType];
			const delay = this.stagger * elementAnimationOrder;
			staggerElement.dataset.staggerMotionDelay = delay;
			gsap.to(staggerElement, {
				y: 0,
				opacity: 1,
				ease: ease,
				delay: delay,
				duration: duration / 1000,
				onComplete: () => {
					staggerElement.style.transform = "";
				},
			});
		}
		//needs to run at the end of this function
		this.container.classList.add("has-staggered-in");
	}
	animateElementsIn(elements) {
		for (const staggerElement of elements) {
			if (!this.staggerElements.includes(staggerElement)) this.staggerElements.push(staggerElement);
			const staggerMotionType = staggerElement.dataset.staggerMotionType ?? "sm";
			const elementAnimationOrder = parseInt(staggerElement.dataset.staggerMotionIndex) - 1;
			let { y } = this.animationConfig[staggerMotionType];
			let { duration, ease } = this.animationConfig[staggerMotionType];
			const delay = 0.05 * elementAnimationOrder;
			staggerElement.dataset.staggerMotionDelay = delay;
			gsap.fromTo(
				staggerElement,
				{ y: y, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					ease: ease,
					delay: delay,
					duration: duration / 1000,
					onComplete: () => {
						staggerElement.style.transform = "";
					},
				}
			);
		}
	}
	animateOut() {
		if (this.isAnimatedIn) {
			if (this.persist) {
				this.container.dispatchEvent(new CustomEvent("unobserve"));
				return;
			}
		}
		this.isAnimatedIn = false;
		for (const staggerElement of this.staggerElements) {
			if (this.persist && this.container.classList.contains("has-staggered-in")) {
				if (!staggerElement.hasAttribute("data-stagger-motion-retrigger-target")) continue;
			}
			const staggerMotionType = staggerElement.dataset.staggerMotionType ?? "sm";
			let { y } = this.animationConfig[staggerMotionType];
			if (staggerElement.dataset.fromY) {
				y = parseFloat(staggerElement.dataset.fromY);
			}
			gsap.killTweensOf([staggerElement]);
			gsap.set(staggerElement, {
				y: y,
				opacity: 0,
			});
		}
	}
	retriggerAnimation() {
		this.isAnimatedIn = false;
		this.animateOut();
		this.animateIn();
	}
	addEventListeners() {
		const motionRetriggers = [...this.container.querySelectorAll("[data-stagger-motion-retrigger-btn]")].filter((element) => {
			return element.closest("[data-stagger-motion-observer]") === this.container;
		});
		for (const motionRetrigger of motionRetriggers) {
			motionRetrigger.addEventListener("click", this.retriggerAnimation.bind(this));
		}
	}
}
