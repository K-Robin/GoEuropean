let countryMappings = {};

fetch(browser.runtime.getURL('countryMappings.json'))
    .then(response => response.json())
    .then(data => {
        countryMappings = data;
    });

function getUserCountry() {
    // TODO = Implement a function to get the user's country
    return "Netherlands"; // Example
}

browser.runtime.onMessage.addEventListener((request, sender, sendResponse) => {
    if (request.action === "checkAlternative") {
        const userCountry = getUserCountry();
        let alternative = null;

        const sharedMappings = countryMappings.shared;
        for (const [nonEuSite, alternatives] of Object.entries(sharedMappings)) {
            if (request.url.includes(nonEuSite)) {
                alternative = typeof alternatives === 'object' ? alternatives[userCountry] : alternatives;
                if (alternative) break;
            }
        }

        if (!alternative) {
            const countrySpecificMappings = countryMappings[userCountry];
            for (const [nonEuSite, euAlternative] of Object.entries(countrySpecificMappings)) {
                if (request.url.includes(nonEuSite)) {
                    alternative = euAlternative;
                    break;
                }
            }
        }

        sendResponse({ alternative: alternative });
    }
    return true;
});