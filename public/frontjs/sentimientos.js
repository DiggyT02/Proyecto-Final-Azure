// Lookup table: mapea el valor de Azure al texto y clase CSS del pill
const SENTIMIENTO_CONFIG = {
    positive: { label: 'Positivo', cls: 'positive' },
    negative: { label: 'Negativo', cls: 'negative' },
    neutral:  { label: 'Neutral',  cls: 'neutral'  },
    mixed:    { label: 'Mixto',    cls: 'mixed'    }
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
        <button class="btn-remove-row" onclick="eliminarTexto(${contadorFilas})">✕</button>
    `;
    document.getElementById('contenedor-textos').appendChild(div);
}

function eliminarTexto(id) {
    // Optional chaining: si el elemento no existe, no lanza error
    document.getElementById(`fila-${id}`)?.remove();
}

function buildResultadoHTML(r) {
    const config = SENTIMIENTO_CONFIG[r.sentimiento] || SENTIMIENTO_CONFIG.neutral;
    const p      = r.puntuaciones;
    return `
        <div class="sent-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <small style="font-size:11px; font-weight:600; color:var(--text-secondary)">
              Documento #${r.id}
            </small>
            <span class="sent-pill ${config.cls}">${config.label}</span>
          </div>
          <p style="font-size:13.5px; color:var(--text-primary); margin-bottom:10px; line-height:1.5">
            ${r.texto}
          </p>
          <div class="sent-scores">
            <span class="pos">▲ Positivo: ${(p.positivo * 100).toFixed(1)}%</span>
            <span class="neg">▼ Negativo: ${(p.negativo * 100).toFixed(1)}%</span>
            <span class="neu">● Neutral: ${(p.neutral * 100).toFixed(1)}%</span>
          </div>
        </div>`;
}

async function analizarSentimientos() {
    // querySelectorAll devuelve NodeList; el spread [...] lo convierte en Array
    const areas  = document.querySelectorAll('.texto-sentimiento');
    const textos = [...areas].map(a => a.value.trim()).filter(t => t); // filter elimina vacíos
    if (textos.length === 0) return;

    const btn         = document.getElementById('btn-analizar');
    const estadoEl    = document.getElementById('estado-sentimientos');
    const resultadoEl = document.getElementById('resultado-sentimientos');

    btn.disabled          = true;
    btn.innerHTML         = '<span class="spinner"></span> Analizando...';
    estadoEl.textContent  = '';
    resultadoEl.innerHTML = '';

    try {
        const res = await fetch('/api/sentimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textos })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'Error: ' + (data.error || 'algo salió mal');
            btn.disabled = false;
            btn.textContent = 'Analizar';
            return;
        }

        resultadoEl.innerHTML = data.resultados.map(buildResultadoHTML).join('');
        estadoEl.textContent  = `${data.resultados.length} documento(s) analizados`;

    } catch (e) {
        estadoEl.textContent = 'No se pudo conectar con el servidor';
    }

    btn.disabled    = false;
    btn.textContent = 'Analizar';
}
