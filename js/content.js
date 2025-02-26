// content.js
console.log("Go European content script loaded");

// Function to suggest an alternative site based on the current URL
function suggestAlternative() {
    const hostname = window.location.hostname;
    console.log("Current hostname:", hostname);

    chrome.runtime.sendMessage({
        action: "checkAlternative",
        url: hostname
    }, (response) => {
        console.log("Response from background:", response);
        if (response && response.alternatives && response.alternatives.length > 0) {
            // Create a styled notification
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.top = '10%';
            notification.style.left = '50%';
            notification.style.transform = 'translate(-50%, -50%)';
            notification.style.backgroundColor = '#4285f4';
            notification.style.color = 'white';
            notification.style.padding = '15px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '10000';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            notification.style.fontFamily = 'Arial, sans-serif';
            notification.style.maxWidth = '400px';

            let alternativesHtml = response.alternatives.map(alt =>
                `<li><a href="https://${alt.url}" style="color: white; font-weight: bold;">${alt.name}</a> (${alt.url}) - ${alt.origin}</li>`
            ).join('');

            notification.innerHTML = `
                <p>Consider using these European alternatives:</p>
                <ul style="padding-left: 20px;">${alternativesHtml}</ul>
                <button style="background: white; color: #4285f4; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 10px;">Close</button>
            `;

            document.body.appendChild(notification);

            // Add click event to close button
            notification.querySelector('button').addEventListener('click', function () {
                document.body.removeChild(notification);
            });

            // Auto-remove after 15 seconds
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 15000);
        }
    });
}

// Wait for the page to load fully before checking
window.addEventListener('load', () => {
    // Small delay to ensure everything is ready
    setTimeout(suggestAlternative, 1000);
});