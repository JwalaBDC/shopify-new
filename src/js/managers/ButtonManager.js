class ButtonManager {
	static init() {
		const clickableElements = document.querySelectorAll("a, button, card-link-interface, [card-link-interface]");
		clickableElements.forEach((el) => {
			el.addEventListener("touchstart", this.addPressedState, { passive: true });
			el.addEventListener("touchend", this.removePressedState, { passive: true });
			el.addEventListener("touchcancel", this.removePressedState, { passive: true });
		});
	}
	static addPressedState(e) {
		e.currentTarget.classList.add("is-pressed");
	}
	static removePressedState(e) {
		e.currentTarget.classList.remove("is-pressed");
	}
}
ButtonManager.init();
