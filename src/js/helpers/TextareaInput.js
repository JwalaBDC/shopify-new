class TextareaInput {
	constructor(ele) {
		this.inputElement = ele;
		this.inputContainer = this.inputElement.closest(".m-input-text");
		this.errorEle = this.inputContainer.querySelector(".m-input-text__error");
		this.isRequired = this.inputElement.hasAttribute("required");
		this.addEventListeners();
	}

	get isInvalid() {
		// Regular expression for email validation
		var regex = /^[a-zA-Z\s]+$/;
		return (this.isEmpty && this.isRequired) || (!this.isEmpty && this.isMin) || (!this.isEmpty && this.isMax);
	}
	// Trimmed value of the input
	get inputValue() {
		return this.inputElement.value.trim();
	}

	// Check Input value is empty
	get isEmpty() {
		return this.inputValue === "";
	}

	// check minlength
	get isMin() {
		return this.inputValue.length < this.inputElement.minLength;
	}
	// check maxlength
	get isMax() {
		return this.inputValue.length > this.inputElement.maxLength;
	}

	// Validates the input value and updates the input state accordingly
	validateInput() {
		const isValid = this.isInvalid;
		this.inputContainer.classList[isValid ? "add" : "remove"]("is-invalid");
		this.inputContainer.classList[!this.isEmpty ? "add" : "remove"]("has-value");
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

	addEventListeners() {
		this.inputElement.addEventListener("blur", this.onBlur.bind(this));
	}
}

const textareaInputs = document.querySelectorAll(".js-textareaInput");
if (textareaInputs.length > 0) {
	textareaInputs.forEach((input) => {
		input.textareaInputInstant = new TextareaInput(input);
	});
}
