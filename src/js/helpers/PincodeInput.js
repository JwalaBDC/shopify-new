/**
 * class: PINCode Input
 */
class PincodeInput {
	constructor(ele) {
		this.inputElement = ele;
		this.inputContainer = this.inputElement.closest(".m-input-text");
		this.errorEle = this.inputContainer.querySelector(".m-input-text__error");
		this.isRequired = this.inputElement.hasAttribute("required");
		this.addEventListeners();
		this.maxLen = parseInt(this.inputElement.getAttribute("maxlength"));
		this.minLen = parseInt(this.inputElement.getAttribute("minlength"));
	}

	onInput() {
		let inputValue = this.inputValue;

		inputValue = inputValue.replace(/[^a-zA-Z0-9]/g, "");
		this.inputElement.value = inputValue;
		if (!this.isIncomplete && this.isInvalid) {
			this.inputContainer.classList.add("isInvalid");
		}
	}

	// Validates the input value and updates the input state accordingly
	validateInput() {
		this.inputContainer.classList[this.isInvalid ? "add" : "remove"]("is-invalid");
		if (this.isMin && !this.isEmpty) {
			this.errorEle.textContent = this.errorEle.dataset.min ?? "";
		} else if (this.isMax && !this.isEmpty) {
			this.errorEle.textContent = this.errorEle.dataset.max ?? "";
		} else {
			this.errorEle.textContent = this.errorEle.dataset.required ?? "";
		}
	}

	onBlur() {
		this.validateInput();
	}
	get isServiceable() {
		return this.inputContainer.classList.contains("isServiceable");
	}
	get inputValue() {
		return this.inputElement.value.trim();
	}
	get isEmpty() {
		return this.inputValue === "";
	}
	get isIncomplete() {
		return !this.isEmpty && this.inputValue.length > this.maxLen && this.inputValue.length < this.minLen;
	}

	get isMin() {
		return this.inputValue.length < this.inputElement.minLength;
	}

	get isMax() {
		return this.inputValue.length > this.inputElement.maxLength;
	}

	get isInvalid() {
		const inputValue = this.inputValue;
		return this.isIncomplete || inputValue.charAt(0) == "0" || (this.isEmpty && this.isRequired) || (!this.isEmpty && this.isMin) || (!this.isEmpty && this.isMax);
	}
	addEventListeners() {
		this.inputElement.addEventListener("input", this.onInput.bind(this));
		this.inputElement.addEventListener("blur", this.onBlur.bind(this));
	}
}

const pincodeInputs = document.querySelectorAll(".js-pincodeInput");
if (pincodeInputs.length > 0) {
	pincodeInputs.forEach((input) => {
		input.pincodeInputInstant = new PincodeInput(input);
	});
}
