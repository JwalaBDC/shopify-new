export default class SectionalBanner {
  constructor({
    element
  }) {
    this.container = element;
    this.bannerImageWrapper = this.container.querySelector("[data-sectional-banner-motion-element='image-wrapper']");
    this.isAnimatedIn = false;
    this.resizeTimer = false;
    this.windowHeight = window.innerHeight;
    this.scrollY = window.scrollY;
    this.easedScale = 1;
    this.addEventListeners();
    this.setOffsets();
    requestAnimationFrame(this.tick.bind(this));
    this.animateOut();
  }
  animateIn() {
    if (this.isAnimatedIn) return;
    this.isAnimatedIn = true;
    this.container.classList.add("is-visible-in-viewport");
  }
  animateOut() {
    this.isAnimatedIn = false;
  }
  setOffsets() {
    this.elementTop = this.container.getBoundingClientRect().top + window.scrollY;
  }
  updateScroll(scrollY) {
    this.scrollY = scrollY;
  }
  onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.windowHeight = window.innerHeight;
    }, 100);
  }
  tick() {
    requestAnimationFrame(this.tick.bind(this));
    const elementTop = this.elementTop - this.scrollY;
    const scale = gsap.utils.mapRange(0, -this.windowHeight, 1, 1.2, elementTop);
    const clampedScale = gsap.utils.clamp(1, 1.2, scale);
    const easedScale = gsap.utils.interpolate(this.easedScale, clampedScale, 0.5);
    this.easedScale = easedScale;
    if (this.bannerImageWrapper) {
      gsap.set(this.bannerImageWrapper, {
        scale: easedScale,
        transformOrigin: "top center",
        overwrite: true
      });
    }
  }
  addEventListeners() {
    window.scrollManager.subscribe(this.updateScroll.bind(this));
  }
}