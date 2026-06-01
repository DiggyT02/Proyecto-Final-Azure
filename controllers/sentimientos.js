exports.analizarSentimientos = async (req, res) => {
    const { textos } = req.body;

    if (!textos || !Array.isArray(textos) || textos.length === 0) {
        return res.status(400).json({ error: 'falta el array de textos a analizar' });
    }

    const url = `${process.env.LANGUAGE_ENDPOINT}/language/:analyze-text?api-version=2023-04-01`;

    const cuerpo = {
        kind: 'SentimentAnalysis',
        analysisInput: {
            documents: textos.map((texto, i) => ({
                id:       String(i + 1),
                language: 'es',
                text:     texto
            }))
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.LANGUAGE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cuerpo)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(500).json({ error: errorData?.error?.message || 'error al llamar a azure' });
        }

        const data = await response.json();

        if (data.results.errors?.length > 0) {
            return res.status(500).json({ error: data.results.errors[0]?.error?.message || 'error en el documento' });
        }

        const resultados = data.results.documents.map((doc, i) => ({
            id:          doc.id,
            texto:       textos[i],
            sentimiento: doc.sentiment,
            puntuaciones: {
                positivo: doc.confidenceScores.positive,
                negativo: doc.confidenceScores.negative,
                neutral:  doc.confidenceScores.neutral
            }
        }));

        res.json({ resultados });

    } catch (e) {
        console.error('error servidor:', e.message);
        res.status(500).json({ error: 'error interno del servidor' });
    }
};
