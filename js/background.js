// Initialize countryMappings
let countryMappings = {};

// Fetch country mappings from the JSON file
fetch(chrome.runtime.getURL('countryMappings.json'))
    .then(response => response.json())
    .then(data => {
        countryMappings = data;
        console.log("Loaded mappings:", countryMappings);
    })
    .catch(error => {
        console.error("Error loading mappings:", error);
    });

// Listener for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkAlternative") {
        const hostname = request.url;
        console.log("Checking alternative for:", hostname);
        console.log("Current mappings:", countryMappings);

        chrome.storage.local.get("selectedCountry", (data) => {
            const userCountry = data.selectedCountry || null;
            console.log("User country:", userCountry);

            let alternative = null;

            // Check if the site exists in our mappings
            if (countryMappings[hostname]) {
                const mapping = countryMappings[hostname];

                // If it's a string, it's a direct mapping
                if (typeof mapping === "string") {
                    alternative = mapping;
                }
                // If it's an object, it has country-specific mappings
                else if (typeof mapping === "object" && userCountry && mapping[userCountry]) {
                    alternative = mapping[userCountry];
                }
            }

            console.log("Found alternative:", alternative);
            sendResponse({ alternative });
        });

        // Return true to indicate we'll respond asynchronously
        return true;
    }
});