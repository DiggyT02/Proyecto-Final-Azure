async function resumir() {
    const textoEl   = document.getElementById('texto-largo');
    const texto     = textoEl.value.trim();
    if (!texto) return;

    const btn       = document.getElementById('btn-resumir');
    const resultado = document.getElementById('resultado-resumen');
    const estado    = document.getElementById('estado-resumen');

    btn.disabled         = true;
    estado.textContent   = 'procesando...';
    resultado.innerHTML  = '';

    try {
        const res = await fetch('/api/resumen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto })
        });

        const data = await res.json();

        if (!res.ok) {
            estado.textContent = 'error: ' + (data.error || 'algo salio mal');
            btn.disabled = false;
            return;
        }

        resultado.innerHTML = data.resumen
            .map((f, i) => `<p class="mb-1"><strong>${i + 1}.</strong> ${f}</p>`)
            .join('');
        estado.textContent = 'resumen listo!';

    } catch (e) {
        estado.textContent = 'no se pudo conectar con el servidor';
    }

    btn.disabled = false;
}
