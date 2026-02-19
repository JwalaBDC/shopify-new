/**
 * Interface: DropdownInterface
 * Description:
 *	- A custom dropdown menu interface.
 *
 * Motion Transition Details (Same as header menu):
 *	- Entry Animation:
 * 		- Duration: 200ms
 * 		- Easing: emphasized-decelerate
 *	- Exit Animation:
 * 		- Duration: 100ms
 * 		- Easing: emphasized
 *	- Option Stagger:
 * 		- Entry: Duration: 300ms (desktop), 400ms (mobile)
 * 		- Stagger: 30ms (desktop), 50ms (mobile)
 * 		- Easing: standard-decelerate
 *
 * Accessibility Features:
 *	- ARIA attributes for expanded and hidden states.
 *	- Focus trapping within the dropdown when expanded.
 *	- Keyboard navigation with support for:
 * 		- Arrow keys
 * 		- Enter
 * 		- Escape
 * 		- Alphanumeric selection
 *
 * Usage:
 *	- Attach the custom element `<dropdown-interface>` to your HTML.
 *	- Ensure buttons, options, and the popup are defined with appropriate attributes.
 *
 * Note:
 *	- This interface assumes that the dropdown is static and does not contain dynamically
 *	  injected content (e.g., links added after initialization).
 */
class InPageMenuDropdownHandler {
  constructor(dropdown) {
    this.dropdown = dropdown;
    this.header = document.querySelector("header");
    this.inPageMenuLinks = dropdown.inPageMenuLinks;
    this.dropdownBtn = dropdown.dropdownBtn;
    this.isDesktop = window.innerWidth > 1023;
    this.sectionTops = [];
    this.resizeHandler = this.createResizeHandler();
    this.scrollHandler = this.createScrollHandler();
    this.addEventListeners();
  }
  //this is useful when the page has accordions that keep changing the height of the body
  addResizeObserver() {
    this.resizeObserver = new ResizeObserver(this.handleBodyHeightChange.bind(this));
    this.debouncedResizeHandler = this.debounce(this.resizeHandler.bind(this), 200);
    this.resizeObserver.observe(document.body);
  }
  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
  handleBodyHeightChange(entries) {
    for (const entry of entries) {
      if (entry.target === document.body) {
        this.debouncedResizeHandler(window.innerWidth, window.innerHeight);
      }
    }
  }
  removeResizeObserver() {
    this.resizeObserver.unobserve(document.body);
    this.resizeObserver.disconnect();
    this.resizeObserver = null;
  }
  /* Scroll Handler */
  createScrollHandler() {
    return scrollY => {
      let activeLink = "";
      this.inPageMenuLinks.forEach((link, index) => {
        link.classList.remove("is-active");
        if (!link.href) return;
        const targetHash = new URL(link.href).hash;
        const targetSection = document.querySelector(targetHash);
        if (!targetSection) {
          link.parentNode.classList.add("menu-item-hidden");
          return;
        } else {
          link.parentNode.classList.remove("menu-item-hidden");
        }
        if (targetSection) {
          const sectionTop = this.sectionTops[index]; // Adjust offset as needed
          if (scrollY > sectionTop) {
            activeLink = link;
          }
        }
      });
      if (activeLink) {
        this.dropdown.dropdownBtnText.textContent = activeLink.textContent;
        activeLink.classList.add("is-active");
      }
    };
  }
  /* Resize Handler */
  createResizeHandler() {
    return (windowWidth, windowHeight) => {
      const headerHeight = this.header.offsetHeight;
      const menuHeight = this.dropdownBtn.offsetHeight;
      this.sectionTops = [];
      this.inPageMenuLinks.forEach((link, index) => {
        if (!link.href) return;
        const targetHash = new URL(link.href).hash;
        const targetSection = document.querySelector(targetHash);
        if (targetSection) {
          this.sectionTops[index] = targetSection.offsetTop - headerHeight - menuHeight; // Adjust offset as needed
        }
      });
    };
  }
  onInPageMenuLinkClick(e) {
    e.preventDefault();
    const menuLink = e.currentTarget;
    const targetHash = new URL(menuLink.href).hash;
    const targetSection = document.querySelector(targetHash);
    this.dropdown.closeDropdown();
    setTimeout(() => {
      // targetSection?.scrollIntoView({ behavior: "smooth", block: "start" }); //without this set timeout, sometimes the menu scrolls up with the page because of the body top scroll fix solution
      if (targetSection) {
        const yOffset = -80; // Adjust offset if needed
        const y = targetSection.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({
          top: y,
          behavior: "smooth"
        });
      }
    }, 50);
  }
  addEventListeners() {
    this.addResizeObserver();
    this.resizeHandler(window.innerWidth, window.innerHeight);
    // Subscribe to resize and scroll events
    window.resizeManager.subscribe(this.resizeHandler);
    window.scrollManager.subscribe(this.scrollHandler);
    // Add event listeners for in-page menu links
    this.inPageMenuLinks.forEach(link => {
      link.addEventListener("click", this.onInPageMenuLinkClick.bind(this));
    });
  }
  removeEventListeners() {
    // Unsubscribe from resize and scroll events
    this.removeResizeObserver();
    window.resizeManager.unsubscribe(this.resizeHandler);
    window.scrollManager.unsubscribe(this.scrollHandler);

    // Remove event listeners for in-page menu links
    this.inPageMenuLinks.forEach(link => {
      link.removeEventListener("click", this.onInPageMenuLinkClick.bind(this));
    });
  }
}
class DropdownInterface extends HTMLElement {
  constructor() {
    super();
    this.isDesktop = window.innerWidth > 1023;
    /* attributes */
    this.mobileScrollLockOnOpen = this.hasAttribute("mobile-scroll-lock-on-open"); // Enables scroll locking on mobile when dropdown opens
    this.desktopScrollLockOnOpen = this.hasAttribute("desktop-scroll-lock-on-open"); // Enables scroll locking on desktop when dropdown opens
    this.isDisabled = this.hasAttribute("disabled"); // Checks if the dropdown is disabled
    this.isMultiSelect = this.hasAttribute("[multiselect]"); // Checks if the dropdown supports multiple selections

    /* elements */
    this.inPageMenuLinks = Array.from(this.querySelectorAll("[dropdown-inpage-menu-link]"));
    this.dropdownBtn = this.querySelector("[dropdown-btn]"); // Button to toggle the dropdown
    this.dropdownBtnText = this.dropdownBtn.querySelector("[dropdown-btn-text]"); // Text container inside the dropdown button
    this.dropdownOptionsList = this.querySelector("[dropdown-options-list]"); // Container for dropdown options
    this.dropdownPopup = this.querySelector("[dropdown-popup]"); // Popup container for dropdown
    this.defaultValue = this.getAttribute("dropdown-default-value") ?? ""; // Default text to display in the button
    this.resetBtn = this.querySelector("[dropdown-reset-btn]"); // Button to reset the dropdown selections
    this.resetFilterBtn = this.querySelector("[x-pagination-reset-filters-btn"); // Button to reset the dropdown count
    this.checkboxInputs = Array.from(this.dropdownPopup.querySelectorAll("[type='checkbox']")); // Checkbox inputs for multi-select functionality
    this.dropdownListItems = Array.from(this.dropdownPopup.querySelectorAll("[dropdown-options-list-item]")); // All dropdown items, including links, checkboxes, and options
    this.closeBtn = this.dropdownPopup.querySelector("[dropdown-close-btn]"); // Optional close button for the dropdown
    this.applyBtn = this.dropdownPopup.querySelector("[dropdown-apply-btn]"); // Optional apply button for the dropdown
    this.scrollbarThumb = this.dropdownPopup.querySelector("[dropdown-scrollbar-thumb]"); // Custom scrollbar thumb for the dropdown
    this.dropdownOptions = Array.from(this.dropdownPopup.querySelectorAll("[role='option']")); // Dropdown options with role="option"

    /* states */
    this.dropdownPopup.setAttribute("tabindex", "-1"); // Makes the dropdown popup initially unfocusable
    this.resetBtn?.setAttribute("tabindex", "-1"); // Makes the reset button initially unfocusable
    this.dropdownPopup.setAttribute("aria-hidden", "true"); // Hides the dropdown popup for accessibility
    this.isExpanded = false; // Indicates whether the dropdown is currently expanded
    this.activeIndex = -1; // Tracks the active index of the focused dropdown option

    /* setup select options */
    this.selectOptions = []; // Array to store selectable options
    if (this.dropdownOptions.length > 0) {
      this.selectOptions = this.dropdownOptions; // Uses role="option" elements if available
    } else if (this.checkboxInputs.length > 0) {
      this.selectOptions = this.checkboxInputs; // Uses checkboxes if no options are defined
    } else if (this.inPageMenuLinks.length > 0) {
      this.selectOptions = this.inPageMenuLinks; // Uses checkboxes if no options are defined
    }
    this.resetBtn && this.selectOptions.push(this.resetBtn); // Adds reset button to selectable options if present

    /* accessibility and positioning */
    this.checkboxInputs.forEach(el => el.setAttribute("tabindex", "-1")); // Sets all checkboxes to initially unfocusable
    this.setPosition(); // Ensures the dropdown is correctly positioned
    /* inert state setup */
    //setTimeout(() => this.makeDropDownInert(), 1000); // Delays the inert state for dropdown elements
    this.makeDropDownInert();
    // Initialize properties
    if (this.inPageMenuLinks.length > 0) {
      this.inPageMenuDropdownHandler = new InPageMenuDropdownHandler(this);
    }
    const secDropdownBtn = document.querySelector(".ui-secondary-menu-dropdown__btn");
    if (secDropdownBtn) {
      secDropdownBtn.addEventListener("click", function () {
        document.documentElement.classList.toggle("open-secondary-menu");
      });
    }

    // // Assuming 'this.dropdownBtn' is already defined and points to your dropdown element.
    // // this.dropdownBtnText = this.dropdownBtn.querySelector("[dropdown-btn-text]");

    // // Function to update the count of checked checkboxes
    // function updateCheckboxCount() {
    // 	const checkedCount = this.dropdownBtn.querySelectorAll('dropdown-options-list-item > input[type="checkbox"]:checked').length;
    // 	this.dropdownBtnText.textContent = `Selected: ${checkedCount}`;
    // }

    // // Adding event listeners to checkboxes
    // const checkboxes = this.dropdownBtn.querySelectorAll('dropdown-options-list-item > input[type="checkbox"]');
    // checkboxes.forEach(checkbox => {
    // 	checkbox.addEventListener('change', updateCheckboxCount.bind(this));
    // });

    // // Initial call to set the count on page load if needed
    // updateCheckboxCount.call(this);
  }
  onFocusableElementKeydown(e) {
    const {
      key
    } = e;
    if (key === "Tab") {
      if (e.shiftKey && document.activeElement === this.firstElement) {
        // If Shift+Tab is pressed on the first element, move focus to the last element
        e.preventDefault();
        this.lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === this.lastElement) {
        // If Tab is pressed on the last element, move focus to the first element
        e.preventDefault();
        this.firstElement.focus();
      }
    }
  }
  trapFocusInDropdown() {
    // Identify all focusable elements within the dropdown
    const focusableElements = this.dropdownPopup.querySelectorAll('a, button, input, textarea, select, [role], [tabindex]:not([tabindex="-1"])');
    this.firstElement = focusableElements[0]; // The first focusable element
    this.lastElement = focusableElements[focusableElements.length - 1]; // The last focusable element
    if (window.innerWidth < 1024) {
      // Add keydown event listener for focus trapping only on smaller screens
      this.dropdownPopup.addEventListener("keydown", this.onFocusableElementKeydown.bind(this));
    }
  }
  releaseFocusInDropdown() {
    // Remove keydown event listener for focus trapping
    this.dropdownPopup.removeEventListener("keydown", this.onFocusableElementKeydown.bind(this));
  }
  makeDropDownInert() {
    // Make all focusable elements within the dropdown inert (not focusable/interactable)
    const focusableElements = this.dropdownPopup.querySelectorAll('a, button, input, textarea, select, [role], [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(el => el.setAttribute("inert", "true"));
  }
  removeDropdownInertState() {
    // Remove inert attribute from all previously inert elements
    const inertElements = this.dropdownPopup.querySelectorAll("[inert]");
    inertElements?.forEach(el => el.removeAttribute("inert")); // Make elements interactable again
    this.closeBtn?.removeAttribute("disabled"); // Re-enable the close button if it exists
  }
  toggleDropdown(e) {
    e.stopPropagation(); // Prevent the click event from propagating to parent elements
    if (this.isDisabled) return; // Do nothing if the dropdown is disabled
    if (this.isExpanded) {
      this.closeDropdown(); // Close the dropdown if it is currently open
    } else {
      // Close currently open dropdown
      if (DropdownInterface.openDropdown && DropdownInterface.openDropdown !== this) {
        DropdownInterface.openDropdown.closeDropdown();
      }
      // Open this dropdown
      DropdownInterface.openDropdown = this;
      this.isExpanded = true; // Mark the dropdown as expanded
      this.dropdownBtn.setAttribute("aria-expanded", "true"); // Update accessibility attribute
      this.dropdownPopup.setAttribute("aria-hidden", "false");
      this.disablePageScroll();
      this.animateDropdownOpen(); // Animate the dropdown opening
      this.removeDropdownInertState(); // Make the dropdown elements interactable
      this.trapFocusInDropdown(); // Trap focus within the dropdown
    }
  }
  closeDropdown() {
    if (!this.isExpanded) return; // Do nothing if the dropdown is already closed
    this.isExpanded = false; // Mark the dropdown as collapsed
    this.dropdownBtn.setAttribute("aria-expanded", "false"); // Update accessibility attribute
    this.dropdownPopup.setAttribute("aria-hidden", "true");
    // Clear the global tracker if this dropdown is being closed
    if (DropdownInterface.openDropdown === this) {
      DropdownInterface.openDropdown = null;
    }
    this.animateDropdownClose(); // Animate the dropdown closing
    this.restorePageScroll();
    this.releaseFocusInDropdown(); // Release focus trapping
    this.makeDropDownInert(); // Make dropdown elements inert
    this.dropdownBtn.focus(); // Return focus to the dropdown button
  }
  disablePageScroll() {
    if (this.mobileScrollLockOnOpen && window.innerWidth < 1024) {
      window.disableScroll(); // Prevent background scrolling on mobile
      document.documentElement.classList.add("show-modal-overlay"); // Add overlay effect for mobile
    }
    if (this.desktopScrollLockOnOpen && window.innerWidth >= 1024) {
      window.disableScroll(); // Prevent background scrolling on desktop
      document.documentElement.classList.add("show-modal-overlay"); // Add overlay effect for desktop
    }
  }
  restorePageScroll() {
    if (this.mobileScrollLockOnOpen && window.innerWidth < 1024) {
      window.enableScroll(); // Restore background scrolling on mobile
      document.documentElement.classList.remove("show-modal-overlay"); // Remove overlay effect for mobile
    }
    if (this.desktopScrollLockOnOpen && window.innerWidth >= 1024) {
      window.enableScroll(); // Restore background scrolling on desktop
      document.documentElement.classList.remove("show-modal-overlay"); // Remove overlay effect for desktop
    }
  }
  getDropdownPopupHeight() {
    const scrollHeight = this.dropdownPopup.scrollHeight;
    if (this.isDesktop) return scrollHeight;
    if (this.hasAttribute("data-filter")) {
      return window.innerHeight;
    } else {
      const maxPopupHeight = window.innerHeight - this.dropdownPopup.getBoundingClientRect().top;
      return scrollHeight > maxPopupHeight ? maxPopupHeight : scrollHeight;
    }
  }
  animateDropdownOpen() {
    this.setPosition(); // Adjust the dropdown's position based on its alignment
    // Get the full height of the dropdown content
    this.dropdownPopup.setAttribute("aria-hidden", "false"); // Mark the popup as visible for accessibility
    gsap.fromTo(this.dropdownPopup, {
      height: 0
    }, {
      height: this.getDropdownPopupHeight(),
      // Animate to the full height
      duration: this.isDesktop ? 0.2 : 0.3,
      // Animation duration
      ease: "emphasized-decelerate",
      // Easing for smooth animation
      onComplete: () => {
        this.dropdownPopup.setAttribute("tabindex", "0"); // Make the popup focusable
        this.resetBtn?.setAttribute("tabindex", "0"); // Make the reset button focusable
        setTimeout(() => {
          // Adjust scrollbar dimensions after the dropdown has opened
          this.scrollbarThumb?.verticalScrollbarInstance.setDimensions();
          this.scrollbarThumb && (this.scrollbarThumb.verticalScrollbarInstance.extraSpace = 5);
        }, 100);
        if (this.checkboxInputs.length > 0) {
          this.checkboxInputs.forEach(input => input.setAttribute("tabindex", "0")); // Make checkboxes focusable
          this.checkboxInputs[0].focus(); // Focus on the first checkbox
        }
      }
    });
    gsap.fromTo(this.dropdownListItems, {
      opacity: 0,
      y: this.isDesktop ? -4 : -8
    },
    // Start with opacity 0 and slight upward offset
    {
      opacity: 1,
      // Animate to full opacity
      y: 0,
      // Animate to original position
      duration: this.isDesktop ? 0.3 : 0.4,
      // Animation duration based on screen size
      stagger: this.isDesktop ? 0.03 : 0.02,
      // Stagger delay for list items
      ease: "standard-decelerate" // Easing for smooth animation
    });
  }
  animateDropdownClose() {
    gsap.to(this.dropdownPopup, {
      height: 0,
      // Animate the height to 0
      duration: this.isDesktop ? 0.1 : 0,
      // Animation duration
      ease: "emphasized",
      // Easing for smooth animation
      onComplete: () => {
        this.dropdownPopup.setAttribute("aria-hidden", !this.isExpanded); // Mark the popup as hidden for accessibility
        this.dropdownPopup.setAttribute("tabindex", "-1"); // Make the popup unfocusable
        this.resetBtn?.setAttribute("tabindex", "-1"); // Make the reset button unfocusable
      }
    });
    this.checkboxInputs.forEach(input => input.setAttribute("tabindex", "-1")); // Make checkboxes unfocusable
  }
  toggleCheckbox(event) {
    let count = this.dropdownPopup.querySelectorAll("[type='checkbox']:checked").length;
    if (count <= 0) {
      this.dropdownBtnText.removeAttribute("data-checked-count");
      this.dropdownBtnText.innerHTML = this.dropdownBtnText.textContent.split(' (')[0];
    } else {
      this.dropdownBtnText.setAttribute("data-checked-count", count > 0 ? `(${count})` : "");
      this.dropdownBtnText.innerHTML = this.dropdownBtnText.textContent.split(' (')[0] + ` (${count})`; // Replace count
    }
    this.resetBtn?.parentElement?.setAttribute("aria-hidden", count == 0);
  }
  onDropdownOptionClick(e) {
    if (e.currentTarget.hasAttribute("dropdown-reset-btn")) return;
    this.dropdownOptions.forEach(el => el.setAttribute("aria-selected", false));
    const selectedOption = e.currentTarget;
    let isSelected = selectedOption.getAttribute("aria-selected") === "true";
    this.dropdownBtnText.textContent = selectedOption.getAttribute("value");
    selectedOption.setAttribute("aria-selected", !isSelected);
    this.resetBtn?.parentElement?.setAttribute("aria-hidden", false);
    if (!this.isMultiSelect) {
      this.closeDropdown();
    }
  }
  scrollToLastElement() {
    const lastElement = this.dropdownOptions[this.dropdownOptions.length - 1];
    if (lastElement) {
      this.dropdownOptionsList.scrollTop = lastElement.offsetTop;
    }
  }
  onResetBtnClick(e) {
    e.preventDefault();
    if (this.dropdownOptionsList) this.dropdownOptionsList.scrollTop = 0;
    this.resetDropdown();
  }
  resetDropdown() {
    if (this.checkboxInputs.length > 0) {
      let inputs = this.dropdownPopup.querySelectorAll("[type='checkbox']:checked");
      inputs.forEach(input => input.checked = false);
      this.dropdownBtnText.removeAttribute("data-checked-count");
      this.dropdownBtnText.innerHTML = this.dropdownBtnText.textContent.split(' (')[0]; // Remove count
    }
    this.dropdownOptions.forEach(el => {
      if (el.getAttribute("aria-selected") === "true") {
        el.setAttribute("aria-selected", false);
      }
      this.dropdownBtnText.textContent = this.defaultValue;
    });
    this.resetBtn?.parentElement?.setAttribute("aria-hidden", true);
    this.closeDropdown();
  }
  onDocumentClick(event) {
    if (this.isExpanded && !this.contains(event.target)) {
      this.closeDropdown();
    }
  }
  setPosition() {
    if (window.innerWidth < 1024) return;
    const popupBoundingRect = this.dropdownPopup.getBoundingClientRect();
    this.dropdownBtnOffset = this.dropdownBtn.getBoundingClientRect().top + 32 + 8;
    const popupWidth = popupBoundingRect.width;
    const popupRight = popupBoundingRect.right;
    const windownWidth = window.innerWidth;
    const isRightAligned = popupRight - popupWidth > windownWidth / 2;
    this.dropdownPopup.classList[isRightAligned ? "add" : "remove"]("is-right-aligned");
  }
  onDocumentKeydown(e) {
    const {
      key
    } = e;
    const openKeys = ["Enter", " "];
    if (!this.isExpanded && openKeys.includes(key) && document.activeElement == this.dropdownBtn) {
      e.preventDefault();
      this.toggleDropdown(e);
    } else {
      switch (key) {
        case "ArrowDown":
          e.preventDefault();
          // this.updateCustomSelectHovered(this.activeIndex + 1, "end");
          this.navigateOptions(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          // this.updateCustomSelectHovered(this.activeIndex - 1, "start");
          this.navigateOptions(-1);
          break;
        case "Enter":
          e.preventDefault();
          this.selectOption();
          break;
        case "Escape":
          e.preventDefault();
          this.closeDropdown();
          break;
        default:
          this.handleAlphanumericKeyPress(key);
          break;
      }
    }
  }
  handleAlphanumericKeyPress(key) {
    // Capture the key pressed
    if (this.selectOptions.length > 0 && this.isExpanded) {
      // Check if the key is alphanumeric
      if (!/^[a-zA-Z0-9]$/.test(key)) return;

      // Get the current input value
      this.keySearch = key.toLowerCase();
      const matchingOption = this.selectOptions.find((optionEl, index) => {
        return index > this.activeIndex && optionEl.getAttribute("value").toLowerCase().startsWith(this.keySearch);
      });
      if (matchingOption) {
        this.activeIndex = this.selectOptions.indexOf(matchingOption);
        this.updateCustomSelectHovered(this.activeIndex, "start");
      }
    }
  }
  navigateOptions(direction) {
    if (this.selectOptions.length === 0 || !this.isExpanded) return;
    let initialIndex = this.activeIndex;
    do {
      this.activeIndex = (this.activeIndex + direction + this.selectOptions.length) % this.selectOptions.length;
    } while (this.selectOptions[this.activeIndex].getAttribute("aria-hidden") === "true" && this.activeIndex !== initialIndex);
    if (this.selectOptions[this.activeIndex].getAttribute("aria-hidden") === "true") {
      this.activeIndex = -1;
    }
    // Update focus and classes
    this.selectOptions.forEach((option, index) => {
      if (option && option.getAttribute("aria-hidden") !== "true") {
        option.classList[index === this.activeIndex ? "add" : "remove"]("has-focus");
      }
    });
    if (this.activeIndex !== -1) {
      this.selectOptions[this.activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }
  selectOption() {
    if (this.activeIndex === -1 || !this.isExpanded) return;
    if (this.selectOptions[this.activeIndex]) {
      this.selectOptions[this.activeIndex].focus();
      this.selectOptions[this.activeIndex].click();
    }
  }
  updateCustomSelectHovered(index, scrollPosition) {
    if (this.selectOptions.length === 0 || !this.isExpanded) return;
    this.activeIndex = index;
    this.selectOptions.forEach(optionEl => {
      optionEl.setAttribute("aria-selected", false);
    });
    const selectedEl = this.selectOptions[index];
    if (selectedEl) {
      selectedEl.setAttribute("aria-selected", true);
      selectedEl.scrollIntoView({
        block: scrollPosition
      });
    }
  }
  onCheckboxKeydown(event) {
    const checkbox = event.target;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      checkbox.checked = !checkbox.checked;
      this.toggleCheckbox(event);
      checkbox.focus();
    }
  }
  connectedCallback() {
    if (this.inPageMenuDropdownHandler) {
      this.inPageMenuDropdownHandler.resizeHandler(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("load", () => {
      if (this.inPageMenuDropdownHandler) {
        this.inPageMenuDropdownHandler.resizeHandler(window.innerWidth, window.innerHeight);
      }
    });
    this.manageEventListeners("addEventListener");
  }
  disconnectedCallback() {
    if (this.inPageMenuDropdownHandler) {
      this.inPageMenuDropdownHandler.removeEventListeners();
    }
    this.manageEventListeners("removeEventListener");
  }
  rebindOptionClickEven() {
    this.dropdownOptions = Array.from(this.dropdownPopup.querySelectorAll("[role='option']")); // Dropdown options with 
    this.dropdownOptions.forEach(el => {
      el.addEventListener("click", this.onDropdownOptionClick.bind(this));
    });
  }
  manageEventListeners(action) {
    this.dropdownBtn[action]("click", this.toggleDropdown.bind(this));
    this.resetBtn?.[action]("click", this.onResetBtnClick.bind(this));
    this.resetFilterBtn?.[action]("click", this.onResetBtnClick.bind(this));
    this.closeBtn?.[action]("click", this.closeDropdown.bind(this));
    this.applyBtn?.[action]("click", this.closeDropdown.bind(this));
    document[action]("click", this.onDocumentClick.bind(this));
    document[action]("keydown", this.onDocumentKeydown.bind(this));
    window[action]("resize", this.setPosition.bind(this));
    if (window.innerWidth > 1024) {
      window[action]("scroll", this.closeDropdown.bind(this));
    }
    this.checkboxInputs.forEach(el => {
      el[action]("click", this.toggleCheckbox.bind(this));
      el[action]("keydown", this.onCheckboxKeydown.bind(this));
    });
    this.dropdownOptions.forEach(el => {
      el[action]("click", this.onDropdownOptionClick.bind(this));
    });

    /* State management for flyout menu */
    const level1NavItems = document.querySelectorAll(".ui-flyout-menu__level1-nav-item");
    if (level1NavItems) {
      level1NavItems.forEach(item => {
        item.addEventListener("click", event => {
          event.stopPropagation();
          this.closeDropdown();
        });
      });
    }

    /* State management for checkbox */
    setTimeout(() => {
      let checkboxChecked = this.dropdownPopup.querySelectorAll("[type='checkbox']");
      let count = 0;
      checkboxChecked.forEach(el => {
        // Increment count if the checkbox is checked
        if (el.checked) {
          count++;
        }
      });

      // Ensure that this.dropdownBtnText exists before trying to modify it
      if (this.dropdownBtnText) {
        if (count > 0) {
          this.dropdownBtnText.setAttribute("data-checked-count", `(${count})`);
          this.dropdownBtnText.innerHTML = this.dropdownBtnText.textContent.split(' (')[0] + ` (${count})`; // Replace count
        } else {
          this.dropdownBtnText.removeAttribute("data-checked-count");
          this.dropdownBtnText.innerHTML = this.dropdownBtnText.textContent.split(' (')[0];
        }
      }
    }, 100);
  }
}
customElements.define("dropdown-interface", DropdownInterface);