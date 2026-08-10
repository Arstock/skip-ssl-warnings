'use strict';

chrome.runtime.onInstalled.addListener(() => {
	addClickEventListenerToExistingTab();
});

const addClickEventListenerToExistingTab = () => {
	chrome.tabs.query({
		url: '*://*/*', // only http:// or https:// page
	}, tabs => {
		tabs.forEach(tab => {
			chrome.scripting.executeScript({
				files: [
					'content_script.js',
				],
				target: {
					tabId: tab.id,
					allFrames: true,
				},
			}, result => {
				if (typeof result === 'undefined') {
					const message = chrome.i18n.getMessage('page_not_loaded');
					console.info(message, tab);
				}
			});
		});
	});
};

chrome.extension.isAllowedFileSchemeAccess().then(isAllowed => {
	const key = 'isAllowedFileSchemeAccess.prev';
	chrome.storage.local.get(key, result => {
		const prevValue = result[key];
		if (typeof prevValue === 'boolean') {
			if (prevValue !== isAllowed) {
				addClickEventListenerToExistingTab();
			}
		}
		chrome.storage.local.set({
			[key]: isAllowed,
		});
	});
});

chrome.runtime.onMessage.addListener((message, sender) => {
	if (message.method === 'openLocalFile') {
		const localFileUrl = message.localFileUrl;
		const tab = sender.tab;
		openTab(localFileUrl, tab, createdTab => {
			if (!createdTab) { // If the tab doesn't open
				openTab(chrome.runtime.getURL('/options/index.html#need-file-scheme-access'), tab);
			}
		});
	}
});


const openTab = (url, baseTab, callback = () => {}) => {
	chrome.tabs.create({
		url,
		index: baseTab.index + 1,
	}, callback);
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.startsWith('chrome-error://')) {
       chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const continueButton = document.querySelector('#proceed-link') || 
                                       document.querySelector('.error-proceed-button');
                if (continueButton) {
                    continueButton.click();
                }
            }
        });
    }
});
