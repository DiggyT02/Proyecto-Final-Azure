// Cada función "build" construye un fragmento de HTML con responsabilidad única

function buildDescripcionHTML(descripcion) {
    if (!descripcion) return '<span style="font-size:13px; color:var(--text-secondary)">Sin descripción disponible</span>';
    const confianza = (descripcion.confianza * 100).toFixed(1);
    return `
        <p style="font-size:13.5px; margin-bottom:4px; color:var(--text-primary)">${descripcion.texto}</p>
        <small style="color:var(--text-secondary)">Confianza: ${confianza}%</small>`;
}

function buildEtiquetasHTML(etiquetas) {
    if (!etiquetas.length) return '<span style="font-size:12px; color:var(--text-secondary)">Sin etiquetas</span>';
    return etiquetas.map(e => {
        const pct = (e.confianza * 100).toFixed(1);
        // title muestra el porcentaje al hacer hover
        return `<span class="tag-pill" title="${pct}% confianza">${e.nombre} <strong>${pct}%</strong></span>`;
    }).join('');
}

function buildObjetosHTML(objetos) {
    if (!objetos.length) return '<span style="font-size:12px; color:var(--text-secondary)">No se detectaron objetos</span>';
    // x, y = posición de la esquina superior izquierda en píxeles
    // w, h  = ancho y alto del rectángulo que rodea el objeto
    return objetos.map(o => `
        <div class="obj-item">
            <strong style="font-size:13px">${o.nombre}</strong>
            <span class="obj-coords">x:${o.x} y:${o.y} &nbsp; w:${o.w} h:${o.h}</span>
        </div>`
    ).join('');
}

async function analizarImagen() {
    const urlEl    = document.getElementById('input-imagen-url');
    const imageUrl = urlEl.value.trim();
    if (!imageUrl) return;

    const btn        = document.getElementById('btn-vision');
    const estadoEl   = document.getElementById('estado-vision');
    const previstaEl = document.getElementById('preview-imagen');
    const descEl     = document.getElementById('resultado-descripcion');
    const tagsEl     = document.getElementById('resultado-etiquetas');
    const objEl      = document.getElementById('resultado-objetos');

    btn.disabled         = true;
    btn.innerHTML        = '<span class="spinner"></span> Analizando...';
    estadoEl.textContent = '';

    // Limpiamos resultados anteriores
    previstaEl.src = '';
    previstaEl.classList.add('d-none');
    descEl.innerHTML = '';
    tagsEl.innerHTML = '';
    objEl.innerHTML  = '';

    try {
        // Solo enviamos la URL; Azure descarga la imagen desde su lado
        const res = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'Error: ' + (data.error || 'algo salió mal');
            btn.disabled  = false;
            btn.textContent = 'Analizar';
            return;
        }

        // Mostramos la imagen usando la misma URL que enviamos
        previstaEl.src = imageUrl;
        previstaEl.classList.remove('d-none');

        descEl.innerHTML = buildDescripcionHTML(data.descripcion);
        tagsEl.innerHTML = buildEtiquetasHTML(data.etiquetas);
        objEl.innerHTML  = buildObjetosHTML(data.objetos);

        estadoEl.textContent = 'Análisis completado';

    } catch (e) {
        estadoEl.textContent = 'No se pudo conectar con el servidor';
    }

    btn.disabled    = false;
    btn.textContent = 'Analizar';
}
