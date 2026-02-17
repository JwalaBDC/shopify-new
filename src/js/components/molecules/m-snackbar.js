class SnackbarMolecule {
	constructor(el) {
		this.element = el;
		this.closeBtn = this.element.querySelector(".m-snackbar__close");
		this.addEventListeners();
	}

	handleClose() {
		this.element.hidden = true;
	}

	addEventListeners() {
		this.closeBtn.addEventListener("click", this.handleClose.bind(this));
	}
}

// Initialize inputTextMolecule instances
const initializeSnackbar = () => {
	const snackbarEles = document.querySelectorAll(".m-snackbar");
	snackbarEles.forEach((el) => {
		el.snackbar = new SnackbarMolecule(el);
	});
};

// Call initializeSnackbar to initialize all instances
initializeSnackbar();
