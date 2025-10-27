// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Initialize back to top button
    initBackToTop();
    
    // Initialize download tracking
    initDownloadTracking();
    
    // Initialize form handling
    initFormHandling();
    
    // Initialize accessibility features
    initAccessibility();
});

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or if target doesn't exist
            if (href === '#' || href === '#top') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 100; // Account for fixed header
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Back to top button
function initBackToTop() {
    // Create back to top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '↑';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(backToTop);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Download tracking
function initDownloadTracking() {
    const downloadLinks = document.querySelectorAll('a[download]');
    
    downloadLinks.forEach(link => {
        link.addEventListener('click', function() {
            const fileName = this.getAttribute('download') || this.getAttribute('href').split('/').pop();
            
            // Track download (you can integrate with analytics here)
            console.log(`Download started: ${fileName}`);
            
            // Show download notification
            showNotification(`Download started: ${fileName}`, 'success');
            
            // You can add analytics tracking here
            // gtag('event', 'download', { 'file_name': fileName });
        });
    });
}

// Form handling
function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    showNotification(`Please fill in the ${field.name || 'required'} field.`, 'error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Process form submission
                showNotification('Form submitted successfully!', 'success');
                form.reset();
            }
        });
    });
}

// Accessibility features
function initAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard navigation enhancements
    document.addEventListener('keydown', function(e) {
        // Escape key to close any open modals or overlays
        if (e.key === 'Escape') {
            // Close any open overlays
            const overlays = document.querySelectorAll('.nav-overlay.active');
            overlays.forEach(overlay => {
                overlay.click();
            });
        }
    });
    
    // Focus management
    const focusableElements = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';
    
    // Add focus outline to all focusable elements
    document.querySelectorAll(focusableElements).forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-color)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Allow manual close by clicking
    notification.addEventListener('click', function() {
        this.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => this.remove(), 300);
    });
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
        
        // Log slow page loads
        if (loadTime > 3000) {
            console.warn('Slow page load detected');
        }
    });
    
    // Monitor resource loading
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 1000) {
                    console.warn(`Slow resource: ${entry.name} (${entry.duration}ms)`);
                }
            });
        });
        
        observer.observe({ entryTypes: ['resource'] });
    }
}

// Search functionality (if search is added later)
function initSearch() {
    const searchInput = document.getElementById('search');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput && searchResults) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
    }
}

function performSearch(query) {
    // This would implement actual search functionality
    // For now, it's a placeholder
    console.log(`Searching for: ${query}`);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // You could send error reports to a logging service here
});

// Browser compatibility checks
function checkBrowserCompatibility() {
    const features = {
        'CSS Grid': 'CSS.supports("display", "grid")',
        'Fetch API': 'window.fetch',
        'Intersection Observer': 'window.IntersectionObserver',
        'Service Workers': 'navigator.serviceWorker'
    };
    
    const unsupported = [];
    
    for (const [feature, check] of Object.entries(features)) {
        try {
            if (!eval(check)) {
                unsupported.push(feature);
            }
        } catch (e) {
            unsupported.push(feature);
        }
    }
    
    if (unsupported.length > 0) {
        console.warn('Unsupported browser features:', unsupported);
        
        // Show a non-intrusive notice for older browsers
        if (unsupported.length > 2) {
            const notice = document.createElement('div');
            notice.innerHTML = `
                <p>Your browser may not support all features of this website. 
                Please consider updating to a modern browser for the best experience.</p>
                <button onclick="this.parentElement.remove()">Dismiss</button>
            `;
            notice.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 1rem;
                margin: 1rem;
                border-radius: 4px;
                text-align: center;
            `;
            
            document.body.insertBefore(notice, document.body.firstChild);
        }
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();
    initPerformanceMonitoring();
    initSearch();
    checkBrowserCompatibility();
    
    // Add performance tips after page load
    setTimeout(() => {
        if (window.performanceOptimizer) {
            // Auto-expand performance tips for first-time users
            const hints = document.querySelector('.performance-hints');
            if (hints && !localStorage.getItem('hintsShown')) {
                hints.classList.add('expanded');
                localStorage.setItem('hintsShown', 'true');
                
                // Auto-collapse after 5 seconds
                setTimeout(() => {
                    hints.classList.remove('expanded');
                }, 5000);
            }
        }
    }, 2000);
});