// Mapea cada categoría de Azure a una etiqueta en español y un color
const CATEGORIA_CONFIG = {
    'Person':       { label: 'Persona',      color: '#3b82f6' },
    'Organization': { label: 'Organización', color: '#8b5cf6' },
    'Location':     { label: 'Lugar',        color: '#10b981' },
    'DateTime':     { label: 'Fecha / Hora', color: '#f59e0b' },
    'Quantity':     { label: 'Cantidad',     color: '#ef4444' },
    'PhoneNumber':  { label: 'Teléfono',     color: '#ec4899' },
    'Email':        { label: 'Email',        color: '#06b6d4' },
    'Address':      { label: 'Dirección',    color: '#84cc16' },
    'Product':      { label: 'Producto',     color: '#a78bfa' },
    'URL':          { label: 'URL',          color: '#f97316' },
};

function getCatConfig(categoria) {
    // Si Azure devuelve una categoría desconocida usamos un color neutro
    return CATEGORIA_CONFIG[categoria] || { label: categoria, color: '#6b7280' };
}

function buildEntidadHTML(e) {
    const cfg = getCatConfig(e.categoria);
    const pct = (e.confianza * 100).toFixed(1);
    const sub = e.subcategoria ? ` · ${e.subcategoria}` : '';
    return `
        <div class="entity-item">
            <div class="entity-main">
                <strong class="entity-text">${e.texto}</strong>
                <span class="entity-cat-pill" style="background:${cfg.color}18; color:${cfg.color}">
                    ${cfg.label}${sub}
                </span>
            </div>
            <span class="entity-score">${pct}%</span>
        </div>`;
}

async function extraerEntidades() {
    const textoEl     = document.getElementById('texto-entidades');
    const categoriaEl = document.getElementById('filtro-categoria');
    const texto       = textoEl.value.trim();
    if (!texto) return;

    const btn         = document.getElementById('btn-entidades');
    const estadoEl    = document.getElementById('estado-entidades');
    const resultadoEl = document.getElementById('resultado-entidades');
    const categoria   = categoriaEl.value;

    btn.disabled          = true;
    btn.innerHTML         = '<span class="spinner"></span> Extrayendo...';
    estadoEl.textContent  = '';
    resultadoEl.innerHTML = '';

    try {
        const res = await fetch('/api/entidades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto, categoria })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'Error: ' + (data.error || 'algo salió mal');
            btn.disabled  = false;
            btn.textContent = 'Extraer';
            return;
        }

        if (data.entidades.length === 0) {
            resultadoEl.innerHTML = `<span style="font-size:13px; color:var(--text-secondary)">
                No se encontraron entidades${categoria !== 'Todas' ? ' para esa categoría' : ''}.
            </span>`;
        } else {
            resultadoEl.innerHTML = data.entidades.map(buildEntidadHTML).join('');
        }

        estadoEl.textContent = `${data.entidades.length} entidad(es) encontrada(s)`;

    } catch (e) {
        estadoEl.textContent = 'No se pudo conectar con el servidor';
    }

    btn.disabled    = false;
    btn.textContent = 'Extraer';
}
