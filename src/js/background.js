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

// Helper function to find matching domain pattern
function findMatchingDomainPattern(hostname) {
    // Direct match first
    if(countryMappings[hostname]){
        return hostname;
    }

    const wildcardPatterns = Object.keys(countryMappings).filter(pattern => pattern.includes("*"));

    for (const pattern of wildcardPatterns) {
        const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);

        if (regex.test(hostname)) {
            return pattern;
        }
    }

    return null;
}
// Listener for messages from other parts of the extension
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAlternative") {
        const hostname = request.url;
        console.log("Checking alternative for:", hostname);

        // Get user country and check alternatives
        browserAPI.storage.local.get("selectedCountry", (data) => {
            const userCountry = data.selectedCountry || null;
            console.log("User country:", userCountry);

            let alternatives = [];

            // Find matching domain pattern
            const matchingPattern = findMatchingDomainPattern(hostname);

            // Check if site exists in our mappings
            if (matchingPattern) {
                const siteData = countryMappings[matchingPattern];
                console.log(`Found site data for pattern ${matchingPattern}:`, siteData);

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
});