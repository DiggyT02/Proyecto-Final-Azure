async function anonimizar() {
    const textoEl = document.getElementById('texto-pii');
    const texto   = textoEl.value.trim();
    if (!texto) return;

    const btn         = document.getElementById('btn-anonimizar');
    const estadoEl    = document.getElementById('estado-anonimizar');
    const resultadoEl = document.getElementById('resultado-anonimizado');
    const entidadesEl = document.getElementById('lista-entidades');

    btn.disabled             = true;
    btn.innerHTML            = '<span class="spinner"></span> Procesando...';
    estadoEl.textContent     = '';
    resultadoEl.textContent  = '';
    entidadesEl.innerHTML    = '';

    try {
        // La petición va al backend Express; la API key nunca sale del servidor
        const res = await fetch('/api/anonimizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'Error: ' + (data.error || 'algo salió mal');
            btn.disabled  = false;
            btn.textContent = 'Anonimizar';
            return;
        }

        // data.textoAnonimizado: texto con los datos sensibles reemplazados por ***
        resultadoEl.textContent = data.textoAnonimizado;

        // data.entidades: lo que Azure detectó como sensible (nombre, email, DNI, etc.)
        if (data.entidades?.length > 0) {
            entidadesEl.innerHTML = data.entidades.map(e =>
                `<span class="tag-pill">${e.category}: <strong>${e.text}</strong></span>`
            ).join('');
        } else {
            entidadesEl.innerHTML = `<span style="font-size:12px; color:var(--text-secondary)">
                No se detectaron entidades sensibles
            </span>`;
        }

        estadoEl.textContent = 'Completado';

    } catch (e) {
        estadoEl.textContent = 'No se pudo conectar con el servidor';
    }

    btn.disabled    = false;
    btn.textContent = 'Anonimizar';
}
