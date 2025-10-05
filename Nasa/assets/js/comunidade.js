const communityReports = [
  {
    location: "Bairro Centro",
    time: "2h atrás",
    text: "Cheiro forte de fumaça próximo à fábrica. Ar pesado para respirar.",
    tags: ["Fumaça", "Industrial"],
    type: "negative"
  },
  {
    location: "Parque Municipal",
    time: "5h atrás",
    text: "Ar limpo e fresco. Perfeito para caminhada matinal.",
    tags: ["Positivo", "Ar Limpo"],
    type: "positive"
  },
  {
    location: "Avenida Principal",
    time: "1d atrás",
    text: "Tráfego intenso causando ar carregado. Evitem exercícios na região.",
    tags: ["Tráfego", "Alerta"],
    type: "warning"
  },
  {
    location: "Escola Municipal",
    time: "3h atrás",
    text: "Crianças apresentando tosse seca. Ar muito seco hoje.",
    tags: ["Crianças", "Saúde"],
    type: "negative"
  },
  {
    location: "Praça Central",
    time: "6h atrás",
    text: "Ar fresco da manhã. Ideal para atividades ao ar livre.",
    tags: ["Positivo", "Manhã"],
    type: "positive"
  }
];

const educationContent = [
  {
    title: "O que é PM2.5?",
    content: "Partículas finas menores que 2,5 micrômetros que penetram profundamente nos pulmões e podem causar problemas de saúde.",
    icon: "🔬"
  },
  {
    title: "Efeitos na Saúde",
    content: "Pode causar problemas respiratórios, cardiovasculares, agravar asma e aumentar risco de câncer de pulmão.",
    icon: "🏥"
  },
  {
    title: "Como se Proteger",
    content: "Use máscara N95, evite atividades ao ar livre em dias ruins, mantenha janelas fechadas e use purificador de ar.",
    icon: "🛡️"
  },
  {
    title: "Fontes de Poluição",
    content: "Veículos, indústrias, queimadas, construção civil e atividades domésticas como fogão a lenha.",
    icon: "🏭"
  }
];

const quizQuestions = [
  {
    question: "Qual o limite recomendado pela OMS para PM2.5?",
    options: ["10 µg/m³", "15 µg/m³", "25 µg/m³", "50 µg/m³"],
    correct: 1,
    explanation: "A OMS recomenda 15 µg/m³ como limite para PM2.5 em média anual."
  },
  {
    question: "Qual horário é mais seguro para exercícios ao ar livre?",
    options: ["10h-14h", "6h-8h", "16h-18h", "Ambos B e C"],
    correct: 3,
    explanation: "Manhã cedo (6h-8h) e final da tarde (16h-18h) são os horários mais seguros."
  },
  {
    question: "PM2.5 pode causar quais problemas de saúde?",
    options: ["Apenas respiratórios", "Respiratórios e cardiovasculares", "Apenas cardiovasculares", "Nenhum problema"],
    correct: 1,
    explanation: "PM2.5 causa problemas tanto respiratórios quanto cardiovasculares."
  }
];

let currentQuizQuestion = 0;
let quizScore = 0;

function addCommunityReport() {
  const location = prompt("Local do relato:");
  const text = prompt("Descreva o que você observou:");
  
  if (location && text) {
    const newReport = {
      location: location,
      time: "Agora",
      text: text,
      tags: ["Relato", "Comunidade"],
      type: "neutral"
    };
    
    communityReports.unshift(newReport);
    updateCommunityReports();
    alert("Relato adicionado com sucesso!");
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
      <div class="quiz-progress">Pergunta ${currentQuizQuestion + 1} de ${quizQuestions.length}</div>
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
    `Parabéns! Você acertou ${quizScore} de ${quizQuestions.length} perguntas (${percentage}%)` :
    `Você acertou ${quizScore} de ${quizQuestions.length} perguntas (${percentage}%). Continue estudando!`;
  
  alert(message);
  
  // Reset quiz
  currentQuizQuestion = 0;
  quizScore = 0;
}

function openGuide(guideTitle) {
  const guides = {
    'Purificadores de Ar': `
      <h3>Guia: Purificadores de Ar</h3>
      <p><strong>Como escolher:</strong></p>
      <ul>
        <li>Filtro HEPA para partículas finas</li>
        <li>CADR adequado ao tamanho do ambiente</li>
        <li>Filtro de carvão ativado para gases</li>
        <li>Baixo nível de ruído</li>
      </ul>
      <p><strong>Como usar:</strong></p>
      <ul>
        <li>Mantenha portas e janelas fechadas</li>
        <li>Troque filtros regularmente</li>
        <li>Posicione longe de obstáculos</li>
        <li>Use continuamente em dias ruins</li>
      </ul>
    `,
    'Exercícios Seguros': `
      <h3>Guia: Exercícios Seguros</h3>
      <p><strong>Quando evitar:</strong></p>
      <ul>
        <li>AQI acima de 100 (Moderado)</li>
        <li>Horário de pico (10h-16h)</li>
        <li>Proximidade de vias movimentadas</li>
      </ul>
      <p><strong>Alternativas seguras:</strong></p>
      <ul>
        <li>Academias com ar condicionado</li>
        <li>Exercícios indoor</li>
        <li>Horários matinais ou noturnos</li>
        <li>Parques arborizados</li>
      </ul>
    `,
    'Plantas Purificadoras': `
      <h3>Guia: Plantas Purificadoras</h3>
      <p><strong>Plantas recomendadas:</strong></p>
      <ul>
        <li>Espada-de-São-Jorge - absorve formaldeído</li>
        <li>Jiboia - remove poluentes do ar</li>
        <li>Lírio-da-paz - filtra benzeno e amônia</li>
        <li>Samambaia - umidifica e purifica</li>
      </ul>
      <p><strong>Cuidados:</strong></p>
      <ul>
        <li>Regue regularmente</li>
        <li>Mantenha folhas limpas</li>
        <li>Posicione em locais ventilados</li>
        <li>Combine com purificadores</li>
      </ul>
    `
  };
  
  const content = guides[guideTitle] || '<p>Guia não encontrado.</p>';
  
  const modal = document.createElement('div');
  modal.className = 'guide-modal';
  modal.innerHTML = `
    <div class="guide-content">
      ${content}
      <button class="close-guide">Fechar</button>
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
  // Simula novos relatos da comunidade
  if (Math.random() < 0.1) {
    const locations = ["Bairro Norte", "Centro Comercial", "Praça da Liberdade", "Vila Nova"];
    const reports = [
      "Ar mais limpo hoje, boa para caminhada.",
      "Tráfego intenso na região, evitem exercícios.",
      "Cheiro de queimada vindo do norte.",
      "Dia ensolarado, ar fresco da manhã."
    ];
    
    const newReport = {
      location: locations[Math.floor(Math.random() * locations.length)],
      time: "Agora",
      text: reports[Math.floor(Math.random() * reports.length)],
      tags: ["Relato", "Comunidade"],
      type: "neutral"
    };
    
    communityReports.unshift(newReport);
    updateCommunityReports();
  }
}, 30000);
