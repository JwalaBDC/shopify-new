/* class: DropdownInterface */
class DropdownInterface extends HTMLElement {
	constructor() {
		super();
		this.mode = this.getAttribute("dropdown-mode") || "sort-by";
		this.isDisabled = this.hasAttribute("disabled");

		this.button = this.querySelector("[dropdown-button]");
		this.buttonText = this.button.querySelector(".m-dropdown__btn-text");
		this.optionsList = this.querySelector(".m-dropdown__option-list");
		this.optionWrapper = this.querySelector("[dropdown-wrapper]");
		this.isMultiSelect = this.hasAttribute("[multi-select]");
		this.defaultLabel = this.button.getAttribute("default-value") ?? "";

		this.resetButton = this.querySelector("[dropdown-reset]");
		this.checkInputs = Array.from(this.optionWrapper.querySelectorAll("[type='checkbox']"));
		this.options = Array.from(this.optionWrapper.querySelectorAll("[role='option']"));
		this.optionCloseButton = this.optionWrapper.querySelector("[dropdown-close-button]");

		this.scrollContainer = this.optionWrapper.querySelector("[dropdown-close-button]");

		this.thumb = this.optionWrapper.querySelector(".js-verticalScrollbar__thumb");
		this.optionWrapper.setAttribute("tabindex", "-1");
		this.resetButton?.setAttribute("tabindex", "-1");
		this.optionWrapper.setAttribute("aria-hidden", "true");
		this.isExpanded = false;
		this.currentSearch = "";
		this.activeIndex = -1;

		this.selectOptions = this.options.length > 0 ? this.options : this.checkInputs.length > 0 ? this.checkInputs : [];
		if (this.optionWrapper.querySelector(".m-dropdown__option.--reset")) {
			this.selectOptions.push(this.optionWrapper.querySelector(".m-dropdown__option.--reset"));
		}
		if (this.checkInputs.length > 0) {
			this.checkInputs.forEach((input) => {
				input.setAttribute("tabindex", "-1");
			});
		}

		this.setPosition();
		// if (window.innerWidth < 768) {

		setTimeout(() => {
			this.makeDropDownInert();
		}, 1000);
		// }
		// console.log(":: DropdownInterface ::", this.mode);
	}

	handleFocus(event) {
		const { key } = event;
		if (key === "Tab") {
			if (event.shiftKey && document.activeElement === this.firstElement) {
				// Move focus to the last element if Shift+Tab on the first element
				event.preventDefault();
				this.lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === this.lastElement) {
				// Move focus to the first element if Tab on the last element
				event.preventDefault();
				this.firstElement.focus();
			}
		}
	}
	trapFocusInDropdown() {
		const component = this.optionWrapper;
		const focusableElements = component.querySelectorAll('a, button, input, textarea, select, [role], [tabindex]:not([tabindex="-1"])');
		this.firstElement = focusableElements[0];
		this.lastElement = focusableElements[focusableElements.length - 1];

		if (window.innerWidth < 768) {
			component.addEventListener("keydown", this.handleFocus.bind(this));
		}
	}

	releaseFocusInDropdown() {
		const component = this.optionWrapper;
		component.removeEventListener("keydown", this.handleFocus.bind(this));
	}

	makeDropDownInert() {
		const elements = this.optionWrapper.querySelectorAll("a, button");
		elements?.forEach((el) => el.setAttribute("inert", "true"));
		// this.optionCloseButton.setAttribute("disabled", "true");
	}

	makeDropDownInteractive() {
		const inertElements = this.optionWrapper.querySelectorAll("[inert]");
		inertElements?.forEach((el) => el.removeAttribute("inert"));
		this.optionCloseButton.removeAttribute("disabled");
	}

	handleToggle() {
		if (this.isDisabled) return;
		this.isExpanded = !this.isExpanded;

		this.button.setAttribute("aria-expanded", this.isExpanded);
		this.isExpanded ? this.animateDropdownMenuOpen() : this.animateDropdownMenuClose();

		if (window.innerWidth < 768) {
			this.isExpanded ? window.disableScroll() : window.enableScroll();
			document.documentElement.classList.add("is-dropdown-opened");
		}
		this.makeDropDownInteractive();
		this.trapFocusInDropdown();
	}
	handleOpen() {
		if (this.isExpanded) return;
		this.isExpanded = false;
		this.handleToggle();
	}

	animateDropdownMenuOpen() {
		this.setPosition();
		const scrollHeight = window.innerWidth >= 768 ? this.optionWrapper.scrollHeight : "100dvh";
		this.optionWrapper.setAttribute("aria-hidden", "false");
		gsap.fromTo(
			this.optionWrapper,
			{
				height: 0,
			},
			{
				height: scrollHeight,
				duration: window.innerWidth >= 768 ? 0.2 : 0.5,
				ease: "emphasized-decelerate",
				onComplete: () => {
					this.optionWrapper.setAttribute("tabindex", "0");
					this.resetButton?.setAttribute("tabindex", "0");
					window.innerWidth >= 768 ? this.optionWrapper.removeAttribute("style") : null;
					setTimeout(() => {
						this.thumb.verticalScrollbarInstance.setDimensions();
						this.thumb.verticalScrollbarInstance.extraSpace = 5;
					}, 100);

					if (this.checkInputs.length > 0) {
						this.checkInputs.forEach((input) => {
							input.setAttribute("tabindex", "0");
						});
						this.checkInputs[0].focus();
					}
				},
			}
		);
		gsap.fromTo(
			this.optionWrapper.querySelectorAll(".m-dropdown__option"),
			{
				opacity: 0,
				y: window.innerWidth >= 768 ? -4 : -8,
			},
			{
				opacity: 1,
				y: 0,
				duration: window.innerWidth >= 768 ? 0.3 : 0.4,
				stagger: window.innerWidth >= 768 ? 0.03 : 0.05,
				ease: "standard-decelerate",
			}
		);
	}

	animateDropdownMenuClose() {
		gsap.to(this.optionWrapper, {
			height: 0,
			duration: 0.1,
			ease: "emphasized",
			onComplete: () => {
				this.optionWrapper.setAttribute("aria-hidden", !this.isExpanded);
				this.optionWrapper.setAttribute("tabindex", "-1");
				this.resetButton?.setAttribute("tabindex", "-1");
			},
		});
		if (this.checkInputs.length > 0) {
			this.checkInputs.forEach((input) => {
				input.setAttribute("tabindex", "-1");
			});
		}
	}

	handleClose() {
		if (!this.isExpanded) return;

		this.isExpanded = false;
		this.button.setAttribute("aria-expanded", "false");
		this.animateDropdownMenuClose();
		if (window.innerWidth < 768) {
			window.enableScroll();
			document.documentElement.classList.remove("is-dropdown-opened");
		}
		this.releaseFocusInDropdown();
		this.makeDropDownInert();
		this.button.focus();
	}

	handleToggleCheck(event) {
		let count = this.optionWrapper.querySelectorAll("[type='checkbox']:checked").length;
		if (count <= 0) {
			this.buttonText.removeAttribute("data-count");
		} else {
			this.buttonText.setAttribute("data-count", count > 0 ? `(${count})` : "");
		}
		if (this.resetButton && this.resetButton.parentElement) {
			this.resetButton.parentElement.setAttribute("aria-hidden", count == 0);
		}
	}

	handleSelect(e) {
		if (e.currentTarget.hasAttribute("dropdown-reset")) return;
		this.options.forEach((optionInput) => {
			optionInput.setAttribute("aria-selected", false);
		});
		const input = e.currentTarget;

		let isSelected = input.getAttribute("aria-selected") === "true";
		this.buttonText.textContent = input.getAttribute("value");
		input.setAttribute("aria-selected", !isSelected);
		if (this.resetButton && this.resetButton.parentElement) {
			this.resetButton.parentElement.setAttribute("aria-hidden", false);
		}

		if (this.mode == "sort-by") {
			this.handleClose();
		}
	}

	scrollToLastElement() {
		const lastElement = this.options[this.options.length - 1];
		if (lastElement) {
			this.optionsList.scrollTop = lastElement.offsetTop;
		}
	}

	handleReset(e) {
		e.preventDefault();
		if (this.optionsList) this.optionsList.scrollTop = 0;
		this.resetDropdown();
	}

	resetDropdown() {
		if (this.checkInputs.length > 0) {
			let inputs = this.optionWrapper.querySelectorAll("[type='checkbox']:checked");
			inputs.forEach((input) => {
				input.checked = false;
			});
			this.buttonText.removeAttribute("data-count");
		}

		if (this.options.length > 0) {
			this.options.forEach((optionInput) => {
				if (optionInput.getAttribute("aria-selected") === "true") {
					optionInput.setAttribute("aria-selected", false);
				}
				this.buttonText.textContent = this.defaultLabel;
			});
		}
		if (this.resetButton && this.resetButton.parentElement) {
			this.resetButton.parentElement.setAttribute("aria-hidden", true);
		}
		this.handleClose();
	}

	handleOutsideClick(event) {
		if (this.isExpanded && !this.contains(event.target)) {
			if (this.mode == "cart") return;
			this.handleClose();
		}
	}

	setPosition() {
		if (window.innerWidth < 768) return;
		this.buttonOffset = this.button.getBoundingClientRect().top + 32 + 8;
		this.optionHeight = this.optionWrapper.getBoundingClientRect().height;
		this.optionRight = this.optionWrapper.getBoundingClientRect().right;
		this.optionWidth = this.optionWrapper.getBoundingClientRect().width;

		this.windownWidth = window.innerWidth;
		this.windownHeight = window.innerHeight;

		var relativeOffset = this.buttonOffset - this.optionHeight;
		const isBottom = relativeOffset < this.windownHeight / 2;
		const isRight = this.optionRight - this.optionWidth > this.windownWidth / 2;

		if (this.mode == "cart") {
			this.optionWrapper.classList.add("-right");
		} else this.optionWrapper.classList[isRight ? "add" : "remove"]("-right");
	}

	// handleKeyDown() {
	// 	if (this.selectOptions.length > 0 && this.isExpanded) {
	// 		const key = event.key.toLowerCase();
	// 		if ((key >= "a" && key <= "z") || (key >= "0" && key <= "9")) {
	// 			this.currentSearch += key;
	// 			this.selectOptionBySearch();
	// 		}
	// 	}
	// }
	handleAlphanumericKeyPress(key) {
		// Capture the key pressed
		if (this.selectOptions.length > 0 && this.isExpanded) {
			// Check if the key is alphanumeric
			if (!/^[a-zA-Z0-9]$/.test(key)) return;

			// Get the current input value
			this.keySearch = key.toLowerCase();

			const matchingOption = this.selectOptions.find((optionEl, index) => {
				return index > this.activeIndex && optionEl.getAttribute("value").toLowerCase().startsWith(this.keySearch);
			});
			if (matchingOption) {
				this.activeIndex = this.selectOptions.indexOf(matchingOption);
				this.updateCustomSelectHovered(this.activeIndex, "start");
			}
		}
	}

	handleKeyDown(event) {
		const { key } = event;
		const openKeys = ["Enter", " "];
		if (!this.isExpanded && openKeys.includes(key) && document.activeElement == this.button) {
			event.preventDefault();
			this.handleToggle();
		} else {
			switch (key) {
				case "ArrowDown":
					event.preventDefault();
					// this.updateCustomSelectHovered(this.activeIndex + 1, "end");
					this.navigateOptions(1);
					break;
				case "ArrowUp":
					event.preventDefault();
					// this.updateCustomSelectHovered(this.activeIndex - 1, "start");
					this.navigateOptions(-1);
					break;
				case "Enter":
					event.preventDefault();
					this.selectOption();
					break;
				case "Escape":
					event.preventDefault();
					this.handleClose();
					break;
				default:
					// event.preventDefault();
					this.handleAlphanumericKeyPress(key);
					break;
			}
		}
	}
	navigateOptions(direction) {
		if (this.selectOptions.length === 0 || !this.isExpanded) return;

		let initialIndex = this.activeIndex;
		do {
			this.activeIndex = (this.activeIndex + direction + this.selectOptions.length) % this.selectOptions.length;
		} while (this.selectOptions[this.activeIndex].getAttribute("aria-hidden") === "true" && this.activeIndex !== initialIndex);

		if (this.selectOptions[this.activeIndex].getAttribute("aria-hidden") === "true") {
			this.activeIndex = -1;
		}
		// Update focus and classes
		this.selectOptions.forEach((option, index) => {
			if (option && option.getAttribute("aria-hidden") !== "true") {
				option.classList[index === this.activeIndex ? "add" : "remove"]("has-focus");
				// option.focus();
				// if (index === this.activeIndex) {
				// }
			}
		});

		if (this.activeIndex !== -1) {
			this.selectOptions[this.activeIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	}
	selectOption() {
		if (this.activeIndex === -1 || !this.isExpanded) return;
		if (this.selectOptions[this.activeIndex]) {
			this.selectOptions[this.activeIndex].focus();
			this.selectOptions[this.activeIndex].click();
		}
	}

	updateCustomSelectHovered(index, scrollPosition) {
		if (this.selectOptions.length === 0 || !this.isExpanded) return;
		this.activeIndex = index;
		this.selectOptions.forEach((optionEl) => {
			optionEl.setAttribute("aria-selected", false);
		});
		const selectedEl = this.selectOptions[index];
		if (selectedEl) {
			selectedEl.setAttribute("aria-selected", true);
			selectedEl.scrollIntoView({ block: scrollPosition });
		}
	}
	handleKeyDownCheckBox(event) {
		const checkbox = event.target;

		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			checkbox.checked = !checkbox.checked;
			this.handleToggleCheck(event);
			checkbox.focus();
		}
	}
	connectedCallback() {
		this.button.addEventListener("click", this.handleToggle.bind(this));
		this.resetButton?.addEventListener("click", this.handleReset.bind(this));
		this.optionCloseButton.addEventListener("click", this.handleClose.bind(this));

		if (this.checkInputs.length > 0) {
			this.checkInputs.forEach((input) => {
				input.addEventListener("click", this.handleToggleCheck.bind(this));
				input.addEventListener("keydown", this.handleKeyDownCheckBox.bind(this));
			});
		}
		if (this.options.length > 0) {
			this.options.forEach((input) => {
				input.addEventListener("click", this.handleSelect.bind(this));
			});
		}

		document.addEventListener("click", this.handleOutsideClick.bind(this));
		document.addEventListener("keydown", this.handleKeyDown.bind(this));

		if (window.innerWidth > 768) {
			window.addEventListener("scroll", this.handleClose.bind(this));
		}

		window.addEventListener("resize", this.setPosition.bind(this));
	}

	disconnectedCallback() {
		this.button.removeEventListener("click", this.handleToggle.bind(this));
		this.resetButton?.removeEventListener("click", this.handleReset.bind(this));
		this.optionCloseButton.removeEventListener("click", this.handleClose.bind(this));

		document.removeEventListener("click", this.handleOutsideClick.bind(this));
		document.removeEventListener("keydown", this.handleKeyDown.bind(this));

		if (this.options.length > 0) {
			this.options.forEach((input) => {
				input.removeEventListener("click", this.handleSelect.bind(this));
			});
		}

		if (window.innerWidth > 768) {
			window.removeEventListener("scroll", this.handleClose.bind(this));
		}

		window.removeEventListener("resize", this.setPosition.bind(this));
	}
}

customElements.define("dropdown-interface", DropdownInterface);
