class InputRangeMolecule {
	constructor(el) {
		this.inputContainer = el;
		this.rangeInputElements = this.inputContainer.querySelectorAll("input[type='range']");
		this.inputWrapper = this.inputContainer.querySelector(".m-input-range__wrapper");
		this.isSingleSlider = !this.inputContainer.classList.contains("m-input-range--two-thumb");
		this.rangeInputNumbers = this.inputContainer.querySelectorAll("[data-input]");
		this.addEventListeners();

		if (this.inputContainer.classList.contains("m-input-range--two-thumb")) {
			this.initializeTwoThumbSlider();
		} else {
			this.rangeInputElements.forEach((inputElement) => {
				this.applyFill(inputElement);
				this.updateOutput(inputElement);
			});
		}
	}

	addEventListeners() {
		this.rangeInputElements.forEach((inputElement) => {
			inputElement.addEventListener("input", this.onInput.bind(this));
			inputElement.addEventListener("focus", this.onFocus.bind(this));
			inputElement.addEventListener("blur", this.onBlur.bind(this));
			this.updateOutput(inputElement);
		});

		const inputFields = this.inputContainer.querySelectorAll("[data-input]");
		inputFields.forEach((inputField) => {
			inputField.addEventListener(
				"input",
				// this.debounce(this.onTextInput.bind(this), 300)
				this.onTextInput.bind(this),
			);
			// inputField.addEventListener("blur", this.onTextInput.bind(this));
		});
	}

	onInput(event) {
		this.applyFill(event.target);
		this.updateOutput(event.target);
		if (this.inputContainer.classList.contains("m-input-range--two-thumb")) {
			this.updateTwoThumbSliders(event);
		}
	}

	onTextInput(event) {
		const inputField = event.target;
		// console.log("onTextInput inputField",inputField);
		const relatedSlider = this.inputContainer.querySelector(`input[type='range'][data-range='${inputField.getAttribute("data-input")}']`);

		if (relatedSlider) {
			let value = parseInt(inputField.value.replace(/[^0-9]/g, ""), 10);
			if (isNaN(value)) {
				value = 0;
			}

			// Check if value is within min and max range
			if (value < parseInt(relatedSlider.min) || value > parseInt(relatedSlider.max)) {
				// Reset to the last valid value
				value = parseInt(relatedSlider.value);
			} else {
				// Update slider value if input is valid
				relatedSlider.value = value;
				this.applyFill(relatedSlider);
				this.updateOutput(relatedSlider);
			}

			// Format the input field value with currency
			inputField.value = `₹${this.formatCurrency(value)}`;
			inputField.classList.add("has-value");
			if (this.inputContainer.classList.contains("m-input-range--two-thumb")) {
				this.updateTwoThumbSliders({ target: relatedSlider });
			}
		}
	}

	onFocus(e) {
		e.target.classList.add("has-focus");
		this.inputContainer.classList.add("has-focus-within");
	}

	onBlur(e) {
		e.target.classList.remove("has-focus");
		this.inputContainer.classList.remove("has-focus-within");
	}

	initializeTwoThumbSlider() {
		this.minGap = 1;
		this.rangeInputElements[0].addEventListener("input", this.slideOne.bind(this));
		this.rangeInputElements[1].addEventListener("input", this.slideTwo.bind(this));
		this.fillColor();
	}

	slideOne() {
		if (parseInt(this.rangeInputElements[1].value) - parseInt(this.rangeInputElements[0].value) <= this.minGap) {
			this.rangeInputElements[0].value = parseInt(this.rangeInputElements[1].value) - this.minGap;
		}
		this.updateOutput(this.rangeInputElements[0]);
		this.fillColor();
	}

	slideTwo() {
		if (parseInt(this.rangeInputElements[1].value) - parseInt(this.rangeInputElements[0].value) <= this.minGap) {
			this.rangeInputElements[1].value = parseInt(this.rangeInputElements[0].value) + this.minGap;
		}
		this.updateOutput(this.rangeInputElements[1]);
		this.fillColor();
	}

	fillColor() {
		let percent1 = (this.rangeInputElements[0].value / this.rangeInputElements[0].max) * 100;
		let percent2 = (this.rangeInputElements[1].value / this.rangeInputElements[1].max) * 100;
		this.inputContainer.querySelector(".m-input-range__slider-track").style.background = `linear-gradient(to right, var(--coolgrey) ${percent1}%, var(--grey-70) ${percent1}%, var(--grey-70) ${percent2}%, var(--coolgrey) ${percent2}%)`;
	}

	applyFill(slider) {
		if (this.rangeInputElements.length === 1) {
			const percentage = (100 * (slider.value - slider.min)) / (slider.max - slider.min);
			const bg = `linear-gradient(90deg, var(--grey-70) ${percentage}%, var(--coolgrey) ${percentage + 0.1}%)`;
			slider.style.background = bg;
		}
	}

	updateOutput(slider) {
		const outputElements = this.inputContainer.querySelectorAll(`[data-output='${slider.id}']`);
		outputElements.forEach((outputElement) => {
			outputElement.innerHTML = `₹${this.formatCurrency(slider.value)}`;
		});
		this.updateInputField(slider);
	}

	updateInputField(slider) {
		let inputFields = this.inputContainer.querySelectorAll(`[data-input]`);
		inputFields.forEach((inputField) => {
			if (inputField.dataset.input == slider.dataset.range) {
				inputField.value = `₹${this.formatCurrency(slider.value)}`;
			}
		});
	}

	updateTwoThumbSliders(event) {
		this.inputElements = this.inputContainer.querySelectorAll(`[data-input]`);
		if (event.target.dataset.range === this.inputElements[0].dataset.input) {
			this.slideOne();
		} else if (event.target.dataset.range === this.inputElements[1].dataset.input) {
			this.slideTwo();
		}
		this.fillColor();
	}

	formatCurrency(value) {
		return Number(value).toLocaleString();
	}

	debounce(func, wait) {
		let timeout;
		return function (...args) {
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
		};
	}
}

if (!window.formRangeInstances) {
	window.formRangeInstances = new WeakMap();
}

const initializeFormRangeSlider = () => {
	const inputRangeMolecules = document.querySelectorAll(".m-input-range");
	inputRangeMolecules.forEach((el) => {
		if (!window.formRangeInstances.has(el)) {
			const instance = new InputRangeMolecule(el);
			window.formRangeInstances.set(el, instance);
		}
	});
};

initializeFormRangeSlider();
