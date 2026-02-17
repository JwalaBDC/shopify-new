const skipButton = document.querySelector(".m-skip-to-content");
if (skipButton) {
	const mainContainer = document.querySelector("main");
	skipButton.addEventListener("keydown", (event) => {
		const { key } = event;

		const openKeys = ["Enter", " "];
		if (openKeys.includes(key)) {
			event.preventDefault();
			mainContainer.setAttribute("tabindex", "-1"); // Make main focusable if it's not
			mainContainer.focus(); // Focus on the main content
			mainContainer.addEventListener("blur", () => {
				mainContainer.removeAttribute("tabindex"); // Remove tabindex after focus
			});
		}
	});
	skipButton.addEventListener("click", (e) => {
		e.preventDefault();
		mainContainer.setAttribute("tabindex", "-1"); // Make main focusable if it's not
		mainContainer.focus(); // Focus on the main content
		mainContainer.addEventListener("blur", () => {
			mainContainer.removeAttribute("tabindex"); // Remove tabindex after focus
		});
	});
}
