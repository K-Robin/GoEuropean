function suggestAlternative(url) {
    chrome.runtime.sendMessage({ action: "checkAlternative", url: url }, (response) => {
        if (response.alternative) {
            alert(`Consider using ${response.alternative} as an alternative to ${url}`);
        }
    });
}

window.addEventListener('load', () => {
    suggestAlternative(window.location.hostname);
});