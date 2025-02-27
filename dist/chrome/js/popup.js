// popup.js

let countryMappings = {};
let availableCountries = [];
let currentHostname = '';
let whitelistedSites = [];

// Function to resolve domain reference and get actual site data
function resolveSiteData(hostname) {
    // Check if the hostname exists in our mappings
    if (!countryMappings[hostname]) {
        return null;
    }

    // If this hostname refers to another one, get the referenced data
    if (countryMappings[hostname].ref) {
        const referredHostname = countryMappings[hostname].ref;
        console.log(`${hostname} refers to ${referredHostname}`);
        return countryMappings[referredHostname];
    }

    // Otherwise return the direct mapping
    return countryMappings[hostname];
}

// Load the mappings and populate available countries
document.addEventListener("DOMContentLoaded", () => {
    // Fetch country mappings from the JSON file
    fetch(chrome.runtime.getURL('countryMappings.json'))
        .then(response => response.json())
        .then(data => {
            countryMappings = data;
            console.log("Loaded mappings in popup:", countryMappings);

            // Extract available countries from the mappings
            for (const site in countryMappings) {
                // Skip references
                if (countryMappings[site].ref) continue;

                const siteData = countryMappings[site];
                if (siteData.countrySpecific) {
                    Object.keys(siteData.countrySpecific).forEach(country => {
                        if (!availableCountries.includes(country)) {
                            availableCountries.push(country);
                        }
                    });
                }
            }

            availableCountries.sort(); // Sort countries alphabetically
            console.log("Available countries:", availableCountries);

            // Load whitelisted sites
            chrome.storage.local.get("whitelistedSites", (data) => {
                whitelistedSites = data.whitelistedSites || [];
                console.log("Loaded whitelisted sites:", whitelistedSites);

                // Now set up the UI
                setupUI();
            });
        })
        .catch(error => {
            console.error("Error loading mappings:", error);
            const messageEl = document.getElementById("message");
            messageEl.textContent = "Error loading alternative sites data.";
        });
});

function setupUI() {
    // Get the current active tab URL
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                currentHostname = url.hostname;

                // Update current site display
                document.getElementById("current-site").textContent = currentHostname;

                // Check if site is whitelisted and update button status
                updateWhitelistButton();

                // Get the selected country from local storage
                chrome.storage.local.get("selectedCountry", (data) => {
                    const userCountry = data.selectedCountry || null;
                    updateSelectedCountryUI(userCountry);

                    // Check for an alternative
                    console.log("Checking alternative for:", currentHostname);
                    let alternatives = [];

                    // Get the site data, resolving references if needed
                    const siteData = resolveSiteData(currentHostname);

                    // Check if site exists in our mappings and is not whitelisted
                    if(siteData && !isWhitelisted(currentHostname)) {
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

                        alternatives = alternatives.filter((alt, index, self) =>
                            index === self.findIndex(a => a.url === alt.url)
                        );
                    }

                    displayAlternatives(alternatives);
                });
            } catch (e) {
                console.error("Error parsing URL:", e);
                document.getElementById("current-site").textContent = "Invalid URL";
                document.getElementById("message").textContent = "Please visit a valid website.";
            }
        } else {
            document.getElementById("current-site").textContent = "No active tab";
            document.getElementById("message").textContent = "Please visit a website to see alternatives.";
        }
    });

    // Set up event listeners for country input
    const countryInput = document.getElementById("country-input");
    const autocompleteList = document.getElementById("autocomplete-list");
    const removeBtn = document.getElementById("remove-btn");

    countryInput.addEventListener("input", function () {
        const input = this.value.toLowerCase();
        const filteredCountries = availableCountries.filter(country =>
            country.toLowerCase().includes(input)
        );
        showAutoComplete(filteredCountries);
    });

    countryInput.addEventListener("focus", function() {
        // Show all countries when the input is focused
        showAutoComplete(availableCountries);
    });

    // Close autocomplete when clicking outside
    document.addEventListener("click", function(e) {
        if (e.target !== countryInput && e.target !== autocompleteList) {
            autocompleteList.innerHTML = "";
        }
    });

    removeBtn.addEventListener("click", function () {
        chrome.storage.local.remove("selectedCountry", () => {
            updateSelectedCountryUI(null);
        });
    });

    // Set up whitelist button
    const whitelistBtn = document.getElementById("whitelist-btn");
    whitelistBtn.addEventListener("click", toggleWhitelist);

    function showAutoComplete(countries) {
        // Clear the autocomplete list first
        while (autocompleteList.firstChild) {
            autocompleteList.removeChild(autocompleteList.firstChild);
        }

        countries.forEach(country => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.textContent = country;
            item.addEventListener("click", function () {
                chrome.storage.local.set({selectedCountry: country}, () => {
                    updateSelectedCountryUI(country);
                });
            });
            autocompleteList.appendChild(item);
        });
    }
}

function displayAlternatives(alternatives) {
    const messageElement = document.getElementById("message");

    // Clear the message element first
    while (messageElement.firstChild) {
        messageElement.removeChild(messageElement.firstChild);
    }

    if (alternatives.length === 0) {
        if (isWhitelisted(currentHostname)) {
            messageElement.textContent = "This site is whitelisted. No alternatives will be shown.";
        } else {
            messageElement.textContent = "No alternatives found for this site.";
        }
        return;
    }

    // Create alternatives container
    const container = document.createElement('div');
    container.className = 'alternatives-list';

    // Create header
    const header = document.createElement('h3');
    header.textContent = 'European Alternatives:';
    container.appendChild(header);

    // Create list
    const list = document.createElement('ul');

    alternatives.forEach(alt => {
        const listItem = document.createElement('li');

        const link = document.createElement('a');
        link.href = `https://${alt.url}`;
        link.target = '_blank';
        link.textContent = alt.name;

        const urlSpan = document.createElement('span');
        urlSpan.className = 'alt-url';
        urlSpan.textContent = ` (${alt.url})`;

        const originText = document.createTextNode(` - ${alt.origin}`);

        listItem.appendChild(link);
        listItem.appendChild(urlSpan);
        listItem.appendChild(originText);
        list.appendChild(listItem);
    });

    container.appendChild(list);
    messageElement.appendChild(container);
}

function updateSelectedCountryUI(country) {
    const countryInput = document.getElementById("country-input");
    const removeBtn = document.getElementById("remove-btn");
    const autocompleteList = document.getElementById("autocomplete-list");

    if (country) {
        countryInput.value = country;
        countryInput.disabled = true;
        removeBtn.style.display = "inline";
    } else {
        countryInput.value = "";
        countryInput.disabled = false;
        removeBtn.style.display = "none";
    }

    // Clear the autocomplete list
    while (autocompleteList.firstChild) {
        autocompleteList.removeChild(autocompleteList.firstChild);
    }
}

// Whitelist functionality
function isWhitelisted(hostname) {
    return whitelistedSites.includes(hostname);
}

function toggleWhitelist() {
    if (isWhitelisted(currentHostname)) {
        // Remove from whitelist
        whitelistedSites = whitelistedSites.filter(site => site !== currentHostname);
    } else {
        // Add to whitelist
        whitelistedSites.push(currentHostname);
    }

    // Save updated whitelist to storage
    chrome.storage.local.set({whitelistedSites: whitelistedSites}, () => {
        console.log("Updated whitelisted sites:", whitelistedSites);
        updateWhitelistButton();

        // If we whitelisted, refresh the alternatives display
        chrome.storage.local.get("selectedCountry", (data) => {
            const userCountry = data.selectedCountry || null;
            let alternatives = [];

            // Get the site data, resolving references if needed
            const siteData = resolveSiteData(currentHostname);

            if (siteData && !isWhitelisted(currentHostname)) {
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

                alternatives = alternatives.filter((alt, index, self) =>
                    index === self.findIndex(a => a.url === alt.url)
                );
            }

            displayAlternatives(alternatives);
        });
    });
}

function updateWhitelistButton() {
    const whitelistBtn = document.getElementById("whitelist-btn");
    const currentSiteElement = document.getElementById("current-site");

    if (isWhitelisted(currentHostname)) {
        whitelistBtn.textContent = "Remove from Whitelist";
        whitelistBtn.classList.add("remove-whitelist");

        // Add whitelisted badge
        if (!currentSiteElement.querySelector(".whitelisted-badge")) {
            const badge = document.createElement("span");
            badge.className = "whitelisted-badge";
            badge.textContent = "Whitelisted";
            currentSiteElement.appendChild(badge);
        }
    } else {
        whitelistBtn.textContent = "Whitelist";
        whitelistBtn.classList.remove("remove-whitelist");

        // Remove whitelisted badge if exists
        const badge = currentSiteElement.querySelector(".whitelisted-badge");
        if (badge) {
            currentSiteElement.removeChild(badge);
        }
    }
}