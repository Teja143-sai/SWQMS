// Initialize connection status as offline by default
let isConnected = false;
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

// Function to update connection status
function updateConnectionStatus(connected) {
    isConnected = connected;
    if (connected) {
        connectionStatus.classList.remove('offline');
        connectionStatus.classList.add('online');
        statusText.textContent = 'System Online';
    } else {
        connectionStatus.classList.remove('online');
        connectionStatus.classList.add('offline');
        statusText.textContent = 'Disconnected';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initNavigation();
    initParticles();
    
    // Initialize chart first
    initChart();
    
    // Initial data fetch
    fetchRealData();
    
    // Set up auto-refresh every 5 seconds (reduced frequency)
    setInterval(fetchRealData, 5000);
    
    // Initialize how it works animation
    initHowItWorks();
    
    // Initialize calibration functionality
    initCalibration();
    
    // Smooth scroll to top with a more visible animation
    const scrollToTop = (duration = 1000) => {
        const start = window.pageYOffset;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Ease in-out function for smoother animation
            const easeInOutCubic = t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
            const scrollY = start - (start * easeInOutCubic(progress));
            
            window.scrollTo(0, scrollY);
            
            if (timeElapsed < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                window.scrollTo(0, 0); // Ensure we're exactly at the top
            }
        };
        
        window.requestAnimationFrame(animateScroll);
    };
    
    // Start the smooth scroll after a short delay to ensure everything is loaded
    setTimeout(scrollToTop, 300);
});

// ==========================================
//           NAVIGATION & UI
// ==========================================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if(hamburger) hamburger.classList.remove('active');
            if(navLinks) navLinks.classList.remove('active');
        });
    });
}

// ==========================================
//           PARTICLES BACKGROUND
// ==========================================
function initParticles() {
    // check if particlesJS is loaded
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#00b4d8' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: '#00b4d8', opacity: 0.2, width: 1 },
                move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
            },
            interactivity: {
                detect_on: 'canvas',
                events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } }
            },
            retina_detect: true
        });
    }
}

// ==========================================
//           CHART INITIALIZATION & DATA
// ==========================================
let dataChart;
let chartData = {
    labels: [],
    datasets: {
        ph: [],
        tds: [],
        turbidity: [],
        temperature: [],
        timestamps: []
    }
};

// Chart configuration
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'pH',
                data: [],
                borderColor: '#00f0ff',  // Brighter blue
                backgroundColor: 'rgba(0, 240, 255, 0.2)',
                borderWidth: 3,  // Slightly thicker line
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            },
            {
                label: 'TDS (PPM)',
                data: [],
                borderColor: '#00ff88',  // Bright green
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            },
            {
                label: 'Turbidity',
                data: [],
                borderColor: '#ff9f43',  // Brighter orange
                backgroundColor: 'rgba(255, 159, 67, 0.2)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            },
            {
                label: 'Temp (°C)',
                data: [],
                borderColor: '#ff6b6b',  // Brighter red
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                borderWidth: 3,
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                grid: { 
                    display: false,
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: { 
                    color: 'rgba(255, 255, 255, 0.6)',
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: { 
                grid: { 
                    color: 'rgba(255, 255, 255, 0.05)' 
                },
                ticks: { 
                    color: 'rgba(255, 255, 255, 0.6)' 
                }
            }
        },
        plugins: {
            legend: { 
                labels: { 
                    color: 'white',
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                },
                position: 'top',
                align: 'end'
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#e1f5fe',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2);
                            if (label.includes('Temp')) label += '°C';
                            else if (label.includes('TDS')) label += ' PPM';
                        }
                        return label;
                    }
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        elements: {
            line: {
                borderWidth: 2
            }
        }
    }
};

function initChart() {
    const ctx = document.getElementById('dataChart');
    if (!ctx) return;

    // Initialize Chart.js
    dataChart = new Chart(ctx, chartConfig);
    
    // Set up event listeners
    setupChartControls();
    
    // Set default date range (last 24 hours)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    
    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;
    
    // Load initial data
    loadHistoricalData(startDate, endDate);
}

function setupChartControls() {
    // Time range buttons
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const range = this.getAttribute('data-time');
            updateTimeRange(range);
            timeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Date pickers
    const datePickers = document.querySelectorAll('.date-picker');
    datePickers.forEach(picker => {
        picker.addEventListener('change', function() {
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            loadHistoricalData(startDate, endDate);
            
            // Remove active state from time buttons when using custom date
            timeButtons.forEach(btn => btn.classList.remove('active'));
        });
    });
}

function updateTimeRange(range) {
    const endDate = new Date();
    let startDate = new Date();
    
    switch(range) {
        case '24h':
            startDate.setDate(startDate.getDate() - 1);
            break;
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        default:
            startDate.setDate(startDate.getDate() - 1);
    }
    
    document.getElementById('startDate').valueAsDate = startDate;
    document.getElementById('endDate').valueAsDate = endDate;
    
    loadHistoricalData(startDate, endDate);
}

async function loadHistoricalData(startDate, endDate) {
    const loadingElement = document.getElementById('chartLoading');
    if (loadingElement) loadingElement.style.display = 'flex';
    
    try {
        // In a real app, you would fetch data from your API here
        // For now, we'll use the existing data points and filter them
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Filter data based on date range
        const filteredData = filterDataByDateRange(startDate, endDate);
        
        // Update chart
        updateChart(filteredData);
        
        // Update summary cards
        updateSummaryCards(filteredData);
        
    } catch (error) {
        console.error('Error loading historical data:', error);
        showToast('Failed to load historical data', 'error');
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function filterDataByDateRange(startDate, endDate) {
    // In a real app, this would be handled by the API
    // For now, we'll just return a sample of the data
    return {
        labels: Array.from({length: 24}, (_, i) => {
            const date = new Date();
            date.setHours(date.getHours() - 23 + i);
            return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        }),
        ph: Array.from({length: 24}, () => 6.5 + Math.random() * 2),
        tds: Array.from({length: 24}, () => Math.floor(50 + Math.random() * 250)),
        turbidity: Array.from({length: 24}, () => Math.random() * 10),
        temperature: Array.from({length: 24}, () => 15 + Math.random() * 15)
    };
}

function updateChart(data) {
    if (!dataChart) return;
    
    // Update chart data
    dataChart.data.labels = data.labels;
    dataChart.data.datasets[0].data = data.ph;
    dataChart.data.datasets[1].data = data.tds;
    dataChart.data.datasets[2].data = data.turbidity;
    dataChart.data.datasets[3].data = data.temperature;
    
    // Update the chart
    dataChart.update();
    
    // Update data points count
    document.getElementById('dataPointsCount').textContent = data.labels.length;
    
    // Update time range display
    const startDate = document.getElementById('startDate').valueAsDate;
    const endDate = document.getElementById('endDate').valueAsDate;
    
    const formatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const startStr = startDate.toLocaleDateString(undefined, formatOptions);
    const endStr = endDate.toLocaleDateString(undefined, formatOptions);
    
    document.getElementById('timeRange').textContent = `${startStr} - ${endStr}`;
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
}

function updateSummaryCards(data) {
    if (!data) return;
    
    // Calculate averages
    const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
    
    // Update summary cards with calculated data
    // In a real app, you would calculate min, max, avg, etc.
    document.getElementById('dataPointsCount').textContent = data.labels.length;
}

// Export chart data as CSV
function exportChartData() {
    if (!dataChart) return;
    
    const headers = ['Time', 'pH', 'TDS (PPM)', 'Turbidity', 'Temperature (°C)'];
    const data = [];
    
    // Add headers
    data.push(headers.join(','));
    
    // Add data rows
    for (let i = 0; i < dataChart.data.labels.length; i++) {
        const row = [
            dataChart.data.labels[i],
            dataChart.data.datasets[0].data[i],
            dataChart.data.datasets[1].data[i],
            dataChart.data.datasets[2].data[i],
            dataChart.data.datasets[3].data[i]
        ];
        data.push(row.join(','));
    }
    
    // Create CSV content
    const csvContent = data.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set download attributes
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `water_quality_data_${dateStr}.csv`);
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast('Data exported successfully!');
    }, 100);
}

// ==========================================
//      CORE FUNCTION: FETCH REAL DATA
// ==========================================
// Track connection attempts
let connectionAttempts = 0;
const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 3000; // 3 seconds

async function fetchRealData() {
    try {
        // Show connecting status
        updateConnectionStatus('connecting');
        
        // 1. Fetch from ESP32
        const response = await fetch('http://10.103.72.192/data', {
            timeout: 5000 // 5 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 2. Parse JSON
        const rawData = await response.json();
        
        // Reset attempts on successful connection
        connectionAttempts = 0;
        
        // 3. Update connection status to online if we got valid data
        updateConnectionStatus(true);

        // 4. Process the data
        const processedData = {
            ph: parseFloat(rawData.ph),
            tds: parseFloat(rawData.tds),
            turbidity: rawData.turb === "DIRTY" ? 10.0 : 0.5, 
            turbStatus: rawData.turb || 'UNKNOWN',
            temperature: parseFloat(rawData.temp)
        };

        // 5. Update the Dashboard
        updateDashboard(processedData);
        addDataPointToChart(processedData);

    } catch (error) {
        console.error('Connection Failed:', error);
        connectionAttempts++;
        
        // Show appropriate status
        updateConnectionStatus(false, error.message);
        
        // Try to reconnect if we haven't exceeded max attempts
        if (connectionAttempts < MAX_ATTEMPTS) {
            console.log(`Retrying in ${RETRY_DELAY/1000} seconds... (Attempt ${connectionAttempts}/${MAX_ATTEMPTS})`);
            setTimeout(fetchRealData, RETRY_DELAY);
        } else {
            console.error('Max connection attempts reached. Please check your ESP32 connection.');
            
            // Uncomment to use mock data when offline
            // const mockData = generateMockData();
            // updateDashboard(mockData);
        }
    }
}
// ==========================================
//           UPDATE DASHBOARD UI
// ==========================================

// Update Dashboard with new data
function updateDashboard(data) {
    if (!data) return;
    
    try {
        // Update Sensor Cards
        updateSensor('phSensor', data.ph, 0, 14, 'pH');
        updateSensor('tdsSensor', data.tds, 0, 1000, 'ppm');
        updateSensor('turbiditySensor', data.turbidity, 0, 100, 'NTU');
        updateSensor('tempSensor', data.temperature, -10, 50, '°C');
        
        // Update Water Quality Cards (static educational content only)
        updateWaterQualityCards();
        
        // Calculate Scores
        const phScore = calculateScore(data.ph, 6.5, 8.5, true);
        const tdsScore = calculateScore(data.tds, 50, 500, false);
        const turbScore = calculateScore(data.turbidity, 0, 5, false);
        const tempScore = calculateScore(data.temperature, 10, 30, true);
        
        // Overall Score (weighted average)
        const overallScore = Math.round((phScore * 0.3) + (tdsScore * 0.2) + (turbScore * 0.3) + (tempScore * 0.2));
        
        // Update UI
        updateDroplet(overallScore);
        generateInsights(data, overallScore);
        
        console.log('Dashboard updated successfully');
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Update Water Quality Cards with static educational information
function updateWaterQualityCards() {
    // This function is intentionally left empty as we don't want real-time updates
    // The cards are now static and for educational purposes only
    
    // Hide any status indicators if they exist
    document.querySelectorAll('.status-indicator, .param-status, .action-tip').forEach(el => {
        el.style.display = 'none';
    });
    
    // Clear any dynamic values
    document.querySelectorAll('.param-value').forEach(el => {
        el.textContent = '';
    });
}

// Update a single quality card
function updateQualityCard(type, value, min, max, isOptimalInMiddle) {
    const card = document.querySelector(`.science-card[data-param="${type}"]`);
    if (!card) return;
    
    const statusIndicator = card.querySelector('.status-indicator');
    const currentValue = card.querySelector('.param-value');
    const statusElement = card.querySelector('.param-status');
    const statusText = card.querySelector('.status-text');
    const ratingElement = card.querySelector('.rating-stars');
    
    // Update current value display
    if (currentValue) {
        if (type === 'temp') {
            currentValue.textContent = `${Math.round(value)}°C`;
        } else if (type === 'ph') {
            currentValue.textContent = value.toFixed(1);
        } else {
            currentValue.textContent = Math.round(value);
        }
    }
    
    // Determine status
    let status, statusClass, statusMessage, rating;
    
    if (isOptimalInMiddle) {
        // For parameters where the middle is optimal (like pH)
        const mid = (min + max) / 2;
        const range = (max - min) / 2;
        const distance = Math.abs(value - mid);
        
        if (distance <= range * 0.3) {
            status = 'SAFE';
            statusClass = 'safe';
            statusMessage = 'in the optimal range';
            rating = 5;
        } else if (distance <= range * 0.7) {
            status = 'WARNING';
            statusClass = 'warning';
            statusMessage = 'approaching limits';
            rating = 3;
        } else {
            status = 'UNSAFE';
            statusClass = 'danger';
            statusMessage = 'outside safe range';
            rating = 1;
        }
    } else {
        // For parameters where lower is better (like TDS, Turbidity, Temperature)
        const safeThreshold = min + (max - min) * 0.7;
        const warningThreshold = min + (max - min) * 0.9;
        
        if (value <= safeThreshold) {
            status = 'SAFE';
            statusClass = 'safe';
            statusMessage = 'within safe limits';
            rating = 5;
        } else if (value <= warningThreshold) {
            status = 'WARNING';
            statusClass = 'warning';
            statusMessage = 'approaching unsafe levels';
            rating = 3;
        } else {
            status = 'UNSAFE';
            statusClass = 'danger';
            statusMessage = 'above safe limits';
            rating = 1;
        }
    }
    
    // Update status indicator
    if (statusIndicator) {
        statusIndicator.className = 'status-indicator';
        statusIndicator.classList.add(statusClass);
    }
    
    // Update status text
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = 'param-status';
        statusElement.classList.add(statusClass);
    }
    
    // Update status text in the tip
    if (statusText) {
        statusText.textContent = statusMessage;
        statusText.className = 'status-text';
        statusText.classList.add(statusClass);
    }
    
    // Update rating stars
    if (ratingElement) {
        const stars = ratingElement.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.opacity = '1';
            } else {
                star.style.opacity = '0.3';
            }
        });
    }
}

// Helper to update individual sensor cards
function updateSensor(sensorId, value, min, max, unit) {
    const sensor = document.getElementById(sensorId);
    if (!sensor) return;
    
    const valueElement = sensor.querySelector('.sensor-value');
    
    // Update Text Value
    if (valueElement) {
        // If it's a number, format it. If it's text (like CLEAR), just show it.
        if(typeof value === 'number') {
            valueElement.textContent = unit === 'pH' ? value.toFixed(1) : Math.round(value);
            if(unit) valueElement.textContent += ` ${unit}`;
        } else {
            valueElement.textContent = value;
        }
    }
    
    // Update sensor visuals
    updateSensorVisuals(sensor, value, min, max);
}

function updateSensorVisuals(sensorElement, value, min, max) {
    const statusElement = sensorElement.querySelector('.sensor-status');
    const liquidElement = sensorElement.querySelector('.sensor-liquid');
    const sensorId = sensorElement.id;
    
    // Calculate liquid height %
    // Ensure value is a number for math
    let numVal = typeof value === 'string' ? (value === "DIRTY" ? 10 : 0) : value;
    let percentage = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));
    
    if (liquidElement) liquidElement.style.height = `${percentage}%`;

    // Determine Status Color based on sensor type and value
    let status = 'SAFE';
    let colorClass = 'status-safe';
    let colorHex = '#4CAF50'; // Green

    // Apply specific logic based on sensor type
    if (sensorId === 'phSensor') {
        if (numVal >= 6.5 && numVal <= 8.5) {
            status = 'SAFE';
            colorClass = 'status-safe';
            colorHex = '#4CAF50'; // Green
        } else {
            status = 'UNSAFE';
            colorClass = 'status-danger';
            colorHex = '#f44336'; // Red
        }
    } 
    else if (sensorId === 'tdsSensor') {
        if (numVal <= 500) {
            status = 'SAFE';
            colorClass = 'status-safe';
            colorHex = '#4CAF50'; // Green
        } else {
            status = 'UNSAFE';
            colorClass = 'status-danger';
            colorHex = '#f44336'; // Red
        }
    }
    else if (sensorId === 'turbiditySensor') {
        if (numVal < 5 || value === 'CLEAR') {
            status = 'SAFE';
            colorClass = 'status-safe';
            colorHex = '#4CAF50'; // Green
        } else {
            status = 'UNSAFE';
            colorClass = 'status-danger';
            colorHex = '#f44336'; // Red
        }
    }
    else if (sensorId === 'tempSensor') {
        if (numVal <= 30) {
            status = 'SAFE';
            colorClass = 'status-safe';
            colorHex = '#4CAF50'; // Green
        } else {
            status = 'UNSAFE';
            colorClass = 'status-danger';
            colorHex = '#f44336'; // Red
        }
    }

    // Update status text and color
    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `sensor-status ${colorClass}`;
    }
    
    // Update liquid color
    if (liquidElement) {
        liquidElement.style.background = `linear-gradient(transparent, ${colorHex})`;
    }
}

// ==========================================
//           SCORING & INSIGHTS
// ==========================================
function calculateScore(value, min, max, isOptimalInMiddle) {
    if (isOptimalInMiddle) {
        const mid = (min + max) / 2;
        const range = (max - min) / 2;
        const distance = Math.abs(value - mid);
        return Math.max(0, 100 - (distance / range) * 100);
    } else {
        return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    }
}

// Update insights based on current sensor data
function updateInsights(data) {
    const insightsContainer = document.getElementById('insightMessages');
    if (!insightsContainer) return;
    
    // Clear existing insights
    insightsContainer.innerHTML = '';
    
    // Calculate overall water quality score (average of all sensor scores)
    const phScore = calculateScore(data.ph, 6.5, 8.5, true);
    const tdsScore = calculateScore(data.tds, 0, 500, false);
    const turbidityScore = calculateScore(data.turbidity, 0, 5, false);
    const tempScore = calculateScore(data.temperature, 10, 30, true);
    
    const overallScore = (phScore + tdsScore + turbidityScore + tempScore) / 4;
    
    // Generate insights based on sensor data
    const insights = [];
    
    // pH insights
    if (data.ph < 6.5) {
        insights.push({
            message: `Low pH detected (${data.ph.toFixed(1)}). Water is acidic. Consider adding alkaline minerals.`,
            icon: '⚠️',
            type: 'warning'
        });
    } else if (data.ph > 8.5) {
        insights.push({
            message: `High pH detected (${data.ph.toFixed(1)}). Water is alkaline. Consider adding pH reducer.`,
            icon: '⚠️',
            type: 'warning'
        });
    }
    
    // TDS insights
    if (data.tds > 500) {
        insights.push({
            message: `High TDS level (${data.tds} PPM). Water may contain high levels of dissolved solids. Consider filtration.`,
            icon: '🔍',
            type: 'warning'
        });
    }
    
    // Turbidity insights
    if (data.turbidity > 5) {
        insights.push({
            message: `High turbidity detected (${data.turbidity.toFixed(1)} NTU). Water may appear cloudy or hazy.`,
            icon: '🌫️',
            type: 'danger'
        });
    }
    
    // Temperature insights
    if (data.temperature < 10) {
        insights.push({
            message: `Low water temperature (${data.temperature.toFixed(1)}°C). This may affect water quality and sensor readings.`,
            icon: '❄️',
            type: 'info'
        });
    } else if (data.temperature > 30) {
        insights.push({
            message: `High water temperature (${data.temperature.toFixed(1)}°C). This may promote bacterial growth.`,
            icon: '🔥',
            type: 'warning'
        });
    }
    
    // Overall water quality insight
    if (overallScore > 80) {
        insights.unshift({
            message: 'Water quality is excellent! All parameters are within optimal ranges.',
            icon: '✅',
            type: 'success'
        });
    } else if (overallScore > 60) {
        insights.unshift({
            message: 'Water quality is good. Some parameters may need attention.',
            icon: 'ℹ️',
            type: 'info'
        });
    } else {
        insights.unshift({
            message: 'Water quality needs attention. Check the highlighted parameters.',
            icon: '⚠️',
            type: 'danger',
            important: true
        });
    }
    
    // Add timestamp
    insights.unshift({
        message: `Last updated: ${new Date().toLocaleTimeString()}`,
        icon: '🕒',
        type: 'info',
        small: true
    });
    
    // Display insights
    insights.forEach((insight, index) => {
        const insightElement = document.createElement('div');
        insightElement.className = `insight-item ${insight.small ? 'small' : ''}`;
        
        const iconElement = document.createElement('div');
        iconElement.className = 'insight-icon';
        iconElement.textContent = insight.icon;
        
        const textElement = document.createElement('div');
        textElement.className = 'insight-text';
        textElement.textContent = insight.message;
        
        insightElement.appendChild(iconElement);
        insightElement.appendChild(textElement);
        
        const messageElement = document.createElement('div');
        messageElement.className = `insight-message ${insight.type} ${insight.important ? 'important' : ''}`;
        messageElement.appendChild(insightElement);
        
        // Add fade-in animation for new messages
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        insightsContainer.insertBefore(messageElement, insightsContainer.firstChild);
        
        // Trigger reflow
        void messageElement.offsetHeight;
        
        // Animate in
        messageElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
        
        // Remove old messages if there are too many
        if (insightsContainer.children.length > 5) {
            const lastMessage = insightsContainer.lastElementChild;
            lastMessage.style.opacity = '0';
            lastMessage.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (lastMessage.parentNode === insightsContainer) {
                    insightsContainer.removeChild(lastMessage);
                }
            }, 500);
        }
    });
}

function updateDroplet(score) {
    const droplet = document.getElementById('qualityDroplet');
    const scoreElement = document.getElementById('qualityScore');
    const statusElement = document.getElementById('qualityStatus');
    
    if (!droplet || !scoreElement) return;
    
    scoreElement.textContent = `${score}%`;
    
    if (score < 40) {
        statusElement.textContent = 'POOR QUALITY';
        droplet.style.background = 'linear-gradient(135deg, rgba(244, 67, 54, 0.3), rgba(183, 28, 28, 0.2))';
        droplet.style.boxShadow = '0 0 50px rgba(244, 67, 54, 0.4)';
    } else if (score < 70) {
        statusElement.textContent = 'FAIR QUALITY';
        droplet.style.background = 'linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(230, 81, 0, 0.2))';
        droplet.style.boxShadow = '0 0 50px rgba(255, 152, 0, 0.4)';
    } else {
        statusElement.textContent = 'GOOD QUALITY';
        droplet.style.background = 'linear-gradient(135deg, rgba(0, 180, 216, 0.3), rgba(72, 149, 239, 0.2))';
        droplet.style.boxShadow = '0 0 50px rgba(0, 180, 216, 0.4)';
    }
}

// ==========================================
//           CALIBRATION FUNCTIONALITY
// ==========================================

// Calibrate sensor function
async function calibrateSensor(sensorType) {
    try {
        // Show loading state
        const calibrateBtn = document.getElementById('confirmCalibrate');
        const originalText = calibrateBtn.innerHTML;
        calibrateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calibrating...';
        calibrateBtn.disabled = true;

        // Send calibration request to ESP32
        const response = await fetch(`http://10.13.62.192/calibrate?target=${sensorType}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.text();
        
        if (result.includes('Calibration Success')) {
            // Show success modal
            document.getElementById('calibrationModal').style.display = 'none';
            document.getElementById('successModal').style.display = 'block';
        } else {
            throw new Error('Calibration failed: ' + result);
        }
    } catch (error) {
        console.error('Calibration error:', error);
        alert('Calibration failed. Please try again.\n' + error.message);
    } finally {
        // Reset button state
        const calibrateBtn = document.getElementById('confirmCalibrate');
        if (calibrateBtn) {
            calibrateBtn.innerHTML = 'Calibrate Now';
            calibrateBtn.disabled = false;
        }
    }
}

// Initialize calibration modal
function initCalibration() {
    const modal = document.getElementById('calibrationModal');
    const btn = document.getElementById('calibrateBtn');
    const span = document.getElementsByClassName('close-modal')[0];
    const confirmBtn = document.getElementById('confirmCalibrate');
    const closeSuccessBtn = document.getElementById('closeSuccessModal');
    const successModal = document.getElementById('successModal');

    // Open modal when button is clicked
    if (btn) {
        btn.onclick = function() {
            modal.style.display = 'block';
        };
    }

    // Close modal when 'x' is clicked
    if (span) {
        span.onclick = function() {
            modal.style.display = 'none';
        };
    }

    // Handle calibration confirmation
    if (confirmBtn) {
        confirmBtn.onclick = function() {
            const sensorType = document.getElementById('sensorSelect').value;
            calibrateSensor(sensorType);
        };
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == successModal) {
            successModal.style.display = 'none';
        }
    };

    // Close success modal
    if (closeSuccessBtn) {
        closeSuccessBtn.onclick = function() {
            successModal.style.display = 'none';
        };
    }
}

// ==========================================
//           DATA EXPORT FUNCTIONALITY
// ==========================================

// Export to CSV Function
function exportToCSV() {
    if (!dataChart || !dataChart.data.datasets.length) {
        showToast('No data available to export');
        return;
    }

    // Show loading toast
    const toast = showToast('Preparing report...');
    
    try {
        // Get chart data
        const labels = dataChart.data.labels;
        const datasets = dataChart.data.datasets;
        
        // Create CSV header
        let csvContent = 'Time,' + datasets.map(d => d.label).join(',') + '\n';
        
        // Add data rows
        for (let i = 0; i < labels.length; i++) {
            const row = [
                `"${labels[i]}"`,
                ...datasets.map(d => d.data[i] !== undefined ? d.data[i] : '')
            ];
            csvContent += row.join(',') + '\n';
        }
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Format date for filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
        
        // Set download attributes
        link.setAttribute('href', url);
        link.setAttribute('download', `Droplet_Water_Report_${dateStr}_${timeStr}.csv`);
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Update toast to show success
            updateToast(toast, 'Report downloaded successfully!');
        }, 100);
        
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        showToast('Failed to export data', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    // Set message and icon based on type
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = '#f44336';
    } else {
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = '#4caf50';
    }
    
    // Show toast
    toast.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
    
    return toast;
}

// Update existing toast
function updateToast(toast, newMessage, type = 'success') {
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('i');
    
    if (newMessage) toastMessage.textContent = newMessage;
    
    if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = '#f44336';
    } else {
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = '#4caf50';
    }
    
    // Reset the auto-hide timer
    clearTimeout(toast._timer);
    
    // Set new timer
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
    
    return toast;
}

// Add event listener for export button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    
    // Initialize How It Works animation
    initHowItWorks();
});

// How It Works Animation
function initHowItWorks() {
    const steps = document.querySelectorAll('.process-step');
    const dataPacket = document.querySelector('.data-packet');
    const connectionLine = document.querySelector('.connection-line');
    
    if (!steps.length || !dataPacket || !connectionLine) return;
    
    // Calculate positions for the data packet
    const lineRect = connectionLine.getBoundingClientRect();
    const lineStart = lineRect.left;
    const lineEnd = lineRect.right;
    const lineY = lineRect.top + lineRect.height / 2;
    
    // Position the data packet at the start
    dataPacket.style.top = '50%';
    dataPacket.style.left = '0';
    dataPacket.style.transform = 'translate(-50%, -50%)';
    
    // Animation function
    function animateDataPacket() {
        let position = 0;
        const speed = 0.5; // pixels per frame (adjust for speed)
        const totalDistance = lineRect.width;
        let animationId;
        
        function move() {
            position += speed;
            const progress = (position / totalDistance) * 100;
            
            // Update data packet position
            dataPacket.style.left = `${progress}%`;
            
            // Highlight active step
            const activeStep = Math.min(Math.floor(progress / 25) + 1, 4);
            steps.forEach(step => {
                const stepNum = parseInt(step.querySelector('.step-icon').dataset.step);
                const icon = step.querySelector('.step-icon');
                
                if (stepNum === activeStep) {
                    icon.classList.add('active');
                    // Trigger pulse effect
                    const pulse = icon.querySelector('.pulse');
                    if (pulse) {
                        pulse.style.animation = 'none';
                        void pulse.offsetWidth; // Trigger reflow
                        pulse.style.animation = 'pulse 1s ease-out';
                    }
                } else {
                    icon.classList.remove('active');
                }
            });
            
            // Reset position when reaching the end
            if (position < totalDistance) {
                animationId = requestAnimationFrame(move);
            } else {
                // Reset and restart animation
                position = 0;
                setTimeout(() => {
                    requestAnimationFrame(move);
                }, 500); // Short delay before restarting
            }
        }
        
        // Start animation
        move();
        
        // Return function to stop animation if needed
        return () => cancelAnimationFrame(animationId);
    }
    
    // Start animation
    const stopAnimation = animateDataPacket();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (stopAnimation) stopAnimation();
    });
    
    // Animate WiFi waves for the transmission step
    const wifiWaves = document.querySelectorAll('.wifi-waves span');
    if (wifiWaves.length) {
        wifiWaves.forEach((wave, index) => {
            wave.style.animationDelay = `${index * 0.2}s`;
        });
    }
}

function generateInsights(data, overallScore) {
    const insightsContainer = document.getElementById('insightMessages');
    if (!insightsContainer) return;
    
    insightsContainer.innerHTML = ''; // Clear old messages
    const insights = [];
    
    // Logic for messages
    if (data.ph < 6.5) insights.push({emoji: '⚠️', text: 'pH too Low (Acidic)'});
    else if (data.ph > 8.5) insights.push({emoji: '⚠️', text: 'pH too High (Alkaline)'});
    
    if (data.tds > 500) insights.push({emoji: '🧪', text: 'High TDS levels detected.'});
    
    if (data.turbidity > 5) insights.push({emoji: '🌊', text: 'Water is cloudy (High Turbidity).'});
    
    if (overallScore > 80) insights.unshift({emoji: '✅', text: 'Water Quality is Excellent.'});
    else if (overallScore < 50) insights.unshift({emoji: '❌', text: 'Water Quality is Poor.'});
    
    // Add to UI
    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.innerHTML = `<div class="insight-icon">${insight.emoji}</div><div class="insight-text">${insight.text}</div>`;
        insightsContainer.appendChild(div);
    });
}

function addDataPointToChart(data) {
    if (!dataChart) return;
    const now = new Date();
    const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    dataChart.data.labels.push(timeLabel);
    if (dataChart.data.labels.length > 20) dataChart.data.labels.shift();
    
    // Shift datasets
    dataChart.data.datasets.forEach(ds => { if(ds.data.length > 20) ds.data.shift(); });

    // Push new data
    dataChart.data.datasets[0].data.push(data.ph);
    dataChart.data.datasets[1].data.push(data.tds);
    dataChart.data.datasets[2].data.push(data.turbidity);
    dataChart.data.datasets[3].data.push(data.temperature);
    
    dataChart.update('none'); // Update without animation for smoothness
}

// Fallback Mock Data Generator (Used if you uncomment the error block)
function generateMockData() {
    return {
        ph: (Math.random() * 2 + 6).toFixed(1),
        tds: Math.floor(Math.random() * 300 + 50),
        turbidity: Math.random() > 0.8 ? 10 : 0.5,
        turbStatus: Math.random() > 0.8 ? "DIRTY" : "CLEAR",
        temperature: (Math.random() * 5 + 20).toFixed(1)
    };
}
