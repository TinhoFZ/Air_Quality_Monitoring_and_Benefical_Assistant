new Chart(document.getElementById('aqiGauge'), {
  type: 'doughnut',
  data: {
    labels: ['Good','Moderate','Unhealthy'],
    datasets: [{
      data: [40,30,30],
      backgroundColor: ['#28c76f','#ffd166','#e74c3c'],
      borderWidth:0
    }]
  },
  options: {
    cutout: '70%',
    plugins:{ legend:{ position:'bottom' } }
  }
});

new Chart(document.getElementById('compareBar'), {
  type:'bar',
  data:{
    labels:['London','Berlin','Seoul','New York','Tokyo'],
    datasets:[
      {label:'PM2.5', data:[25,32,24,29,15], backgroundColor:'#22c55e'},
      {label:'NO₂', data:[20,18,22,15,10], backgroundColor:'#f59e0b'}
    ]
  },
  options:{
    responsive:true,
    plugins:{ legend:{ position:'top' } },
    scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>v+'%' } } }
  }
});

new Chart(document.getElementById('forecastBar'), {
  type:'bar',
  data:{
    labels:['Mon','Tue','Wed','Thu','Fri'],
    datasets:[
      {label:'Pollution %', data:[15,21,52,26,51], backgroundColor:'#f59e0b'}
    ]
  },
  options:{
    responsive:true,
    plugins:{ legend:{ display:false } },
    scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>v+'%' } } }
  }
});

document.getElementById('rb-locate').onclick=()=>window.location.href="index.html";
document.getElementById('rb-info').onclick=()=>window.location.href="graf.html";
document.getElementById('rb-bot').onclick=()=>window.location.href="IA.html";
