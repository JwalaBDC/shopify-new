class ImageManager {
	static deviceType = ImageManager.getDeviceType();
	static isResizing = false;
	static imgList = [];
	static errorImgPath = "assets/common/images/empty.webp";

	static init() {
		// console.log("ImageManager init");
		this.loadImagesToDOMParallely(this.getImgList());
		this.addResizeListener();
	}

	static reinit() {
		this.deviceType = this.getDeviceType();
		this.loadImagesToDOMParallely(this.getImgList());
	}

	static getDeviceType() {
		return window.innerWidth < 768 ? "mobile" : "desktop";
	}

	static getImgList() {
		const nodes = document.querySelectorAll("[data-image]");
		this.imgList = [...nodes].filter((el) => {
			if (el.dataset.commonSrc) {
				el.dataset.src = el.dataset.commonSrc;
				return true;
			}
			if (el.dataset.mobileSrc && this.deviceType === "mobile") {
				el.dataset.src = el.dataset.mobileSrc;
				return true;
			}
			if (el.dataset.desktopSrc && this.deviceType === "desktop") {
				el.dataset.src = el.dataset.desktopSrc;
				return true;
			}
			return false;
		});

		if (!this.imgList.length) {
			const img = new Image();
			img.dataset.src = this.errorImgPath;
			return [img];
		}

		return this.imgList;
	}

	static loadImagesToDOMParallely(images, index = 0) {
		if (!images.length || window.cancelImageLoading) return;

		if (index >= images.length) {
			console.log("::all images loaded::");
			return;
		}

		const imgEl = images[index];
		const img = new Image();

		img.src = imgEl.dataset.src;

		img.onload = () => {
			imgEl.classList.add("is-loaded");

			if (imgEl.tagName === "IMG") {
				imgEl.src = img.src;
			} else {
				imgEl.style.backgroundImage = `url(${img.src})`;
			}
		};

		img.onerror = () => {
			img.src = this.errorImgPath;
		};

		this.loadImagesToDOMParallely(images, index + 1);
	}

	static onResize() {
		this.reinit();
	}

	static addResizeListener() {
		window.addEventListener("resize", () => {
			clearTimeout(this.isResizing);
			this.isResizing = setTimeout(() => {
				const newDevice = this.getDeviceType();
				if (this.deviceType !== newDevice) {
					this.deviceType = newDevice;
					this.onResize();
				}
			}, 250);
		});
	}
}

export default ImageManager;
