export default class Hero {
	constructor({ element }) {
		this.container = element;
		this.heroImgWrapper = this.container.querySelector('[data-hero-motion-element="img-wrapper"]');
		this.heroVideoWrapper = this.container.querySelector('[data-hero-motion-element="video-wrapper"]');
		this.heroSplitTitle = this.container.querySelector('[data-hero-motion-element="title"]');
		this.heroImg = this.container.querySelector('[data-hero-motion-element="img"]');
		this.heroVideoPoster = this.container.querySelector('[data-hero-motion-element="video-poster"]');
		this.heroVideo = this.container.querySelector('[data-hero-motion-element="video"]');
		this.checkImgLoadStatus();
		this.resizeTimer = false;
		this.windowHeight = window.innerHeight;
		this.scrollY = window.scrollY;
		this.easedScale = 1;
		this.setOffsets();
		requestAnimationFrame(this.tick.bind(this));
		this.addEventListeners();
	}
	checkImgLoadStatus() {
		if (this.heroVideo) {
			if (this.heroVideoPoster.complete) {
				this.heroVideoPoster.classList.add("is-loaded");
				this.animateIn();
			} else {
				this.heroVideoPoster.addEventListener("load", () => {
					this.heroVideoPoster.classList.add("is-loaded");
					this.animateIn();
				});
			}
		} else if (this.heroImg) {
			if (this.heroImg.complete) {
				this.animateIn();
			} else {
				this.heroImg.addEventListener("load", () => {
					this.animateIn();
				});
			}
		}
	}
	animateIn() {
		this.heroSplitTitle?.motionInstance?.animateIn();
		this.container.classList.add("animate-in");
	}
	setOffsets() {
		this.elementTop = this.container.getBoundingClientRect().top + window.scrollY;
	}
	updateScroll(scrollY) {
		this.scrollY = scrollY;
	}
	onResize() {
		clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout(() => {
			this.windowHeight = window.innerHeight;
		}, 100);
	}
	tick() {
		requestAnimationFrame(this.tick.bind(this));
		const elementTop = this.elementTop - this.scrollY;
		const scale = gsap.utils.mapRange(0, -this.windowHeight, 1, 1.08, elementTop);
		const clampedScale = gsap.utils.clamp(1, 1.08, scale);
		const easedScale = gsap.utils.interpolate(this.easedScale, clampedScale, 0.24);
		this.easedScale = easedScale;
		if (this.heroImgWrapper) {
			gsap.set(this.heroImgWrapper, {
				scale: easedScale,
				transformOrigin: "top center",
				overwrite: true,
			});
		}
		if (this.heroVideoWrapper) {
			gsap.set(this.heroVideoWrapper, {
				scale: easedScale,
				transformOrigin: "top center",
				overwrite: true,
			});
		}
	}
	addEventListeners() {
		window.scrollManager.subscribe(this.updateScroll.bind(this));
	}
}
const heroMotionContainers = document.querySelectorAll("[data-motion='hero']");
for (let heroMotionContainer of heroMotionContainers) {
	new Hero({ element: heroMotionContainer });
}
