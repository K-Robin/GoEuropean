const fs = require('fs');
const path = require('path');

// Create dist directories if they don't exist
const chromeOutputDir = path.join(__dirname, 'dist/chrome');
const firefoxOutputDir = path.join(__dirname, 'dist/firefox');

fs.mkdirSync(chromeOutputDir, { recursive: true });
fs.mkdirSync(firefoxOutputDir, { recursive: true });

// Copy Chrome manifest
const chromeManifestPath = path.join(__dirname, 'src/manifest-chrome.json');
const chromeManifest = JSON.parse(fs.readFileSync(chromeManifestPath, 'utf8'));
fs.writeFileSync(
    path.join(chromeOutputDir, 'manifest.json'),
    JSON.stringify(chromeManifest, null, 2)
);

// Copy Firefox manifest
const firefoxManifestPath = path.join(__dirname, 'src/manifest-firefox.json');
const firefoxManifest = JSON.parse(fs.readFileSync(firefoxManifestPath, 'utf8'));
fs.writeFileSync(
    path.join(firefoxOutputDir, 'manifest.json'),
    JSON.stringify(firefoxManifest, null, 2)
);

// Define directories to copy
const directories = [
    { from: 'js', to: 'js' },
    { from: 'html', to: 'html' },
    { from: 'css', to: 'css' },
    { from: 'img', to: 'img' }
];

// Copy all directories
directories.forEach(dir => {
    const srcDir = path.join(__dirname, 'src', dir.from);
    const chromeDest = path.join(chromeOutputDir, dir.to);
    const firefoxDest = path.join(firefoxOutputDir, dir.to);

    // Create destination directories
    fs.mkdirSync(chromeDest, { recursive: true });
    fs.mkdirSync(firefoxDest, { recursive: true });

    // Copy files
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        const srcFile = path.join(srcDir, file);
        const chromeDestFile = path.join(chromeDest, file);
        const firefoxDestFile = path.join(firefoxDest, file);

        // Skip if not a file
        if (!fs.statSync(srcFile).isFile()) return;

        // Copy to both destinations
        fs.copyFileSync(srcFile, chromeDestFile);
        fs.copyFileSync(srcFile, firefoxDestFile);
    });
});

// Copy countryMappings.json
const mappingsFile = path.join(__dirname, 'src/countryMappings.json');
fs.copyFileSync(mappingsFile, path.join(chromeOutputDir, 'countryMappings.json'));
fs.copyFileSync(mappingsFile, path.join(firefoxOutputDir, 'countryMappings.json'));

console.log('Build completed successfully!');
console.log('Chrome extension is in dist/chrome');
console.log('Firefox extension is in dist/firefox');