class TextAreaInput {
  constructor(textAreaField) {
    this.inputElement = textAreaField.querySelector(".m-text-input-field__input");
    this.inputWrapper = textAreaField;
    this.charCounter = this.createCharCounter();
    this.maxLength = parseInt(this.inputElement.getAttribute("maxlength")) || 0;
    this.isRequired = this.inputElement?.hasAttribute("required");
    console.log("this.inputWrapper", this.inputWrapper);

    // Bind event handlers
    this.onInput = this.onInput.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.addEventListeners();
    this.updateCharCounter(); // Initialize the character counter
  }

  // Create the character counter element
  createCharCounter() {
    const charCounter = document.createElement("span");
    charCounter.className = "m-text-input-field__char-counter";
    charCounter.textContent = `0/${this.maxLength}`;
    this.inputWrapper.appendChild(charCounter);
    return charCounter;
  }

  // Add event listeners
  addEventListeners() {
    if (this.inputElement) {
      this.inputElement.addEventListener("input", this.onInput);
      this.inputElement.addEventListener("focus", this.onFocus);
      this.inputElement.addEventListener("blur", this.onBlur);

      // If input already has a value, update the character counter
      if (this.inputElement.value !== "") this.updateCharCounter();
    } else {
      console.error("TextArea element not found within the container:", this);
    }
  }

  // Handles input event
  onInput() {
    this.inputWrapper.classList.remove("is-invalid");

    // Sanitize input value: Allow only single spaces between words
    let inputValue = this.inputElement.value.replace(/\s+/g, " ");
    this.inputElement.value = inputValue;

    // Update character counter
    this.updateCharCounter();

    // Toggle 'has-value' class based on the input value
    this.inputWrapper.classList.toggle("has-value", !this.isEmpty);
  }

  // Update the character counter display
  updateCharCounter() {
    const currentLength = this.inputElement.value.length;
    this.charCounter.textContent = `${currentLength}/${this.maxLength}`;
  }

  // Handles focus event
  onFocus() {
    this.inputWrapper.classList.add("has-focus-within");
  }

  // Handles blur event
  onBlur() {
    this.inputWrapper.classList.remove("has-focus-within");
    this.inputWrapper.classList.toggle("has-value", !this.isEmpty);
  }

  // Check if the input is invalid (empty or not matching the required pattern)
  // validateInput() {
  //   if (this.isRequired && this.isEmpty) {
  //     this.inputWrapper.classList.add("is-invalid");
  //   } else {
  //     this.inputWrapper.classList.remove("is-invalid");
  //   }
  // }

  // Get the trimmed value of the input
  get inputValue() {
    return this.inputElement?.value.trim() || "";
  }

  // Check if the input is empty
  get isEmpty() {
    return this.inputValue === "";
  }

  // Check if the input is invalid (empty and required)
  get isInvalid() {
    return this.isEmpty && this.isRequired;
  }

  // Reset the input field
  reset() {
    this.inputElement.value = "";
    this.updateCharCounter();
    this.inputWrapper.classList.remove("has-value", "is-invalid");
  }
}

// Initialize all x-textarea-input elements
// const textAreaFields = document.querySelectorAll("x-textarea-input");
// textAreaFields.forEach((textAreaField) => {
//   textAreaField.instance = new TextAreaInput(textAreaField);
// });

const textAreaFields = document.querySelectorAll('x-textarea-input');
textAreaFields.forEach(textAreaField => {
  new TextAreaInput(textAreaField)
});