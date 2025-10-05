let currentProfile = 'child';
let currentAQI = 45;

const profileRecommendations = {
  child: {
    good: "Perfect for outdoor play!",
    moderate: "Outdoor activities OK, but avoid intense exercise.",
    unhealthy: "Avoid prolonged outdoor activities.",
    sensitive: "Avoid outdoor activities between 10am-2pm.",
    very: "Stay indoors today.",
    hazardous: "Stay home with air purifier."
  },
  elderly: {
    good: "Excellent for light walks.",
    moderate: "Short walks are safe.",
    unhealthy: "Avoid leaving home unnecessarily.",
    sensitive: "Wear a mask if you need to go out.",
    very: "Stay home today.",
    hazardous: "Avoid leaving home completely."
  },
  asthmatic: {
    good: "Ideal conditions for breathing.",
    moderate: "Monitor your symptoms.",
    unhealthy: "Keep inhaler nearby.",
    sensitive: "Avoid leaving home.",
    very: "Use inhaler preventively.",
    hazardous: "Stay home with purified air."
  },
  athlete: {
    good: "Perfect for outdoor training!",
    moderate: "Light training recommended.",
    unhealthy: "Prefer indoor exercises.",
    sensitive: "Wear mask during exercise.",
    very: "Indoor training only.",
    hazardous: "Skip today's workout."
  },
  adult: {
    good: "Ideal conditions for normal activities.",
    moderate: "Normal activities are safe.",
    unhealthy: "Avoid outdoor exercise.",
    sensitive: "Wear mask if necessary.",
    very: "Limit outdoor activities.",
    hazardous: "Avoid leaving home."
  }
};

function getAQICategory(aqi) {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy';
  if (aqi <= 200) return 'sensitive';
  if (aqi <= 300) return 'very';
  return 'hazardous';
}

function getAQIColor(aqi) {
  if (aqi <= 50) return '#2ecc71';
  if (aqi <= 100) return '#f1c40f';
  if (aqi <= 150) return '#ff8c00';
  if (aqi <= 200) return '#e74c3c';
  if (aqi <= 300) return '#8e44ad';
  return '#7f1d1d';
}

function getAQIText(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy';
  if (aqi <= 200) return 'Unhealthy for Sensitive';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function updateProfile(profile) {
  currentProfile = profile;
  document.querySelectorAll('.profile-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-profile="${profile}"]`).classList.add('active');
  
  const category = getAQICategory(currentAQI);
  const recommendation = profileRecommendations[profile][category];
  document.getElementById('alert-content').innerHTML = `<p>${recommendation}</p>`;
}

async function fetchRealWeatherData() {
  try {
    const weatherData = {
      temp: 24 + Math.random() * 8,
      wind: Math.random() * 15 + 5,
      humidity: 60 + Math.random() * 30,
      rain: Math.random() * 40,
      pressure: 1010 + Math.random() * 20,
      uv: Math.random() * 10 + 2,
      visibility: 8 + Math.random() * 4
    };
    
    return weatherData;
  } catch (error) {
    console.log('Weather API not available, using simulated data');
    return {
      temp: 24,
      wind: 12,
      humidity: 70,
      rain: 15,
      pressure: 1015,
      uv: 6,
      visibility: 10
    };
  }
}

async function simulateWeatherData() {
  const weatherData = await fetchRealWeatherData();
  
  document.getElementById('temperature').textContent = `${weatherData.temp.toFixed(1)}°C`;
  document.getElementById('wind').textContent = `${weatherData.wind.toFixed(1)} km/h`;
  document.getElementById('humidity').textContent = `${weatherData.humidity.toFixed(0)}%`;
  document.getElementById('rain').textContent = `${weatherData.rain.toFixed(0)}%`;
  
  const weatherInfo = document.querySelector('.weather-info');
  if (weatherInfo && !document.getElementById('pressure')) {
    weatherInfo.innerHTML += `
      <div class="weather-item">
        <span>🌡️ Pressure:</span>
        <span id="pressure">${weatherData.pressure.toFixed(0)} hPa</span>
      </div>
      <div class="weather-item">
        <span>☀️ UV Index:</span>
        <span id="uv">${weatherData.uv.toFixed(1)}</span>
      </div>
      <div class="weather-item">
        <span>👁️ Visibility:</span>
        <span id="visibility">${weatherData.visibility.toFixed(1)} km</span>
      </div>
    `;
  }
}

function updateAQIDisplay(aqi) {
  currentAQI = aqi;
  const category = getAQICategory(aqi);
  const color = getAQIColor(aqi);
  const text = getAQIText(aqi);
  
  document.getElementById('aqi-number').textContent = aqi;
  document.getElementById('aqi-number').style.color = color;
  document.getElementById('aqi-category').textContent = text;
  
  const recommendation = profileRecommendations[currentProfile][category];
  document.getElementById('alert-content').innerHTML = `<p>${recommendation}</p>`;
  
  if (category === 'hazardous' || category === 'very') {
    document.getElementById('alert-card').style.background = '#fecaca';
    document.getElementById('alert-card').style.borderColor = '#f87171';
  } else if (category === 'sensitive' || category === 'unhealthy') {
    document.getElementById('alert-card').style.background = '#fef3cd';
    document.getElementById('alert-card').style.borderColor = '#fde68a';
  } else {
    document.getElementById('alert-card').style.background = '#d1fae5';
    document.getElementById('alert-card').style.borderColor = '#86efac';
  }
}

new Chart(document.getElementById('aqiGauge'), {
  type: 'doughnut',
  data: {
    labels: ['Good','Moderate','Unhealthy'],
    datasets: [{
      data: [40,35,25],
      backgroundColor: ['#2ecc71','#f1c40f','#e74c3c'],
      borderWidth:0
    }]
  },
  options: {
    cutout: '70%',
    plugins:{ 
      legend:{ position:'bottom' },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  }
});

new Chart(document.getElementById('forecastBar'), {
  type:'bar',
  data:{
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[
      {label:'AQI', data:[45,52,38,41,35,28,32], backgroundColor:'#1b676a'}
    ]
  },
  options:{
    responsive:true,
    plugins:{ legend:{ display:false } },
    scales:{ 
      y:{ 
        beginAtZero:true, 
        ticks:{ callback:v=>v },
        title: {
          display: true,
          text: 'AQI'
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

new Chart(document.getElementById('pollutantsChart'), {
  type:'bar',
  data:{
    labels:['PM2.5','PM10','NO₂','O₃','CO'],
    datasets:[
      {label:'Concentration (µg/m³)', data:[18,25,12,8,2], backgroundColor:'#22c55e'}
    ]
  },
  options:{
    responsive:true,
    plugins:{ legend:{ display:false } },
    scales:{ 
      y:{ 
        beginAtZero:true, 
        ticks:{ callback:v=>v+' µg/m³' },
        title: {
          display: true,
          text: 'Concentration'
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

document.querySelectorAll('.profile-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    updateProfile(btn.dataset.profile);
  });
});

document.getElementById('rb-map').onclick=()=>window.location.href="index.html";
document.getElementById('rb-dashboard').onclick=()=>window.location.href="graf.html";
document.getElementById('rb-ai').onclick=()=>window.location.href="IA.html";
document.getElementById('rb-history').onclick=()=>window.location.href="historico.html";
document.getElementById('rb-community').onclick=()=>window.location.href="comunidade.html";

simulateWeatherData();
updateAQIDisplay(45);

setInterval(async () => {
  const newAQI = Math.max(0, Math.min(500, currentAQI + (Math.random() - 0.5) * 10));
  updateAQIDisplay(Math.round(newAQI));
  await simulateWeatherData();
}, 10000);