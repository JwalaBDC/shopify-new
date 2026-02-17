console.log("MAIN JS LOADED");

/* managers */
import scrollManager from "./managers/ScrollManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import DeviceManager from "./managers/DeviceManager.js";
import ImageManager from "./managers/ImageManager.js";

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


/* ui-component */
// import "./components/ui/ui-header.js";

/* init */
BrowserManager.init();
DeviceManager.init();
ImageManager.init();
scrollManager.init();
