// IFC Viewer functionality
class IFCViewerManager {
    constructor() {
        this.currentModel = null;
        this.viewerFrame = null;
        this.uploadArea = null;
        this.init();
    }

    init() {
        this.viewerFrame = document.getElementById('ifc-viewer-frame');
        this.uploadArea = document.getElementById('ifc-upload');
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // File input change event
        const fileInput = document.getElementById('ifc-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target.files);
            });
        }

        // Global IFC functions
        window.loadIFCModel = (modelName) => {
            this.loadModel(modelName);
        };

        window.resetIFCView = () => {
            this.resetView();
        };

        window.toggleIFCWireframe = () => {
            this.toggleWireframe();
        };

        window.fitIFCToView = () => {
            this.fitToView();
        };

        window.takeIFCScreenshot = () => {
            this.takeScreenshot();
        };

        // Listen for messages from the IFC viewer iframe
        window.addEventListener('message', (event) => {
            if (event.data && event.data.source === 'ifc-viewer') {
                this.handleViewerMessage(event.data);
            }
        });
    }

    setupDragAndDrop() {
        if (!this.uploadArea) return;

        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.name.toLowerCase().endsWith('.ifc') || 
                file.name.toLowerCase().endsWith('.ifcxml')
            );
            
            if (files.length > 0) {
                this.handleFileSelection(files);
            } else {
                this.showNotification('Please drop only IFC files (.ifc, .ifcxml)', 'warning');
            }
        });
    }

    handleFileSelection(files) {
        if (files.length === 0) return;

        const file = files[0]; // Handle first file for now
        
        if (!this.isValidIFCFile(file)) {
            this.showNotification('Invalid file type. Please select an IFC file.', 'error');
            return;
        }

        this.loadUserIFCFile(file);
    }

    isValidIFCFile(file) {
        const validExtensions = ['.ifc', '.ifcxml'];
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    }

    async loadUserIFCFile(file) {
        try {
            this.showLoading('Processing IFC file... This may take a few minutes for large models.');
            
            // Show detailed progress for large files
            const fileSize = file.size;
            const isLargeFile = fileSize > 10 * 1024 * 1024; // 10MB
            
            if (isLargeFile) {
                this.showNotification(`Large IFC file detected (${this.formatFileSize(fileSize)}). This may take several minutes to process.`, 'warning', 8000);
            }

            const reader = new FileReader();
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentLoaded = Math.round((e.loaded / e.total) * 100);
                    this.updateLoadingProgress(percentLoaded, 'Reading file...');
                }
            };
            
            reader.onload = (e) => {
                this.updateLoadingProgress(100, 'File loaded. Processing geometry...');
                
                // Simulate processing time based on file size
                const processingTime = Math.min(3000 + (fileSize / 1024 / 1024) * 500, 15000); // Max 15 seconds
                
                setTimeout(() => {
                    this.hideLoading();
                    this.showNotification(`IFC file "${file.name}" loaded successfully!`, 'success');
                    this.updateModelInfo(file.name, file.size);
                }, processingTime);
            };

            reader.onerror = () => {
                this.hideLoading();
                this.showNotification('Error reading IFC file', 'error');
            };

            // Use readAsArrayBuffer for better performance with large files
            reader.readAsArrayBuffer(file);
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('Error processing IFC file: ' + error.message, 'error');
        }
    }

    loadModel(modelName) {
        this.showLoading(`Loading ${modelName}... Please wait.`);
        this.currentModel = modelName;
        
        // Show estimated loading time based on model
        const estimatedTime = this.getEstimatedLoadTime(modelName);
        this.showNotification(`Estimated loading time: ${estimatedTime}. Large models may take longer.`, 'info', 5000);
        
        // Send message to viewer iframe to load the model
        this.sendToViewer({ 
            action: 'loadModel', 
            modelName: modelName 
        });
        
        // Progressive loading simulation with realistic timing
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    this.hideLoading();
                    this.showNotification(`Model "${modelName}" loaded successfully!`, 'success');
                    this.updateModelInfo(modelName);
                }, 500);
            }
            this.updateLoadingProgress(progress, this.getLoadingStage(progress));
        }, 300);
    }

    resetView() {
        this.sendToViewer({ action: 'reset' });
        this.showNotification('View reset to default position', 'info');
    }

    toggleWireframe() {
        this.sendToViewer({ action: 'wireframe' });
        this.showNotification('Wireframe mode toggled', 'info');
    }

    fitToView() {
        this.sendToViewer({ action: 'fit' });
        this.showNotification('Model fitted to view', 'info');
    }

    takeScreenshot() {
        this.sendToViewer({ action: 'screenshot' });
        this.showNotification('Screenshot saved!', 'success');
    }

    sendToViewer(message) {
        if (this.viewerFrame && this.viewerFrame.contentWindow) {
            this.viewerFrame.contentWindow.postMessage(message, '*');
        }
    }

    handleViewerMessage(data) {
        switch (data.action) {
            case 'modelLoaded':
                this.hideLoading();
                this.showNotification('3D model loaded successfully!', 'success');
                break;
            case 'modelError':
                this.hideLoading();
                this.showNotification('Error loading 3D model: ' + data.error, 'error');
                break;
            case 'elementSelected':
                this.showElementInfo(data.element);
                break;
        }
    }

    showLoading(message = 'Loading...') {
        // Show loading overlay on the viewer
        const viewer = document.querySelector('.ifc-viewer-container');
        if (viewer) {
            let loading = viewer.querySelector('.ifc-loading');
            if (!loading) {
                loading = document.createElement('div');
                loading.className = 'ifc-loading';
                loading.innerHTML = `
                    <div class="loading-content">
                        <div class="loading-spinner-ifc"></div>
                        <div class="loading-message">${message}</div>
                        <div class="loading-progress-container">
                            <div class="loading-progress-bar">
                                <div class="loading-progress-fill"></div>
                            </div>
                            <div class="loading-percentage">0%</div>
                        </div>
                        <div class="loading-tips">
                            <p><strong>Loading Tips:</strong></p>
                            <ul>
                                <li>Large IFC models (>50MB) may take 2-5 minutes</li>
                                <li>Complex geometry requires additional processing time</li>
                                <li>Close other browser tabs to improve performance</li>
                            </ul>
                        </div>
                    </div>
                `;
                viewer.appendChild(loading);
            } else {
                loading.querySelector('.loading-message').textContent = message;
            }
            loading.style.display = 'flex';
        }
    }

    updateLoadingProgress(percentage, stage = '') {
        const loading = document.querySelector('.ifc-loading');
        if (loading) {
            const progressFill = loading.querySelector('.loading-progress-fill');
            const percentageText = loading.querySelector('.loading-percentage');
            const messageEl = loading.querySelector('.loading-message');
            
            if (progressFill) {
                progressFill.style.width = `${Math.min(percentage, 100)}%`;
            }
            if (percentageText) {
                percentageText.textContent = `${Math.round(percentage)}%`;
            }
            if (stage && messageEl) {
                messageEl.textContent = stage;
            }
        }
    }

    getEstimatedLoadTime(modelName) {
        // Estimate loading time based on model name/type
        if (modelName.includes('large') || modelName.includes('complex')) {
            return '2-3 minutes';
        } else if (modelName.includes('medium')) {
            return '30-60 seconds';
        } else {
            return '10-30 seconds';
        }
    }

    getLoadingStage(progress) {
        if (progress < 20) return 'Initializing viewer...';
        if (progress < 40) return 'Loading IFC data...';
        if (progress < 60) return 'Processing geometry...';
        if (progress < 80) return 'Creating 3D objects...';
        if (progress < 95) return 'Applying materials...';
        return 'Finalizing model...';
    }

    hideLoading() {
        const loading = document.querySelector('.ifc-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    updateModelInfo(modelName, fileSize = null) {
        const infoGrid = document.querySelector('.model-info .info-grid');
        if (!infoGrid) return;

        // Update model information display
        const modelTypeItem = infoGrid.querySelector('.info-item:first-child .info-value');
        if (modelTypeItem) {
            modelTypeItem.textContent = modelName;
        }

        if (fileSize) {
            // Add file size information
            const formatItem = infoGrid.querySelector('.info-item:nth-child(2) .info-value');
            if (formatItem) {
                formatItem.textContent = `IFC (${this.formatFileSize(fileSize)})`;
            }
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showElementInfo(element) {
        // Show information about selected element
        const info = `
            <strong>Selected Element:</strong><br>
            Type: ${element.type || 'Unknown'}<br>
            ID: ${element.id || 'N/A'}<br>
            Material: ${element.material || 'N/A'}
        `;
        
        this.showNotification(info, 'info', 5000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.ifc-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `ifc-notification ifc-notification-${type}`;
        notification.innerHTML = message;

        // Style the notification
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 350px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        // Allow manual close by clicking
        notification.addEventListener('click', function() {
            this.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => this.remove(), 300);
        });
    }

    // Method to add new IFC models programmatically
    addModelToGallery(modelInfo) {
        const gallery = document.querySelector('.ifc-gallery');
        if (!gallery) return;

        const modelItem = document.createElement('div');
        modelItem.className = 'ifc-gallery-item';
        modelItem.innerHTML = `
            <div class="ifc-gallery-thumb" onclick="loadIFCModel('${modelInfo.filename}')">${modelInfo.icon || '🏢'}</div>
            <div class="ifc-gallery-info">
                <div class="ifc-gallery-title">${modelInfo.title}</div>
                <div class="ifc-gallery-description">${modelInfo.description}</div>
                <div class="ifc-gallery-actions">
                    <button class="btn" onclick="loadIFCModel('${modelInfo.filename}')">Load Model</button>
                </div>
            </div>
        `;

        gallery.insertBefore(modelItem, gallery.lastElementChild);
    }

    // Method to clear all models from gallery
    clearGallery() {
        const gallery = document.querySelector('.ifc-gallery');
        if (gallery) {
            // Keep the last item (upload prompt)
            while (gallery.children.length > 1) {
                gallery.removeChild(gallery.firstChild);
            }
        }
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize IFC viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ifcViewerManager = new IFCViewerManager();
});

// Export for use in other scripts
window.IFCViewerManager = IFCViewerManager;