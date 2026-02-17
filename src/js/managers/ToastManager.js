class ToastManager {
	constructor() {
		this.buttons = document.querySelectorAll("[toast-btn]");
		this.alertBars = [...document.querySelectorAll(".ui-alert-bar")];
		const alertBarsOutsideMain = this.alertBars.filter((alertBar) => !alertBar.closest("main"));
		this.alertBar = alertBarsOutsideMain.length > 0 ? alertBarsOutsideMain[alertBarsOutsideMain.length - 1] : null;

		if (!this.alertBar) {
			return;
		}

		this.alertBarText = this.alertBar.querySelector(".ui-alert-bar__text");
		this.alertDuration = 2000;
		this.alertBarTimer = null;
		this.previousFocus = null;
		this.init();
	}
	reInit() {
		const toastButtons = document.querySelectorAll("[toast-btn]");
		toastButtons.forEach((button) => {
			button.addEventListener("click", this.handleButtonClick.bind(this));
		});
	}

	init() {
		this.buttons.forEach((button) => {
			button.addEventListener("click", this.handleButtonClick.bind(this));
		});
	}

	handleButtonClick(event) {
		const button = event.currentTarget || event.target.closest("[toast-btn]");

		const textToCopy = button.getAttribute("data-copy-text");
		const alertMessage = button.getAttribute("data-text");
		const alertType = button.getAttribute("data-toast-type") || "info";
		this.previousFocus = document.activeElement;

		// console.log("-- handleButtonClick --", event, alertType);
		switch (alertType) {
			case "copy-to-clipboard":
				this.copyTextToClipboard(alertMessage, textToCopy);
				// console.log("-- switch --", alertType);
				break;
			case "success":
				this.showAlert(alertMessage);
				break;
			case "error":
				this.showAlert(alertMessage);
				break;
			case "info":
				this.showAlert(alertMessage);
				break;
			default:
				this.showAlert(alertMessage);
				break;
		}
	}

	copyTextToClipboard(alertMessage = "", text) {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				// console.log("-- copyTextToClipboard --", this.alertBar);
				this.showAlert(alertMessage);
			})
			.catch((err) => {
				console.error("Failed to copy text: ", err);
				this.showAlert(alertMessage);
			});
	}

	showAlert(message) {
		// console.log("showAlert", message, this.alertBar);
		this.alertBar.classList.add("ui-alert-bar--center");
		this.alertBarTimer = 2000;
		if (this.alertBar) {
			this.alertBarText.textContent = message;
			this.alertBar.classList.add("ui-alert-bar--visible");
			this.resetAlertBarTimer();
		}
	}

	resetAlertBarTimer() {
		if (this.alertBarTimer) {
			clearTimeout(this.alertBarTimer);
		}
		this.alertBarTimer = setTimeout(() => {
			this.alertBar.classList.remove("ui-alert-bar--visible");
			this.alertBar.classList.remove("ui-alert-bar--center");
		}, this.alertDuration);
	}
}
window.toastManager = new ToastManager();
