/**
 * class: ModalManager
 */
class ModalManager {
	constructor() {
		this.modalTriggers = document.querySelectorAll("[data-modal-name]");
		this.scrollPositionBeforeOpeningModal = 0;
		this.init();
		console.log("this.modalTriggers", this.modalTriggers);
	}
	init() {
		this.addEventListeners();
		this.observeDOMChanges();
	}
	addEventListeners() {
		this.modalTriggers.forEach((trigger) => {
			trigger.addEventListener("click", () => this.openModal(trigger));
		});
	}
	openModal(trigger) {
		this.scrollPositionBeforeOpeningModal = window.scrollY;
		console.log("open", this.scrollPositionBeforeOpeningModal);
		// Determine which modal to open based on the trigger's data attribute
		const modalName = trigger.dataset.modalName;
		const modal = document.querySelector(`[data-modal="${modalName}"]`);
		const modalContent = modal.querySelector(".ui-modal__content");
		modalContent.addEventListener("click", (e) => e.stopPropagation());
		const closeModalButton = modal.querySelector(".ui-modal__close-button");
		const focusableElements = this.getFocusableElements(modal);
		// Setup close and keydown event listeners specific to this modal
		closeModalButton.addEventListener("click", () => this.closeModal(modal, trigger));
		modal.addEventListener("keydown", (e) => this.handleKeyDown(e, modal, focusableElements, trigger));
		modal.addEventListener("click", () => this.closeModal(modal, trigger));
		// Show modal
		modal.classList.add("ui-modal--open");
		document.documentElement.classList.add("is-modal-open");
		this.makeOtherElementsInert(modal);
		// Focus the modal title or first focusable element
		(modal.querySelector("#modalHeading") || focusableElements.first).focus();
		window.disableScroll();

		this.closeModalFn = () => this.closeModal(modal, trigger);
		window.closeModal = this.closeModalFn;
	}

	closeModal(modal, trigger) {
		// Hide modal
		modal.classList.remove("ui-modal--open");
		document.documentElement.classList.remove("is-modal-open");

		// Remove inert attribute from other elements
		this.removeOtherElementsInert();
		// Return focus to the element that opened the modal
		trigger.focus();
		window.enableScroll();
		window.scrollTo(0, this.scrollPositionBeforeOpeningModal);
		console.log("close", this.scrollPositionBeforeOpeningModal);
		// Clear the stored closeModal function
		this.closeModalFn = null;
		window.closeModal = null;
	}

	handleKeyDown(e, modal, { first, last }, trigger) {
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

	getFocusableElements(modal) {
		const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
		const focusableElements = Array.from(modal.querySelectorAll(focusableElementsString));
		return {
			first: focusableElements[0],
			last: focusableElements[focusableElements.length - 1],
		};
	}

	trapTabKey(e, first, last) {
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	makeOtherElementsInert(modal) {
		const elements = document.querySelectorAll("main");
		elements.forEach((el) => {
			if (el !== modal) el.setAttribute("inert", "true");
		});
	}
	removeOtherElementsInert() {
		const elements = document.querySelectorAll("[inert]");
		elements.forEach((el) => el.removeAttribute("inert"));
	}

	observeDOMChanges() {
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
const modalManager = new ModalManager();
