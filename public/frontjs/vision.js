function buildDescripcionHTML(descripcion) {
    if (!descripcion) return '<p class="text-muted mb-0" style="font-size:13px">sin descripción disponible</p>';
    const confianza = (descripcion.confianza * 100).toFixed(1);
    return `
        <p class="mb-1" style="font-size:14px">${descripcion.texto}</p>
        <small class="text-muted">Confianza: ${confianza}%</small>`;
}

function buildEtiquetasHTML(etiquetas) {
    if (!etiquetas.length) return '<span class="text-muted" style="font-size:13px">sin etiquetas</span>';
    return etiquetas.map(e => {
        const pct = (e.confianza * 100).toFixed(1);
        return `<span class="badge bg-secondary me-1 mb-1" title="${pct}% confianza">${e.nombre} ${pct}%</span>`;
    }).join('');
}

function buildObjetosHTML(objetos) {
    if (!objetos.length) return '<p class="text-muted mb-0" style="font-size:13px">no se detectaron objetos</p>';
    return objetos.map(o =>
        `<li class="list-group-item py-1 px-2" style="font-size:13px">
            <strong>${o.nombre}</strong>
            <span class="text-muted ms-2">x:${o.x} y:${o.y} w:${o.w} h:${o.h}</span>
        </li>`
    ).join('');
}

async function analizarImagen() {
    const urlEl       = document.getElementById('input-imagen-url');
    const imageUrl    = urlEl.value.trim();
    if (!imageUrl) return;

    const btn         = document.getElementById('btn-vision');
    const estadoEl    = document.getElementById('estado-vision');
    const previstaEl  = document.getElementById('preview-imagen');
    const descEl      = document.getElementById('resultado-descripcion');
    const tagsEl      = document.getElementById('resultado-etiquetas');
    const objEl       = document.getElementById('resultado-objetos');

    btn.disabled         = true;
    estadoEl.textContent = 'analizando imagen...';
    previstaEl.src       = '';
    previstaEl.classList.add('d-none');
    descEl.innerHTML     = '';
    tagsEl.innerHTML     = '';
    objEl.innerHTML      = '';

    try {
        const res = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'error: ' + (data.error || 'algo salio mal');
            btn.disabled = false;
            return;
        }

        previstaEl.src = imageUrl;
        previstaEl.classList.remove('d-none');

        descEl.innerHTML = buildDescripcionHTML(data.descripcion);
        tagsEl.innerHTML = buildEtiquetasHTML(data.etiquetas);
        objEl.innerHTML  = buildObjetosHTML(data.objetos);

        estadoEl.textContent = 'análisis completado';

    } catch (e) {
        estadoEl.textContent = 'no se pudo conectar con el servidor';
    }

    btn.disabled = false;
}
