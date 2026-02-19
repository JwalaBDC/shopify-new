/**
 * Interface: AccordionInterface
 * Description:
 *	- A custom accordion interface for handling expandable/collapsible sections with animation.
 *	- Supports keyboard navigation and focus management for accessibility.
 *
 * Motion Transition Details:
 *	- Expand Animation:
 *		- Duration: 200ms
 *		- Easing: standard-decelerate
 *	- Collapse Animation:
 *		- Duration: 100ms
 *		- Easing: standard
 *	- Instant transitions can be enabled with `instant-transition` class.
 *
 * Accessibility Features:
 *	- ARIA attributes (`aria-expanded`) for assistive technologies.
 *	- Focus management ensures elements inside expanded accordions are accessible.
 *	- Keyboard navigation with `Arrow`, `Enter`, `Space`, `Home`, and `End` keys.
 *
 * Usage:
 *	- Attach the custom element `<accordion-interface>` to your HTML.
 *	- Include headers with `[accordion-header]`, buttons with `[accordion-button]`, and content sections with `[accordion-content]`.
 */
class AccordionInterface extends HTMLElement {
  constructor() {
    super();
    //References to accordion headers and triggers
    this.triggers = this.querySelectorAll("[accordion-button]"); //Accordion toggle buttons
    this.clickHandler = this.createClickHandler(); //Pre-bound click event handler
    this.keyHandler = this.createKeyHandler(); //Pre-bound keyboard event handler
    this.init(); //Initialize the accordion state
  }

  //Initializes the accordion state based on its current attributes/classes
  init() {
    for (const trigger of this.triggers) {
      const parent = trigger.closest("[accordion]"); //Accordion container
      let content = parent?.querySelector("[accordion-content]"); //Accordion content
      if (parent.classList.contains("is-accordion-expanded")) {
        //Set expanded state for open accordions
        gsap.set(content, {
          height: "auto"
        }); //Set height to auto for open accordion
        trigger.setAttribute("aria-expanded", "true");
        content.setAttribute("display-content", "true");
        if (window.innerWidth > 768 && content.closest("footer")) content.setAttribute("tabindex", "0");
        this.enableElementFocusability(content);
      } else {
        //Set collapsed state for closed accordions
        gsap.set(content, {
          height: 0,
          overflow: "hidden"
        }); //Collapse the accordion
        trigger.setAttribute("aria-expanded", "false");
        content.setAttribute("display-content", "false");
        content.setAttribute("tabindex", "-1");
        this.disableElementFocusability(content);
      }
    }
  }

  //Creates the click event handler for accordion toggle buttons
  createClickHandler() {
    return e => {
      const btn = e.currentTarget;
      const parent = btn.closest("[accordion]");
      let content = parent.querySelector("[accordion-content]");
      let isExpanded = btn.getAttribute("aria-expanded") === "true";
      //Toggle aria-expanded and content attributes
      btn.setAttribute("aria-expanded", !isExpanded);
      content.setAttribute("display-content", !isExpanded);

      //Set focusability based on expanded/collapsed state
      if (window.innerWidth > 768 && content.closest("footer")) content.setAttribute("tabindex", !isExpanded ? "-1" : "0");
      isExpanded ? this.disableElementFocusability(content) : this.enableElementFocusability(content);

      //Handle motion transitions
      const instantTransition = content.classList.contains("instant-transition");
      const scrollIntoViewOnClick = parent.hasAttribute("scroll-into-view-on-click");
      const closeInstantlyOnClick = parent.hasAttribute("close-instantly-on-click");
      if (isExpanded) {
        parent.classList.remove("is-accordion-expanded");
        if (closeInstantlyOnClick) {
          gsap.set(content, {
            height: 0
          });
        } else {
          gsap.to(content, {
            height: 0,
            duration: instantTransition ? 0 : 0.1,
            ease: "standard"
          });
        }
      } else {
        parent.classList.add("is-accordion-expanded");
        gsap.to(content, {
          height: "auto",
          duration: instantTransition ? 0 : 0.2,
          ease: "standard-decelerate",
          onComplete: () => {
            if (scrollIntoViewOnClick) {
              parent.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
            }
          }
        });
      }
    };
  }

  //Disables focusability of elements inside the accordion
  disableElementFocusability(element) {
    if (!element || window.innerWidth > 768 && element.closest("footer")) return;
    const focusableElements = element.querySelectorAll("input, button, a, select, textarea");
    focusableElements.forEach(element => {
      element.setAttribute("tabindex", "-1"); //Disable focusability
    });
  }

  //Enables focusability of elements inside the accordion
  enableElementFocusability(element) {
    if (!element || window.innerWidth > 768 && element.closest("footer")) return;
    const focusableElements = element.querySelectorAll("input, button, a, select, textarea");
    focusableElements.forEach(element => {
      element.removeAttribute("tabindex"); //Enable focusability
    });
  }

  //Creates the keyboard event handler for accessibility navigation
  createKeyHandler() {
    return e => {
      const currentIndex = Array.from(this.triggers).indexOf(e.target); //Get index of the current button
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.clickHandler(e); //Simulate click on Enter or Space
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        this.focusPreviousButton(currentIndex, e); //Focus previous button
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        this.focusNextButton(currentIndex, e); //Focus next button
      } else if (e.key === "Home") {
        this.focusFirstButton(e); //Focus the first button
      } else if (e.key === "End") {
        this.focusLastButton(e); //Focus the last button
      }
    };
  }

  //Focuses the previous button in the accordion
  focusPreviousButton(index, e) {
    if (this.triggers[index - 1]) {
      this.triggers[index - 1].focus(); //Focus the previous button
      e.preventDefault();
    }
  }

  //Focuses the next button in the accordion
  focusNextButton(index, e) {
    if (this.triggers[index + 1]) {
      this.triggers[index + 1].focus(); //Focus the next button
      e.preventDefault();
    }
  }

  //Focuses the first button in the accordion
  focusFirstButton(e) {
    this.triggers[0]?.focus(); //Focus the first button
    e.preventDefault();
  }

  //Focuses the last button in the accordion
  focusLastButton(e) {
    this.triggers[this.triggers.length - 1]?.focus(); //Focus the last button
    e.preventDefault();
  }
  addMutationObserver() {
    this.mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        console.log(mutation);
        if (mutation.type === "childList") {
          this.setupTriggers();
        }
      }
    });
  }
  setupTriggers() {
    this.triggers = this.querySelectorAll("[accordion-button]");
    for (const trigger of this.triggers) {
      trigger.addEventListener("click", this.clickHandler); //Attach click event
      trigger.addEventListener("keydown", this.keyHandler); //Attach keyboard event
    }
  }
  //Lifecycle hook: Attaches event listeners
  connectedCallback() {
    this.addMutationObserver();
    this.mutationObserver.observe(this, {
      childList: true,
      subtree: true
    });
    this.setupTriggers();
  }

  //Lifecycle hook: Detaches event listeners
  disconnectedCallback() {
    this.mutationObserver.disconnect();
    for (const trigger of this.triggers) {
      trigger.removeEventListener("click", this.clickHandler); //Detach click event
      trigger.removeEventListener("keydown", this.keyHandler); //Detach keyboard event
    }
  }
}

//Define the custom element
customElements.define("accordion-interface", AccordionInterface);