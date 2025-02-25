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

            // Check shared mappings first
            const sharedMappings = countryMappings.shared || {};
            for (const [nonEuSite, alternatives] of Object.entries(sharedMappings)) {
                if (request.url.includes(nonEuSite)) {
                    alternative = typeof alternatives === 'object' ? alternatives[userCountry] : alternatives;
                    if (alternative) break;
                }
            }

            // Check country-specific mappings if no alternative found
            if (!alternative && userCountry) {
                const countrySpecificMappings = countryMappings[userCountry] || {};
                for (const [nonEuSite, euAlternative] of Object.entries(countrySpecificMappings)) {
                    if (request.url.includes(nonEuSite)) {
                        alternative = euAlternative;
                        break;
                    }
                }
            }

            sendResponse({ alternative });
        });

        return true;
    }
});
