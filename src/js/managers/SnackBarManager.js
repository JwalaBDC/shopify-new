class SnackBarManager {
	static buttons = document.querySelectorAll("[snackbar-btn]");
	static snackBar = null;
	static previousFocus = null;
	static snackBarTimeout = null;

	static init() {
		this.buttons.forEach((button) => {
			button.addEventListener("click", this.handleButtonClick.bind(this));
		});
	}

	static handleButtonClick(event) {
		const button = event.currentTarget || event.target.closest("[snackbar-btn]");
		const textToCopy = button.getAttribute("data-copy-text");
		const toastMessage = button.getAttribute("data-text");
		const toastType = button.getAttribute("data-snackbar-type") || "info";

		this.previousFocus = document.activeElement;

		switch (toastType) {
			case "success":
			case "error":
			case "info":
				this.showToast(toastMessage, toastType);
				break;
			default:
				this.showToast(toastMessage, "info");
		}
	}

	static copyTextToClipboard(toastMessage = "", text) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				if (this.snackBar) return;
				this.showToast(toastMessage, "success");
			})
			.catch((err) => {
				console.error("Failed to copy text: ", err);
				if (this.snackBar) return;
				this.showToast(toastMessage, "error");
			});
	}

	static showToast(message, type) {
		this.removeExistingSnackBar();

		this.snackBar = document.createElement("div");
		this.snackBar.className = `m-snackbar ${type}`;
		this.snackBar.setAttribute("role", "alert");
		this.snackBar.setAttribute("aria-live", "assertive");
		this.snackBar.setAttribute("aria-atomic", "true");
		this.snackBar.innerHTML = `
            <p class="m-snackbar__text">${message}</p>
            <button class="m-snackbar__close">
                <svg class="m-snackbar__close-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="m8 8.702-3.382 3.382a.484.484 0 0 1-.348.141.472.472 0 0 1-.355-.141.479.479 0 0 1-.144-.352c0-.137.048-.254.144-.351l3.383-3.382-3.383-3.382a.484.484 0 0 1-.141-.348.472.472 0 0 1 .141-.355.479.479 0 0 1 .352-.144c.137 0 .254.048.351.144L8 7.297l3.382-3.383a.484.484 0 0 1 .348-.141.472.472 0 0 1 .355.141.479.479 0 0 1 .144.352.479.479 0 0 1-.144.351L8.703 7.999l3.382 3.382c.092.092.14.208.141.348a.472.472 0 0 1-.141.355.479.479 0 0 1-.352.145.479.479 0 0 1-.351-.145L8 8.702Z" fill="#fff"/></svg>
            </button>
        `;

		document.body.appendChild(this.snackBar);

		const closeButton = this.snackBar.querySelector(".m-snackbar__close");
		closeButton.addEventListener("click", () => this.closeSnackBar());

		// Focus management
		closeButton.focus();

		// Auto close after 4 seconds
		this.snackBarTimeout = setTimeout(() => {
			if (this.snackBar) {
				this.closeSnackBar();
			}
		}, 4000);
	}

	static removeExistingSnackBar() {
		if (this.snackBar) {
			this.snackBar.remove();
			this.snackBar = null;
		}
	}

	static closeSnackBar() {
		if (this.snackBar) {
			clearTimeout(this.snackBarTimeout);
			this.snackBar.remove();
			this.snackBar = null;
		}
		if (this.previousFocus) {
			this.previousFocus.focus();
		}
	}
}

SnackBarManager.init();
