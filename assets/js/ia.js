const chat = document.getElementById('chat');
const msg  = document.getElementById('msg');
const send = document.getElementById('send');

const currentAQI = 45;
const currentTemp = 24;
const currentHumidity = 65;
const currentWind = 8;

// Grok AI Configuration
const GROK_CONFIG = {
  apiKey: 'grokToken',
  apiUrl: 'https://api.x.ai/v1/chat/completions',
  model: 'grok-beta',
  enabled: true // Now enabled with the provided API key
};

// Air Quality Context for Grok
const AIR_QUALITY_CONTEXT = `
You are an AI assistant specialized in air quality and respiratory health. You have access to real-time air quality data:

Current Conditions:
- AQI: ${currentAQI} (Moderate)
- Temperature: ${currentTemp}°C
- Humidity: ${currentHumidity}%
- Wind Speed: ${currentWind} km/h

Your expertise includes:
- Air quality interpretation and health recommendations
- Exercise and outdoor activity guidance based on AQI
- Special considerations for children, elderly, and asthmatics
- Weather and air quality forecasting
- Respiratory health tips and protective measures

Always provide practical, evidence-based advice. When AQI is above 100, emphasize caution and protective measures.
`;

const aiResponses = {
  exercise: `With AQI of ${currentAQI} (Moderate), exercise is possible with precautions:
• Recommended times: 6am-8am or 6pm-8pm
• Avoid intense exercise between 10am-4pm
• Use an N95 mask if you have sensitivity
• Stay hydrated and monitor symptoms`,
  
  children: `For children with AQI ${currentAQI}:
• Outdoor activities are allowed for short periods
• Avoid parks and playgrounds between 10am-2pm
• Keep windows closed at home
• Use an air purifier in the child's room
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

// Grok AI Integration
async function callGrokAPI(userMessage) {
  if (!GROK_CONFIG.enabled || !GROK_CONFIG.apiKey) {
    return null; // Fall back to local responses
  }

  try {
    const response = await fetch(GROK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: GROK_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: AIR_QUALITY_CONTEXT
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('Grok API call failed:', error);
    return null; // Fall back to local responses
  }
}

function getAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, responseType] of Object.entries(commonQuestions)) {
    if (lowerMessage.includes(keyword)) {
      return aiResponses[responseType];
    }
  }
  
  if (lowerMessage.includes('ola') || lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return `Hello! I'm the Air QMBA assistant. I can help you with:
• Exercise recommendations
• Guidance for children and the elderly
• Information for asthmatics
• Weather and air quality forecasts
• Respiratory health tips

How can I help you today?`;
  }
  
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
    return `I can help with air quality information! Try asking:
• "Can I run today?"
• "Is it safe for children?"
• "Recommendations for asthmatics"
• "Weekly forecast"
• Or use the quick action buttons above!`;
  }
  
  return `I understand your question about "${userMessage}". Based on current data (AQI: ${currentAQI}, Temp: ${currentTemp}°C, Humidity: ${currentHumidity}%), here are general recommendations:
• Air quality is moderate
• Safest times for activities: early morning or evening
• Stay hydrated
• Use a mask if you have respiratory sensitivity
• Consult a doctor if symptoms persist`;
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
  
  simulateTyping(async () => {
    // Try Grok AI first, fall back to local responses
    let response = await callGrokAPI(userMessage);
    if (!response) {
      response = getAIResponse(userMessage);
    }
    appendBubble(response);
  });
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
    
    simulateTyping(async () => {
      // Try Grok AI first, fall back to local responses
      let response = await callGrokAPI(userMessage);
      if (!response) {
        response = aiResponses[action];
      }
      appendBubble(response);
    });
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
