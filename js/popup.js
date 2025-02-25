// Initialize country mappings and available countries
let countryMappings = {};
let availableCountries = [];

// Fetch country mappings from the JSON file
fetch(chrome.runtime.getURL('countryMappings.json'))
    .then(response => response.json())
    .then(data => {
        countryMappings = data;
        availableCountries = Object.keys(data).reduce((countries, site) => {
            const alternatives = data[site];
            if (typeof alternatives === 'object') {
                countries.push(...Object.keys(alternatives));
            }
            return countries;
        }, []);
        availableCountries = [...new Set(availableCountries)];
    });

// Function to update the UI for the selected country
function updateSelectedCountryUI(country) {
    const countryInput = document.getElementById("country-input");
    const removeBtn = document.getElementById("remove-btn");
    const autocompleteList = document.getElementById("autocomplete-list");

    if (country) {
        countryInput.value = country;
        countryInput.disabled = true;
        removeBtn.style.display = "inline";
        removeBtn.addEventListener("click", () => {
            chrome.storage.local.remove("selectedCountry", () => {
                countryInput.value = "";
                countryInput.disabled = false;
                removeBtn.style.display = "none";
            });
        });
    } else {
        countryInput.value = "";
        countryInput.disabled = false;
        removeBtn.style.display = "none";
    }

    autocompleteList.innerHTML = "";
}

// Load stored country from local storage, and update the UI
chrome.storage.local.get("selectedCountry", (data) => {
    if (data.selectedCountry) {
        updateSelectedCountryUI(data.selectedCountry);
    }
});

// Event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
    // Get the current active tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0].url;

        // Get the selected country from local storage
        chrome.storage.local.get("selectedCountry", (data) => {
            const userCountry = data.selectedCountry || null;

            // Send a message to the background script to check for an alternative
            chrome.runtime.sendMessage({ action: "checkAlternative", url: new URL(url).hostname, country: userCountry }, (response) => {
                const messageElement = document.getElementById("message");
                messageElement.textContent = response.alternative
                    ? `Consider using ${response.alternative} as an alternative.`
                    : "No alternative found for this site.";
            });
        });
    });

    const countryInput = document.getElementById("country-input");
    const autocompleteList = document.getElementById("autocomplete-list");

    // Event listener for input in the country input field
    countryInput.addEventListener("input", function () {
        const input = this.value.toLowerCase();
        const filteredCountries = availableCountries.filter(country =>
            country.toLowerCase().includes(input)
        );
        showAutoComplete(filteredCountries);
    });

    // Function to show autocomplete suggestions based on the input
    function showAutoComplete(countries) {
        autocompleteList.innerHTML = "";
        if (countries.length === 0) return;

        countries.forEach(country => {
            const item = document.createElement("div");
            item.innerHTML = country;
            item.addEventListener("click", function () {
                chrome.storage.local.set({ selectedCountry: country }, () => {
                    updateSelectedCountryUI(country);
                });
            });
            autocompleteList.appendChild(item);
        });
    }
});
