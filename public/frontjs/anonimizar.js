async function anonimizar() {
    const textoEl   = document.getElementById('texto-pii');
    const texto     = textoEl.value.trim();
    if (!texto) return;

    const btn             = document.getElementById('btn-anonimizar');
    const estadoEl        = document.getElementById('estado-anonimizar');
    const resultadoEl     = document.getElementById('resultado-anonimizado');
    const entidadesEl     = document.getElementById('lista-entidades');

    btn.disabled          = true;
    estadoEl.textContent  = 'procesando...';
    resultadoEl.textContent = '';
    entidadesEl.innerHTML = '';

    try {
        const res = await fetch('/api/anonimizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'error: ' + (data.error || 'algo salio mal');
            btn.disabled = false;
            return;
        }

        resultadoEl.textContent = data.textoAnonimizado;

        if (data.entidades?.length > 0) {
            entidadesEl.innerHTML = data.entidades.map(e =>
                `<span class="badge bg-secondary me-1 mb-1">${e.category}: <strong>${e.text}</strong></span>`
            ).join('');
        } else {
            entidadesEl.innerHTML = '<span class="text-muted" style="font-size:13px">no se detectaron entidades sensibles</span>';
        }

        estadoEl.textContent = 'listo!';

    } catch (e) {
        estadoEl.textContent = 'no se pudo conectar con el servidor';
    }

    btn.disabled = false;
}
