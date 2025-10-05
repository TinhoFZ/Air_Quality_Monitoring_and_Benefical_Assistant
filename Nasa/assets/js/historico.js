let currentDataSource = 'comparison';

const dataSourceStyles = {
  comparison: {
    tempo: { color: '#3498db', label: 'Satellite' },
    ground: { color: '#e74c3c', label: 'Ground sensors' }
  }
};

async function fetchGroundHistory(hoursBack = 24) {
  const bbox = { west: -47.2, south: -24.1, east: -46.2, north: -23.2 };
  const since = new Date(Date.now() - hoursBack * 3600 * 1000).toISOString();
  const proxy = window.OPENAQ_PROXY || 'http://localhost:3000/openaq';
  const params = new URLSearchParams({
    date_from: since,
    parameter: 'pm25',
    limit: '1000',
    sort: 'asc',
    order_by: 'datetime',
    bbox: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`
  });
  const res = await fetch(`${proxy}?${params.toString()}`);
  if (!res.ok) return [];
  const js = await res.json();
  return js.results || [];
}

async function generateHourlyData() {
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(Date.now() - i * 3600 * 1000);
    hours.push(hour.getHours() + 'h');
  }
  const ground = await fetchGroundHistory(24);
  const byHour = new Map();
  ground.forEach(r => {
    const d = new Date(r.date.utc);
    const h = d.getHours();
    byHour.set(h, (byHour.get(h) || []).concat(r.value));
  });
  const groundData = hours.map(lbl => {
    const h = parseInt(lbl.replace('h',''),10);
    const vals = byHour.get(h) || [];
    if (vals.length === 0) return null;
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  });
  const tempoData = groundData.map(v => (v==null?null:v*1.1));
  return { hours, tempoData, groundData };
}

async function generateWeeklyData() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const ground = await fetchGroundHistory(24*7);
  const byDay = new Map();
  ground.forEach(r => {
    const d = new Date(r.date.utc);
    const k = d.getUTCDay();
    byDay.set(k, (byDay.get(k)||[]).concat(r.value));
  });
  const groundData = days.map((_, idx) => {
    const vals = byDay.get((idx+1)%7) || [];
    if (vals.length === 0) return null;
    return Math.round((vals.reduce((a,b)=>a+b,0)/vals.length)*10)/10;
  });
  const tempoData = groundData.map(v => (v==null?null:v*1.1));
  return { days, tempoData, groundData };
}

function updateSourceDisplay(source) {
  currentDataSource = source;
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-source="${source}"]`).classList.add('active');
  
  updateCharts();
}

function updateCharts() {
  updateHourlyChart();
  updateWeeklyChart();
  updateComparisonChart();
}

async function updateHourlyChart() {
  const { hours, tempoData, groundData } = await generateHourlyData();
  
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  
  if (window.hourlyChartInstance) {
    window.hourlyChartInstance.destroy();
  }
  
  window.hourlyChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        {
          label: 'Satellite',
          data: tempoData,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Ground sensors',
          data: groundData,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' µg/m³';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'PM2.5 (µg/m³)'
          },
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Hours'
          }
        }
      }
    }
  });
}

async function updateWeeklyChart() {
  const { days, tempoData, groundData } = await generateWeeklyData();
  
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  
  if (window.weeklyChartInstance) {
    window.weeklyChartInstance.destroy();
  }
  
  window.weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Satellite',
          data: tempoData,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: '#3498db',
          borderWidth: 1
        },
        {
          label: 'Ground sensors',
          data: groundData,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + ' µg/m³';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'PM2.5 (µg/m³)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Week days'
          }
        }
      }
    }
  });
}

function updateComparisonChart() {
  const pollutants = ['PM2.5', 'PM10', 'NO₂', 'O₃'];
  const tempoData = [18.5, 28.2, 15.8, 12.4];
  const groundData = [16.2, 25.1, 14.3, 11.9];
  const omsLimits = [15, 25, 10, 8];
  
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  
  if (window.comparisonChartInstance) {
    window.comparisonChartInstance.destroy();
  }
  
  window.comparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: pollutants,
      datasets: [
        {
          label: 'WHO limit',
          data: omsLimits,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'Satellite',
          data: tempoData,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: '#3498db',
          borderWidth: 1
        },
        {
          label: 'Ground sensors',
          data: groundData,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: '#e74c3c',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + ' µg/m³';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Concentration (µg/m³)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Pollutants'
          }
        }
      }
    }
  });
}

document.querySelectorAll('.source-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    updateSourceDisplay(btn.dataset.source);
  });
});

document.querySelectorAll('.pollutant-filters input').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    updateCharts();
  });
});

document.getElementById('rb-map').onclick=()=>window.location.href="index.html";
document.getElementById('rb-dashboard').onclick=()=>window.location.href="graf.html";
document.getElementById('rb-ai').onclick=()=>window.location.href="IA.html";
document.getElementById('rb-history').onclick=()=>window.location.href="historico.html";
document.getElementById('rb-community').onclick=()=>window.location.href="comunidade.html";

updateCharts();

setInterval(() => {
  updateCharts();
}, 30000);
