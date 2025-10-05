let currentDataSource = 'comparison';

const dataSourceStyles = {
  comparison: {
    tempo: { color: '#3498db', label: 'TEMPO (NASA)' },
    ground: { color: '#e74c3c', label: 'Ground Sensors' }
  }
};

function generateHourlyData() {
  const hours = [];
  const tempoData = [];
  const groundData = [];
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(Date.now() - i * 60 * 60 * 1000);
    hours.push(hour.getHours() + 'h');
    tempoData.push(Math.max(0, 15 + Math.random() * 20 + Math.sin(i * 0.5) * 5));
    groundData.push(Math.max(0, 12 + Math.random() * 18 + Math.sin(i * 0.5) * 4));
  }
  
  return { hours, tempoData, groundData };
}

function generateWeeklyData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const tempoData = [18, 22, 15, 28, 25, 19, 16];
  const groundData = [16, 20, 14, 26, 23, 17, 15];
  
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

function updateHourlyChart() {
  const { hours, tempoData, groundData } = generateHourlyData();
  
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
          label: 'TEMPO (NASA)',
          data: tempoData,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Sensores Terrestres',
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

function updateWeeklyChart() {
  const { days, tempoData, groundData } = generateWeeklyData();
  
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
          label: 'TEMPO (NASA)',
          data: tempoData,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: '#3498db',
          borderWidth: 1
        },
        {
          label: 'Sensores Terrestres',
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
            text: 'Days of the Week'
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
          label: 'Limite OMS',
          data: omsLimits,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: '#2ecc71',
          borderWidth: 1
        },
        {
          label: 'TEMPO (NASA)',
          data: tempoData,
          backgroundColor: 'rgba(52, 152, 219, 0.7)',
          borderColor: '#3498db',
          borderWidth: 1
        },
        {
          label: 'Sensores Terrestres',
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
