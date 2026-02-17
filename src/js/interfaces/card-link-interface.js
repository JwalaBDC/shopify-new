class CardLinkInterface extends HTMLElement {
	constructor() {
		super();
		this.link = this.querySelector("[card-link]");
		this.clickHandler = this.createClickHandler();
		this.keyHandler = this.createKeyHandler();
	}

	createClickHandler() {
		return (e) => {
			const link = this.querySelector("[card-link]");
			if (link) {
				link.click();
			}
		};
	}

	createKeyHandler() {
		return (e) => {
			if (e.key === "Enter" || e.keyCode === 13) {
				const link = this.querySelector("[card-link]");
				console.log("key", link);
				if (link) {
					link.click();
				}
			}
		};
	}

	connectedCallback() {
		this.link.addEventListener("click", (e) => {
			e.stopPropagation();
		});
		this.addEventListener("click", this.clickHandler);
		this.addEventListener("keydown", this.keyHandler);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.clickHandler);
	}
}
customElements.define("card-link-interface", CardLinkInterface);
/**
 * Attribute Helper Function - For elements which have a card-link-interface attribute like table rows
 */
class CardLinkInterfaceAttribute {
	constructor(el) {
		this.container = el;
		this.clickHandler = this.createClickHandler();
		this.keyHandler = this.createKeyHandler();
		this.link = this.querySelector("[card-link]");
		this.container.addEventListener("click", this.clickHandler);
		this.container.addEventListener("keydown", this.keyHandler);
		this.link.addEventListener("click", (e) => {
			e.stopPropagation();
		});
	}
	createClickHandler() {
		return (e) => {
			const link = this.querySelector("[card-link]");
			console.log(link);
			if (link) {
				link.click();
			}
		};
	}

	createKeyHandler() {
		return (e) => {
			if (e.key === "Enter" || e.keyCode === 13) {
				const link = this.container.querySelector("[card-link]");
				if (link) {
					link.click();
				}
			}
		};
	}
}
const cardLinkInterfaceAttributeEls = document.querySelectorAll("[card-link-interface]");
cardLinkInterfaceAttributeEls.forEach((cardLinkInterfaceAttributeEl) => {
	new CardLinkInterfaceAttribute(cardLinkInterfaceAttributeEl);
});
