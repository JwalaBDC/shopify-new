/**
 * class: RecentlyViewed
 */
import { motionObserverInstance } from "../motion/observers/MotionObserver.js";
class RecentlyViewed {
	constructor(ele) {
		this.maxItems = 13;
		this.recentSlider = ele;
		this.baseUrl = window.location.origin;
		this.init();
	}

	init() {
		this.recentSlider.setAttribute("hidden", true);
		const currentPath = window.location.pathname;
		const productPathIndex = currentPath.indexOf("/p/");
		let productSlug = currentPath.substring(productPathIndex);
		if (productPathIndex !== -1) {
			const productData = this.getProductData(productSlug);
			if (productData) {
				setTimeout(() => {
					this.updateStorage(productData);
				}, 500);
			}
		} else {
			this.showRecentlyViewedProducts();
		}
	}

	getProductData(productSlug) {
		let pdpGalleryImages = document.querySelectorAll(".ui-product-gallery__slider-item img");
		let firstNonFeaturedImage;

		for (let i = 0; i < pdpGalleryImages.length; i++) {
			if (!pdpGalleryImages[i].hasAttribute("is-featured-hero-image")) {
				firstNonFeaturedImage = pdpGalleryImages[i];
				break;
			}
		}

		if (!firstNonFeaturedImage) {
			firstNonFeaturedImage = pdpGalleryImages[0];
		}

		// console.log("firstNonFeaturedImage", firstNonFeaturedImage);

		let listingImageType = document.querySelector("#overview").dataset.productImageType;
		// $productCard['attributes']['listingImageType'] == 'Cover'
		let firstImagePath = "";

		if (firstNonFeaturedImage) {
			firstImagePath = firstNonFeaturedImage.getAttribute("data-common-src") || firstNonFeaturedImage.getAttribute("data-desktop-src") || firstNonFeaturedImage.getAttribute("src") || "https://bdcdev-gnb-media.s3.ap-south-1.amazonaws.com/img1_f6292b5b19.png";
		}
		if (firstImagePath == "assets/common/images/empty.webp") {
			firstImagePath = "https://bdcdev-gnb-media.s3.ap-south-1.amazonaws.com/img1_f6292b5b19.png";
		}
		let productTitle = document.querySelector("#overview").dataset.productTitle;
		return {
			id: productSlug,
			name: productTitle,
			url: window.location.href,
			slug: productSlug,
			image: firstImagePath,
			listingImageType: listingImageType,
		};
	}

	updateStorage(productData) {
		let storageValue = JSON.parse(localStorage.getItem("recentlyViewedProducts") || "[]");

		storageValue = storageValue.filter((item) => item.slug !== productData.slug);

		storageValue.unshift(productData);

		if (storageValue.length > this.maxItems) {
			storageValue.pop();
		}

		localStorage.setItem("recentlyViewedProducts", JSON.stringify(storageValue));
		console.log("recentlyViewedProducts", storageValue);

		this.setData(storageValue, productData.name);
	}

	showRecentlyViewedProducts() {
		let storageValue = JSON.parse(localStorage.getItem("recentlyViewedProducts") || "[]");
		this.setData(storageValue, null);
	}

	setData(storageValue, currentProduct) {
		if (!storageValue || storageValue.length === 0) {
			this.recentSlider.setAttribute("hidden", "true");
			this.recentSlider.setAttribute("aria-hidden", "true");
			return;
		}

		let popupListHTML = "";
		let totalRecentlyViewed = 0;
		storageValue.forEach((product, index) => {
			if (product.name !== currentProduct) {
				totalRecentlyViewed++;
				let imageToSet = product.image === "" ? "assets/common/images/empty.webp" : product.image;
				let imageClassToSet = product.image === "" ? "" : "is-loaded";
				popupListHTML += `
				<li slider-card class="ui-product-card__list-item">
					<div class="ui-product-card --recently-viewed" data-stagger-motion-index="${index}" data-stagger-motion-type="sm">
						<card-link-interface class="ui-product-card__content">
							<div class="ui-product-card__image-wrapper ${product.listingImageType == "Cover" ? "ui-product-card__image--cover" : ""}">
								<img alt="" src="${imageToSet}" data-image data-common-src="${imageToSet}" width="192" height="144" class="ui-product-card__image ${imageClassToSet}" />
							</div>
							<div class="ui-product-card__body">
								<h3 class="ui-product-card__title"><a card-link href="${product.url}">${product.name}</a></h3>
							</div>
						</card-link-interface>
					</div>
				</li>
			`;
			}
		});
		this.recentSlider.querySelector(".ui-product-card__list").innerHTML = popupListHTML;
		this.recentSlider.querySelector(".ui-product-card__list").dataset.motionObserver = "stagger";
		motionObserverInstance.addToObservedElements(this.recentSlider.querySelector(".ui-product-card__list"));
		if (totalRecentlyViewed > 0) {
			const element = this.recentSlider.querySelector("slider-interface");
			element.reinitialize();
			this.recentSlider.removeAttribute("hidden");
			this.recentSlider.setAttribute("aria-hidden", "false");
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const recentViewProductParent = document.querySelectorAll("[recently-viewed]");
	recentViewProductParent.forEach((ele) => new RecentlyViewed(ele));
});
