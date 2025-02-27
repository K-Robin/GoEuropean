// background.js

// Use either browser (Firefox) or chrome API
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Initialize countryMappings
let countryMappings = {};

// Fetch country mappings from the JSON file
fetch(browserAPI.runtime.getURL('countryMappings.json'))
    .then(response => response.json())
    .then(data => {
        countryMappings = data;
        console.log("Loaded mappings:", countryMappings);
    })
    .catch(error => {
        console.error("Error loading mappings:", error);
    });

// Listener for messages from other parts of the extension
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAlternative") {
        checkAlternative(request.url, sendResponse)
        return true
    }
});

function checkAlternative(hostname, sendResponse) {
    console.log("Checking alternative for:", hostname);

    // Get user country and check alternatives
    browserAPI.storage.local.get("selectedCountry", (data) => {
        const userCountry = data.selectedCountry || null;
        console.log("User country:", userCountry);

        let alternatives = [];

        // Check if site exists in our mappings
        if(countryMappings[hostname]) {
            const siteData = countryMappings[hostname];
            console.log("Found site data:", siteData);

            // Is it is a reference to another url, redo it with that hostname
            if (siteData['ref']) {
                console.log(`Referring check to ${siteData['ref']}`)
                checkAlternative(siteData['ref'], sendResponse)
                return true
            }

            if (userCountry && siteData.countrySpecific) {
                const countrySpecificData = siteData.countrySpecific[userCountry];

                if (Array.isArray(countrySpecificData)) {
                    alternatives = [...alternatives, ...countrySpecificData];
                } else if (countrySpecificData) {
                    alternatives = [...alternatives, countrySpecificData];
                }
            }

            if (siteData.alternatives) {
                alternatives = [...alternatives, ...siteData.alternatives];
            }

            // Remove duplicates
            alternatives = alternatives.filter((alt, index, self) =>
                index === self.findIndex(a => a.url === alt.url)
            );
        }

        console.log("Found alternatives:", alternatives);
        sendResponse({alternatives});
    });

    // Return true to indicate we'll respond asynchronously
    return true;
}