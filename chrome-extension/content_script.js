if (!window.alreadyExecuted) window.addEventListener('click', evt => {
	let target = evt.composedPath()[0];
	while (target && target.tagName.toLowerCase() !== 'a' && target.tagName.toLowerCase() !== 'area') {
		target = target.parentElement;
	}
	if (target) {
		const url = target instanceof SVGAElement ? target.href.baseVal : target.href;
		if (url.startsWith('file://')) {
			evt.preventDefault();
			try {
				chrome.runtime.sendMessage({
					method: 'openLocalFile',
					localFileUrl: url,
				});
			} catch (e) {}
		}
	}
}, {
	capture: true,
});

window.alreadyExecuted = true;
