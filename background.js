let countryMappings = {};

fetch(chrome.runtime.getURL('countryMappings.json'))
    .then(response => response.json())
    .then(data => {
        countryMappings = data;
    });

function getUserCountry() {
    // TODO = Implement a function to get the user's country
    return "Netherlands"; // Example
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAlternative") {
        const userCountry = getUserCountry();
        let alternative = null;

        // Check shared mappings
        const sharedMappings = countryMappings.shared;
        for (const [nonEuSite, alternatives] of Object.entries(sharedMappings)) {
            if (request.url.includes(nonEuSite)) {
                alternative = typeof alternatives === 'object' ? alternatives[userCountry] : alternatives;
                if (alternative) break;
            }
        }

        // Check country-specific mappings if no alternative found in shared
        if (!alternative) {
            const countrySpecificMappings = countryMappings[userCountry];
            if (countrySpecificMappings) {
                for (const [nonEuSite, euAlternative] of Object.entries(countrySpecificMappings)) {
                    if (request.url.includes(nonEuSite)) {
                        alternative = euAlternative;
                        break;
                    }
                }
            }
        }

        sendResponse({ alternative: alternative });
    }
    return true;
});
