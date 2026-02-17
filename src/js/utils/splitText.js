export function splitByWords(el) {
	let nodes = el.childNodes;
	let newHTML = "";
	[...nodes].forEach(function (node) {
		if (node.nodeType === 3) {
			let textContent = node.textContent.replace(/[\n\r]+|[\s]{2,}/g, " ").trim();
			let words = textContent.split(" ");
			words.map(function (word) {
				if (word) {
					newHTML += `<span class="word-wrapper"><span class="word">${word}&nbsp;</span></span>`;
				}
			});
		} else if (node.nodeType === 1) {
			if (node.tagName === "SPAN") {
				let innerSpanElement = node;
				let spanChildNodes = innerSpanElement.childNodes;
				let nodeClasses = "";
				let nodeClassList = [...innerSpanElement.classList];
				nodeClassList.forEach((nodeClass) => {
					nodeClasses += nodeClass + " ";
				});
				[...spanChildNodes].forEach(function (spanChildNode) {
					if (spanChildNode.nodeType === 3) {
						let textContent = spanChildNode.textContent.replace(/[\n\r]+|[\s]{2,}/g, " ").trim();
						let words = textContent.split(" ");
						words.map(function (word) {
							if (word) {
								newHTML += `<span class="word-wrapper ${nodeClasses}"><span class="word">${word}&nbsp;</span></span>`;
							}
						});
					} else if (spanChildNode.nodeType === 1) {
						newHTML += spanChildNode.outerHTML;
					}
				});
			} else {
				newHTML += node.outerHTML;
			}
		}
	});
	el.innerHTML = newHTML;
	return el.querySelectorAll("span");
}
export function calculateLines(spans) {
	const lines = [];
	let words = [];
	if (spans.length > 0) {
		let position = spans[0].offsetTop;
		[...spans].forEach((span, index) => {
			if (span.offsetTop === position) {
				words.push(span);
			}
			if (span.offsetTop !== position) {
				lines.push(words);
				words = [];
				words.push(span);
				position = span.offsetTop;
			}
			if (index === spans.length - 1) {
				lines.push(words);
			}
		});
	}
	return lines;
}
