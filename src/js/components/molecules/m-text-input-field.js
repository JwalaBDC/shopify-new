class TextInputMolecule {
  constructor(textInputField) {
    this.inputElement = textInputField;
    this.inputWrapper = this.inputElement.closest('.m-text-input-field__wrapper');
    this.isRequired = this.inputElement?.hasAttribute("required");
    // Bind event handlers for reuse
    this.onInput = this.onInput.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.addEventListeners();
  }

  // Lifecycle hook when the component is added to the DOM
  addEventListeners() {
    if (this.inputElement) {
      this.inputElement.addEventListener("input", this.onInput);
      this.inputElement.addEventListener("focus", this.onFocus);
      this.inputElement.addEventListener("blur", this.onBlur);
      this.inputElement.addEventListener("keydown", this.onKeydown);
      // If input already has a value, apply focus styles
      if (this.inputElement.value !== "") this.onFocus();
    } else {
      console.error("Input element not found within the container:", this);
    }
  }

  // Handles input event
  onInput() {
    this.inputWrapper.classList.remove("is-invalid");

    // Sanitize input value: Allow only single spaces between words
    let inputValue = this.inputElement.value.replace(/\s+/g, " ");
    this.inputElement.value = inputValue;

    // Toggle 'has-value' class based on the input value
    this.inputWrapper.classList.toggle("has-value", !this.isEmpty);
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

  // Handles keydown event
  onKeydown(e) {
    // Prevent space character when input is empty
    if (this.isEmpty && e.key === " ") {
      e.preventDefault();
    }
  }

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
}
const textInputFields = document.querySelectorAll('.m-text-input-field__input');
textInputFields.forEach(textInputField => {
  new TextInputMolecule(textInputField)
});
