// Initialize countryMappings
let countryMappings = {};

// Fetch country mappings from the JSON file
fetch(chrome.runtime.getURL('countryMappings.json'))
    .then(response => response.json())
    .then(data => {
        countryMappings = data;
    });

// Function to get the selected country from local storage
function getUserCountry(callback) {
    chrome.storage.local.get("selectedCountry", (data) => {
        callback(data.selectedCountry || null);
    });
}

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAlternative") {
        getUserCountry((userCountry) => {
            if (!countryMappings || Object.keys(countryMappings).length === 0) {
                sendResponse({ alternative: null });
                return;
            }

            let alternative = null;

            const sharedMappings = countryMappings["alternative"] || {};
            for (const [nonEuSite, euAlternative] of Object.entries(sharedMappings)) {
                if (request.url.includes(nonEuSite)) {
                    if (typeof euAlternative === "string") {
                        alternative = euAlternative;
                    } else if (userCountry && euAlternative[userCountry]) {
                        alternative = euAlternative[userCountry];
                    }
                    break;
                }
            }
            sendResponse({ alternative });
        });

        return true;
    }
});
