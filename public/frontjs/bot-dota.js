let historial = []; 

function poner(texto) {
  document.getElementById('input-usuario').value = texto;
  document.getElementById('input-usuario').focus();
}

function agregarMensaje(texto, quien) {
  const caja = document.getElementById('mensajes');
  const div  = document.createElement('div');
  div.className = quien === 'user' ? 'msg-user' : 'msg-bot';
  div.textContent = texto;
  caja.appendChild(div);
  caja.scrollTop = caja.scrollHeight;
  return div;
}

function setEstado(msg) {
  document.getElementById('estado').textContent = msg;
}

function actualizarTokens(total) {
  document.getElementById('tokens-badge').textContent = `tokens: ${total}`;
}

async function enviar() {
  const inputEl  = document.getElementById('input-usuario');
  const pregunta = inputEl.value.trim();
  if (!pregunta) return;

  agregarMensaje(pregunta, 'user');
  inputEl.value = '';

  const btn = document.getElementById('btn-enviar');
  btn.disabled = true;
  setEstado('cargando respuesta...');

  const cargando = agregarMensaje('escribiendo...', 'bot');

  try {
    // llamo al backend express, no a azure directo
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta, historial })
    });

    const data = await res.json();

    if (!res.ok) {
      cargando.textContent = 'error: ' + (data.error || 'algo salio mal');
      setEstado('algo salio mal');
      btn.disabled = false;
      return;
    }

    historial = data.nuevo_historial;

    cargando.textContent = data.respuesta;
    actualizarTokens(data.tokens_usados);
    setEstado('listo!');

  } catch (e) {
    cargando.textContent = 'no se pudo conectar con el servidor';
    setEstado('error de conexion');
  }

  btn.disabled = false;
}
