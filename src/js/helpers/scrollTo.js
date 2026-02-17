/* Scroll Functions */
const g_ScrollingElement =
	document.scrollingElement || document.documentElement;
window.scrollToPosition = function scrollToPosition(element, to, duration) {
	var start = element.scrollTop,
		change = to - start,
		currentTime = 0,
		increment = 10;
	var animateScroll = function () {
		currentTime += increment;
		var val = Math.easeInOutQuad(currentTime, start, change, duration);
		element.scrollTop = val;
		if (currentTime < duration) {
			setTimeout(animateScroll, increment);
		}
	};
	animateScroll();
};
window.scrollHorizontallyToPosition = function (element, to, duration) {
	var start = element.scrollLeft,
		change = to - start,
		currentTime = 0,
		increment = 10;
	var animateScroll = function () {
		currentTime += increment;
		var val = Math.easeInOutQuad(currentTime, start, change, duration);
		element.scrollLeft = val;
		if (currentTime < duration) {
			setTimeout(animateScroll, increment);
		}
	};
	animateScroll();
};
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) return (c / 2) * t * t + b;
	t--;
	return (-c / 2) * (t * (t - 2) - 1) + b;
};
