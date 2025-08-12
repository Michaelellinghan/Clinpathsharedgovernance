// This script dynamically loads reusable components like the header and footer into placeholder divs.
// This allows you to maintain one header.html and one footer.html file for the entire site.

document.addEventListener('DOMContentLoaded', function() {

    /**
     * Fetches HTML content from a file and injects it into a specified placeholder element.
     * @param {string} url - The URL of the HTML file to fetch (e.g., 'header.html').
     * @param {string} placeholderId - The ID of the div where the content should be placed.
     * @param {function} callback - An optional function to run after the content is loaded.
     */
    function loadComponent(url, placeholderId, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok for ' + url);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                    if (callback) {
                        callback();
                    }
                }
            })
            .catch(error => {
                console.error(`Error loading component from ${url}:`, error);
                const placeholder = document.getElementById(placeholderId);
                if(placeholder) {
                    placeholder.innerHTML = `<p class="text-center text-red-500">Error: Could not load ${placeholderId.replace('-placeholder', '')}.</p>`;
                }
            });
    }

    // Load Header and then initialize its specific JavaScript (mobile menu, icons)
    loadComponent('header.html', 'header-placeholder', () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
             mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        }
        // Re-run feather.replace() to render icons inside the newly loaded header
        feather.replace();
    });

    // Load Footer and then initialize its icons
    loadComponent('footer.html', 'footer-placeholder', () => {
        // Re-run feather.replace() to render icons inside the newly loaded footer
        feather.replace();
    });

});
