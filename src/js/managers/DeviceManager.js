class DeviceManager {
	static init() {
		this.detectDevice();
		this.addEventListeners();
	}

	static detectDevice() {
		const ua = navigator.userAgent;

		if (ua.includes("Windows")) {
			document.body.classList.add("is-windows");
		}

		if (
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua)
		) {
			document.body.classList.add("is-phone");
		}

		if (
			"ontouchstart" in window ||
			navigator.maxTouchPoints > 0
		) {
			document.body.classList.add("using-touch");
		}
	}

	static onMouseMove() {
		document.body.classList.add("using-mouse");
		document.body.classList.remove("using-keyboard");
	}

	static onKeyDown() {
		document.body.classList.remove("using-mouse");
		document.body.classList.add("using-keyboard");
	}

	static addEventListeners() {
		document.body.addEventListener(
			"mousemove",
			this.onMouseMove.bind(this),
			{ passive: true }
		);

		document.body.addEventListener(
			"keydown",
			this.onKeyDown.bind(this)
		);
	}
}

export default DeviceManager;
