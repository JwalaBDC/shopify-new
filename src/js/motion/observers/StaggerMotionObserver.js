import Stagger from "../classes/Stagger.js";
class StaggerMotionObserver {
	constructor() {
		this.element = document.documentElement;
		this.animationSelectors = {
			staggerAnimations: "[data-stagger-motion-observer]",
		};
		this.init();
	}

	init() {
		this.queryDOM();
		this.createObserver();
		this.observeElements();
	}

	queryDOM() {
		this.elements = {};
		for (const key in this.animationSelectors) {
			const selector = this.animationSelectors[key];
			this.elements[key] = Array.from(this.element.querySelectorAll(selector));
		}
	}

	createObserver() {
		const deviceRootMargin = window.innerWidth < 768 ? "-50px" : "-100px";
		this.intersectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.staggerInstance.animateIn();
					} else {
						entry.target.staggerInstance.animateOut();
					}
				});
			},
			{
				rootMargin: `0px 0px ${deviceRootMargin} 0px`,
			}
		);
	}
	observeElements() {
		this.elements.staggerAnimations.forEach((el) => {
			el.staggerInstance = new Stagger({ element: el });
			this.intersectionObserver.observe(el);
			el.addEventListener("unobserve", () => {
				this.intersectionObserver.unobserve(el);
			});
		});
	}
}

export const staggerMotionObserverInstance = new StaggerMotionObserver();
