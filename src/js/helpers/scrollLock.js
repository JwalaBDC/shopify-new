const body = document.body;
window.scrollPosition = 0;

window.disableScroll = function disableScroll() {
	document.documentElement.classList.add("freeze-scroll");
	window.scrollPosition = window.scrollY || document.documentElement.scrollTop;
	body.classList.add("is-scroll-locked", "fix-body-scroll");
	body.style.top = `-${window.scrollPosition}px`;
	document.documentElement.style.scrollBehavior = "unset";
	body.style.scrollBehavior = "unset";
};

window.enableScroll = function enableScroll() {
	document.documentElement.classList.remove("freeze-scroll");
	body.classList.remove("fix-body-scroll");
	body.style.top = "";
	window.scrollTo(0, window.scrollPosition);
	// window.scrollTo({ top: window.scrollPosition, behavior: 'instant' });
	body.classList.remove("is-scroll-locked");
	setTimeout(() => {
		document.documentElement.style.scrollBehavior = "";
		body.style.scrollBehavior = "";
	}, 200);
};
