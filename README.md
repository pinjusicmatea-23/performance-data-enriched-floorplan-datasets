# Architectural Dataset Website

A modern, responsive website for sharing and visualizing architectural datasets with interactive features and comprehensive documentation.

## 🏗️ Features

- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🍔 Hamburger Menu** - Responsive navigation with smooth animations
- **📊 Interactive Graphs** - Pan, zoom, and rotate HTML-based visualizations
- **🏗️ IFC Model Viewer** - 3D building models with full navigation and inspection tools
- **⬇️ Dataset Downloads** - Easy access to dataset files with download tracking
- **📚 Documentation** - Comprehensive guides for data usage and citations
- **📝 Blog System** - News, updates, and insights about the dataset
- **🔗 Source References** - Detailed attribution and external links
- **♿ Accessibility** - WCAG compliant with keyboard navigation support

## 📁 Project Structure

```
web/
├── index.html              # Main homepage
├── css/                    # Stylesheets
│   ├── styles.css          # Main site styles
│   ├── menu.css            # Hamburger menu styles
│   └── graph-viewer.css    # Interactive graph viewer styles
├── js/                     # JavaScript files
│   ├── main.js             # Core functionality
│   ├── menu.js             # Menu interactions
│   └── graph-viewer.js     # Graph viewer logic
├── pages/                  # Content pages
│   ├── blog.html           # Blog with posts and updates
│   ├── sources.html        # References and external links
│   └── data-usage.html     # Citation guidelines and terms
├── datasets/               # Dataset files for download
│   ├── full-dataset.zip    # Complete dataset archive
│   ├── sample-data.csv     # Sample subset for testing
│   └── documentation.pdf   # Data documentation
├── graphs/                 # Interactive HTML graphs
│   └── (place your graph files here)
├── models/                 # IFC building models
│   ├── sample-building.ifc # Sample IFC model
│   └── (place your IFC files here)
└── .github/
    └── copilot-instructions.md
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for development)

### Installation
1. **Clone or download** this repository to your local machine
2. **Open the project** in VS Code or your preferred editor
3. **Start a local server** using one of these methods:
   - **VS Code Live Server Extension**: Right-click `index.html` → "Open with Live Server"
   - **Python**: `python -m http.server 8000` (Python 3) or `python -m SimpleHTTPServer 8000` (Python 2)
   - **Node.js**: `npx serve .` or `npx http-server`
   - **PHP**: `php -S localhost:8000`

4. **Open your browser** and navigate to `http://localhost:8000` (or the port shown by your server)

### Adding Your Data

#### 🏗️ IFC Models
1. Place your IFC files in the `/models/` folder
2. The viewer supports `.ifc` and `.ifcxml` formats
3. Models can be loaded via the interface or by drag-and-drop
4. Features include pan, rotate, zoom, wireframe mode, and element selection

#### 📊 Interactive Graphs
1. Place your HTML graph files in the `/graphs/` folder
2. Update the graph loading buttons in `index.html` to reference your files
3. Ensure your graphs support pan/rotate interactions (Three.js, D3.js, etc.)

#### 📁 Dataset Files
1. Add your dataset files to the `/datasets/` folder
2. Update download links in `index.html` to point to your files
3. Replace placeholder files:
   - `full-dataset.zip` - Your complete dataset
   - `sample-data.csv` - Sample data for testing
   - `documentation.pdf` - Your data documentation

#### 📝 Content Updates
1. **Blog Posts**: Edit `pages/blog.html` or add new post entries
2. **Sources**: Update `pages/sources.html` with your references
3. **Data Usage**: Modify `pages/data-usage.html` with your citation requirements
4. **Homepage**: Customize `index.html` with your project details

## 🎨 Customization

### Visual Styling
- **Colors**: Edit CSS custom properties in `/css/styles.css` (`:root` section)
- **Typography**: Update font families and sizes in the CSS files
- **Layout**: Modify grid layouts and spacing in the stylesheets

### Interactive Features
- **Graph Viewer**: Customize `/js/graph-viewer.js` for specific graph types
- **Menu Behavior**: Adjust animations and transitions in `/js/menu.js`
- **Download Tracking**: Add analytics integration in `/js/main.js`

## 📱 Browser Support

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ Internet Explorer (limited support, shows compatibility notice)

## ♿ Accessibility Features

- **Keyboard Navigation** - Full site navigation using keyboard
- **Screen Reader Support** - ARIA labels and semantic HTML
- **Focus Management** - Clear focus indicators and logical tab order
- **Skip Links** - Quick navigation to main content
- **Color Contrast** - WCAG AA compliant color schemes

## 📊 Interactive Graph Requirements

Your HTML graph files should support:
- **Pan**: Click and drag to move the view
- **Zoom**: Mouse wheel or touch gestures
- **Rotate**: Right-click drag or specific touch gestures
- **Reset**: Return to default view position

### Recommended Libraries
- **Three.js** - 3D graphics and interactions (used for IFC viewer)
- **web-ifc-three** - IFC file loading and parsing
- **D3.js** - Data-driven visualizations
- **Plotly.js** - Scientific plotting with built-in interactions
- **Chart.js** - Simple charts with pan/zoom plugins

## 📄 License

This website template is released under the MIT License. You are free to use, modify, and distribute it for both personal and commercial projects.

Your dataset should include its own license terms - update the Data Usage page accordingly.

## 🤝 Contributing

If you find bugs or have suggestions for improvements:
1. Check existing issues on your repository
2. Create a new issue with a clear description
3. Submit pull requests with detailed explanations

## 📞 Support

For questions about this website template:
- **Documentation**: Check this README and the Data Usage page
- **Issues**: Use your repository's issue tracker
- **Email**: Update contact information in the footer

## 🔄 Updates

### Version 1.0.0 (Current)
- ✅ Responsive design with mobile-first approach
- ✅ Interactive graph viewer with fullscreen support
- ✅ Download system with progress tracking
- ✅ Comprehensive documentation pages
- ✅ Accessibility compliance (WCAG AA)
- ✅ Modern JavaScript with ES6+ features
- ✅ Cross-browser compatibility

### Planned Features
- 🔮 Search functionality across content
- 🔮 User comments system for blog posts
- 🔮 Advanced graph filtering and controls
- 🔮 Multi-language support
- 🔮 Dark mode theme option

---

**Ready to share your architectural research with the world! 🏛️**
