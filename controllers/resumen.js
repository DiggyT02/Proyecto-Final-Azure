exports.resumirTexto = async (req, res) => {
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({ error: 'falta el texto a resumir' });
    }

    const url = `${process.env.LANGUAGE_ENDPOINT}/language/analyze-text/jobs?api-version=2023-04-01`;

    const cuerpoPeticion = {
        displayName: "",
        analysisInput: {
            documents: [{
                id: "1",
                language: "es",
                text: texto
            }]
        },
        tasks: [{
            kind: "ExtractiveSummarization",
            taskName: "resumen",
            parameters: { sentenceCount: 2 }
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                "Ocp-Apim-Subscription-Key": process.env.LANGUAGE_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cuerpoPeticion)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(500).json({ error: errorData?.error?.message || 'error al enviar a azure' });
        }

        const urlSeguimiento = response.headers.get('operation-location');

        let resultadoFinal = null;
        while (true) {
            const respuestaSeguimiento = await fetch(urlSeguimiento, {
                headers: { "Ocp-Apim-Subscription-Key": process.env.LANGUAGE_API_KEY }
            });
            resultadoFinal = await respuestaSeguimiento.json();

            if (resultadoFinal.status === 'succeeded') { break; }
            if (resultadoFinal.status === 'failed') {
                return res.status(500).json({ error: 'el servidor no pudo completar el proceso' });
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const tareaFinalizada = resultadoFinal.tasks.items[0];
        const frases = tareaFinalizada.results.documents[0].sentences.map(f => f.text);

        res.json({ resumen: frases });

    } catch (e) {
        console.error('error servidor:', e.message);
        res.status(500).json({ error: 'error interno del servidor' });
    }
};
