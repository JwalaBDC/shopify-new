class ScrollToSection {
  constructor(ele) {
    this.cta = ele;
    this.sectionID = this.cta.getAttribute("data-scroll-to") ?? "";
    this.header = document.querySelector("header");
    this.cta.addEventListener("click", this.handleScrollSection.bind(this));
  }

  handleScrollSection(e) {
    e.preventDefault();
    const section = document.querySelector(`#${this.sectionID}`);
    if (!section) return;
    const extraSpace = window.innerWidth > 768 ? 40 : 20;
    var sectionOffset = section.getBoundingClientRect().top - extraSpace;
    var offsetPosition =
      sectionOffset + window.pageYOffset - this.header.offsetHeight;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

const scrollButtons = document.querySelectorAll("[data-scroll-to]");
if (scrollButtons.length > 0) {
  scrollButtons.forEach((scrollButton) => new ScrollToSection(scrollButton));
}
