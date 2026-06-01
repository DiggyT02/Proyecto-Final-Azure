exports.analizarImagen = async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'falta la URL de la imagen' });
    }

    const endpoint = process.env.VISION_ENDPOINT.replace(/\/$/, '');
    const url      = `${endpoint}/vision/v3.2/analyze?visualFeatures=Description,Tags,Objects`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.VISION_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: imageUrl })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(500).json({ error: errorData?.message || 'error al llamar a azure vision' });
        }

        const data = await response.json();

        const caption = data.description?.captions?.[0];

        res.json({
            descripcion: caption
                ? { texto: caption.text, confianza: caption.confidence }
                : null,
            etiquetas: (data.tags ?? []).map(t => ({
                nombre:   t.name,
                confianza: t.confidence
            })),
            objetos: (data.objects ?? []).map(o => ({
                nombre: o.object,
                x:      o.rectangle.x,
                y:      o.rectangle.y,
                w:      o.rectangle.w,
                h:      o.rectangle.h
            }))
        });

    } catch (e) {
        console.error('error servidor:', e.message);
        res.status(500).json({ error: 'error interno del servidor' });
    }
};
