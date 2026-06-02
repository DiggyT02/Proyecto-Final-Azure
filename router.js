const express = require("express")
const router = express.Router()


const resumen      = require("./controllers/resumen")
const anonimizar   = require("./controllers/anonimizar")
const sentimientos = require("./controllers/sentimientos")
const vision       = require("./controllers/vision")


router.post("/api/resumen",      resumen.resumirTexto);
router.post("/api/anonimizar",   anonimizar.anonimizarTexto);
router.post("/api/sentimientos", sentimientos.analizarSentimientos);
router.post("/api/vision",       vision.analizarImagen);

module.exports = router;