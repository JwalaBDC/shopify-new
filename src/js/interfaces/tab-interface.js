/* class: TabInterface */
class TabInterface extends HTMLElement {
	constructor() {
		super();
		// filter out the nested tablists
		this.tabList = Array.from(this.querySelectorAll('[role="tablist"]')).filter((tablist) => {
			return tablist.closest("tab-interface") === this;
		});
		this.tabList = this.tabList[0];
		// filter out the nested tabs
		this.tabs = Array.from(this.querySelectorAll('[role="tab"]')).filter((tab) => {
			return tab.closest("tab-interface") === this;
		});
		// filter out the nested tabpanels
		this.tabPanels = Array.from(this.querySelectorAll('[role="tabpanel"]')).filter((tabpanel) => {
			return tabpanel.closest("tab-interface") === this;
		});
		this.prevBtn = this.querySelector("[tablist-prev]");
		this.nextBtn = this.querySelector("[tablist-next]");
		/* handlers */
		this.prevClickHandler = this.createPrevClickHandler();
		this.nextClickHandler = this.createNextClickHandler();
		this.clickHandler = this.createClickHandler();
		this.keyHandler = this.createKeyHandler();
	}
	/* click handler */
	createClickHandler() {
		return (e) => {
			if (!e.target.closest('[role="tab"]')) return; //if not a tab, return
			let newTab = e.target.closest('[role="tab"]');
			e.preventDefault();
			if (e.target.closest('[aria-selected="true"]')) return; //if already selected, return
			let oldTab = newTab.closest('[role="tablist"]').querySelector('[aria-selected="true"]');
			this.activateTab(oldTab, newTab);
		};
	}
	/* key handler */
	createKeyHandler() {
		return (e) => {
			const currentIndex = Array.from(this.tabs).indexOf(e.target);
			//determine the direction based on the pressed key
			let dir;
			if (e.key === "ArrowLeft") {
				//if left arrow key is pressed, move to the previous tab
				dir = currentIndex - 1 < 0 ? this.tabs.length - 1 : currentIndex - 1;
			} else if (e.key === "ArrowRight") {
				//if right arrow key is pressed, move to the next tab
				dir = currentIndex + 1 > this.tabs.length - 1 ? 0 : currentIndex + 1;
			} else if (e.key === "ArrowDown") {
				//if down arrow key is pressed, focus on the panel
				dir = "down";
			} else {
				//for other keys, do nothing
				dir = null;
			}
			// Handle the direction
			if (dir !== null) {
				e.preventDefault();
				if (dir === "down") {
					this.tabPanels[currentIndex].focus(); //if down arrow key is pressed, focus on the tabpanel
				} else if (this.tabs[dir]) {
					this.activateTab(e.target, this.tabs[dir]);
				}
			}
		};
	}
	/* activate tab */
	activateTab(oldTab, newTab) {
		//newTab.focus();
		newTab.setAttribute("tabindex", "0");
		newTab.setAttribute("aria-selected", "true");
		oldTab.setAttribute("tabindex", "-1");
		oldTab.removeAttribute("aria-selected");
		let index = Array.prototype.indexOf.call(this.tabs, newTab);
		let oldIndex = Array.prototype.indexOf.call(this.tabs, oldTab);
		this.tabPanels[oldIndex].hidden = true;
		this.tabPanels[index].hidden = false;
	}
	setupObservers() {
		this.tabObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const target = entry.target;
					if (target.getAttribute("role") === "tab") {
						const isVisible = entry.isIntersecting;
						// Set aria-hidden based on visibility
						target.setAttribute("aria-hidden", isVisible ? "false" : "true");
						// Handle tabindex for focusable elements
						const focusableElements = target.querySelectorAll("a, button, [tabindex]");
						focusableElements.forEach((element) => {
							if (isVisible) {
								element.removeAttribute("tabindex"); // Remove tabindex when visible
							} else {
								element.setAttribute("tabindex", "-1"); // Set tabindex="-1" when hidden
							}
						});
						this.setPrevNextBtnState();
					}
				});
			},
			{
				root: this.tabList,
				threshold: 0.9,
			}
			/* {
				root: document.documentElement,
				threshold: 0.75,
			} */
		);
		this.tabs.forEach((item) => this.tabObserver.observe(item));
	}
	removeObservers() {
		if (this.tabObserver) {
			this.tabs.forEach((item) => this.tabObserver.unobserve(item));
			this.tabObserver.disconnect();
			this.tabObserver = null;
		}
	}
	setPrevNextBtnState() {
		const firstItemVisible = this.tabs[0].getAttribute("aria-hidden") === "false";
		const lastItemVisible = this.tabs[this.tabs.length - 1].getAttribute("aria-hidden") === "false";
		this.prevBtn && (this.prevBtn.disabled = firstItemVisible);
		this.nextBtn && (this.nextBtn.disabled = lastItemVisible);
	}
	smoothScrollTo(element) {
		const scrollPosition = element.offsetLeft;
		this.tabList.scrollTo({
			left: scrollPosition,
			behavior: "smooth",
		});
	}
	createNextClickHandler() {
		return () => {
			const visibleIndex = this.tabs.findIndex((item) => item.getAttribute("aria-hidden") === "false");
			if (visibleIndex < this.tabs.length - 1) {
				this.smoothScrollTo(this.tabs[visibleIndex + 1]);
			}
		};
	}
	createPrevClickHandler() {
		return () => {
			const visibleIndex = this.tabs.findIndex((item) => item.getAttribute("aria-hidden") === "false");
			if (visibleIndex > 0) {
				this.smoothScrollTo(this.tabs[visibleIndex - 1]);
			}
		};
	}
	/* add listeners */
	connectedCallback() {
		if (!this.tabList) return;
		this.tabList.addEventListener("click", this.clickHandler);
		this.tabList.addEventListener("keydown", this.keyHandler);
		this.setupObservers();
		this.prevBtn?.addEventListener("click", this.prevClickHandler);
		this.nextBtn?.addEventListener("click", this.nextClickHandler);
	}
	/* remove listeners */
	disconnectedCallback() {
		if (!this.tabList) return;
		this.tabList.removeEventListener("click", this.clickHandler);
		this.tabList.removeEventListener("keydown", this.keyHandler);
		this.removeObservers();
		this.prevBtn?.removeEventListener("click", this.prevClickHandler);
		this.nextBtn?.removeEventListener("click", this.nextClickHandler);
	}
}
customElements.define("tab-interface", TabInterface);
