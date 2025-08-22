// This script dynamically loads reusable components like the header and footer into placeholder divs.
document.addEventListener('DOMContentLoaded', function() {

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

    // Load Header and then initialize its specific JavaScript
    loadComponent('header.html', 'header-placeholder', () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const moreMenuButton = document.getElementById('more-menu-button');
        const moreMenu = document.getElementById('more-menu');

        // Toggle mobile menu
        if (mobileMenuButton && mobileMenu) {
             mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
             });
        }
        
        // Toggle "More" dropdown on desktop
        if (moreMenuButton && moreMenu) {
            moreMenuButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from closing menu immediately
                moreMenu.classList.toggle('hidden');
            });
        }

        // Close "More" dropdown if clicking outside of it
        document.addEventListener('click', (event) => {
            if (moreMenu && !moreMenu.contains(event.target) && !moreMenuButton.contains(event.target)) {
                moreMenu.classList.add('hidden');
            }
        });

        // Re-run feather.replace() to render icons inside the newly loaded header
        feather.replace();
    });

    // Load Footer
    loadComponent('footer.html', 'footer-placeholder');

});
