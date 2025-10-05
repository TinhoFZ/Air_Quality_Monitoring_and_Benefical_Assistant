let communityReports = [];
try {
  const saved = localStorage.getItem('communityReports');
  if (saved) communityReports = JSON.parse(saved);
} catch(e) { communityReports = []; }

const educationContent = [];

const quizQuestions = [];

let currentQuizQuestion = 0;
let quizScore = 0;

function addCommunityReport() {
  const location = prompt("Report location:");
  const text = prompt("Describe what you observed:");
  if (location && text) {
    const newReport = {
      location,
      time: new Date().toLocaleString(),
      text,
      tags: ["Report"],
      type: "neutral"
    };
    communityReports.unshift(newReport);
    try { localStorage.setItem('communityReports', JSON.stringify(communityReports)); } catch(e) {}
    updateCommunityReports();
    alert("Report saved!");
  }
}

function updateCommunityReports() {
  const container = document.querySelector('.community-reports');
  if (!container) return;
  container.innerHTML = '';
  if (communityReports.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'report-empty';
    empty.textContent = 'No community reports yet. Be the first to add one!';
    container.appendChild(empty);
    return;
  }
  communityReports.slice(0, 20).forEach(report => {
    const el = document.createElement('div');
    el.className = `report-item ${report.type||''}`;
    const tagsHtml = (report.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('');
    el.innerHTML = `
      <div class="report-header">
        <span class="report-location">${report.location}</span>
        <span class="report-time">${report.time}</span>
      </div>
      <div class="report-text">"${report.text}"</div>
      <div class="report-tags">${tagsHtml}</div>
    `;
    container.appendChild(el);
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

const addBtn = document.querySelector('.add-report-btn');
if (addBtn) addBtn.addEventListener('click', addCommunityReport);

document.querySelectorAll('.guide-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const guideTitle = btn.parentElement.querySelector('h4')?.textContent || 'Guide';
    openGuide(guideTitle);
  });
});

document.getElementById('rb-map').onclick=()=>window.location.href="index.html";
document.getElementById('rb-dashboard').onclick=()=>window.location.href="graf.html";
document.getElementById('rb-ai').onclick=()=>window.location.href="IA.html";
document.getElementById('rb-history').onclick=()=>window.location.href="historico.html";
document.getElementById('rb-community').onclick=()=>window.location.href="comunidade.html";

updateCommunityReports();
