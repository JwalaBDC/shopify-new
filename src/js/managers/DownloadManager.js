// class DownloadManager {
// 	static init() {
// 		const downloadButtons = document.querySelectorAll("a[download]");
// 		if (downloadButtons.length > 0) {
// 			downloadButtons.forEach((button) => {
// 				button.addEventListener("click", this.downloadFile.bind(this));
// 			});
// 		}
// 	}
// 	static downloadFile(e) {
// 		e.preventDefault();
// 		const link = e.currentTarget;
// 		const url = link.href;
// 		const filename = link.getAttribute("download") || "download";
// 		fetch(url)
// 			.then((response) => response.blob())
// 			.then((blob) => {
// 				const a = document.createElement("a");
// 				const objectURL = URL.createObjectURL(blob);
// 				a.href = objectURL;
// 				a.download = filename;
// 				a.style.display = "none";
// 				document.body.appendChild(a);
// 				a.click();
// 				document.body.removeChild(a);
// 				URL.revokeObjectURL(objectURL);
// 			})
// 			.catch((error) => console.error("Download error:", error));
// 	}
// }
// DownloadManager.init();


(function () {
	function handleClick(e) {
		const target = e.target;
		if (!(target instanceof HTMLElement)) return;

		const link = target.closest('a[download]');
		if (!link) return;

		const url = link.href;
		const downloadAttr = link.getAttribute('download');
		const filename =
			downloadAttr ||
			url.split('/').pop()?.split('?')[0] ||
			'file';

		const sameOrigin =
			url.startsWith(window.location.origin) ||
			(!url.startsWith('http://') && !url.startsWith('https://'));

		// Let browser handle same-origin downloads
		if (sameOrigin) return;

		e.preventDefault();

		// Redirect via proxy to trigger native download UI
		const proxyUrl = window.location.origin + window.basepath +
			`/api/download-file.php?url=${encodeURIComponent(url)}` +
			`&filename=${encodeURIComponent(filename)}`;

		window.open(proxyUrl, '_blank');
	}

	document.addEventListener('click', handleClick);

	// Optional cleanup if you ever need it
	window.__removeDownloadInterceptor = function () {
		document.removeEventListener('click', handleClick);
	};
})();

