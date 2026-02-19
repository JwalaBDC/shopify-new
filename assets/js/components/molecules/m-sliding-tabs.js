document.addEventListener("DOMContentLoaded", () => {
  const tabContainer = document.querySelector(".m-sliding-tabs");
  if (!tabContainer) return; // Exit if tabs don't exist on the page

  const tabs = document.querySelectorAll(".m-sliding-tabs__button");
  const panels = document.querySelectorAll(".m-sliding-tabs__panel");
  const activeBg = document.querySelector(".m-sliding-tabs__active-bg");
  function updateActiveBg(tab) {
    if (!tab) return; // Avoid errors if tab is null
    activeBg.style.width = `${tab.offsetWidth}px`;
    activeBg.style.transform = `translateX(${tab.offsetLeft}px)`;
  }
  function activateTab(tab) {
    if (!tab) return; // Safety check

    tabs.forEach(t => {
      t.classList.remove("m-sliding-tabs__button--active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    panels.forEach(p => p.classList.remove("m-sliding-tabs__panel--active"));
    tab.classList.add("m-sliding-tabs__button--active");
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");
    const targetPanel = document.getElementById(`panel-${tab.dataset.tab}`);
    if (targetPanel) {
      targetPanel.classList.add("m-sliding-tabs__panel--active");
    }
    updateActiveBg(tab);
    tab.focus();
  }

  // **Fix: Only update if activeTab exists**
  const activeTab = document.querySelector(".m-sliding-tabs__button--active");
  if (activeTab) {
    updateActiveBg(activeTab);
  }
  tabs.forEach(tab => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", event => {
      let newTab;
      const currentIndex = Array.from(tabs).indexOf(tab);
      if (event.key === "ArrowRight") {
        newTab = tabs[(currentIndex + 1) % tabs.length];
      } else if (event.key === "ArrowLeft") {
        newTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
      } else if (event.key === "Home") {
        newTab = tabs[0];
      } else if (event.key === "End") {
        newTab = tabs[tabs.length - 1];
      }
      if (newTab) {
        activateTab(newTab);
        event.preventDefault();
      }
    });
  });
  window.addEventListener("resize", () => {
    if (activeBg) {
      const updatedActiveTab = document.querySelector(".m-sliding-tabs__button--active");
      updateActiveBg(updatedActiveTab);
    }
  });
});