const fs = require('fs');
const path = require('path');

// Directory containing individual site JSON files
const sitesDir = path.join(__dirname, 'sites');
// Output file path
const outputFile = path.join(__dirname, 'src/countryMappings.json');

// Read all files in the sites directory
fs.readdir(sitesDir, (err, files) => {
    if (err) {
        console.error('Error reading sites directory:', err);
        return;
    }

    // Filter for JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Object to store all mappings
    const allMappings = {};

    // Process each JSON file
    jsonFiles.forEach(file => {
        try {
            const filePath = path.join(sitesDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const siteData = JSON.parse(fileContent);

            // Merge site data into allMappings
            Object.assign(allMappings, siteData);

            console.log(`Processed ${file}`);
        } catch (error) {
            console.error(`Error processing ${file}:`, error);
        }
    });

    // Write the combined data to the output file
    fs.writeFileSync(outputFile, JSON.stringify(allMappings, null, 2), 'utf8');
    console.log(`Combined mappings written to ${outputFile}`);
});