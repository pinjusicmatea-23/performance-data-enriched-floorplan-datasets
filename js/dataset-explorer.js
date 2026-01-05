// Dataset Explorer - Interactive Multi-CSV Data Preview
class DatasetExplorer {
    constructor() {
        this.datasets = {
            building: { data: [], columns: [], name: 'Building Info' },
            windows: { data: [], columns: [], name: 'Windows Simulation' },
            rooms: { data: [], columns: [], name: 'Rooms Simulation' }
        };
        this.currentDataset = 'building';
        this.filteredData = [];
        this.activeFilters = new Map(); // Store active filters
        this.columnDomains = new Map(); // Store column value ranges
        this.init();
    }

    init() {
        console.log('Initializing Dataset Explorer...');
        this.showLoadingState();
        this.loadAllDatasets();
        this.setupEventListeners();
    }

    showLoadingState() {
        const container = document.getElementById('data-table-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--secondary-color);">
                    <div style="font-size: 1.2rem; margin-bottom: 1rem;">Loading datasets...</div>
                    <div style="font-size: 0.9rem;">Please wait while we load the CSV files</div>
                </div>
            `;
        }

        const activeFiltersContainer = document.getElementById('active-filters');
        if (activeFiltersContainer) {
            activeFiltersContainer.innerHTML = '<div class="filter-instructions">Loading column information...</div>';
        }
    }

    showError(message) {
        console.error('Dataset Explorer Error:', message);
        const container = document.getElementById('data-table-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    <h3 style="margin-bottom: 1rem;">⚠️ Error Loading Data</h3>
                    <p style="margin-bottom: 1rem;">${message}</p>
                    <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            `;
        }

        const activeFiltersContainer = document.getElementById('active-filters');
        if (activeFiltersContainer) {
            activeFiltersContainer.innerHTML = '<div class="filter-instructions" style="color: var(--danger-color);">Error loading filters</div>';
        }
    }

    async loadAllDatasets() {
        console.log('Starting to load all datasets...');
        try {
            // Load all three datasets with better error handling
            const loadPromises = [
                this.loadDataset('building', 'datasets/csv_building_info_total.csv'),
                this.loadDataset('windows', 'datasets/csv_export_windows_total.csv'),
                this.loadDataset('rooms', 'datasets/csv_export_rooms_total.csv')
            ];

            await Promise.all(loadPromises);
            
            // Verify all datasets loaded successfully
            let allLoaded = true;
            Object.keys(this.datasets).forEach(key => {
                console.log(`Dataset ${key}: ${this.datasets[key].data.length} rows, ${this.datasets[key].columns.length} columns`);
                if (this.datasets[key].data.length === 0) {
                    console.error(`Dataset ${key} failed to load or is empty`);
                    allLoaded = false;
                }
            });

            if (!allLoaded) {
                throw new Error('One or more datasets failed to load');
            }

            console.log('All datasets loaded successfully');
            
            // Initialize the interface only after all data is loaded
            this.switchDataset('building');
            this.populateFilters();
            
            // Initialize advanced filtering interface
            console.log('Initializing advanced filter interface...');
            await this.initializeAdvancedFilters();
            
        } catch (error) {
            console.error('Error loading datasets:', error);
            this.showError('Failed to load datasets: ' + error.message);
        }
    }

    async loadDataset(type, filepath) {
        console.log(`Loading ${type} dataset from ${filepath}...`);
        try {
            const response = await fetch(filepath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const csvText = await response.text();
            if (!csvText || csvText.trim().length === 0) {
                throw new Error(`Empty file: ${filepath}`);
            }
            this.parseCSV(csvText, type);
            console.log(`Successfully loaded ${type}: ${this.datasets[type].data.length} rows`);
        } catch (error) {
            console.error(`Error loading ${type} dataset:`, error);
            throw new Error(`Failed to load ${type} dataset: ${error.message}`);
        }
    }

    async initializeAdvancedFilters() {
        try {
            console.log('Populating column dropdown...');
            this.populateColumnDropdown();
            
            console.log('Calculating column domains...');
            this.calculateColumnDomains();
            
            console.log('Setting up dropdown toggle functionality...');
            this.setupDropdownToggle();
            
            console.log('Advanced filter interface ready');
        } catch (error) {
            console.error('Error initializing advanced filters:', error);
            this.showError('Failed to initialize filters: ' + error.message);
        }
    }

    setupDropdownToggle() {
        const toggle = document.getElementById('column-selector-toggle');
        const dropdown = document.getElementById('column-dropdown');
        
        if (!toggle || !dropdown) {
            console.error('Dropdown elements not found during setup');
            return;
        }
        
        console.log('Dropdown toggle setup successful');
        
        // Ensure the toggle function is working
        if (typeof window.toggleColumnSelector === 'function') {
            console.log('toggleColumnSelector function is available');
        } else {
            console.error('toggleColumnSelector function not available');
        }
    }

    parseCSV(csvText, type) {
        console.log(`Parsing CSV for ${type}...`);
        try {
            const lines = csvText.trim().split('\n');
            if (lines.length < 2) {
                throw new Error(`Invalid CSV format: less than 2 lines in ${type} dataset`);
            }

            // Parse header line
            const headerLine = lines[0];
            if (!headerLine || headerLine.trim().length === 0) {
                throw new Error(`Empty header line in ${type} dataset`);
            }

            const columns = headerLine.split(',').map(col => col.trim().replace(/"/g, ''));
            console.log(`Found ${columns.length} columns in ${type}:`, columns.slice(0, 5));

            // Parse data lines
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.length === 0) continue; // Skip empty lines

                try {
                    const values = this.parseCSVLine(line);
                    if (values.length !== columns.length) {
                        console.warn(`Row ${i} in ${type} has ${values.length} values but expected ${columns.length}`);
                    }

                    const row = {};
                    columns.forEach((col, index) => {
                        row[col] = values[index] || '';
                    });
                    data.push(row);
                } catch (rowError) {
                    console.warn(`Error parsing row ${i} in ${type}:`, rowError);
                    // Continue processing other rows
                }
            }

            if (data.length === 0) {
                throw new Error(`No data rows found in ${type} dataset`);
            }

            this.datasets[type].data = data;
            this.datasets[type].columns = columns;
            
            // Add climate zone for building dataset
            if (type === 'building') {
                this.addClimateZoneColumn();
                // Update columns list to include climate_zone
                if (!this.datasets[type].columns.includes('climate_zone')) {
                    this.datasets[type].columns.push('climate_zone');
                }
            }
            
            console.log(`Successfully parsed ${type}: ${data.length} rows`);

        } catch (error) {
            console.error(`Error parsing CSV for ${type}:`, error);
            throw new Error(`CSV parsing failed for ${type}: ${error.message}`);
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/"/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/"/g, ''));
        return result;
    }

    addClimateZoneColumn() {
        // Extract climate information from EPW URLs for building dataset
        this.datasets.building.data.forEach(row => {
            if (row.epw) {
                const url = row.epw;
                const match = url.match(/\/(\w{3})_([^\.]+)/);
                if (match) {
                    row.climate_zone = `${match[1]} - ${match[2].replace(/\./g, ' ')}`;
                } else {
                    row.climate_zone = 'Unknown';
                }
            } else {
                row.climate_zone = 'No Data';
            }
        });
        console.log('Added climate_zone column to building dataset');
    }

    switchDataset(type) {
        this.currentDataset = type;
        this.filteredData = [...this.datasets[type].data];
        this.renderTable(this.filteredData);
        this.updateRowCount(this.filteredData.length, this.datasets[type].data.length);
        this.updateAnalysisFilter(type);
    }

    updateAnalysisFilter(selectedType) {
        const analysisSelect = document.getElementById('analysis-filter');
        
        // Skip if element doesn't exist (removed from UI)
        if (!analysisSelect) return;
        
        // Clear existing options
        analysisSelect.innerHTML = `
            <option value="">All Analysis Types</option>
            <option value="building" ${selectedType === 'building' ? 'selected' : ''}>Building Info</option>
            <option value="windows" ${selectedType === 'windows' ? 'selected' : ''}>Windows Simulation</option>
            <option value="rooms" ${selectedType === 'rooms' ? 'selected' : ''}>Rooms Simulation</option>
        `;
    }

    renderTable(data) {
        const container = document.getElementById('data-table-container');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No data to display</p>';
            return;
        }

        const currentColumns = this.datasets[this.currentDataset].columns;
        const table = document.createElement('table');
        table.className = 'data-table';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        currentColumns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body (limit to 1000 rows for large datasets)
        const tbody = document.createElement('tbody');
        const displayLimit = this.currentDataset === 'building' ? 500 : 1000;
        data.slice(0, displayLimit).forEach(row => {
            const tr = document.createElement('tr');
            currentColumns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        container.innerHTML = '';
        container.appendChild(table);

        if (data.length > displayLimit) {
            const notice = document.createElement('div');
            notice.style.cssText = 'text-align: center; padding: 1rem; color: #6b7280; font-size: 0.9rem;';
            notice.textContent = `Showing first ${displayLimit} rows of ${data.length} total rows`;
            container.appendChild(notice);
        }
    }

    populateFilters() {
        this.setupRangeFilters();
        this.populateClimateFilter();
    }

    setupRangeFilters() {
        if (this.datasets.building.data.length > 0) {
            const apartmentCounts = this.datasets.building.data
                .map(row => parseInt(row.apartment_count))
                .filter(count => !isNaN(count));
            const levelsCounts = this.datasets.building.data
                .map(row => parseInt(row.levels_count))
                .filter(count => !isNaN(count));

            // Set range input limits based on actual data
            const apartmentMin = Math.min(...apartmentCounts);
            const apartmentMax = Math.max(...apartmentCounts);
            const levelsMin = Math.min(...levelsCounts);
            const levelsMax = Math.max(...levelsCounts);

            // Update input attributes
            const apartmentMinInput = document.getElementById('apartment-min');
            const apartmentMaxInput = document.getElementById('apartment-max');
            const levelsMinInput = document.getElementById('levels-min');
            const levelsMaxInput = document.getElementById('levels-max');

            if (apartmentMinInput && apartmentMaxInput) {
                apartmentMinInput.min = apartmentMin;
                apartmentMinInput.max = apartmentMax;
                apartmentMaxInput.min = apartmentMin;
                apartmentMaxInput.max = apartmentMax;
                apartmentMinInput.placeholder = `Min (${apartmentMin})`;
                apartmentMaxInput.placeholder = `Max (${apartmentMax})`;
            }

            if (levelsMinInput && levelsMaxInput) {
                levelsMinInput.min = levelsMin;
                levelsMinInput.max = levelsMax;
                levelsMaxInput.min = levelsMin;
                levelsMaxInput.max = levelsMax;
                levelsMinInput.placeholder = `Min (${levelsMin})`;
                levelsMaxInput.placeholder = `Max (${levelsMax})`;
            }
        }
    }

    populateClimateFilter() {
        const climateSelect = document.getElementById('climate-filter');
        
        // Skip if element doesn't exist (removed from UI)
        if (!climateSelect) return;
        
        // Clear existing options except the first one
        while (climateSelect.children.length > 1) {
            climateSelect.removeChild(climateSelect.lastChild);
        }

        // Extract climate zones from building info dataset
        if (this.datasets.building.data.length > 0) {
            const uniqueClimates = [...new Set(this.datasets.building.data.map(row => {
                if (row.epw) {
                    const url = row.epw;
                    const match = url.match(/\/(\w{3})_([^\.]+)/);
                    if (match) {
                        return `${match[1]} - ${match[2].replace(/\./g, ' ')}`;
                    }
                }
                return null;
            }))]
            .filter(val => val !== null)
            .sort();
            
            uniqueClimates.forEach(climate => {
                const option = document.createElement('option');
                option.value = climate;
                option.textContent = climate;
                climateSelect.appendChild(option);
            });
        }
    }

    findColumn(searchTerms) {
        for (const term of searchTerms) {
            const found = this.columns.find(col => 
                col.toLowerCase().includes(term.toLowerCase())
            );
            if (found) return found;
        }
        return null;
    }

    applyFilters() {
        const apartmentMin = parseInt(document.getElementById('apartment-min').value) || null;
        const apartmentMax = parseInt(document.getElementById('apartment-max').value) || null;
        const levelsMin = parseInt(document.getElementById('levels-min').value) || null;
        const levelsMax = parseInt(document.getElementById('levels-max').value) || null;
        const climateFilter = document.getElementById('climate-filter')?.value || '';
        const analysisFilter = document.getElementById('analysis-filter')?.value || '';

        // Switch dataset if analysis type is selected
        if (analysisFilter && analysisFilter !== this.currentDataset) {
            this.currentDataset = analysisFilter;
        }

        // Get building IDs that match range and climate filters (from building info dataset)
        let filteredBuildingIds = new Set();
        
        if (apartmentMin || apartmentMax || levelsMin || levelsMax || climateFilter) {
            const buildingData = this.datasets.building.data.filter(row => {
                let matches = true;

                // Apartment count range filter
                if (apartmentMin || apartmentMax) {
                    const apartmentCount = parseInt(row.apartment_count);
                    if (!isNaN(apartmentCount)) {
                        if (apartmentMin && apartmentCount < apartmentMin) matches = false;
                        if (apartmentMax && apartmentCount > apartmentMax) matches = false;
                    } else {
                        matches = false;
                    }
                }

                // Levels count range filter
                if (levelsMin || levelsMax) {
                    const levelsCount = parseInt(row.levels_count);
                    if (!isNaN(levelsCount)) {
                        if (levelsMin && levelsCount < levelsMin) matches = false;
                        if (levelsMax && levelsCount > levelsMax) matches = false;
                    } else {
                        matches = false;
                    }
                }

                // Climate filter
                if (climateFilter && row.epw) {
                    const url = row.epw;
                    const match = url.match(/\/(\w{3})_([^\.]+)/);
                    if (match) {
                        const climate = `${match[1]} - ${match[2].replace(/\./g, ' ')}`;
                        if (climate !== climateFilter) {
                            matches = false;
                        }
                    } else {
                        matches = false;
                    }
                }

                return matches;
            });

            filteredBuildingIds = new Set(buildingData.map(row => row.building_id));
        }

        // Apply filters to current dataset
        this.filteredData = this.datasets[this.currentDataset].data.filter(row => {
            // If we have range/climate filters, check if this row's building_id is in the filtered set
            if ((apartmentMin || apartmentMax || levelsMin || levelsMax || climateFilter) && filteredBuildingIds.size > 0) {
                const buildingIdField = this.getBuildingIdField(this.currentDataset);
                if (!filteredBuildingIds.has(row[buildingIdField])) {
                    return false;
                }
            }

            return true;
        });

        this.renderTable(this.filteredData);
        this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
    }

    getBuildingIdField(datasetType) {
        // Handle different naming conventions in the datasets
        switch (datasetType) {
            case 'rooms': return 'building id';
            case 'windows': return 'building_id';
            case 'building': return 'building_id';
            default: return 'building_id';
        }
    }

    executeQuery() {
        const query = document.getElementById('sql-query').value.trim();
        if (!query) return;

        try {
            const result = this.parseEnhancedQuery(query);
            this.filteredData = result;
            this.renderTable(this.filteredData);
            this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
        } catch (error) {
            alert('Query error: ' + error.message);
        }
    }

    parseEnhancedQuery(query) {
        const queryLower = query.toLowerCase();
        
        // Check for cross-dataset queries: FROM rooms WHERE space_name = 'KITCHEN'
        const crossDatasetMatch = query.match(/FROM\s+(rooms|windows|building)\s+WHERE\s+(.*)/i);
        if (crossDatasetMatch) {
            const [, sourceDataset, whereClause] = crossDatasetMatch;
            return this.executeCrossDatasetQuery(sourceDataset.toLowerCase(), whereClause.trim());
        }
        
        // Original query functionality
        if (queryLower.includes('where')) {
            const whereIndex = queryLower.indexOf('where');
            const whereClause = query.substring(whereIndex + 5).trim();
            
            return this.datasets[this.currentDataset].data.filter(row => {
                return this.evaluateWhereClause(row, whereClause);
            });
        }
        
        if (queryLower.includes('select *') || queryLower === 'select all') {
            return this.datasets[this.currentDataset].data;
        }

        // Fallback to simple query parsing for backward compatibility
        return this.parseSimpleQuery(query);
    }

    executeCrossDatasetQuery(sourceDataset, whereClause) {
        if (!this.datasets[sourceDataset] || !this.datasets[sourceDataset].data.length) {
            throw new Error(`Dataset '${sourceDataset}' not available or empty`);
        }

        // Filter the source dataset based on the WHERE clause
        const filteredSourceData = this.datasets[sourceDataset].data.filter(row => {
            return this.evaluateWhereClause(row, whereClause);
        });

        // Extract building IDs from filtered source data
        const buildingIdField = this.getBuildingIdField(sourceDataset);
        const filteredBuildingIds = new Set(
            filteredSourceData.map(row => row[buildingIdField])
        );

        // Filter current dataset by matching building IDs
        const currentBuildingIdField = this.getBuildingIdField(this.currentDataset);
        return this.datasets[this.currentDataset].data.filter(row => {
            return filteredBuildingIds.has(row[currentBuildingIdField]);
        });
    }

    parseSimpleQuery(query) {
        const queryLower = query.toLowerCase();
        
        if (queryLower.includes('where')) {
            const whereIndex = queryLower.indexOf('where');
            const whereClause = query.substring(whereIndex + 5).trim();
            
            return this.datasets[this.currentDataset].data.filter(row => {
                return this.evaluateWhereClause(row, whereClause);
            });
        }
        
        if (queryLower.includes('select *') || queryLower === 'select all') {
            return this.datasets[this.currentDataset].data;
        }

        throw new Error('Unsupported query format. Use: SELECT * WHERE column = value OR FROM dataset WHERE column = value');
    }

    evaluateWhereClause(row, whereClause) {
        // Handle column names with spaces and special characters
        const normalizeColumnName = (name) => {
            // Remove quotes and trim
            name = name.replace(/['"]/g, '').trim();
            // Common column name mappings for easier querying
            const aliases = {
                'space_name': 'space name',
                'space_type': 'space type',
                'daylight_factor': 'daylight factor/room',
                'annual_daylight': 'annual daylight/room',
                'simulation_id': 'simulation id',
                'building_id': 'building id'
            };
            return aliases[name] || name;
        };

        // Handle LIKE operator for partial matches - improved regex
        const likeMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s+LIKE\s+['"](.*?)['"]$/i);
        if (likeMatch) {
            let [, column, value] = likeMatch;
            column = normalizeColumnName(column.trim());
            const actualValue = row[column] || '';
            return actualValue.toString().toLowerCase().includes(value.toLowerCase());
        }

        // Simple equality check - improved regex 
        const eqMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s*=\s*['"](.*?)['"]$/i);
        if (eqMatch) {
            let [, column, value] = eqMatch;
            column = normalizeColumnName(column.trim());
            return row[column] && row[column].toString() === value;
        }

        // Numeric equality without quotes
        const numEqMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s*=\s*([0-9.]+)$/i);
        if (numEqMatch) {
            let [, column, value] = numEqMatch;
            column = normalizeColumnName(column.trim());
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue === parseFloat(value);
        }

        // Greater than check - improved regex
        const gtMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s*>\s*([0-9.]+)$/i);
        if (gtMatch) {
            let [, column, value] = gtMatch;
            column = normalizeColumnName(column.trim());
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue > parseFloat(value);
        }

        // Less than check - improved regex
        const ltMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s*<\s*([0-9.]+)$/i);
        if (ltMatch) {
            let [, column, value] = ltMatch;
            column = normalizeColumnName(column.trim());
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue < parseFloat(value);
        }

        // Greater than or equal
        const gteMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s*>=\s*([0-9.]+)$/i);
        if (gteMatch) {
            let [, column, value] = gteMatch;
            column = normalizeColumnName(column.trim());
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue >= parseFloat(value);
        }

        // Less than or equal
        const lteMatch = whereClause.match(/([a-zA-Z_\/\s]+?)\s*<=\s*([0-9.]+)$/i);
        if (lteMatch) {
            let [, column, value] = lteMatch;
            column = normalizeColumnName(column.trim());
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue <= parseFloat(value);
        }

        console.log('No match found for WHERE clause:', whereClause);
        return true;
    }

    loadExampleQuery(type) {
        const examples = {
            building: "SELECT * WHERE apartment_count > 10",
            energy: "FROM windows WHERE Sun Hours_summer > 5",
            daylight: "FROM rooms WHERE daylight_factor > 20", 
            climate: "SELECT * WHERE address LIKE 'Bangkok'",
            rooms_kitchen: "FROM rooms WHERE space_name = 'KITCHEN'",
            rooms_living: "FROM rooms WHERE space_name LIKE 'LIVING'",
            high_daylight: "FROM rooms WHERE daylight_factor > 15",
            windows_summer: "FROM windows WHERE Sun Hours_summer >= 8"
        };
        
        const query = examples[type] || examples.building;
        document.getElementById('sql-query').value = query;
    }    resetQuery() {
        document.getElementById('sql-query').value = '';
        document.getElementById('apartment-min').value = '';
        document.getElementById('apartment-max').value = '';
        document.getElementById('levels-min').value = '';
        document.getElementById('levels-max').value = '';
        const climateFilterEl = document.getElementById('climate-filter');
        const analysisFilterEl = document.getElementById('analysis-filter');
        
        if (climateFilterEl) climateFilterEl.value = '';
        if (analysisFilterEl) analysisFilterEl.value = '';
        
        if (climateFilterEl) climateFilterEl.value = '';
        if (analysisFilterEl) analysisFilterEl.value = '';
        
        this.currentDataset = 'building';
        this.filteredData = [...this.datasets[this.currentDataset].data];
        this.renderTable(this.filteredData);
        this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
        this.updateAnalysisFilter('building');
    }

    updateRowCount(filtered, total) {
        document.getElementById('row-count').textContent = `${filtered} of ${total} rows (${this.datasets[this.currentDataset].name})`;
    }

    exportFilteredData(format) {
        if (this.filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        if (format === 'csv') {
            this.exportCSV();
        } else if (format === 'all') {
            this.exportAllFiltered();
        }
    }

    exportAllFiltered() {
        // Get current filters
        const apartmentMin = parseInt(document.getElementById('apartment-min').value) || null;
        const apartmentMax = parseInt(document.getElementById('apartment-max').value) || null;
        const levelsMin = parseInt(document.getElementById('levels-min').value) || null;
        const levelsMax = parseInt(document.getElementById('levels-max').value) || null;
        const climateFilter = document.getElementById('climate-filter')?.value || '';

        if (!apartmentMin && !apartmentMax && !levelsMin && !levelsMax && !climateFilter) {
            alert('Please apply apartment count, levels count, or climate filters to export synchronized data');
            return;
        }

        // Get filtered building IDs
        const buildingData = this.datasets.building.data.filter(row => {
            let matches = true;
            
            // Apartment count range filter
            if (apartmentMin || apartmentMax) {
                const apartmentCount = parseInt(row.apartment_count);
                if (!isNaN(apartmentCount)) {
                    if (apartmentMin && apartmentCount < apartmentMin) matches = false;
                    if (apartmentMax && apartmentCount > apartmentMax) matches = false;
                } else {
                    matches = false;
                }
            }

            // Levels count range filter
            if (levelsMin || levelsMax) {
                const levelsCount = parseInt(row.levels_count);
                if (!isNaN(levelsCount)) {
                    if (levelsMin && levelsCount < levelsMin) matches = false;
                    if (levelsMax && levelsCount > levelsMax) matches = false;
                } else {
                    matches = false;
                }
            }
            
            // Climate filter
            if (climateFilter && row.epw) {
                const url = row.epw;
                const match = url.match(/\/(\w{3})_([^\.]+)/);
                if (match) {
                    const climate = `${match[1]} - ${match[2].replace(/\./g, ' ')}`;
                    if (climate !== climateFilter) matches = false;
                } else {
                    matches = false;
                }
            }
            return matches;
        });

        const filteredBuildingIds = new Set(buildingData.map(row => row.building_id));

        // Export all three datasets with matching building IDs
        ['building', 'windows', 'rooms'].forEach(datasetType => {
            const buildingIdField = this.getBuildingIdField(datasetType);
            const filteredDataset = this.datasets[datasetType].data.filter(row => 
                filteredBuildingIds.has(row[buildingIdField])
            );

            this.exportDatasetAsCSV(filteredDataset, this.datasets[datasetType].columns, `${datasetType}_filtered.csv`);
        });
    }

    exportDatasetAsCSV(data, columns, filename) {
        const csvContent = [
            columns.join(','),
            ...data.map(row => 
                columns.map(col => `"${row[col] || ''}"`).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportCSV() {
        const currentColumns = this.datasets[this.currentDataset].columns;
        const csvContent = [
            currentColumns.join(','),
            ...this.filteredData.map(row => 
                currentColumns.map(col => `"${row[col] || ''}"`).join(',')
            )
        ].join('\n');

        const filename = `${this.currentDataset}_filtered_data.csv`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    setupEventListeners() {
        // These will be attached when the page loads
    }

    // Advanced Filter System Methods
    populateColumnDropdown() {
        console.log('Populating column dropdown...');
        try {
            Object.keys(this.datasets).forEach(datasetKey => {
                const container = document.getElementById(`${datasetKey}-columns`);
                const dataset = this.datasets[datasetKey];
                
                if (!container) {
                    console.warn(`Container not found for dataset: ${datasetKey}`);
                    return;
                }
                
                if (!dataset || !dataset.columns || dataset.columns.length === 0) {
                    console.warn(`No columns found for dataset: ${datasetKey}`);
                    container.innerHTML = '<p style="color: #666; font-style: italic;">No columns available</p>';
                    return;
                }

                // Special debugging for rooms dataset
                if (datasetKey === 'rooms') {
                    console.log(`ROOMS DATASET DEBUG: Found ${dataset.columns.length} columns`);
                    console.log('ROOMS COLUMNS:', dataset.columns);
                    console.log('ROOMS CONTAINER:', container);
                }
                
                container.innerHTML = '';
                console.log(`Adding ${dataset.columns.length} columns for ${datasetKey}`);
                
                // Filter out unwanted columns based on dataset
                const columnsToExclude = {
                    building: ['epw', 'address'], // Remove these, add climate separately
                    rooms: ['simulation_id', 'building_id', 'space_unitID', 'simulation id', 'building id', 'space unitID'],
                    windows: ['simulation_id', 'building_id', 'window_unitid', 'window_id', 'simulation id', 'building id', 'window unitid', 'window id']
                };
                
                const excludeList = columnsToExclude[datasetKey] || [];
                let filteredColumns = dataset.columns.filter(column => {
                    const columnLower = column.toLowerCase().trim();
                    return !excludeList.some(exclude => {
                        const excludeLower = exclude.toLowerCase().trim();
                        return columnLower === excludeLower || 
                               columnLower.includes(excludeLower) || 
                               excludeLower.includes(columnLower) ||
                               columnLower.replace(/[_\s]/g, '') === excludeLower.replace(/[_\s]/g, '');
                    });
                });
                
                // Debug logging for rooms dataset
                if (datasetKey === 'rooms') {
                    console.log('ROOMS - Original columns:', dataset.columns);
                    console.log('ROOMS - Exclude list:', excludeList);
                    console.log('ROOMS - Filtered columns:', filteredColumns);
                }
                
                console.log(`Filtered columns for ${datasetKey}:`, filteredColumns);
                
                filteredColumns.forEach((column, index) => {
                    try {
                        const checkbox = document.createElement('div');
                        checkbox.className = 'column-checkbox';
                        
                        // Create safe IDs but use original names for functionality
                        const safeDataset = datasetKey.replace(/[^a-zA-Z0-9]/g, '_');
                        const safeColumn = column.replace(/[^a-zA-Z0-9]/g, '_');
                        const checkboxId = `col-${safeDataset}-${safeColumn}`;
                        
                        // Create the checkbox input
                        const input = document.createElement('input');
                        input.type = 'checkbox';
                        input.id = checkboxId;
                        
                        console.log(`Setting up event listener for ${checkboxId} (dataset: ${datasetKey}, column: ${column})`);
                        
                        input.addEventListener('change', (event) => {
                            console.log(`Checkbox changed for ${datasetKey}.${column}, checked: ${event.target.checked}`);
                            console.log('window.datasetExplorer available:', !!window.datasetExplorer);
                            
                            // Special debugging for rooms dataset
                            if (datasetKey === 'rooms') {
                                console.log(`ROOMS DATASET: Processing column "${column}"`);
                                console.log(`ROOMS DATASET: Safe ID will be "${checkboxId}"`);
                            }
                            
                            if (window.datasetExplorer) {
                                console.log(`Calling toggleColumnFilter("${datasetKey}", "${column}")`);
                                window.datasetExplorer.toggleColumnFilter(datasetKey, column);
                            } else {
                                console.error('window.datasetExplorer not available!');
                            }
                        });
                        
                        // Test the checkbox immediately after creation
                        console.log(`Created checkbox for ${datasetKey}.${column} with ID: ${checkboxId}`);
                        
                        // Create the label
                        const label = document.createElement('label');
                        label.setAttribute('for', checkboxId);
                        label.title = column;
                        label.textContent = column;
                        
                        checkbox.appendChild(input);
                        checkbox.appendChild(label);
                        container.appendChild(checkbox);
                        
                        console.log(`Added column: ${column} with ID: ${checkboxId}`);
                        
                    } catch (columnError) {
                        console.error(`Error adding column ${column} for ${datasetKey}:`, columnError);
                    }
                });
                
                console.log(`Successfully populated ${datasetKey} columns`);
            });
            
        } catch (error) {
            console.error('Error populating column dropdown:', error);
            throw new Error(`Column dropdown population failed: ${error.message}`);
        }
    }

    toggleColumnFilter(dataset, column) {
        console.log(`toggleColumnFilter called with dataset: "${dataset}", column: "${column}"`);
        console.log('Available datasets:', Object.keys(this.datasets));
        
        // Validate dataset exists
        if (!this.datasets[dataset]) {
            console.error(`Dataset "${dataset}" not found. Available datasets:`, Object.keys(this.datasets));
            return;
        }
        
        // Find the checkbox using the safe ID
        const safeDataset = dataset.replace(/[^a-zA-Z0-9]/g, '_');
        const safeColumn = column.replace(/[^a-zA-Z0-9]/g, '_');
        const checkboxId = `col-${safeDataset}-${safeColumn}`;
        console.log(`Looking for checkbox with ID: ${checkboxId}`);
        
        const checkbox = document.getElementById(checkboxId);
        
        if (!checkbox) {
            console.error(`Checkbox not found with ID: ${checkboxId}`);
            console.log('All checkboxes on page:', document.querySelectorAll('input[type="checkbox"]'));
            return;
        }
        
        console.log(`Checkbox found. Checked state: ${checkbox.checked}`);
        
        const filterId = `${dataset}.${column}`;
        console.log(`Processing filter: ${filterId}, checked: ${checkbox.checked}`);
        
        if (checkbox && checkbox.checked) {
            console.log(`Adding filter for ${filterId}`);
            this.addFilterControl(filterId, column, dataset);
        } else {
            console.log(`Removing filter for ${filterId}`);
            this.removeFilterControl(filterId);
        }
    }

    addFilterControl(filterId, column, dataset) {
        console.log(`Adding filter control for ${filterId}`);
        console.log(`Current active filters count: ${this.activeFilters.size}`);
        
        const domain = this.columnDomains.get(filterId);
        if (!domain) {
            console.error(`No domain found for ${filterId}`);
            return;
        }

        const activeFiltersContainer = document.getElementById('active-filters');
        if (!activeFiltersContainer) {
            console.error('Active filters container not found');
            return;
        }

        // Remove instructions if present
        const instructionsEl = activeFiltersContainer.querySelector('.filter-instructions');
        if (instructionsEl) {
            instructionsEl.remove();
        }

        // Check if filter already exists
        const existingFilter = activeFiltersContainer.querySelector(`[data-filter-id="${filterId}"]`);
        if (existingFilter) {
            console.log(`Filter ${filterId} already exists - not adding duplicate`);
            return;
        }

        // Check current filter count
        const currentFilterCount = activeFiltersContainer.querySelectorAll('.filter-item').length;
        console.log(`Current filter items in container: ${currentFilterCount}`);
        
        if (currentFilterCount >= 10) {
            console.warn('Maximum of 10 filters allowed for performance reasons');
            alert('Maximum of 10 filters allowed. Please remove some filters before adding new ones.');
            return;
        }

        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';
        filterItem.setAttribute('data-filter-id', filterId);

        if (domain.type === 'numeric') {
            console.log(`Creating numeric filter for ${column}, range: ${domain.min} - ${domain.max}`);
            filterItem.innerHTML = `
                <div class="filter-label">
                    ${column}<br>
                    <small>(${dataset})</small>
                </div>
                <div class="filter-input-group">
                    <select class="filter-operator" id="op-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}">
                        <option value="=">=</option>
                        <option value=">">&gt;</option>
                        <option value="<">&lt;</option>
                        <option value=">=">&gt;=</option>
                        <option value="<=">&lt;=</option>
                        <option value="range">Range</option>
                    </select>
                    <input type="number" class="filter-input" id="val1-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}" 
                           placeholder="Value" min="${domain.min || ''}" max="${domain.max || ''}" step="0.1">
                    <input type="number" class="filter-input" id="val2-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}" 
                           placeholder="Max" min="${domain.min || ''}" max="${domain.max || ''}" step="0.1" style="display:none;">
                    <div class="range-indicator">${domain.min} - ${domain.max}</div>
                </div>
                <button type="button" class="remove-filter" onclick="window.datasetExplorer.removeFilterControl('${filterId}')">×</button>
            `;
            
            // Show/hide second input based on operator
            setTimeout(() => {
                const operatorSelect = filterItem.querySelector(`#op-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}`);
                if (operatorSelect) {
                    operatorSelect.addEventListener('change', () => {
                        const val2Input = filterItem.querySelector(`#val2-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}`);
                        if (val2Input) {
                            val2Input.style.display = operatorSelect.value === 'range' ? 'block' : 'none';
                        }
                    });
                }
            }, 100);
        } else {
            // Categorical filter
            console.log(`Creating categorical filter for ${column}, values: ${domain.values.length}`);
            const selectOptions = domain.values.slice(0, 50).map(value => 
                `<option value="${value}">${value.length > 30 ? value.substring(0, 30) + '...' : value}</option>`
            ).join('');
            
            filterItem.innerHTML = `
                <div class="filter-label">${column}<br><small>(${dataset})</small></div>
                <div class="filter-input-group">
                    <select class="filter-operator" id="op-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}">
                        <option value="=">equals</option>
                        <option value="like">contains</option>
                    </select>
                    <select class="filter-input" id="val1-${filterId.replace(/[^a-zA-Z0-9]/g, '_')}">
                        <option value="">Select value...</option>
                        ${selectOptions}
                    </select>
                </div>
                <button type="button" class="remove-filter" onclick="window.datasetExplorer.removeFilterControl('${filterId}')">×</button>
            `;
        }

        activeFiltersContainer.appendChild(filterItem);
        console.log(`Filter control added for ${filterId}`);
    }

    removeFilterControl(filterId) {
        console.log(`Removing filter control for ${filterId}`);
        const filterItem = document.querySelector(`[data-filter-id="${filterId}"]`);
        if (filterItem) {
            filterItem.remove();
            console.log(`Filter item removed for ${filterId}`);
        }

        // Uncheck the corresponding checkbox using the safe ID format
        const [dataset, column] = filterId.split('.');
        const safeDataset = dataset.replace(/[^a-zA-Z0-9]/g, '_');
        const safeColumn = column.replace(/[^a-zA-Z0-9]/g, '_');
        const checkboxId = `col-${safeDataset}-${safeColumn}`;
        const checkbox = document.getElementById(checkboxId);
        
        if (checkbox) {
            checkbox.checked = false;
            console.log(`Unchecked checkbox: ${checkboxId}`);
        } else {
            console.warn(`Checkbox not found for unchecking: ${checkboxId}`);
        }

        this.activeFilters.delete(filterId);

        const activeFiltersContainer = document.getElementById('active-filters');
        if (activeFiltersContainer && activeFiltersContainer.children.length === 0) {
            activeFiltersContainer.innerHTML = '<div class="filter-instructions">Select columns above to add filters</div>';
        }
    }

    applyAdvancedFilters() {
        console.log('=== Applying Advanced Filters ===');
        
        // Show loading state
        this.showFilteringLoading(true);
        
        // Use setTimeout to allow UI update before processing
        setTimeout(() => {
            try {
                this.processAdvancedFilters();
            } finally {
                // Hide loading state
                this.showFilteringLoading(false);
            }
        }, 10);
    }
    
    showFilteringLoading(show) {
        const button = document.getElementById('apply-filters-btn');
        const textSpan = button?.querySelector('.btn-text');
        const loadingSpan = button?.querySelector('.btn-loading');
        
        if (button && textSpan && loadingSpan) {
            if (show) {
                textSpan.style.display = 'none';
                loadingSpan.style.display = 'inline';
                button.disabled = true;
                button.style.opacity = '0.7';
            } else {
                textSpan.style.display = 'inline';
                loadingSpan.style.display = 'none';
                button.disabled = false;
                button.style.opacity = '1';
            }
        }
    }
    
    processAdvancedFilters() {
        this.activeFilters.clear();
        
        // Collect all active filters
        const filterItems = document.querySelectorAll('.filter-item');
        console.log(`Found ${filterItems.length} filter items`);
        
        if (filterItems.length === 0) {
            console.log('No filter items found, showing all data');
            this.filteredData = [...this.datasets[this.currentDataset].data];
            this.renderTable(this.filteredData);
            this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
            return;
        }
        
        filterItems.forEach((item, index) => {
            const filterId = item.getAttribute('data-filter-id');
            if (!filterId) {
                console.error(`Filter item ${index} missing data-filter-id`);
                return;
            }
            
            console.log(`Processing filter item ${index}: ${filterId}`);
            
            const sanitizedId = filterId.replace(/[^a-zA-Z0-9]/g, '_');
            const operatorElement = document.getElementById(`op-${sanitizedId}`);
            const value1Element = document.getElementById(`val1-${sanitizedId}`);
            const value2Element = document.getElementById(`val2-${sanitizedId}`);

            if (!operatorElement) {
                console.error(`Missing operator element for filter ${filterId} (looking for op-${sanitizedId})`);
                return;
            }
            
            if (!value1Element) {
                console.error(`Missing value1 element for filter ${filterId} (looking for val1-${sanitizedId})`);
                return;
            }

            const operator = operatorElement.value;
            const value1 = value1Element.value;
            const value2 = value2Element ? value2Element.value : null;

            console.log(`Filter ${filterId}: operator="${operator}", value1="${value1}", value2="${value2}"`);

            // Validate that we have a value to filter by
            if (!value1 || value1 === '') {
                console.log(`Filter ${filterId} has no value, skipping`);
                return;
            }

            // For range operator, ensure we have both values
            if (operator === 'range' && (!value2 || value2 === '')) {
                console.log(`Filter ${filterId} is range but missing value2, skipping`);
                return;
            }

            const filterData = {
                operator,
                value1,
                value2,
                dataset: filterId.split('.')[0],
                column: filterId.split('.')[1]
            };

            this.activeFilters.set(filterId, filterData);
            console.log(`Added filter: ${filterId}`, filterData);
        });

        console.log(`Total valid filters: ${this.activeFilters.size}`);

        // Apply filters
        try {
            this.filteredData = this.applyAllFilters();
            this.renderTable(this.filteredData);
            this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
            console.log(`Filter application complete: ${this.filteredData.length} rows`);
        } catch (error) {
            console.error('Error applying filters:', error);
            alert('Error applying filters: ' + error.message);
        }
        
        console.log('=== Filter Application Complete ===');
    }

    applyAllFilters() {
        console.log('Applying all filters...');
        console.log('Active filters:', this.activeFilters);
        
        if (this.activeFilters.size === 0) {
            console.log('No active filters, returning all data');
            return [...this.datasets[this.currentDataset].data];
        }

        // Separate filters by dataset
        const currentDatasetFilters = [];
        const crossDatasetFilters = new Map();

        this.activeFilters.forEach((filter, filterId) => {
            const dataset = filter.dataset;
            if (dataset === this.currentDataset) {
                currentDatasetFilters.push(filter);
                console.log(`Current dataset filter: ${filterId}`, filter);
            } else {
                if (!crossDatasetFilters.has(dataset)) {
                    crossDatasetFilters.set(dataset, []);
                }
                crossDatasetFilters.get(dataset).push(filter);
                console.log(`Cross dataset filter: ${filterId}`, filter);
            }
        });

        // Start with all data from current dataset
        let result = [...this.datasets[this.currentDataset].data];
        console.log(`Starting with ${result.length} rows`);

        // Apply current dataset filters directly
        if (currentDatasetFilters.length > 0) {
            console.log('Applying current dataset filters...');
            currentDatasetFilters.forEach(filter => {
                const beforeLength = result.length;
                result = result.filter(row => this.evaluateFilter(row, filter));
                console.log(`Filter ${filter.column}: ${beforeLength} -> ${result.length} rows`);
            });
        }

        // Handle cross-dataset filters
        if (crossDatasetFilters.size > 0) {
            console.log('Processing cross-dataset filters...');
            let validBuildingIds = null;

            crossDatasetFilters.forEach((filters, datasetKey) => {
                console.log(`Processing ${filters.length} filters for dataset ${datasetKey}`);
                let datasetData = [...this.datasets[datasetKey].data];

                // Apply all filters for this dataset
                filters.forEach(filter => {
                    const beforeLength = datasetData.length;
                    datasetData = datasetData.filter(row => this.evaluateFilter(row, filter));
                    console.log(`Cross-filter ${filter.column}: ${beforeLength} -> ${datasetData.length} rows`);
                });

                // Extract building IDs
                const buildingIdField = this.getBuildingIdField(datasetKey);
                const buildingIds = new Set(datasetData.map(row => row[buildingIdField]).filter(id => id !== undefined && id !== ''));
                console.log(`Found ${buildingIds.size} unique building IDs from ${datasetKey}`);

                if (validBuildingIds === null) {
                    validBuildingIds = buildingIds;
                } else {
                    // Intersection of building IDs
                    const prevSize = validBuildingIds.size;
                    validBuildingIds = new Set([...validBuildingIds].filter(id => buildingIds.has(id)));
                    console.log(`Building ID intersection: ${prevSize} -> ${validBuildingIds.size}`);
                }
            });

            // Filter result by valid building IDs
            if (validBuildingIds && validBuildingIds.size > 0) {
                const currentBuildingIdField = this.getBuildingIdField(this.currentDataset);
                const beforeLength = result.length;
                result = result.filter(row => {
                    const buildingId = row[currentBuildingIdField];
                    return buildingId !== undefined && buildingId !== '' && validBuildingIds.has(buildingId);
                });
                console.log(`Cross-dataset filter applied: ${beforeLength} -> ${result.length} rows`);
            } else {
                console.log('No valid building IDs found, returning empty result');
                result = [];
            }
        }

        console.log(`Final result: ${result.length} rows`);
        return result;
    }

    evaluateFilter(row, filter) {
        const value = row[filter.column];
        console.log(`Evaluating filter ${filter.column} ${filter.operator} ${filter.value1} against value: "${value}"`);
        
        if (value === undefined || value === null || value === '') {
            console.log('Value is empty, filter fails');
            return false;
        }

        const stringValue = value.toString().trim();
        const numValue = parseFloat(stringValue);
        const filterValue1 = filter.value1.toString().trim();
        const filterNumValue1 = parseFloat(filterValue1);
        const filterValue2 = filter.value2 ? filter.value2.toString().trim() : null;
        const filterNumValue2 = filterValue2 ? parseFloat(filterValue2) : null;

        console.log(`Parsed values - original: "${stringValue}", numeric: ${numValue}, filter1: "${filterValue1}", filterNum1: ${filterNumValue1}`);

        switch (filter.operator) {
            case '=':
                const equalResult = !isNaN(numValue) && !isNaN(filterNumValue1) ? 
                    Math.abs(numValue - filterNumValue1) < 0.001 : 
                    stringValue.toLowerCase() === filterValue1.toLowerCase();
                console.log(`Equality result: ${equalResult}`);
                return equalResult;
                
            case '>':
                if (isNaN(numValue) || isNaN(filterNumValue1)) {
                    console.log('Non-numeric comparison for > operator');
                    return false;
                }
                const gtResult = numValue > filterNumValue1;
                console.log(`Greater than result: ${gtResult}`);
                return gtResult;
                
            case '<':
                if (isNaN(numValue) || isNaN(filterNumValue1)) {
                    console.log('Non-numeric comparison for < operator');
                    return false;
                }
                const ltResult = numValue < filterNumValue1;
                console.log(`Less than result: ${ltResult}`);
                return ltResult;
                
            case '>=':
                if (isNaN(numValue) || isNaN(filterNumValue1)) {
                    console.log('Non-numeric comparison for >= operator');
                    return false;
                }
                const gteResult = numValue >= filterNumValue1;
                console.log(`Greater than or equal result: ${gteResult}`);
                return gteResult;
                
            case '<=':
                if (isNaN(numValue) || isNaN(filterNumValue1)) {
                    console.log('Non-numeric comparison for <= operator');
                    return false;
                }
                const lteResult = numValue <= filterNumValue1;
                console.log(`Less than or equal result: ${lteResult}`);
                return lteResult;
                
            case 'range':
                if (isNaN(numValue) || isNaN(filterNumValue1) || isNaN(filterNumValue2)) {
                    console.log('Non-numeric comparison for range operator');
                    return false;
                }
                const rangeResult = numValue >= filterNumValue1 && numValue <= filterNumValue2;
                console.log(`Range result: ${rangeResult} (${filterNumValue1} <= ${numValue} <= ${filterNumValue2})`);
                return rangeResult;
                
            case 'like':
                const likeResult = stringValue.toLowerCase().includes(filterValue1.toLowerCase());
                console.log(`Like result: ${likeResult}`);
                return likeResult;
                
            default:
                console.log(`Unknown operator: ${filter.operator}`);
                return true;
        }
    }

    clearAllFilters() {
        console.log('Clearing all filters...');
        this.activeFilters.clear();
        
        // Uncheck all column checkboxes
        document.querySelectorAll('.column-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Clear active filters container
        const activeFiltersContainer = document.getElementById('active-filters');
        if (activeFiltersContainer) {
            activeFiltersContainer.innerHTML = '<div class="filter-instructions">Select columns above to add filters</div>';
        }
        
        // Reset to show all data
        this.filteredData = [...this.datasets[this.currentDataset].data];
        this.renderTable(this.filteredData);
        this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
        
        console.log('All filters cleared');
    }

    calculateColumnDomains() {
        console.log('Calculating column domains...');
        this.columnDomains.clear(); // Clear any existing domains
        
        try {
            Object.keys(this.datasets).forEach(datasetKey => {
                const dataset = this.datasets[datasetKey];
                if (!dataset || !dataset.columns || !dataset.data) {
                    console.warn(`Skipping invalid dataset: ${datasetKey}`);
                    return;
                }
                
                console.log(`Processing dataset: ${datasetKey} with ${dataset.columns.length} columns`);
                
                dataset.columns.forEach((column, columnIndex) => {
                    try {
                        // Limit sample size for large datasets to prevent memory issues
                        const sampleSize = Math.min(1000, dataset.data.length);
                        const sampleData = dataset.data.slice(0, sampleSize);
                        
                        const values = sampleData
                            .map(row => row[column])
                            .filter(val => val !== undefined && val !== '' && val !== null);
                        
                        if (values.length === 0) {
                            console.warn(`No valid values found for ${datasetKey}.${column}`);
                            return;
                        }
                        
                        const numericValues = values
                            .map(val => parseFloat(val))
                            .filter(val => !isNaN(val) && isFinite(val));
                        
                        // Determine if column is numeric (> 50% of values are numeric)
                        const isNumeric = numericValues.length > values.length * 0.5;
                        
                        const domain = {
                            type: isNumeric ? 'numeric' : 'categorical',
                            values: isNumeric ? [] : [...new Set(values.slice(0, 100))].sort(), // Limit categorical values
                            min: isNumeric && numericValues.length > 0 ? Math.min(...numericValues) : null,
                            max: isNumeric && numericValues.length > 0 ? Math.max(...numericValues) : null,
                            dataset: datasetKey,
                            sampleSize: values.length
                        };
                        
                        const domainKey = `${datasetKey}.${column}`;
                        this.columnDomains.set(domainKey, domain);
                        
                        if (columnIndex < 5) { // Only log first few columns to avoid spam
                            console.log(`Domain for ${domainKey}: ${domain.type}, min: ${domain.min}, max: ${domain.max}`);
                        }
                    } catch (columnError) {
                        console.error(`Error processing column ${datasetKey}.${column}:`, columnError);
                    }
                });
            });
            
            console.log(`Total domains calculated: ${this.columnDomains.size}`);
            
        } catch (error) {
            console.error('Error calculating column domains:', error);
            throw new Error(`Domain calculation failed: ${error.message}`);
        }
    }
}

// Global functions for HTML onclick events
window.executeQuery = function() {
    if (window.datasetExplorer) {
        window.datasetExplorer.executeQuery();
    }
};

window.resetQuery = function() {
    if (window.datasetExplorer) {
        window.datasetExplorer.resetQuery();
    }
};

window.applyFilters = function() {
    if (window.datasetExplorer) {
        window.datasetExplorer.applyFilters();
    }
};

window.loadExampleQuery = function(type) {
    if (window.datasetExplorer) {
        window.datasetExplorer.loadExampleQuery(type);
    }
};

window.exportFilteredData = function(format) {
    if (window.datasetExplorer) {
        window.datasetExplorer.exportFilteredData(format);
    }
};

// Advanced Filter Functions
window.toggleColumnSelector = function() {
    console.log('toggleColumnSelector called');
    const dropdown = document.getElementById('column-dropdown');
    const toggle = document.getElementById('column-selector-toggle');
    
    if (!dropdown) {
        console.error('Dropdown element not found');
        return;
    }
    
    if (!toggle) {
        console.error('Toggle button element not found');
        return;
    }
    
    console.log('Current dropdown display:', dropdown.style.display);
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        toggle.classList.add('active');
        console.log('Dropdown opened');
    } else {
        dropdown.style.display = 'none';
        toggle.classList.remove('active');
        console.log('Dropdown closed');
    }
};

window.toggleColumnFilter = function(dataset, column) {
    if (window.datasetExplorer) {
        window.datasetExplorer.toggleColumnFilter(dataset, column);
    }
};

window.removeFilterControl = function(filterId) {
    if (window.datasetExplorer) {
        window.datasetExplorer.removeFilterControl(filterId);
    }
};

window.applyAdvancedFilters = function() {
    if (window.datasetExplorer) {
        window.datasetExplorer.applyAdvancedFilters();
    }
};

window.clearAllFilters = function() {
    if (window.datasetExplorer) {
        window.datasetExplorer.clearAllFilters();
    }
};

// Close dropdown when clicking outside (with delay to prevent immediate closing)
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('column-dropdown');
    const toggle = document.getElementById('column-selector-toggle');
    
    // Only close if dropdown is open and click is outside
    if (dropdown && toggle && 
        dropdown.style.display === 'block' &&
        !toggle.contains(event.target) && 
        !dropdown.contains(event.target)) {
        
        dropdown.style.display = 'none';
        toggle.classList.remove('active');
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing dataset explorer...');
    
    // Check if required elements exist
    const requiredElements = [
        'data-table-container',
        'active-filters',
        'column-dropdown'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        setTimeout(() => {
            console.log('Retrying initialization after delay...');
            if (missingElements.every(id => document.getElementById(id))) {
                window.datasetExplorer = new DatasetExplorer();
            } else {
                console.error('Still missing elements after retry, initialization failed');
            }
        }, 2000);
        return;
    }
    
    // Initialize immediately if all elements are present
    try {
        window.datasetExplorer = new DatasetExplorer();
    } catch (error) {
        console.error('Error initializing DatasetExplorer:', error);
        // Show error message to user
        const container = document.getElementById('data-table-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    <h3>Initialization Error</h3>
                    <p>Failed to initialize the data explorer. Please refresh the page.</p>
                    <p style="font-size: 0.8rem; margin-top: 1rem;">${error.message}</p>
                </div>
            `;
        }
    }
});