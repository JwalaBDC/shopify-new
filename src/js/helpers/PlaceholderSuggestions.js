class PlaceholderSuggestionsAnimation {
	constructor(input) {
		this.input = input;
		this.suggestions = this.input
			.getAttribute("data-suggestions-animation")
			.split(",");
		this.currentIndex = 0;
		this.typingSpeed = 200;
		this.deletingSpeed = 100;
		this.pauseTime = 1500;
		this.isDeleting = false;
		this.currentText = "";
		this.placeholderBase = "Search by ";
		this.blinkCounter = 0;
		this.caretVisible = true;
		this.animationActive = true;
		this.isFocused = false;
		this.animationFrameId = 0;
		this.init();
	}

	init() {
		this.input.addEventListener("focus", () => {
			this.isFocused = true;
			this.input.setAttribute("placeholder", "");
		});

		this.input.addEventListener("blur", () => {
			this.isFocused = false;
			if (this.input.value === "") {
				this.start();
			}
		});

		this.loop();
	}

	loop() {
		if (!this.animationActive || this.isFocused) return;

		const currentSuggestion = this.suggestions[this.currentIndex];
		const fullText = this.placeholderBase + currentSuggestion;

		if (this.isDeleting) {
			this.currentText = fullText.substring(0, this.currentText.length - 1);
		} else {
			this.currentText = fullText.substring(0, this.currentText.length + 1);
		}

		let displayText = this.currentText + (this.caretVisible ? "|" : "");
		this.input.setAttribute("placeholder", displayText);

		let timeout = this.isDeleting ? this.deletingSpeed : this.typingSpeed;

		if (!this.isDeleting && this.currentText === fullText) {
			timeout = this.pauseTime;
			this.isDeleting = true;
		} else if (this.isDeleting && this.currentText === this.placeholderBase) {
			this.isDeleting = false;
			this.currentIndex = (this.currentIndex + 1) % this.suggestions.length;
		}

		this.caretVisible = !this.caretVisible;

		this.animationFrameId = setTimeout(() => this.loop(), timeout);
	}

	stop() {
		this.animationActive = false;
		clearTimeout(this.animationFrameId);
	}

	start() {
		if (this.isFocused) return;
		this.animationActive = true;
		this.loop();
	}
}

document
	.querySelectorAll(".ui-search-suggestion-placeholder")
	.forEach((input) => {
		new PlaceholderSuggestionsAnimation(input);
	});
