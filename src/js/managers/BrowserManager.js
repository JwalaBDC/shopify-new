class BrowserManager {
	static init() {
		const browser = this.detectBrowser();

		document.documentElement.dataset.browser = browser.toLowerCase();
		window.detectBrowser = browser;

		this.applyBrowserSpecificFixes(browser);
	}

	static detectBrowser() {
		const ua = navigator.userAgent.toLowerCase();

		if (ua.includes("firefox")) return "Firefox";
		if (ua.includes("edg")) return "Edge";
		if (!!document.documentMode) return "Internet Explorer";
		if (ua.includes("opr") || ua.includes("opera")) return "Opera";
		if (ua.includes("vivaldi")) return "Vivaldi";
		if (ua.includes("chrome")) return "Chrome";
		if (ua.includes("safari")) return "Safari";

		return "Unknown";
	}

	static applyBrowserSpecificFixes(browser) {
		if (browser === "Internet Explorer") {
			console.warn("This application may not work optimally on Internet Explorer.");
		}
	}
}

console.log('BrowserManager loaded');

export default BrowserManager;
