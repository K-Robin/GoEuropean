document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;
        chrome.runtime.sendMessage({ action: "checkAlternative", url: new URL(url).hostname }, (response) => {
            const messageElement = document.getElementById('message');
            if (response.alternative) {
                messageElement.textContent = `Consider using ${response.alternative} as an alternative.`;
            } else {
                messageElement.textContent = 'No alternative found for this site.';
            }
        });
    });
});
