let messageFromBackground = {
    getUrlsList: "GET_URL_LIST"
}

let urlsList = [];

chrome.runtime.onMessage.addListener((request) => {
    if (request.type == 'GET_URLS_FROM_ALL_TABS') {
        urlsList = sendUrlsListFromCurrentWindow();
    } else if (request.type == 'OPEN_TABS_FROM_CARD') {
        openTabsInNewWindow(request.urlsList);
    }
});

function sendUrlsListFromCurrentWindow() {
    let urls = []
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        urls = sendMessage(tabs);
    });
    return urls;
}

function sendMessage(list) {
    chrome.extension.sendMessage({ type: messageFromBackground.getUrlsList, urls: list });
}

function sendEmptyUrlsList(list) {
    chrome.extension.sendMessage({ type: messageFromBackground.clearUrlList, urls: list });
}

function openTabsInNewWindow(urlsList) {
    chrome.windows.create(() => {
        chrome.windows.getCurrent(() => {
            urlsList.forEach((url) => {
                chrome.tabs.create({ url: url.url });
            })
        })
    })
}
