export default class CSSClass {
	constructor({ element }) {
		this.element = element;
		this.animationClasses = this.element.getAttribute("data-motion-observer-classes").replace(/\s+/g, "").split(",");
		this.persist = true;
		if (this.element.hasAttribute("data-persist")) {
			if (this.element.getAttribute("data-persist") === "false") {
				this.persist = false;
			}
		}
		this.animateOut();
	}
	animateIn() {
		if (this.isAnimatedIn) return;
		this.isAnimatedIn = true;
		if (this.animationClasses && this.animationClasses.length > 0) {
			this.animationClasses.forEach((animationClass) => {
				if (!this.element.classList.contains(animationClass)) this.element.classList.add(animationClass);
			});
		}
	}
	animateOut() {
		if (this.isAnimatedIn) {
			if (this.persist === false) {
				this.isAnimatedIn = false;
				if (this.animationClasses && this.animationClasses.length > 0) {
					this.animationClasses.forEach((animationClass) => {
						this.element.classList.remove(animationClass);
					});
				}
				return;
			}
			this.element.dispatchEvent(new CustomEvent("unobserve"));
			return;
		}
	}
}
