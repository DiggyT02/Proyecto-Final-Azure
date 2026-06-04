require('dotenv').config();

exports.extraerEntidades = async (req, res) => {
    const { texto, categoria } = req.body;

    if (!texto?.trim()) {
        return res.status(400).json({ error: 'El texto no puede estar vacío' });
    }

    const endpoint = process.env.LANGUAGE_ENDPOINT?.replace(/\/$/, '');
    const apiKey   = process.env.LANGUAGE_API_KEY;
    const url      = `${endpoint}/language/:analyze-text?api-version=2023-04-01`;

    const cuerpo = {
        kind: 'EntityRecognition',
        analysisInput: {
            documents: [{
                id: '1',
                language: 'es',
                text: texto
            }]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuerpo)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(500).json({ error: errorData?.error?.message || 'Error en Azure Language' });
        }

        const data = await response.json();

        let entidades = data.results.documents[0].entities.map(e => ({
            texto:       e.text,
            categoria:   e.category,
            subcategoria: e.subcategory || null,
            confianza:   e.confidenceScore
        }));

        // Si el cliente pide una categoría específica, filtramos antes de responder
        if (categoria && categoria !== 'Todas') {
            entidades = entidades.filter(e => e.categoria === categoria);
        }

        res.json({ entidades });

    } catch (e) {
        console.error('error servidor:', e.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
