// content.js
console.log("Go European content script loaded");

// Function to suggest an alternative site based on the current URL
function suggestAlternative() {
    const hostname = window.location.hostname;
    console.log("Current hostname:", hostname);

    // First check if the site is whitelisted
    chrome.storage.local.get("whitelistedSites", (data) => {
        const whitelistedSites = data.whitelistedSites || [];

        // If site is whitelisted, don't show alternatives
        if (whitelistedSites.includes(hostname)) {
            console.log("Site is whitelisted, not showing alternatives");
            return;
        }

        // Continue with checking alternatives
        chrome.runtime.sendMessage({
            action: "checkAlternative",
            url: hostname
        }, (response) => {
            console.log("Response from background:", response);
            if (response && response.alternatives && response.alternatives.length > 0) {
                // Add styles to the page
                const styleElement = document.createElement('style');
                styleElement.textContent = `
                    @keyframes goEuropeSlideIn {
                        from { opacity: 0; transform: translate(-50%, -70%); }
                        to { opacity: 1; transform: translate(-50%, -50%); }
                    }
                    
                    @keyframes goEuropeButtonHover {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-2px); }
                        100% { transform: translateY(0); }
                    }
                    
                    .notification-notification {
                        position: fixed;
                        top: 10%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        color: #333333;
                        padding: 20px;
                        border-radius: 12px;
                        z-index: 2147483647; /* Maximum z-index value */
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        max-width: 440px;
                        width: 90%;
                        animation: goEuropeSlideIn 0.3s ease-out;
                        border-top: 4px solid #4285f4;
                    }
                    
                    .notification-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 12px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid #f0f0f0;
                    }
                    
                    .notification-title {
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                        color: #4285f4;
                        display: flex;
                        align-items: center;
                    }
                    
                    .notification-title:before {
                        content: '';
                        display: inline-block;
                        width: 18px;
                        height: 18px;
                        background-color: #4285f4;
                        margin-right: 8px;
                        border-radius: 50%;
                        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>');
                        background-repeat: no-repeat;
                        background-position: center;
                        background-size: 14px;
                    }
                    
                    .notification-close {
                        background: none;
                        border: none;
                        color: #9e9e9e;
                        cursor: pointer;
                        font-size: 20px;
                        padding: 0;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all 0.2s;
                    }
                    
                    .notification-close:hover {
                        background-color: #f5f5f5;
                        color: #757575;
                    }
                    
                    .notification-text {
                        margin-top: 0;
                        margin-bottom: 12px;
                        font-size: 14px;
                        line-height: 1.4;
                    }
                    
                    .notification-list {
                        padding-left: 15px;
                        margin: 10px 0;
                        max-height: 200px;
                        overflow-y: auto;
                        list-style-type: disc;
                    }
                    
                    .notification-list-item {
                        margin-bottom: 10px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #f5f5f5;
                        font-size: 14px;
                    }
                    
                    .notification-list-item:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                    
                    .notification-site-link {
                        color: #4285f4;
                        font-weight: 500;
                        text-decoration: none;
                        transition: color 0.2s;
                    }
                    
                    .notification-site-link:hover {
                        color: #3367d6;
                        text-decoration: underline;
                    }
                    
                    .notification-site-url {
                        font-size: 12px;
                        color: #9e9e9e;
                        margin-left: 4px;
                    }
                    
                    .notification-site-origin {
                        display: block;
                        font-size: 12px;
                        color: #757575;
                        margin-top: 3px;
                    }
                    
                    .notification-footer {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 14px;
                        padding-top: 12px;
                        border-top: 1px solid #f0f0f0;
                    }
                    
                    .notification-whitelist-btn {
                        background: #f5f5f5;
                        color: #757575;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                    }
                    
                    .notification-whitelist-btn:hover {
                        background: #e0e0e0;
                        color: #616161;
                    }
                    
                    .notification-dismiss-btn {
                        background: #4285f4;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-weight: 500;
                        font-size: 13px;
                        transition: all 0.2s;
                    }
                    
                    .notification-dismiss-btn:hover {
                        background: #3367d6;
                        animation: goEuropeButtonHover 0.5s ease;
                    }
                    
                    .notification-notification {
                    top: 9%;
                    transform: translate(-50%, -20%);
                    }
                   
                `;
                document.head.appendChild(styleElement);

                // Create notification with our custom classes
                const notification = document.createElement('div');
                notification.className = 'notification-notification';
                notification.id = 'go-european-notification';

                // Remove any existing notification first
                const existingNotification = document.getElementById('go-european-notification');
                if (existingNotification) {
                    document.body.removeChild(existingNotification);
                }

                // Generate alternatives HTML - limiting to maximum 4 for UI stability
                const displayedAlternatives = response.alternatives.slice(0, 4);

                // Create header
                const headerDiv = document.createElement('div');
                headerDiv.className = 'notification-header';

                const titleH3 = document.createElement('h3');
                titleH3.className = 'notification-title';
                titleH3.textContent = 'Go European';

                const closeButton = document.createElement('button');
                closeButton.className = 'notification-close';
                closeButton.id = 'notification-close';
                closeButton.textContent = '×';

                headerDiv.appendChild(titleH3);
                headerDiv.appendChild(closeButton);
                notification.appendChild(headerDiv);

                // Create text paragraph
                const textP = document.createElement('p');
                textP.className = 'notification-text';
                textP.textContent = 'Consider using these European alternatives:';
                notification.appendChild(textP);

                // Create alternatives list
                const altList = document.createElement('ul');
                altList.className = 'notification-list';

                displayedAlternatives.forEach(alt => {
                    const listItem = document.createElement('li');
                    listItem.className = 'notification-list-item';

                    const link = document.createElement('a');
                    link.className = 'notification-site-link';
                    link.href = `https://${alt.url}`;
                    link.target = '_blank';
                    link.textContent = alt.name;

                    const urlSpan = document.createElement('span');
                    urlSpan.className = 'notification-site-url';
                    urlSpan.textContent = `(${alt.url})`;

                    const originSpan = document.createElement('span');
                    originSpan.className = 'notification-site-origin';
                    originSpan.textContent = alt.origin;

                    listItem.appendChild(link);
                    listItem.appendChild(urlSpan);
                    listItem.appendChild(originSpan);
                    altList.appendChild(listItem);
                });

                // Add a note if we truncated the list
                const moreCount = response.alternatives.length - displayedAlternatives.length;
                if (moreCount > 0) {
                    const moreItem = document.createElement('li');
                    moreItem.className = 'notification-list-item';
                    const moreSpan = document.createElement('span');
                    moreSpan.textContent = `+${moreCount} more alternatives. View all in the extension popup.`;
                    moreItem.appendChild(moreSpan);
                    altList.appendChild(moreItem);
                }

                notification.appendChild(altList);

                // Create footer
                const footerDiv = document.createElement('div');
                footerDiv.className = 'notification-footer';

                const whitelistButton = document.createElement('button');
                whitelistButton.className = 'notification-whitelist-btn';
                whitelistButton.id = 'notification-whitelist';
                whitelistButton.textContent = "Don't show again for this site";

                const dismissButton = document.createElement('button');
                dismissButton.className = 'notification-dismiss-btn';
                dismissButton.id = 'notification-dismiss';
                dismissButton.textContent = 'Got it';

                footerDiv.appendChild(whitelistButton);
                footerDiv.appendChild(dismissButton);
                notification.appendChild(footerDiv);

                // Append to body
                if (document.body) {
                    document.body.appendChild(notification);
                } else {
                    // If body isn't available yet, retry after a delay
                    setTimeout(() => {
                        if (document.body) {
                            document.body.appendChild(notification);
                        }
                    }, 500);
                }

                // Add click event to close button
                document.getElementById('notification-close')?.addEventListener('click', function() {
                    const notif = document.getElementById('go-european-notification');
                    if (notif && notif.parentNode) {
                        notif.parentNode.removeChild(notif);
                    }
                });

                // Add click event to dismiss button
                document.getElementById('notification-dismiss')?.addEventListener('click', function() {
                    const notif = document.getElementById('go-european-notification');
                    if (notif && notif.parentNode) {
                        notif.parentNode.removeChild(notif);
                    }
                });

                // Add click event to whitelist button
                document.getElementById('notification-whitelist')?.addEventListener('click', function() {
                    // Add current site to whitelist
                    chrome.storage.local.get("whitelistedSites", (data) => {
                        const whitelistedSites = data.whitelistedSites || [];
                        if (!whitelistedSites.includes(hostname)) {
                            whitelistedSites.push(hostname);
                            chrome.storage.local.set({whitelistedSites: whitelistedSites}, () => {
                                console.log("Site added to whitelist:", hostname);
                            });
                        }
                        const notif = document.getElementById('go-european-notification');
                        if (notif && notif.parentNode) {
                            notif.parentNode.removeChild(notif);
                        }
                    });
                });

                // Auto-remove after 30 seconds (increased from 15)
                setTimeout(() => {
                    const notif = document.getElementById('go-european-notification');
                    if (notif && notif.parentNode) {
                        notif.parentNode.removeChild(notif);
                    }
                }, 30000);
            }
        });
    });
}

// Wait for the page to load fully before checking
if (document.readyState === 'complete') {
    // Page already loaded
    setTimeout(suggestAlternative, 1000);
} else {
    // Wait for the page to load
    window.addEventListener('load', () => {
        // Small delay to ensure everything is ready
        setTimeout(suggestAlternative, 1000);
    });
}