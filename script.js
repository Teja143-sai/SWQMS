// Initialize connection status as offline by default
let isConnected = false;
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
let connectionCheckInterval;

// Function to update connection status
function updateConnectionStatus(status) {
    if ((status === 'online' && connectionStatus.classList.contains('online')) ||
        (status === 'offline' && connectionStatus.classList.contains('offline'))) {
        return;
    }
    
    connectionStatus.classList.remove('online', 'offline', 'connecting');
    
    switch(status) {
        case 'online':
            connectionStatus.classList.add('online');
            statusText.textContent = 'System Online';
            break;
        case 'connecting':
            connectionStatus.classList.add('connecting');
            statusText.textContent = 'Connecting...';
            break;
        case 'offline':
        default:
            connectionStatus.classList.add('offline');
            statusText.textContent = 'Disconnected';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initParticles();
    initChart();
    fetchRealData();
    setInterval(fetchRealData, 5000);
    
    if(typeof initHowItWorks === 'function') initHowItWorks();
    if(typeof initCalibration === 'function') initCalibration();
    
    const scrollToTop = (duration = 1000) => {
        const start = window.pageYOffset;
        const startTime = performance.now();
        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeInOutCubic = t => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
            const scrollY = start - (start * easeInOutCubic(progress));
            window.scrollTo(0, scrollY);
            if (timeElapsed < duration) {
                window.requestAnimationFrame(animateScroll);
            } else {
                window.scrollTo(0, 0); 
            }
        };
        window.requestAnimationFrame(animateScroll);
    };
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

function initParticles() {
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
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'pH', data: [], borderColor: '#00f0ff', backgroundColor: 'rgba(0, 240, 255, 0.2)', borderWidth: 3, tension: 0.3, fill: true, pointRadius: 0, pointHoverRadius: 6 },
            { label: 'TDS (PPM)', data: [], borderColor: '#00ff88', backgroundColor: 'rgba(0, 255, 136, 0.2)', borderWidth: 3, tension: 0.3, fill: true, pointRadius: 0, pointHoverRadius: 6 },
            { label: 'Turbidity', data: [], borderColor: '#ff9f43', backgroundColor: 'rgba(255, 159, 67, 0.2)', borderWidth: 3, tension: 0.3, fill: true, pointRadius: 0, pointHoverRadius: 6 },
            { label: 'Temp (°C)', data: [], borderColor: '#ff6b6b', backgroundColor: 'rgba(255, 107, 107, 0.2)', borderWidth: 3, tension: 0.3, fill: true, pointRadius: 0, pointHoverRadius: 6 }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: {
            x: { grid: { display: false, color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'rgba(255, 255, 255, 0.6)', maxRotation: 45, minRotation: 45 } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'rgba(255, 255, 255, 0.6)' } }
        },
        plugins: {
            legend: { labels: { color: 'white', padding: 20, usePointStyle: true, pointStyle: 'circle' }, position: 'top', align: 'end' },
            tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#e1f5fe', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, padding: 12, usePointStyle: true }
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' }, elements: { line: { borderWidth: 2 } }
    }
};

function initChart() {
    const ctx = document.getElementById('dataChart');
    if (!ctx) return;
    dataChart = new Chart(ctx, chartConfig);
    setupChartControls();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    if(document.getElementById('startDate')) document.getElementById('startDate').valueAsDate = startDate;
    if(document.getElementById('endDate')) document.getElementById('endDate').valueAsDate = endDate;
    loadHistoricalData(startDate, endDate);
}

function setupChartControls() {
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            updateTimeRange(this.getAttribute('data-time'));
            timeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.querySelectorAll('.date-picker').forEach(picker => {
        picker.addEventListener('change', function() {
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            loadHistoricalData(startDate, endDate);
            timeButtons.forEach(btn => btn.classList.remove('active'));
        });
    });
}

function updateTimeRange(range) {
    const endDate = new Date();
    let startDate = new Date();
    switch(range) {
        case '24h': startDate.setDate(startDate.getDate() - 1); break;
        case '7d': startDate.setDate(startDate.getDate() - 7); break;
        case '30d': startDate.setDate(startDate.getDate() - 30); break;
        default: startDate.setDate(startDate.getDate() - 1);
    }
    if(document.getElementById('startDate')) document.getElementById('startDate').valueAsDate = startDate;
    if(document.getElementById('endDate')) document.getElementById('endDate').valueAsDate = endDate;
    loadHistoricalData(startDate, endDate);
}

async function loadHistoricalData(startDate, endDate) {
    const loadingElement = document.getElementById('chartLoading');
    if (loadingElement) loadingElement.style.display = 'flex';
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const filteredData = filterDataByDateRange(startDate, endDate);
        updateChart(filteredData);
    } catch (error) {
        console.error('Error loading historical data:', error);
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
    }
}

function filterDataByDateRange(startDate, endDate) {
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
    dataChart.data.labels = data.labels;
    dataChart.data.datasets[0].data = data.ph;
    dataChart.data.datasets[1].data = data.tds;
    dataChart.data.datasets[2].data = data.turbidity;
    dataChart.data.datasets[3].data = data.temperature;
    dataChart.update();
}

// ==========================================
//      CORE FUNCTION: FETCH REAL DATA
// ==========================================
let connectionAttempts = 0;
const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 3000;

async function fetchRealData() {
    try {
        if (!connectionStatus.classList.contains('online')) updateConnectionStatus('connecting');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); 
        const response = await fetch('http://10.97.248.192/data', { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const rawData = await response.json();
        connectionAttempts = 0;
        updateConnectionStatus('online');

        const processedData = {
            ph: parseFloat(rawData.ph),
            tds: parseFloat(rawData.tds.trim()),
            turbidity: rawData.turb === "DIRTY" ? 10.0 : 0.5, 
            turbStatus: rawData.turb || 'UNKNOWN',
            temperature: parseFloat(rawData.temp)
        };
        
        updateDashboard(processedData);
        if(typeof addDataPointToChart === 'function') addDataPointToChart(processedData);
    } catch (error) {
        connectionAttempts++;
        updateConnectionStatus('offline');
        if (connectionAttempts < MAX_ATTEMPTS) {
            setTimeout(fetchRealData, RETRY_DELAY);
        } else {
            console.error('Max connection attempts reached.');
        }
    }
}

// ==========================================
//           UPDATE DASHBOARD UI
// ==========================================
function updateDashboard(data) {
    if (!data) return;
    try {
        // Update 4 small sensor cards
        updateSensor('phSensor', data.ph, 0, 14, 'pH');
        updateSensor('tdsSensor', data.tds, 0, 1000, 'ppm');
        updateSensor('turbiditySensor', data.turbidity, 0, 100, 'NTU');
        updateSensor('tempSensor', data.temperature, -10, 50, '°C');
        
        // Calculate Accurate Scores based on Engineering Standards
        const phScore = calculateScore(data.ph, 'ph');
        const tdsScore = calculateScore(data.tds, 'tds');
        const turbScore = calculateScore(data.turbidity, 'turb');
        const tempScore = calculateScore(data.temperature, 'temp');
        
        // Calculate Overall Weighted Percentage
        let overallScore = Math.round((phScore * 0.3) + (tdsScore * 0.2) + (turbScore * 0.3) + (tempScore * 0.2));
        
        // --- DYNAMIC CRITICAL FAILURE OVERRIDE ---
        // Count how many sensors are detecting highly unsafe water
        let criticalFailures = 0;
        if (tdsScore === 0) criticalFailures++;
        if (phScore === 0) criticalFailures++;
        if (turbScore === 0) criticalFailures++;
        
        // Apply escalating penalties based on the failure count
        if (criticalFailures === 1) {
            overallScore = Math.min(overallScore, 35); // 1 critical failure caps score at 35%
        } else if (criticalFailures === 2) {
            overallScore = Math.min(overallScore, 15); // 2 critical failures caps score at 15%
        } else if (criticalFailures >= 3) {
            overallScore = 0; // 3+ failures = 0% (Completely toxic)
        }
        
        // Call the UI Updaters for the missing Percentage Bar and Insights
        updateDroplet(overallScore);
        generateInsights(data, overallScore);
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

function updateSensor(sensorId, value, min, max, unit) {
    const sensor = document.getElementById(sensorId);
    if (!sensor) return;
    const valueElement = sensor.querySelector('.sensor-value');
    if (valueElement) {
        if(typeof value === 'number') {
            valueElement.textContent = unit === 'pH' ? value.toFixed(1) : Math.round(value);
            if(unit) valueElement.textContent += ` ${unit}`;
        } else {
            valueElement.textContent = value;
        }
    }
    updateSensorVisuals(sensor, value, min, max);
}

function updateSensorVisuals(sensorElement, value, min, max) {
    const statusElement = sensorElement.querySelector('.sensor-status');
    const liquidElement = sensorElement.querySelector('.sensor-liquid');
    const sensorId = sensorElement.id;
    
    let numVal = typeof value === 'string' ? (value === "DIRTY" ? 10 : 0) : value;
    let percentage = Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));
    if (liquidElement) liquidElement.style.height = `${percentage}%`;

    let status = 'SAFE', colorClass = 'status-safe', colorHex = '#4CAF50'; 

    if (sensorId === 'phSensor') {
        if (numVal < 6.5 || numVal > 8.5) { status = 'UNSAFE'; colorClass = 'status-danger'; colorHex = '#f44336'; }
    } else if (sensorId === 'tdsSensor') {
        if (numVal > 500) { status = 'UNSAFE'; colorClass = 'status-danger'; colorHex = '#f44336'; }
    } else if (sensorId === 'turbiditySensor') {
        if (numVal >= 5 && value !== 'CLEAR') { status = 'UNSAFE'; colorClass = 'status-danger'; colorHex = '#f44336'; }
    } else if (sensorId === 'tempSensor') {
        if (numVal > 35) { status = 'UNSAFE'; colorClass = 'status-danger'; colorHex = '#f44336'; }
    }

    if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `sensor-status ${colorClass}`;
    }
    if (liquidElement) liquidElement.style.background = `linear-gradient(transparent, ${colorHex})`;
}

// ==========================================
//           SCORING MATH & LOGIC
// ==========================================
function calculateScore(value, type) {
    if (type === 'ph') {
        if (value >= 6.5 && value <= 8.5) return 100;
        if (value < 6.5) return Math.max(0, (value / 6.5) * 100);
        if (value > 8.5) return Math.max(0, ((14 - value) / 5.5) * 100);
    } 
    else if (type === 'tds') {
        if (value <= 150) return 100;
        if (value >= 500) return 0;
        return 100 - (((value - 150) / 350) * 100);
    } 
    else if (type === 'turb') {
        if (value < 5) return 100;
        return 0; 
    } 
    else if (type === 'temp') {
        if (value >= 10 && value <= 35) return 100;
        return 50; 
    }
    return 0;
}

// ==========================================
//     PERCENTAGE UI & CIRCLE UPDATER
// ==========================================
function updateDroplet(score) {
    const droplet = document.getElementById('qualityDroplet');
    const scoreElement = document.getElementById('qualityScore');
    const statusElement = document.getElementById('qualityStatus');
    
    if (!scoreElement || !statusElement) return;
    
    // Update Percentage Number
    scoreElement.textContent = `${score}%`;
    
    // Determine status text and color based on score
    let statusText = 'EXCELLENT';
    let bgColor = 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(46, 125, 50, 0.2))';
    let shadowColor = 'rgba(76, 175, 80, 0.4)';
    
    if (score < 50) {
        statusText = 'POOR QUALITY';
        bgColor = 'linear-gradient(135deg, rgba(244, 67, 54, 0.3), rgba(183, 28, 28, 0.2))';
        shadowColor = 'rgba(244, 67, 54, 0.4)';
    } else if (score < 80) {
        statusText = 'FAIR QUALITY';
        bgColor = 'linear-gradient(135deg, rgba(255, 152, 0, 0.3), rgba(230, 81, 0, 0.2))';
        shadowColor = 'rgba(255, 152, 0, 0.4)';
    } else {
        statusText = 'GOOD QUALITY';
        bgColor = 'linear-gradient(135deg, rgba(0, 180, 216, 0.3), rgba(72, 149, 239, 0.2))';
        shadowColor = 'rgba(0, 180, 216, 0.4)';
    }
    
    // Update Status Text
    statusElement.textContent = statusText;
    
    // Update Droplet Visual
    if (droplet) {
        droplet.style.background = bgColor;
        droplet.style.boxShadow = `0 0 50px ${shadowColor}`;
    }
}

// ==========================================
//           MESSAGES & INSIGHTS
// ==========================================
function generateInsights(data, overallScore) {
    const insightsContainer = document.getElementById('insightMessages');
    if (!insightsContainer) return;
    
    insightsContainer.innerHTML = '';
    const insights = [];
    
    // Check specific sensors for warnings
    if (data.ph < 6.5) insights.push({ message: `Low pH detected (${data.ph.toFixed(1)}). Water is acidic.`, icon: '⚠️', type: 'warning' });
    else if (data.ph > 8.5) insights.push({ message: `High pH detected (${data.ph.toFixed(1)}). Water is alkaline.`, icon: '⚠️', type: 'warning' });
    
    if (data.tds > 500) insights.push({ message: `High TDS detected (${Math.round(data.tds)} ppm). High mineral/salt content.`, icon: '⚠️', type: 'danger' });
    
    if (data.turbStatus === 'DIRTY' || data.turbidity >= 5) insights.push({ message: `High turbidity detected. Water is cloudy.`, icon: '⚠️', type: 'danger' });
    
    // If no warnings were triggered, show perfect status
    if (insights.length === 0) insights.push({ message: `All parameters are within safe limits. Water quality is excellent.`, icon: '✅', type: 'success' });
    
    // Inject HTML into the dashboard
    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = `insight-item ${insight.type}`;
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 5px; background: rgba(255,255,255,0.05); margin-bottom: 8px;">
                <span class="insight-icon" style="font-size: 1.2rem;">${insight.icon}</span>
                <span class="insight-text">${insight.message}</span>
            </div>
        `;
        insightsContainer.appendChild(div);
    });
}
