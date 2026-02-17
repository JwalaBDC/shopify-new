class ProductCardFilter {
	constructor(ele) {
		this.container = ele;
		this.tabs = this.container.querySelectorAll("[product-filter-tab]");
		this.cardList = this.container.querySelector("[product-filter-card-list]");
		this.cards = this.cardList.querySelectorAll("[product-filter-card]");
		this.activeTab = null;
		//console.log(":: ProductCardFilter ::");
		this.init();
	}

	init() {
		this.tabs.forEach((tab) => {
			tab.setAttribute('tabindex', '0'); // Make each tab focusable by default
			tab.addEventListener("click", () => this.onTabClick(tab));
			tab.addEventListener("keydown", (e) => this.onTabKeydown(e, tab)); // Handle keyboard navigation
		});
	}

	onTabClick(tab) {
		const tabValue = tab.getAttribute("product-filter-tab");

		if (this.activeTab === tab) {
			this.resetFilter();
		} else {
			this.filterCards(tabValue);
			this.updateTabSelection(tab);
		}
	}

	onTabKeydown(event, tab) {
		// Left arrow or up arrow navigates to the previous tab
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			this.focusPreviousTab(tab);
		}
		// Right arrow or down arrow navigates to the next tab
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			this.focusNextTab(tab);
		}
		// Enter or space triggers the tab selection
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			this.onTabClick(tab);
		}
	}

	filterCards(tabValue) {
		this.cards.forEach((card) => {
			const cardValue = card.getAttribute("product-filter-card");
			card.style.display = cardValue === tabValue ? "block" : "none";
		});
	}

	updateTabSelection(tab) {
		this.tabs.forEach((t) => {
			t.setAttribute("aria-selected", "false");
			t.setAttribute("tabindex", "-1"); // Remove focusability from non-selected tabs
		});

		tab.setAttribute("aria-selected", "true");
		tab.setAttribute("tabindex", "0"); // Ensure the active tab is focusable
		tab.focus(); // Move focus to the newly selected tab
		this.activeTab = tab;
	}

	resetFilter() {
		this.cards.forEach((card) => {
			card.style.display = "block";
		});
		this.tabs.forEach((tab) => {
			tab.setAttribute("aria-selected", "false");
			tab.setAttribute("tabindex", "0"); // Reset tabs to be focusable
		});
		this.activeTab = null;
	}

	focusPreviousTab(currentTab) {
		const index = Array.from(this.tabs).indexOf(currentTab);
		const prevTab = this.tabs[index - 1] || this.tabs[this.tabs.length - 1];
		prevTab.focus();
	}

	focusNextTab(currentTab) {
		const index = Array.from(this.tabs).indexOf(currentTab);
		const nextTab = this.tabs[index + 1] || this.tabs[0];
		nextTab.focus();
	}
}

// Initialize the filter on all product filter sections
const productFilterSections = document.querySelectorAll("[product-filter-section]");
if (productFilterSections.length > 0) {
	productFilterSections.forEach((ele) => {
		new ProductCardFilter(ele);
	});
}
