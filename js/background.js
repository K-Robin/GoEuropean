// Initialize countryMappings
import {getAlternatives} from "./utils";

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

            let alternative = getAlternatives(hostname, userCountry, countryMappings);

            console.log("Found alternative:", alternative);
            sendResponse({ alternative });
        });

        // Return true to indicate we'll respond asynchronously
        return true;
    }
});