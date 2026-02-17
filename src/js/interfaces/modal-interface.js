class ModalInterface extends HTMLElement {
	constructor() {
		super();
		this.openModalButtons = [...document.querySelectorAll("[modal-interface-open]")];
		// this.modals = [...document.querySelectorAll("[modal-interface]")];
		this.openClickHandler = this.createOpenClickHandler();
		this.closeClickHandler = this.createCloseClickHandler();
		this.openModalButtons.forEach((element) => {
			element.setAttribute("tabindex", "0");
			element.setAttribute("aria-haspopup", true);
			element.setAttribute("aria-expanded", false);
		});
	}

	createOpenClickHandler(e) {
		return (e) => {
			e.preventDefault();
			this.scrollPositionBeforeOpeningModal = window.scrollY;
			let trigger = e.currentTarget;
			trigger.setAttribute("aria-expanded", true);
			// Check for scroll in modal - disrupts the hidden menu
			// if (trigger.hasAttribute("modal-section-id")) {
			// 	if (trigger.hasAttribute("modal-tab-name")) {
			// 		this.goToSection(this, trigger.getAttribute("modal-section-id"), trigger.getAttribute("modal-tab-name"));
			// 	} else this.goToSection(this, trigger.getAttribute("modal-section-id"));
			// } else {
			// 	this.smoothScrollTo(this, this.querySelector(`[modal-interface-content] section`), 2);
			// }
			//
			this.setAttribute("aria-hidden", false);
			const modalContent = this.querySelector("[modal-interface-content]");
			modalContent.addEventListener("click", (e) => e.stopPropagation());
			const closeModalButton = this.querySelector("[modal-interface-close]");
			const closeModalButtons = this.querySelectorAll(".ui-modal__close");
			// Setup close and keydown event listeners specific to this modal
			closeModalButton && closeModalButton.addEventListener("click", () => this.closeClickHandler(this, trigger));

			closeModalButtons.forEach((btn) => btn.addEventListener("click", () => this.closeClickHandler(this, trigger)));
			!this.classList.contains("ui-modal__lock") &&
				this.addEventListener("click", (e) => {
					if (this === e.target) this.closeClickHandler(this, trigger);
				});

			// Show modal
			this.classList.add("ui-modal--open");
			// document.documentElement.classList.add("is-modal-open");
			this.makeOtherElementsInert(this);
			this.closeModalFn = () => this.closeClickHandler(this, trigger);
			window.closeModal = this.closeModalFn;
			if (this.dataset.nofix) {
				if (this.dataset.nofix == "desktop" && window.innerWidth >= 1024) {
					if (window.lenis) {
						window.lenis.stop();
					} else {
						document.body.classList.add("-scrollLock");
					}
				} else if (this.dataset.nofix == "mobile" && window.innerWidth <= 1024) {
					if (window.lenis) {
						window.lenis.stop();
					} else {
						document.body.classList.add("-scrollLock");
					}
				} else if (this.dataset.nofix == "desktop-mobile" && this.dataset.nofix != "") {
					if (window.lenis) {
						window.lenis.stop();
					} else {
						document.body.classList.add("-scrollLock");
					}
				} else {
					window.disableScroll();
				}
			} else {
				window.disableScroll();
			}
			if (this && trigger) {
				this.focusOnOpen(this, trigger);
			}
			// Add global click listener to handle clicks outside the combobox
		};
	}

	createCloseClickHandler() {
		return (e, trigger) => {
			if (this.classList.contains("ui-modal--open")) {
				// Hide modal
				this.classList.remove("ui-modal--open");
				this.setAttribute("aria-hidden", true);
				const videos = this.querySelectorAll("video");

				videos.forEach((video) => {
					video.pause();
				});

				// document.documentElement.classList.remove("is-modal-open");

				// Remove inert attribute from other elements
				this.removeOtherElementsInert();
				// Return focus to the element that opened the modal
				trigger.focus();
				trigger.setAttribute("aria-expanded", false);
				if (this.dataset.nofix) {
					if (this.dataset.nofix == "desktop" && window.innerWidth >= 1024) {
						if (window.lenis && window.lenis.__isStopped) {
							window.lenis.start();
						} else {
							document.body.classList.remove("-scrollLock");
						}
					} else if (this.dataset.nofix == "mobile" && window.innerWidth <= 1024) {
						if (window.lenis && window.lenis.__isStopped) {
							window.lenis.start();
						} else {
							document.body.classList.remove("-scrollLock");
						}
					} else if (this.dataset.nofix == "desktop-mobile" && this.dataset.nofix != "") {
						if (window.lenis && window.lenis.__isStopped) {
							window.lenis.start();
						} else {
							document.body.classList.remove("-scrollLock");
						}
					} else {
						window.enableScroll();
						window.scrollTo(0, this.scrollPositionBeforeOpeningModal);
					}
				} else {
					window.enableScroll();
					window.scrollTo(0, this.scrollPositionBeforeOpeningModal);
				}

				// Clear the stored closeModal function
				this.closeModalFn = null;
				window.closeModal = null;
			}
		};
	}

	smoothScrollTo(modal, element, index) {
		setTimeout(() => {
			// console.log("smoothScrollTo", element, index);
			element &&
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
		}, 100);
	}

	goToSection(modal, sectionName, tabName = null) {
		let targetSection,
			targetTabs = null;
		if (tabName != null) {
			targetSection = modal.querySelector(`#${sectionName}`);
			targetTabs = modal.querySelectorAll(`[tab-slider-menu]`);
			targetTabs.forEach((tab) => {
				if (tab.textContent.trim().split(" ").join("-").toLowerCase() == tabName.trim().split(" ").join("-").toLowerCase()) {
					// console.log("clicked tab");
					tab.click();
				}
			});
			// console.log("going to that section targetSection targetTabs", `#${sectionName}`, targetSection, targetTabs);
			targetSection = modal.querySelector(`#${sectionName}`);

			this.smoothScrollTo(modal, targetSection, 2);
		} else {
			targetSection = modal.querySelector(`#${sectionName}`);
			// console.log(targetSection);
			this.smoothScrollTo(modal, targetSection, 2);
		}
	}

	focusOnOpen(modal, trigger) {
		const focusableElements = this.getFocusableElements(modal);
		if (focusableElements) {
			this.addEventListener("keydown", (e) => this.handleKeyDown(e, modal, focusableElements, trigger));
		}

		if (this.querySelector(".ui-modal__header-title") && this.querySelector(".ui-modal__header").children[0]) {
			// Focus the modal title or first focusable element
			(this.querySelector(".ui-modal__header-title") || this.querySelector(".ui-modal__header").children[0] || focusableElements.first).focus();
		}
		// window.disableScroll();
	}

	handleKeyDown(e, modal, focusableElements, trigger) {
		const { first, last } = focusableElements;
		switch (e.key) {
			case "Escape":
				e.preventDefault();
				this.closeClickHandler(modal, trigger);
				break;
			case "Tab":
				this.trapTabKey(e, first, last);
				break;
		}
	}

	getFocusableElements(modal) {
		const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], .ui-modal__header-title';
		const focusableElements = Array.from(this.querySelectorAll(focusableElementsString));
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

	connectedCallback() {
		this.openModalButtons.forEach((btn) => {
			if (btn.getAttribute("modal-name") === this.id) {
				btn.addEventListener("click", this.openClickHandler);
			}
		});
	}

	disconnectedCallback() {
		this.openModalButtons.forEach((btn) => {
			if (btn.getAttribute("modal-name") === this.id) {
				btn.removeEventListener("click", this.openClickHandler);
			}
		});
	}
}

customElements.define("modal-interface", ModalInterface);
