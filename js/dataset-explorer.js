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
        this.init();
    }

    init() {
        this.loadAllDatasets();
        this.setupEventListeners();
    }

    async loadAllDatasets() {
        try {
            // Load all three datasets
            await Promise.all([
                this.loadDataset('building', 'datasets/csv_building_info_total.csv'),
                this.loadDataset('windows', 'datasets/csv_export_windows_total.csv'),
                this.loadDataset('rooms', 'datasets/csv_export_rooms_total.csv')
            ]);
            
            // Display building info by default
            this.switchDataset('building');
            this.populateFilters();
        } catch (error) {
            console.error('Error loading datasets:', error);
            this.showError('Failed to load datasets');
        }
    }

    async loadDataset(type, filepath) {
        const response = await fetch(filepath);
        const csvText = await response.text();
        this.parseCSV(csvText, type);
    }

    parseCSV(csvText, type) {
        const lines = csvText.trim().split('\n');
        const columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
        
        const data = lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const row = {};
            columns.forEach((col, index) => {
                row[col] = values[index] || '';
            });
            return row;
        });

        this.datasets[type].data = data;
        this.datasets[type].columns = columns;
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

    switchDataset(type) {
        this.currentDataset = type;
        this.filteredData = [...this.datasets[type].data];
        this.renderTable(this.filteredData);
        this.updateRowCount(this.filteredData.length, this.datasets[type].data.length);
        this.updateAnalysisFilter(type);
    }

    updateAnalysisFilter(selectedType) {
        const analysisSelect = document.getElementById('analysis-filter');
        
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
        const climateFilter = document.getElementById('climate-filter').value;
        const analysisFilter = document.getElementById('analysis-filter').value;

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
            const result = this.parseSimpleQuery(query);
            this.filteredData = result;
            this.renderTable(this.filteredData);
            this.updateRowCount(this.filteredData.length, this.datasets[this.currentDataset].data.length);
        } catch (error) {
            alert('Query error: ' + error.message);
        }
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

        throw new Error('Unsupported query format. Use: SELECT * WHERE column = value');
    }

    evaluateWhereClause(row, whereClause) {
        // Handle LIKE operator for partial matches
        const likeMatch = whereClause.match(/(\w+)\s+LIKE\s+['"](.*?)['"]?/i);
        if (likeMatch) {
            const [, column, value] = likeMatch;
            const actualValue = row[column] || '';
            return actualValue.toLowerCase().includes(value.toLowerCase());
        }

        // Simple equality check: column = 'value'
        const eqMatch = whereClause.match(/(\w+)\s*=\s*['"](.*?)['"]?/i);
        if (eqMatch) {
            const [, column, value] = eqMatch;
            return row[column] && row[column].toString() === value;
        }

        // Greater than check: column > value
        const gtMatch = whereClause.match(/(\w+)\s*>\s*(\d+)/i);
        if (gtMatch) {
            const [, column, value] = gtMatch;
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue > parseFloat(value);
        }

        // Less than check: column < value
        const ltMatch = whereClause.match(/(\w+)\s*<\s*(\d+)/i);
        if (ltMatch) {
            const [, column, value] = ltMatch;
            const numValue = parseFloat(row[column]);
            return !isNaN(numValue) && numValue < parseFloat(value);
        }

        return true;
    }

    loadExampleQuery(type) {
        const examples = {
            building: "SELECT * WHERE apartment_count > 10",
            energy: "SELECT * WHERE levels_count > 5",
            daylight: "SELECT * WHERE apartment_count < 20", 
            climate: "SELECT * WHERE address LIKE 'Bangkok'"
        };

        const query = examples[type] || examples.building;
        document.getElementById('sql-query').value = query;
    }

    resetQuery() {
        document.getElementById('sql-query').value = '';
        document.getElementById('apartment-min').value = '';
        document.getElementById('apartment-max').value = '';
        document.getElementById('levels-min').value = '';
        document.getElementById('levels-max').value = '';
        document.getElementById('climate-filter').value = '';
        document.getElementById('analysis-filter').value = '';
        
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
        const climateFilter = document.getElementById('climate-filter').value;

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

    showError(message) {
        const container = document.getElementById('data-table-container');
        container.innerHTML = `
            <p style="text-align: center; padding: 2rem; color: #dc2626;">${message}</p>
        `;
    }

    setupEventListeners() {
        // These will be attached when the page loads
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for other scripts to load
    setTimeout(() => {
        window.datasetExplorer = new DatasetExplorer();
    }, 1000);
});