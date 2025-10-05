const communityReports = [
  {
    location: "Downtown",
    time: "2h ago",
    text: "Strong smell of smoke near the factory. Air feels heavy to breathe.",
    tags: ["Smoke", "Industrial"],
    type: "negative"
  },
  {
    location: "City Park",
    time: "5h ago",
    text: "Clean, fresh air. Perfect for a morning walk.",
    tags: ["Positive", "Clean Air"],
    type: "positive"
  },
  {
    location: "Main Avenue",
    time: "1d ago",
    text: "Heavy traffic causing dense air. Avoid exercising in the area.",
    tags: ["Traffic", "Alert"],
    type: "warning"
  },
  {
    location: "Public School",
    time: "3h ago",
    text: "Children showing dry cough. Air is very dry today.",
    tags: ["Children", "Health"],
    type: "negative"
  },
  {
    location: "Central Square",
    time: "6h ago",
    text: "Fresh morning air. Ideal for outdoor activities.",
    tags: ["Positive", "Morning"],
    type: "positive"
  }
];

const educationContent = [
  {
    title: "What is PM2.5?",
    content: "Fine particles smaller than 2.5 micrometers that penetrate deeply into the lungs and may cause health issues.",
    icon: "🔬"
  },
  {
    title: "Health Effects",
    content: "Can cause respiratory and cardiovascular problems, worsen asthma, and increase lung cancer risk.",
    icon: "🏥"
  },
  {
    title: "How to Protect Yourself",
    content: "Use an N95 mask, avoid outdoor activities on polluted days, keep windows closed, and use an air purifier.",
    icon: "🛡️"
  },
  {
    title: "Pollution Sources",
    content: "Vehicles, industries, wildfires, construction, and domestic activities like wood stoves.",
    icon: "🏭"
  }
];

const quizQuestions = [
  {
    question: "What is the WHO recommended limit for PM2.5?",
    options: ["10 µg/m³", "15 µg/m³", "25 µg/m³", "50 µg/m³"],
    correct: 1,
    explanation: "WHO recommends 15 µg/m³ as the annual average limit for PM2.5."
  },
  {
    question: "What time is safer for outdoor exercise?",
    options: ["10am-2pm", "6am-8am", "4pm-6pm", "Both B and C"],
    correct: 3,
    explanation: "Early morning (6am-8am) and late afternoon (4pm-6pm) are the safest times."
  },
  {
    question: "PM2.5 can cause which health problems?",
    options: ["Only respiratory", "Respiratory and cardiovascular", "Only cardiovascular", "No problems"],
    correct: 1,
    explanation: "PM2.5 causes both respiratory and cardiovascular problems."
  }
];

let currentQuizQuestion = 0;
let quizScore = 0;

function addCommunityReport() {
  const location = prompt("Report location:");
  const text = prompt("Describe what you observed:");
  
  if (location && text) {
    const newReport = {
      location: location,
      time: "Now",
      text: text,
      tags: ["Report", "Community"],
      type: "neutral"
    };
    
    communityReports.unshift(newReport);
    updateCommunityReports();
    alert("Report added successfully!");
  }
}

function updateCommunityReports() {
  const container = document.querySelector('.community-reports');
  container.innerHTML = '';
  
  communityReports.slice(0, 5).forEach(report => {
    const reportElement = document.createElement('div');
    reportElement.className = `report-item ${report.type}`;
    
    const tagsHtml = report.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    reportElement.innerHTML = `
      <div class="report-header">
        <span class="report-location">${report.location}</span>
        <span class="report-time">${report.time}</span>
      </div>
      <div class="report-text">"${report.text}"</div>
      <div class="report-tags">${tagsHtml}</div>
    `;
    
    container.appendChild(reportElement);
  });
}

function startQuiz() {
  if (currentQuizQuestion >= quizQuestions.length) {
    showQuizResults();
    return;
  }
  
  const question = quizQuestions[currentQuizQuestion];
  const quizModal = document.createElement('div');
  quizModal.className = 'quiz-modal';
  quizModal.innerHTML = `
    <div class="quiz-content">
      <h3>Quiz: ${question.question}</h3>
      <div class="quiz-options">
        ${question.options.map((option, index) => 
          `<button class="quiz-option" data-index="${index}">${option}</button>`
        ).join('')}
      </div>
      <div class="quiz-progress">Question ${currentQuizQuestion + 1} of ${quizQuestions.length}</div>
    </div>
  `;
  
  document.body.appendChild(quizModal);
  
  quizModal.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedIndex = parseInt(e.target.dataset.index);
      const isCorrect = selectedIndex === question.correct;
      
      if (isCorrect) {
        quizScore++;
        e.target.style.background = '#d4edda';
        e.target.style.color = '#155724';
      } else {
        e.target.style.background = '#f8d7da';
        e.target.style.color = '#721c24';
        quizModal.querySelector(`[data-index="${question.correct}"]`).style.background = '#d4edda';
        quizModal.querySelector(`[data-index="${question.correct}"]`).style.color = '#155724';
      }
      
      setTimeout(() => {
        document.body.removeChild(quizModal);
        currentQuizQuestion++;
        startQuiz();
      }, 2000);
    });
  });
}

function showQuizResults() {
  const percentage = Math.round((quizScore / quizQuestions.length) * 100);
  const message = percentage >= 70 ? 
    `Congratulations! You got ${quizScore} out of ${quizQuestions.length} questions (${percentage}%)` :
    `You got ${quizScore} out of ${quizQuestions.length} questions (${percentage}%). Keep learning!`;
  
  alert(message);
  
  currentQuizQuestion = 0;
  quizScore = 0;
}

function openGuide(guideTitle) {
  const guides = {
    'Air Purifiers': `
      <h3>Guide: Air Purifiers</h3>
      <p><strong>How to choose:</strong></p>
      <ul>
        <li>HEPA filter for fine particles</li>
        <li>CADR adequate for room size</li>
        <li>Activated carbon filter for gases</li>
        <li>Low noise level</li>
      </ul>
      <p><strong>How to use:</strong></p>
      <ul>
        <li>Keep doors and windows closed</li>
        <li>Replace filters regularly</li>
        <li>Position away from obstacles</li>
        <li>Use continuously on bad days</li>
      </ul>
    `,
    'Safe Exercises': `
      <h3>Guide: Safe Exercises</h3>
      <p><strong>When to avoid:</strong></p>
      <ul>
        <li>AQI above 100 (Moderate)</li>
        <li>Peak hours (10am-4pm)</li>
        <li>Near busy roads</li>
      </ul>
      <p><strong>Safe alternatives:</strong></p>
      <ul>
        <li>Air-conditioned gyms</li>
        <li>Indoor exercises</li>
        <li>Morning or evening hours</li>
        <li>Tree-filled parks</li>
      </ul>
    `,
    'Air-Purifying Plants': `
      <h3>Guide: Air-Purifying Plants</h3>
      <p><strong>Recommended plants:</strong></p>
      <ul>
        <li>Snake Plant - absorbs formaldehyde</li>
        <li>Pothos - removes air pollutants</li>
        <li>Peace Lily - filters benzene and ammonia</li>
        <li>Boston Fern - humidifies and purifies</li>
      </ul>
      <p><strong>Care:</strong></p>
      <ul>
        <li>Water regularly</li>
        <li>Keep leaves clean</li>
        <li>Position in ventilated areas</li>
        <li>Combine with purifiers</li>
      </ul>
    `
  };
  
  const content = guides[guideTitle] || '<p>Guide not found.</p>';
  
  const modal = document.createElement('div');
  modal.className = 'guide-modal';
  modal.innerHTML = `
    <div class="guide-content">
      ${content}
      <button class="close-guide">Close</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-guide').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

document.querySelector('.add-report-btn').addEventListener('click', addCommunityReport);
document.querySelector('.quiz-btn').addEventListener('click', startQuiz);

document.querySelectorAll('.guide-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const guideTitle = btn.parentElement.querySelector('h4').textContent;
    openGuide(guideTitle);
  });
});

document.getElementById('rb-map').onclick=()=>window.location.href="index.html";
document.getElementById('rb-dashboard').onclick=()=>window.location.href="graf.html";
document.getElementById('rb-ai').onclick=()=>window.location.href="IA.html";
document.getElementById('rb-history').onclick=()=>window.location.href="historico.html";
document.getElementById('rb-community').onclick=()=>window.location.href="comunidade.html";

updateCommunityReports();

setInterval(() => {
  if (Math.random() < 0.1) {
    const locations = ["North District", "Commercial Center", "Liberty Square", "New Village"];
    const reports = [
      "Cleaner air today, good for walking.",
      "Heavy traffic in the area, avoid exercises.",
      "Smell of burning coming from the north.",
      "Sunny day, fresh morning air."
    ];
    
    const newReport = {
      location: locations[Math.floor(Math.random() * locations.length)],
      time: "Now",
      text: reports[Math.floor(Math.random() * reports.length)],
      tags: ["Report", "Community"],
      type: "neutral"
    };
    
    communityReports.unshift(newReport);
    updateCommunityReports();
  }
}, 30000);
