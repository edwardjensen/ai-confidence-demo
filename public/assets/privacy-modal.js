// Privacy Modal Functionality
// This script provides shared modal functionality that can be used across all pages

class PrivacyModal {
    constructor() {
        this.modal = null;
        this.isLoaded = false;
        this.init();
    }
    
    init() {
        // Create modal HTML structure
        this.createModal();
        // Load privacy content
        this.loadPrivacyContent();
        // Set up event listeners
        this.setupEventListeners();
    }
    
    createModal() {
        const modalHTML = `
            <div id="privacyModal" class="privacy-modal" style="display: none;" role="dialog" aria-labelledby="privacyModalTitle" aria-describedby="privacyModalIntro" aria-modal="true">
                <div class="privacy-modal-content">
                    <div class="privacy-modal-header">
                        <h2 id="privacyModalTitle">Privacy Policy</h2>
                        <button class="privacy-modal-close" aria-label="Close privacy policy dialog" type="button">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="privacy-modal-body" tabindex="0" id="privacyModalContent">
                        <div style="text-align: center; padding: 2rem;">
                            <p>Loading privacy policy...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert modal into page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('privacyModal');
    }
    
    async loadPrivacyContent() {
        try {
            const response = await fetch('/privacy');
            if (!response.ok) throw new Error('Failed to load privacy content');
            
            const htmlText = await response.text();
            // Extract the content from the privacy page
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const privacyContent = doc.querySelector('.privacy-content');
            
            if (privacyContent) {
                const contentContainer = document.getElementById('privacyModalContent');
                contentContainer.innerHTML = privacyContent.innerHTML;
                this.isLoaded = true;
            } else {
                throw new Error('Privacy content not found');
            }
        } catch (error) {
            console.error('Error loading privacy content:', error);
            const contentContainer = document.getElementById('privacyModalContent');
            contentContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <p><strong>Error loading privacy policy</strong></p>
                    <p>Please <a href="/privacy" style="color: #007aff;">visit the privacy page directly</a>.</p>
                </div>
            `;
        }
    }
    
    setupEventListeners() {
        // Close button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.privacy-modal-close') || e.target.matches('.privacy-modal-close *')) {
                this.close();
            }
        });
        
        // Click outside modal
        document.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
                this.close();
            }
        });
        
        // Privacy policy links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href="/privacy"]');
            if (link) {
                e.preventDefault();
                this.open();
            }
        });
    }
    
    open() {
        if (!this.modal) return;
        
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus the close button
        const closeButton = this.modal.querySelector('.privacy-modal-close');
        if (closeButton) {
            closeButton.focus();
        }
        
        // Set aria-modal
        this.modal.setAttribute('aria-modal', 'true');
    }
    
    close() {
        if (!this.modal) return;
        
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.modal.setAttribute('aria-modal', 'false');
        
        // Return focus to the privacy policy link that opened the modal
        const privacyLinks = document.querySelectorAll('a[href="/privacy"]');
        if (privacyLinks.length > 0) {
            privacyLinks[0].focus();
        }
    }
}

// Initialize privacy modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrivacyModal();
});

// Also initialize if script is loaded after DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PrivacyModal();
    });
} else {
    new PrivacyModal();
}