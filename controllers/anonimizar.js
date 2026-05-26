exports.anonimizarTexto = async (req, res) => {
    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({ error: 'falta el texto a anonimizar' });
    }

    const url = `${process.env.LANGUAGE_ENDPOINT}/language/:analyze-text?api-version=2023-04-01`;

    const cuerpo = {
        kind: 'PiiEntityRecognition',
        analysisInput: {
            documents: [{
                id: '1',
                language: 'es',
                text: texto
            }]
        },
        parameters: {
            redactionPolicy: {
                policyKind: 'CharacterMask'
            }
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

        const documento = data.results.documents[0];
        res.json({
            textoAnonimizado: documento.redactedText,
            entidades:        documento.entities
        });

    } catch (e) {
        console.error('error servidor:', e.message);
        res.status(500).json({ error: 'error interno del servidor' });
    }
};
