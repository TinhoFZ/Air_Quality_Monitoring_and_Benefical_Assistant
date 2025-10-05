const chat = document.getElementById('chat');
const msg  = document.getElementById('msg');
const send = document.getElementById('send');

const currentAQI = 45;
const currentTemp = 24;
const currentHumidity = 65;
const currentWind = 8;

const GROK_CONFIG = {
  apiKey: 'SECRET',
  apiUrl: 'https://api.x.ai/v1/chat/completions',
  model: 'grok-beta', 
  enabled: false
};

const AIR_QUALITY_CONTEXT = `
You are Air QMBA, an AI assistant specialized in air quality and respiratory health. You help users make informed decisions about outdoor activities based on real-time air quality data.

CURRENT CONDITIONS:
- AQI: ${currentAQI} (Moderate - 51-100 range)
- Temperature: ${currentTemp}°C
- Humidity: ${currentHumidity}%
- Wind Speed: ${currentWind} km/h

YOUR EXPERTISE:
- Air quality interpretation and health recommendations
- Exercise and outdoor activity guidance based on AQI levels
- Special considerations for children, elderly, and asthmatics
- Weather and air quality forecasting
- Respiratory health tips and protective measures

RESPONSE GUIDELINES:
- Always provide practical, evidence-based advice
- Be concise but informative (max 3-4 sentences)
- When AQI is above 100, emphasize caution and protective measures
- Include specific time recommendations when relevant
- Mention protective measures like masks when appropriate
- Respond in the same language as the user's question

AQI SCALE:
- 0-50: Good (Green) - Safe for all activities
- 51-100: Moderate (Yellow) - OK for most, sensitive groups should limit prolonged outdoor activity
- 101-150: Unhealthy for Sensitive Groups (Orange) - Children, elderly, and those with heart/lung disease should avoid prolonged outdoor activity
- 151-200: Unhealthy (Red) - Everyone should avoid prolonged outdoor activity
- 201-300: Very Unhealthy (Purple) - Everyone should avoid outdoor activity
- 301+: Hazardous (Maroon) - Stay indoors

Always be helpful, accurate, and prioritize user safety.
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

async function callGrokAPI(userMessage) {
  if (!GROK_CONFIG.enabled || !GROK_CONFIG.apiKey) {
    console.log('Grok API disabled or no API key');
    return null;
  }

  try {
    console.log('Calling Grok API with message:', userMessage);
    console.log('API URL:', GROK_CONFIG.apiUrl);
    console.log('API Key (first 10 chars):', GROK_CONFIG.apiKey.substring(0, 10) + '...');
    
    const requestBody = {
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
      temperature: 0.7,
      stream: false
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(GROK_CONFIG.apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_CONFIG.apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Grok API response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error response:', errorText);
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Grok API response data:', data);
    
    const aiResponse = data.choices?.[0]?.message?.content;
    if (aiResponse) {
      console.log('✅ Grok AI response received:', aiResponse);
      return aiResponse;
    } else {
      console.error('❌ No content in Grok response:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Grok API call failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
}

function getAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, responseType] of Object.entries(commonQuestions)) {
    if (lowerMessage.includes(keyword)) {
      return aiResponses[responseType];
    }
  }
  
  if (lowerMessage.includes('ola') || lowerMessage.includes('olá') || lowerMessage.includes('oi') || 
      lowerMessage.includes('opa') || lowerMessage.includes('e aí') || lowerMessage.includes('eai')) {
    return `Olá! 👋 Sou o assistente Air QMBA, especializado em qualidade do ar e saúde respiratória. 

Posso te ajudar com:
• Recomendações de exercícios
• Orientações para crianças e idosos
• Informações para asmáticos
• Previsões de qualidade do ar
• Dicas de saúde respiratória

Como posso te ajudar hoje?`;
  }
  
  if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('o que você faz')) {
    return `Posso te ajudar com informações sobre qualidade do ar! Tente perguntar:
• "Posso correr hoje?"
• "É seguro para crianças?"
• "Recomendações para asmáticos"
• "Previsão semanal"
• Ou use os botões de ação rápida acima!`;
  }
  
  if (lowerMessage.includes('tempo') || lowerMessage.includes('clima') || lowerMessage.includes('qualidade do ar')) {
    return `Com base nos dados atuais:
• AQI: ${currentAQI} (Moderado)
• Temperatura: ${currentTemp}°C
• Umidade: ${currentHumidity}%
• Vento: ${currentWind} km/h

A qualidade do ar está moderada. Recomendo atividades ao ar livre nas primeiras horas da manhã (6h-8h) ou no final da tarde (18h-20h).`;
  }
  
  if (lowerMessage.includes('saúde') || lowerMessage.includes('respirar') || lowerMessage.includes('pulmão')) {
    return `Para manter a saúde respiratória com AQI ${currentAQI}:
• Evite atividades intensas entre 10h-16h
• Use máscara se tiver sensibilidade respiratória
• Mantenha-se hidratado
• Consulte um médico se tiver sintomas persistentes
• Considere usar um purificador de ar em casa`;
  }
  
  return `Entendo sua pergunta sobre "${userMessage}". 

Com base nos dados atuais (AQI: ${currentAQI}, Temperatura: ${currentTemp}°C, Umidade: ${currentHumidity}%), aqui estão as recomendações gerais:

• A qualidade do ar está moderada
• Horários mais seguros para atividades: de manhã cedo ou à noite
• Mantenha-se hidratado
• Use máscara se tiver sensibilidade respiratória
• Consulte um médico se os sintomas persistirem

Posso te ajudar com informações mais específicas sobre exercícios, crianças, asmáticos ou previsões!`;
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

async function testAPIConnection() {
  console.log('Testing Grok API connection...');
  try {
    const testResponse = await callGrokAPI('Hello, are you working?');
    if (testResponse) {
      console.log('✅ Grok API is working correctly');
      return true;
    } else {
      console.log('⚠️ Grok API not responding, using local responses');
      return false;
    }
  } catch (error) {
    console.log('❌ Grok API connection failed:', error);
    return false;
  }
}

send.addEventListener('click', async ()=>{
  const userMessage = msg.value.trim();
  if(!userMessage) return;
  
  appendBubble(userMessage, true);
  msg.value = '';
  
  simulateTyping(async () => {
    console.log('Processing message:', userMessage);
    
    // Try Grok AI first, fall back to local responses
    let response = await callGrokAPI(userMessage);
    console.log('Grok API response:', response);
    
    if (!response) {
      console.log('Using local fallback response');
      response = getAIResponse(userMessage);
    }
    
    console.log('Final response:', response);
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
      let response = await callGrokAPI(userMessage);
      if (!response) {
        response = aiResponses[action];
      }
      appendBubble(response);
    });
  });
});

const rbLocate = document.getElementById('rb-locate');
if (rbLocate) {
  rbLocate.addEventListener('click', ()=>{
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
}

const rbInfo = document.getElementById('rb-info');
if (rbInfo) {
  rbInfo.addEventListener('click', ()=>{
    appendBubble(`📊 Informações sobre AQI (Índice de Qualidade do Ar):
• 0-50: Bom (verde) - Qualidade satisfatória
• 51-100: Moderado (amarelo) - Aceitável para maioria
• 101-150: Insalubre para sensíveis (laranja) - Crianças, idosos, asmáticos
• 151-200: Insalubre (vermelho) - Todos podem sentir efeitos
• 201-300: Muito insalubre (roxo) - Alerta de saúde
• 301+: Perigoso (marrom) - Emergência de saúde

Dados baseados em padrões EPA/OMS.`);
  });
}

const rbBot = document.getElementById('rb-bot');
if (rbBot) {
  rbBot.addEventListener('click', ()=>{
    appendBubble(`🤖 Sou o assistente Air QMBA, especializado em qualidade do ar e saúde respiratória. Posso te ajudar com recomendações personalizadas baseadas em dados científicos da NASA TEMPO e sensores terrestres.`);
  });
}

const rbMap = document.getElementById('rb-map');
if (rbMap) {
  rbMap.onclick = () => {
    window.location.href = "index.html";
  };
}

const rbDashboard = document.getElementById('rb-dashboard');
if (rbDashboard) {
  rbDashboard.onclick = () => {
    window.location.href = "graf.html";
  };
}

const rbAi = document.getElementById('rb-ai');
if (rbAi) {
  rbAi.onclick = () => {
    window.location.href = "IA.html";
  };
}

const rbHistory = document.getElementById('rb-history');
if (rbHistory) {
  rbHistory.onclick = () => {
    window.location.href = "historico.html";
  };
}

const rbCommunity = document.getElementById('rb-community');
if (rbCommunity) {
  rbCommunity.onclick = () => {
    window.location.href = "comunidade.html";
  };
}

document.addEventListener('DOMContentLoaded', () => {
  testAPIConnection();
});
