class ResizeManager {
	constructor() {
		this.width = Math.floor(document.documentElement.getBoundingClientRect().width);
		this.height = window.innerHeight;
		this.header = document.querySelector("header");
		this.secondaryNav = document.querySelector("secondary-nav-interface");
		this.listeners = [];
		window.addEventListener("load", this.updateSize.bind(this));
		window.addEventListener("resize", this.debounce(this.updateSize.bind(this), 200));
	}
	updateSize() {
		document.documentElement.style.removeProperty("--h-header");
		this.width = Math.floor(document.documentElement.getBoundingClientRect().width);
		this.height = window.innerHeight;
		document.documentElement.style.setProperty("--w-viewport", `${this.width}px`);
		document.documentElement.style.setProperty("--h-viewport", `${this.height}px`);
		if (this.header) {
			const headerHeight = Math.floor(this.header.getBoundingClientRect().height);
			document.documentElement.style.setProperty("--h-header", `${headerHeight}px`);
		}
		if (this.secondaryNav) {
			const secondaryNavHeight = this.secondaryNav.offsetHeight;
			document.documentElement.style.setProperty("--h-sticky-header", `${secondaryNavHeight}px`);
		}
		this.notifyListeners();
	}
	notifyListeners() {
		this.listeners.forEach((listener) => listener(this.width, this.height));
	}
	subscribe(listener) {
		this.listeners.push(listener);
	}
	unsubscribe(listener) {
		this.listeners = this.listeners.filter((l) => l !== listener);
	}
	debounce(func, wait, immediate) {
		let timeout;
		return function executedFunction() {
			const context = this,
				args = arguments;
			const later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
}

window.resizeManager = new ResizeManager();
