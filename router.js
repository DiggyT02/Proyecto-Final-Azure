const express = require("express")
const router = express.Router()

const botdota2     = require("./controllers/botdota")
const resumen      = require("./controllers/resumen")
const anonimizar   = require("./controllers/anonimizar")
const sentimientos = require("./controllers/sentimientos")

router.post("/api/chat",         botdota2.botdota2);
router.post("/api/resumen",      resumen.resumirTexto);
router.post("/api/anonimizar",   anonimizar.anonimizarTexto);
router.post("/api/sentimientos", sentimientos.analizarSentimientos);

module.exports = router;