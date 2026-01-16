// Automatic Graph Detection and Management
class GraphManager {
    constructor() {
        this.graphs = [
            // Adjacency graphs (current files)
            { filename: '3_adjacency.html', title: 'Building 3 Adjacency', description: 'Spatial relationship graph for building 3', type: 'adjacency', icon: '🔗' },
            { filename: '15_adjacency.html', title: 'Building 15 Adjacency', description: 'Spatial relationship graph for building 15', type: 'adjacency', icon: '📊' },
            { filename: '16_adjacency.html', title: 'Building 16 Adjacency', description: 'Spatial relationship graph for building 16', type: 'adjacency', icon: '🔗' },
            { filename: '17_adjacency.html', title: 'Building 17 Adjacency', description: 'Spatial relationship graph for building 17', type: 'adjacency', icon: '📊' },
            { filename: '22_adjacency.html', title: 'Building 22 Adjacency', description: 'Spatial relationship graph for building 22', type: 'adjacency', icon: '🔗' },
            { filename: '29_adjacency.html', title: 'Building 29 Adjacency', description: 'Spatial relationship graph for building 29', type: 'adjacency', icon: '📊' },
            { filename: '34_adjacency.html', title: 'Building 34 Adjacency', description: 'Spatial relationship graph for building 34', type: 'adjacency', icon: '🔗' },
            { filename: '47_adjacency.html', title: 'Building 47 Adjacency', description: 'Spatial relationship graph for building 47', type: 'adjacency', icon: '📊' },
            { filename: '68_adjacency.html', title: 'Building 68 Adjacency', description: 'Spatial relationship graph for building 68', type: 'adjacency', icon: '🔗' },
            { filename: '69_adjacency.html', title: 'Building 69 Adjacency', description: 'Spatial relationship graph for building 69', type: 'adjacency', icon: '📊' },
            { filename: '70_adjacency.html', title: 'Building 70 Adjacency', description: 'Spatial relationship graph for building 70', type: 'adjacency', icon: '🔗' },
            { filename: '81_adjacency.html', title: 'Building 81 Adjacency', description: 'Spatial relationship graph for building 81', type: 'adjacency', icon: '📊' },
            { filename: '89_adjacency.html', title: 'Building 89 Adjacency', description: 'Spatial relationship graph for building 89', type: 'adjacency', icon: '🔗' },
            { filename: '124_adjacency.html', title: 'Building 124 Adjacency', description: 'Spatial relationship graph for building 124', type: 'adjacency', icon: '📊' },
            { filename: '127_adjacency.html', title: 'Building 127 Adjacency', description: 'Spatial relationship graph for building 127', type: 'adjacency', icon: '🔗' },
            { filename: '128_adjacency.html', title: 'Building 128 Adjacency', description: 'Spatial relationship graph for building 128', type: 'adjacency', icon: '📊' },
            { filename: '130_adjacency.html', title: 'Building 130 Adjacency', description: 'Spatial relationship graph for building 130', type: 'adjacency', icon: '🔗' },
            { filename: '131_adjacency.html', title: 'Building 131 Adjacency', description: 'Spatial relationship graph for building 131', type: 'adjacency', icon: '📊' },
            { filename: '132_adjacency.html', title: 'Building 132 Adjacency', description: 'Spatial relationship graph for building 132', type: 'adjacency', icon: '🔗' },
            { filename: '150_adjacency.html', title: 'Building 150 Adjacency', description: 'Spatial relationship graph for building 150', type: 'adjacency', icon: '📊' },
            
            // Circulation graphs
            { filename: '3_circulation.html', title: 'Building 3 Circulation', description: 'Circulation flow graph for building 3', type: 'circulation', icon: '🔄' },
            { filename: '15_circulation.html', title: 'Building 15 Circulation', description: 'Circulation flow graph for building 15', type: 'circulation', icon: '🔄' },
            { filename: '16_circulation.html', title: 'Building 16 Circulation', description: 'Circulation flow graph for building 16', type: 'circulation', icon: '🔄' },
            { filename: '17_circulation.html', title: 'Building 17 Circulation', description: 'Circulation flow graph for building 17', type: 'circulation', icon: '🔄' },
            { filename: '22_circulation.html', title: 'Building 22 Circulation', description: 'Circulation flow graph for building 22', type: 'circulation', icon: '🔄' },
            { filename: '29_circulation.html', title: 'Building 29 Circulation', description: 'Circulation flow graph for building 29', type: 'circulation', icon: '🔄' },
            { filename: '34_circulation.html', title: 'Building 34 Circulation', description: 'Circulation flow graph for building 34', type: 'circulation', icon: '🔄' },
            { filename: '47_circulation.html', title: 'Building 47 Circulation', description: 'Circulation flow graph for building 47', type: 'circulation', icon: '🔄' },
            { filename: '68_circulation.html', title: 'Building 68 Circulation', description: 'Circulation flow graph for building 68', type: 'circulation', icon: '🔄' },
            { filename: '69_circulation.html', title: 'Building 69 Circulation', description: 'Circulation flow graph for building 69', type: 'circulation', icon: '🔄' },
            { filename: '70_circulation.html', title: 'Building 70 Circulation', description: 'Circulation flow graph for building 70', type: 'circulation', icon: '🔄' },
            { filename: '92_circulation.html', title: 'Building 92 Circulation', description: 'Circulation flow graph for building 92', type: 'circulation', icon: '🔄' },
            { filename: '116_circulation.html', title: 'Building 116 Circulation', description: 'Circulation flow graph for building 116', type: 'circulation', icon: '🔄' },
            { filename: '124_circulation.html', title: 'Building 124 Circulation', description: 'Circulation flow graph for building 124', type: 'circulation', icon: '🔄' },
            { filename: '127_circulation.html', title: 'Building 127 Circulation', description: 'Circulation flow graph for building 127', type: 'circulation', icon: '🔄' },
            { filename: '128_circulation.html', title: 'Building 128 Circulation', description: 'Circulation flow graph for building 128', type: 'circulation', icon: '🔄' },
            { filename: '130_circulation.html', title: 'Building 130 Circulation', description: 'Circulation flow graph for building 130', type: 'circulation', icon: '🔄' },
            { filename: '131_circulation.html', title: 'Building 131 Circulation', description: 'Circulation flow graph for building 131', type: 'circulation', icon: '🔄' },
            { filename: '132_circulation.html', title: 'Building 132 Circulation', description: 'Circulation flow graph for building 132', type: 'circulation', icon: '🔄' },
            { filename: '150_circulation.html', title: 'Building 150 Circulation', description: 'Circulation flow graph for building 150', type: 'circulation', icon: '🔄' }
        ];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.enhanceGraphViewer();
        this.createGraphControls();
        this.updateGraphSection();
    }

    enhanceGraphViewer() {
        // Enhance the existing graph viewer with our graph collection
        if (window.graphViewer) {
            window.graphViewer.graphManager = this;
        }

        // Add global functions for graph management
        window.loadRandomGraph = () => this.loadRandomGraph();
        window.filterGraphs = (category) => this.filterGraphs(category);
        window.searchGraphs = (query) => this.searchGraphs(query);
    }

    createGraphControls() {
        const graphContainer = document.querySelector('.graph-container');
        if (!graphContainer) return;

        // Check if controls already exist to prevent duplicates
        const existingControls = document.querySelector('.graph-selection-controls');
        if (existingControls) {
            existingControls.remove();
        }

        // Add graph selection and filtering controls
        const controlsHTML = `
            <div class="graph-selection-controls">
                <div class="graph-search">
                    <input type="text" id="graph-search" placeholder="Search graphs by building number..." 
                           onkeyup="graphManager.searchGraphs(this.value)">
                </div>
                <div class="graph-quick-actions">
                    <button class="btn" onclick="loadRandomGraph()">Load Random Graph</button>
                    <button class="btn secondary" onclick="graphManager.showGraphList()">Browse All</button>
                </div>
            </div>
        `;

        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = controlsHTML;
        graphContainer.insertBefore(controlsDiv, graphContainer.firstChild);
    }

    updateGraphSection() {
        // Disabled to remove empty frames and controls
        // const graphControls = document.querySelector('.graph-controls');
        // if (graphControls) {
        //     graphControls.innerHTML = ``;
        // }
    }

    getGraphsByType(type) {
        return this.graphs.filter(graph => graph.type === type);
    }

    filterGraphs(category) {
        this.currentCategory = category;
        const filteredGraphs = category === 'all' ? this.graphs : this.getGraphsByType(category);
        
        // Update category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Show filtered graph list
        this.showGraphList(filteredGraphs);
    }

    searchGraphs(query) {
        if (!query.trim()) {
            this.showGraphList();
            return;
        }

        const filteredGraphs = this.graphs.filter(graph => 
            graph.title.toLowerCase().includes(query.toLowerCase()) ||
            graph.filename.toLowerCase().includes(query.toLowerCase()) ||
            graph.description.toLowerCase().includes(query.toLowerCase())
        );

        this.showGraphList(filteredGraphs);
    }

    loadRandomGraph() {
        const availableGraphs = this.currentCategory === 'all' 
            ? this.graphs 
            : this.getGraphsByType(this.currentCategory);
        
        const randomGraph = availableGraphs[Math.floor(Math.random() * availableGraphs.length)];
        
        if (window.loadGraph) {
            // Show performance tips for large graphs
            if (window.performanceOptimizer) {
                const tips = window.performanceOptimizer.getLoadingTips('graph');
                // this.showNotification(`Loading: ${randomGraph.title}<br><br><strong>Tips:</strong> ${tips[0]}`, 'info', 5000); // Disabled popup
            } else {
                // this.showNotification(`Loading: ${randomGraph.title}`, 'info'); // Disabled popup
            }
            
            window.loadGraph(randomGraph.filename);
        }
    }

    showGraphList(graphs = null) {
        const displayGraphs = graphs || this.graphs;
        
        const listHTML = `
            <div class="graph-list-modal">
                <div class="graph-list-content">
                    <div class="graph-list-header">
                        <h3>Available Graphs (${displayGraphs.length})</h3>
                        <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                    </div>
                    <div class="graph-list-grid">
                        ${displayGraphs.map(graph => `
                            <div class="graph-list-item" onclick="console.log('Clicking graph:', '${graph.filename}'); loadGraph('${graph.filename}'); this.closest('.graph-list-modal').remove();">
                                ${graph.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.querySelector('.graph-list-modal');
        if (existingModal) existingModal.remove();

        // Add new modal
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = listHTML;
        document.body.appendChild(modalDiv);
    }

    showGraphInfo() {
        const info = `
            <div style="text-align: left;">
                <h4>Graph Collection Overview</h4>
                <p><strong>Total Graphs:</strong> ${this.graphs.length}</p>
                <p><strong>Adjacency Graphs:</strong> ${this.getGraphsByType('adjacency').length}</p>
                <p><strong>Sample Graphs:</strong> ${this.getGraphsByType('sample').length}</p>
                <hr style="margin: 1rem 0;">
                <p><strong>Graph Types:</strong></p>
                <ul>
                    <li><strong>Adjacency:</strong> Show spatial relationships between rooms/spaces</li>
                    <li><strong>Interactive:</strong> Pan, zoom, and explore with mouse/touch</li>
                    <li><strong>Responsive:</strong> Optimized for all screen sizes</li>
                </ul>
                <hr style="margin: 1rem 0;">
                <p><strong>Navigation Tips:</strong></p>
                <ul>
                    <li>Click and drag to pan</li>
                    <li>Scroll to zoom in/out</li>
                    <li>Use controls for reset and fullscreen</li>
                </ul>
            </div>
        `;

        this.showNotification(info, 'info', 10000);
    }

    toggleFullscreen() {
        const viewer = document.getElementById('graph-viewer');
        if (!document.fullscreenElement) {
            viewer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    getGraphByFilename(filename) {
        return this.graphs.find(g => g.filename === filename);
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.graph-notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `graph-notification graph-notification-${type}`;
        notification.innerHTML = message;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        notification.addEventListener('click', function() {
            this.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => this.remove(), 300);
        });
    }
}

// Enhanced Graph Viewer with collection management
class EnhancedGraphViewer extends GraphViewer {
    constructor() {
        super();
        this.graphManager = new GraphManager();
        this.setupGraphManagement();
    }

    setupGraphManagement() {
        // Override loadGraph to provide better feedback
        const originalLoadGraph = window.loadGraph;
        window.loadGraph = (graphName) => {
            const graph = this.graphManager.getGraphByFilename(graphName);
            if (graph) {
                // this.graphManager.showNotification(`Loading: ${graph.title}`, 'info'); // Disabled popup notification
                // this.updateGraphMetadata(graph); // Disabled metadata display
            }
            originalLoadGraph(graphName);
        };
    }

    updateGraphMetadata(graph) {
        // Disabled - remove any existing metadata
        const metadata = document.querySelector('.graph-metadata');
        if (metadata) {
            metadata.remove();
        }
    }
}

// Initialize enhanced graph viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Replace the basic graph viewer with enhanced version
    window.graphViewer = new EnhancedGraphViewer();
    window.graphManager = new GraphManager();
});

// Export for use in other scripts
window.GraphManager = GraphManager;
window.EnhancedGraphViewer = EnhancedGraphViewer;