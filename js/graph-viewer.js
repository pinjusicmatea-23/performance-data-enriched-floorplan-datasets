// Graph Viewer functionality
class GraphViewer {
    constructor() {
        this.currentGraph = null;
        this.isFullscreen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDefaultGraph();
    }

    setupEventListeners() {
        // Listen for graph load requests
        window.loadGraph = (graphName) => {
            this.loadGraph(graphName);
        };

        // Listen for reset view requests
        window.resetView = () => {
            this.resetView();
        };

        // Fullscreen toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
            }
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });
    }

    loadGraph(graphName) {
        console.log('Loading graph:', graphName);
        const viewer = document.getElementById('graph-viewer');
        if (!viewer) {
            console.error('Graph viewer element not found');
            return;
        }

        // Show loading state
        this.showLoading(viewer);

        // Create iframe for the graph
        const iframe = document.createElement('iframe');
        iframe.className = 'graph-iframe';
        iframe.src = `graphs/${graphName}`;
        iframe.title = `Interactive Graph: ${graphName}`;

        // Set iframe attributes for better loading
        iframe.setAttribute('loading', 'eager');
        iframe.setAttribute('importance', 'high');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        let timeoutId;
        let isLoaded = false;

        // Handle load success
        const handleLoad = () => {
            if (isLoaded) return;
            isLoaded = true;
            
            clearTimeout(timeoutId);
            this.clearViewer(viewer);
            viewer.appendChild(iframe);
            this.currentGraph = graphName;
            // this.addGraphTools(viewer); // Removed
            // this.updateMetadata(graphName); // Removed
            
            // Add performance monitoring
            console.log(`Graph ${graphName} loaded successfully`);
        };

        // Handle load error
        const handleError = (errorMsg = '') => {
            if (isLoaded) return;
            isLoaded = true;
            
            clearTimeout(timeoutId);
            this.showError(viewer, `Failed to load graph: ${graphName}`, errorMsg);
        };

        // Set multiple event listeners for better compatibility
        iframe.onload = handleLoad;
        iframe.addEventListener('load', handleLoad);
        iframe.onerror = () => handleError('Network or file error');
        iframe.addEventListener('error', () => handleError('iframe loading error'));

        // Use a fetch-based pre-check to see if file exists
        fetch(`graphs/${graphName}`, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                // File exists, proceed with loading
                viewer.appendChild(iframe);
                
                // Set timeout after adding to DOM
                timeoutId = setTimeout(() => {
                    if (!isLoaded) {
                        // Try direct window.open as fallback
                        this.showTimeoutOptions(viewer, graphName);
                    }
                }, 60000); // Increased to 60 seconds to prevent premature timeouts
            })
            .catch(error => {
                console.error('Graph file check failed:', error);
                handleError(`File not found or inaccessible: ${error.message}`);
            });
    }

    loadDefaultGraph() {
        // Try to load a default graph if available
        this.checkGraphAvailability();
    }

    checkGraphAvailability() {
        const viewer = document.getElementById('graph-viewer');
        const placeholder = viewer?.querySelector('.graph-placeholder');
        
        if (placeholder) {
            // Update placeholder with instructions
            placeholder.innerHTML = `
                <p><strong>Interactive Graph Viewer</strong></p>
                <p>Place your HTML graph files in the <code>/graphs</code> folder</p>
                <p>Click the buttons below to load available graphs</p>
                <p>Supported features:</p>
                <ul style="text-align: left; margin-top: 1rem;">
                    <li>Pan and rotate with mouse/touch</li>
                    <li>Zoom in/out with scroll wheel</li>
                    <li>Fullscreen mode (press F key)</li>
                    <li>Reset view to default position</li>
                </ul>
            `;
        }
    }

    showLoading(viewer) {
        this.clearViewer(viewer);
        const loading = document.createElement('div');
        loading.className = 'graph-loading';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
        `;
        viewer.appendChild(loading);

        // Animate progress bar
        setTimeout(() => {
            const progressBar = loading.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }, 100);
    }

    showError(viewer, message, details = '') {
        this.clearViewer(viewer);
        const error = document.createElement('div');
        error.className = 'graph-error';
        error.innerHTML = `
            <h3>Error Loading Graph</h3>
            <p>${message}</p>
            ${details ? `<p class="error-details">${details}</p>` : ''}
            <p>Please check that the graph file exists in the /graphs folder</p>
            <div class="error-actions">
                <button class="btn" onclick="location.reload()">Refresh Page</button>
                <button class="btn secondary" onclick="graphManager.loadRandomGraph()">Try Another Graph</button>
                <button class="btn" onclick="graphViewer.openInNewTab('${this.lastAttemptedGraph}')">Open in New Tab</button>
            </div>
        `;
        viewer.appendChild(error);
    }

    showTimeoutOptions(viewer, graphName) {
        this.clearViewer(viewer);
        const timeout = document.createElement('div');
        timeout.className = 'graph-timeout';
        timeout.innerHTML = `
            <h3>⏱️ Graph Taking Longer Than Expected</h3>
            <p><strong>Loading:</strong> ${graphName}</p>
            <p>This graph may contain complex visualizations. Try these options:</p>
            <div class="timeout-options">
                <button class="btn primary" onclick="graphViewer.openInNewTab('${graphName}')">
                    🚀 Open in New Tab
                </button>
                <button class="btn secondary" onclick="graphViewer.continueWaiting('${graphName}')">
                    ⏳ Continue Waiting
                </button>
                <button class="btn" onclick="graphViewer.loadGraph('${graphName}')">
                    🔄 Retry Loading
                </button>
            </div>
            <div class="timeout-info">
                <p><small>💡 <strong>Tip:</strong> Graph files load faster when opened directly in your browser</small></p>
            </div>
        `;
        viewer.appendChild(timeout);
        this.lastAttemptedGraph = graphName;
    }

    openInNewTab(graphName) {
        const fullPath = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}/graphs/${graphName}`;
        window.open(fullPath, '_blank', 'noopener,noreferrer');
        
        // Update current viewer with a message
        const viewer = document.getElementById('graph-viewer');
        if (viewer) {
            this.clearViewer(viewer);
            const message = document.createElement('div');
            message.className = 'graph-message';
            message.innerHTML = `
                <h3>📋 Graph Opened in New Tab</h3>
                <p><strong>File:</strong> ${graphName}</p>
                <p>The graph has been opened in a new browser tab for optimal performance.</p>
                <div class="message-actions">
                    <button class="btn primary" onclick="graphViewer.loadGraph('${graphName}')">
                        📥 Load Back Here
                    </button>
                    <button class="btn secondary" onclick="graphManager.loadRandomGraph()">
                        🎲 Try Another Graph
                    </button>
                </div>
            `;
            viewer.appendChild(message);
        }
    }

    continueWaiting(graphName) {
        // Show extended loading
        const viewer = document.getElementById('graph-viewer');
        this.showLoading(viewer);
        
        // Try loading again with extended timeout
        const iframe = document.createElement('iframe');
        iframe.className = 'graph-iframe';
        iframe.src = `graphs/${graphName}?t=${Date.now()}`; // Add cache-busting
        iframe.title = `Interactive Graph: ${graphName}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        let isLoaded = false;

        const handleLoad = () => {
            if (isLoaded) return;
            isLoaded = true;
            
            this.clearViewer(viewer);
            viewer.appendChild(iframe);
            this.currentGraph = graphName;
            // this.addGraphTools(viewer); // Removed
            // this.updateMetadata(graphName); // Removed
        };

        iframe.onload = handleLoad;
        iframe.addEventListener('load', handleLoad);
        
        viewer.appendChild(iframe);

        // Extended timeout (60 seconds)
        setTimeout(() => {
            if (!isLoaded) {
                this.showError(viewer, `Extended timeout for: ${graphName}`, 'The graph file may be too large or complex for embedded viewing.');
            }
        }, 60000);
    }

    clearViewer(viewer) {
        viewer.innerHTML = '';
    }

    addGraphTools(viewer) {
        const tools = document.createElement('div');
        tools.className = 'graph-tools';
        tools.innerHTML = `
            <button class="graph-tool" onclick="graphViewer.resetView()" title="Reset View">
                ↺ Reset
            </button>
            <button class="graph-tool" onclick="graphViewer.toggleFullscreen()" title="Fullscreen (F)">
                ⛶ Full
            </button>
            <button class="graph-tool" onclick="graphViewer.downloadGraph()" title="Download">
                ↓ Save
            </button>
        `;
        viewer.appendChild(tools);
    }

    resetView() {
        const iframe = document.querySelector('.graph-iframe');
        if (iframe) {
            // Try to communicate with the iframe to reset view
            try {
                iframe.contentWindow.postMessage({ action: 'reset' }, '*');
            } catch (e) {
                // If cross-origin, reload the iframe
                iframe.src = iframe.src;
            }
        }
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        const viewer = document.getElementById('graph-viewer');
        if (!viewer) return;

        viewer.classList.add('graph-fullscreen');
        this.isFullscreen = true;

        // Add exit button
        const exitBtn = document.createElement('button');
        exitBtn.className = 'fullscreen-exit';
        exitBtn.textContent = '✕ Exit Fullscreen';
        exitBtn.onclick = () => this.exitFullscreen();
        viewer.appendChild(exitBtn);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    exitFullscreen() {
        const viewer = document.getElementById('graph-viewer');
        if (!viewer) return;

        viewer.classList.remove('graph-fullscreen');
        this.isFullscreen = false;

        // Remove exit button
        const exitBtn = viewer.querySelector('.fullscreen-exit');
        if (exitBtn) {
            exitBtn.remove();
        }

        // Restore body scroll
        document.body.style.overflow = '';
    }

    downloadGraph() {
        if (!this.currentGraph) {
            alert('No graph currently loaded');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = `graphs/${this.currentGraph}`;
        link.download = this.currentGraph;
        link.click();
    }

    updateMetadata(graphName) {
        // Update or create metadata section
        let metadata = document.querySelector('.graph-metadata');
        if (!metadata) {
            metadata = document.createElement('div');
            metadata.className = 'graph-metadata';
            const container = document.querySelector('.graph-container');
            container?.appendChild(metadata);
        }

        metadata.innerHTML = `
            <h3>Currently Viewing: ${graphName}</h3>
            <p><strong>Interactions:</strong> Click and drag to pan, scroll to zoom, right-click and drag to rotate</p>
            <p><strong>Keyboard:</strong> Press 'F' for fullscreen, 'Escape' to exit fullscreen</p>
            <p><strong>File:</strong> /graphs/${graphName}</p>
        `;
    }
}

// Initialize graph viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.graphViewer = new GraphViewer();

    // Listen for messages from iframes (for cross-origin communication)
    window.addEventListener('message', function(event) {
        // Handle messages from graph iframes
        if (event.data && event.data.action) {
            switch (event.data.action) {
                case 'graphLoaded':
                    console.log('Graph loaded successfully');
                    break;
                case 'graphError':
                    console.error('Graph loading error:', event.data.error);
                    break;
            }
        }
    });
});