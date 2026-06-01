const SENTIMIENTO_CONFIG = {
    positive: { label: 'Positivo', badge: 'bg-success'   },
    negative: { label: 'Negativo', badge: 'bg-danger'    },
    neutral:  { label: 'Neutral',  badge: 'bg-secondary' },
    mixed:    { label: 'Mixto',    badge: 'bg-warning'   }
};

let contadorFilas = 1;

function agregarTexto() {
    if (contadorFilas >= 5) return;
    contadorFilas++;

    const div = document.createElement('div');
    div.className = 'd-flex gap-2 mb-2';
    div.id        = `fila-${contadorFilas}`;
    div.innerHTML = `
        <textarea class="form-control texto-sentimiento" rows="2"
            placeholder="Texto ${contadorFilas}..."></textarea>
        <button class="btn btn-outline-danger btn-sm align-self-start"
            onclick="eliminarTexto(${contadorFilas})">✕</button>
    `;
    document.getElementById('contenedor-textos').appendChild(div);
}

function eliminarTexto(id) {
    document.getElementById(`fila-${id}`)?.remove();
}

function buildResultadoHTML(r) {
    const config = SENTIMIENTO_CONFIG[r.sentimiento] || SENTIMIENTO_CONFIG.neutral;
    const p      = r.puntuaciones;
    return `
        <div class="card mb-2 border-0 shadow-sm">
          <div class="card-body py-2 px-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-muted fw-semibold">Documento #${r.id}</small>
              <span class="badge ${config.badge}">${config.label}</span>
            </div>
            <p class="mb-2" style="font-size:13px; color:#444">${r.texto}</p>
            <div class="d-flex gap-3" style="font-size:12px">
              <span class="text-success">▲ Positivo: ${(p.positivo * 100).toFixed(1)}%</span>
              <span class="text-danger">▼ Negativo: ${(p.negativo * 100).toFixed(1)}%</span>
              <span class="text-secondary">● Neutral: ${(p.neutral * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>`;
}

async function analizarSentimientos() {
    const areas  = document.querySelectorAll('.texto-sentimiento');
    const textos = [...areas].map(a => a.value.trim()).filter(t => t);
    if (textos.length === 0) return;

    const btn         = document.getElementById('btn-analizar');
    const estadoEl    = document.getElementById('estado-sentimientos');
    const resultadoEl = document.getElementById('resultado-sentimientos');

    btn.disabled          = true;
    estadoEl.textContent  = 'analizando...';
    resultadoEl.innerHTML = '';

    try {
        const res = await fetch('/api/sentimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textos })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'error: ' + (data.error || 'algo salio mal');
            btn.disabled = false;
            return;
        }

        resultadoEl.innerHTML = data.resultados.map(buildResultadoHTML).join('');
        estadoEl.textContent  = `${data.resultados.length} documento(s) analizados`;

    } catch (e) {
        estadoEl.textContent = 'no se pudo conectar con el servidor';
    }

    btn.disabled = false;
}
