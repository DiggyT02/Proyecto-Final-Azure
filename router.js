const express = require("express")
const router = express.Router()

const resumen      = require("./controllers/resumen")
const anonimizar   = require("./controllers/anonimizar")
const sentimientos = require("./controllers/sentimientos")
const vision       = require("./controllers/vision")
const chat         = require("./controllers/chat")

router.post("/api/resumen",      resumen.resumirTexto);
router.post("/api/anonimizar",   anonimizar.anonimizarTexto);
router.post("/api/sentimientos", sentimientos.analizarSentimientos);
router.post("/api/vision",       vision.analizarImagen);
router.post("/api/chat",         chat.chatear);

module.exports = router;