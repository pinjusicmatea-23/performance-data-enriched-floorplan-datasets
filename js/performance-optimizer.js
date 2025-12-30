// Performance Optimization for Large File Loading
class PerformanceOptimizer {
    constructor() {
        this.memoryUsage = 0;
        this.loadingQueue = [];
        this.maxConcurrentLoads = 2;
        this.currentLoads = 0;
        this.init();
    }

    init() {
        this.monitorPerformance();
        this.optimizeMemory();
        // this.addPerformanceHints(); // Disabled performance tips popup
    }

    monitorPerformance() {
        // Memory monitoring disabled per user request
        // Monitor loading performance
        window.addEventListener('beforeunload', () => {
            this.clearLoadingQueue();
        });
    }

    checkMemoryWarnings() {
        // Disabled - no memory warnings
    }

    showMemoryWarning() {
        // Disabled - no memory warnings or popups
    }

    optimizeMemory() {
        // Clear cached data periodically
        setInterval(() => {
            this.garbageCollect();
        }, 60000); // Every minute
    }

    garbageCollect() {
        // Disabled iframe removal to prevent graphs from disappearing
        // Only remove iframes explicitly marked for removal
        const explicitRemovalTargets = document.querySelectorAll('iframe.remove-me');
        explicitRemovalTargets.forEach(iframe => {
            if (iframe.parentNode) {
                iframe.remove();
            }
        });

        // Clear console less frequently
        if (console.clear && this.memoryUsage > 500) {
            console.clear();
        }
    }

    addPerformanceHints() {
        // Add performance hints to the page
        const hintsContainer = document.createElement('div');
        hintsContainer.className = 'performance-hints';
        hintsContainer.innerHTML = `
            <div class="hints-toggle" onclick="this.parentElement.classList.toggle('expanded')">
                ⚡ Performance Tips
            </div>
            <div class="hints-content">
                <h4>Optimize Loading Performance:</h4>
                <ul>
                    <li>Close unused browser tabs to free memory</li>
                    <li>Large IFC models (>50MB) may take 2-5 minutes to load</li>
                    <li>Graph files with complex visualizations load slower</li>
                    <li>Use Chrome or Firefox for best performance</li>
                    <li>Ensure stable internet connection for online models</li>
                </ul>
                <div class="current-memory">
                    Memory Usage: <span id="memory-display">--</span> MB
                </div>
            </div>
        `;

        hintsContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            max-width: 350px;
            transition: all 0.3s ease;
        `;

        // Add styles for the hints
        const hintsStyle = document.createElement('style');
        hintsStyle.textContent = `
            .performance-hints {
                font-size: 0.9rem;
            }
            .hints-toggle {
                padding: 0.75rem 1rem;
                cursor: pointer;
                font-weight: 600;
                border-radius: 8px;
            }
            .hints-toggle:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
            .hints-content {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                padding: 0 1rem;
            }
            .performance-hints.expanded .hints-content {
                max-height: 300px;
                padding: 0 1rem 1rem;
            }
            .hints-content h4 {
                margin: 0.5rem 0;
                color: #f8f9fa;
            }
            .hints-content ul {
                margin: 0;
                padding-left: 1.2rem;
                line-height: 1.4;
            }
            .hints-content li {
                margin-bottom: 0.3rem;
            }
            .current-memory {
                margin-top: 0.75rem;
                padding: 0.5rem;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                font-family: monospace;
                font-size: 0.8rem;
            }
        `;
        document.head.appendChild(hintsStyle);
        document.body.appendChild(hintsContainer);

        // Update memory display
        setInterval(() => {
            const memoryDisplay = document.getElementById('memory-display');
            if (memoryDisplay && performance.memory) {
                const usage = performance.memory.usedJSHeapSize / 1024 / 1024;
                memoryDisplay.textContent = Math.round(usage);
                
                // Color code based on usage
                if (usage > 200) {
                    memoryDisplay.style.color = '#ff6b6b';
                } else if (usage > 100) {
                    memoryDisplay.style.color = '#ffd93d';
                } else {
                    memoryDisplay.style.color = '#6bcf7f';
                }
            }
        }, 2000);
    }

    queueLoad(loadFunction, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const loadItem = {
                loadFunction,
                priority,
                resolve,
                reject,
                timestamp: Date.now()
            };

            this.loadingQueue.push(loadItem);
            this.processQueue();
        });
    }

    processQueue() {
        if (this.currentLoads >= this.maxConcurrentLoads || this.loadingQueue.length === 0) {
            return;
        }

        // Sort by priority and timestamp
        this.loadingQueue.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return a.timestamp - b.timestamp;
        });

        const loadItem = this.loadingQueue.shift();
        this.currentLoads++;

        loadItem.loadFunction()
            .then(result => {
                loadItem.resolve(result);
            })
            .catch(error => {
                loadItem.reject(error);
            })
            .finally(() => {
                this.currentLoads--;
                setTimeout(() => this.processQueue(), 100); // Small delay
            });
    }

    clearLoadingQueue() {
        this.loadingQueue.forEach(item => {
            item.reject(new Error('Loading cancelled due to page unload'));
        });
        this.loadingQueue = [];
    }

    // Helper method to estimate loading time
    estimateLoadTime(fileSize, fileType) {
        // Base loading times in seconds
        const baseTime = {
            'graph': 5,
            'ifc': 30,
            'image': 2
        };

        const sizeMultiplier = Math.max(1, fileSize / (1024 * 1024)); // File size in MB
        const base = baseTime[fileType] || 10;
        
        return Math.round(base * sizeMultiplier);
    }

    // Method to provide loading tips based on file type and size
    getLoadingTips(fileType, fileSize = 0) {
        const tips = {
            graph: [
                "Graph files with Plotly.js may take longer to render",
                "Close other browser tabs to improve performance",
                "Try refreshing if the graph doesn't load after 30 seconds"
            ],
            ifc: [
                "Large IFC models require significant processing time",
                "Ensure you have at least 4GB available RAM",
                "Consider using IFC files under 100MB for faster loading",
                "Complex geometries will take longer to process"
            ],
            general: [
                "Check your internet connection",
                "Close unnecessary browser tabs",
                "Try using a different browser if issues persist"
            ]
        };

        return tips[fileType] || tips.general;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for use in other scripts
window.PerformanceOptimizer = PerformanceOptimizer;