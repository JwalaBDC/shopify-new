import CSSClass from "../classes/CSSClass.js";
import ImageReveal from "../classes/ImageReveal.js";
import SectionalBanner from "../classes/SectionalBanner.js";
import SplitTitle from "../classes/SplitTitle.js";
class MotionObserver {
  constructor() {
    this.element = document.documentElement;
    this.animationSelectors = {
      cssClassAnimations: '[data-motion-observer="css-class"]',
      imageRevealAnimations: '[data-motion-observer="image-reveal"]',
      sectionalBanner: '[data-motion-observer="sectional-banner"]',
      splitTitleAnimations: '[data-motion-observer="split-title"]'
    };
    this.init();
  }
  init() {
    this.queryDOM();
    this.createObserver();
    this.observeElements();
  }
  queryDOM() {
    this.elements = {};
    for (const key in this.animationSelectors) {
      const selector = this.animationSelectors[key];
      this.elements[key] = Array.from(this.element.querySelectorAll(selector));
    }
  }
  createObserver() {
    const deviceRootMarginSmallHeightDevice = window.innerHeight >= 600 && window.innerHeight <= 680 ? "-50px" : "-150px";
    const deviceRootMargin = window.innerWidth < 768 ? "-50px" : `${deviceRootMarginSmallHeightDevice}`;
    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.motionInstance.animateIn();
        } else {
          entry.target.motionInstance.animateOut();
        }
      });
    }, {
      rootMargin: `0px 0px ${deviceRootMargin} 0px`
    });
  }
  observeElements() {
    this.elements.cssClassAnimations.forEach(el => {
      el.motionInstance = new CSSClass({
        element: el
      });
      this.intersectionObserver.observe(el);
      el.addEventListener("unobserve", () => {
        this.intersectionObserver.unobserve(el);
      });
    });
    this.elements.imageRevealAnimations.forEach(el => {
      el.motionInstance = new ImageReveal({
        element: el
      });
      this.intersectionObserver.observe(el);
      el.addEventListener("unobserve", () => {
        this.intersectionObserver.unobserve(el);
      });
    });
    this.elements.sectionalBanner.forEach(el => {
      el.motionInstance = new SectionalBanner({
        element: el
      });
      this.intersectionObserver.observe(el);
      el.addEventListener("unobserve", () => {
        this.intersectionObserver.unobserve(el);
      });
    });
    this.elements.splitTitleAnimations.forEach(el => {
      el.motionInstance = new SplitTitle({
        element: el
      });
      if (!el.hasAttribute("data-hero-motion-element")) {
        this.intersectionObserver.observe(el);
        el.addEventListener("unobserve", () => {
          this.intersectionObserver.unobserve(el);
        });
      }
    });
  }
}
export const motionObserverInstance = new MotionObserver();