// El historial vive en memoria del navegador; se envía completo en cada petición
// para que el modelo recuerde el contexto de la conversación
let historial = [];

function buildMensajeHTML(rol, contenido) {
    const esBot = rol === 'assistant';
    // Escapamos HTML para evitar inyecciones y convertimos saltos de línea
    const seguro = contenido
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    return `<div class="chat-msg ${esBot ? 'msg-bot' : 'msg-user'}">
        <div class="msg-bubble">${seguro}</div>
    </div>`;
}

async function enviarMensaje() {
    const inputEl = document.getElementById('chat-input');
    const mensaje = inputEl.value.trim();
    if (!mensaje) return;

    const chatBox  = document.getElementById('chat-box');
    const btn      = document.getElementById('btn-enviar');
    const estadoEl = document.getElementById('estado-chat');
    const tokensEl = document.getElementById('chat-tokens');

    chatBox.innerHTML += buildMensajeHTML('user', mensaje);
    inputEl.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
    estadoEl.textContent = 'Procesando...';

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensaje, historial })
        });

        const data = await res.json();

        if (!res.ok) {
            estadoEl.textContent = 'Error: ' + (data.error || 'algo salió mal');
            btn.disabled = false;
            btn.textContent = 'Enviar';
            return;
        }

        // Actualizamos el historial local con la respuesta del servidor
        historial = data.nuevo_historial;

        chatBox.innerHTML += buildMensajeHTML('assistant', data.respuesta);
        chatBox.scrollTop = chatBox.scrollHeight;
        tokensEl.textContent = `Tokens usados: ${data.tokens_usados}`;
        estadoEl.textContent = '';

    } catch (e) {
        estadoEl.textContent = 'No se pudo conectar con el servidor';
    }

    btn.disabled = false;
    btn.textContent = 'Enviar';
}

function limpiarChat() {
    historial = [];
    document.getElementById('chat-box').innerHTML = '';
    document.getElementById('chat-tokens').textContent = '';
    document.getElementById('estado-chat').textContent = '';
}

// Enter envía el mensaje; Shift+Enter inserta salto de línea
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensaje();
            }
        });
    }
});
