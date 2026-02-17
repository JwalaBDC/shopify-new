export default class ImageReveal {
	constructor({ element }) {
		this.container = element;
		this.wrappers = this.container.querySelectorAll("[data-image-reveal-motion-element='image-wrapper']");
		this.imgs = this.container.querySelectorAll("[data-image-reveal-motion-element='image']");
		this.persist = true;
		if (this.container.hasAttribute("data-image-reveal-motion-persist")) {
			if (this.container.getAttribute("data-image-reveal-motion-persist") === "false") {
				this.persist = false;
			}
		}
		this.init();
		this.animateOut();
		this.addEventListeners();
		gsap.registerPlugin(CustomEase);
		CustomEase.create("emphasized-decelerate", "0.05, 0.7, 0.1, 1");
	}
	init() {}
	animateIn() {
		if (this.isAnimatedIn) return;
		this.isAnimatedIn = true;
		const revealAnim = gsap.timeline();
		revealAnim.fromTo(
			this.wrappers,
			{
				opacity: 0,
				clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
				webkitClipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
			},
			{
				opacity: 1,
				clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", //0% is important. Just 0 doesn't work
				webkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
				duration: 0.6,
				ease: "emphasized-decelerate",
				overwrite: true,
			},
			0
		);
		revealAnim.fromTo(
			this.imgs,
			{
				opacity: 0,
				scale: 1.2,
			},
			{
				opacity: 1,
				scale: 1,
				duration: 0.6,
				ease: "emphasized-decelerate",
				overwrite: true,
			},
			0
		);
	}
	animateOut() {
		if (this.isAnimatedIn) {
			if (this.persist) {
				this.container.dispatchEvent(new CustomEvent("unobserve"));
				return;
			}
		}
		this.isAnimatedIn = false;
		gsap.set(this.wrappers, {
			opacity: 0,
			clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
			webkitClipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
		});
		gsap.set(this.imgs, {
			opacity: 0,
			scale: 1.2,
		});
	}
	retriggerAnimation() {
		this.isAnimatedIn = false;
		this.animateOut();
		this.animateIn();
	}
	addEventListeners() {
		const motionRetriggers = this.container.querySelectorAll("[data-image-reveal-motion-retrigger-button]");
		for (const motionRetrigger of motionRetriggers) {
			motionRetrigger.addEventListener("click", this.retriggerAnimation.bind(this));
		}
	}
}
