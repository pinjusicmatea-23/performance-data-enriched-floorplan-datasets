// Automatic Graph Detection and Management
class GraphManager {
    constructor() {
        this.graphs = [
            { filename: '1006_adjacency.html', title: 'Building 1006 Adjacency', description: 'Spatial relationship graph for building 1006', type: 'adjacency', icon: '🔗' },
            { filename: '1007_adjacency.html', title: 'Building 1007 Adjacency', description: 'Spatial relationship graph for building 1007', type: 'adjacency', icon: '📊' },
            { filename: '1008_adjacency.html', title: 'Building 1008 Adjacency', description: 'Spatial relationship graph for building 1008', type: 'adjacency', icon: '🔗' },
            { filename: '1107_adjacency.html', title: 'Building 1107 Adjacency', description: 'Spatial relationship graph for building 1107', type: 'adjacency', icon: '📊' },
            { filename: '1108_adjacency.html', title: 'Building 1108 Adjacency', description: 'Spatial relationship graph for building 1108', type: 'adjacency', icon: '🔗' },
            { filename: '1109_adjacency.html', title: 'Building 1109 Adjacency', description: 'Spatial relationship graph for building 1109', type: 'adjacency', icon: '📊' },
            { filename: '1111_adjacency.html', title: 'Building 1111 Adjacency', description: 'Spatial relationship graph for building 1111', type: 'adjacency', icon: '🔗' },
            { filename: '263_adjacency.html', title: 'Building 263 Adjacency', description: 'Spatial relationship graph for building 263', type: 'adjacency', icon: '📊' },
            { filename: '2_adjacency.html', title: 'Building 2 Adjacency', description: 'Spatial relationship graph for building 2', type: 'adjacency', icon: '🔗' },
            { filename: '315_adjacency.html', title: 'Building 315 Adjacency', description: 'Spatial relationship graph for building 315', type: 'adjacency', icon: '📊' },
            { filename: '34_adjacency.html', title: 'Building 34 Adjacency', description: 'Spatial relationship graph for building 34', type: 'adjacency', icon: '🔗' },
            { filename: '406_adjacency.html', title: 'Building 406 Adjacency', description: 'Spatial relationship graph for building 406', type: 'adjacency', icon: '📊' },
            { filename: '423_adjacency.html', title: 'Building 423 Adjacency', description: 'Spatial relationship graph for building 423', type: 'adjacency', icon: '🔗' },
            { filename: '424_adjacency.html', title: 'Building 424 Adjacency', description: 'Spatial relationship graph for building 424', type: 'adjacency', icon: '📊' },
            { filename: '425_adjacency.html', title: 'Building 425 Adjacency', description: 'Spatial relationship graph for building 425', type: 'adjacency', icon: '🔗' },
            { filename: '426_adjacency.html', title: 'Building 426 Adjacency', description: 'Spatial relationship graph for building 426', type: 'adjacency', icon: '📊' },
            { filename: '427_adjacency.html', title: 'Building 427 Adjacency', description: 'Spatial relationship graph for building 427', type: 'adjacency', icon: '🔗' },
            { filename: '428_adjacency.html', title: 'Building 428 Adjacency', description: 'Spatial relationship graph for building 428', type: 'adjacency', icon: '📊' },
            { filename: '68_adjacency.html', title: 'Building 68 Adjacency', description: 'Spatial relationship graph for building 68', type: 'adjacency', icon: '🔗' },
            { filename: '69_adjacency.html', title: 'Building 69 Adjacency', description: 'Spatial relationship graph for building 69', type: 'adjacency', icon: '📊' },
            { filename: '70_adjacency.html', title: 'Building 70 Adjacency', description: 'Spatial relationship graph for building 70', type: 'adjacency', icon: '🔗' },
            { filename: '903_adjacency.html', title: 'Building 903 Adjacency', description: 'Spatial relationship graph for building 903', type: 'adjacency', icon: '📊' },
            { filename: '904_adjacency.html', title: 'Building 904 Adjacency', description: 'Spatial relationship graph for building 904', type: 'adjacency', icon: '🔗' },
            { filename: '905_adjacency.html', title: 'Building 905 Adjacency', description: 'Spatial relationship graph for building 905', type: 'adjacency', icon: '📊' },
            { filename: '908_adjacency.html', title: 'Building 908 Adjacency', description: 'Spatial relationship graph for building 908', type: 'adjacency', icon: '🔗' },
            { filename: '909_adjacency.html', title: 'Building 909 Adjacency', description: 'Spatial relationship graph for building 909', type: 'adjacency', icon: '📊' },
            { filename: '910_adjacency.html', title: 'Building 910 Adjacency', description: 'Spatial relationship graph for building 910', type: 'adjacency', icon: '🔗' },
            { filename: '911_adjacency.html', title: 'Building 911 Adjacency', description: 'Spatial relationship graph for building 911', type: 'adjacency', icon: '📊' },
            { filename: '958_adjacency.html', title: 'Building 958 Adjacency', description: 'Spatial relationship graph for building 958', type: 'adjacency', icon: '🔗' },
            { filename: '959_adjacency.html', title: 'Building 959 Adjacency', description: 'Spatial relationship graph for building 959', type: 'adjacency', icon: '📊' },
            { filename: '963_adjacency.html', title: 'Building 963 Adjacency', description: 'Spatial relationship graph for building 963', type: 'adjacency', icon: '🔗' },
            { filename: '970_adjacency.html', title: 'Building 970 Adjacency', description: 'Spatial relationship graph for building 970', type: 'adjacency', icon: '📊' },
            { filename: '971_adjacency.html', title: 'Building 971 Adjacency', description: 'Spatial relationship graph for building 971', type: 'adjacency', icon: '🔗' },
            { filename: '972_adjacency.html', title: 'Building 972 Adjacency', description: 'Spatial relationship graph for building 972', type: 'adjacency', icon: '📊' },
            { filename: '973_adjacency.html', title: 'Building 973 Adjacency', description: 'Spatial relationship graph for building 973', type: 'adjacency', icon: '🔗' },
            { filename: '974_adjacency.html', title: 'Building 974 Adjacency', description: 'Spatial relationship graph for building 974', type: 'adjacency', icon: '📊' },
            { filename: '975_adjacency.html', title: 'Building 975 Adjacency', description: 'Spatial relationship graph for building 975', type: 'adjacency', icon: '🔗' },
            { filename: 'sample-graph.html', title: 'Sample Graph', description: 'Demonstration graph for testing viewer functionality', type: 'sample', icon: '📈' },
            { filename: 'sample-ifc-viewer.html', title: 'IFC Viewer', description: 'Interactive 3D IFC model viewer', type: 'viewer', icon: '🏗️' }
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
                <div class="graph-categories">
                    <button class="category-btn active" onclick="filterGraphs('all')">All Graphs (${this.graphs.length})</button>
                    <button class="category-btn" onclick="filterGraphs('adjacency')">Adjacency (${this.getGraphsByType('adjacency').length})</button>
                    <button class="category-btn" onclick="filterGraphs('sample')">Samples (${this.getGraphsByType('sample').length})</button>
                </div>
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
        // Update the graph controls with our available graphs
        const graphControls = document.querySelector('.graph-controls');
        if (graphControls) {
            graphControls.innerHTML = `
                <button class="btn" onclick="loadGraph('${this.graphs[0].filename}')">Load ${this.graphs[0].title}</button>
                <button class="btn" onclick="loadRandomGraph()">Random Graph</button>
                <button class="btn secondary" onclick="resetView()">Reset View</button>
                <button class="btn secondary" onclick="graphManager.showGraphInfo()">Graph Info</button>
                <button class="btn secondary" onclick="graphManager.toggleFullscreen()">Fullscreen</button>
            `;
        }
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
                this.showNotification(`Loading: ${randomGraph.title}<br><br><strong>Tips:</strong> ${tips[0]}`, 'info', 5000);
            } else {
                this.showNotification(`Loading: ${randomGraph.title}`, 'info');
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
                            <div class="graph-list-item" onclick="loadGraph('${graph.filename}'); this.closest('.graph-list-modal').remove();">
                                <div class="graph-list-icon">${graph.icon}</div>
                                <div class="graph-list-info">
                                    <div class="graph-list-title">${graph.title}</div>
                                    <div class="graph-list-desc">${graph.description}</div>
                                    <div class="graph-list-file">📁 ${graph.filename}</div>
                                </div>
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
                this.graphManager.showNotification(`Loading: ${graph.title}`, 'info');
                this.updateGraphMetadata(graph);
            }
            originalLoadGraph(graphName);
        };
    }

    updateGraphMetadata(graph) {
        let metadata = document.querySelector('.graph-metadata');
        if (!metadata) {
            metadata = document.createElement('div');
            metadata.className = 'graph-metadata';
            const container = document.querySelector('.graph-container');
            container?.appendChild(metadata);
        }

        metadata.innerHTML = `
            <h3>Currently Viewing: ${graph.title}</h3>
            <p><strong>Type:</strong> ${graph.type.charAt(0).toUpperCase() + graph.type.slice(1)} Graph</p>
            <p><strong>Description:</strong> ${graph.description}</p>
            <p><strong>Interactions:</strong> Click and drag to pan, scroll to zoom, right-click and drag to rotate</p>
            <p><strong>File:</strong> /graphs/${graph.filename}</p>
        `;
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