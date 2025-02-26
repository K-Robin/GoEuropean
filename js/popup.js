// popup.js


import {getAlternatives} from "./utils";

let countryMappings = {};
let availableCountries = [];

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
                const alternatives = countryMappings[site];
                if (typeof alternatives === 'object') {
                    Object.keys(alternatives).forEach(country => {
                        if (!availableCountries.includes(country)) {
                            availableCountries.push(country);
                        }
                    });
                }
            }

            console.log("Available countries:", availableCountries);

            // Now set up the UI
            setupUI();
        })
        .catch(error => {
            console.error("Error loading mappings:", error);
            document.getElementById("message").textContent = "Error loading alternative sites data.";
        });
});

function setupUI() {
    // Get the current active tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            const url = new URL(tabs[0].url);
            const hostname = url.hostname;

            // Get the selected country from local storage
            chrome.storage.local.get("selectedCountry", (data) => {
                const userCountry = data.selectedCountry || null;
                updateSelectedCountryUI(userCountry);

                // Check for an alternative
                console.log("Checking alternative for:", hostname);

                let alternative = getAlternatives(hostname, userCountry,  countryMappings);

                const messageElement = document.getElementById("message");
                messageElement.textContent = alternative
                    ? `Consider using ${alternative} as an alternative.`
                    : "No alternative found for this site.";
            });
        }
    });

    const countryInput = document.getElementById("country-input");
    const autocompleteList = document.getElementById("autocomplete-list");
    const removeBtn = document.getElementById("remove-btn");

    // Set up event listeners
    countryInput.addEventListener("input", function() {
        const input = this.value.toLowerCase();
        const filteredCountries = availableCountries.filter(country =>
            country.toLowerCase().includes(input)
        );
        showAutoComplete(filteredCountries);
    });

    removeBtn.addEventListener("click", function() {
        chrome.storage.local.remove("selectedCountry", () => {
            updateSelectedCountryUI(null);
        });
    });

    function showAutoComplete(countries) {
        autocompleteList.innerHTML = "";

        countries.forEach(country => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.textContent = country;
            item.addEventListener("click", function() {
                chrome.storage.local.set({ selectedCountry: country }, () => {
                    updateSelectedCountryUI(country);
                });
            });
            autocompleteList.appendChild(item);
        });
    }
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

    autocompleteList.innerHTML = "";
}