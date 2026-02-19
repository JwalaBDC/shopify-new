if (history && history.scrollRestoration) history.scrollRestoration = "auto";
console.log('Scroll Restoration Helper Loaded');

/* window.addEventListener("pageshow", function (event) {
	if (event.persisted) {
		const SESSION_ITEM_ID = `${window.location.href}_SCROLL`;
		// Restore the previous scroll position
		window.scrollTo({
			top: sessionStorage.getItem(SESSION_ITEM_ID) || 0,
			behavior: "instant",
		});
		// Clear the saved scroll position
		sessionStorage.removeItem(SESSION_ITEM_ID);
	}
});

window.addEventListener("pagehide", function () {
	const SESSION_ITEM_ID = `${window.location.href}_SCROLL`;
	// Save the scroll position when leaving a page
	sessionStorage.setItem(SESSION_ITEM_ID, window.scrollY);
}); */