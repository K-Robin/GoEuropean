function getAlternatives (hostname, userCountry, countryMappings) {
    let alternative = null;

    if (countryMappings[hostname]) {
        const mapping = countryMappings[hostname];
        if (typeof mapping === "string") {
            alternative = mapping;
        } else if (typeof mapping === "object" && userCountry && mapping[userCountry]) {
            alternative = mapping[userCountry];
        }
    }

    return alternative;
}

export { getAlternatives };