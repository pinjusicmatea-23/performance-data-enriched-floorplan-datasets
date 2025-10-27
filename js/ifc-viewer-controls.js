// Simple IFC Viewer Controls for IAAC Dataset
// Enhanced controls for iframe-based Simple Web-IFC viewer

function sendIFCCommand(action, parameter = null) {
    console.log('Sending IFC command:', action, parameter);
    
    const iframe = document.getElementById('ifc-viewer-frame');
    if (!iframe || !iframe.contentWindow) {
        console.error('IFC viewer iframe not found or not ready');
        showNotification('IFC viewer not ready. Please wait...', 'error');
        return;
    }
    
    try {
        // Send command to the iframe
        const message = {
            action: action,
            parameter: parameter,
            timestamp: Date.now()
        };
        
        iframe.contentWindow.postMessage(message, '*');
        
        // Provide user feedback
        const actionText = parameter ? `${action}: ${parameter}` : action;
        showNotification(`Command sent: ${actionText}`, 'info');
        
    } catch (error) {
        console.error('Error sending IFC command:', error);
        showNotification('Failed to send command to IFC viewer', 'error');
    }
}

// Direct function calls that work with the simple viewer
function loadIFCModel(filename) {
    sendIFCCommand('loadModel', filename);
}

function resetIFCView() {
    sendIFCCommand('resetCamera');
}

function fitIFCView() {
    sendIFCCommand('fitToView');
}

function createDemoBuilding() {
    sendIFCCommand('createDemoBuilding');
}

function loadRandomIFC() {
    sendIFCCommand('loadRandomModel');
}

function loadRandomIFC() {
    sendIFCCommand('loadRandomModel');
}

// Listen for messages from the IFC viewer iframe
window.addEventListener('message', function(event) {
    if (event.data && event.data.action) {
        switch (event.data.action) {
            case 'ifcViewerReady':
                console.log('IFC Viewer ready:', event.data.metadata);
                showNotification('Simple IFC Viewer ready!', 'success');
                break;
                
            case 'modelLoaded':
                console.log('IFC Model loaded:', event.data.filename);
                showNotification(`Model loaded: ${event.data.filename}`, 'success');
                break;
                
            case 'modelError':
                console.error('IFC Model error:', event.data.error);
                showNotification(`Model error: ${event.data.error}`, 'error');
                break;
                
            case 'demoCreated':
                console.log('Demo building created');
                showNotification('Demo building created successfully!', 'success');
                break;
                
            default:
                console.log('IFC Viewer message:', event.data);
        }
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification-popup');
    existing.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification-popup notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 350px;
        font-size: 14px;
        animation: slideInRight 0.3s ease-out;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    return icons[type] || '📋';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#28a745',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#17a2b8'
    };
    return colors[type] || '#6c757d';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple IFC Viewer controls initialized');
    
    // Wait for iframe to load, then automatically create demo building
    const iframe = document.getElementById('ifc-viewer-frame');
    if (iframe) {
        const checkIframeReady = () => {
            try {
                // Try to send a test message
                if (iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        action: 'createDemoBuilding',
                        timestamp: Date.now()
                    }, '*');
                    
                    setTimeout(() => {
                        showNotification('Demo building loaded! Try clicking other model buttons.', 'success');
                    }, 3000);
                }
            } catch (e) {
                // Iframe not ready yet, try again
                setTimeout(checkIframeReady, 1000);
            }
        };
        
        // Wait for iframe to load
        iframe.addEventListener('load', () => {
            setTimeout(checkIframeReady, 1000);
        });
    }
    
    // Show initial instruction
    setTimeout(() => {
        showNotification('IFC Viewer loading... Demo building will appear automatically!', 'info');
    }, 500);
});

// Export functions for global access
window.sendIFCCommand = sendIFCCommand;
window.loadIFCModel = loadIFCModel;
window.resetIFCView = resetIFCView;
window.fitIFCView = fitIFCView;
window.createDemoBuilding = createDemoBuilding;
window.loadRandomIFC = loadRandomIFC;