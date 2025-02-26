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

            let alternatives = [];

            // Check if site exists in our mappings
            if(countryMappings[hostname]) {
                const siteData = countryMappings[hostname];
                console.log("Found site data:", siteData);

                if (userCountry && siteData.countrySpecific && siteData.countrySpecific[userCountry]) {
                    alternatives = [
                        ...alternatives,
                        siteData.countrySpecific[userCountry]
                    ];
                }

                if (siteData.alternatives) {
                    alternatives = [...alternatives, ...siteData.alternatives];
                }


                alternatives = alternatives.filter((alt, index, self) =>
                    index === self.findIndex(a => a.url === alt.url)
                );
            }

            console.log("Found alternative:", alternatives);
            sendResponse({alternatives});
        });

        // Return true to indicate we'll respond asynchronously
        return true;
    }
});