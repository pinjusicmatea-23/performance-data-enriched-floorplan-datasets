// Speckle IFC Viewer Integration
class SpeckleIFCViewer {
    constructor() {
        this.speckleApi = null;
        this.viewer = null;
        this.currentModel = null;
        this.isLoading = false;
        this.init();
    }

    async init() {
        // Check if the required container exists before initializing
        const container = document.getElementById('speckle-viewer-container');
        if (!container) {
            console.log('Speckle viewer container not found - skipping initialization');
            return;
        }
        
        console.log('Initializing Speckle IFC Viewer');
        this.setupSpeckleAPI();
        this.setupViewer();
        this.setupEventListeners();
        await this.loadDefaultModel();
    }

    setupSpeckleAPI() {
        // Initialize Speckle API client
        // For demonstration, we'll simulate Speckle functionality
        // In production, you would use: https://app.speckle.systems/
        
        this.speckleApi = {
            serverUrl: 'https://app.speckle.systems',
            // For the performance data enriched floorplan datasets project
            projectId: 'iaac-thesis-performance-datasets',
            token: null // Would be set via authentication
        };
    }

    setupViewer() {
        // Enhanced viewer setup with Speckle integration capabilities
        this.viewer = {
            container: document.getElementById('speckle-viewer-container'),
            scene: null,
            camera: null,
            renderer: null,
            controls: null,
            loadedObjects: new Map(),
            metadata: new Map()
        };

        this.initThreeJSViewer();
    }

    initThreeJSViewer() {
        const container = this.viewer.container;
        if (!container) return;

        // Scene setup
        this.viewer.scene = new THREE.Scene();
        this.viewer.scene.background = new THREE.Color(0xf5f5f5);

        // Camera setup
        this.viewer.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            2000
        );
        this.viewer.camera.position.set(50, 50, 50);

        // Renderer setup
        this.viewer.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.viewer.renderer.setSize(container.clientWidth, container.clientHeight);
        this.viewer.renderer.shadowMap.enabled = true;
        this.viewer.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.viewer.renderer.domElement);

        // Controls
        this.viewer.controls = new THREE.OrbitControls(this.viewer.camera, this.viewer.renderer.domElement);
        this.viewer.controls.enableDamping = true;
        this.viewer.controls.dampingFactor = 0.05;

        // Lighting for architectural visualization
        this.setupArchitecturalLighting();

        // Start render loop
        this.animate();
    }

    setupArchitecturalLighting() {
        const scene = this.viewer.scene;

        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);

        // Main directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 4096;
        sunLight.shadow.mapSize.height = 4096;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -100;
        sunLight.shadow.camera.right = 100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        scene.add(sunLight);

        // Secondary lights for better architectural visualization
        const light1 = new THREE.DirectionalLight(0xffffff, 0.3);
        light1.position.set(-50, 50, 50);
        scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.2);
        light2.position.set(0, -50, 50);
        scene.add(light2);

        // Add a subtle sky dome for realistic lighting
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 16);
        const skyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB, 
            side: THREE.BackSide 
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(sky);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Speckle-specific events
        window.addEventListener('speckle:modelLoaded', (event) => {
            this.onSpeckleModelLoaded(event.detail);
        });

        window.addEventListener('speckle:objectSelected', (event) => {
            this.onSpeckleObjectSelected(event.detail);
        });

        // Global functions for integration
        window.loadSpeckleModel = (modelId) => this.loadModel(modelId);
        window.loadSpeckleStream = (streamId, commitId) => this.loadStream(streamId, commitId);
        window.exportToSpeckle = () => this.exportToSpeckle();
        window.showPerformanceData = (objectId) => this.showPerformanceData(objectId);
        window.loadIFCModel = (filename) => this.loadIFCFromFile(filename);
        window.loadRandomIFC = () => this.loadRandomIFCModel();
    }

    async loadIFCFromFile(filename) {
        this.showLoading(`Loading IFC model: ${filename}...`);
        try {
            // Clear existing models
            this.clearScene();
            
            // Load the specified IFC file
            await this.loadIFCFile(`../models/${filename}`);
            this.hideLoading();
            this.showNotification(`Successfully loaded: ${filename}`, 'success');
        } catch (error) {
            console.error('Failed to load IFC file:', error);
            this.showError(`Failed to load ${filename}: ${error.message}`);
        }
    }

    async loadRandomIFCModel() {
        const ifcFiles = [
            'sample-building.ifc',
            '1501.ifc',
            '2103.ifc',
            '2131.ifc',
            '3259.ifc',
            '668.ifc',
            '822.ifc'
        ];
        
        const randomFile = ifcFiles[Math.floor(Math.random() * ifcFiles.length)];
        await this.loadIFCFromFile(randomFile);
    }

    clearScene() {
        // Remove existing IFC models
        if (this.ifcModels) {
            this.ifcModels.forEach(model => {
                this.viewer.scene.remove(model);
                if (model.geometry) model.geometry.dispose();
                if (model.material) {
                    if (Array.isArray(model.material)) {
                        model.material.forEach(mat => mat.dispose());
                    } else {
                        model.material.dispose();
                    }
                }
            });
            this.ifcModels = [];
        }
        
        // Remove demo building if it exists
        if (this.currentModel && this.currentModel.name === 'Swiss_Dwelling_Sample_001') {
            this.viewer.scene.remove(this.currentModel);
        }
        
        this.currentModel = null;
    }
    }

    async loadDefaultModel() {
        // Load a real IFC model from the models directory
        this.showLoading('Loading real IFC model from IAAC dataset...');
        
        try {
            // Initialize IFC loader
            this.initIFCLoader();
            
            // Load a sample IFC file
            await this.loadIFCFile('../models/sample-building.ifc');
            this.hideLoading();
            this.showNotification('IFC model loaded successfully! Explore the 3D geometry.', 'success');
        } catch (error) {
            console.error('IFC loading error:', error);
            // Fallback to demo building if IFC loading fails
            this.showLoading('IFC loading failed, creating demo building...');
            await this.simulateSpeckleModelLoad();
            this.hideLoading();
            this.showNotification('Demo building loaded (IFC loader unavailable)', 'warning');
        }
    }

    initIFCLoader() {
        // Initialize the IFC loader if available
        if (typeof IFCLoader !== 'undefined') {
            this.ifcLoader = new IFCLoader();
            this.ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.44/');
            this.ifcModels = [];
            console.log('IFC Loader initialized successfully');
        } else {
            throw new Error('IFC Loader not available');
        }
    }

    async loadIFCFile(url) {
        if (!this.ifcLoader) {
            throw new Error('IFC Loader not initialized');
        }

        return new Promise((resolve, reject) => {
            this.ifcLoader.load(
                url,
                (ifcModel) => {
                    console.log('IFC Model loaded:', ifcModel);
                    
                    // Add the model to the scene
                    this.viewer.scene.add(ifcModel);
                    this.ifcModels.push(ifcModel);
                    this.currentModel = ifcModel;
                    
                    // Position and scale the model appropriately
                    this.processIFCModel(ifcModel);
                    
                    // Fit camera to view the model
                    this.fitToView();
                    
                    resolve(ifcModel);
                },
                (progress) => {
                    const percentage = (progress.loaded / progress.total) * 100;
                    this.updateLoadingProgress(percentage);
                },
                (error) => {
                    console.error('Error loading IFC file:', error);
                    reject(error);
                }
            );
        });
    }

    processIFCModel(ifcModel) {
        // Process the loaded IFC model
        if (!ifcModel) return;

        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(ifcModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        ifcModel.position.copy(center).multiplyScalar(-1);

        // Scale if necessary (some IFC files have unusual units)
        const maxDimension = Math.max(size.x, size.y, size.z);
        if (maxDimension > 200) {
            const scale = 100 / maxDimension;
            ifcModel.scale.setScalar(scale);
        }

        // Add material enhancements for better visualization
        this.enhanceIFCMaterials(ifcModel);

        console.log('IFC Model processed:', {
            center: center,
            size: size,
            maxDimension: maxDimension
        });
    }

    enhanceIFCMaterials(ifcModel) {
        ifcModel.traverse((child) => {
            if (child.isMesh) {
                // Enhance materials for better visualization
                if (child.material) {
                    // Make materials more visible
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                    child.material.side = THREE.DoubleSide;
                    
                    // Add some color variation if material is too plain
                    if (!child.material.color || child.material.color.getHex() === 0xffffff) {
                        const colors = [0xE5E5E5, 0xD0D0D0, 0xC0C0C0, 0xF0F0F0];
                        child.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
                    }
                }
                
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    updateLoadingProgress(percentage) {
        const progressBar = document.querySelector('.loading-progress-bar');
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        const progressText = document.querySelector('.loading-progress-text');
        if (progressText) {
            progressText.textContent = `Loading IFC: ${Math.round(percentage)}%`;
        }
    }

    async simulateSpeckleModelLoad() {
        // Simulate loading the Swiss Dwellings dataset building with performance data
        return new Promise((resolve) => {
            setTimeout(() => {
                this.createPerformanceEnrichedBuilding();
                resolve();
            }, 2000);
        });
    }

    createPerformanceEnrichedBuilding() {
        // Create a building that represents the IAAC thesis dataset
        const buildingGroup = new THREE.Group();
        buildingGroup.name = 'Swiss_Dwelling_Sample_001';

        // Building structure based on the thesis methodology
        this.createBuildingStructure(buildingGroup);
        this.addPerformanceVisualization(buildingGroup);
        this.attachMetadata(buildingGroup);

        this.viewer.scene.add(buildingGroup);
        this.currentModel = buildingGroup;
        this.fitToView();

        // Simulate Speckle metadata
        this.loadPerformanceMetadata(buildingGroup);
    }

    createBuildingStructure(parent) {
        // Create architectural elements based on IFC data structure
        const materials = this.createArchitecturalMaterials();

        // Foundation and structure
        const foundation = this.createFoundation(materials.concrete);
        parent.add(foundation);

        // Floors - representing multi-story Swiss dwelling
        for (let floor = 0; floor < 4; floor++) {
            const floorGroup = this.createFloor(floor, materials);
            parent.add(floorGroup);
        }

        // Roof
        const roof = this.createRoof(materials.roof);
        parent.add(roof);
    }

    createArchitecturalMaterials() {
        return {
            concrete: new THREE.MeshLambertMaterial({ color: 0x888888 }),
            wall: new THREE.MeshLambertMaterial({ color: 0xE5E5E5 }),
            window: new THREE.MeshLambertMaterial({ 
                color: 0x87CEEB, 
                transparent: true, 
                opacity: 0.7 
            }),
            door: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            roof: new THREE.MeshLambertMaterial({ color: 0x654321 }),
            floor: new THREE.MeshLambertMaterial({ color: 0xDEB887 })
        };
    }

    createFoundation(material) {
        const geometry = new THREE.BoxGeometry(25, 2, 20);
        const foundation = new THREE.Mesh(geometry, material);
        foundation.position.y = -1;
        foundation.name = 'Foundation';
        foundation.castShadow = true;
        foundation.receiveShadow = true;
        return foundation;
    }

    createFloor(floorNumber, materials) {
        const floorGroup = new THREE.Group();
        floorGroup.name = `Floor_${floorNumber}`;
        
        const yPosition = floorNumber * 3.5;
        
        // Floor slab
        const floorGeometry = new THREE.BoxGeometry(24, 0.3, 19);
        const floorSlab = new THREE.Mesh(floorGeometry, materials.floor);
        floorSlab.position.y = yPosition;
        floorSlab.castShadow = true;
        floorSlab.receiveShadow = true;
        floorGroup.add(floorSlab);

        // Walls
        this.createWalls(floorGroup, yPosition, materials);
        
        // Windows and doors
        this.createOpenings(floorGroup, yPosition, materials);

        // Add performance data zones
        this.addPerformanceZones(floorGroup, yPosition, floorNumber);

        return floorGroup;
    }

    createWalls(parent, yPosition, materials) {
        const wallHeight = 3;
        
        // Exterior walls
        const walls = [
            { size: [24, wallHeight, 0.3], pos: [0, yPosition + wallHeight/2, 9.5] }, // Front
            { size: [24, wallHeight, 0.3], pos: [0, yPosition + wallHeight/2, -9.5] }, // Back
            { size: [0.3, wallHeight, 19], pos: [11.85, yPosition + wallHeight/2, 0] }, // Right
            { size: [0.3, wallHeight, 19], pos: [-11.85, yPosition + wallHeight/2, 0] }  // Left
        ];

        walls.forEach((wall, index) => {
            const geometry = new THREE.BoxGeometry(...wall.size);
            const mesh = new THREE.Mesh(geometry, materials.wall);
            mesh.position.set(...wall.pos);
            mesh.name = `Wall_Exterior_${index}`;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            parent.add(mesh);
        });

        // Interior walls for room division
        this.createInteriorWalls(parent, yPosition, materials);
    }

    createInteriorWalls(parent, yPosition, materials) {
        const wallHeight = 3;
        
        // Interior partitions based on Swiss dwelling layouts
        const interiorWalls = [
            { size: [0.2, wallHeight, 8], pos: [0, yPosition + wallHeight/2, 2] },
            { size: [8, wallHeight, 0.2], pos: [4, yPosition + wallHeight/2, -2] },
            { size: [0.2, wallHeight, 6], pos: [-6, yPosition + wallHeight/2, -4] }
        ];

        interiorWalls.forEach((wall, index) => {
            const geometry = new THREE.BoxGeometry(...wall.size);
            const mesh = new THREE.Mesh(geometry, materials.wall);
            mesh.position.set(...wall.pos);
            mesh.name = `Wall_Interior_${index}`;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            parent.add(mesh);
        });
    }

    createOpenings(parent, yPosition, materials) {
        // Windows with performance data
        const windows = [
            { pos: [-8, yPosition + 1.5, 9.55], size: [3, 2, 0.1], orientation: 'south' },
            { pos: [8, yPosition + 1.5, 9.55], size: [3, 2, 0.1], orientation: 'south' },
            { pos: [11.9, yPosition + 1.5, 4], size: [0.1, 2, 2], orientation: 'east' },
            { pos: [-11.9, yPosition + 1.5, -4], size: [0.1, 2, 2], orientation: 'west' }
        ];

        windows.forEach((window, index) => {
            const geometry = new THREE.BoxGeometry(...window.size);
            const mesh = new THREE.Mesh(geometry, materials.window);
            mesh.position.set(...window.pos);
            mesh.name = `Window_${index}`;
            mesh.userData = {
                type: 'window',
                orientation: window.orientation,
                performanceData: this.generateWindowPerformanceData(window.orientation)
            };
            parent.add(mesh);
        });

        // Doors
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.5, 0.1),
            materials.door
        );
        door.position.set(0, yPosition + 1.25, 9.55);
        door.name = 'Main_Door';
        door.userData = { type: 'door' };
        parent.add(door);
    }

    createRoof(material) {
        const geometry = new THREE.BoxGeometry(26, 0.5, 21);
        const roof = new THREE.Mesh(geometry, material);
        roof.position.y = 14.5;
        roof.name = 'Roof';
        roof.castShadow = true;
        roof.receiveShadow = true;
        return roof;
    }

    addPerformanceZones(parent, yPosition, floorNumber) {
        // Add colored zones representing performance data
        const zones = [
            { pos: [-6, yPosition + 0.1, 4], size: [6, 0.1, 6], type: 'living', performance: 85 },
            { pos: [6, yPosition + 0.1, 4], size: [6, 0.1, 6], type: 'bedroom', performance: 78 },
            { pos: [0, yPosition + 0.1, -4], size: [8, 0.1, 8], type: 'kitchen', performance: 72 }
        ];

        zones.forEach((zone, index) => {
            const performance = zone.performance;
            const color = this.getPerformanceColor(performance);
            
            const geometry = new THREE.BoxGeometry(...zone.size);
            const material = new THREE.MeshBasicMaterial({ 
                color: color, 
                transparent: true, 
                opacity: 0.3 
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...zone.pos);
            mesh.name = `Zone_${zone.type}_Floor${floorNumber}`;
            mesh.userData = {
                type: 'performanceZone',
                spaceType: zone.type,
                performanceScore: performance,
                floorNumber: floorNumber,
                daylightFactor: performance / 100 * 0.05,
                energyDemand: this.calculateEnergyDemand(zone.type, performance)
            };
            
            parent.add(mesh);
        });
    }

    getPerformanceColor(score) {
        // Color coding based on performance (green = good, red = poor)
        if (score >= 80) return 0x00ff00;
        if (score >= 60) return 0xffff00;
        if (score >= 40) return 0xff8800;
        return 0xff0000;
    }

    generateWindowPerformanceData(orientation) {
        // Generate realistic performance data based on orientation
        const baseData = {
            south: { sunHours: 8.5, radiation: 850 },
            east: { sunHours: 5.2, radiation: 520 },
            west: { sunHours: 5.8, radiation: 580 },
            north: { sunHours: 2.1, radiation: 210 }
        };

        const data = baseData[orientation] || baseData.south;
        
        return {
            orientation: orientation,
            winterSunHours: data.sunHours * 0.6,
            summerSunHours: data.sunHours * 1.4,
            springSunHours: data.sunHours,
            autumnSunHours: data.sunHours * 0.8,
            annualRadiation: data.radiation,
            glareRisk: orientation === 'west' ? 'high' : 'low',
            thermalGain: data.radiation * 0.7
        };
    }

    calculateEnergyDemand(spaceType, performanceScore) {
        const baseEnergyDemand = {
            living: 45,
            bedroom: 35,
            kitchen: 55,
            bathroom: 40
        };

        const base = baseEnergyDemand[spaceType] || 40;
        // Better performance = lower energy demand
        const efficiency = performanceScore / 100;
        return Math.round(base * (2 - efficiency));
    }

    addPerformanceVisualization(parent) {
        // Add visual indicators for the thesis performance data
        this.addEnergyFlowVisualization(parent);
        this.addDaylightAnalysisGrid(parent);
    }

    addEnergyFlowVisualization(parent) {
        // Create visual representation of energy flows
        const energyGroup = new THREE.Group();
        energyGroup.name = 'EnergyFlowVisualization';
        
        // Simplified energy flow arrows
        const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
        
        for (let i = 0; i < 5; i++) {
            const arrowGeometry = new THREE.ConeGeometry(0.2, 1, 8);
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
            arrow.position.set(
                (Math.random() - 0.5) * 20,
                15 + Math.random() * 5,
                (Math.random() - 0.5) * 15
            );
            arrow.rotation.x = Math.PI;
            energyGroup.add(arrow);
        }
        
        parent.add(energyGroup);
    }

    addDaylightAnalysisGrid(parent) {
        // Add analysis grid points showing daylight data
        const gridGroup = new THREE.Group();
        gridGroup.name = 'DaylightAnalysisGrid';
        
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
        
        for (let x = -10; x <= 10; x += 2) {
            for (let z = -8; z <= 8; z += 2) {
                const geometry = new THREE.SphereGeometry(0.1, 8, 6);
                const point = new THREE.Mesh(geometry, pointMaterial);
                point.position.set(x, 0.2, z);
                
                // Simulate daylight factor data
                const daylightFactor = Math.random() * 0.08;
                point.userData = {
                    type: 'analysisPoint',
                    daylightFactor: daylightFactor,
                    illuminance: daylightFactor * 10000,
                    coordinates: { x, z }
                };
                
                gridGroup.add(point);
            }
        }
        
        parent.add(gridGroup);
    }

    attachMetadata(buildingGroup) {
        // Attach comprehensive metadata as per the thesis structure
        buildingGroup.userData = {
            projectInfo: {
                dataset: 'Swiss Dwellings Enhanced',
                buildingId: 'SD_001_Enhanced',
                processedBy: 'IAAC Performance Pipeline',
                thesis: 'Performance-data enriched floorplan datasets',
                students: ['Marco Durand', 'Matea Pinjusic', 'Joaquin Broquedis']
            },
            geometricData: {
                floors: 4,
                totalArea: 320,
                averageApartmentArea: 80,
                buildingHeight: 15,
                footprint: { width: 24, depth: 19 }
            },
            contextualData: {
                city: 'Zurich',
                climate: 'Cfb (Oceanic/Temperate)',
                epwFile: 'CHE_Zurich_IWEC.epw',
                coordinates: { lat: 47.3769, lon: 8.5417 },
                surroundingContext: 'Urban residential'
            },
            performanceData: {
                energyDemand: {
                    heating: 42.5,
                    cooling: 8.2,
                    lighting: 12.1,
                    equipment: 18.7,
                    total: 81.5
                },
                daylightMetrics: {
                    averageDaylightFactor: 0.045,
                    spatialDaylightAutonomy: 0.68,
                    usefulDaylightIlluminance: 0.72
                },
                thermalComfort: {
                    adaptiveComfortCompliance: 0.85,
                    overheatingHours: 120,
                    undercoolingHours: 45
                }
            },
            speckleData: {
                streamId: 'iaac-thesis-swiss-dwellings',
                commitId: 'performance-enriched-v1.0',
                branchName: 'main',
                lastModified: new Date().toISOString()
            }
        };
    }

    loadPerformanceMetadata(buildingGroup) {
        // Store performance metadata for interactive querying
        const metadata = buildingGroup.userData;
        this.viewer.metadata.set(buildingGroup.name, metadata);
        
        // Emit event for UI updates
        window.dispatchEvent(new CustomEvent('speckle:modelLoaded', {
            detail: { model: buildingGroup, metadata: metadata }
        }));
    }

    async loadModel(modelId) {
        this.showLoading(`Loading Speckle model: ${modelId}...`);
        
        try {
            // In a real implementation, this would fetch from Speckle API
            await this.simulateSpeckleModelLoad();
            this.hideLoading();
            this.showNotification(`Speckle model ${modelId} loaded successfully!`, 'success');
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to load model ${modelId}: ${error.message}`);
        }
    }

    async loadStream(streamId, commitId) {
        this.showLoading(`Loading Speckle stream: ${streamId}@${commitId}...`);
        
        try {
            // Simulate stream loading with performance data
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.hideLoading();
            this.showNotification(`Stream ${streamId} loaded with performance data!`, 'success');
        } catch (error) {
            this.hideLoading();
            this.showError(`Failed to load stream: ${error.message}`);
        }
    }

    async exportToSpeckle() {
        if (!this.currentModel) {
            this.showNotification('No model to export', 'warning');
            return;
        }

        this.showLoading('Exporting to Speckle...');
        
        try {
            // Simulate export process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const exportData = {
                model: this.currentModel.name,
                metadata: this.viewer.metadata.get(this.currentModel.name),
                timestamp: new Date().toISOString()
            };
            
            console.log('Export data:', exportData);
            
            this.hideLoading();
            this.showNotification('Model exported to Speckle successfully!', 'success');
        } catch (error) {
            this.hideLoading();
            this.showError(`Export failed: ${error.message}`);
        }
    }

    showPerformanceData(objectId) {
        // Display performance data for selected object
        const object = this.viewer.scene.getObjectByName(objectId);
        if (!object || !object.userData) {
            this.showNotification('No performance data available for this object', 'info');
            return;
        }

        const userData = object.userData;
        let performanceInfo = `<strong>${object.name}</strong><br><br>`;

        if (userData.type === 'window') {
            const perf = userData.performanceData;
            performanceInfo += `
                <strong>Window Performance Data:</strong><br>
                • Orientation: ${perf.orientation}<br>
                • Annual Sun Hours: ${perf.springSunHours.toFixed(1)}h<br>
                • Annual Radiation: ${perf.annualRadiation} kWh/m²<br>
                • Thermal Gain: ${perf.thermalGain.toFixed(1)} kWh/m²<br>
                • Glare Risk: ${perf.glareRisk}<br>
            `;
        } else if (userData.type === 'performanceZone') {
            performanceInfo += `
                <strong>Space Performance:</strong><br>
                • Space Type: ${userData.spaceType}<br>
                • Performance Score: ${userData.performanceScore}/100<br>
                • Daylight Factor: ${userData.daylightFactor.toFixed(3)}<br>
                • Energy Demand: ${userData.energyDemand} kWh/m²/year<br>
                • Floor: ${userData.floorNumber + 1}<br>
            `;
        } else if (userData.type === 'analysisPoint') {
            performanceInfo += `
                <strong>Analysis Point:</strong><br>
                • Position: (${userData.coordinates.x}, ${userData.coordinates.z})<br>
                • Daylight Factor: ${userData.daylightFactor.toFixed(3)}<br>
                • Illuminance: ${userData.illuminance.toFixed(0)} lux<br>
            `;
        }

        this.showNotification(performanceInfo, 'info', 8000);
    }

    onSpeckleModelLoaded(detail) {
        console.log('Speckle model loaded:', detail);
        this.updateModelInfo(detail.metadata);
    }

    onSpeckleObjectSelected(detail) {
        console.log('Speckle object selected:', detail);
        this.showPerformanceData(detail.objectId);
    }

    updateModelInfo(metadata) {
        // Update UI with model information
        const infoPanel = document.querySelector('.model-info');
        if (infoPanel && metadata) {
            infoPanel.innerHTML = `
                <h3>Model Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Dataset:</span>
                        <span class="info-value">${metadata.projectInfo.dataset}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Building ID:</span>
                        <span class="info-value">${metadata.projectInfo.buildingId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Location:</span>
                        <span class="info-value">${metadata.contextualData.city}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Climate:</span>
                        <span class="info-value">${metadata.contextualData.climate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Energy Demand:</span>
                        <span class="info-value">${metadata.performanceData.energyDemand.total} kWh/m²/year</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Daylight Factor:</span>
                        <span class="info-value">${metadata.performanceData.daylightMetrics.averageDaylightFactor}</span>
                    </div>
                </div>
            `;
        }
    }

    onWindowResize() {
        const container = this.viewer.container;
        if (!container) return;

        this.viewer.camera.aspect = container.clientWidth / container.clientHeight;
        this.viewer.camera.updateProjectionMatrix();
        this.viewer.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.viewer.controls) {
            this.viewer.controls.update();
        }
        
        if (this.viewer.renderer && this.viewer.scene && this.viewer.camera) {
            this.viewer.renderer.render(this.viewer.scene, this.viewer.camera);
        }
    }

    fitToView() {
        if (!this.currentModel || !this.viewer.camera) return;

        const box = new THREE.Box3().setFromObject(this.currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.viewer.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        cameraZ *= 1.8; // Add padding
        
        this.viewer.camera.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
        this.viewer.camera.lookAt(center);
        
        if (this.viewer.controls) {
            this.viewer.controls.target.copy(center);
            this.viewer.controls.update();
        }
    }

    showLoading(message) {
        const loading = document.querySelector('.speckle-loading');
        if (loading) {
            loading.style.display = 'flex';
            const messageEl = loading.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }

    hideLoading() {
        const loading = document.querySelector('.speckle-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        console.error(message);
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info', duration = 5000) {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `speckle-notification speckle-notification-${type}`;
        notification.innerHTML = message;

        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background-color: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease;
            font-size: 0.9rem;
            line-height: 1.4;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        notification.addEventListener('click', function() {
            this.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => this.remove(), 300);
        });
    }
}

// Initialize Speckle IFC Viewer
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page that should have the Speckle viewer
    if (document.getElementById('speckle-viewer-container')) {
        window.speckleIFCViewer = new SpeckleIFCViewer();
    }
});

// Export for use in other scripts
window.SpeckleIFCViewer = SpeckleIFCViewer;