require('dotenv').config();

exports.chatear = async (req, res) => {
    const { mensaje, historial = [] } = req.body;

    if (!mensaje?.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const endpoint   = process.env.AZURE_ENDPOINT?.replace(/\/$/, '');
    const deployment = process.env.AZURE_DEPLOYMENT;
    const apiKey     = process.env.LANGUAGE_API_KEY;
    const apiVersion = process.env.AZURE_API_VERSION;

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    // El array de mensajes incluye: instrucción del sistema + historial previo + mensaje actual
    const messages = [
        { role: 'system', content: 'Eres un asistente útil' },
        ...historial,
        { role: 'user', content: mensaje }
    ];

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // Azure OpenAI usa "api-key", distinto de los servicios de Language que usan "Ocp-Apim-Subscription-Key"
                'api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(500).json({ error: errorData?.error?.message || 'Error en Azure OpenAI' });
        }

        const data       = await response.json();
        const respuesta  = data.choices[0].message.content;
        const tokens_usados = data.usage?.total_tokens || 0;

        // Devolvemos el historial completo para que el frontend lo guarde y lo mande en el próximo turno
        const nuevo_historial = [
            ...historial,
            { role: 'user',      content: mensaje   },
            { role: 'assistant', content: respuesta }
        ];

        res.json({ respuesta, tokens_usados, nuevo_historial });

    } catch (e) {
        console.error('error servidor:', e.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
