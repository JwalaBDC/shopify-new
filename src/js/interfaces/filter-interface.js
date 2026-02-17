class FilterInterface extends HTMLElement {
	constructor() {
		super();
		this.openFilterButtons = [...document.querySelectorAll("[filter-interface-open]")];
		this.openFilterCounters = [...document.querySelectorAll("[filter-count]")];
		// this.filters = [...document.querySelectorAll("[filter-interface]")];
		this.openClickHandler = this.createOpenClickHandler();
		this.closeClickHandler = this.createCloseClickHandler();

		// Initialize state tracking
		this.filterInputs = [];
		this.clearButton = null;
		this.filterNarrator = null;
		this.applyButton = null;
		this.previousFilters = {};
		this.setupFilterInputs();
		window.addEventListener("load", () => {
			this.getActiveFilterCount();
			this.handleButtonState();
		});
	}

	createOpenClickHandler(e) {
		return (e) => {
			e.preventDefault();
			let trigger = e.currentTarget;
			this.trigger = e.currentTarget;

			this.setAttribute("aria-hidden", false);
			this.classList.add("ui-filter-modal--open");

			const closeModalButtons = this.querySelectorAll("[filter-close]");
			// Setup close and keydown event listeners specific to this modal
			closeModalButtons.forEach((closeModalButton) => closeModalButton.addEventListener("click", () => this.closeClickHandler(this, trigger)));

			this.addEventListener("click", (e) => {
				if (this === e.target) this.closeClickHandler(this, trigger);
			});

			this.makeOtherElementsInert(this);
			// console.log("load");
			this.setAttribute("tabindex", 0);
			window.disableScroll();
			this.setupFilterInputs();
		};
	}

	createCloseClickHandler(e) {
		return (e, trigger) => {
			if (this.classList.contains("ui-filter-modal--open")) {
				this.setAttribute("aria-hidden", true);
				this.setAttribute("tabindex", -1);
				this.classList.remove("ui-filter-modal--open");
				this.removeOtherElementsInert();
				trigger.focus();
				window.enableScroll();
			}
		};
	}

	// Setup filter inputs and buttons
	setupFilterInputs() {
		this.filterInputs = [...this.querySelectorAll("input, select, combobox-interface")];
		this.clearButton = this.querySelector("[filter-clear]");
		this.applyButton = this.querySelector("[filter-apply]");
		this.filterNarrator = this.querySelector("[filter-narrator]");

		if (this.applyButton) {
			this.applyButton.disabled = true;
			this.applyButton.addEventListener("click", () => {
				if (this.filterNarrator) this.filterNarrator.textContent = "Filter is applied";
			});
		}
		this.filterInputs.forEach((input) => {
			if (input.tagName === "COMBOBOX-INTERFACE") {
				this.setupComboboxInterface(input);
			} else {
				input.addEventListener("input", () => this.handleButtonState());
				input.addEventListener("change", () => this.handleButtonState());
			}
		});

		// Set up click handler for the clear button
		if (this.clearButton) {
			this.clearButtonText = this.clearButton.querySelector("span");
			this.clearButton.addEventListener("click", () => this.clearAllFilters());
		}

		this.updatePreviousFilters();
		this.handleButtonState(); // Initialize button state
	}

	// Setup event listeners for combobox-interface
	setupComboboxInterface(combobox) {
		const input = combobox.querySelector(".m-combobox__input");
		const options = combobox.querySelectorAll(".m-combobox__option");

		options.forEach((option) => {
			option.addEventListener("click", () => {
				this.handleButtonState();
			});
		});

		// Also need to handle changes to input if combobox is interactable
		input.addEventListener("input", () => this.handleButtonState());
	}

	updateTextWithNumber(element, newNumber) {
		// Regular expression to match "(digit)" pattern in the text
		const regex = /\(\d+\)/;

		// Get the current text of the element
		const currentText = element.textContent;

		// Check if the text contains a number in parentheses
		if (regex.test(currentText)) {
			if (newNumber == 0) {
				element.textContent = currentText.replace(regex, "");
			} else {
				// If it does, replace the existing number with the new number
				element.textContent = currentText.replace(regex, `(${newNumber})`);
			}
		} else if (newNumber != 0) {
			// If it doesn't, append the new number in parentheses at the end
			element.textContent = `${currentText} (${newNumber})`;
		}
	}

	// Handle button states and filter counts
	handleButtonState() {
		const filterCount = this.getActiveFilterCount();
		if (this.applyButton) {
			const isChanged = this.hasFiltersChanged();
			// console.log("isChanged ::", isChanged);
			//this.applyButton.disabled = !isChanged;
			if (!this.applyButton.hasAttribute("data-prevent-disable")) {
				this.applyButton.disabled = filterCount > 0 ? false : true;
			} else {
				this.applyButton.disabled = false;
			}
		}

		if (this.clearButton) {
			this.clearButtonText.textContent = filterCount > 0 ? `Clear All (${filterCount})` : `Clear All`;
		}
		// console.log("this.trigger: ", this.trigger);
		let counterEle = this.trigger?.querySelector("[filter-count]");
		if (counterEle) {
			this.updateTextWithNumber(counterEle, filterCount);
		} else {
			this.openFilterCounters.forEach((counter) => this.updateTextWithNumber(counter, filterCount));
		}
	}

	// Get the count of active filters
	getActiveFilterCount() {
		let count = 0;

		this.filterInputs.forEach((input) => {
			if (input.type === "checkbox" && input.checked) {
				count++;
			} else if (input.type === "radio" && input.checked) {
				count++;
			} else if (input.type === "text" && input.value.trim() !== "") {
				count++;
			} else if (input.tagName === "SELECT" && input.value !== "") {
				count++;
			}
		});

		return count;
	}

	// Clear all filter inputs
	clearAllFilters() {
		if (this.filterNarrator) this.filterNarrator.textContent = "Filter is Reset";
		this.filterInputs.forEach((input) => {
			if (input.tagName === "COMBOBOX-INTERFACE") {
				input.handleClear();
			} else if (input.type === "checkbox") {
				input.checked = false;
			} else if (input.type === "radio") {
				input.checked = false;
			} else if (input.type === "text") {
				input.value = "";
			} else if (input.tagName === "SELECT") {
				input.selectedIndex = 0;
			}
		});

		this.handleButtonState(); // Update button states after clearing
	}

	// Check if filters have changed compared to previous values
	hasFiltersChanged() {
		const currentFilters = this.getCurrentFilterValues();
		// console.log("currentFilters ::", currentFilters);
		// console.log("this.previousFilters ::", this.previousFilters);
		return !this.areObjectsEqual(currentFilters, this.previousFilters);
	}

	// Get current filter values
	getCurrentFilterValues() {
		const filters = {};

		this.filterInputs.forEach((input) => {
			// Determine the filter key based on either 'data-filter' or 'name' attribute
			const filterKey = input.getAttribute("data-filter") || input.getAttribute("name");

			if (filterKey) {
				if (input.tagName === "COMBOBOX-INTERFACE") {
					// Handle combobox input
					const val = input.querySelector(".m-combobox__input").value.trim();
					if (val) {
						filters[filterKey] = val;
					}
				} else if (input.type === "checkbox") {
					// Handle checkbox inputs
					// Use an array to store values of checked checkboxes
					if (!filters[filterKey]) {
						filters[filterKey] = [];
					}
					if (input.checked) {
						filters[filterKey].push(input.value);
					}
				} else if (input.type === "radio") {
					// Handle radio inputs
					// Only one radio button is selected at a time
					if (input.checked) {
						filters[filterKey] = input.value;
					}
				} else if (input.value.trim() !== "") {
					// Handle text inputs and select dropdowns
					filters[filterKey] = input.value.trim();
				}
			}
		});

		return filters;
	}

	// Compare two objects for equality
	areObjectsEqual(obj1, obj2) {
		if (obj1 === obj2) return true; // Handle identical references

		if (obj1 == null || obj2 == null) return false; // Handle null or undefined

		if (Array.isArray(obj1) !== Array.isArray(obj2)) return false; // Handle different types

		if (Array.isArray(obj1)) {
			if (obj1.length !== obj2.length) return false; // Handle arrays of different lengths

			for (let i = 0; i < obj1.length; i++) {
				if (!areObjectsEqual(obj1[i], obj2[i])) return false; // Recursive comparison
			}
			return true;
		}
	}

	// Update previous filter values
	updatePreviousFilters() {
		this.previousFilters = this.getCurrentFilterValues();
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
		this.openFilterButtons.forEach((btn) => {
			if (btn.getAttribute("filter-name") === this.id) btn.addEventListener("click", this.openClickHandler);
		});
	}

	disconnectedCallback() {
		this.openFilterButtons.forEach((btn) => {
			if (btn.getAttribute("filter-name") === this.id) btn.removeEventListener("click", this.openClickHandler);
		});
	}
}

customElements.define("filter-interface", FilterInterface);
