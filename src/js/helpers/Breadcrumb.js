class BreadcrumbComponents {
	constructor(el) {
		this.breadcrumb = el;
		this.breadcrumbItems = this.breadcrumb.querySelectorAll(".m-breadcrumbs__item");
		this.numberofBreadcrumbItems = this.breadcrumbItems.length;
		this.buttonExpand = null;
		this.isExpanded = false;
		this.onResize();
		window.addEventListener("resize", this.onResize.bind(this));
	}
	onResize() {
		if (this.buttonExpand) this.buttonExpand.remove();
		this.buttonExpand = null;
		if (!this.buttonExpand && window.innerWidth < 768 && this.numberofBreadcrumbItems > 2) {
			this.breadcrumb.classList.remove("breadcrumb--show-all");
			this.createExpandButton();
		}
	}
	createExpandButton() {
		if (this.buttonExpand || this.isExpanded) return;
		const button = ` 
                  <a href="javascript:void(0);" class="m-breadcrumbs__link" aria-label="More options">...</a>
          `;
		this.buttonExpand = document.createElement("li");
		this.buttonExpand.classList.add("m-breadcrumbs__item");
		this.buttonExpand.classList.add("m-breadcrumbs__item--expand");
		this.buttonExpand.innerHTML = button;
		const element = this.breadcrumbItems[0];
		element.parentNode.insertBefore(this.buttonExpand, element.nextSibling);
		this.addExpandEventListeners();
	}
	addExpandEventListeners() {
		if (!this.buttonExpand) return;
		const button = this.breadcrumb.querySelector(".m-breadcrumbs__item--expand a");
		button.addEventListener("click", () => {
			this.buttonExpand.remove();
			this.buttonExpand = null;
			this.breadcrumb.classList.add("--show-all");
			this.isExpanded = true;
		});
	}
}

const breadcrumbComponents = document.querySelectorAll(".m-breadcrumbs");
if (breadcrumbComponents.length > 0) {
	breadcrumbComponents.forEach((breadcrumbComponent) => new BreadcrumbComponents(breadcrumbComponent));
}
