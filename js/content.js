// Function to suggest an alternative site based on the current URL
function suggestAlternative(url) {
    chrome.runtime.sendMessage({ action: "checkAlternative", url: url }, (response) => {
        if (response.alternative) {
            alert(`Consider using ${response.alternative} as an alternative to ${url}`);
        }
    });
}

// Event listener for the load event
window.addEventListener('load', () => {
    suggestAlternative(window.location.hostname);
});