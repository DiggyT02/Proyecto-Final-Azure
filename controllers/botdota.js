require('dotenv').config();

exports.botdota2 =  async(req, res) => {
    const { pregunta, historial = [] } = req.body;

  if (!pregunta) {
    return res.status(400).json({ error: 'falta la pregunta' });
  }

  const url = `${process.env.AZURE_ENDPOINT}/openai/deployments/${process.env.AZURE_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_API_VERSION}`;

  const body = {
    messages: [
      { role: 'system', content: 'Eres el mejor asistente de Dota 2' },
      ...historial,
      { role: 'user', content: pregunta }
    ],
    max_completion_tokens: 800,
    temperature: 0.7
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_API_KEY
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('error azure:', error);
      return res.status(500).json({ error: error?.error?.message || 'error al llamar a azure' });
    }

    const data     = await response.json();
    const mensaje  = data.choices[0].message;

  
    res.json({
      respuesta:       mensaje.content,
      tokens_usados:   data.usage.total_tokens,
      nuevo_historial: [...historial, { role: 'user', content: pregunta }]
    });

  } catch (e) {
    console.error('error servidor:', e.message);
    res.status(500).json({ error: 'error interno del servidor' });
  }

}