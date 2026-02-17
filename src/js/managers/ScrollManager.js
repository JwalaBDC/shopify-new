class ScrollManager {
	constructor() {
		this.scrollY = 0;
		this.isScrolling = false;
		this.listeners = [];
	}

	init() {
		this.scrollY = window.scrollY;

		window.addEventListener(
			"scroll",
			this.updateScroll.bind(this),
			{ passive: true }
		);
	}

	updateScroll() {
		this.scrollY = window.scrollY;

		if (!document.body.classList.contains("is-scroll-locked")) {
			this.notifyListeners();
		}
	}

	notifyListeners() {
		this.listeners.forEach((listener) => listener(this.scrollY));
	}

	subscribe(listener) {
		this.listeners.push(listener);
	}

	unsubscribe(listener) {
		this.listeners = this.listeners.filter((l) => l !== listener);
	}
}

export default new ScrollManager();