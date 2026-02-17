import { calculateLines, splitByWords } from "./../../utils/splitText.js";
export default class SplitTitle {
	constructor({ element }) {
		this.container = element;
		if (element.getAttribute("data-motion-element") === "split-title") {
			this.elements = [element];
		} else {
			this.elements = [...element.querySelectorAll('[data-motion-element="split-title"]')];
		}
		this.init();
	}
	init() {
		this.elements.forEach((el) => {
			splitByWords(el);
			el.words = el.querySelectorAll(".word");
			el.lines = calculateLines(el.words);
		});
	}
	animateIn() {
		if (this.isAnimatedIn) return;
		this.isAnimatedIn = true;
		this.elements.forEach((el) => {
			gsap.set(el, {
				opacity: 1,
			});
			el.lines.forEach((words, index) => {
				words.forEach((el, wordIndex) => {
					gsap.fromTo(
						el,
						{
							opacity: 0,
							yPercent: 100,
						},
						{
							opacity: 1,
							yPercent: 0,
							duration: 0.8,
							force3D: true,
							ease: "expo.out",
						}
					);
				});
			});
		});
	}
	animateOut() {
		if (this.isAnimatedIn) {
			this.container.dispatchEvent(new CustomEvent("unobserve"));
			return;
		}
		this.elements.forEach((el) => {
			gsap.set(el, {
				opacity: 0,
			});
			el.lines.forEach((words, index) => {
				words.forEach((el, wordIndex) => {
					gsap.set(el, {
						opacity: 0,
						yPercent: 100,
					});
				});
			});
		});
	}
}
