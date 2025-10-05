const chat = document.getElementById('chat');
const msg  = document.getElementById('msg');
const send = document.getElementById('send');

const currentAQI = 45;
const currentTemp = 24;
const currentHumidity = 65;
const currentWind = 8;

const aiResponses = {
  exercise: `With AQI of ${currentAQI} (Moderate), exercise is possible with precautions:
• Recommended times: 6am-8am or 6pm-8pm
• Avoid intense exercise between 10am-4pm
• Use N95 mask if you have sensitivity
• Stay hydrated and monitor symptoms`,
  
  children: `For children with AQI ${currentAQI}:
• Outdoor activities are allowed for short periods
• Avoid parks and playgrounds between 10am-2pm
• Keep windows closed at home
• Use air purifier in children's room
• Monitor for coughs or eye irritation`,
  
  asthma: `Recommendations for asthmatics (AQI ${currentAQI}):
• Keep rescue inhaler always nearby
• Use preventive inhaler as prescribed
• Avoid leaving home between 10am-4pm
• Use N95 mask if you need to go out
• Keep environment closed with air purifier
• Consult doctor if symptoms worsen`,
  
  forecast: `Weekly air quality forecast:
• Monday: AQI 42 (Good) - Ideal for activities
• Tuesday: AQI 58 (Moderate) - Be careful with exercise
• Wednesday: AQI 35 (Good) - Excellent for walks
• Thursday: AQI 67 (Moderate) - Avoid intense activities
• Friday: AQI 45 (Moderate) - Light activities OK
• Saturday: AQI 38 (Good) - Perfect for weekends
• Sunday: AQI 52 (Moderate) - Be careful with children`
};

const commonQuestions = {
  'can i run': 'exercise',
  'can i exercise': 'exercise',
  'exercise': 'exercise',
  'children': 'children',
  'child': 'children',
  'baby': 'children',
  'asthmatic': 'asthma',
  'asthma': 'asthma',
  'forecast': 'forecast',
  'week': 'forecast',
  'weather': 'forecast'
};

function appendBubble(text, me=false){
  const b = document.createElement('div');
  b.className = 'bubble' + (me ? ' me':'' );
  b.textContent = text;
  chat.appendChild(b);
  b.scrollIntoView({behavior:'smooth', block:'end'});
}

function getAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, responseType] of Object.entries(commonQuestions)) {
    if (lowerMessage.includes(keyword)) {
      return aiResponses[responseType];
    }
  }
  
  if (lowerMessage.includes('ola') || lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return `Olá! Sou o assistente Air QMBA. Posso te ajudar com:
• Recomendações de exercícios
• Cuidados para crianças e idosos
• Informações para asmáticos
• Previsões meteorológicas
• Dicas de saúde respiratória

Como posso te ajudar hoje?`;
  }
  
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
    return `Posso te ajudar com informações sobre qualidade do ar! Tente perguntar:
• "Posso correr hoje?"
• "É seguro para crianças?"
• "Recomendações para asmáticos"
• "Previsão da semana"
• Ou use os botões de ação rápida acima!`;
  }
  
  return `Entendi sua pergunta sobre "${userMessage}". Com base nos dados atuais (AQI: ${currentAQI}, Temp: ${currentTemp}°C, Umidade: ${currentHumidity}%), posso te dar algumas recomendações gerais:
• A qualidade do ar está moderada
• Horários mais seguros para atividades: manhã cedo ou noite
• Mantenha-se hidratado
• Use máscara se tiver sensibilidade respiratória
• Consulte um médico se tiver sintomas persistentes`;
}

function simulateTyping(callback, delay = 1000) {
  const typingBubble = document.createElement('div');
  typingBubble.className = 'bubble typing';
  typingBubble.textContent = '🤖 Typing...';
  chat.appendChild(typingBubble);
  typingBubble.scrollIntoView({behavior:'smooth', block:'end'});
  
  setTimeout(() => {
    typingBubble.remove();
    callback();
  }, delay);
}

send.addEventListener('click', async ()=>{
  const userMessage = msg.value.trim();
  if(!userMessage) return;
  
  appendBubble(userMessage, true);
  msg.value = '';
  if (window.GROQ_URL || window.GROQ_KEY) {
    simulateTyping(async () => {
      try {
        const resp = await fetch((window.GROQ_URL||'/groq'),{
          method:'POST', headers:{'Content-Type':'application/json', ...(window.GROQ_KEY?{Authorization:`Bearer ${window.GROQ_KEY}`}:{})},
          body: JSON.stringify({ prompt: userMessage })
        });
        const js = await resp.json();
        appendBubble(js.text || js.answer || '...');
      } catch(e){
        appendBubble(getAIResponse(userMessage));
      }
    });
  } else {
    simulateTyping(() => {
      const response = getAIResponse(userMessage);
      appendBubble(response);
    });
  }
});

msg.addEventListener('keydown', e=>{
  if(e.key==='Enter' && !e.shiftKey){ 
    e.preventDefault(); 
    send.click(); 
  }
});

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const action = btn.dataset.action;
    const userMessage = btn.textContent.replace(/[🏃👶🫁📅]/g, '').trim();
    
    appendBubble(userMessage, true);
    if (window.GROQ_URL || window.GROQ_KEY) {
      simulateTyping(async () => {
        try {
          const resp = await fetch((window.GROQ_URL||'/groq'),{
            method:'POST', headers:{'Content-Type':'application/json', ...(window.GROQ_KEY?{Authorization:`Bearer ${window.GROQ_KEY}`}:{})},
            body: JSON.stringify({ prompt: userMessage })
          });
          const js = await resp.json();
          appendBubble(js.text || js.answer || '...');
        } catch(e){
          appendBubble(aiResponses[action] || getAIResponse(userMessage));
        }
      });
    } else {
      simulateTyping(() => {
        const response = aiResponses[action] || getAIResponse(userMessage);
        appendBubble(response);
      });
    }
  });
});

document.getElementById('rb-locate').addEventListener('click', ()=>{
  if(!navigator.geolocation){
    appendBubble('Geolocalização indisponível no seu navegador.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const {latitude, longitude} = pos.coords;
      appendBubble(`📍 Localização detectada: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Analisando dados de qualidade do ar para sua região...`);
      
      setTimeout(() => {
        appendBubble(`Com base na sua localização, a qualidade do ar atual é moderada (AQI: 45). Recomendo verificar o mapa interativo para dados mais detalhados da sua região.`);
      }, 1500);
    },
    () => appendBubble('Não consegui obter sua localização. Verifique as permissões do navegador.')
  );
});

document.getElementById('rb-info').addEventListener('click', ()=>{
  appendBubble(`📊 Informações sobre AQI (Índice de Qualidade do Ar):
• 0-50: Bom (verde) - Qualidade satisfatória
• 51-100: Moderado (amarelo) - Aceitável para maioria
• 101-150: Insalubre para sensíveis (laranja) - Crianças, idosos, asmáticos
• 151-200: Insalubre (vermelho) - Todos podem sentir efeitos
• 201-300: Muito insalubre (roxo) - Alerta de saúde
• 301+: Perigoso (marrom) - Emergência de saúde

Dados baseados em padrões EPA/OMS.`);
});

document.getElementById('rb-bot').addEventListener('click', ()=>{
  appendBubble(`🤖 Sou o assistente Air QMBA, especializado em qualidade do ar e saúde respiratória. Posso te ajudar com recomendações personalizadas baseadas em dados científicos da NASA TEMPO e sensores terrestres.`);
});

document.getElementById('rb-map').onclick = () => {
  window.location.href = "index.html";
};

document.getElementById('rb-dashboard').onclick = () => {
  window.location.href = "graf.html";
};

document.getElementById('rb-ai').onclick = () => {
  window.location.href = "IA.html";
};

document.getElementById('rb-history').onclick = () => {
  window.location.href = "historico.html";
};

document.getElementById('rb-community').onclick = () => {
  window.location.href = "comunidade.html";
};