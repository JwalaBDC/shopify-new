class ModalManager {
	static modalTriggers = document.querySelectorAll("[data-modal-name]");
	static scrollPositionBeforeOpeningModal = 0;
	static closeModalFn = null;

	static init() {
		this.addEventListeners();
		this.observeDOMChanges();
	}

	static addEventListeners() {
		this.modalTriggers.forEach((trigger) => {
			trigger.addEventListener("click", () => this.openModal(trigger));
		});
	}

	static openModal(trigger) {
		this.scrollPositionBeforeOpeningModal = window.scrollY;
		console.log("open", this.scrollPositionBeforeOpeningModal);

		const modalName = trigger.dataset.modalName;
		const modal = document.querySelector(`[data-modal="${modalName}"]`);
		const modalContent = modal.querySelector(".ui-modal__content");
		modalContent.addEventListener("click", (e) => e.stopPropagation());

		const closeModalButton = modal.querySelector(".ui-modal__close-button");
		const focusableElements = this.getFocusableElements(modal);

		closeModalButton.addEventListener("click", () => this.closeModal(modal, trigger));
		modal.addEventListener("keydown", (e) => this.handleKeyDown(e, modal, focusableElements, trigger));
		modal.addEventListener("click", () => this.closeModal(modal, trigger));

		modal.classList.add("ui-modal--open");
		document.documentElement.classList.add("is-modal-open");
		this.makeOtherElementsInert(modal);

		(modal.querySelector("#modalHeading") || focusableElements.first).focus();
		window.disableScroll();

		this.closeModalFn = () => this.closeModal(modal, trigger);
		window.closeModal = this.closeModalFn;
	}

	static closeModal(modal, trigger) {
		modal.classList.remove("ui-modal--open");
		document.documentElement.classList.remove("is-modal-open");
		this.removeOtherElementsInert();
		trigger.focus();
		window.enableScroll();
		window.scrollTo(0, this.scrollPositionBeforeOpeningModal);
		console.log("close", this.scrollPositionBeforeOpeningModal);

		this.closeModalFn = null;
		window.closeModal = null;
	}

	static handleKeyDown(e, modal, { first, last }, trigger) {
		switch (e.key) {
			case "Escape":
				e.preventDefault();
				this.closeModal(modal, trigger);
				break;
			case "Tab":
				this.trapTabKey(e, first, last);
				break;
		}
	}

	static getFocusableElements(modal) {
		const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
		const focusableElements = Array.from(modal.querySelectorAll(focusableElementsString));
		return {
			first: focusableElements[0],
			last: focusableElements[focusableElements.length - 1],
		};
	}

	static trapTabKey(e, first, last) {
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	static makeOtherElementsInert(modal) {
		const elements = document.querySelectorAll("main");
		elements.forEach((el) => {
			if (el !== modal) el.setAttribute("inert", "true");
		});
	}

	static removeOtherElementsInert() {
		const elements = document.querySelectorAll("[inert]");
		elements.forEach((el) => el.removeAttribute("inert"));
	}

	static observeDOMChanges() {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.type === "childList") {
					this.modalTriggers = document.querySelectorAll("[data-modal-name]");
					this.addEventListeners();
				}
			});
		});

		observer.observe(document.body, { childList: true, subtree: true });
	}
}

ModalManager.init();
