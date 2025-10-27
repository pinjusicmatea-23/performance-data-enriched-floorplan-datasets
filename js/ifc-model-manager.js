// Automatic IFC Model Detection and Gallery Population
class IFCModelManager {
    constructor() {
        this.models = [
            { filename: '1501.ifc', title: 'Building 1501', description: 'Architectural model from dataset', icon: '🏢' },
            { filename: '18277.ifc', title: 'Building 18277', description: 'Architectural model from dataset', icon: '🏛️' },
            { filename: '18278.ifc', title: 'Building 18278', description: 'Architectural model from dataset', icon: '🏗️' },
            { filename: '2103.ifc', title: 'Building 2103', description: 'Architectural model from dataset', icon: '🏘️' },
            { filename: '2131.ifc', title: 'Building 2131', description: 'Architectural model from dataset', icon: '🏠' },
            { filename: '2132.ifc', title: 'Building 2132', description: 'Architectural model from dataset', icon: '🏫' },
            { filename: '2191.ifc', title: 'Building 2191', description: 'Architectural model from dataset', icon: '🏢' },
            { filename: '2262.ifc', title: 'Building 2262', description: 'Architectural model from dataset', icon: '🏛️' },
            { filename: '2827.ifc', title: 'Building 2827', description: 'Architectural model from dataset', icon: '🏗️' },
            { filename: '3259.ifc', title: 'Building 3259', description: 'Architectural model from dataset', icon: '🏘️' },
            { filename: '3360.ifc', title: 'Building 3360', description: 'Architectural model from dataset', icon: '🏠' },
            { filename: '668.ifc', title: 'Building 668', description: 'Architectural model from dataset', icon: '🏫' },
            { filename: '822.ifc', title: 'Building 822', description: 'Architectural model from dataset', icon: '🏢' },
            { filename: '823.ifc', title: 'Building 823', description: 'Architectural model from dataset', icon: '🏛️' },
            { filename: '824.ifc', title: 'Building 824', description: 'Architectural model from dataset', icon: '🏗️' },
            { filename: '825.ifc', title: 'Building 825', description: 'Architectural model from dataset', icon: '🏘️' },
            { filename: 'sample-building.ifc', title: 'Sample Building', description: 'Demo building for testing viewer functionality', icon: '🏠' }
        ];
        this.init();
    }

    init() {
        this.populateGallery();
        this.updateControls();
    }

    populateGallery() {
        const gallery = document.querySelector('.ifc-gallery');
        if (!gallery) return;

        // Clear existing items except upload prompt
        const uploadPrompt = gallery.querySelector('.ifc-gallery-item:last-child');
        gallery.innerHTML = '';

        // Add all detected models
        this.models.forEach((model, index) => {
            const modelItem = this.createModelItem(model, index);
            gallery.appendChild(modelItem);
        });

        // Re-add upload prompt at the end
        if (uploadPrompt) {
            gallery.appendChild(uploadPrompt);
        } else {
            this.addUploadPrompt(gallery);
        }
    }

    createModelItem(model, index) {
        const modelItem = document.createElement('div');
        modelItem.className = 'ifc-gallery-item';
        modelItem.innerHTML = `
            <div class="ifc-gallery-thumb" onclick="loadIFCModel('${model.filename}')" title="Click to load ${model.title}">
                ${model.icon}
            </div>
            <div class="ifc-gallery-info">
                <div class="ifc-gallery-title">${model.title}</div>
                <div class="ifc-gallery-description">${model.description}</div>
                <div class="ifc-gallery-meta">
                    <small>📁 ${model.filename}</small>
                </div>
                <div class="ifc-gallery-actions">
                    <button class="btn" onclick="loadIFCModel('${model.filename}')">Load Model</button>
                    <button class="btn secondary" onclick="ifcModelManager.previewModel('${model.filename}')">Preview</button>
                </div>
            </div>
        `;
        return modelItem;
    }

    addUploadPrompt(gallery) {
        const uploadItem = document.createElement('div');
        uploadItem.className = 'ifc-gallery-item upload-prompt';
        uploadItem.innerHTML = `
            <div class="ifc-gallery-thumb" onclick="document.getElementById('ifc-file-input').click()">
                ➕
            </div>
            <div class="ifc-gallery-info">
                <div class="ifc-gallery-title">Add More Models</div>
                <div class="ifc-gallery-description">Upload additional IFC files to expand your collection.</div>
                <div class="ifc-gallery-actions">
                    <button class="btn secondary" onclick="document.getElementById('ifc-file-input').click()">Upload IFC</button>
                </div>
            </div>
        `;
        gallery.appendChild(uploadItem);
    }

    updateControls() {
        // Update the sample model button to load the first model
        const sampleButton = document.querySelector('.ifc-controls .btn');
        if (sampleButton && this.models.length > 0) {
            sampleButton.textContent = `Load ${this.models[0].title}`;
            sampleButton.onclick = () => loadIFCModel(this.models[0].filename);
        }
    }

    previewModel(filename) {
        const model = this.models.find(m => m.filename === filename);
        if (!model) return;

        // Show model information in a preview
        const previewInfo = `
            <div style="text-align: left;">
                <h4>${model.title}</h4>
                <p><strong>File:</strong> ${model.filename}</p>
                <p><strong>Type:</strong> IFC Building Model</p>
                <p><strong>Description:</strong> ${model.description}</p>
                <p><strong>Actions:</strong></p>
                <ul>
                    <li>Pan: Left click + drag</li>
                    <li>Rotate: Right click + drag</li>
                    <li>Zoom: Mouse wheel</li>
                    <li>Reset: Use reset button</li>
                </ul>
            </div>
        `;

        if (window.ifcViewerManager) {
            window.ifcViewerManager.showNotification(previewInfo, 'info', 8000);
        }
    }

    getModelByFilename(filename) {
        return this.models.find(m => m.filename === filename);
    }

    getRandomModel() {
        const randomIndex = Math.floor(Math.random() * this.models.length);
        return this.models[randomIndex];
    }

    // Method to add new models dynamically
    addModel(modelInfo) {
        this.models.push(modelInfo);
        this.populateGallery();
    }

    // Get models by category (if you want to categorize them later)
    getModelsByType(type) {
        // This could be expanded to categorize models
        return this.models.filter(model => 
            model.description.toLowerCase().includes(type.toLowerCase())
        );
    }
}

// Enhanced IFC Viewer with model management
class EnhancedIFCViewer extends IFCViewerManager {
    constructor() {
        super();
        this.modelManager = new IFCModelManager();
        this.setupModelQuickLoad();
    }

    setupModelQuickLoad() {
        // Add keyboard shortcuts for quick model loading
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                        e.preventDefault();
                        const modelIndex = parseInt(e.key) - 1;
                        if (this.modelManager.models[modelIndex]) {
                            this.loadModel(this.modelManager.models[modelIndex].filename);
                        }
                        break;
                    case 'r':
                        e.preventDefault();
                        const randomModel = this.modelManager.getRandomModel();
                        this.loadModel(randomModel.filename);
                        this.showNotification(`Loading random model: ${randomModel.title}`, 'info');
                        break;
                }
            }
        });
    }

    loadModel(modelName) {
        const model = this.modelManager.getModelByFilename(modelName);
        if (model) {
            super.loadModel(modelName);
            this.updateModelInfo(model.title, null, model.description);
        } else {
            super.loadModel(modelName);
        }
    }

    updateModelInfo(modelName, fileSize = null, description = null) {
        super.updateModelInfo(modelName, fileSize);
        
        // Add description if available
        if (description) {
            const infoGrid = document.querySelector('.model-info .info-grid');
            if (infoGrid) {
                let descItem = infoGrid.querySelector('.info-description');
                if (!descItem) {
                    descItem = document.createElement('div');
                    descItem.className = 'info-item info-description';
                    descItem.innerHTML = `
                        <div class="info-label">Description</div>
                        <div class="info-value">${description}</div>
                    `;
                    infoGrid.appendChild(descItem);
                } else {
                    descItem.querySelector('.info-value').textContent = description;
                }
            }
        }
    }
}

// Initialize enhanced IFC viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Replace the basic IFC viewer with enhanced version
    if (window.ifcViewerManager) {
        window.ifcViewerManager = new EnhancedIFCViewer();
    }
    
    // Make model manager globally available
    window.ifcModelManager = new IFCModelManager();
});

// Export for use in other scripts
window.IFCModelManager = IFCModelManager;
window.EnhancedIFCViewer = EnhancedIFCViewer;