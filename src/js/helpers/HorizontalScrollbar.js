export class HorizontalScrollbar {
	constructor(thumb) {
		this.thumb = thumb;
		this.container = this.thumb.closest(".js-horizontalScrollbar__container");
		this.scroller = this.container.querySelector(".js-horizontalScrollbar__scroller");
		this.track = this.container.querySelector(".js-horizontalScrollbar__track");
		this.resizeTimer = false;
		this.thumbX = {
			last: 0,
			current: 0,
			eased: 0,
		};
		this.isDragging = false;
		this.isMouseDown = false;

		this.addEventListeners();
		this.setDimensions();
		requestAnimationFrame(this.tick.bind(this));
	}

	/* function: lerp */
	lerp(lastValue, thisValue, easingFactor = 0.12) {
		return (1 - easingFactor) * lastValue + easingFactor * thisValue;
	}

	/* function: mapRange */
	mapRange(x, a, b, c, d) {
		x = this.setBounds(x, a, b);
		return ((x - a) * (d - c)) / (b - a) + c;
	}

	/* function: setBounds */
	setBounds(value, lowerLimit, upperLimit) {
		return Math.min(Math.max(value, lowerLimit), upperLimit);
	}

	get thumbWidth() {
		const percentOfVisibleArea = (this.offsetWidth * 100) / this.scrollWidth;
		return percentOfVisibleArea < 100 ? (percentOfVisibleArea * this.trackWidth) / 100 : 0;
	}

	setDimensions() {
		this.trackWidth = this.track.offsetWidth;
		this.scrollWidth = this.scroller.scrollWidth;
		this.offsetWidth = this.scroller.offsetWidth;
		this.thumb.style.width = this.thumbWidth + "px";
		this.minX = 0;
		this.maxX = this.trackWidth - this.thumbWidth;

		this.track.classList.toggle("isHidden", this.scrollWidth - this.offsetWidth <= 0);
		this.container.classList.toggle("isOverflowing", !(this.scrollWidth - this.offsetWidth <= 0));
	}

	tick() {
		this.thumbX.eased = this.lerp(this.thumbX.eased, this.thumbX.current, 0.4);
		this.thumb.style.transform = `translate3d(${this.thumbX.eased}px, 0, 0)`;
		requestAnimationFrame(this.tick.bind(this));
	}

	/* Start dragging on mouse */
	startDragMouse(e) {
		this.isMouseDown = true;
		this.scroller.classList.add("--grab");
		this.scrollStartX = e.pageX || e.touches[0].pageX - this.scroller.offsetLeft;
		this.scrollLeft = this.scroller.scrollLeft;
	}

	/* Stop dragging on mouse */
	stopDragMouse() {
		this.isMouseDown = false;
		this.scroller.classList.remove("--grab");
	}

	/* Handle dragging on mouse */
	dragMouse(e) {
		if (!this.isMouseDown) return;
		const dx = e.pageX || e.touches[0].pageX - this.scroller.offsetLeft;
		const scrollDist = dx - this.scrollStartX;
		this.scroller.scrollLeft = this.scrollLeft - scrollDist;
	}

	/* Start dragging */
	startDrag(e) {
		this.isDragging = true;
		this.startX = e.pageX;
		this.scrollStartX = this.scroller.scrollLeft;
	}

	/* Stop dragging */
	stopDrag() {
		this.isDragging = false;
	}

	/* Handle dragging */
	drag(e) {
		if (!this.isDragging) return;
		const dx = e.pageX - this.startX;
		const scrollDist = dx * (this.scrollWidth / this.trackWidth);
		this.scroller.scrollLeft = this.scrollStartX + scrollDist;
	}

	addEventListeners() {
		this.scroller.addEventListener("scroll", () => {
			if (this.scroller.scrollLeft === 0) {
				this.thumbX.current = 0;
			} else {
				this.thumbX.current = this.mapRange(this.scroller.scrollLeft, 0, this.scrollWidth - this.offsetWidth, this.minX, this.maxX);
			}
		});

		window.addEventListener("resize", () => {
			clearTimeout(this.resizeTimer);
			this.resizeTimer = setTimeout(() => {
				this.setDimensions();
			}, 100);
		});

		/* Add drag functionality to the thumb */
		this.thumb.addEventListener("mousedown", this.startDrag.bind(this));
		window.addEventListener("mouseup", this.stopDrag.bind(this));
		window.addEventListener("mousemove", this.drag.bind(this));

		/* Add drag functionality to the mouse */
		this.scroller.addEventListener("mousedown", this.startDragMouse.bind(this));
		this.scroller.addEventListener("mousemove", this.dragMouse.bind(this));
		this.scroller.addEventListener("mouseleave", this.stopDragMouse.bind(this));
		this.scroller.addEventListener("mouseup", this.stopDragMouse.bind(this));
	}
}

const horizontalScrollThumbs = document.querySelectorAll(".js-horizontalScrollbar__thumb");
if (horizontalScrollThumbs.length > 0) {
	const horizontalScrollbarResizeObserver = new ResizeObserver((entries) => {
		entries.forEach((entry) => {
			let scroller = entry.target;
			let container = scroller.closest(".js-horizontalScrollbar__container");
			let thumb = container.querySelector(".js-horizontalScrollbar__thumb");
			if (thumb && thumb.horizontalScrollbarInstance) thumb.horizontalScrollbarInstance.setDimensions();
		});
	});

	horizontalScrollThumbs.forEach((thumb) => {
		thumb.horizontalScrollbarInstance = new HorizontalScrollbar(thumb);
		let container = thumb.closest(".js-horizontalScrollbar__container");
		let scroller = container.querySelector(".js-horizontalScrollbar__scroller");
		horizontalScrollbarResizeObserver.observe(scroller);
		scroller.dataset.overflowing = scroller.scrollWidth > container.offsetWidth ? "true" : "false";
		// Observe changes to the hidden attribute of the parent element
		const parentElement = container.closest("[role=tabpanel]");
		if (parentElement && parentElement.hasAttribute("tabindex")) {
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.attributeName === "hidden" && !parentElement.hasAttribute("hidden")) {
						thumb.horizontalScrollbarInstance.setDimensions();
					}
				});
			});
			observer.observe(parentElement, { attributes: true });
		}
	});
}
