/**
 * class: VerticalScrollbar
 */
class VerticalScrollbar {
	constructor(thumb) {
		this.thumb = thumb;
		this.container = this.thumb.closest(".js-verticalScrollbar__container");
		this.scroller = this.container.querySelector(".js-verticalScrollbar__scroller");
		this.track = this.container.querySelector(".js-verticalScrollbar__track");
		this.thumbY = { last: 0, current: 0, eased: 0 };

		this.addEventListeners();
		this.observeScrollHeightChanges();
		requestAnimationFrame(this.tick.bind(this));
	}

	/**
	 * Linear interpolation function
	 * @param {number} lastValue - The previous value
	 * @param {number} thisValue - The current value
	 * @param {number} [easingFactor=0.12] - The easing factor
	 * @returns {number} - The interpolated value
	 */
	lerp(lastValue, thisValue, easingFactor = 0.12) {
		return (1 - easingFactor) * lastValue + easingFactor * thisValue;
	}

	/**
	 * Map a range of numbers to another range
	 * @param {number} x - The value to map
	 * @param {number} a - The original range start
	 * @param {number} b - The original range end
	 * @param {number} c - The target range start
	 * @param {number} d - The target range end
	 * @returns {number} - The mapped value
	 */
	mapRange(x, a, b, c, d) {
		x = this.setBounds(x, a, b);
		return ((x - a) * (d - c)) / (b - a) + c;
	}

	/**
	 * Ensure a value is within given bounds
	 * @param {number} value - The value to set bounds for
	 * @param {number} lowerLimit - The lower limit
	 * @param {number} upperLimit - The upper limit
	 * @returns {number} - The bounded value
	 */
	setBounds(value, lowerLimit, upperLimit) {
		if (value < lowerLimit) value = lowerLimit;
		if (value > upperLimit) value = upperLimit;
		return value;
	}

	/**
	 * Calculate the thumb height based on the visible area percentage
	 * @returns {number} - The thumb height
	 */
	get thumbHeight() {
		const percentOfVisibleArea = (this.offsetHeight * 100) / this.scrollHeight;
		return percentOfVisibleArea < 100 ? (percentOfVisibleArea * this.offsetHeight) / 100 : 0;
	}

	/**
	 * Set the dimensions for the scrollbar elements
	 */
	setDimensions() {
		this.scrollHeight = this.scroller.scrollHeight;
		this.offsetHeight = this.scroller.offsetHeight;
		this.trackHeight = this.track.offsetHeight;
		this.thumb.style.height = this.thumbHeight + "px";
		this.minY = 0;
		this.maxY = this.trackHeight - this.thumbHeight;
		const isHide = this.scrollHeight - this.offsetHeight <= 0;
		this.track.setAttribute("aria-hidden", isHide);
	}

	/**
	 * Animation tick to update thumb position
	 */
	tick() {
		this.thumbY.eased = this.lerp(this.thumbY.eased, this.thumbY.current, 0.4);
		this.thumb.style.transform = `translate3d(0,${this.thumbY.eased}px,0)`;
		requestAnimationFrame(this.tick.bind(this));
	}

	/**
	 * Add event listeners for scrolling and resizing
	 */
	addEventListeners() {
		this.scroller.addEventListener("scroll", () => {
			this.thumbY.current = this.mapRange(this.scroller.scrollTop, 0, this.scrollHeight - this.offsetHeight, this.minY, this.maxY);
		});

		window.addEventListener("resize", () => {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(() => {
				this.setDimensions();
			}, 250);
		});
		this.setDimensions();
	}

	/**
	 * Observe changes in the scroll height and update dimensions accordingly
	 */
	observeScrollHeightChanges() {
		const observer = new MutationObserver(() => {
			this.setDimensions();
		});

		observer.observe(this.scroller, {
			childList: true,
			subtree: true,
		});
	}
}

const verticalScrollThumbs = document.querySelectorAll(".js-verticalScrollbar__thumb");
if (verticalScrollThumbs.length > 0) {
	// Observe each scroller element
	verticalScrollThumbs.forEach((thumb) => {
		thumb.verticalScrollbarInstance = new VerticalScrollbar(thumb);
	});
}
