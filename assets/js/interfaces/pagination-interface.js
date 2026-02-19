class XPagination extends HTMLElement {
  constructor() {
    super();
    /* Attributes */
    this.currentPage = parseInt(this.getAttribute("x-current-page")) || 1; // Current active page
    this.totalResults = parseInt(this.getAttribute("x-total-results")) || 1; // Total number of pages
    this.totalPages = Math.ceil(this.totalResults / 10); // Total number of pages
    this.classList.add("m-pagination");
    this.createPaginationContainer();
    this.createPaginationInfo();
    this.render(); // Initial render
  }

  /* Observe attribute changes */
  static get observedAttributes() {
    return ["x-current-page", "x-total-results"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name.replace("-", "")] = parseInt(newValue);
      this.render(); // Re-render when attributes change
    }
  }
  /* Create container */
  createPaginationContainer() {
    this.container = document.createElement("div");
    this.container.classList.add("m-pagination__btns");
    this.container.setAttribute("role", "navigation");
    this.container.setAttribute("aria-label", "Pagination");
  }
  /* Create info */
  createPaginationInfo() {
    this.info = document.createElement("p");
    this.info.classList.add("m-pagination__info");
  }
  /* Render the pagination */
  render() {
    this.innerHTML = "";
    this.container.innerHTML = ""; //clear content
    this.renderPreviousButton(); //render previous btn
    this.renderFirstPage(); //render first page btn
    if (this.totalPages < 7) {
      this.renderAllPagesForSmallPagination(); //render all page btns if total count is 6 or less
    } else {
      if (this.currentPage < 4) {
        this.renderInitialPages(); //render 1, 2, 3 and/or 4 if current page is less than 4
      } else {
        this.renderMiddlePages(); //render middle pages if count=4 or greater
      }
      this.renderEllipsisBeforeLastPage(); //render ellipsis before last page btn
    }
    this.renderLastPage(); //render last page btn
    this.renderNextButton(); //render next btn
    this.appendChild(this.container); //append container
    this.info.textContent = `Showing ${parseInt(this.currentPage) * 10} of ${this.totalResults} results`;
    this.appendChild(this.info);
  }
  // Render Previous Button
  renderPreviousButton() {
    const prevButton = this.createButton("←", "prev", this.currentPage === 1, "Go to previous page");
    prevButton.addEventListener("click", () => this.navigateToPage(this.currentPage - 1));
    this.container.appendChild(prevButton);
  }

  // Render First Page
  renderFirstPage() {
    const firstPage = this.createButton(1, "page", this.currentPage === 1, "Go to page 1");
    firstPage.addEventListener("click", () => this.navigateToPage(1));
    this.container.appendChild(firstPage);
  }

  // Render All Pages When Total Pages < 7
  renderAllPagesForSmallPagination() {
    for (let i = 2; i <= this.totalPages - 1; i++) {
      const pageButton = this.createButton(i, "page", this.currentPage === i, `Go to page ${i}`);
      pageButton.addEventListener("click", () => this.navigateToPage(i));
      this.container.appendChild(pageButton);
    }
  }

  // Render Initial Pages (when currentPage < 4)
  renderInitialPages() {
    const range = this.currentPage === 3 ? 4 : 3;
    for (let i = 2; i <= range; i++) {
      const pageButton = this.createButton(i, "page", this.currentPage === i, `Go to page ${i}`);
      pageButton.addEventListener("click", () => this.navigateToPage(i));
      this.container.appendChild(pageButton);
    }
  }

  // Render Middle Pages (when currentPage >= 4)
  renderMiddlePages() {
    const ellipsisBefore = this.createEllipsis("Collapsed pages before current range");
    this.container.appendChild(ellipsisBefore);
    const start = this.currentPage >= this.totalPages - 3 ? this.totalPages - 3 : this.currentPage - 1;
    const end = this.currentPage >= this.totalPages - 3 ? this.totalPages - 1 : this.currentPage + 1;
    for (let i = start; i <= end; i++) {
      const pageButton = this.createButton(i, "page", this.currentPage === i, `Go to page ${i}`);
      pageButton.addEventListener("click", () => this.navigateToPage(i));
      this.container.appendChild(pageButton);
    }
  }

  // Render Ellipsis Before Last Page
  renderEllipsisBeforeLastPage() {
    if (this.currentPage < this.totalPages - 3) {
      const ellipsisAfter = this.createEllipsis("Collapsed pages after current range");
      this.container.appendChild(ellipsisAfter);
    }
  }

  // Render Last Page
  renderLastPage() {
    if (this.totalPages > 1) {
      const lastPage = this.createButton(this.totalPages, "page", this.currentPage === this.totalPages, `Go to page ${this.totalPages}`);
      lastPage.addEventListener("click", () => this.navigateToPage(this.totalPages));
      this.container.appendChild(lastPage);
    }
  }

  // Render Next Button
  renderNextButton() {
    const nextButton = this.createButton("→", "next", this.currentPage === this.totalPages, "Go to next page");
    nextButton.addEventListener("click", () => this.navigateToPage(this.currentPage + 1));
    this.container.appendChild(nextButton);
  }

  /* Create a pagination button */
  createButton(label, type, isDisabled, ariaLabel) {
    const button = document.createElement("button");
    if (type == "prev" || type == "next") {
      button.innerHTML = `
			<div class="m-btn-pagination__icon-wrapper">
				<svg class="m-btn-pagination__icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path d="M11.0847 8.5H3V7.5H11.0847L7.28717 3.7025L8 3L13 8L8 13L7.28717 12.2975L11.0847 8.5Z" fill="#5C5C64" />
				</svg>
			</div>
			`;
      button.classList.add("m-btn-pagination", `m-btn-pagination--${type}`);
    } else {
      button.classList.add(`m-pagination__${type}`);
      button.textContent = label;
    }
    button.disabled = isDisabled;
    if (type === "page") {
      button.setAttribute("aria-label", ariaLabel);
      if (parseInt(label) === this.currentPage) {
        button.setAttribute("aria-current", "page");
      }
    }
    return button;
  }
  /* Create an ellipsis element */
  createEllipsis(ariaLabel) {
    const span = document.createElement("span");
    span.classList.add("m-pagination__ellipsis");
    span.textContent = "...";
    span.setAttribute("aria-hidden", "true"); // Visually represents the collapsed pages
    span.setAttribute("aria-label", ariaLabel); // Accessibility label for assistive technologies
    return span;
  }

  /* Navigate to a specific page */
  navigateToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page; // Update the current page
    this.setAttribute("x-current-page", page); // Update the attribute
    this.render(); // Re-render pagination
    // Dispatch a custom event for page change
    this.dispatchEvent(new CustomEvent("pageChange", {
      detail: {
        currentPage: this.currentPage
      },
      bubbles: true,
      composed: true
    }));
  }
}
customElements.define("x-pagination", XPagination);