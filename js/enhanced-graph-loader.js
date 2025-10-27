// Enhanced Graph Loader with Multiple Loading Strategies
class EnhancedGraphLoader {
    constructor() {
        this.loadingStrategies = ['iframe', 'window', 'fetch'];
        this.currentStrategy = 0;
        this.maxRetries = 3;
        this.init();
    }

    init() {
        // Replace the global loadGraph function
        window.loadGraph = (graphName) => this.loadGraphWithStrategies(graphName);
        console.log('Enhanced Graph Loader initialized');
    }

    async loadGraphWithStrategies(graphName) {
        const viewer = document.getElementById('graph-viewer');
        if (!viewer) return;

        this.showEnhancedLoading(viewer, graphName);

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            const strategy = this.loadingStrategies[attempt % this.loadingStrategies.length];
            
            try {
                console.log(`Attempt ${attempt + 1}: Loading ${graphName} with ${strategy} strategy`);
                const success = await this.loadWithStrategy(graphName, strategy, viewer);
                
                if (success) {
                    console.log(`Successfully loaded ${graphName} with ${strategy} strategy`);
                    this.updateSuccessMetadata(graphName, strategy);
                    return;
                }
            } catch (error) {
                console.warn(`Strategy ${strategy} failed for ${graphName}:`, error);
            }
        }

        // All strategies failed
        this.showEnhancedError(viewer, graphName);
    }

    async loadWithStrategy(graphName, strategy, viewer) {
        switch (strategy) {
            case 'iframe':
                return this.loadWithIframe(graphName, viewer);
            case 'window':
                return this.loadWithWindow(graphName, viewer);
            case 'fetch':
                return this.loadWithFetch(graphName, viewer);
            default:
                return false;
        }
    }

    async loadWithIframe(graphName, viewer) {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.className = 'graph-iframe enhanced-iframe';
            iframe.src = `graphs/${graphName}`;
            iframe.style.cssText = `
                width: 100%;
                height: 100%;
                flex: 1;
                border: none;
                background: white;
                min-height: 600px;
            `;

            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(false);
                }
            }, 10000); // 10 second timeout

            iframe.onload = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    this.clearViewer(viewer);
                    viewer.appendChild(iframe);
                    this.addEnhancedTools(viewer, graphName);
                    resolve(true);
                }
            };

            iframe.onerror = () => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(false);
                }
            };

            // Add to a hidden container first for pre-loading
            const hiddenContainer = document.createElement('div');
            hiddenContainer.style.cssText = 'position: absolute; top: -9999px; left: -9999px;';
            document.body.appendChild(hiddenContainer);
            hiddenContainer.appendChild(iframe);

            // Move to viewer after a brief delay
            setTimeout(() => {
                if (!resolved && iframe.parentNode) {
                    hiddenContainer.remove();
                    viewer.appendChild(iframe);
                }
            }, 100);
        });
    }

    async loadWithWindow(graphName, viewer) {
        const fullPath = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}/graphs/${graphName}`;
        
        // Open in new window/tab
        const newWindow = window.open(fullPath, '_blank', 'noopener,noreferrer');
        
        if (newWindow) {
            this.clearViewer(viewer);
            const message = document.createElement('div');
            message.className = 'graph-external-window';
            message.innerHTML = `
                <div class="external-window-info">
                    <h3>🚀 Graph Opened in New Window</h3>
                    <p><strong>File:</strong> ${graphName}</p>
                    <p>The graph has been opened in a new browser window for optimal performance.</p>
                    <div class="external-actions">
                        <button class="btn primary" onclick="enhancedGraphLoader.loadGraphWithStrategies('${graphName}')">
                            🔄 Try Loading Here Again
                        </button>
                        <button class="btn secondary" onclick="enhancedGraphLoader.loadRandomGraph()">
                            🎲 Load Random Graph
                        </button>
                    </div>
                </div>
            `;
            viewer.appendChild(message);
            return true;
        }
        return false;
    }

    async loadWithFetch(graphName, viewer) {
        try {
            // Check if file exists first
            const headResponse = await fetch(`graphs/${graphName}`, { method: 'HEAD' });
            if (!headResponse.ok) {
                return false;
            }

            // Fetch the content
            const response = await fetch(`graphs/${graphName}`);
            if (!response.ok) {
                return false;
            }

            const htmlContent = await response.text();
            
            // Create a container for the content
            this.clearViewer(viewer);
            const container = document.createElement('div');
            container.className = 'graph-content-container';
            container.style.cssText = `
                width: 100%;
                height: 100%;
                flex: 1;
                overflow: auto;
                background: white;
                border-radius: 8px;
                position: relative;
                min-height: 600px;
            `;

            // Create iframe with data URL to avoid CORS issues
            const iframe = document.createElement('iframe');
            iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                min-height: 600px;
            `;
            
            const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
            iframe.src = dataUrl;

            container.appendChild(iframe);
            viewer.appendChild(container);
            this.addEnhancedTools(viewer, graphName);

            return true;
        } catch (error) {
            console.error('Fetch strategy failed:', error);
            return false;
        }
    }

    showEnhancedLoading(viewer, graphName) {
        this.clearViewer(viewer);
        const loading = document.createElement('div');
        loading.className = 'enhanced-graph-loading';
        loading.innerHTML = `
            <div class="enhanced-loading-content">
                <div class="loading-spinner-container">
                    <div class="loading-spinner"></div>
                    <div class="loading-pulse"></div>
                </div>
                <h3>🔄 Loading Graph: ${graphName}</h3>
                <p>Trying multiple loading strategies for optimal performance...</p>
                <div class="loading-strategies">
                    <div class="strategy-item active">📱 IFrame Loading</div>
                    <div class="strategy-item">🚀 Window Loading</div>
                    <div class="strategy-item">📥 Direct Fetch</div>
                </div>
                <div class="loading-tips">
                    <p><small>💡 Large graph files may take a moment to load completely</small></p>
                </div>
            </div>
        `;
        viewer.appendChild(loading);

        // Animate strategy indicators
        let currentStrategy = 0;
        const strategies = loading.querySelectorAll('.strategy-item');
        const strategyInterval = setInterval(() => {
            strategies.forEach(s => s.classList.remove('active'));
            strategies[currentStrategy % strategies.length].classList.add('active');
            currentStrategy++;
        }, 3000);

        // Store interval for cleanup
        loading.dataset.intervalId = strategyInterval;
    }

    showEnhancedError(viewer, graphName) {
        this.clearViewer(viewer);
        const error = document.createElement('div');
        error.className = 'enhanced-graph-error';
        error.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Unable to Load Graph</h3>
                <p><strong>File:</strong> ${graphName}</p>
                <p>We tried multiple loading strategies but couldn't display this graph in the embedded viewer.</p>
                
                <div class="error-solutions">
                    <h4>🔧 Try These Solutions:</h4>
                    <div class="solution-options">
                        <button class="btn primary" onclick="enhancedGraphLoader.openDirectly('${graphName}')">
                            🌐 Open in Browser
                        </button>
                        <button class="btn secondary" onclick="enhancedGraphLoader.downloadGraph('${graphName}')">
                            💾 Download File
                        </button>
                        <button class="btn" onclick="location.reload()">
                            🔄 Refresh Page
                        </button>
                    </div>
                </div>

                <div class="error-info">
                    <details>
                        <summary>📋 Technical Information</summary>
                        <ul>
                            <li>Graph files work best when opened directly in browser</li>
                            <li>Some browsers block embedded content for security</li>
                            <li>Large Plotly.js graphs may exceed iframe limits</li>
                            <li>File location: /graphs/${graphName}</li>
                        </ul>
                    </details>
                </div>
            </div>
        `;
        viewer.appendChild(error);
    }

    openDirectly(graphName) {
        const fullPath = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}/graphs/${graphName}`;
        window.open(fullPath, '_blank', 'noopener,noreferrer');
    }

    downloadGraph(graphName) {
        const link = document.createElement('a');
        link.href = `graphs/${graphName}`;
        link.download = graphName;
        link.click();
    }

    loadRandomGraph() {
        // Get a random graph from available graphs
        const graphs = [
            '1006_adjacency.html', '1007_adjacency.html', '1008_adjacency.html',
            '263_adjacency.html', '2_adjacency.html', '315_adjacency.html'
        ];
        const randomGraph = graphs[Math.floor(Math.random() * graphs.length)];
        this.loadGraphWithStrategies(randomGraph);
    }

    clearViewer(viewer) {
        // Clear any running intervals
        const loadingElement = viewer.querySelector('.enhanced-graph-loading');
        if (loadingElement && loadingElement.dataset.intervalId) {
            clearInterval(parseInt(loadingElement.dataset.intervalId));
        }
        
        viewer.innerHTML = '';
    }

    addEnhancedTools(viewer, graphName) {
        const tools = document.createElement('div');
        tools.className = 'enhanced-graph-tools';
        tools.innerHTML = `
            <div class="graph-info-bar">
                <span class="graph-name">📊 ${graphName}</span>
                <div class="graph-tools-buttons">
                    <button class="tool-btn" onclick="enhancedGraphLoader.openDirectly('${graphName}')" title="Open in New Tab">
                        🚀 External
                    </button>
                    <button class="tool-btn" onclick="enhancedGraphLoader.downloadGraph('${graphName}')" title="Download">
                        💾 Save
                    </button>
                    <button class="tool-btn" onclick="enhancedGraphLoader.loadGraphWithStrategies('${graphName}')" title="Reload">
                        🔄 Reload
                    </button>
                </div>
            </div>
        `;
        viewer.appendChild(tools);
    }

    updateSuccessMetadata(graphName, strategy) {
        // Store successful strategy for future use
        localStorage.setItem(`graph_strategy_${graphName}`, strategy);
        
        // Update metadata
        let metadata = document.querySelector('.graph-metadata');
        if (!metadata) {
            metadata = document.createElement('div');
            metadata.className = 'graph-metadata';
            const container = document.querySelector('.graph-container');
            container?.appendChild(metadata);
        }

        metadata.innerHTML = `
            <div class="metadata-content">
                <h3>✅ Successfully Loaded: ${graphName}</h3>
                <div class="metadata-details">
                    <span class="metadata-item">📊 <strong>Graph:</strong> ${graphName}</span>
                    <span class="metadata-item">🔧 <strong>Method:</strong> ${strategy} loading</span>
                    <span class="metadata-item">⚡ <strong>Status:</strong> Interactive</span>
                </div>
                <p><small>💡 You can pan, zoom, and interact with the visualization above</small></p>
            </div>
        `;
    }
}

// CSS styles for enhanced loading
const enhancedStyles = `
.enhanced-graph-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    padding: 2rem;
}

.enhanced-loading-content {
    text-align: center;
    max-width: 400px;
}

.loading-spinner-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1.5rem;
}

.loading-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.loading-strategies {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0;
    flex-wrap: wrap;
}

.strategy-item {
    padding: 0.5rem 1rem;
    background: white;
    border-radius: 20px;
    font-size: 0.9rem;
    opacity: 0.5;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.strategy-item.active {
    opacity: 1;
    background: #3b82f6;
    color: white;
    transform: scale(1.05);
}

.enhanced-graph-error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    background: linear-gradient(135deg, #fef3f2 0%, #fecaca 50%, #fef3f2 100%);
    border-radius: 12px;
    padding: 2rem;
}

.error-content {
    text-align: center;
    max-width: 500px;
    color: #991b1b;
}

.error-solutions {
    margin: 2rem 0;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    border-left: 4px solid #f59e0b;
}

.solution-options {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 1rem;
}

.error-info {
    margin-top: 1.5rem;
    text-align: left;
}

.error-info details {
    background: rgba(255, 255, 255, 0.8);
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid #f3f4f6;
}

.error-info summary {
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.graph-external-window {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
    border-radius: 12px;
    padding: 2rem;
}

.external-window-info {
    text-align: center;
    max-width: 400px;
    color: #1e40af;
}

.external-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
    flex-wrap: wrap;
}

.enhanced-graph-tools {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
}

.graph-info-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.95);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.graph-name {
    font-weight: bold;
    color: #374151;
    font-size: 0.9rem;
}

.graph-tools-buttons {
    display: flex;
    gap: 0.5rem;
}

.tool-btn {
    padding: 0.3rem 0.6rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.2s;
}

.tool-btn:hover {
    background: #2563eb;
}

.metadata-content {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 8px;
    border-left: 4px solid #10b981;
    margin-top: 1rem;
}

.metadata-details {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
}

.metadata-item {
    background: white;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    border: 1px solid #e5e7eb;
}

@keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
`;

// Inject CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedStyles;
document.head.appendChild(styleSheet);

// Initialize the enhanced graph loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.enhancedGraphLoader = new EnhancedGraphLoader();
    console.log('Enhanced Graph Loader ready');
});