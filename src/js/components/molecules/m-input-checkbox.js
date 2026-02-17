class InputCheckboxMolecule {
	constructor(el) {
		this.inputContainer = el;
		this.inputElement = this.inputContainer.querySelector("[type=checkbox]");
		if (this.inputElement) {
			this.addEventListeners();
		} else {
			console.error(
				"Input element not found within the container:",
				this.inputContainer
			);
		}
	}
	onCheck() {
		const isChecked = this.inputElement.checked;
		console.log("Checkbox is now: ", isChecked ? "checked" : "unchecked");
		this.inputContainer.setAttribute("aria-checked", isChecked);
	}
	addEventListeners() {
		this.inputElement.addEventListener("change", this.onCheck.bind(this));
	}
}
const initializeFormText = () => {
	const inputTextMolecules = document.querySelectorAll(".m-input-checkbox");
	inputTextMolecules.forEach((el) => {
		el.inputTextMoleculeInstance = new InputCheckboxMolecule(el);
	});
};
initializeFormText();
