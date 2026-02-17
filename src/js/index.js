/* GSAP easings */
gsap.registerPlugin(CustomEase);
CustomEase.create("custom-cubic-easing", "0.6,0.045,0.355,1");
CustomEase.create("custom-cubic-easing", "0.5,0.045,0.355,1");
CustomEase.create("standard", "0.2,0,0,1");
CustomEase.create("standard-decelerate", "0, 0, 0, 1");
CustomEase.create("standard-accelerate", "0.3, 0, 1, 1");
CustomEase.create("emphasized", "0.2,0,0,1");
CustomEase.create("emphasized-decelerate", "0.05, 0.7, 0.1, 1");
CustomEase.create("emphasized-accelerate", "0.3, 0, 0.8, 0.15");

/* managers */
import "./managers/ScrollManager.js"; //must be placed before other files
import "./managers/ResizeManager.js"; //must be placed before other files
import "./managers/BrowserManager.js";
import "./managers/DeviceManager.js";
import "./managers/ButtonManager.js";
import "./managers/ImageManager.js";
import "./managers/SnackBarManager.js";
import "./managers/ToastManager.js";
import "./managers/DownloadManager.js";
/* helpers */
import "./helpers/scrollRestoration.js";
import "./helpers/SkipToContent.js";
import "./helpers/scrollLock.js";
import "./helpers/inputSantize.js";
import "./helpers/stickyBars.js";
import "./helpers/HorizontalScrollbar.js";
import "./helpers/VerticalScrollbar.js";
import "./helpers/ScrollToSection.js";
import "./helpers/Breadcrumb.js";
import "./helpers/PlaceholderSuggestions.js";
/* motion */
import "./motion/observers/MotionObserver.js";
import "./motion/observers/StaggerMotionObserver.js";
import "./motion/classes/Hero.js";
/* interfaces */
import "./interfaces/tab-interface.js";
import "./interfaces/sliders/slider-interface.js";
import "./interfaces/card-link-interface.js";
import "./interfaces/dropdown-interface.js";
import "./interfaces/accordion-interface.js";
/* custom */
import "./custom/x-share.js";
import "./custom/x-link-menu.js";
import "./interfaces/modal-interface.js";
/* m-molecule */
import "./components/molecules/m-text-input-field.js";
import "./components/molecules/m-input-range.js";
import "./components/molecules/m-input-upload.js";
import "./components/molecules/m-form.js";
/* import "./components/molecules/m-global-mobile-input.js"; */
import "./components/molecules/m-snackbar.js";
import "./components/molecules/m-product-filter.js";
import "./components/molecules/m-input-checkbox.js";
import "./components/molecules/m-sliding-tabs.js";
/* ui-component */
import "./components/ui/ui-footer.js";
import "./components/ui/ui-header.js";